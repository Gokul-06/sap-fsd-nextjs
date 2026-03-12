import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";
import { feedbackStatusSchema, validateBody } from "@/lib/validations";

// PATCH /api/fsd-feedback/[feedbackId] — update status and admin notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;
    const body = await request.json();

    const validated = validateBody(feedbackStatusSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { status, adminNotes } = validated.data;

    const feedback = await prisma.fsdFeedback.update({
      where: { id: feedbackId },
      data: {
        status,
        adminNotes: adminNotes ?? undefined,
        resolvedAt:
          status === "resolved" || status === "wont_fix"
            ? new Date()
            : undefined,
      },
    });

    logAudit(
      "UPDATE_FEEDBACK",
      "FsdFeedback",
      feedbackId,
      request,
      `Status: ${status}`
    );

    return NextResponse.json(feedback);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Update FSD feedback") },
      { status: 500 }
    );
  }
}

// DELETE /api/fsd-feedback/[feedbackId] — delete feedback
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;

    await prisma.fsdFeedback.delete({ where: { id: feedbackId } });

    logAudit("DELETE_FEEDBACK", "FsdFeedback", feedbackId, _request);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Delete FSD feedback") },
      { status: 500 }
    );
  }
}
