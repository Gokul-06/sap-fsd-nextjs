/**
 * Anthropic Provider Adapter
 *
 * Handles both:
 * - Direct Anthropic API (provider: "anthropic")
 * - Azure AI Foundry with Claude models (provider: "azure-anthropic")
 *
 * The only difference is the baseURL — Azure AI Foundry uses
 * "https://<resource>.services.ai.azure.com/api/anthropic"
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  AIProviderAdapter,
  AICompletionRequest,
  AICompletionResponse,
  AIContentBlock,
  AIProvider,
} from "../types";

export class AnthropicAdapter implements AIProviderAdapter {
  readonly providerId: AIProvider;
  readonly displayName: string;
  readonly supportsDocumentVision = true;

  private client: Anthropic;
  private model: string;

  constructor(config: {
    apiKey: string;
    model: string;
    baseURL?: string;
    isAzure?: boolean;
  }) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      ...(config.baseURL ? { baseURL: `${config.baseURL}/api/anthropic` } : {}),
    });
    this.model = config.model;
    this.providerId = config.isAzure ? "azure-anthropic" : "anthropic";
    this.displayName = config.isAzure ? "Azure AI Foundry (Claude)" : "Anthropic (Direct)";
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    const timeoutMs = request.timeoutMs || 120000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Extract plain text from messages
      const messages = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: typeof m.content === "string" ? m.content : this.extractText(m.content),
        }));

      const message = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: request.maxTokens,
          messages,
        },
        { signal: controller.signal }
      );

      const block = message.content[0];
      const text = block.type === "text" ? block.text : "";

      return {
        text,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
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

  async completeWithDocument(request: AICompletionRequest): Promise<AICompletionResponse> {
    const timeoutMs = request.timeoutMs || 120000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Map our content blocks to Anthropic's format
      const messages = request.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content:
            typeof m.content === "string"
              ? m.content
              : this.toAnthropicContentBlocks(m.content),
        }));

      const message = await this.client.messages.create(
        {
          model: this.model,
          max_tokens: request.maxTokens,
          messages: messages as Anthropic.MessageCreateParams["messages"],
        },
        { signal: controller.signal }
      );

      const block = message.content[0];
      const text = block.type === "text" ? block.text : "";

      return {
        text,
        usage: {
          inputTokens: message.usage.input_tokens,
          outputTokens: message.usage.output_tokens,
        },
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

  // ─── Private Helpers ────────────────────────────────────────────

  private extractText(blocks: AIContentBlock[]): string {
    return blocks
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");
  }

  private toAnthropicContentBlocks(blocks: AIContentBlock[]): Anthropic.ContentBlockParam[] {
    return blocks.map((block) => {
      if (block.type === "text") {
        return { type: "text" as const, text: block.text };
      }
      // Document block — pass through to Anthropic's format
      return {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: block.source.media_type as
            | "application/pdf"
            | "text/plain"
            | "text/html"
            | "text/csv"
            | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          data: block.source.data,
        },
      };
    });
  }
}
