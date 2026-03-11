// Agent Team + Comprehensive needs ~360s worst-case.
export const maxDuration = 600;

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
import { logAudit } from "@/lib/audit";
import { generateFsdSchema, validateBody } from "@/lib/validations";
import type { AgentProgressEvent } from "@/lib/types";
import {
  createThread,
  addMessage,
  addMessages,
  linkThreadToFsd,
  summarizeThread,
  recallMemories,
  buildMemoryContext,
  getPastThreadSummaries,
  buildCrossSessionContext,
} from "@/lib/services/agent-memory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { generationMode } = body;

    // Zod validation (applies to both modes)
    const validated = validateBody(generateFsdSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    logAudit("GENERATE_FSD", "Fsd", undefined, request, `Mode: ${generationMode || "standard"}, Title: ${body.title}`);

    if (generationMode === "agent-team") {
      return handleAgentTeamGeneration(body);
    }

    return handleStandardGeneration(body);
  } catch (error) {
    console.error("FSD generation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to generate FSD";
    // Strip internal file paths for safety but keep useful error info
    const safeMessage = message.replace(/\/[^\s]+\//g, "").substring(0, 200);
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}

// ─── Standard Generation (unchanged) ───

async function handleStandardGeneration(body: Record<string, unknown>) {
  const { title, projectName, author, requirements, module, language, documentDepth, fsdType, selectedSections } = body as {
    title: string;
    projectName: string;
    author: string;
    requirements: string;
    module?: string;
    language?: string;
    documentDepth?: string;
    fsdType?: string;
    selectedSections?: string[];
  };

  if (!title || !projectName || !author || !requirements) {
    return NextResponse.json(
      { error: "Missing required fields: title, projectName, author, requirements" },
      { status: 400 },
    );
  }

  const primaryModule = (module as string) || "MM";
  const processArea = identifyProcessArea(requirements as string, primaryModule);

  // Fetch feedback rules, few-shot examples, and agent memories in parallel
  const [feedbackRules, fewShotExamples, memories, pastSummaries] = await Promise.all([
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
    recallMemories({
      module: primaryModule,
      processArea,
      projectName: projectName as string,
      limit: 10,
    }).catch(() => []),
    getPastThreadSummaries({
      projectName: projectName as string,
      module: primaryModule,
      limit: 3,
    }).catch(() => []),
  ]);

  const feedbackContext = buildFeedbackContext(feedbackRules);
  const fewShotContext = buildFewShotContext(fewShotExamples);
  const memoryContext = buildMemoryContext(memories);
  const crossSessionContext = buildCrossSessionContext(pastSummaries);

  // Create conversation thread for this generation (fire-and-forget for speed)
  const sessionId = `std-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const threadPromise = createThread({
    sessionId,
    projectName: projectName as string,
    module: primaryModule,
    processArea,
    threadType: "generation",
  }).catch(() => null);

  const result = await generateFSD({
    title: title as string,
    projectName: projectName as string,
    author: author as string,
    requirements: requirements as string,
    module: module as string | undefined,
    language: (language as string) || "English",
    documentDepth: (documentDepth as "standard" | "comprehensive") || "standard",
    fsdType: ((fsdType as string) || "standard") as import("@/lib/types").FsdType,
    feedbackContext: [feedbackContext, memoryContext, crossSessionContext].filter(Boolean).join("") || undefined,
    fewShotContext: fewShotContext || undefined,
    selectedSections,
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

  // Store conversation in thread (fire-and-forget)
  threadPromise.then(async (threadId) => {
    if (!threadId) return;
    await addMessages(threadId, [
      { role: "user", content: `Generate FSD: ${title}\nModule: ${primaryModule}\nRequirements: ${(requirements as string).slice(0, 1000)}` },
      { role: "assistant", content: `Generated FSD with ${result.warnings.length} warnings. Module: ${result.primaryModule}, Process Area: ${result.processArea}` },
    ]);
    // Summarize the thread for future cross-session context
    summarizeThread(threadId).catch(() => {});
  }).catch(() => {});

  return NextResponse.json({
    ...result,
    aiEnabled: isAIEnabled(),
    usedFeedbackRuleIds: feedbackRules.map((r) => r.id),
    usedFewShotFsdIds: fewShotExamples.map((e) => e.fsdId),
    memoryUsed: memories.length,
  });
}

// ─── Agent Teams Generation (SSE streaming) ───

async function handleAgentTeamGeneration(body: Record<string, unknown>) {
  const { title, projectName, author, requirements, module, language, documentDepth, fsdType, selectedSections } = body as {
    title: string;
    projectName: string;
    author: string;
    requirements: string;
    module?: string;
    language?: string;
    documentDepth?: string;
    fsdType?: string;
    selectedSections?: string[];
  };

  if (!title || !projectName || !author || !requirements) {
    return NextResponse.json(
      { error: "Missing required fields: title, projectName, author, requirements" },
      { status: 400 },
    );
  }

  const primaryModule = (module as string) || "MM";
  const processArea = identifyProcessArea(requirements as string, primaryModule);

  // Fetch feedback rules, few-shot examples, and agent memories in parallel
  const [feedbackRules, fewShotExamples, memories, pastSummaries] = await Promise.all([
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
    recallMemories({
      module: primaryModule,
      processArea,
      projectName: projectName as string,
      limit: 10,
    }).catch(() => []),
    getPastThreadSummaries({
      projectName: projectName as string,
      module: primaryModule,
      limit: 3,
    }).catch(() => []),
  ]);

  const feedbackContext = buildFeedbackContext(feedbackRules);
  const fewShotContext = buildFewShotContext(fewShotExamples);
  const memoryContext = buildMemoryContext(memories);
  const crossSessionContext = buildCrossSessionContext(pastSummaries);

  // Create conversation thread
  const sessionId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let threadId: string | null = null;
  try {
    threadId = await createThread({
      sessionId,
      projectName: projectName as string,
      module: primaryModule,
      processArea,
      threadType: "generation",
    });
  } catch {
    // Non-critical
  }

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(event: AgentProgressEvent) {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        // Log agent progress messages to thread (fire-and-forget)
        if (threadId && event.message) {
          addMessage(threadId, {
            role: "agent",
            agentName: event.phase,
            content: event.message,
            metadata: { phase: event.phase, status: event.status },
          }).catch(() => {});
        }
      }

      try {
        console.log("[AgentTeam] Starting orchestration for:", title, "module:", primaryModule, `(${memories.length} memories loaded)`);
        const startTime = Date.now();

        // Log user input to thread
        if (threadId) {
          addMessage(threadId, {
            role: "user",
            content: `Generate FSD (Agent Team): ${title}\nModule: ${primaryModule}\nRequirements: ${(requirements as string).slice(0, 1000)}`,
          }).catch(() => {});
        }

        const result = await orchestrateAgentTeam(
          {
            title: title as string,
            projectName: projectName as string,
            author: author as string,
            requirements: requirements as string,
            module: module as string | undefined,
            language: (language as string) || "English",
            documentDepth: (documentDepth as "standard" | "comprehensive") || "standard",
            fsdType: ((fsdType as string) || "standard") as import("@/lib/types").FsdType,
            feedbackContext: [feedbackContext, memoryContext, crossSessionContext].filter(Boolean).join("") || undefined,
            fewShotContext: fewShotContext || undefined,
            selectedSections,
          },
          sendEvent,
        );

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`[AgentTeam] Completed in ${elapsed}s. Warnings: ${result.warnings.length}. Memories used: ${memories.length}`);

        // Log completion to thread
        if (threadId) {
          addMessage(threadId, {
            role: "assistant",
            content: `Agent Team completed in ${elapsed}s. Module: ${result.primaryModule}, Process Area: ${result.processArea}, Warnings: ${result.warnings.length}`,
            metadata: { elapsed, warningCount: result.warnings.length },
          }).catch(() => {});
          // Summarize for future context (fire-and-forget)
          summarizeThread(threadId).catch(() => {});
        }

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
        console.error("[AgentTeam] FAILED:", error);
        const message = error instanceof Error ? error.message : "Agent team generation failed";
        const safeMessage = message.replace(/\/[^\s]+\//g, "").substring(0, 200);
        sendEvent({
          phase: "error",
          status: "failed",
          error: safeMessage,
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
