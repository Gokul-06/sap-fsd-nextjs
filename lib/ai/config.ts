/**
 * Multi-Provider AI Configuration
 *
 * Reads environment variables to determine which AI provider to use.
 * Fully backward compatible: if AI_PROVIDER is not set but ANTHROPIC_API_KEY
 * exists, defaults to "anthropic" (existing behavior).
 */

import type { AIProvider } from "./types";

// ─── Configuration Shape ────────────────────────────────────────────

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  baseURL?: string;
  azureApiVersion?: string;
  azureDeployment?: string;
}

// ─── Default Models Per Provider ────────────────────────────────────

const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: "claude-sonnet-4-20250514",
  "azure-anthropic": "claude-sonnet-4-20250514",
  openai: "gpt-4o",
  "azure-openai": "gpt-4o",
};

// ─── Provider Configuration ─────────────────────────────────────────

export function getAIConfig(): AIConfig {
  const providerEnv = process.env.AI_PROVIDER?.toLowerCase().trim();

  // Determine provider (backward compatible: default to anthropic if ANTHROPIC_API_KEY exists)
  let provider: AIProvider;
  if (providerEnv && isValidProvider(providerEnv)) {
    provider = providerEnv;
  } else if (process.env.ANTHROPIC_API_KEY) {
    provider = "anthropic";
  } else {
    throw new Error(
      "No AI provider configured. Set AI_PROVIDER and the corresponding API key. " +
        "Supported providers: anthropic, azure-anthropic, azure-openai, openai"
    );
  }

  // Model override or default
  const model = process.env.AI_MODEL?.trim() || DEFAULT_MODELS[provider];

  // Provider-specific configuration
  switch (provider) {
    case "anthropic": {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY is required for provider 'anthropic'");
      return { provider, model, apiKey };
    }

    case "azure-anthropic": {
      const apiKey = process.env.AZURE_AI_FOUNDRY_API_KEY;
      const baseURL = process.env.AZURE_AI_FOUNDRY_ENDPOINT;
      if (!apiKey) throw new Error("AZURE_AI_FOUNDRY_API_KEY is required for provider 'azure-anthropic'");
      if (!baseURL) throw new Error("AZURE_AI_FOUNDRY_ENDPOINT is required for provider 'azure-anthropic'");
      return { provider, model, apiKey, baseURL };
    }

    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) throw new Error("OPENAI_API_KEY is required for provider 'openai'");
      return { provider, model, apiKey };
    }

    case "azure-openai": {
      const apiKey = process.env.AZURE_OPENAI_API_KEY;
      const baseURL = process.env.AZURE_OPENAI_ENDPOINT;
      const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";
      const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o";
      if (!apiKey) throw new Error("AZURE_OPENAI_API_KEY is required for provider 'azure-openai'");
      if (!baseURL) throw new Error("AZURE_OPENAI_ENDPOINT is required for provider 'azure-openai'");
      return { provider, model, apiKey, baseURL, azureApiVersion, azureDeployment };
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

function isValidProvider(value: string): value is AIProvider {
  return ["anthropic", "azure-anthropic", "azure-openai", "openai"].includes(value);
}

/**
 * Check if AI is enabled (required env vars are present for the configured provider).
 * Does not throw — returns false if misconfigured.
 */
export function isAIEnabled(): boolean {
  try {
    getAIConfig();
    return true;
  } catch {
    return false;
  }
}
