import { NextResponse } from "next/server";
import { callClaude, isAIEnabled } from "@/lib/tools/claude-ai";
import { safeErrorResponse } from "@/lib/api-error";
import { z } from "zod";
import { validateBody } from "@/lib/validations";

export const maxDuration = 60;

const aiFillSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
});

/**
 * POST /api/ai-fill — Parse natural language into structured requirement fields
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = validateBody(aiFillSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not configured. Please set up an AI provider." },
        { status: 503 }
      );
    }

    const { description } = validated.data;

    const prompt = `You are an SAP consultant. Given the following natural language description of an SAP business requirement, extract and structure it into the 7 standard FSD requirement sections.

INPUT:
"""
${description}
"""

Return ONLY a valid JSON object with these exact keys (use empty string "" if a section is not mentioned):

{
  "processScope": "End-to-end process description...",
  "transactions": "SAP transaction codes and Fiori apps...",
  "businessRules": "Approval workflows, validations, tolerances...",
  "integrations": "Cross-module touchpoints and external integrations...",
  "reportsAnalytics": "Dashboards, KPIs, reports...",
  "authorization": "Roles, permissions, segregation of duties...",
  "dataMigration": "Legacy data objects, volumes, migration approach..."
}

Be detailed and professional. Use bullet points (•) within each section. Expand abbreviations and add SAP-specific context where possible. If the input mentions transaction codes, map them correctly. Return ONLY the JSON — no markdown, no explanation.`;

    const response = await callClaude(prompt, 2048, 30000);

    // Parse the JSON from the response
    let parsed: Record<string, string>;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Validate the parsed object has the expected keys
    const validKeys = [
      "processScope", "transactions", "businessRules",
      "integrations", "reportsAnalytics", "authorization", "dataMigration",
    ];
    const result: Record<string, string> = {};
    for (const key of validKeys) {
      result[key] = typeof parsed[key] === "string" ? parsed[key] : "";
    }

    return NextResponse.json({ fields: result });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "AI Fill") },
      { status: 500 }
    );
  }
}
