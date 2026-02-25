import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AGENT_ROLES } from "@/lib/agent-training-questions";
import { compilePersonalityPrompt } from "@/lib/tools/compile-training";

// GET: List all agent trainings
export async function GET() {
  try {
    const trainings = await prisma.agentTraining.findMany({
      orderBy: { agentRole: "asc" },
    });

    // Build a map of role → training (or null if not trained)
    const trainingMap = Object.fromEntries(
      AGENT_ROLES.map((role) => [
        role,
        trainings.find((t) => t.agentRole === role) || null,
      ]),
    );

    return NextResponse.json(trainingMap);
  } catch (error) {
    console.error("[AgentTraining] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent trainings" },
      { status: 500 },
    );
  }
}

// POST: Save/update training for a role
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentRole, expertName, questionnaire } = body;

    if (!agentRole || !expertName || !questionnaire) {
      return NextResponse.json(
        { error: "Missing required fields: agentRole, expertName, questionnaire" },
        { status: 400 },
      );
    }

    if (!AGENT_ROLES.includes(agentRole)) {
      return NextResponse.json(
        { error: `Invalid agent role: ${agentRole}` },
        { status: 400 },
      );
    }

    // Compile personality prompt using Claude
    let personalityPrompt: string;
    try {
      personalityPrompt = await compilePersonalityPrompt(
        agentRole,
        expertName,
        questionnaire,
      );
    } catch (compileError) {
      console.error("[AgentTraining] Compile error:", compileError);
      return NextResponse.json(
        { error: "Failed to compile personality prompt. AI service may be unavailable." },
        { status: 503 },
      );
    }

    // Upsert the training
    const training = await prisma.agentTraining.upsert({
      where: { agentRole },
      create: {
        agentRole,
        expertName,
        questionnaire: JSON.stringify(questionnaire),
        personalityPrompt,
        isActive: true,
      },
      update: {
        expertName,
        questionnaire: JSON.stringify(questionnaire),
        personalityPrompt,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error("[AgentTraining] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save agent training" },
      { status: 500 },
    );
  }
}
