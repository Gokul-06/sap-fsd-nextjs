export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateFSD } from "@/lib/tools/generate-fsd";
import { isAIEnabled } from "@/lib/tools/claude-ai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, projectName, author, requirements, module } = body;

    if (!title || !projectName || !author || !requirements) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, projectName, author, requirements",
        },
        { status: 400 }
      );
    }

    const result = await generateFSD({
      title,
      projectName,
      author,
      requirements,
      module,
    });

    return NextResponse.json({
      ...result,
      aiEnabled: isAIEnabled(),
    });
  } catch (error) {
    console.error("FSD generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate FSD",
      },
      { status: 500 }
    );
  }
}
