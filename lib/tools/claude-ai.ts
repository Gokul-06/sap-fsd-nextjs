/**
 * Claude AI Integration for FSD Generation
 * Calls Anthropic API to generate intelligent narrative content
 * for FSD sections that require contextual writing.
 * Supports feedback context, few-shot examples, and multi-language output.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { TeamLeadContext, FsdType } from '@/lib/types';
import { prisma } from '@/lib/db';
import type { AgentRole } from '@/lib/agent-training-questions';

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

// ─── Agent Training Injection ───

async function getAgentTraining(agentRole: AgentRole): Promise<string> {
  try {
    const training = await prisma.agentTraining.findFirst({
      where: { agentRole, isActive: true },
    });
    if (training?.personalityPrompt) {
      return `\n\nPERSONALITY TRAINING (based on expert "${training.expertName}"):\n${training.personalityPrompt}\n\nApply this personality consistently in all your outputs.\n`;
    }
  } catch {
    // Silently fail — training is optional
  }
  return "";
}

export async function callClaude(prompt: string, maxTokens: number = 2048, timeoutMs: number = 120000): Promise<string> {
  const anthropic = getClient();

  // Wrap with a timeout to prevent single calls from hanging
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const message = await anthropic.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      },
      { signal: controller.signal },
    );

    const block = message.content[0];
    if (block.type === 'text') {
      return block.text;
    }
    return '';
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Claude API call timed out after ${timeoutMs / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
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

/** Build an FSD type instruction to inject into AI prompts (RICEFW) */
function buildFsdTypeInstruction(fsdType?: FsdType): string {
  if (!fsdType || fsdType === "standard") return "";

  const typeInstructions: Record<string, string> = {
    enhancement: `\nFSD TYPE: ENHANCEMENT (BADI / User Exit / Enhancement Spot)
- Focus on identifying specific BADIs, Enhancement Spots, and User Exits
- Detail the custom ABAP logic required (pseudo-code or logic description)
- Specify the enhancement implementation class/method names
- Include before/after behavior comparison
- Reference specific enhancement framework components (BAdI definitions, filter values)
- Detail which standard SAP processes need modification and why
- Include fallback/default behavior when enhancement is not active\n`,

    interface: `\nFSD TYPE: INTERFACE (IDoc / BAPI / RFC / API)
- Focus on interface specifications: source system, target system, protocol, direction
- Include detailed field mapping tables (source field -> target field -> transformation rules)
- Specify message types, IDoc types, segments, and segment fields
- Detail error handling for interface failures (retry logic, alerting, dead-letter queue)
- Include interface monitoring and reconciliation approach
- Specify data volume estimates, frequency, and scheduling
- Detail middleware configuration (PI/PO, CPI, AIF) if applicable\n`,

    report: `\nFSD TYPE: REPORT (ALV / Selection Screen / Dashboard)
- Focus on selection screen parameters (field, type, default, mandatory)
- Detail the ALV output layout: columns, sorting, subtotals, filters
- Specify data sources (tables, CDS views, function modules)
- Include authorization checks for report execution
- Detail drill-down capabilities and interactive features
- Include output format options (PDF, Excel, email, spool)
- Specify performance considerations for large data volumes\n`,

    form: `\nFSD TYPE: FORM (SmartForm / Adobe Form / Print Program)
- Focus on form layout specifications: header, body, footer sections
- Detail the form output type, print program, and driver program
- Specify dynamic text elements and their data sources
- Include page break logic and multi-page handling
- Detail barcode, QR code, and logo placement requirements
- Specify the form trigger events (output determination, manual print)
- Detail multi-language and multi-format considerations\n`,

    conversion: `\nFSD TYPE: CONVERSION (Data Migration / LSMW / LTMC)
- Focus on source-to-target field mapping with transformation rules
- Detail data cleansing rules and validation criteria per field
- Specify the migration tool (LSMW, LTMC, custom BAPI program) for each object
- Include data volume estimates and load sequence dependencies
- Detail the reconciliation approach (count, value, hash comparisons)
- Include dry-run / mock migration strategy
- Specify error handling: rejection criteria, reprocessing approach\n`,

    workflow: `\nFSD TYPE: WORKFLOW (SAP Business Workflow / Approval Chains)
- Focus on workflow definition: triggering events, tasks, agents, deadlines
- Detail the approval chain logic: levels, conditions, escalation paths
- Specify agent determination rules (organizational, rule-based, custom)
- Include workflow container elements and their bindings
- Detail email/notification templates for each workflow step
- Specify parallel vs sequential approval patterns
- Include substitution and delegation rules
- Detail monitoring, restart, and admin override capabilities\n`,
  };

  return typeInstructions[fsdType] || "";
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const wordLimit = depth === "comprehensive" ? 400 : 200;
  const prompt = `You are a senior SAP functional consultant at a top consulting firm. Write a professional executive summary for a Functional Specification Document (FSD).
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const prompt = `You are a senior SAP ${module} solution architect. Design the proposed solution for this FSD.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const prompt = `You are an SAP ${module} consultant. Define the output management requirements for this FSD.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const prompt = `You are an SAP ${module} consultant. Define error handling and validations for this FSD.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const prompt = `You are an SAP ${module} data migration specialist. Define the data migration plan for this FSD.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const prompt = `You are an SAP ${module} cutover manager. Define the cutover and go-live plan for this FSD.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
// BPMN Process Diagram Generator (Signavio-compatible)
// ─────────────────────────────────────────────

function getSapLaneGuidance(module: string): string {
  const guidance: Record<string, string> = {
    MM: `Lanes:
- Lane 1: "Requestor" (role: End User) — initiates purchase requests
- Lane 2: "Purchasing" (role: Buyer) — processes POs, manages vendors
- Lane 3: "Warehouse" (role: Store Keeper) — goods receipt, inventory
- Lane 4: "Finance / AP" (role: AP Clerk) — invoice verification, payment

Expected Process Pattern (MUST include all these steps):
Start → Requestor creates Purchase Requisition (ME51N) → Purchasing reviews PR → Approval Gateway ("PR Approved?") →
Yes: Convert to Purchase Order (ME21N) → Send PO to Vendor (ME9F) → Warehouse performs Goods Receipt (MIGO) →
Finance posts Invoice Verification (MIRO) → Payment Run (F110) → End
No: Return to Requestor for revision → loops back
Include intermediateEvent for "Await Vendor Delivery" between PO and GR`,
    SD: `Lanes:
- Lane 1: "Customer / Sales" (role: Sales Rep) — inquiry, quotation
- Lane 2: "Sales Administration" (role: Order Processing) — order creation, scheduling
- Lane 3: "Shipping / Warehouse" (role: Shipping Clerk) — delivery, picking, packing
- Lane 4: "Finance / AR" (role: Billing Clerk) — billing, invoicing, payment

Expected Process Pattern (MUST include all these steps):
Start → Sales creates Inquiry/Quotation (VA11/VA21) → Customer accepts → Create Sales Order (VA01) →
Credit Check Gateway ("Credit Approved?") →
Yes: Schedule delivery → Create Delivery (VL01N) → Pick & Pack → Post Goods Issue (VL02N) →
Create Billing Document (VF01) → Payment Receipt (F-28) → End
No: Notify Sales for resolution → converging gateway
Include intermediateEvent for "Await Customer PO" or "Pending Credit Decision"`,
    FI: `Lanes:
- Lane 1: "Accountant" (role: GL Accountant) — journal entries, postings
- Lane 2: "AP / AR Clerk" (role: Clerk) — invoice processing, payment runs
- Lane 3: "Finance Manager" (role: Manager) — approvals, reviews
- Lane 4: "Auditor" (role: Internal Audit) — compliance, reconciliation

Expected Process Pattern (MUST include all these steps):
Start → Accountant receives source document → Create Journal Entry (FB50) →
Approval Gateway ("Posting Approved?") →
Yes: Post document → AP/AR processing → Payment/Receipt → Period-end reconciliation →
Audit review → End
No: Return for correction → converging gateway
Include intermediateEvent for "Await Manager Approval" between posting and final close`,
    CO: `Lanes:
- Lane 1: "Cost Center Manager" (role: Department Head) — cost planning
- Lane 2: "Controller" (role: Cost Controller) — allocations, analysis
- Lane 3: "Budget Owner" (role: Manager) — budget approvals
- Lane 4: "Management" (role: Executive) — reporting, decisions

Expected Process Pattern (MUST include all these steps):
Start → Cost Center Manager creates cost plan (KP06) → Controller reviews plan →
Budget Gateway ("Budget Approved?") →
Yes: Activate plan → Execute cost allocations (KSU5) → Period-end closing (CO88) →
Generate reports (S_ALR_87013611) → Management reviews → End
No: Revise plan → converging gateway
Include intermediateEvent for "Await Budget Cycle" between planning and execution`,
    PP: `Lanes:
- Lane 1: "Production Planner" (role: Planner) — MRP, scheduling
- Lane 2: "Shop Floor" (role: Operator) — confirmations, execution
- Lane 3: "Quality" (role: QA Inspector) — inspections, results
- Lane 4: "Warehouse" (role: Store Keeper) — material staging, GR

Expected Process Pattern (MUST include all these steps):
Start → Planner runs MRP (MD01) → Create Production Order (CO01) →
Release Gateway ("Order Released?") →
Yes: Warehouse stages materials (MIGO 261) → Shop Floor executes production →
Confirm operations (CO11N) → Quality inspection (QA01) →
Quality Gateway ("Quality Passed?") → Yes: Goods Receipt (MIGO 101) → End
No: Rework or scrap → converging gateway
No (release): Return to planning → converging gateway
Include intermediateEvent for "Await Material Availability"`,
  };
  return guidance[module] || guidance["MM"]!;
}

export async function aiBpmnProcessDiagram(
  module: string,
  requirements: string,
  processArea: string,
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const nodeCount = depth === "comprehensive" ? "16-22" : "12-16";
  const laneCount = depth === "comprehensive" ? "4-6" : "3-4";

  const personalityTraining = await getAgentTraining("bpmn-architect");
  const prompt = `You are an SAP ${module} process architect creating a BPMN 2.0 process diagram for SAP Signavio.
${personalityTraining}${langInstruction}${depthInstruction}${fsdTypeInstruction}
Process Area: ${processArea}
Requirements: ${requirements}

Generate a BPMN 2.0 process flow as a JSON object with swim lanes.

RULES:
- Create ${laneCount} swim lanes representing organizational roles/departments involved in this SAP process
- Create ${nodeCount} process nodes distributed across the lanes
- Every process must start with exactly ONE "startEvent" and end with exactly ONE "endEvent"
- Use "exclusiveGateway" for approval/decision points (Yes/No branches)
- Use "parallelGateway" when multiple activities run in parallel (split and join)
- Use "userTask" for manual human activities (creating documents, approving, reviewing)
- Use "serviceTask" for automated system steps (auto-posting, batch jobs, workflow triggers)
- Use "intermediateEvent" for waiting states or handoff points between departments
- Include SAP transaction codes or Fiori app names in the sapTransaction field (e.g., "ME21N", "Manage Purchase Orders (F2229)")
- Edge labels should be "Yes"/"No" for gateways, or descriptive labels like "Approved", "Rejected", "Complete"
- Ensure every node has at least one incoming and one outgoing edge (except start and end events)
- Order lanes logically: requestor/initiator at top, processors in middle, approvers/finance at bottom
- Node IDs must be unique strings like "node_1", "node_2", etc.
- Edge IDs must be unique strings like "edge_1", "edge_2", etc.
- Lane IDs must be unique strings like "lane_1", "lane_2", etc.
- Every node's laneId must reference an existing lane ID

LAYOUT & STRUCTURE QUALITY RULES (critical for Signavio rendering):
1. DISTRIBUTE nodes evenly across lanes — each lane should have 2-5 nodes, never leave a lane with only 1 node
2. Start event MUST be alone as the first node; end event MUST be alone as the last node
3. Every exclusiveGateway MUST have a matching converging gateway later — branches must rejoin before reaching the end event
   Example: gateway splits into Yes/No → Yes path (2-3 tasks) → converging gateway; No path (1-2 tasks) → same converging gateway → continues → end
4. Every gateway output edge MUST have a descriptive label ("Yes"/"No", "Approved"/"Rejected", condition text)
5. Gateway labels MUST be phrased as questions ending with "?" (e.g., "Budget Approved?" not "Approval Check", "GR Complete?" not "Goods Receipt")
6. Spread nodes across horizontal positions — avoid placing more than 1 node per lane in the same column
7. Minimize cross-lane edges: keep sequential steps in the same lane when possible, only cross lanes for handoffs
8. Use parallelGateway when 2+ activities genuinely happen simultaneously (e.g., "Notify Approver" + "Update Status Log") — include both split AND join parallelGateways
9. Include at least one intermediateEvent for waiting/handoff points between departments (e.g., "Await Delivery", "Pending Approval")
10. EVERY userTask and serviceTask MUST have a sapTransaction field with a real SAP transaction code or Fiori app name — never leave it empty

CRITICAL — Gateway Convergence Pattern (ALWAYS follow this for decisions):

node_A (task) → node_G1 (exclusiveGateway label: "Approved?")
  → edge "Yes": node_B (task) → node_C (task) → node_G2 (exclusiveGateway — converging, label: "")
  → edge "No":  node_D (task) → node_G2
node_G2 → next steps → endEvent

The converging gateway (node_G2) has NO label and NO question — it simply merges branches.
You MUST include BOTH the split gateway AND the merge gateway in your nodes array.
The merge gateway has 2+ incoming edges and 1 outgoing edge.

SAP MODULE LANE GUIDANCE for ${module}:
${getSapLaneGuidance(module)}

Return ONLY the JSON inside a bpmn-process code block. No text before or after.

\`\`\`bpmn-process
{
  "title": "descriptive process title",
  "lanes": [
    {"id": "lane_1", "label": "Department Name", "role": "Role Name"},
    ...
  ],
  "nodes": [
    {"id": "node_1", "type": "startEvent", "label": "Process Start", "laneId": "lane_1"},
    {"id": "node_2", "type": "userTask", "label": "Create Purchase Requisition", "sapTransaction": "ME51N", "laneId": "lane_1"},
    {"id": "node_3", "type": "exclusiveGateway", "label": "Approval Required?", "laneId": "lane_2"},
    ...
    {"id": "node_N", "type": "endEvent", "label": "Process Complete", "laneId": "lane_4"}
  ],
  "edges": [
    {"id": "edge_1", "sourceNodeId": "node_1", "targetNodeId": "node_2"},
    {"id": "edge_2", "sourceNodeId": "node_2", "targetNodeId": "node_3"},
    {"id": "edge_3", "sourceNodeId": "node_3", "targetNodeId": "node_4", "label": "Yes"},
    {"id": "edge_4", "sourceNodeId": "node_3", "targetNodeId": "node_5", "label": "No"},
    ...
  ]
}
\`\`\``;

  const maxTokens = depth === "comprehensive" ? 4096 : 2048;
  const raw = await callClaude(withExtraContext(prompt, extraContext), maxTokens);

  // Validate the output contains parseable JSON
  try {
    const jsonMatch = raw.match(/```bpmn-process\s*\n([\s\S]*?)```/);
    if (jsonMatch) {
      JSON.parse(jsonMatch[1].trim()); // validate only
    }
  } catch {
    console.warn("[aiBpmnProcessDiagram] AI returned invalid JSON, returning raw output");
  }

  return raw;
}

// ─────────────────────────────────────────────
// AI Test Scripts Generator
// ─────────────────────────────────────────────

export async function aiTestScripts(
  module: string,
  requirements: string,
  processArea: string,
  fsdType: FsdType = "standard",
  language: string = "English",
  extraContext?: string,
  depth: "standard" | "comprehensive" = "standard",
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);

  const prompt = `You are a senior SAP ${module} test manager. Generate detailed test scripts for a Functional Specification Document.
${langInstruction}${depthInstruction}${fsdTypeInstruction}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

Write the following in markdown format:

### 12.1 Test Scenarios

A markdown table with columns: # | Test Case | Type | Priority | Expected Result
Include ${depth === "comprehensive" ? "10-14" : "6-8"} test cases specific to ${processArea}.
Types: Unit, Integration, UAT
Each test case must be specific to the business requirements above with measurable expected results.

### 12.2 Integration Test Scenarios

A markdown table with columns: Test ID | Source Module | Target Module | Scenario | Expected Result
Include ${depth === "comprehensive" ? "8-10" : "4-6"} cross-module integration tests.
Focus on data flow between ${module} and related modules.
Test IDs should follow pattern: IT-001, IT-002, etc.

### 12.3 Negative / Edge Case Tests

A markdown table with columns: Test ID | Scenario | Expected Error | Module
Include ${depth === "comprehensive" ? "8-10" : "5-7"} negative/edge case tests covering:
- Missing mandatory fields
- Invalid data combinations
- Boundary conditions (max values, zero quantities)
- Authorization failures
- Concurrent processing conflicts
Test IDs should follow pattern: NT-001, NT-002, etc.

Rules:
- Be specific to SAP ${module} ${processArea}
- Include realistic test data references
- Reference actual SAP transactions and Fiori apps
- All test cases must be traceable to the business requirements`;

  const maxTokens = depth === "comprehensive" ? 6144 : 4096;
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

  return `=== PROJECT DIRECTOR BRIEF ===
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
 * Phase 1: Project Director Analysis
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
  fsdType?: FsdType,
): Promise<TeamLeadContext> {
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const personalityTraining = await getAgentTraining("project-director");
  const prompt = `You are a Senior SAP Project Director leading a team of 5 specialist consultants who will collaboratively write a Functional Specification Document (FSD). Your job is to deeply analyze the business requirements and create a comprehensive brief that all specialists will reference to ensure consistency.
${personalityTraining}${depthInstruction}${fsdTypeInstruction}
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
 * Produces Executive Summary using the Project Director's shared brief.
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const personalityTraining = await getAgentTraining("business-analyst");
  const wordLimit = depth === "comprehensive" ? 500 : 250;
  const prompt = `You are a Senior SAP Business Analyst on an Agent Team writing a Functional Specification Document. Your Project Director has analyzed the requirements and provided a brief below. You MUST align your output with the Project Director's analysis — use the same terminology, reference the same process steps, and follow the design decisions.
${personalityTraining}

${teamLeadBrief}

${langInstruction}${depthInstruction}${fsdTypeInstruction}
Title: ${title}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

YOUR TASK: Write a professional executive summary (Section 2) for this FSD.

Write ${depth === "comprehensive" ? "4-5" : "2-3"} concise paragraphs covering:
1. Purpose of this specification document
2. Scope — what business processes are covered (reference the Project Director's process steps)
3. Expected business benefits and outcomes
${depth === "comprehensive" ? "4. Key stakeholders and organizational impact (reference the Project Director's stakeholders)\n5. Success criteria and KPIs" : ""}

Rules:
- Be specific to SAP ${module} and the ${processArea} process
- Use the EXACT terminology from the Project Director's glossary
- Reference risks identified by the Project Director where relevant
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const nodeCount = depth === "comprehensive" ? "16-22" : "12-16";
  const personalityTraining = await getAgentTraining("solution-architect");
  const prompt = `You are a Senior SAP ${module} Solution Architect on an Agent Team writing a Functional Specification Document. Your Project Director has analyzed the requirements and provided a brief below. You MUST align your solution with the Project Director's process steps and design decisions.
${personalityTraining}

${teamLeadBrief}

${langInstruction}${depthInstruction}${fsdTypeInstruction}
Requirements: ${requirements}
Process Area: ${processArea}
Available SAP Tables: ${tables.slice(0, 15).join(", ") || "Standard " + module + " tables"}
Key Transactions: ${tcodes.slice(0, 15).join(", ") || "Standard " + module + " transactions"}
Fiori Apps: ${fioriApps.slice(0, 8).join(", ") || "Standard " + module + " Fiori apps"}

YOUR TASK: Write the Proposed Solution section AND a process flow diagram.

Write the following in markdown format:

### 4.1 Solution Overview
A ${depth === "comprehensive" ? "4-5" : "2-3"} sentence overview referencing the Project Director's module strategy.

### 4.2 To-Be Process Flow
A numbered step-by-step process flow (${depth === "comprehensive" ? "12-18" : "8-12"} steps). These MUST match the Project Director's process steps. Include the SAP transaction or Fiori app used at each step.

### 4.3 Key Design Decisions
A markdown table with columns: Decision | Option Chosen | Rationale
Include ${depth === "comprehensive" ? "8-10" : "4-6"} design decisions aligned with the Project Director's decisions.

### 4.4 Process Flow Diagram

Generate a BPMN 2.0 process flow as JSON inside a \`\`\`bpmn-process code block, based on the Project Director's process steps.

Rules for the BPMN diagram:
- Create 3-4 swim lanes for organizational roles involved in this ${module} process
- Create ${nodeCount} nodes: start with ONE "startEvent", end with ONE "endEvent"
- DISTRIBUTE nodes evenly across lanes — each lane should have 2-5 nodes
- Use "userTask" for manual steps, "serviceTask" for automated steps, "exclusiveGateway" for decisions
- EVERY exclusiveGateway MUST have a matching converging gateway — branches must rejoin before the end event
  (split gateway has 1 incoming + 2 outgoing; merge gateway has 2 incoming + 1 outgoing)
- Gateway labels MUST be questions ending with "?" (e.g., "Approved?" not "Approval")
- ALL gateway output edges MUST have labels ("Yes"/"No", "Approved"/"Rejected")
- Include SAP transaction codes in the sapTransaction field for EVERY task (e.g., "ME21N", "MIGO")
- Include at least one intermediateEvent for waiting/handoff points
- Every node must have a unique ID (node_1, node_2, ...) and reference a lane ID
- Return the JSON inside \`\`\`bpmn-process ... \`\`\` code block

Example format:
\`\`\`bpmn-process
{"title":"Process Name","lanes":[{"id":"lane_1","label":"Department","role":"Role"}],"nodes":[{"id":"node_1","type":"startEvent","label":"Start","laneId":"lane_1"}],"edges":[{"id":"edge_1","sourceNodeId":"node_1","targetNodeId":"node_2"}]}
\`\`\`

Rules:
- Be specific to SAP ${module}
- Use the EXACT terminology from the Project Director's glossary
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const personalityTraining = await getAgentTraining("technical-consultant");
  const prompt = `You are a Senior SAP ${module} Technical Consultant on an Agent Team. Your Project Director has provided a brief below. Align your specifications with the Project Director's process steps, design decisions, and risk areas.
${personalityTraining}

${teamLeadBrief}

${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
Include ${depth === "comprehensive" ? "10-14" : "6-8"} validations. Address the Project Director's risk areas.

### 10.2 Business Rule Validations
A markdown table with columns: Rule ID | Business Rule | Action on Failure | Resolution
Include ${depth === "comprehensive" ? "8-12" : "5-7"} business rules.

### 10.3 Error Scenarios
A markdown table with columns: Scenario | Root Cause | System Behavior | User Action
Include ${depth === "comprehensive" ? "8-10" : "4-6"} error scenarios.

Rules:
- Be specific to SAP ${module} ${processArea}
- Use the EXACT terminology from the Project Director's glossary
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
  fsdType?: FsdType,
): Promise<string> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);
  const personalityTraining = await getAgentTraining("project-manager");
  const prompt = `You are a Senior SAP ${module} Project Manager on an Agent Team. Your Project Director has provided a brief below. Align your plans with the Project Director's process steps, risk areas, and scope boundaries.
${personalityTraining}

${teamLeadBrief}

${langInstruction}${depthInstruction}${fsdTypeInstruction}
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
- Use the EXACT terminology from the Project Director's glossary
- Address the Project Director's risk areas
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

  // ROBUST APPROACH: Instead of asking Claude to return full sections in JSON
  // (which breaks on newlines/special chars), ask it to return corrections list
  // and then use SECTION MARKERS to separate corrected outputs.
  const prompt = `You are a Senior SAP Quality Reviewer. Five specialists wrote sections of an FSD. Review ALL outputs for consistency and alignment with the Project Director's brief, then return CORRECTED versions.

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
1. TERMINOLOGY consistency across all sections (match Project Director's glossary)
2. CROSS-REFERENCES correctness (cutover references migration objects, error handling references process steps)
3. CONTRADICTIONS between sections
4. COMPLETENESS (all Project Director's process steps, decisions, and risks addressed)
5. QUALITY (fix vague statements, add missing SAP details)

OUTPUT FORMAT: Return corrected sections separated by these EXACT markers. Write the FULL corrected content for each section. If a section is already good, return it as-is. Preserve all markdown tables, mermaid diagrams, and bpmn-process code blocks exactly as they are.

First, list corrections on a single line:
CORRECTIONS: correction1 | correction2 | correction3

Then output each corrected section with these markers:

<<<EXECUTIVE_SUMMARY>>>
(corrected executive summary here)
<<<PROPOSED_SOLUTION>>>
(corrected proposed solution here with 4.1-4.4 including bpmn-process diagram)
<<<OUTPUT_MANAGEMENT>>>
(corrected output management here with 9.1, 9.2)
<<<ERROR_HANDLING>>>
(corrected error handling here with 10.1-10.3)
<<<DATA_MIGRATION>>>
(corrected data migration here with 11.1, 11.2)
<<<CUTOVER_PLAN>>>
(corrected cutover plan here with 13.1, 13.2)
<<<END>>>`;

  const maxTokens = 6144;
  const raw = await callClaude(withExtraContext(prompt, ""), maxTokens, 80000);

  // Parse using robust marker-based extraction (not JSON!)
  const corrections: string[] = [];
  const correctionsMatch = raw.match(/CORRECTIONS:\s*(.+?)(?:\n|<<<)/);
  if (correctionsMatch) {
    corrections.push(...correctionsMatch[1].split("|").map(c => c.trim()).filter(Boolean));
  }

  function extractMarkerSection(text: string, marker: string, nextMarkers: string[]): string {
    const start = text.indexOf(`<<<${marker}>>>`);
    if (start === -1) return "";
    const afterMarker = text.substring(start + marker.length + 6).trim();
    let end = afterMarker.length;
    for (const nm of nextMarkers) {
      const idx = afterMarker.indexOf(`<<<${nm}>>>`);
      if (idx !== -1 && idx < end) end = idx;
    }
    return afterMarker.substring(0, end).trim();
  }

  const markers = ["EXECUTIVE_SUMMARY", "PROPOSED_SOLUTION", "OUTPUT_MANAGEMENT", "ERROR_HANDLING", "DATA_MIGRATION", "CUTOVER_PLAN", "END"];

  const executiveSummary = extractMarkerSection(raw, "EXECUTIVE_SUMMARY", markers.slice(1));
  const proposedSolution = extractMarkerSection(raw, "PROPOSED_SOLUTION", markers.slice(2));
  const outputManagement = extractMarkerSection(raw, "OUTPUT_MANAGEMENT", markers.slice(3));
  const errorHandling = extractMarkerSection(raw, "ERROR_HANDLING", markers.slice(4));
  const dataMigration = extractMarkerSection(raw, "DATA_MIGRATION", markers.slice(5));
  const cutoverPlan = extractMarkerSection(raw, "CUTOVER_PLAN", markers.slice(6));

  return {
    corrections,
    finalSections: {
      executiveSummary: executiveSummary || specialistOutputs.businessAnalyst,
      proposedSolution: proposedSolution || specialistOutputs.solutionArchitect,
      outputManagement: outputManagement || extractSection(specialistOutputs.technicalConsultant, "OUTPUT MANAGEMENT"),
      errorHandling: errorHandling || extractSection(specialistOutputs.technicalConsultant, "ERROR HANDLING"),
      dataMigration: dataMigration || extractSection(specialistOutputs.projectManager, "DATA MIGRATION"),
      cutoverPlan: cutoverPlan || extractSection(specialistOutputs.projectManager, "CUTOVER PLAN"),
    },
  };
}

// ─────────────────────────────────────────────
// Phase 2.5: Cross-Critique Reflexion (MAR Paper)
// Each specialist reviews a DIFFERENT specialist's output
// from their unique perspective, eliminating confirmation bias.
// ─────────────────────────────────────────────

/**
 * Phase 2.5: Cross-Critique Reflexion
 * A reviewer specialist critiques another specialist's section from their
 * unique domain perspective, then produces a REVISED version.
 *
 * Based on Multi-Agent Reflexion (MAR, Dec 2025) — cross-agent critique
 * eliminates confirmation bias that single-agent self-review cannot.
 *
 * @returns Object with critique findings and the improved section content
 */
export async function aiCrossCritique(
  module: string,
  processArea: string,
  language: string,
  depth: "standard" | "comprehensive",
  reviewerRole: string,
  reviewerExpertise: string,
  authorRole: string,
  sectionName: string,
  originalContent: string,
  teamLeadBrief: string,
  fsdType?: FsdType,
): Promise<{ critique: string[]; revisedContent: string }> {
  const langInstruction = buildLanguageInstruction(language);
  const depthInstruction = buildDepthInstruction(depth);
  const fsdTypeInstruction = buildFsdTypeInstruction(fsdType);

  const prompt = `You are a Senior SAP ${module} ${reviewerRole} performing a CROSS-CRITIQUE review. You are reviewing the work of the ${authorRole} from YOUR unique perspective as a ${reviewerRole}.
${langInstruction}${depthInstruction}${fsdTypeInstruction}

PROJECT DIRECTOR BRIEF (shared context):
${teamLeadBrief}

SAP Module: ${module}
Process Area: ${processArea}

=== SECTION UNDER REVIEW: ${sectionName} (written by ${authorRole}) ===
${originalContent}
=== END SECTION ===

YOUR TASK: Review this section through the lens of a ${reviewerRole} (${reviewerExpertise}).

CRITIQUE CHECKLIST — identify issues in these areas:
1. ACCURACY: Are SAP transaction codes, table names, and technical references correct?
2. COMPLETENESS: Are there missing scenarios, edge cases, or steps the ${authorRole} overlooked?
3. CONSISTENCY: Does terminology match the Project Director's glossary? Are cross-references valid?
4. FEASIBILITY: From your ${reviewerRole} perspective, is everything practically implementable?
5. GAPS: What would YOU add that the ${authorRole} might not know about?

OUTPUT FORMAT:
First line — list critique findings separated by |:
CRITIQUE: finding1 | finding2 | finding3

Then output the IMPROVED version of the section with your fixes applied:
<<<REVISED>>>
(full improved section content — preserve ALL markdown formatting, tables, and code blocks)
<<<END>>>

Rules:
- Make targeted improvements, don't rewrite from scratch
- ADD missing content rather than just criticizing
- If the section is already excellent, make minor enhancements and state that
- Preserve all markdown tables, bpmn-process blocks, and mermaid diagrams
- Keep the same section structure (### headers)`;

  const maxTokens = depth === "comprehensive" ? 6144 : 4096;
  const raw = await callClaude(withExtraContext(prompt, ""), maxTokens);

  // Parse critique findings
  const critique: string[] = [];
  const critiqueMatch = raw.match(/CRITIQUE:\s*(.+?)(?:\n|<<<)/);
  if (critiqueMatch) {
    critique.push(...critiqueMatch[1].split("|").map(c => c.trim()).filter(Boolean));
  }

  // Parse revised content
  const revisedStart = raw.indexOf("<<<REVISED>>>");
  const revisedEnd = raw.indexOf("<<<END>>>");
  let revisedContent = originalContent; // fallback to original if parsing fails

  if (revisedStart !== -1 && revisedEnd !== -1) {
    revisedContent = raw.substring(revisedStart + "<<<REVISED>>>".length, revisedEnd).trim();
  } else if (revisedStart !== -1) {
    // No END marker — take everything after REVISED
    revisedContent = raw.substring(revisedStart + "<<<REVISED>>>".length).trim();
  }

  // Safety: if revised content is suspiciously short (< 30% of original), keep original
  if (revisedContent.length < originalContent.length * 0.3) {
    console.warn(`[CrossCritique] ${reviewerRole} review of ${sectionName}: revised content too short (${revisedContent.length} vs ${originalContent.length}), keeping original`);
    revisedContent = originalContent;
  }

  return { critique, revisedContent };
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
