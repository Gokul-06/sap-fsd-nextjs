/**
 * Claude AI Integration for FSD Generation
 * Calls Anthropic API to generate intelligent narrative content
 * for FSD sections that require contextual writing.
 * Supports feedback context, few-shot examples, and multi-language output.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { TeamLeadContext } from '@/lib/types';

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

// ─────────────────────────────────────────────
// Agent Teams Functions
// ─────────────────────────────────────────────

/** Serialize TeamLeadContext into a text brief for specialist agents */
export function serializeTeamLeadContext(ctx: TeamLeadContext): string {
  const glossaryStr = Object.entries(ctx.terminologyGlossary)
    .map(([k, v]) => `  - "${k}" → ${v}`)
    .join("\n");

  return `=== TEAM LEAD BRIEF ===
MODULE STRATEGY: ${ctx.moduleStrategy}

PROCESS STEPS:
${ctx.processSteps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

DESIGN DECISIONS:
${ctx.designDecisions.map((d) => `  - ${d}`).join("\n")}

TERMINOLOGY (use these exact terms consistently):
${glossaryStr || "  (none specified)"}

RISK AREAS:
${ctx.riskAreas.map((r) => `  - ${r}`).join("\n")}

CROSS-MODULE CONSIDERATIONS: ${ctx.crossModuleConsiderations}

KEY STAKEHOLDERS: ${ctx.keyStakeholders.join(", ")}

SCOPE BOUNDARIES: ${ctx.scopeBoundaries}
=== END BRIEF ===`;
}

/**
 * Phase 1: Team Lead Analysis
 * Deeply analyzes requirements and produces a structured shared brief.
 */
export async function aiTeamLeadAnalysis(
  module: string,
  requirements: string,
  processArea: string,
  tables: string[],
  tcodes: string[],
  fioriApps: string[],
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<TeamLeadContext> {
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are a Senior SAP Program Manager leading a team of 4 specialist consultants who will collaboratively write a Functional Specification Document (FSD). Your job is to deeply analyze the business requirements and create a comprehensive brief that all specialists will reference to ensure consistency.
${depthInstruction}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements:
${requirements}

Available SAP Tables: ${tables.slice(0, 20).join(", ") || "Standard " + module + " tables"}
Key Transactions: ${tcodes.slice(0, 20).join(", ") || "Standard " + module + " transactions"}
Fiori Apps: ${fioriApps.slice(0, 10).join(", ") || "Standard " + module + " Fiori apps"}

Analyze the requirements deeply and produce a JSON object with exactly these fields:
- "moduleStrategy": (2-3 sentences) Why this module is primary, which related modules matter, and the high-level implementation approach
- "processSteps": (array of ${depth === "comprehensive" ? "12-18" : "8-12"} strings) Key end-to-end process steps in order, each starting with a verb
- "designDecisions": (array of ${depth === "comprehensive" ? "6-10" : "4-8"} strings) Key design choices you recommend and why
- "terminologyGlossary": (object with 6-10 entries) Canonical SAP terms to use consistently, e.g. {"purchase order": "Purchase Order (PO)", "vendor": "Business Partner (Vendor)"}
- "riskAreas": (array of ${depth === "comprehensive" ? "5-8" : "3-6"} strings) Risks and concerns identified from the requirements
- "crossModuleConsiderations": (2-3 sentences) How this process interacts with other SAP modules
- "keyStakeholders": (array of 3-6 strings) Stakeholder groups affected by this implementation
- "scopeBoundaries": (2-3 sentences) What is in scope and what is explicitly out of scope

Return ONLY a valid JSON code block. No text before or after it.

\`\`\`json
{
  "moduleStrategy": "...",
  "processSteps": [...],
  "designDecisions": [...],
  "terminologyGlossary": {...},
  "riskAreas": [...],
  "crossModuleConsiderations": "...",
  "keyStakeholders": [...],
  "scopeBoundaries": "..."
}
\`\`\``;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  const raw = await callClaude(withExtraContext(prompt, extraContext), maxTokens);

  try {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();
    const parsed = JSON.parse(jsonStr);
    return {
      moduleStrategy: parsed.moduleStrategy || "",
      processSteps: Array.isArray(parsed.processSteps) ? parsed.processSteps : [],
      designDecisions: Array.isArray(parsed.designDecisions) ? parsed.designDecisions : [],
      terminologyGlossary: typeof parsed.terminologyGlossary === "object" ? parsed.terminologyGlossary : {},
      riskAreas: Array.isArray(parsed.riskAreas) ? parsed.riskAreas : [],
      crossModuleConsiderations: parsed.crossModuleConsiderations || "",
      keyStakeholders: Array.isArray(parsed.keyStakeholders) ? parsed.keyStakeholders : [],
      scopeBoundaries: parsed.scopeBoundaries || "",
    };
  } catch {
    return {
      moduleStrategy: `${module} implementation for ${processArea} process.`,
      processSteps: ["Analyze requirements", "Design solution", "Configure system", "Test and validate", "Go-live"],
      designDecisions: ["Use standard SAP functionality where possible", "Minimize custom development"],
      terminologyGlossary: {},
      riskAreas: ["Requirements may need further clarification"],
      crossModuleConsiderations: "Standard cross-module integrations apply.",
      keyStakeholders: ["Business Users", "IT Team", "Management"],
      scopeBoundaries: "Scope as defined in the business requirements.",
    };
  }
}

/**
 * Phase 2 Specialist: Business Analyst
 * Produces Executive Summary using the Team Lead's shared brief.
 */
export async function aiBusinessAnalyst(
  title: string,
  module: string,
  requirements: string,
  processArea: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
  teamLeadBrief: string = "",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const wordLimit = depth === "comprehensive" ? 500 : 250;
  const prompt = `You are a Senior SAP Business Analyst on an Agent Team writing a Functional Specification Document. Your Team Lead has analyzed the requirements and provided a brief below. You MUST align your output with the Team Lead's analysis — use the same terminology, reference the same process steps, and follow the design decisions.

${teamLeadBrief}

${langInstruction}${depthInstruction}
Title: ${title}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

YOUR TASK: Write a professional executive summary (Section 2) for this FSD.

Write ${depth === "comprehensive" ? "4-5" : "2-3"} concise paragraphs covering:
1. Purpose of this specification document
2. Scope — what business processes are covered (reference the Team Lead's process steps)
3. Expected business benefits and outcomes
${depth === "comprehensive" ? "4. Key stakeholders and organizational impact (reference the Team Lead's stakeholders)\n5. Success criteria and KPIs" : ""}

Rules:
- Be specific to SAP ${module} and the ${processArea} process
- Use the EXACT terminology from the Team Lead's glossary
- Reference risks identified by the Team Lead where relevant
- Use professional consulting language
- Do NOT use markdown headers — just plain paragraphs
- Keep it under ${wordLimit} words`;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

/**
 * Phase 2 Specialist: Solution Architect
 * Produces Proposed Solution (4.1-4.3) + Process Flow Diagram (4.4).
 */
export async function aiSolutionArchitect(
  module: string,
  requirements: string,
  processArea: string,
  tables: string[],
  tcodes: string[],
  fioriApps: string[],
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
  teamLeadBrief: string = "",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const nodeCount = depth === "comprehensive" ? "12-18" : "8-12";
  const prompt = `You are a Senior SAP ${module} Solution Architect on an Agent Team writing a Functional Specification Document. Your Team Lead has analyzed the requirements and provided a brief below. You MUST align your solution with the Team Lead's process steps and design decisions.

${teamLeadBrief}

${langInstruction}${depthInstruction}
Requirements: ${requirements}
Process Area: ${processArea}
Available SAP Tables: ${tables.slice(0, 15).join(", ") || "Standard " + module + " tables"}
Key Transactions: ${tcodes.slice(0, 15).join(", ") || "Standard " + module + " transactions"}
Fiori Apps: ${fioriApps.slice(0, 8).join(", ") || "Standard " + module + " Fiori apps"}

YOUR TASK: Write the Proposed Solution section AND a process flow diagram.

Write the following in markdown format:

### 4.1 Solution Overview
A ${depth === "comprehensive" ? "4-5" : "2-3"} sentence overview referencing the Team Lead's module strategy.

### 4.2 To-Be Process Flow
A numbered step-by-step process flow (${depth === "comprehensive" ? "12-18" : "8-12"} steps). These MUST match the Team Lead's process steps. Include the SAP transaction or Fiori app used at each step.

### 4.3 Key Design Decisions
A markdown table with columns: Decision | Option Chosen | Rationale
Include ${depth === "comprehensive" ? "8-10" : "4-6"} design decisions aligned with the Team Lead's decisions.

### 4.4 Process Flow Diagram

Generate a Mermaid flowchart with ${nodeCount} nodes based on the Team Lead's process steps.

Rules for the Mermaid diagram:
- Use graph TD direction
- Include SAP transaction codes in node labels (e.g., "Create PO\\n(ME21N)")
- Use proper Mermaid syntax: A[text] for rectangles, B{text} for decisions
- Include at least 2 decision points with Yes/No branches
- Wrap the diagram in triple backticks with mermaid language tag

Rules:
- Be specific to SAP ${module}
- Use the EXACT terminology from the Team Lead's glossary
- Reference actual tcodes and Fiori apps from the list above`;

  const maxTokens = depth === "comprehensive" ? 6144 : 4096;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

/**
 * Phase 2 Specialist: Technical Consultant
 * Produces Error Handling (Section 10) + Output Management (Section 9).
 */
export async function aiTechnicalConsultant(
  module: string,
  processArea: string,
  requirements: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
  teamLeadBrief: string = "",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are a Senior SAP ${module} Technical Consultant on an Agent Team. Your Team Lead has provided a brief below. Align your specifications with the Team Lead's process steps, design decisions, and risk areas.

${teamLeadBrief}

${langInstruction}${depthInstruction}
Process Area: ${processArea}
Requirements: ${requirements}

YOUR TASK: Write TWO sections separated by markers.

=== OUTPUT MANAGEMENT ===

### 9.1 Output Types
A markdown table with columns: Output Type | Description | Format | Trigger | Recipient
Include ${depth === "comprehensive" ? "8-10" : "4-6"} output types relevant to ${processArea}.

### 9.2 Email Notifications & Workflows
A markdown table with columns: Notification | Trigger Event | Recipients | Template
Include ${depth === "comprehensive" ? "6-8" : "3-5"} workflow notifications.

=== ERROR HANDLING ===

### 10.1 Input Validations
A markdown table with columns: Field/Check | Validation Rule | Error Message | Severity
Include ${depth === "comprehensive" ? "10-14" : "6-8"} validations. Address the Team Lead's risk areas.

### 10.2 Business Rule Validations
A markdown table with columns: Rule ID | Business Rule | Action on Failure | Resolution
Include ${depth === "comprehensive" ? "8-12" : "5-7"} business rules.

### 10.3 Error Scenarios
A markdown table with columns: Scenario | Root Cause | System Behavior | User Action
Include ${depth === "comprehensive" ? "8-10" : "4-6"} error scenarios.

Rules:
- Be specific to SAP ${module} ${processArea}
- Use the EXACT terminology from the Team Lead's glossary
- Include realistic SAP error messages`;

  const maxTokens = depth === "comprehensive" ? 6144 : 4096;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

/**
 * Phase 2 Specialist: Project Manager
 * Produces Data Migration (Section 11) + Cutover Plan (Section 13).
 */
export async function aiProjectManager(
  module: string,
  processArea: string,
  tables: string[],
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
  teamLeadBrief: string = "",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const prompt = `You are a Senior SAP ${module} Project Manager on an Agent Team. Your Team Lead has provided a brief below. Align your plans with the Team Lead's process steps, risk areas, and scope boundaries.

${teamLeadBrief}

${langInstruction}${depthInstruction}
Process Area: ${processArea}
Key Tables: ${tables.slice(0, 15).join(", ") || "Standard " + module + " tables"}

YOUR TASK: Write TWO sections separated by markers.

=== DATA MIGRATION ===

### 11.1 Migration Objects
A markdown table with columns: Object | Source | Target Table(s) | Migration Tool | Priority
Include ${depth === "comprehensive" ? "10-14" : "5-8"} migration objects.

### 11.2 Migration Approach
${depth === "comprehensive" ? "8-10" : "4-6"} bullet points covering tool selection, data cleansing, validation, sequence, cutover timing${depth === "comprehensive" ? ", volume estimates, rollback procedures" : ""}.

=== CUTOVER PLAN ===

### 13.1 Cutover Tasks
A markdown table with columns: # | Task | Owner | Duration | Dependencies | Status
Include ${depth === "comprehensive" ? "16-20" : "10-14"} cutover tasks in chronological order.

### 13.2 Rollback Plan
${depth === "comprehensive" ? "6-8" : "4-5"} bullet points covering rollback trigger criteria, procedures, data restoration, communication${depth === "comprehensive" ? ", point-of-no-return, parallel run" : ""}.

Rules:
- Be specific to SAP ${module} ${processArea}
- Use the EXACT terminology from the Team Lead's glossary
- Address the Team Lead's risk areas
- Include realistic timeframes`;

  const maxTokens = depth === "comprehensive" ? 6144 : 4096;
  return await callClaude(withExtraContext(prompt, extraContext), maxTokens);
}

/**
 * Phase 3: Quality Reviewer
 * Reads ALL specialist outputs, checks consistency, returns corrected versions.
 */
export async function aiQualityReviewer(
  module: string,
  processArea: string,
  language: string = "English",
  depth: "standard" | "comprehensive" = "standard",
  specialistOutputs: {
    businessAnalyst: string;
    solutionArchitect: string;
    technicalConsultant: string;
    projectManager: string;
  },
  teamLeadBrief: string,
): Promise<{
  corrections: string[];
  finalSections: {
    executiveSummary: string;
    proposedSolution: string;
    outputManagement: string;
    errorHandling: string;
    dataMigration: string;
    cutoverPlan: string;
  };
}> {
  const langInstruction = buildLanguageInstruction(language);
  const prompt = `You are a Senior SAP Quality Reviewer. Four specialists wrote sections of an FSD. Review ALL outputs for consistency and alignment with the Team Lead's brief.

${teamLeadBrief}

${langInstruction}

=== BUSINESS ANALYST OUTPUT (Executive Summary) ===
${specialistOutputs.businessAnalyst}

=== SOLUTION ARCHITECT OUTPUT (Proposed Solution + Process Flow) ===
${specialistOutputs.solutionArchitect}

=== TECHNICAL CONSULTANT OUTPUT (Output Management + Error Handling) ===
${specialistOutputs.technicalConsultant}

=== PROJECT MANAGER OUTPUT (Data Migration + Cutover Plan) ===
${specialistOutputs.projectManager}

Review for:
1. TERMINOLOGY consistency across all sections (match Team Lead's glossary)
2. CROSS-REFERENCES correctness (cutover → migration objects, error handling → process steps)
3. CONTRADICTIONS between sections
4. COMPLETENESS (all Team Lead's process steps, decisions, and risks addressed)
5. QUALITY (fix vague statements, add missing SAP details)

Return a JSON code block:
\`\`\`json
{
  "corrections": ["correction 1", "correction 2"],
  "executiveSummary": "corrected executive summary",
  "proposedSolution": "corrected proposed solution (4.1-4.4 including mermaid)",
  "outputManagement": "corrected output management (9.1, 9.2)",
  "errorHandling": "corrected error handling (10.1-10.3)",
  "dataMigration": "corrected data migration (11.1, 11.2)",
  "cutoverPlan": "corrected cutover plan (13.1, 13.2)"
}
\`\`\`

Return COMPLETE corrected text for each section. If a section is good, return it unchanged. Preserve all markdown tables and mermaid diagrams. JSON string values must escape newlines as \\n.`;

  const maxTokens = 8192;
  const raw = await callClaude(withExtraContext(prompt, ""), maxTokens);

  try {
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();
    const parsed = JSON.parse(jsonStr);
    return {
      corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
      finalSections: {
        executiveSummary: parsed.executiveSummary || specialistOutputs.businessAnalyst,
        proposedSolution: parsed.proposedSolution || specialistOutputs.solutionArchitect,
        outputManagement: parsed.outputManagement || extractSection(specialistOutputs.technicalConsultant, "OUTPUT MANAGEMENT"),
        errorHandling: parsed.errorHandling || extractSection(specialistOutputs.technicalConsultant, "ERROR HANDLING"),
        dataMigration: parsed.dataMigration || extractSection(specialistOutputs.projectManager, "DATA MIGRATION"),
        cutoverPlan: parsed.cutoverPlan || extractSection(specialistOutputs.projectManager, "CUTOVER PLAN"),
      },
    };
  } catch {
    // Fallback: use raw specialist outputs
    return {
      corrections: ["Quality review parsing failed — using raw specialist outputs"],
      finalSections: {
        executiveSummary: specialistOutputs.businessAnalyst,
        proposedSolution: specialistOutputs.solutionArchitect,
        outputManagement: extractSection(specialistOutputs.technicalConsultant, "OUTPUT MANAGEMENT"),
        errorHandling: extractSection(specialistOutputs.technicalConsultant, "ERROR HANDLING"),
        dataMigration: extractSection(specialistOutputs.projectManager, "DATA MIGRATION"),
        cutoverPlan: extractSection(specialistOutputs.projectManager, "CUTOVER PLAN"),
      },
    };
  }
}

/** Extract a subsection from combined specialist output using === markers */
function extractSection(combinedOutput: string, sectionName: string): string {
  const marker = `=== ${sectionName} ===`;
  const markerIdx = combinedOutput.indexOf(marker);
  if (markerIdx === -1) return combinedOutput;
  const afterMarker = combinedOutput.substring(markerIdx + marker.length).trim();
  const nextMarkerIdx = afterMarker.indexOf("===");
  if (nextMarkerIdx === -1) return afterMarker;
  return afterMarker.substring(0, nextMarkerIdx).trim();
}
