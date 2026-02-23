"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      if (!containerRef.current) return;

      try {
        // Dynamic import to avoid SSR issues
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#0091DA",
            primaryTextColor: "#FFFFFF",
            primaryBorderColor: "#1B2A4A",
            lineColor: "#1B2A4A",
            secondaryColor: "#F0F2F5",
            tertiaryColor: "#E8F4FD",
            fontFamily: "Calibri, sans-serif",
            fontSize: "14px",
            nodeBorder: "#1B2A4A",
            mainBkg: "#0091DA",
            clusterBkg: "#F0F2F5",
          },
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 15,
          },
        });

        // Clean the chart string
        const cleanChart = chart
          .replace(/^```mermaid\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();

        if (!cleanChart) {
          setError("Empty diagram");
          setIsLoading(false);
          return;
        }

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, cleanChart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Mermaid render error:", err);
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    // Fallback: show raw Mermaid source in a styled code block
    const cleanChart = chart
      .replace(/^```mermaid\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    return (
      <div className="mermaid-container mermaid-fallback">
        <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          Process Flow Diagram (source view)
        </div>
        <pre className="bg-[#1B2A4A] text-green-300 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
          {cleanChart}
        </pre>
      </div>
    );
  }

  return (
    <div className="mermaid-container">
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <div className="loading-ring mr-3" style={{ width: 24, height: 24, borderWidth: 2 }} />
          Rendering process flow diagram...
        </div>
      )}
      <div
        ref={containerRef}
        className={`mermaid-rendered ${isLoading ? "hidden" : ""}`}
      />
    </div>
  );
}
