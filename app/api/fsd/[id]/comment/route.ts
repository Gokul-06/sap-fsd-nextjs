import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { safeErrorResponse, stripHtmlTags } from "@/lib/api-error";
import { commentSchema, validateBody } from "@/lib/validations";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const fsd = await prisma.fsd.findUnique({ where: { id } });

    if (!fsd) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { fsdId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Fetch comments") },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Zod validation
    const validated = validateBody(commentSchema, body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { authorName, content } = validated.data;

    const fsd = await prisma.fsd.findUnique({ where: { id } });

    if (!fsd) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    // Strip HTML tags to prevent stored XSS
    const sanitizedContent = stripHtmlTags(content);

    const comment = await prisma.comment.create({
      data: {
        fsdId: id,
        authorName: stripHtmlTags(authorName),
        content: sanitizedContent,
      },
    });

    logAudit("CREATE_COMMENT", "Comment", comment.id, request, `On FSD ${id}`);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Add comment") },
      { status: 500 }
    );
  }
}
