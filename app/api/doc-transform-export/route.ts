export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { generateSOPWord } from "@/lib/tools/generate-sop-word";
import { safeErrorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, processName, moduleName, author, documentType } = body;

    if (!markdown || !processName) {
      return NextResponse.json(
        { error: "Missing required fields: markdown, processName" },
        { status: 400 }
      );
    }

    const docxBuffer = await generateSOPWord({
      documentType: documentType || "sop",
      processName,
      moduleName: moduleName || "MM",
      author: author || "Gokul Palanisamy",
      markdown,
    });

    const typeLabel = documentType === "manual" ? "UserManual" : "SOP";
    const filename = `${typeLabel}_${processName.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "SOP Word export") },
      { status: 500 }
    );
  }
}
