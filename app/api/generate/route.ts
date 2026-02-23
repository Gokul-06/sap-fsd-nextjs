export const maxDuration = 120;

import { NextResponse } from "next/server";
import { generateFSD } from "@/lib/tools/generate-fsd";
import { isAIEnabled } from "@/lib/tools/claude-ai";
import { prisma } from "@/lib/db";
import {
  getTopRatedExamples,
  buildFewShotContext,
  buildFeedbackContext,
} from "@/lib/tools/few-shot-retrieval";
import { identifyProcessArea } from "@/lib/tools/classify-module";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, projectName, author, requirements, module, language, documentDepth } = body;

    if (!title || !projectName || !author || !requirements) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, projectName, author, requirements",
        },
        { status: 400 }
      );
    }

    // Determine primary module and process area for querying feedback/few-shot
    const primaryModule = module || "MM";
    const processArea = identifyProcessArea(requirements, primaryModule);

    // Query feedback rules and few-shot examples in parallel
    const [feedbackRules, fewShotExamples] = await Promise.all([
      prisma.feedbackRule
        .findMany({
          where: {
            active: true,
            OR: [
              { module: primaryModule, processArea: processArea },
              { module: primaryModule, processArea: null },
            ],
          },
          orderBy: { appliedCount: "desc" },
          take: 10,
        })
        .catch(() => []),
      getTopRatedExamples(primaryModule, processArea, 2).catch(() => []),
    ]);

    // Build context strings
    const feedbackContext = buildFeedbackContext(feedbackRules);
    const fewShotContext = buildFewShotContext(fewShotExamples);

    const result = await generateFSD({
      title,
      projectName,
      author,
      requirements,
      module,
      language: language || "English",
      documentDepth: documentDepth || "standard",
      feedbackContext: feedbackContext || undefined,
      fewShotContext: fewShotContext || undefined,
    });

    // Increment appliedCount for used feedback rules (fire-and-forget)
    if (feedbackRules.length > 0) {
      const ruleIds = feedbackRules.map((r) => r.id);
      prisma.feedbackRule
        .updateMany({
          where: { id: { in: ruleIds } },
          data: { appliedCount: { increment: 1 } },
        })
        .catch(() => {}); // Non-critical, don't fail generation
    }

    return NextResponse.json({
      ...result,
      aiEnabled: isAIEnabled(),
      usedFeedbackRuleIds: feedbackRules.map((r) => r.id),
      usedFewShotFsdIds: fewShotExamples.map((e) => e.fsdId),
    });
  } catch (error) {
    console.error("FSD generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate FSD",
      },
      { status: 500 }
    );
  }
}
