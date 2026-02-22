import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { callClaude, isAIEnabled } from "@/lib/tools/claude-ai";

// POST /api/fsd/[id]/comment/[commentId]/promote — promote a comment to a feedback rule
export async function POST(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { id, commentId } = params;
    const body = await request.json();
    const { ruleType } = body;

    if (!ruleType) {
      return NextResponse.json(
        { error: "Missing required field: ruleType" },
        { status: 400 }
      );
    }

    const validTypes = ["content_improvement", "structure", "validation", "terminology"];
    if (!validTypes.includes(ruleType)) {
      return NextResponse.json(
        { error: `ruleType must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Fetch the FSD and comment
    const fsd = await prisma.fsd.findUnique({ where: { id } });
    if (!fsd) {
      return NextResponse.json({ error: "FSD not found" }, { status: 404 });
    }

    const comment = await prisma.comment.findFirst({
      where: { id: commentId, fsdId: id },
    });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Use AI to extract a concise improvement rule from the comment, or fall back to raw content
    let ruleContent = comment.content;

    if (isAIEnabled()) {
      try {
        const extracted = await callClaude(
          `Extract a concise, actionable improvement rule from this comment on a SAP ${fsd.primaryModule} FSD (process area: ${fsd.processArea}):

Comment: "${comment.content}"

Return ONLY a single, clear instruction that can be applied when generating future FSDs for this module. Example format: "Include tolerance group configuration in the SAP Configuration section for invoice verification processes." Do not include any preamble or explanation.`
        );
        if (extracted && extracted.trim().length > 10) {
          ruleContent = extracted.trim();
        }
      } catch {
        // Fall back to raw comment content
      }
    }

    // Create the feedback rule
    const rule = await prisma.feedbackRule.create({
      data: {
        module: fsd.primaryModule,
        processArea: fsd.processArea,
        ruleType,
        content: ruleContent,
        source: "comment",
        sourceCommentId: commentId,
        active: true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Failed to promote comment:", error);
    return NextResponse.json(
      { error: "Failed to promote comment to feedback rule" },
      { status: 500 }
    );
  }
}
