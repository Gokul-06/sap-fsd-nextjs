export const maxDuration = 30;

import { NextResponse } from "next/server";
import { generateFSD } from "@/lib/tools/generate-fsd";
import {
  generateWordDocument,
  parseMarkdownToSections,
} from "@/lib/tools/generate-word";
import { getAffectedModules } from "@/lib/knowledge/cross-module-map";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, projectName, author, requirements, module, companyName } =
      body;

    if (!title || !requirements) {
      return NextResponse.json(
        { error: "Missing required fields: title, requirements" },
        { status: 400 }
      );
    }

    const fsdResult = await generateFSD({
      title,
      projectName: projectName || "SAP Project",
      author: author || "FSD Agent",
      requirements,
      module,
    });

    const sections = parseMarkdownToSections(fsdResult.markdown);
    const today = new Date().toISOString().split("T")[0];

    const relatedModules = fsdResult.classifiedModules
      .filter((m) => !m.isPrimary)
      .map((m) => m.module);
    const integrationModules = getAffectedModules(fsdResult.primaryModule);
    for (const mod of integrationModules) {
      if (
        !relatedModules.includes(mod) &&
        mod !== fsdResult.primaryModule
      ) {
        relatedModules.push(mod);
      }
    }

    const docxBuffer = await generateWordDocument({
      title,
      projectName: projectName || "SAP Project",
      author: author || "FSD Agent",
      module: fsdResult.primaryModule,
      relatedModules,
      processArea: fsdResult.processArea,
      date: today,
      companyName,
      sections,
    });

    return new NextResponse(new Uint8Array(docxBuffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="FSD-${title.replace(/[^a-zA-Z0-9]/g, "-")}.docx"`,
      },
    });
  } catch (error) {
    console.error("Word generation failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate Word document",
      },
      { status: 500 }
    );
  }
}
