import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/tools/claude-ai";
import { isCalmConfigured } from "@/lib/services/calm-client";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    let dbConnected = false;

    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    return NextResponse.json({
      aiEnabled: isAIEnabled(),
      dbConnected,
      calmConfigured: isCalmConfigured(),
    });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
