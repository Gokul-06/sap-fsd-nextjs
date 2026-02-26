import { NextResponse } from "next/server";
import { isCalmConfigured, isCalmDemoMode } from "@/lib/services/calm-client";
import { listCalmRequirements } from "@/lib/services/calm-projects";
import { getMockRequirements } from "@/lib/services/calm-mock-data";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse } from "@/lib/api-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  if (!isCalmConfigured()) {
    return NextResponse.json({ error: "SAP Cloud ALM is not configured" }, { status: 503 });
  }

  const { projectId } = await params;

  if (!projectId || projectId.length > 100) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
  }

  // Demo mode — return mock data
  if (isCalmDemoMode()) {
    const requirements = getMockRequirements(projectId);
    return NextResponse.json({ requirements, demoMode: true });
  }

  try {
    const requirements = await listCalmRequirements(projectId);

    logAudit(
      "CALM_PULL_REQUIREMENTS",
      "CalmProject",
      projectId,
      request,
      `Pulled ${requirements.length} requirements`
    );

    return NextResponse.json({ requirements });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "CALM list requirements") },
      { status: 500 }
    );
  }
}
