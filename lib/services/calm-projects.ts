/**
 * SAP Cloud ALM — Projects & Requirements Service
 * Fetches projects and requirements, maps them for FSD generation.
 */

import { calmFetch } from "./calm-client";
import type {
  CalmProjectListResponse,
  CalmRequirementListResponse,
  CalmProjectSummary,
  CalmRequirementForFsd,
} from "./calm-types";

// ─── List Projects ───────────────────────────────────────

export async function listCalmProjects(): Promise<CalmProjectSummary[]> {
  const res = await calmFetch<CalmProjectListResponse>(
    "/api/calm-projects/v1/projects?$top=50&$orderby=name asc"
  );

  return (res.value || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
  }));
}

// ─── List Requirements for a Project ─────────────────────

export async function listCalmRequirements(projectId: string): Promise<CalmRequirementForFsd[]> {
  const res = await calmFetch<CalmRequirementListResponse>(
    `/api/calm-projects/v1/projects('${encodeURIComponent(projectId)}')/requirements?$top=200`
  );

  return (res.value || []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description || "",
    priority: r.priority,
    status: r.status,
  }));
}

// ─── Map Requirements to FSD Input ───────────────────────

export function mapRequirementsToFsdInput(
  projectName: string,
  requirements: CalmRequirementForFsd[]
): string {
  if (requirements.length === 0) {
    return `Project: ${projectName}\n\nNo requirements found in SAP Cloud ALM.`;
  }

  const lines: string[] = [
    `Project: ${projectName}`,
    `Source: SAP Cloud ALM (${requirements.length} requirements)`,
    "",
    "--- Requirements ---",
    "",
  ];

  requirements.forEach((req, idx) => {
    lines.push(`${idx + 1}. ${req.title}`);
    if (req.priority) lines.push(`   Priority: ${req.priority}`);
    if (req.status) lines.push(`   Status: ${req.status}`);
    if (req.description) lines.push(`   ${req.description}`);
    lines.push("");
  });

  return lines.join("\n");
}
