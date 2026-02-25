import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AGENT_ROLES } from "@/lib/agent-training-questions";

// GET: Get training for a specific role
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ role: string }> },
) {
  try {
    const { role } = await params;

    if (!AGENT_ROLES.includes(role as typeof AGENT_ROLES[number])) {
      return NextResponse.json(
        { error: `Invalid agent role: ${role}` },
        { status: 400 },
      );
    }

    const training = await prisma.agentTraining.findFirst({
      where: { agentRole: role, isActive: true },
    });

    return NextResponse.json(training || null);
  } catch (error) {
    console.error("[AgentTraining] GET role error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent training" },
      { status: 500 },
    );
  }
}

// DELETE: Clear training for a role
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ role: string }> },
) {
  try {
    const { role } = await params;

    if (!AGENT_ROLES.includes(role as typeof AGENT_ROLES[number])) {
      return NextResponse.json(
        { error: `Invalid agent role: ${role}` },
        { status: 400 },
      );
    }

    await prisma.agentTraining.deleteMany({
      where: { agentRole: role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AgentTraining] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete agent training" },
      { status: 500 },
    );
  }
}
