import { NextResponse } from "next/server";
import { isAIEnabled } from "@/lib/tools/claude-ai";
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
    });
  } catch (error) {
    console.error("Status check failed:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}
