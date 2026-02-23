/**
 * Claude AI Integration for FSD Generation
 * Calls Anthropic API to generate intelligent narrative content
 * for FSD sections that require contextual writing.
 * Supports feedback context, few-shot examples, and multi-language output.
 */

import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not set in environment');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function isAIEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function callClaude(prompt: string, maxTokens: number = 2048): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type === 'text') {
    return block.text;
  }
  return '';
}

/** Append extra context (feedback rules + few-shot) to a prompt if available */
function withExtraContext(prompt: string, extraContext?: string): string {
  if (!extraContext?.trim()) return prompt;
  return `${prompt}\n\n${extraContext}`;
}

/** Build a depth instruction to inject into AI prompts */
function buildDepthInstruction(depth: "standard" | "comprehensive"): string {
  if (depth !== "comprehensive") return "";
  return `\nDOCUMENT DEPTH: COMPREHENSIVE MODE
- Produce significantly more detailed content than a standard FSD
- Include more rows in every markdown table (8-12 rows instead of 4-6)
- Write longer narrative paragraphs with deeper SAP-specific technical detail
- Cover more edge cases, exception flows, and alternative scenarios
- Include detailed SAP configuration steps (IMG path, field-level settings)
- Add more validation rules, error scenarios, and test cases
- Reference specific BAPI/RFC function modules, enhancement points, and BAdIs
- Include data volume considerations and performance notes\n`;
}

/** Build a language instruction to inject into AI prompts */
function buildLanguageInstruction(language: string): string {
  if (!language || language === "English") return "";
  return `\nIMPORTANT LANGUAGE REQUIREMENT: Write ALL narrative content, descriptions, paragraphs, and bullet points in ${language}. However, keep the following in English:
- SAP technical terms (transaction codes like ME21N, table names like EKKO, Fiori app names)
- Column headers in markdown tables
- Abbreviations and acronyms (BRD, FSD, SoD, MoSCoW, BAPI, RFC, IDoc, etc.)
- Section numbering format (e.g., "### 4.1", "### 4.2")
All descriptive and business-context text must be written in ${language}.\n`;
}

// ─────────────────────────────────────────────
// Section Generators — Each returns markdown
// ─────────────────────────────────────────────

export async function aiExecutiveSummary(
  title: string,
  module: string,
  requirements: string,
  processArea: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const wordLimit = depth === "comprehensive" ? 400 : 200;
  const prompt = `You are a senior SAP functional consultant at a top consulting firm. Write a professional executive summary for a Functional Specification Document (FSD).
${langInstruction}${depthInstruction}
Title: ${title}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

Write ${depth === "comprehensive" ? "4-5" : "2-3"} concise paragraphs covering:
1. Purpose of this specification document
2. Scope — what business processes are covered
3. Expected business benefits and outcomes${depth === "comprehensive" ? "\n4. Key stakeholders and organizational impact\n5. Success criteria and KPIs" : ""}

Rules:
- Be specific to SAP ${module} and the ${processArea} process
- Use professional consulting language
- Do NOT use markdown headers — just plain paragraphs
- Keep it under ${wordLimit} words`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

export async function aiProposedSolution(
  module: string,
  requirements: string,
  processArea: string,
  tables: string[],
  tcodes: string[],
  fioriApps: string[],
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are a senior SAP ${module} solution architect. Design the proposed solution for this FSD.
${langInstruction}${depthInstruction}
Requirements: ${requirements}
Process Area: ${processArea}
Available SAP Tables: ${tables.slice(0, 15).join(', ') || 'Standard ' + module + ' tables'}
Key Transactions: ${tcodes.slice(0, 15).join(', ') || 'Standard ' + module + ' transactions'}
Fiori Apps: ${fioriApps.slice(0, 8).join(', ') || 'Standard ' + module + ' Fiori apps'}

Write the following in markdown format:

### 4.1 Solution Overview
A ${depth === "comprehensive" ? "4-5" : "2-3"} sentence overview of the solution approach.

### 4.2 To-Be Process Flow
A numbered step-by-step process flow (${depth === "comprehensive" ? "12-18" : "8-12"} steps) showing the end-to-end process. Include the SAP transaction or Fiori app used at each step.

### 4.3 Key Design Decisions
A markdown table with columns: Decision | Option Chosen | Rationale
Include ${depth === "comprehensive" ? "8-10" : "4-6"} design decisions specific to this process.

Rules:
- Be specific to SAP ${module}
- Reference actual tcodes and Fiori apps from the list above
- Keep it practical and implementable`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

export async function aiOutputManagement(
  module: string,
  processArea: string,
  requirements: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are an SAP ${module} consultant. Define the output management requirements for this FSD.
${langInstruction}${depthInstruction}
Process Area: ${processArea}
Requirements: ${requirements}

Write in markdown format:

### 9.1 Output Types
A markdown table with columns: Output Type | Description | Format | Trigger | Recipient
Include ${depth === "comprehensive" ? "8-10" : "4-6"} output types relevant to the ${processArea} process.

### 9.2 Email Notifications & Workflows
A markdown table with columns: Notification | Trigger Event | Recipients | Template
Include ${depth === "comprehensive" ? "6-8" : "3-5"} workflow notifications.

Rules:
- Be specific to SAP ${module} ${processArea}
- Include both printed outputs and email/workflow notifications
- Reference SAP output types where applicable`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

export async function aiErrorHandling(
  module: string,
  processArea: string,
  requirements: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are an SAP ${module} consultant. Define error handling and validations for this FSD.
${langInstruction}${depthInstruction}
Process Area: ${processArea}
Requirements: ${requirements}

Write in markdown format:

### 10.1 Input Validations
A markdown table with columns: Field/Check | Validation Rule | Error Message | Severity
Include ${depth === "comprehensive" ? "10-14" : "6-8"} specific input validations for the ${processArea} process.

### 10.2 Business Rule Validations
A markdown table with columns: Rule ID | Business Rule | Action on Failure | Resolution
Include ${depth === "comprehensive" ? "8-12" : "5-7"} business rules (tolerance checks, approval limits, duplicate checks, etc.).

### 10.3 Error Scenarios
A markdown table with columns: Scenario | Root Cause | System Behavior | User Action
Include ${depth === "comprehensive" ? "8-10" : "4-6"} common error scenarios.

Rules:
- Be specific to SAP ${module} ${processArea}
- Include realistic error messages
- Reference SAP message classes where possible`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

export async function aiDataMigration(
  module: string,
  processArea: string,
  tables: string[],
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are an SAP ${module} data migration specialist. Define the data migration plan for this FSD.
${langInstruction}${depthInstruction}
Process Area: ${processArea}
Key Tables: ${tables.slice(0, 15).join(', ') || 'Standard ' + module + ' tables'}

Write in markdown format:

### 11.1 Migration Objects
A markdown table with columns: Object | Source | Target Table(s) | Migration Tool | Priority
Include ${depth === "comprehensive" ? "10-14" : "5-8"} migration objects split into master data and transactional data.

### 11.2 Migration Approach
Describe the migration approach in ${depth === "comprehensive" ? "8-10" : "4-6"} bullet points covering:
- Tool selection (LTMC, LSMW, BAPIs, custom programs)
- Data cleansing rules
- Validation and reconciliation approach
- Sequence and dependencies
- Cutover timing${depth === "comprehensive" ? "\n- Data volume estimates and performance considerations\n- Parallel vs sequential loading strategy\n- Rollback procedures for each migration object" : ""}

Rules:
- Be specific to SAP ${module}
- Reference actual migration tools available in S/4HANA
- Include realistic dependencies between objects`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

export async function aiCutoverPlan(
  module: string,
  processArea: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are an SAP ${module} cutover manager. Define the cutover and go-live plan for this FSD.
${langInstruction}${depthInstruction}
Process Area: ${processArea}

Write in markdown format:

### 13.1 Cutover Tasks
A markdown table with columns: # | Task | Owner | Duration | Dependencies | Status
Include ${depth === "comprehensive" ? "16-20" : "10-14"} cutover tasks in chronological order (transport, data freeze, migration, validation, go/no-go, etc.).

### 13.2 Rollback Plan
Describe the rollback plan in ${depth === "comprehensive" ? "6-8" : "4-5"} bullet points covering:
- Rollback trigger criteria
- Rollback procedure steps
- Data restoration approach
- Communication plan${depth === "comprehensive" ? "\n- Point-of-no-return definition\n- Parallel run considerations" : ""}

Rules:
- Be specific to SAP ${module} ${processArea}
- Include realistic timeframes
- Cover both technical and business cutover activities`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

// ─────────────────────────────────────────────
// Process Flow Diagram Generator (Mermaid)
// ─────────────────────────────────────────────

export async function aiProcessFlowDiagram(
  module: string,
  requirements: string,
  processArea: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const nodeCount = depth === "comprehensive" ? "12-18" : "8-12";
  const prompt = `You are an SAP ${module} process analyst. Generate a Mermaid.js process flow diagram for this business process.
${langInstruction}${depthInstruction}
Process Area: ${processArea}
Requirements: ${requirements}

Generate a Mermaid flowchart using \`graph TD\` (top-down) syntax with ${nodeCount} nodes.

Rules:
- Use graph TD direction
- Include SAP transaction codes in node labels where applicable (e.g., "Create PO\\n(ME21N)")
- Use proper Mermaid syntax: A[text] for rectangles, B{text} for decisions, C((text)) for circles
- Include at least 2 decision points with Yes/No branches
- Start with a trigger event and end with a completion state
- Use descriptive but concise labels
- Do NOT add any text before or after the mermaid code block
- Return ONLY the mermaid code wrapped in triple backticks with mermaid language tag

Example format:
\`\`\`mermaid
graph TD
    A[Start: Requirement Identified] --> B[Create Purchase Requisition\\n(ME51N)]
    B --> C{Approval Required?}
    C -->|Yes| D[Approve PR\\n(ME54N)]
    C -->|No| E[Convert to PO]
    D --> E[Create Purchase Order\\n(ME21N)]
    E --> F[End: PO Created]
\`\`\``;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}
