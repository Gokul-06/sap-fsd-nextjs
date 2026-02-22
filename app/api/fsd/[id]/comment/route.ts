import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    console.error("Failed to fetch comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
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
    const { authorName, content } = body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json(
        { error: "Missing or empty 'content' field" },
        { status: 400 }
      );
    }

    const fsd = await prisma.fsd.findUnique({ where: { id } });

    if (!fsd) {
      return NextResponse.json(
        { error: "FSD not found" },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        fsdId: id,
        authorName: authorName || "Anonymous",
        content: content.trim(),
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
