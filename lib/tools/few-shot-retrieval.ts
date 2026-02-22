/**
 * Few-Shot Retrieval — finds top-rated FSDs to use as examples for AI generation.
 * Part of Level 3: Self-improving quality through learning from best outputs.
 */

import { prisma } from "@/lib/db";

export interface FewShotExample {
  fsdId: string;
  title: string;
  rating: number;
  processArea: string;
  executiveSummaryExcerpt: string;
  proposedSolutionExcerpt: string;
}

/**
 * Find top-rated FSDs for a given module to use as few-shot examples.
 * Prioritizes FSDs with the same process area, then falls back to any high-rated ones.
 */
export async function getTopRatedExamples(
  module: string,
  processArea: string,
  limit: number = 2
): Promise<FewShotExample[]> {
  try {
    const candidates = await prisma.fsd.findMany({
      where: {
        primaryModule: module,
        rating: { gte: 4 }, // Only 4+ star FSDs
        aiEnabled: true,     // Only AI-generated (richer content)
      },
      orderBy: [
        { rating: "desc" },
        { createdAt: "desc" },
      ],
      take: limit * 3, // Fetch extra for prioritization
      select: {
        id: true,
        title: true,
        rating: true,
        processArea: true,
        markdown: true,
      },
    });

    if (candidates.length === 0) return [];

    // Prioritize: same processArea first, then any high-rated
    const sameArea = candidates.filter((c) => c.processArea === processArea);
    const otherArea = candidates.filter((c) => c.processArea !== processArea);
    const selected = [...sameArea, ...otherArea].slice(0, limit);

    return selected.map((fsd) => ({
      fsdId: fsd.id,
      title: fsd.title,
      rating: fsd.rating!,
      processArea: fsd.processArea,
      executiveSummaryExcerpt: extractSection(fsd.markdown, "Executive Summary", 500),
      proposedSolutionExcerpt: extractSection(fsd.markdown, "Proposed Solution", 800),
    }));
  } catch (error) {
    console.error("Few-shot retrieval failed:", error);
    return [];
  }
}

/**
 * Extract a section from FSD markdown content.
 * Looks for "## N. Section Title" pattern and extracts content up to the next section.
 */
function extractSection(
  markdown: string,
  sectionTitle: string,
  maxChars: number
): string {
  // Match "## 2. Executive Summary" or "## Executive Summary" etc.
  const pattern = new RegExp(
    `##\\s*\\d*\\.?\\s*${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "i"
  );
  const startMatch = markdown.match(pattern);
  if (!startMatch || startMatch.index === undefined) return "";

  const startIdx = startMatch.index + startMatch[0].length;
  // Find the next ## section header
  const nextSection = markdown.indexOf("\n## ", startIdx);
  const endIdx = nextSection === -1 ? markdown.length : nextSection;

  const content = markdown.slice(startIdx, endIdx).trim();
  if (content.length <= maxChars) return content;
  return content.slice(0, maxChars) + "...";
}

/**
 * Build the few-shot context string for AI prompts.
 */
export function buildFewShotContext(examples: FewShotExample[]): string {
  if (examples.length === 0) return "";

  const parts = examples.map(
    (ex, i) =>
      `--- Example ${i + 1} (${ex.rating}★, "${ex.title}") ---\n` +
      `Executive Summary:\n${ex.executiveSummaryExcerpt}\n\n` +
      `Proposed Solution:\n${ex.proposedSolutionExcerpt}`
  );

  return (
    "\n\nREFERENCE EXAMPLES — Here are highly-rated FSD examples for this module. " +
    "Use them as quality benchmarks for tone, depth, and structure:\n\n" +
    parts.join("\n\n")
  );
}

/**
 * Build the feedback rules context string for AI prompts.
 */
export function buildFeedbackContext(
  rules: Array<{ ruleType: string; content: string }>
): string {
  if (rules.length === 0) return "";

  const ruleLines = rules
    .map((r, i) => `${i + 1}. [${r.ruleType}] ${r.content}`)
    .join("\n");

  return (
    "\n\nIMPORTANT — Apply these improvement rules based on past user feedback:\n" +
    ruleLines
  );
}
