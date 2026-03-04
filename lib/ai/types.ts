/**
 * Multi-Provider AI Abstraction Layer — Type Definitions
 *
 * Defines provider-agnostic contracts so the app can switch
 * between Anthropic, Azure AI Foundry, OpenAI, or Azure OpenAI
 * via environment variables.
 */

// ─── Provider Identifiers ───────────────────────────────────────────

export type AIProvider =
  | "anthropic"        // Direct Anthropic API
  | "azure-anthropic"  // Claude models via Azure AI Foundry
  | "azure-openai"     // GPT models via Azure OpenAI
  | "openai";          // Direct OpenAI API

// ─── Message Types ──────────────────────────────────────────────────

export interface AITextContent {
  type: "text";
  text: string;
}

export interface AIDocumentContent {
  type: "document";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

export type AIContentBlock = AITextContent | AIDocumentContent;

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string | AIContentBlock[];
}

// ─── Request / Response ─────────────────────────────────────────────

export interface AICompletionRequest {
  messages: AIMessage[];
  maxTokens: number;
  timeoutMs?: number;
}

export interface AICompletionResponse {
  text: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// ─── Provider Adapter Interface ─────────────────────────────────────

export interface AIProviderAdapter {
  /** Unique provider identifier */
  readonly providerId: AIProvider;

  /** Human-readable name for error messages */
  readonly displayName: string;

  /** Whether this provider supports document/vision content blocks (PDF upload) */
  readonly supportsDocumentVision: boolean;

  /** Send a text-only completion request */
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;

  /**
   * Send a request with document content blocks (PDF/DOCX vision).
   * Throws if provider does not support document vision.
   */
  completeWithDocument(request: AICompletionRequest): Promise<AICompletionResponse>;
}
