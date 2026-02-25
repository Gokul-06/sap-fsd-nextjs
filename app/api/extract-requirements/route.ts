export const maxDuration = 60;

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { safeErrorResponse } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileBase64, fileName, mediaType } = body;

    if (!fileBase64) {
      return NextResponse.json(
        { error: "Missing fileBase64 in request body" },
        { status: 400 }
      );
    }

    // File size validation (10MB max = ~13.3MB in base64)
    if (typeof fileBase64 === "string" && fileBase64.length > 15_000_000) {
      return NextResponse.json(
        { error: "File too large. Maximum file size is 10MB." },
        { status: 413 }
      );
    }

    // Validate media type
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
    if (mediaType && !allowedTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Accepted: PDF, DOCX, TXT." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: mediaType || "application/pdf",
                data: fileBase64,
              },
            },
            {
              type: "text",
              text: `You are an SAP functional consultant. Extract business requirements from this document for generating an SAP Functional Specification Document (FSD).

Extract and organize the following:
1. **Business Requirements**: List all functional requirements, user stories, or process descriptions
2. **SAP-Specific Terms**: Identify any SAP transactions, modules, tables, or Fiori apps mentioned
3. **Business Rules**: Extract approval workflows, validation rules, tolerance limits, etc.
4. **Integration Points**: Note any cross-module or external system integrations
5. **Data Objects**: Identify master data and transactional data mentioned

Format the output as a structured requirements text that can be directly pasted into an FSD generator. Use clear bullet points and numbered items. Keep SAP technical terms in English.

If the document doesn't contain SAP-specific requirements, extract general business process requirements that can be mapped to SAP functionality.`,
            },
          ],
        },
      ],
    });

    const block = message.content[0];
    const requirements = block.type === "text" ? block.text : "";

    return NextResponse.json({
      requirements,
      fileName: fileName || "uploaded-document.pdf",
      tokenUsage: {
        input: message.usage?.input_tokens || 0,
        output: message.usage?.output_tokens || 0,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "PDF extraction") },
      { status: 500 }
    );
  }
}
