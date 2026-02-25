import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";
import { feedbackRuleSchema, validateBody } from "@/lib/validations";

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
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch feedback rules") },
      { status: 500 }
    );
  }
}

// POST /api/feedback-rules — create a manual rule
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod validation
    const validated = validateBody(feedbackRuleSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { module: ruleModule, processArea, ruleType, content } = validated.data;

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

    logAudit("CREATE_RULE", "FeedbackRule", rule.id, request, `Module: ${ruleModule}, Type: ${ruleType}`);

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Create feedback rule") },
      { status: 500 }
    );
  }
}
