import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";

// PATCH /api/feedback-rules/[ruleId] — toggle active, update content
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;
    const body = await request.json();

    const rule = await prisma.feedbackRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (typeof body.active === "boolean") updateData.active = body.active;
    if (typeof body.content === "string") updateData.content = body.content.trim();
    if (typeof body.ruleType === "string") updateData.ruleType = body.ruleType;

    const updated = await prisma.feedbackRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    logAudit("UPDATE_RULE", "FeedbackRule", ruleId, request, `Updated fields: ${Object.keys(updateData).join(", ")}`);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Update feedback rule") },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback-rules/[ruleId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const { ruleId } = await params;

    const rule = await prisma.feedbackRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    await prisma.feedbackRule.delete({ where: { id: ruleId } });

    logAudit("DELETE_RULE", "FeedbackRule", ruleId, request, `Deleted rule: ${rule.module}/${rule.ruleType}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Delete feedback rule") },
      { status: 500 }
    );
  }
}
