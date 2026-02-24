/**
 * SOP / User Manual Word Document Generator
 * Matches the Westernacher QRG template format:
 *  - Landscape orientation
 *  - Branded header with logos + metadata table
 *  - Gold (#FFC000) table header rows
 *  - Times New Roman font
 *  - Professional enterprise formatting
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  ImageRun,
  ShadingType,
  PageNumber,
  NumberFormat,
  LevelFormat,
  PageOrientation,
  convertInchesToTwip,
} from "docx";
import * as fs from "fs";
import * as path from "path";

// ─── Types ───────────────────────────────────────

export interface SOPWordInput {
  documentType: "sop" | "manual";
  processName: string;
  moduleName: string;
  author: string;
  markdown: string;
}

interface ParsedSection {
  level: number;
  title: string;
  content?: string;
  table?: { headers: string[]; rows: string[][] };
}

// ─── Colors ──────────────────────────────────────

const COLORS = {
  gold: "FFC000",        // QRG-style gold header
  darkNavy: "1B365D",    // Westernacher navy
  darkText: "333333",
  lightGrey: "999999",
  white: "FFFFFF",
  border: "AAAAAA",
  altRow: "FFF8E1",      // Light gold alternating
  headerBorder: "E0A800",
};

const FONT = "Times New Roman";

// ─── Logo loader ─────────────────────────────────

function loadLogo(filename: string): Buffer | null {
  try {
    const p = path.join(process.cwd(), "lib", "assets", filename);
    return fs.readFileSync(p);
  } catch {
    return null;
  }
}

// ─── Markdown → Sections parser ──────────────────

function parseMarkdown(md: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = md.split("\n");
  let current: ParsedSection | null = null;
  let contentBuf: string[] = [];
  let inTable = false;
  let tHeaders: string[] = [];
  let tRows: string[][] = [];
  let sepSeen = false;

  const flush = () => {
    if (!current) return;
    if (inTable && tHeaders.length > 0) {
      current.table = { headers: tHeaders, rows: tRows };
      inTable = false;
      tHeaders = [];
      tRows = [];
      sepSeen = false;
    }
    if (contentBuf.length > 0) {
      current.content = contentBuf.join("\n").trim();
      contentBuf = [];
    }
    sections.push(current);
  };

  for (const line of lines) {
    const t = line.trim();

    // Headings
    if (t.startsWith("### ")) { flush(); current = { level: 3, title: t.slice(4) }; continue; }
    if (t.startsWith("## "))  { flush(); current = { level: 2, title: t.slice(3) }; continue; }
    if (t.startsWith("# "))   { flush(); current = { level: 1, title: t.slice(2) }; continue; }

    // Bold-only lines as pseudo-headings (SOP format uses **Section**)
    if (/^\*\*[^*]+\*\*$/.test(t)) {
      flush();
      current = { level: 2, title: t.replace(/\*\*/g, "") };
      continue;
    }

    // Tables
    if (t.startsWith("|") && t.endsWith("|")) {
      const cells = t.split("|").slice(1, -1).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) { sepSeen = true; continue; }
      if (!inTable) { inTable = true; tHeaders = cells; tRows = []; sepSeen = false; }
      else if (sepSeen) { tRows.push(cells); }
      continue;
    }

    // End table on non-table line
    if (inTable && !t.startsWith("|")) {
      if (current && tHeaders.length > 0) {
        current.table = { headers: tHeaders, rows: tRows };
      }
      inTable = false; tHeaders = []; tRows = []; sepSeen = false;
    }

    // Skip empty / separator / mermaid
    if (t === "" || t === "---") continue;
    if (t.startsWith("```")) continue;

    // Skip metadata lines at top
    if (t.startsWith("**Document Type:**") || t.startsWith("**Version:**") ||
        t.startsWith("**Author:**") || t.startsWith("**Date:**") ||
        t.startsWith("**SAP Module:**") || t.startsWith("**Process Code:**") ||
        t.startsWith("**Project:**") || t.startsWith("**Related Modules:**") ||
        t.startsWith("**Document Status:**") || t.startsWith("**Created:**") ||
        t.startsWith("**Process Area:**")) continue;

    // Regular content
    if (current) contentBuf.push(t);
  }
  flush();
  return sections;
}

// ─── Table builders ──────────────────────────────

function goldBorder() {
  const b = { style: BorderStyle.SINGLE, size: 1, color: COLORS.headerBorder };
  return { top: b, bottom: b, left: b, right: b };
}

function thinBorder() {
  const b = { style: BorderStyle.SINGLE, size: 1, color: COLORS.border };
  return { top: b, bottom: b, left: b, right: b };
}

function noBorder() {
  const n = { style: BorderStyle.NONE, size: 0, color: COLORS.white };
  return { top: n, bottom: n, left: n, right: n };
}

function buildGoldTable(headers: string[], rows: string[][]): Table {
  const tableRows: TableRow[] = [];

  // Header row with gold background
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(h =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 20, color: COLORS.darkText, font: FONT })],
            spacing: { before: 60, after: 60 },
          })],
          shading: { type: ShadingType.SOLID, color: COLORS.gold },
          borders: goldBorder(),
        })
      ),
    })
  );

  // Data rows with alternating shading
  rows.forEach((row, idx) => {
    tableRows.push(
      new TableRow({
        children: row.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: cell || " ", size: 20, color: COLORS.darkText, font: FONT })],
              spacing: { before: 40, after: 40 },
            })],
            shading: idx % 2 === 1 ? { type: ShadingType.SOLID, color: COLORS.altRow } : undefined,
            borders: thinBorder(),
          })
        ),
      })
    );
  });

  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows });
}

// ─── Parse inline bold/italic in text ────────────

function parseInlineRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Simple regex to handle **bold** and *italic*
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22, font: FONT, color: COLORS.darkText }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, size: 22, font: FONT, color: COLORS.darkText }));
    } else if (part) {
      runs.push(new TextRun({ text: part, size: 22, font: FONT, color: COLORS.darkText }));
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text, size: 22, font: FONT, color: COLORS.darkText })];
}

// ─── Main generator ──────────────────────────────

export async function generateSOPWord(input: SOPWordInput): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];
  const westernacherLogo = loadLogo("westernacher-logo.png");
  const clientLogo = loadLogo("client-logo.png");

  const docTypeLabel = input.documentType === "sop"
    ? "Standard Operating Procedure"
    : "User Manual";

  const today = new Date().toISOString().split("T")[0];

  // ─── Build header with logos + metadata table ───

  const headerChildren: (Paragraph | Table)[] = [];

  // Header table (matching QRG format)
  const headerRows: TableRow[] = [];

  // Row 0: Document type label + Logos
  const logoRuns: (TextRun | ImageRun)[] = [];
  if (westernacherLogo) {
    logoRuns.push(new ImageRun({
      data: westernacherLogo, transformation: { width: 160, height: 45 }, type: "png",
    }));
  }
  logoRuns.push(new TextRun({ text: "   ", size: 20, font: FONT }));
  if (clientLogo) {
    logoRuns.push(new ImageRun({
      data: clientLogo, transformation: { width: 60, height: 45 }, type: "png",
    }));
  }

  headerRows.push(new TableRow({
    children: [
      new TableCell({
        width: { size: 55, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [new TextRun({
            text: docTypeLabel,
            bold: true, size: 28, color: COLORS.darkNavy, font: FONT,
          })],
          spacing: { before: 80, after: 80 },
        })],
        borders: noBorder(),
        columnSpan: 1,
      }),
      new TableCell({
        width: { size: 45, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: logoRuns.length > 0 ? logoRuns : [new TextRun({ text: " ", font: FONT })],
          spacing: { before: 80, after: 80 },
        })],
        borders: noBorder(),
        columnSpan: 2,
      }),
    ],
  }));

  // Row 1: Process
  headerRows.push(new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "Process:", bold: true, size: 20, color: COLORS.darkNavy, font: FONT })],
          spacing: { before: 40, after: 40 },
        })],
        borders: noBorder(),
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: input.processName, size: 20, color: COLORS.darkText, font: FONT })],
          spacing: { before: 40, after: 40 },
        })],
        borders: noBorder(),
        columnSpan: 2,
      }),
    ],
  }));

  // Row 2: Module
  headerRows.push(new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: "SAP Module:", bold: true, size: 20, color: COLORS.darkNavy, font: FONT })],
          spacing: { before: 40, after: 40 },
        })],
        borders: noBorder(),
      }),
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: input.moduleName, size: 20, color: COLORS.darkText, font: FONT })],
          spacing: { before: 40, after: 40 },
        })],
        borders: noBorder(),
        columnSpan: 2,
      }),
    ],
  }));

  // Separator line
  headerRows.push(new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
        borders: { ...noBorder(), bottom: { style: BorderStyle.SINGLE, size: 2, color: COLORS.gold } },
        columnSpan: 3,
      }),
    ],
  }));

  headerChildren.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: headerRows,
  }));

  // ─── Parse markdown and build content ───

  const sections = parseMarkdown(input.markdown);

  for (const section of sections) {
    const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1
      : section.level === 2 ? HeadingLevel.HEADING_2
      : HeadingLevel.HEADING_3;

    const fontSize = section.level === 1 ? 28 : section.level === 2 ? 24 : 22;

    // Section heading
    children.push(new Paragraph({
      heading: headingLevel,
      children: [new TextRun({
        text: section.title,
        bold: true,
        size: fontSize,
        color: COLORS.darkNavy,
        font: FONT,
      })],
      spacing: { before: section.level === 1 ? 400 : 240, after: 120 },
    }));

    // Table
    if (section.table && section.table.headers.length > 0) {
      children.push(buildGoldTable(section.table.headers, section.table.rows));
      children.push(new Paragraph({ spacing: { after: 160 } }));
    }

    // Text content
    if (section.content) {
      for (const line of section.content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: "  \u2022  ", size: 22, font: FONT, color: COLORS.darkText }),
              ...parseInlineRuns(trimmed.replace(/^[-*] /, "")),
            ],
            spacing: { before: 30, after: 30 },
          }));
        } else if (/^\d+\.\s/.test(trimmed)) {
          children.push(new Paragraph({
            children: parseInlineRuns("  " + trimmed),
            spacing: { before: 30, after: 30 },
          }));
        } else {
          children.push(new Paragraph({
            children: parseInlineRuns(trimmed),
            spacing: { before: 60, after: 60 },
          }));
        }
      }
    }
  }

  // ─── Build document ───

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 22, color: COLORS.darkText },
        },
        heading1: {
          run: { font: FONT, size: 28, bold: true, color: COLORS.darkNavy },
          paragraph: { spacing: { before: 400, after: 120 } },
        },
        heading2: {
          run: { font: FONT, size: 24, bold: true, color: COLORS.darkNavy },
          paragraph: { spacing: { before: 240, after: 100 } },
        },
        heading3: {
          run: { font: FONT, size: 22, bold: true, color: COLORS.darkNavy },
          paragraph: { spacing: { before: 160, after: 80 } },
        },
      },
    },
    numbering: {
      config: [{
        reference: "default-numbering",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: {
            orientation: PageOrientation.LANDSCAPE,
            width: convertInchesToTwip(11),
            height: convertInchesToTwip(8.5),
          },
          margin: {
            top: convertInchesToTwip(1.2),   // Extra space for header
            right: convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.7),
            left: convertInchesToTwip(0.8),
          },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({ children: headerChildren }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "CONFIDENTIAL  |  ", size: 16, color: COLORS.lightGrey, font: FONT }),
                new TextRun({ text: `${docTypeLabel} — ${input.processName}`, size: 16, color: COLORS.lightGrey, font: FONT, italics: true }),
                new TextRun({ text: "  |  Page ", size: 16, color: COLORS.lightGrey, font: FONT }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLORS.lightGrey, font: FONT }),
                new TextRun({ text: " of ", size: 16, color: COLORS.lightGrey, font: FONT }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLORS.lightGrey, font: FONT }),
              ],
            }),
          ],
        }),
      },
      children,
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
