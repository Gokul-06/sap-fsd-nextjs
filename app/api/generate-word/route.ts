export const maxDuration = 60;

import { NextResponse } from "next/server";
import { generateFSD } from "@/lib/tools/generate-fsd";
import {
  generateWordDocument,
  parseMarkdownToSections,
} from "@/lib/tools/generate-word";
import { getAffectedModules } from "@/lib/knowledge/cross-module-map";
import { safeErrorResponse } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, projectName, author, requirements, module, companyName, markdownOverride, language } =
      body;

    if (!title || (!requirements && !markdownOverride)) {
      return NextResponse.json(
        { error: "Missing required fields: title, requirements (or markdownOverride)" },
        { status: 400 }
      );
    }

    // If markdownOverride is provided, skip regeneration and use it directly
    let markdown: string;
    let primaryModule: string = module || "MM";
    let relatedModules: string[] = [];

    if (markdownOverride) {
      markdown = markdownOverride;
      const integrationModules = getAffectedModules(primaryModule);
      relatedModules = integrationModules.filter((m) => m !== primaryModule);
    } else {
      const fsdResult = await generateFSD({
        title,
        projectName: projectName || "SAP Project",
        author: author || "GP",
        requirements,
        module,
      });
      markdown = fsdResult.markdown;
      primaryModule = fsdResult.primaryModule;
      relatedModules = fsdResult.classifiedModules
        .filter((m) => !m.isPrimary)
        .map((m) => m.module);
      const integrationModules = getAffectedModules(fsdResult.primaryModule);
      for (const mod of integrationModules) {
        if (!relatedModules.includes(mod) && mod !== fsdResult.primaryModule) {
          relatedModules.push(mod);
        }
      }
    }

    const sections = parseMarkdownToSections(markdown);
    const today = new Date().toISOString().split("T")[0];

    const docxBuffer = await generateWordDocument({
      title,
      projectName: projectName || "SAP Project",
      author: author || "GP",
      module: primaryModule,
      relatedModules,
      processArea: "",
      date: today,
      companyName,
      language: language || "English",
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
    return NextResponse.json(
      { error: safeErrorResponse(error, "Word generation") },
      { status: 500 }
    );
  }
}
