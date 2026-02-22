export const maxDuration = 60;

import { NextResponse } from "next/server";
import { callClaude, isAIEnabled } from "@/lib/tools/claude-ai";

export async function POST(request: Request) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "AI is not enabled. Set ANTHROPIC_API_KEY to use refinement." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { markdown, instruction } = body;

    if (!markdown || !instruction) {
      return NextResponse.json(
        { error: "Missing required fields: markdown, instruction" },
        { status: 400 }
      );
    }

    if (instruction.trim().length < 5) {
      return NextResponse.json(
        { error: "Instruction too short. Please provide more detail." },
        { status: 400 }
      );
    }

    const prompt = `You are an SAP Functional Specification Document (FSD) editor working for Westernacher Consulting (WE-AI). You will receive an existing FSD in markdown format and a user instruction describing changes to make.

RULES:
- Return the COMPLETE updated FSD markdown with the requested changes applied
- Preserve all existing sections, tables, and formatting unless the instruction explicitly asks to remove them
- Maintain professional SAP consulting language and formatting
- Do NOT add any preamble, explanation, or commentary — return ONLY the updated markdown
- If the instruction asks to add content, integrate it naturally into the appropriate section
- If the instruction asks to modify content, update it in place

USER INSTRUCTION: ${instruction}

CURRENT FSD DOCUMENT:
${markdown}`;

    const updatedMarkdown = await callClaude(prompt, 8192);

    if (!updatedMarkdown || updatedMarkdown.trim().length < 100) {
      return NextResponse.json(
        { error: "AI returned insufficient content. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ markdown: updatedMarkdown.trim() });
  } catch (error) {
    console.error("FSD refinement failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to refine FSD",
      },
      { status: 500 }
    );
  }
}
