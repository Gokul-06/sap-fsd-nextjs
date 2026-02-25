"use client";

import dynamic from "next/dynamic";
import type { BpmnProcessDiagram } from "@/lib/types/bpmn";

// Lazy-load MermaidDiagram so mermaid.js only loads when a diagram actually renders.
// This prevents mermaid from auto-initializing on pages that don't have diagrams.
const MermaidDiagram = dynamic(
  () => import("./mermaid-diagram").then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="mermaid-container">
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Loading diagram...
        </div>
      </div>
    ),
  }
);

// Lazy-load BpmnDiagram for Signavio-style BPMN process flows
const BpmnDiagram = dynamic(
  () => import("./bpmn-diagram").then((mod) => mod.BpmnDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="bpmn-container">
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          Loading BPMN process diagram...
        </div>
      </div>
    ),
  }
);

interface MarkdownRendererProps {
  markdown: string;
}

type BlockType = "text" | "mermaid" | "bpmn";

/** Split markdown into alternating text, mermaid, and bpmn-process blocks */
function splitBySpecialBlocks(markdown: string): Array<{ type: BlockType; content: string }> {
  const parts: Array<{ type: BlockType; content: string }> = [];
  // Match both ```mermaid and ```bpmn-process code blocks
  const regex = /```(mermaid|bpmn-process)\s*\n([\s\S]*?)```/gi;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    // Text before this block
    if (match.index > lastIndex) {
      const textBefore = markdown.slice(lastIndex, match.index);
      if (textBefore.trim()) {
        parts.push({ type: "text", content: textBefore });
      }
    }

    // Determine block type
    const blockLang = match[1].toLowerCase();
    const blockType: BlockType = blockLang === "bpmn-process" ? "bpmn" : "mermaid";
    parts.push({ type: blockType, content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last block
  if (lastIndex < markdown.length) {
    const remaining = markdown.slice(lastIndex);
    if (remaining.trim()) {
      parts.push({ type: "text", content: remaining });
    }
  }

  // No special blocks found — return entire markdown as text
  if (parts.length === 0) {
    parts.push({ type: "text", content: markdown });
  }

  return parts;
}

function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;

  // Escape HTML entities (but preserve existing HTML-like structures we create)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Horizontal rules (before other line-based processing)
  html = html.replace(/^---$/gm, "<hr />");

  // Tables
  html = html.replace(
    /(?:^\|.+\|$\n?)+/gm,
    (tableBlock: string): string => {
      const rows = tableBlock.trim().split("\n");
      if (rows.length < 2) return tableBlock;

      const parseRow = (row: string): string[] =>
        row
          .split("|")
          .slice(1, -1)
          .map((cell) => cell.trim());

      const headerCells = parseRow(rows[0]);

      // Check if second row is a separator row (e.g., |---|---|)
      const isSeparator = /^\|[\s\-:|]+\|$/.test(rows[1]);
      const dataStartIndex = isSeparator ? 2 : 1;

      let tableHtml = "<table><thead><tr>";
      headerCells.forEach((cell) => {
        tableHtml += `<th>${cell}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";

      for (let i = dataStartIndex; i < rows.length; i++) {
        const cells = parseRow(rows[i]);
        if (cells.length === 0) continue;
        tableHtml += "<tr>";
        cells.forEach((cell) => {
          tableHtml += `<td>${cell}</td>`;
        });
        tableHtml += "</tr>";
      }

      tableHtml += "</tbody></table>";
      return tableHtml;
    }
  );

  // Headings (process from h3 to h1 to avoid conflicts)
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    "<blockquote><p>$1</p></blockquote>"
  );

  // Bold and italic (bold first to avoid conflicts)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Unordered lists
  html = html.replace(
    /(?:^- .+$\n?)+/gm,
    (listBlock: string): string => {
      const items = listBlock
        .trim()
        .split("\n")
        .map((line) => `<li>${line.replace(/^- /, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
  );

  // Ordered lists
  html = html.replace(
    /(?:^\d+\. .+$\n?)+/gm,
    (listBlock: string): string => {
      const items = listBlock
        .trim()
        .split("\n")
        .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
        .join("");
      return `<ol>${items}</ol>`;
    }
  );

  // Paragraphs: wrap remaining non-empty, non-HTML lines
  html = html
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return "";
      if (/^<[a-z/]/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");

  // Clean up extra blank lines
  html = html.replace(/\n{3,}/g, "\n\n");

  return html;
}

export function MarkdownRenderer({ markdown }: MarkdownRendererProps) {
  const parts = splitBySpecialBlocks(markdown);

  // No special blocks — fast path (identical to previous behavior)
  if (parts.length === 1 && parts[0].type === "text") {
    const html = convertMarkdownToHtml(parts[0].content);
    return (
      <div
        className="fsd-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Mixed content — render text as HTML, mermaid as diagrams, bpmn as BPMN
  return (
    <div className="fsd-preview">
      {parts.map((part, i) => {
        if (part.type === "mermaid") {
          return <MermaidDiagram key={`mermaid-${i}`} chart={part.content} />;
        }
        if (part.type === "bpmn") {
          try {
            const data = JSON.parse(part.content) as BpmnProcessDiagram;
            if (data.nodes?.length && data.lanes?.length) {
              return <BpmnDiagram key={`bpmn-${i}`} data={data} />;
            }
          } catch {
            // If JSON parsing fails, show as code block
            return (
              <pre key={`bpmn-err-${i}`} className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                {part.content}
              </pre>
            );
          }
        }
        const html = convertMarkdownToHtml(part.content);
        return (
          <div
            key={`text-${i}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
