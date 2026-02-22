import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/feedback-rules/[ruleId] — toggle active, update content
export async function PATCH(
  request: Request,
  { params }: { params: { ruleId: string } }
) {
  try {
    const { ruleId } = params;
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update feedback rule:", error);
    return NextResponse.json(
      { error: "Failed to update feedback rule" },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback-rules/[ruleId]
export async function DELETE(
  _request: Request,
  { params }: { params: { ruleId: string } }
) {
  try {
    const { ruleId } = params;

    const rule = await prisma.feedbackRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    await prisma.feedbackRule.delete({ where: { id: ruleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete feedback rule:", error);
    return NextResponse.json(
      { error: "Failed to delete feedback rule" },
      { status: 500 }
    );
  }
}
