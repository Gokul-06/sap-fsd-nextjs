/**
 * SAP Cloud ALM (CALM) API Client
 * Handles OAuth2 client-credentials flow + base HTTP requests.
 * Singleton pattern — mirrors claude-ai.ts.
 */

import type { CalmTokenResponse, CalmApiError } from "./calm-types";

// ─── Configuration ───────────────────────────────────────

export function isCalmConfigured(): boolean {
  return !!(
    process.env.CALM_CLIENT_ID &&
    process.env.CALM_CLIENT_SECRET &&
    process.env.CALM_TOKEN_URL &&
    process.env.CALM_API_BASE_URL
  );
}

function getConfig() {
  const clientId = process.env.CALM_CLIENT_ID;
  const clientSecret = process.env.CALM_CLIENT_SECRET;
  const tokenUrl = process.env.CALM_TOKEN_URL;
  const apiBaseUrl = process.env.CALM_API_BASE_URL;

  if (!clientId || !clientSecret || !tokenUrl || !apiBaseUrl) {
    throw new Error(
      "CALM not configured. Set CALM_CLIENT_ID, CALM_CLIENT_SECRET, CALM_TOKEN_URL, CALM_API_BASE_URL."
    );
  }

  return { clientId, clientSecret, tokenUrl, apiBaseUrl: apiBaseUrl.replace(/\/+$/, "") };
}

// ─── Token Cache (module-scope singleton) ────────────────

let cachedToken: string | null = null;
let tokenExpiresAt = 0; // Unix ms

async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Return cached token if valid (with 60s buffer)
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const { clientId, clientSecret, tokenUrl } = getConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Token request failed (${res.status}): ${text.substring(0, 200)}`);
    }

    const data: CalmTokenResponse = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000;

    return cachedToken;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Generic HTTP Client ─────────────────────────────────

export interface CalmFetchOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
}

export async function calmFetch<T>(path: string, options: CalmFetchOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = 30_000 } = options;
  const { apiBaseUrl } = getConfig();
  const token = await getAccessToken();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const url = `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let errorMessage = `CALM API error (${res.status})`;
      try {
        const errorBody: CalmApiError = await res.json();
        errorMessage = errorBody.error?.message || errorMessage;
      } catch {
        const text = await res.text().catch(() => "");
        if (text) errorMessage += `: ${text.substring(0, 200)}`;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Connection Test ─────────────────────────────────────

export async function testCalmConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    // Try fetching a token — if this works, connection is valid
    await getAccessToken();
    return { connected: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { connected: false, error: message };
  }
}
