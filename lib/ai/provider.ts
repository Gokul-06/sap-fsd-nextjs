/**
 * AI Provider Factory
 *
 * Creates and manages a singleton AI provider adapter based on
 * environment configuration. Supports hot-swapping providers
 * by changing AI_PROVIDER and restarting the app.
 */

import { getAIConfig, isAIEnabled as configIsAIEnabled } from "./config";
import type { AIProviderAdapter } from "./types";
import { AnthropicAdapter } from "./adapters/anthropic";
import { OpenAIAdapter } from "./adapters/openai";

let _adapter: AIProviderAdapter | null = null;

/**
 * Get the configured AI provider adapter (singleton).
 * Creates the adapter on first call based on environment variables.
 */
export function getProvider(): AIProviderAdapter {
  if (!_adapter) {
    const config = getAIConfig();

    switch (config.provider) {
      case "anthropic":
        _adapter = new AnthropicAdapter({
          apiKey: config.apiKey,
          model: config.model,
          isAzure: false,
        });
        break;

      case "azure-anthropic":
        _adapter = new AnthropicAdapter({
          apiKey: config.apiKey,
          model: config.model,
          baseURL: config.baseURL,
          isAzure: true,
        });
        break;

      case "openai":
        _adapter = new OpenAIAdapter({
          apiKey: config.apiKey,
          model: config.model,
          isAzure: false,
        });
        break;

      case "azure-openai":
        _adapter = new OpenAIAdapter({
          apiKey: config.apiKey,
          model: config.model,
          baseURL: config.baseURL,
          azureApiVersion: config.azureApiVersion,
          azureDeployment: config.azureDeployment,
          isAzure: true,
        });
        break;
    }
  }

  return _adapter!;
}

/**
 * Check if AI is enabled (backward compatible).
 * Re-exported for use by existing code that imports from this module.
 */
export function isAIEnabled(): boolean {
  return configIsAIEnabled();
}

/**
 * Reset the singleton adapter (useful for testing or reconfiguration).
 */
export function resetProvider(): void {
  _adapter = null;
}
