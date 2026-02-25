import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";
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

    // Check if share exists and is still valid
    if (fsd.shareId) {
      const isExpired = fsd.shareExpiresAt && new Date(fsd.shareExpiresAt) < new Date();
      if (!isExpired) {
        const shareUrl = `${new URL(request.url).origin}/share/${fsd.shareId}`;
        return NextResponse.json({
          shareId: fsd.shareId,
          shareUrl,
          expiresAt: fsd.shareExpiresAt,
        });
      }
    }

    const shareId = crypto.randomUUID();
    // Share links expire in 30 days (GDPR data retention)
    const shareExpiresAt = new Date();
    shareExpiresAt.setDate(shareExpiresAt.getDate() + 30);

    await prisma.fsd.update({
      where: { id },
      data: { shareId, shareExpiresAt },
    });

    const shareUrl = `${new URL(request.url).origin}/share/${shareId}`;

    logAudit("SHARE_FSD", "Fsd", id, request, `Share link created, expires ${shareExpiresAt.toISOString()}`);

    return NextResponse.json({
      shareId,
      shareUrl,
      expiresAt: shareExpiresAt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Generate share link") },
      { status: 500 }
    );
  }
}
