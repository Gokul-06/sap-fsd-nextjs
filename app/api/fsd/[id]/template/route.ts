import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH /api/fsd/[id]/template — Toggle template status and set industry
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isTemplate, industry } = body;

    const existing = await prisma.fsd.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FSD not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    if (industry !== undefined) updateData.industry = industry;

    const updated = await prisma.fsd.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        isTemplate: true,
        industry: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update template status:", error);
    return NextResponse.json(
      { error: "Failed to update template status" },
      { status: 500 }
    );
  }
}
