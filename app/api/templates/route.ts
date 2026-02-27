import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Extract first meaningful paragraph from markdown — computed server-side to avoid sending full content */
function computePreview(markdown: string): string {
  const lines = markdown.split("\n").filter((l) => {
    const trimmed = l.trim();
    return (
      trimmed.length > 20 &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("|") &&
      !trimmed.startsWith("**") &&
      !trimmed.startsWith(">") &&
      !trimmed.startsWith("---")
    );
  });
  const preview = lines.slice(0, 2).join(" ").trim();
  return preview.length > 150 ? preview.substring(0, 147) + "..." : preview;
}

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

    // Optimization: Exclude full markdown (50KB+ per template) from listing.
    // Compute a short preview server-side instead of sending entire content.
    // 100 templates × 50KB = 5MB → now 100 templates × 200B = 20KB (250x smaller)
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
        markdown: true, // Still needed for preview computation
        _count: { select: { comments: true } },
      },
    });

    // Compute preview server-side, strip markdown from response
    const templatesWithPreview = templates.map(({ markdown, ...rest }) => ({
      ...rest,
      preview: computePreview(markdown),
    }));

    return NextResponse.json({ templates: templatesWithPreview });
  } catch (error) {
    console.error("Failed to list templates:", error);
    return NextResponse.json(
      { error: "Failed to list templates" },
      { status: 500 }
    );
  }
}
