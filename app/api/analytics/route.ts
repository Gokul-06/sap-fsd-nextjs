import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [totalFsds, byModuleRaw, recentFsds] = await Promise.all([
      prisma.fsd.count(),
      prisma.fsd.groupBy({
        by: ["primaryModule"],
        _count: {
          primaryModule: true,
        },
        orderBy: {
          _count: {
            primaryModule: "desc",
          },
        },
      }),
      prisma.fsd.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          projectName: true,
          primaryModule: true,
          aiEnabled: true,
          createdAt: true,
        },
      }),
    ]);

    const byModule = byModuleRaw.map((entry) => ({
      module: entry.primaryModule,
      count: entry._count.primaryModule,
    }));

    return NextResponse.json({
      totalFsds,
      byModule,
      recentFsds,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
