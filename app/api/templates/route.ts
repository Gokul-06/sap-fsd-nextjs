import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/templates — List template FSDs with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get("module");
    const industry = searchParams.get("industry");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {
      isTemplate: true,
    };

    if (moduleFilter && moduleFilter !== "all") {
      where.primaryModule = moduleFilter;
    }
    if (industry && industry !== "all") {
      where.industry = industry;
    }
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const templates = await prisma.fsd.findMany({
      where,
      orderBy: [{ rating: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        projectName: true,
        author: true,
        primaryModule: true,
        processArea: true,
        industry: true,
        rating: true,
        language: true,
        createdAt: true,
        markdown: true,
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Failed to list templates:", error);
    return NextResponse.json(
      { error: "Failed to list templates" },
      { status: 500 }
    );
  }
}
