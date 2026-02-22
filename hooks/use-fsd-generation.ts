"use client";

import { useState } from "react";

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
}

export function useFsdGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<FSDResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function generate(input: GenerationInput) {
    setIsGenerating(true);
    setError(null);
    setResult(null);

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

  async function saveToHistory(input: GenerationInput) {
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
          markdown: result.markdown,
          warnings: result.warnings,
          aiEnabled: result.aiEnabled,
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

  async function downloadWord(input: GenerationInput) {
    try {
      const res = await fetch("/api/generate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: input.title,
          projectName: input.projectName,
          author: input.author,
          requirements: input.requirements,
          module: result?.primaryModule || input.module,
          companyName: input.companyName,
        }),
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
  };
}
