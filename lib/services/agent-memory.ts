/**
 * Agent Memory Service
 *
 * Provides persistent memory for AI agents across sessions:
 * - Conversation history: stores full message threads per generation
 * - Cross-session context: recalls past FSDs, preferences, corrections for same project/module
 * - Learning from feedback: extracts insights from ratings, comments, refinements
 * - Memory retrieval: builds context injection strings for AI prompts
 */

import { prisma } from "@/lib/db";
import { callClaude } from "@/lib/tools/claude-ai";

// ─── Types ─────────────────────────────────────────────────

export type MemoryType = "preference" | "correction" | "pattern" | "insight" | "client_context";
export type MemorySource = "user_correction" | "refinement" | "rating" | "ai_extracted" | "manual";
export type ThreadType = "generation" | "refinement" | "feedback";

export interface MemoryEntry {
  memoryType: MemoryType;
  content: string;
  module?: string;
  processArea?: string;
  projectName?: string;
  importance?: number;
  source: MemorySource;
  sourceId?: string;
  userId?: string;
}

export interface ThreadCreateInput {
  sessionId: string;
  projectName: string;
  module?: string;
  processArea?: string;
  threadType?: ThreadType;
  userId?: string;
  fsdId?: string;
}

export interface MessageInput {
  role: "user" | "assistant" | "system" | "agent";
  content: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

// ─── Conversation Thread Management ────────────────────────

/**
 * Create a new conversation thread for a generation session.
 */
export async function createThread(input: ThreadCreateInput): Promise<string> {
  try {
    const thread = await prisma.conversationThread.create({
      data: {
        sessionId: input.sessionId,
        projectName: input.projectName,
        module: input.module,
        processArea: input.processArea,
        threadType: input.threadType || "generation",
        userId: input.userId,
        fsdId: input.fsdId,
      },
    });
    return thread.id;
  } catch (error) {
    console.error("[AgentMemory] Failed to create thread:", error);
    throw error;
  }
}

/**
 * Add a message to a conversation thread.
 */
export async function addMessage(threadId: string, message: MessageInput): Promise<void> {
  try {
    await prisma.conversationMessage.create({
      data: {
        threadId,
        role: message.role,
        content: message.content,
        agentName: message.agentName,
        metadata: message.metadata ? JSON.stringify(message.metadata) : undefined,
      },
    });
  } catch (error) {
    console.error("[AgentMemory] Failed to add message:", error);
    // Non-critical — don't throw
  }
}

/**
 * Add multiple messages to a thread at once (batch insert).
 */
export async function addMessages(threadId: string, messages: MessageInput[]): Promise<void> {
  try {
    await prisma.conversationMessage.createMany({
      data: messages.map((m) => ({
        threadId,
        role: m.role,
        content: m.content,
        agentName: m.agentName,
        metadata: m.metadata ? JSON.stringify(m.metadata) : undefined,
      })),
    });
  } catch (error) {
    console.error("[AgentMemory] Failed to add messages batch:", error);
  }
}

/**
 * Get conversation history for a thread.
 */
export async function getThreadMessages(threadId: string): Promise<MessageInput[]> {
  try {
    const messages = await prisma.conversationMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });
    return messages.map((m) => ({
      role: m.role as MessageInput["role"],
      content: m.content,
      agentName: m.agentName || undefined,
      metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Link a thread to an FSD after generation completes.
 */
export async function linkThreadToFsd(threadId: string, fsdId: string): Promise<void> {
  try {
    await prisma.conversationThread.update({
      where: { id: threadId },
      data: { fsdId },
    });
  } catch (error) {
    console.error("[AgentMemory] Failed to link thread to FSD:", error);
  }
}

/**
 * Generate and store a summary for a conversation thread.
 */
export async function summarizeThread(threadId: string): Promise<string | null> {
  try {
    const messages = await getThreadMessages(threadId);
    if (messages.length < 2) return null;

    const conversationText = messages
      .slice(0, 20) // Cap to avoid token limits
      .map((m) => `[${m.role}${m.agentName ? ` (${m.agentName})` : ""}]: ${m.content.slice(0, 500)}`)
      .join("\n\n");

    const summary = await callClaude(
      `Summarize this FSD generation conversation in 2-3 sentences. Focus on: what was requested, key decisions made, any corrections or special requirements.\n\n${conversationText}`,
      256,
      15000,
    );

    await prisma.conversationThread.update({
      where: { id: threadId },
      data: { summary },
    });

    return summary;
  } catch (error) {
    console.error("[AgentMemory] Failed to summarize thread:", error);
    return null;
  }
}

// ─── Memory CRUD ───────────────────────────────────────────

/**
 * Store a new memory entry.
 */
export async function storeMemory(entry: MemoryEntry): Promise<string> {
  const memory = await prisma.agentMemory.create({
    data: {
      memoryType: entry.memoryType,
      content: entry.content,
      module: entry.module,
      processArea: entry.processArea,
      projectName: entry.projectName,
      importance: entry.importance || 5,
      source: entry.source,
      sourceId: entry.sourceId,
      userId: entry.userId,
    },
  });
  return memory.id;
}

/**
 * Store multiple memories at once.
 */
export async function storeMemories(entries: MemoryEntry[]): Promise<void> {
  await prisma.agentMemory.createMany({
    data: entries.map((e) => ({
      memoryType: e.memoryType,
      content: e.content,
      module: e.module,
      processArea: e.processArea,
      projectName: e.projectName,
      importance: e.importance || 5,
      source: e.source,
      sourceId: e.sourceId,
      userId: e.userId,
    })),
  });
}

// ─── Memory Retrieval (Context Building) ───────────────────

/**
 * Retrieve relevant memories for a generation context.
 * Returns memories scoped by module, process area, and project.
 * Sorted by importance and recall frequency.
 */
export async function recallMemories(params: {
  module?: string;
  processArea?: string;
  projectName?: string;
  userId?: string;
  limit?: number;
  types?: MemoryType[];
}): Promise<Array<{ id: string; memoryType: string; content: string; importance: number }>> {
  const { module, processArea, projectName, userId, limit = 15, types } = params;

  try {
    // Build OR conditions for scoped memory retrieval
    const conditions: Array<Record<string, unknown>> = [];

    // Project-specific memories (highest priority)
    if (projectName) {
      conditions.push({ projectName });
    }

    // Module + process area specific
    if (module && processArea) {
      conditions.push({ module, processArea });
    }

    // Module-wide memories
    if (module) {
      conditions.push({ module, processArea: null });
    }

    // Global memories (no module scope)
    conditions.push({ module: null, projectName: null });

    if (conditions.length === 0) return [];

    const memories = await prisma.agentMemory.findMany({
      where: {
        AND: [
          { OR: conditions },
          // Skip expired memories
          { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
          ...(userId ? [{ userId }] : []),
          ...(types ? [{ memoryType: { in: types } }] : []),
        ],
      },
      orderBy: [
        { importance: "desc" },
        { recallCount: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        memoryType: true,
        content: true,
        importance: true,
      },
    });

    // Increment recall count (fire-and-forget)
    if (memories.length > 0) {
      const memoryIds = memories.map((m) => m.id);
      prisma.agentMemory
        .updateMany({
          where: { id: { in: memoryIds } },
          data: { recallCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    return memories;
  } catch (error) {
    console.error("[AgentMemory] Failed to recall memories:", error);
    return [];
  }
}

/**
 * Build a context string from retrieved memories for injection into AI prompts.
 */
export function buildMemoryContext(
  memories: Array<{ memoryType: string; content: string; importance: number }>
): string {
  if (memories.length === 0) return "";

  const grouped: Record<string, string[]> = {};
  for (const m of memories) {
    const label = formatMemoryType(m.memoryType);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(m.content);
  }

  const sections = Object.entries(grouped)
    .map(([label, items]) => {
      const bulletList = items.map((item) => `  • ${item}`).join("\n");
      return `${label}:\n${bulletList}`;
    })
    .join("\n\n");

  return (
    "\n\nAGENT MEMORY — Apply these learnings from past interactions:\n" +
    sections +
    "\n\nUse these memories to produce better, more contextual output.\n"
  );
}

function formatMemoryType(type: string): string {
  const labels: Record<string, string> = {
    preference: "Client Preferences",
    correction: "Past Corrections",
    pattern: "Detected Patterns",
    insight: "Key Insights",
    client_context: "Client Context",
  };
  return labels[type] || type;
}

// ─── Cross-Session Context ─────────────────────────────────

/**
 * Get summaries of previous generation threads for the same project/module.
 * This gives agents awareness of what was generated before.
 */
export async function getPastThreadSummaries(params: {
  projectName: string;
  module?: string;
  userId?: string;
  limit?: number;
}): Promise<Array<{ summary: string; threadType: string; createdAt: Date }>> {
  const { projectName, module, userId, limit = 5 } = params;

  try {
    const threads = await prisma.conversationThread.findMany({
      where: {
        projectName,
        ...(module ? { module } : {}),
        ...(userId ? { userId } : {}),
        summary: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        summary: true,
        threadType: true,
        createdAt: true,
      },
    });

    return threads
      .filter((t) => t.summary)
      .map((t) => ({
        summary: t.summary!,
        threadType: t.threadType,
        createdAt: t.createdAt,
      }));
  } catch {
    return [];
  }
}

/**
 * Build cross-session context string from past thread summaries.
 */
export function buildCrossSessionContext(
  summaries: Array<{ summary: string; threadType: string; createdAt: Date }>
): string {
  if (summaries.length === 0) return "";

  const lines = summaries.map((s, i) => {
    const date = s.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `  ${i + 1}. [${date}] (${s.threadType}) ${s.summary}`;
  });

  return (
    "\n\nPREVIOUS SESSIONS — The user has generated FSDs before for this project:\n" +
    lines.join("\n") +
    "\n\nBuild upon prior work. Maintain consistency with previous outputs.\n"
  );
}

// ─── Learning from Feedback ────────────────────────────────

/**
 * Extract learnings from a user's refinement instruction.
 * When a user corrects or refines an FSD, we extract the underlying preference/pattern.
 */
export async function learnFromRefinement(params: {
  instruction: string;
  module?: string;
  processArea?: string;
  projectName?: string;
  fsdId?: string;
  userId?: string;
}): Promise<void> {
  try {
    const prompt = `Analyze this FSD refinement instruction and extract reusable learnings.
The user asked to modify their FSD document with this instruction:
"${params.instruction}"

Extract 1-3 actionable learnings. For each, return a JSON array with objects:
{
  "type": "preference" | "correction" | "pattern",
  "content": "concise, reusable rule (max 100 words)",
  "importance": 1-10
}

Examples of good learnings:
- {"type":"preference","content":"Client prefers bullet points over paragraphs for process steps","importance":6}
- {"type":"correction","content":"Always include rollback procedures in cutover plans","importance":8}
- {"type":"pattern","content":"For MM module, user wants vendor evaluation criteria in procurement FSDs","importance":7}

Return ONLY the JSON array, no explanation.`;

    const response = await callClaude(prompt, 512, 15000);
    if (!response) return;

    let learnings: Array<{ type: MemoryType; content: string; importance: number }>;
    try {
      let cleaned = response.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      learnings = JSON.parse(cleaned);
      if (!Array.isArray(learnings)) return;
    } catch {
      return; // Silent fail on parse error
    }

    // Store each learning as an AgentMemory entry
    const entries: MemoryEntry[] = learnings
      .filter((l) => l.content && l.type)
      .slice(0, 3)
      .map((l) => ({
        memoryType: l.type as MemoryType,
        content: l.content,
        module: params.module,
        processArea: params.processArea,
        projectName: params.projectName,
        importance: Math.min(10, Math.max(1, l.importance || 5)),
        source: "refinement" as MemorySource,
        sourceId: params.fsdId,
        userId: params.userId,
      }));

    if (entries.length > 0) {
      await storeMemories(entries);
      console.log(`[AgentMemory] Extracted ${entries.length} learnings from refinement`);
    }
  } catch (error) {
    console.error("[AgentMemory] Failed to learn from refinement:", error);
    // Non-critical — don't throw
  }
}

/**
 * Extract learnings when a user rates an FSD highly (4-5 stars).
 * Captures what made this generation successful.
 */
export async function learnFromHighRating(params: {
  fsdId: string;
  rating: number;
  module: string;
  processArea: string;
  projectName?: string;
  requirements: string;
  userId?: string;
}): Promise<void> {
  if (params.rating < 4) return; // Only learn from successes

  try {
    await storeMemory({
      memoryType: "insight",
      content: `FSD rated ${params.rating}/5 for ${params.module}/${params.processArea}. Requirements pattern: "${params.requirements.slice(0, 200)}"`,
      module: params.module,
      processArea: params.processArea,
      projectName: params.projectName,
      importance: params.rating >= 5 ? 8 : 6,
      source: "rating",
      sourceId: params.fsdId,
      userId: params.userId,
    });
  } catch {
    // Non-critical
  }
}

/**
 * Extract learnings from user comments on FSDs.
 * Comments often contain implicit preferences and corrections.
 */
export async function learnFromComment(params: {
  comment: string;
  module: string;
  processArea: string;
  fsdId: string;
  userId?: string;
}): Promise<void> {
  try {
    // Only extract learnings from substantial comments
    if (params.comment.length < 20) return;

    const prompt = `A user left this comment on a ${params.module} FSD document:
"${params.comment.slice(0, 500)}"

Is this comment actionable feedback that should be remembered for future FSD generations?
If YES, extract ONE learning as JSON: {"type":"correction"|"preference","content":"...","importance":1-10}
If NO (just praise, question, or irrelevant), return: {"skip":true}

Return ONLY the JSON, no explanation.`;

    const response = await callClaude(prompt, 256, 10000);
    if (!response) return;

    try {
      let cleaned = response.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      const parsed = JSON.parse(cleaned);
      if (parsed.skip) return;

      await storeMemory({
        memoryType: parsed.type || "correction",
        content: parsed.content,
        module: params.module,
        processArea: params.processArea,
        importance: parsed.importance || 5,
        source: "ai_extracted",
        sourceId: params.fsdId,
        userId: params.userId,
      });
      console.log("[AgentMemory] Extracted learning from comment");
    } catch {
      // Silent fail
    }
  } catch {
    // Non-critical
  }
}

// ─── Memory Statistics ─────────────────────────────────────

/**
 * Get memory statistics for display in the UI.
 */
export async function getMemoryStats(userId?: string): Promise<{
  totalMemories: number;
  totalThreads: number;
  memoriesByType: Record<string, number>;
  topModules: Array<{ module: string; count: number }>;
}> {
  try {
    const whereUser = userId ? { where: { userId } } : undefined;
    const [totalMemories, totalThreads, memories] = await Promise.all([
      prisma.agentMemory.count(whereUser),
      prisma.conversationThread.count(whereUser),
      prisma.agentMemory.groupBy({
        by: ["memoryType"],
        _count: true,
        ...(userId ? { where: { userId } } : {}),
      }),
    ]);

    const memoriesByType: Record<string, number> = {};
    for (const m of memories) {
      memoriesByType[m.memoryType] = m._count;
    }

    // Get top modules
    const moduleGroups = await prisma.agentMemory.groupBy({
      by: ["module"],
      _count: true,
      where: { module: { not: null }, ...(userId ? { userId } : {}) },
      orderBy: { _count: { module: "desc" } },
      take: 5,
    });

    const topModules = moduleGroups
      .filter((g) => g.module)
      .map((g) => ({ module: g.module!, count: g._count }));

    return { totalMemories, totalThreads, memoriesByType, topModules };
  } catch {
    return { totalMemories: 0, totalThreads: 0, memoriesByType: {}, topModules: [] };
  }
}
