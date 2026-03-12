import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeErrorResponse } from "@/lib/api-error";

// GET /api/fsd-feedback/stats — dashboard statistics
export async function GET() {
  try {
    // Run all counts in parallel
    const [total, newCount, reviewingCount, resolvedCount, wontFixCount, resolvedThisWeek] =
      await Promise.all([
        prisma.fsdFeedback.count(),
        prisma.fsdFeedback.count({ where: { status: "new" } }),
        prisma.fsdFeedback.count({ where: { status: "reviewing" } }),
        prisma.fsdFeedback.count({ where: { status: "resolved" } }),
        prisma.fsdFeedback.count({ where: { status: "wont_fix" } }),
        prisma.fsdFeedback.count({
          where: {
            status: "resolved",
            resolvedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return NextResponse.json({
      total,
      new: newCount,
      reviewing: reviewingCount,
      resolved: resolvedCount,
      wont_fix: wontFixCount,
      resolvedThisWeek,
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch feedback stats") },
      { status: 500 }
    );
  }
}
