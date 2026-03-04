export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getProvider, isAIEnabled } from "@/lib/ai/provider";
import { safeErrorResponse } from "@/lib/api-error";
import { documentCache } from "@/lib/cache";

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

    // Check AI provider is configured
    if (!isAIEnabled()) {
      return NextResponse.json(
        { error: "No AI provider configured. Set AI_PROVIDER and the corresponding API key." },
        { status: 500 }
      );
    }

    // Check document vision support
    const provider = getProvider();
    if (!provider.supportsDocumentVision) {
      return NextResponse.json(
        {
          error: `Document extraction requires Anthropic provider. Current provider (${provider.displayName}) does not support PDF/DOCX uploads. Set AI_PROVIDER=anthropic or AI_PROVIDER=azure-anthropic.`,
        },
        { status: 400 }
      );
    }

    // ── SHA-256 Deduplication ─────────────────────────────────────
    // Hash the file content. If we've seen this exact file before,
    // return the cached result instantly — saves ~30s and $0.05/call.
    const contentHash = createHash("sha256")
      .update(fileBase64.slice(0, 10000)) // Hash first 10KB for speed (unique enough)
      .digest("hex");

    const cached = documentCache.get(contentHash) as { requirements: string; fileName: string; tokenUsage: { input: number; output: number } } | undefined;
    if (cached) {
      return NextResponse.json({
        ...cached,
        fileName: fileName || cached.fileName,
        fromCache: true,
      });
    }

    const response = await provider.completeWithDocument({
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
      maxTokens: 4096,
    });

    const result = {
      requirements: response.text,
      fileName: fileName || "uploaded-document.pdf",
      tokenUsage: {
        input: response.usage?.inputTokens || 0,
        output: response.usage?.outputTokens || 0,
      },
    };

    // Cache for future identical uploads (24hr TTL)
    documentCache.set(contentHash, result);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "PDF extraction") },
      { status: 500 }
    );
  }
}
