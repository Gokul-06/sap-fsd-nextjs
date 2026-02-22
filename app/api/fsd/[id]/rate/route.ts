import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { rating } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const fsd = await prisma.fsd.findUnique({ where: { id } });
    if (!fsd) {
      return NextResponse.json({ error: "FSD not found" }, { status: 404 });
    }

    const updated = await prisma.fsd.update({
      where: { id },
      data: { rating: Math.round(rating) },
      select: { id: true, rating: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Rating update failed:", error);
    return NextResponse.json(
      { error: "Failed to update rating" },
      { status: 500 }
    );
  }
}
