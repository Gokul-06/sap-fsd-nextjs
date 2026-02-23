export const maxDuration = 300;

import { NextResponse } from "next/server";
import { generateFSD } from "@/lib/tools/generate-fsd";
import { orchestrateAgentTeam } from "@/lib/tools/agent-team";
import { isAIEnabled } from "@/lib/tools/claude-ai";
import { prisma } from "@/lib/db";
import {
  getTopRatedExamples,
  buildFewShotContext,
  buildFeedbackContext,
} from "@/lib/tools/few-shot-retrieval";
import { identifyProcessArea } from "@/lib/tools/classify-module";
import type { AgentProgressEvent } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationMode } = body;

    if (generationMode === "agent-team") {
      return handleAgentTeamGeneration(body);
    }

    return handleStandardGeneration(body);
  } catch (error) {
    console.error("FSD generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate FSD",
      },
      { status: 500 },
    );
  }
}

// ─── Standard Generation (unchanged) ───

async function handleStandardGeneration(body: Record<string, unknown>) {
  const { title, projectName, author, requirements, module, language, documentDepth } = body as {
    title: string;
    projectName: string;
    author: string;
    requirements: string;
    module?: string;
    language?: string;
    documentDepth?: string;
  };

  if (!title || !projectName || !author || !requirements) {
    return NextResponse.json(
      { error: "Missing required fields: title, projectName, author, requirements" },
      { status: 400 },
    );
  }

  const primaryModule = (module as string) || "MM";
  const processArea = identifyProcessArea(requirements as string, primaryModule);

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

  const feedbackContext = buildFeedbackContext(feedbackRules);
  const fewShotContext = buildFewShotContext(fewShotExamples);

  const result = await generateFSD({
    title: title as string,
    projectName: projectName as string,
    author: author as string,
    requirements: requirements as string,
    module: module as string | undefined,
    language: (language as string) || "English",
    documentDepth: (documentDepth as "standard" | "comprehensive") || "standard",
    feedbackContext: feedbackContext || undefined,
    fewShotContext: fewShotContext || undefined,
  });

  // Increment appliedCount (fire-and-forget)
  if (feedbackRules.length > 0) {
    const ruleIds = feedbackRules.map((r) => r.id);
    prisma.feedbackRule
      .updateMany({
        where: { id: { in: ruleIds } },
        data: { appliedCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  return NextResponse.json({
    ...result,
    aiEnabled: isAIEnabled(),
    usedFeedbackRuleIds: feedbackRules.map((r) => r.id),
    usedFewShotFsdIds: fewShotExamples.map((e) => e.fsdId),
  });
}

// ─── Agent Teams Generation (SSE streaming) ───

async function handleAgentTeamGeneration(body: Record<string, unknown>) {
  const { title, projectName, author, requirements, module, language, documentDepth } = body as {
    title: string;
    projectName: string;
    author: string;
    requirements: string;
    module?: string;
    language?: string;
    documentDepth?: string;
  };

  if (!title || !projectName || !author || !requirements) {
    return NextResponse.json(
      { error: "Missing required fields: title, projectName, author, requirements" },
      { status: 400 },
    );
  }

  const primaryModule = (module as string) || "MM";
  const processArea = identifyProcessArea(requirements as string, primaryModule);

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

  const feedbackContext = buildFeedbackContext(feedbackRules);
  const fewShotContext = buildFewShotContext(fewShotExamples);

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: AgentProgressEvent) {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      try {
        const result = await orchestrateAgentTeam(
          {
            title: title as string,
            projectName: projectName as string,
            author: author as string,
            requirements: requirements as string,
            module: module as string | undefined,
            language: (language as string) || "English",
            documentDepth: (documentDepth as "standard" | "comprehensive") || "standard",
            feedbackContext: feedbackContext || undefined,
            fewShotContext: fewShotContext || undefined,
          },
          sendEvent,
        );

        // Send final complete event with the full result
        sendEvent({
          phase: "complete",
          status: "completed",
          result: {
            ...result,
            aiEnabled: isAIEnabled(),
          },
        });
      } catch (error) {
        sendEvent({
          phase: "error",
          status: "failed",
          error: error instanceof Error ? error.message : "Agent team generation failed",
        });
      } finally {
        // Increment feedback counts (fire-and-forget)
        if (feedbackRules.length > 0) {
          const ruleIds = feedbackRules.map((r) => r.id);
          prisma.feedbackRule
            .updateMany({
              where: { id: { in: ruleIds } },
              data: { appliedCount: { increment: 1 } },
            })
            .catch(() => {});
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
