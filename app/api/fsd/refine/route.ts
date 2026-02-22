export const maxDuration = 60;

import { NextResponse } from "next/server";
import { callClaude, isAIEnabled } from "@/lib/tools/claude-ai";

/**
 * Smart FSD refinement endpoint.
 * Instead of regenerating the entire document (slow, timeout-prone),
 * we ask Claude to return ONLY the specific text replacements needed,
 * then apply them server-side. This is 10x faster.
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
    const { markdown, instruction } = body;

    if (!markdown || !instruction) {
      return NextResponse.json(
        { error: "Missing required fields: markdown, instruction" },
        { status: 400 }
      );
    }

    if (instruction.trim().length < 3) {
      return NextResponse.json(
        { error: "Instruction too short. Please provide more detail." },
        { status: 400 }
      );
    }

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
    console.error("FSD refinement failed:", error);
    const message = error instanceof Error ? error.message : "Failed to refine FSD";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
