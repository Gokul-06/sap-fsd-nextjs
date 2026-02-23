/**
 * Word Document Generator for SAP FSD
 * Generates professional .docx files with company branding
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
  PageBreak,
  Header,
  Footer,
  ImageRun,
  TableOfContents,
  ShadingType,
  PageNumber,
  NumberFormat,
  LevelFormat,
} from "docx";

export interface WordFSDInput {
  title: string;
  projectName: string;
  author: string;
  module: string;
  relatedModules: string[];
  processArea: string;
  date: string;
  companyName?: string;
  language?: string;
  logoBuffer?: Buffer;
  sections: ParsedSection[];
}

export interface ParsedSection {
  level: number; // 1 = H1, 2 = H2, 3 = H3
  title: string;
  description?: string;
  content?: string;
  table?: ParsedTable;
}

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

// Color palette
const COLORS = {
  primary: "1B365D",      // Dark navy
  secondary: "2E86AB",    // SAP-inspired blue
  accent: "E8491D",       // SAP orange
  headerBg: "1B365D",     // Dark navy for table headers
  headerText: "FFFFFF",   // White text on headers
  altRowBg: "F2F6FA",     // Light blue alternating rows
  text: "333333",         // Dark grey body text
  lightGrey: "999999",    // For subtle text
  border: "CCCCCC",       // Table borders
  white: "FFFFFF",
};

/**
 * Parse the generated FSD markdown into structured sections
 */
export function parseMarkdownToSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split("\n");

  let currentSection: ParsedSection | null = null;
  let contentBuffer: string[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let tableSeparatorSeen = false;

  const flushContent = () => {
    if (currentSection) {
      if (inTable && tableHeaders.length > 0) {
        currentSection.table = { headers: tableHeaders, rows: tableRows };
        inTable = false;
        tableHeaders = [];
        tableRows = [];
        tableSeparatorSeen = false;
      }
      if (contentBuffer.length > 0) {
        currentSection.content = contentBuffer.join("\n").trim();
        contentBuffer = [];
      }
      sections.push(currentSection);
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect headings
    if (trimmed.startsWith("# ") && !trimmed.startsWith("# Functional")) {
      flushContent();
      currentSection = { level: 1, title: trimmed.replace(/^# /, "") };
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushContent();
      currentSection = { level: 2, title: trimmed.replace(/^## /, "") };
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushContent();
      currentSection = { level: 3, title: trimmed.replace(/^### /, "") };
      continue;
    }

    // Detect block quote descriptions
    if (trimmed.startsWith("> ") && currentSection && !currentSection.description) {
      currentSection.description = trimmed.replace(/^> /, "");
      continue;
    }

    // Detect tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());

      // Check if this is a separator row
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        tableSeparatorSeen = true;
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        tableRows = [];
        tableSeparatorSeen = false;
      } else if (tableSeparatorSeen) {
        tableRows.push(cells);
      }
      continue;
    }

    // If we were in a table and hit a non-table line, flush the table
    if (inTable && !trimmed.startsWith("|")) {
      if (currentSection && tableHeaders.length > 0) {
        currentSection.table = { headers: tableHeaders, rows: tableRows };
      }
      inTable = false;
      tableHeaders = [];
      tableRows = [];
      tableSeparatorSeen = false;
    }

    // Skip empty lines, code fences, and the title block
    if (trimmed === "" || trimmed === "---" || trimmed.startsWith("```")) {
      continue;
    }

    // Skip the header metadata block
    if (
      trimmed.startsWith("**Project:**") ||
      trimmed.startsWith("**SAP Module:**") ||
      trimmed.startsWith("**Related Modules:**") ||
      trimmed.startsWith("**Process Area:**") ||
      trimmed.startsWith("**Document Status:**") ||
      trimmed.startsWith("**Created:**") ||
      trimmed.startsWith("**Author:**")
    ) {
      continue;
    }

    // Regular content
    if (currentSection) {
      contentBuffer.push(trimmed);
    }
  }

  flushContent();
  return sections;
}

/**
 * Generate a professional Word document from parsed FSD sections
 */
export async function generateWordDocument(input: WordFSDInput): Promise<Buffer> {
  const children: (Paragraph | Table | TableOfContents)[] = [];

  // --- COVER PAGE ---
  children.push(new Paragraph({ spacing: { after: 4000 } }));

  // Company logo
  if (input.logoBuffer) {
    try {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: input.logoBuffer,
              transformation: { width: 200, height: 80 },
              type: "png",
            }),
          ],
          spacing: { after: 600 },
        })
      );
    } catch {
      // Logo loading failed, skip
    }
  }

  // Company name
  if (input.companyName) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: input.companyName,
            size: 28,
            color: COLORS.lightGrey,
            font: "Calibri",
          }),
        ],
        spacing: { after: 800 },
      })
    );
  }

  // Document title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Functional Specification Document",
          size: 48,
          bold: true,
          color: COLORS.primary,
          font: "Calibri",
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // FSD Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: input.title,
          size: 36,
          color: COLORS.secondary,
          font: "Calibri",
        }),
      ],
      spacing: { after: 800 },
    })
  );

  // Accent line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          size: 24,
          color: COLORS.accent,
        }),
      ],
      spacing: { after: 800 },
    })
  );

  // Metadata table on cover page
  const metaRows = [
    ["Project", input.projectName],
    ["SAP Module", input.module],
    ["Related Modules", input.relatedModules.join(", ")],
    ["Process Area", input.processArea],
    ["Language", input.language || "English"],
    ["Document Status", "DRAFT"],
    ["Created", input.date],
    ["Author", input.author],
  ];

  children.push(
    new Table({
      width: { size: 60, type: WidthType.PERCENTAGE },
      rows: metaRows.map(
        ([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 30, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: label,
                        bold: true,
                        size: 22,
                        color: COLORS.primary,
                        font: "Calibri",
                      }),
                    ],
                    spacing: { before: 80, after: 80 },
                  }),
                ],
                borders: noBorders(),
                shading: { type: ShadingType.SOLID, color: COLORS.altRowBg },
              }),
              new TableCell({
                width: { size: 70, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: value,
                        size: 22,
                        color: COLORS.text,
                        font: "Calibri",
                      }),
                    ],
                    spacing: { before: 80, after: 80 },
                  }),
                ],
                borders: noBorders(),
              }),
            ],
          })
      ),
    })
  );

  // Page break after cover
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // --- TABLE OF CONTENTS ---
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: "Table of Contents",
          bold: true,
          size: 32,
          color: COLORS.primary,
          font: "Calibri",
        }),
      ],
      spacing: { after: 400 },
    })
  );

  children.push(
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    })
  );

  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // --- MAIN CONTENT ---
  for (const section of input.sections) {
    const headingLevel =
      section.level === 1
        ? HeadingLevel.HEADING_1
        : section.level === 2
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3;

    const fontSize = section.level === 1 ? 32 : section.level === 2 ? 28 : 24;

    // Section heading
    children.push(
      new Paragraph({
        heading: headingLevel,
        children: [
          new TextRun({
            text: section.title,
            bold: true,
            size: fontSize,
            color: COLORS.primary,
            font: "Calibri",
          }),
        ],
        spacing: {
          before: section.level === 2 ? 400 : 200,
          after: 200,
        },
      })
    );

    // Section description (italic)
    if (section.description) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.description,
              italics: true,
              size: 20,
              color: COLORS.lightGrey,
              font: "Calibri",
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Table content
    if (section.table && section.table.headers.length > 0) {
      const table = createStyledTable(section.table);
      children.push(table);
      children.push(new Paragraph({ spacing: { after: 200 } }));
    }

    // Text content
    if (section.content) {
      const contentLines = section.content.split("\n");
      for (const line of contentLines) {
        if (line.trim()) {
          // Handle list items
          if (line.startsWith("- ") || line.startsWith("* ")) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "  \u2022  " + line.replace(/^[-*] /, ""),
                    size: 22,
                    color: COLORS.text,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 40, after: 40 },
              })
            );
          } else if (/^\d+\. /.test(line)) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: "  " + line,
                    size: 22,
                    color: COLORS.text,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 40, after: 40 },
              })
            );
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                    color: COLORS.text,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 80, after: 80 },
              })
            );
          }
        }
      }
    }
  }

  // --- BUILD DOCUMENT ---
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
            color: COLORS.text,
          },
        },
        heading1: {
          run: {
            font: "Calibri",
            size: 32,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: { before: 400, after: 200 },
          },
        },
        heading2: {
          run: {
            font: "Calibri",
            size: 28,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: { before: 300, after: 150 },
          },
        },
        heading3: {
          run: {
            font: "Calibri",
            size: 24,
            bold: true,
            color: COLORS.secondary,
          },
          paragraph: {
            spacing: { before: 200, after: 100 },
          },
        },
      },
    },
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: AlignmentType.LEFT,
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
            pageNumbers: {
              start: 1,
              formatType: NumberFormat.DECIMAL,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${input.companyName || ""} | ${input.title}`,
                    size: 16,
                    color: COLORS.lightGrey,
                    font: "Calibri",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "CONFIDENTIAL | ",
                    size: 16,
                    color: COLORS.lightGrey,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLORS.lightGrey,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

// --- Helper Functions ---

function createStyledTable(tableData: ParsedTable): Table {
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      tableHeader: true,
      children: tableData.headers.map(
        (header) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: header,
                    bold: true,
                    size: 20,
                    color: COLORS.headerText,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 60, after: 60 },
              }),
            ],
            shading: {
              type: ShadingType.SOLID,
              color: COLORS.headerBg,
            },
            borders: tableBorders(),
          })
      ),
    })
  );

  // Data rows with alternating shading
  tableData.rows.forEach((row, rowIndex) => {
    rows.push(
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell || " ",
                      size: 20,
                      color: COLORS.text,
                      font: "Calibri",
                    }),
                  ],
                  spacing: { before: 40, after: 40 },
                }),
              ],
              shading:
                rowIndex % 2 === 1
                  ? { type: ShadingType.SOLID, color: COLORS.altRowBg }
                  : undefined,
              borders: tableBorders(),
            })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

function tableBorders() {
  const border = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: COLORS.border,
  };
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
  };
}

function noBorders() {
  const none = { style: BorderStyle.NONE, size: 0, color: COLORS.white };
  return { top: none, bottom: none, left: none, right: none };
}
