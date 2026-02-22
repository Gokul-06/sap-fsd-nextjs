import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/feedback-rules — list rules with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterModule = searchParams.get("module");
    const processArea = searchParams.get("processArea");
    const active = searchParams.get("active");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (filterModule) where.module = filterModule;
    if (processArea) where.processArea = processArea;
    if (active !== null && active !== undefined && active !== "") {
      where.active = active === "true";
    }

    const rules = await prisma.feedbackRule.findMany({
      where,
      orderBy: [{ appliedCount: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch feedback rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback rules" },
      { status: 500 }
    );
  }
}

// POST /api/feedback-rules — create a manual rule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { module: ruleModule, processArea, ruleType, content } = body;

    if (!ruleModule || !ruleType || !content) {
      return NextResponse.json(
        { error: "Missing required fields: module, ruleType, content" },
        { status: 400 }
      );
    }

    const validTypes = ["content_improvement", "structure", "validation", "terminology"];
    if (!validTypes.includes(ruleType)) {
      return NextResponse.json(
        { error: `ruleType must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    const rule = await prisma.feedbackRule.create({
      data: {
        module: ruleModule,
        processArea: processArea || null,
        ruleType,
        content: content.trim(),
        source: "manual",
        active: true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Failed to create feedback rule:", error);
    return NextResponse.json(
      { error: "Failed to create feedback rule" },
      { status: 500 }
    );
  }
}
