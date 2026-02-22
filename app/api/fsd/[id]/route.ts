import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    console.error("Failed to fetch FSD:", error);
    return NextResponse.json(
      { error: "Failed to fetch FSD" },
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

    return NextResponse.json({ message: "FSD deleted successfully" });
  } catch (error) {
    console.error("Failed to delete FSD:", error);
    return NextResponse.json(
      { error: "Failed to delete FSD" },
      { status: 500 }
    );
  }
}
