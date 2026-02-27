import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";
import { ratingSchema, validateBody } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Zod validation
    const validated = validateBody(ratingSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { rating } = validated.data;

    const fsd = await prisma.fsd.findUnique({ where: { id } });
    if (!fsd) {
      return NextResponse.json({ error: "FSD not found" }, { status: 404 });
    }

    const updated = await prisma.fsd.update({
      where: { id },
      data: { rating: Math.round(rating) },
      select: { id: true, rating: true },
    });

    logAudit("RATE_FSD", "Fsd", id, request, `Rated ${rating}/5`);

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Update rating") },
      { status: 500 }
    );
  }
}
