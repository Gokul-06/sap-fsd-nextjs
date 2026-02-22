"use client";

import { Badge } from "@/components/ui/badge";

interface ClassifiedModule {
  module: string;
  confidence: number;
  isPrimary: boolean;
  matchedKeywords: string[];
}

interface ModuleDetectorProps {
  modules: ClassifiedModule[] | null;
  isLoading: boolean;
}

export function ModuleDetector({ modules, isLoading }: ModuleDetectorProps) {
  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100 animate-pulse">
        <p className="text-sm text-muted-foreground">Detecting SAP modules...</p>
      </div>
    );
  }

  if (!modules || modules.length === 0) return null;

  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
        Detected SAP Modules
      </p>
      <div className="flex flex-wrap gap-2">
        {modules.map((m) => (
          <Badge
            key={m.module}
            variant={m.isPrimary ? "default" : "secondary"}
            className={
              m.isPrimary
                ? "bg-navy text-white hover:bg-navy-light"
                : "bg-white text-navy border border-navy/20"
            }
          >
            {m.module}
            <span className="ml-1 opacity-70 text-xs">
              {Math.round(m.confidence * 100)}%
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
