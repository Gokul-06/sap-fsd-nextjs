import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const take = parseInt(searchParams.get("take") || "20", 10);
    const moduleFilter = searchParams.get("module");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (moduleFilter) {
      where.primaryModule = moduleFilter;
    }

    if (search) {
      where.title = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [fsds, total] = await Promise.all([
      prisma.fsd.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.fsd.count({ where }),
    ]);

    return NextResponse.json({ fsds, total });
  } catch (error) {
    console.error("Failed to list FSDs:", error);
    return NextResponse.json(
      { error: "Failed to list FSDs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      projectName,
      author,
      companyName,
      primaryModule,
      processArea,
      relatedModules,
      markdown,
      warnings,
      aiEnabled,
    } = body;

    if (!title || !projectName || !author || !primaryModule || !markdown) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, projectName, author, primaryModule, markdown",
        },
        { status: 400 }
      );
    }

    const fsd = await prisma.fsd.create({
      data: {
        title,
        projectName,
        author,
        companyName: companyName || null,
        primaryModule,
        processArea: processArea || "",
        relatedModules: Array.isArray(relatedModules)
          ? JSON.stringify(relatedModules)
          : relatedModules || "[]",
        markdown,
        warnings: Array.isArray(warnings)
          ? JSON.stringify(warnings)
          : warnings || "[]",
        aiEnabled: aiEnabled ?? false,
      },
    });

    return NextResponse.json(fsd, { status: 201 });
  } catch (error) {
    console.error("Failed to save FSD:", error);
    return NextResponse.json(
      { error: "Failed to save FSD" },
      { status: 500 }
    );
  }
}
