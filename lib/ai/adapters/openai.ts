/**
 * OpenAI Provider Adapter
 *
 * Handles both:
 * - Direct OpenAI API (provider: "openai")
 * - Azure OpenAI (provider: "azure-openai")
 *
 * Does NOT support document/vision content blocks (PDF upload).
 * If document extraction is needed, use Anthropic or Azure AI Foundry instead.
 */

import OpenAI from "openai";
import type {
  AIProviderAdapter,
  AICompletionRequest,
  AICompletionResponse,
  AIContentBlock,
  AIProvider,
} from "../types";

export class OpenAIAdapter implements AIProviderAdapter {
  readonly providerId: AIProvider;
  readonly displayName: string;
  readonly supportsDocumentVision = false;

  private client: OpenAI;
  private model: string;

  constructor(config: {
    apiKey: string;
    model: string;
    baseURL?: string;
    azureApiVersion?: string;
    azureDeployment?: string;
    isAzure: boolean;
  }) {
    if (config.isAzure) {
      // Azure OpenAI uses a different endpoint format
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: `${config.baseURL}/openai/deployments/${config.azureDeployment}`,
        defaultQuery: { "api-version": config.azureApiVersion || "2024-12-01-preview" },
        defaultHeaders: { "api-key": config.apiKey },
      });
      this.model = config.azureDeployment || config.model;
      this.providerId = "azure-openai";
      this.displayName = "Azure OpenAI";
    } else {
      this.client = new OpenAI({ apiKey: config.apiKey });
      this.model = config.model;
      this.providerId = "openai";
      this.displayName = "OpenAI (Direct)";
    }
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const timeoutMs = request.timeoutMs || 120000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Map our messages to OpenAI format
      const messages: OpenAI.ChatCompletionMessageParam[] = request.messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: typeof m.content === "string" ? m.content : this.extractText(m.content),
      }));

      const response = await this.client.chat.completions.create(
        {
          model: this.model,
          max_tokens: request.maxTokens,
          messages,
        },
        { signal: controller.signal }
      );

      const text = response.choices[0]?.message?.content || "";

      return {
        text,
        usage: response.usage
          ? {
              inputTokens: response.usage.prompt_tokens,
              outputTokens: response.usage.completion_tokens || 0,
            }
          : undefined,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(`${this.displayName} API call timed out after ${timeoutMs / 1000}s`);
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  async completeWithDocument(
    _request: AICompletionRequest
  ): Promise<AICompletionResponse> {
    throw new Error(
      `Document/vision extraction is not supported by ${this.displayName}. ` +
        `PDF and DOCX uploads require the Anthropic provider. ` +
        `Set AI_PROVIDER=anthropic or AI_PROVIDER=azure-anthropic to use document extraction.`
    );
  }

  // ─── Private Helpers ────────────────────────────────────────────

  private extractText(blocks: AIContentBlock[]): string {
    return blocks
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  }
}
