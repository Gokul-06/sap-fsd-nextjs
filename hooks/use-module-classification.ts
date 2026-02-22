"use client";

import { useState, useEffect, useRef } from "react";

interface ClassifiedModule {
  module: string;
  confidence: number;
  isPrimary: boolean;
  matchedKeywords: string[];
}

interface ClassificationResult {
  modules: ClassifiedModule[];
  primaryModule: string;
  processArea: string;
}

export function useModuleClassification(requirements: string, debounceMs = 800) {
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!requirements || requirements.length < 20) {
      setResult(null);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requirements }),
        });
        if (res.ok) {
          const data = await res.json();
          setResult(data);
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [requirements, debounceMs]);

  return { result, isLoading };
}
