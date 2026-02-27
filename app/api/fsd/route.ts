import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const take = Math.min(parseInt(searchParams.get("take") || "20", 10), 100);
    const cursor = searchParams.get("cursor"); // Keyset pagination — O(1) vs O(n) offset
    const moduleFilter = searchParams.get("module");
    const search = searchParams.get("search");

    // Legacy offset support (backwards compatible)
    const skip = parseInt(searchParams.get("skip") || "0", 10);

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

    // Keyset pagination: use cursor for O(1) page access
    // Falls back to offset pagination if no cursor provided
    const [fsds, total] = await Promise.all([
      prisma.fsd.findMany({
        where,
        take: take + 1, // Fetch one extra to check if there's a next page
        ...(cursor
          ? { cursor: { id: cursor }, skip: 1 } // Skip the cursor item itself
          : skip > 0
          ? { skip }
          : {}),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          projectName: true,
          primaryModule: true,
          processArea: true,
          aiEnabled: true,
          rating: true,
          language: true,
          fsdType: true,
          createdAt: true,
          author: true,
          _count: { select: { comments: true } },
        },
      }),
      prisma.fsd.count({ where }),
    ]);

    // Check if there's more data (we fetched take+1)
    const hasMore = fsds.length > take;
    const items = hasMore ? fsds.slice(0, take) : fsds;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      fsds: items,
      total,
      nextCursor, // Client passes this back for next page
      hasMore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "List FSDs") },
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
      language,
      fsdType,
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
        language: language || "English",
        fsdType: fsdType || "standard",
      },
    });

    logAudit("CREATE_FSD", "Fsd", fsd.id, request, `Created: ${title}`);

    return NextResponse.json(fsd, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Save FSD") },
      { status: 500 }
    );
  }
}
