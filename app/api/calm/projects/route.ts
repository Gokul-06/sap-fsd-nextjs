import { NextResponse } from "next/server";
import { isCalmConfigured } from "@/lib/services/calm-client";
import { listCalmProjects } from "@/lib/services/calm-projects";
import { safeErrorResponse } from "@/lib/api-error";

export async function GET() {
  if (!isCalmConfigured()) {
    return NextResponse.json({ error: "SAP Cloud ALM is not configured" }, { status: 503 });
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
