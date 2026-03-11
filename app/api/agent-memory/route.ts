import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getMemoryStats } from "@/lib/services/agent-memory";
import { safeErrorResponse } from "@/lib/api-error";

/**
 * GET /api/agent-memory — Fetch memory stats and recent memories
 */
export async function GET() {
  try {
    const [stats, recentMemories, recentThreads] = await Promise.all([
      getMemoryStats(),
      prisma.agentMemory.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          memoryType: true,
          module: true,
          processArea: true,
          projectName: true,
          content: true,
          importance: true,
          recallCount: true,
          source: true,
          createdAt: true,
        },
      }),
      prisma.conversationThread.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          sessionId: true,
          projectName: true,
          module: true,
          threadType: true,
          summary: true,
          createdAt: true,
          _count: { select: { messages: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats,
      recentMemories,
      recentThreads: recentThreads.map((t) => ({
        ...t,
        messageCount: t._count.messages,
        _count: undefined,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch agent memory") },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agent-memory — Manually add a memory entry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memoryType, content, module, processArea, projectName, importance, source } = body;

    if (!content || !memoryType) {
      return NextResponse.json(
        { error: "memoryType and content are required" },
        { status: 400 },
      );
    }

    const memory = await prisma.agentMemory.create({
      data: {
        memoryType,
        content,
        module: module || null,
        processArea: processArea || null,
        projectName: projectName || null,
        importance: importance || 5,
        source: source || "manual",
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Create memory") },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/agent-memory — Clear all memories (admin action)
 */
export async function DELETE() {
  try {
    const [memoryCount, threadCount] = await Promise.all([
      prisma.agentMemory.deleteMany({}),
      prisma.conversationMessage.deleteMany({}),
    ]);

    // Delete threads after messages (due to FK)
    await prisma.conversationThread.deleteMany({});

    return NextResponse.json({
      deleted: {
        memories: memoryCount.count,
        messages: threadCount.count,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Clear agent memory") },
      { status: 500 },
    );
  }
}
