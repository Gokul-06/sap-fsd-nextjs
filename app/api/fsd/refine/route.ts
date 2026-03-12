export const maxDuration = 60;

import { NextResponse } from "next/server";
import { callClaude, isAIEnabled } from "@/lib/tools/claude-ai";
import { safeErrorResponse } from "@/lib/api-error";
import { refineSchema, validateBody } from "@/lib/validations";
import { learnFromRefinement } from "@/lib/services/agent-memory";

/**
 * Helper: Extract a specific section from markdown by its heading.
 * Returns the section content and the start/end indices for replacement.
 */
function extractSection(
  markdown: string,
  sectionTitle: string
): { content: string; startIdx: number; endIdx: number } | null {
  // Match both ## and ### section headings
  // Look for "## N. Title" or "## Title" patterns
  const escapedTitle = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`^(## \\d+\\.\\s*${escapedTitle})`, "im"),
    new RegExp(`^(## ${escapedTitle})`, "im"),
  ];

  let match: RegExpExecArray | null = null;
  for (const pattern of patterns) {
    match = pattern.exec(markdown);
    if (match) break;
  }

  if (!match) return null;

  const startIdx = match.index;

  // Find the next ## heading (same level or higher) to determine section end
  const afterHeading = markdown.slice(startIdx + match[1].length);
  const nextSectionMatch = afterHeading.match(/\n## \d+\./);
  const endIdx = nextSectionMatch
    ? startIdx + match[1].length + (nextSectionMatch.index ?? afterHeading.length)
    : markdown.length;

  const content = markdown.slice(startIdx, endIdx).trim();
  return { content, startIdx, endIdx };
}

/**
 * POST /api/fsd/refine — Smart FSD refinement endpoint.
 * Supports both full-document and section-level editing.
 *
 * When `targetSection` is provided, only that section is sent to AI
 * for editing, making refinement faster and more accurate.
 */
export async function POST(request: Request) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not enabled. Set ANTHROPIC_API_KEY to use refinement." },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Zod validation
    const validated = validateBody(refineSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { markdown, instruction, module, targetSection } = validated.data;

    // Learn from refinement instruction (fire-and-forget — non-blocking)
    learnFromRefinement({
      instruction,
      module: module || undefined,
    }).catch(() => {});

    // ── Section-level editing mode ──
    if (targetSection) {
      const section = extractSection(markdown, targetSection);
      if (!section) {
        return NextResponse.json(
          { error: `Could not find section "${targetSection}" in the document.` },
          { status: 400 }
        );
      }

      const sectionPrompt = `You are an SAP FSD document editor. You are editing ONLY the section "${targetSection}" of a Functional Specification Document.

CRITICAL RULES:
- Apply the user's instruction ONLY to this section
- Return the COMPLETE updated section (including the heading)
- Preserve all markdown formatting (tables, headers, bullets, code blocks)
- Do NOT add content from other sections
- Maintain the same section heading exactly as it appears
- If adding new subsections, use the appropriate heading level (###)
- Preserve all existing subsection structure unless the instruction says to change it

USER INSTRUCTION: ${instruction}

CURRENT SECTION CONTENT:
${section.content}

Return ONLY the updated section content. No explanation, no markdown fences wrapping the response.`;

      const updatedSection = await callClaude(sectionPrompt, 4096);

      if (!updatedSection?.trim()) {
        return NextResponse.json(
          { error: "AI returned empty response. Please try again." },
          { status: 500 }
        );
      }

      // Replace the section in the full document
      const updatedMarkdown =
        markdown.slice(0, section.startIdx) +
        updatedSection.trim() +
        markdown.slice(section.endIdx);

      return NextResponse.json({
        markdown: updatedMarkdown,
        editedSection: targetSection,
      });
    }

    // ── Full-document refinement mode (original behavior) ──
    // Step 1: Ask Claude for specific replacements (fast, small output)
    const prompt = `You are an SAP FSD document editor. Given the user's instruction and the current document, identify the EXACT text changes needed.

Return a valid JSON array of replacements. Each replacement has:
- "find": the EXACT text string to find in the document (must match character-for-character)
- "replace": the new text to replace it with

CRITICAL RULES:
- The "find" value MUST be an exact substring that exists in the document
- Keep replacements minimal — only change what the user asked for
- For heading/title changes, include the surrounding markdown (e.g. "# Old Title" → "# New Title")
- Return ONLY the JSON array, no explanation, no markdown fences
- If adding new content, use "find" to locate where to insert and include surrounding context in both find and replace

USER INSTRUCTION: ${instruction}

DOCUMENT (first 4000 chars):
${markdown.slice(0, 4000)}

Return ONLY a JSON array like: [{"find":"old text","replace":"new text"}]`;

    const aiResponse = await callClaude(prompt, 1024);

    if (!aiResponse || !aiResponse.trim()) {
      return NextResponse.json(
        { error: "AI returned empty response. Please try again." },
        { status: 500 }
      );
    }

    // Step 2: Parse the replacements
    let replacements: Array<{ find: string; replace: string }>;
    try {
      // Clean up response — remove markdown code fences if present
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      replacements = JSON.parse(cleaned);

      if (!Array.isArray(replacements) || replacements.length === 0) {
        throw new Error("No replacements found");
      }
    } catch {
      // Fallback: if JSON parse fails, try the full-document approach with smaller output
      console.warn("JSON parse failed, falling back to direct edit. AI response:", aiResponse);

      const fallbackPrompt = `You are an SAP FSD editor. Apply this change to the document header area and return ONLY the updated first 20 lines of the document (nothing else).

Instruction: ${instruction}

Current document start:
${markdown.slice(0, 1500)}

Return ONLY the updated text for these lines, no explanation.`;

      const fallbackResponse = await callClaude(fallbackPrompt, 1024);
      if (fallbackResponse && fallbackResponse.trim()) {
        // Replace the header portion
        const originalLines = markdown.split("\n");
        const newLines = fallbackResponse.trim().split("\n");
        // Replace up to the first 20 lines
        const mergedLines = [...newLines, ...originalLines.slice(newLines.length)];
        return NextResponse.json({ markdown: mergedLines.join("\n") });
      }

      return NextResponse.json(
        { error: "Could not parse AI response. Try a more specific instruction." },
        { status: 500 }
      );
    }

    // Step 3: Apply replacements to the markdown
    let updatedMarkdown = markdown;
    let appliedCount = 0;

    for (const { find, replace } of replacements) {
      if (!find || typeof find !== "string") continue;

      if (updatedMarkdown.includes(find)) {
        updatedMarkdown = updatedMarkdown.replace(find, replace || "");
        appliedCount++;
      } else {
        // Try case-insensitive match
        const idx = updatedMarkdown.toLowerCase().indexOf(find.toLowerCase());
        if (idx !== -1) {
          updatedMarkdown =
            updatedMarkdown.slice(0, idx) +
            (replace || "") +
            updatedMarkdown.slice(idx + find.length);
          appliedCount++;
        }
      }
    }

    if (appliedCount === 0) {
      // None of the replacements matched — try a broader approach
      // Ask Claude to return just the modified section
      const retryPrompt = `You are an SAP FSD editor. The user wants: "${instruction}"

Here is the beginning of the document:
${markdown.slice(0, 2000)}

Apply the requested changes and return ONLY the modified portion of the document (the first ~30 lines). No explanation.`;

      const retryResponse = await callClaude(retryPrompt, 1024);
      if (retryResponse && retryResponse.trim()) {
        const originalLines = markdown.split("\n");
        const newLines = retryResponse.trim().split("\n");
        const mergedLines = [...newLines, ...originalLines.slice(Math.min(newLines.length, 30))];
        return NextResponse.json({ markdown: mergedLines.join("\n") });
      }

      return NextResponse.json(
        { error: "Could not apply changes. Try rephrasing your instruction." },
        { status: 500 }
      );
    }

    return NextResponse.json({ markdown: updatedMarkdown });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "FSD refinement") },
      { status: 500 }
    );
  }
}
