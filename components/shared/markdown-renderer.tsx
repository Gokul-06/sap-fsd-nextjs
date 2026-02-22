"use client";

interface MarkdownRendererProps {
  markdown: string;
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
  const html = convertMarkdownToHtml(markdown);

  return (
    <div
      className="fsd-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
