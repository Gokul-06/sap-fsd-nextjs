import { NextResponse } from "next/server";
import { isCalmConfigured, isCalmDemoMode } from "@/lib/services/calm-client";
import { listCalmProjects } from "@/lib/services/calm-projects";
import { getMockProjects } from "@/lib/services/calm-mock-data";
import { safeErrorResponse } from "@/lib/api-error";

export async function GET() {
  if (!isCalmConfigured()) {
    return NextResponse.json({ error: "SAP Cloud ALM is not configured" }, { status: 503 });
  }

  // Demo mode — return mock data
  if (isCalmDemoMode()) {
    return NextResponse.json({ projects: getMockProjects(), demoMode: true });
  }

  try {
    const projects = await listCalmProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "CALM list projects") },
      { status: 500 }
    );
  }
}
