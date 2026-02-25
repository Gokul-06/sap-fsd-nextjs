import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const fsd = await prisma.fsd.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: "desc" } } },
    });

    if (!fsd) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(fsd);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch FSD") },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.fsd.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    await prisma.fsd.delete({ where: { id } });

    logAudit("DELETE_FSD", "Fsd", id, request, `Deleted: ${existing.title}`);

    return NextResponse.json({ message: "FSD deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Delete FSD") },
      { status: 500 }
    );
  }
}
