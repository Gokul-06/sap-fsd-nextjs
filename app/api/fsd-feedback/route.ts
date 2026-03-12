import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";
import { fsdFeedbackSchema, validateBody } from "@/lib/validations";

// POST /api/fsd-feedback — submit a new feedback report
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validated = validateBody(fsdFeedbackSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const {
      fsdId,
      feedbackType,
      section,
      description,
      userEmail,
      fsdModule,
      fsdTitle,
      generationMode,
    } = validated.data;

    const feedback = await prisma.fsdFeedback.create({
      data: {
        fsdId: fsdId || null,
        feedbackType,
        section: section || null,
        description: description.trim(),
        userEmail: userEmail || null,
        fsdModule: fsdModule || null,
        fsdTitle: fsdTitle || null,
        generationMode: generationMode || null,
        status: "new",
      },
    });

    logAudit(
      "CREATE_FEEDBACK",
      "FsdFeedback",
      feedback.id,
      request,
      `Type: ${feedbackType}, Module: ${fsdModule || "N/A"}`
    );

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Create FSD feedback") },
      { status: 500 }
    );
  }
}

// GET /api/fsd-feedback — list feedback with filters + keyset pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const feedbackType = searchParams.get("feedbackType");
    const filterModule = searchParams.get("module");
    const take = Math.min(Number(searchParams.get("take")) || 20, 100);
    const cursor = searchParams.get("cursor");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status) where.status = status;
    if (feedbackType) where.feedbackType = feedbackType;
    if (filterModule) where.fsdModule = filterModule;

    const feedbacks = await prisma.fsdFeedback.findMany({
      where,
      take: take + 1, // Fetch one extra for hasMore detection
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        fsd: { select: { id: true, title: true, primaryModule: true } },
      },
    });

    const hasMore = feedbacks.length > take;
    const results = hasMore ? feedbacks.slice(0, take) : feedbacks;
    const nextCursor = hasMore ? results[results.length - 1]?.id : null;

    return NextResponse.json({
      feedbacks: results,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch FSD feedback") },
      { status: 500 }
    );
  }
}
