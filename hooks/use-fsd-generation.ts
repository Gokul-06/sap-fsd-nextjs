"use client";

import { useState } from "react";
import type { AgentProgressEvent } from "@/lib/types";

interface FSDResult {
  markdown: string;
  primaryModule: string;
  processArea: string;
  classifiedModules: Array<{
    module: string;
    confidence: number;
    isPrimary: boolean;
    matchedKeywords: string[];
  }>;
  crossModuleImpacts: string[];
  warnings: string[];
  aiEnabled: boolean;
}

interface GenerationInput {
  title: string;
  projectName: string;
  author: string;
  requirements: string;
  module?: string;
  companyName?: string;
  language?: string;
  documentDepth?: "standard" | "comprehensive";
  generationMode?: "standard" | "agent-team";
}

export function useFsdGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<FSDResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Agent Teams state
  const [agentProgress, setAgentProgress] = useState<AgentProgressEvent | null>(null);

  async function generate(input: GenerationInput) {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setAgentProgress(null);

    const mode = input.generationMode || "standard";

    if (mode === "agent-team") {
      return generateWithAgentTeam(input);
    }

    return generateStandard(input);
  }

  // Standard mode — single fetch, wait for JSON response
  async function generateStandard(input: GenerationInput) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Generation failed");
      }

      const data: FSDResult = await res.json();
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  // Agent Teams mode — SSE streaming with progress events
  async function generateWithAgentTeam(input: GenerationInput) {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Agent team generation failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.slice(6);
              try {
                const event: AgentProgressEvent = JSON.parse(json);
                setAgentProgress(event);

                if (event.phase === "complete" && event.result) {
                  const fsdResult = event.result as unknown as FSDResult;
                  setResult(fsdResult);
                  return fsdResult;
                }

                if (event.phase === "error") {
                  throw new Error(event.error || "Agent team generation failed");
                }
              } catch (parseErr) {
                // Check if it's our re-thrown error
                if (parseErr instanceof Error && parseErr.message.includes("Agent team")) {
                  throw parseErr;
                }
                // Skip malformed SSE events
              }
            }
          }
        }
      }

      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveToHistory(input: GenerationInput, markdownOverride?: string) {
    if (!result) return null;

    setIsSaving(true);
    try {
      const res = await fetch("/api/fsd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          projectName: input.projectName,
          author: input.author,
          companyName: input.companyName,
          primaryModule: result.primaryModule,
          processArea: result.processArea,
          relatedModules: result.classifiedModules
            .filter((m) => !m.isPrimary)
            .map((m) => m.module),
          markdown: markdownOverride || result.markdown,
          warnings: result.warnings,
          aiEnabled: result.aiEnabled,
          language: input.language || "English",
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const saved = await res.json();
      setSavedId(saved.id);
      return saved;
    } catch {
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function downloadWord(input: GenerationInput, markdownOverride?: string) {
    try {
      const bodyPayload: Record<string, unknown> = {
        title: input.title,
        projectName: input.projectName,
        author: input.author,
        requirements: input.requirements,
        module: result?.primaryModule || input.module,
        companyName: input.companyName,
        language: input.language || "English",
      };
      if (markdownOverride) {
        bodyPayload.markdownOverride = markdownOverride;
      }
      const res = await fetch("/api/generate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) throw new Error("Word generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FSD-${input.title.replace(/[^a-zA-Z0-9]/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      setError(message);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
    setSavedId(null);
    setAgentProgress(null);
  }

  return {
    isGenerating,
    result,
    error,
    isSaving,
    savedId,
    generate,
    saveToHistory,
    downloadWord,
    reset,
    agentProgress,
  };
}
