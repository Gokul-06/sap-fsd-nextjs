import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const fsd = await prisma.fsd.findUnique({ where: { id } });

    if (!fsd) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    if (fsd.shareId) {
      const shareUrl = `${new URL(request.url).origin}/share/${fsd.shareId}`;
      return NextResponse.json({
        shareId: fsd.shareId,
        shareUrl,
      });
    }

    const shareId = crypto.randomUUID();

    await prisma.fsd.update({
      where: { id },
      data: { shareId },
    });

    const shareUrl = `${new URL(request.url).origin}/share/${shareId}`;

    return NextResponse.json({
      shareId,
      shareUrl,
    });
  } catch (error) {
    console.error("Failed to generate share link:", error);
    return NextResponse.json(
      { error: "Failed to generate share link" },
      { status: 500 }
    );
  }
}
