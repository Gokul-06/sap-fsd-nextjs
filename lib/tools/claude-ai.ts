/**
 * AI Integration for FSD Generation
 * Multi-provider support: Anthropic, Azure AI Foundry, OpenAI, Azure OpenAI.
 * Calls the configured AI provider to generate intelligent narrative content
 * for FSD sections that require contextual writing.
 * Supports feedback context, few-shot examples, and multi-language output.
 */

import { getProvider, isAIEnabled as providerIsAIEnabled } from '@/lib/ai/provider';
import type { TeamLeadContext, FsdType } from '@/lib/types';
import { prisma } from '@/lib/db';
import type { AgentRole } from '@/lib/agent-training-questions';

export function isAIEnabled(): boolean {
  return providerIsAIEnabled();
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
  const provider = getProvider();

  const response = await provider.complete({
    messages: [{ role: 'user', content: prompt }],
    maxTokens,
    timeoutMs,
  });

  return response.text;
}

/**
 * Call Claude with full conversation history (multi-turn).
 * Used when agent memory provides prior context for richer generation.
 */
export async function callClaudeWithHistory(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  maxTokens: number = 2048,
  timeoutMs: number = 120000,
): Promise<string> {
  const provider = getProvider();

  const response = await provider.complete({
    messages,
    maxTokens,
    timeoutMs,
  });

  return response.text;
}

/** Append extra context (feedback rules + few-shot) to a prompt if available */
function withExtraContext(prompt: string, extraContext?: string): string {
  if (!extraContext?.trim()) return prompt;
  return `${prompt}\n\n${extraContext}`;
}

/**
 * Build universal "User Input Priority" instruction.
 * Addresses Florian's feedback: AI must prioritize user's actual input
 * over generic SAP knowledge, be keyword-aware, preserve number ranges,
 * generate hierarchical config, better process flows, filtered tables,
 * and accurate interface sections.
 */
function buildUserInputPriorityInstruction(requirements: string): string {
  // Extract number ranges from requirements (e.g., "S400 → 4000–4099", "4600000000-4699999999")
  const numberRangePatterns = requirements.match(
    /\b\d{4,}[\s]*[-–→to]+[\s]*\d{4,}\b/gi
  ) || [];
  const specificNumbers = requirements.match(
    /\b[A-Z]{1,3}\d{2,4}\b/gi
  ) || [];
  const preserveNumbers = [...new Set([...numberRangePatterns, ...specificNumbers])];

  // Extract keywords from user input for context-aware generation
  const userKeywords = extractUserKeywords(requirements);

  return `
USER INPUT PRIORITY — CRITICAL RULES (MUST follow these):

1. USER INPUT OVER GENERIC KNOWLEDGE:
   - The user's requirements text below is your PRIMARY source of truth
   - If the user mentions specific processes, transactions, thresholds, or rules, use EXACTLY those — do NOT replace them with generic SAP defaults
   - If the user says "approval threshold $10,000" — use $10,000, not a generic amount
   - If the user mentions specific order types, document types, or movement types — use EXACTLY those
   - Generic SAP knowledge is ONLY a fallback for topics the user did NOT explicitly address

2. KEYWORD-AWARE GENERATION:
   - Only generate configuration, tables, and details RELEVANT to the user's specific requirement
   - User's key topics: ${userKeywords.join(", ") || "general process"}
   - Do NOT include unrelated SAP configuration areas just because they exist in the module
   - Every table row, config item, and process step must be traceable to the user's input
   - If the user mentions "3-way matching" — focus configuration on 3-way matching, not unrelated procurement config

3. PRESERVE SPECIFIC DATA FROM USER INPUT:
   - Number ranges mentioned by user MUST appear exactly as stated: ${preserveNumbers.length > 0 ? preserveNumbers.join(", ") : "none detected"}
   - Transaction codes mentioned by user MUST be used (not substituted with alternatives)
   - Approval thresholds, tolerance limits, and business rules from user input MUST be preserved verbatim
   - Organization-specific names, codes, and identifiers MUST be used as-is

4. HIERARCHICAL CONFIGURATION STRUCTURE:
   - Generate configuration in a clear hierarchy: Category → Sub-category → Detail
   - Example: "Order Types → Number Ranges → Settlement Profiles → Results Analysis Keys"
   - Group related config items under parent categories with clear nesting
   - Show dependencies between config items explicitly

5. CLEAR STEP-BY-STEP PROCESS FLOWS:
   - Process flows must follow: Start → [Step 1: Action (Tcode)] → [Step 2: Action (Tcode)] → ... → End
   - Each step must state: WHO does it, WHAT they do, WHICH transaction/app, and WHAT output it produces
   - Include decision points as gateways: "Approved? → Yes: next step / No: return to step X"
   - Use arrow notation (→) for flow direction

6. FILTERED TECHNICAL CONTENT:
   - In appendix and technical object sections, ONLY include SAP tables, BAPIs, and CDS views that are DIRECTLY used in the user's process
   - Do NOT dump all module tables — filter to only process-relevant ones
   - Each technical object must have a clear "Usage in This Spec" column explaining WHY it's included

7. ACCURATE INTERFACE SECTION:
   - Interface/integration sections MUST reflect the user's ACTUAL integration details
   - If the user mentions specific source/target systems — use those exact system names
   - If the user mentions specific middleware (PI/PO, CPI) — reference that middleware
   - Do NOT generate generic "SAP integrates with..." text — be specific to the user's requirements
   - If no integration details are mentioned, explicitly state "Integration details to be confirmed with the customer"
`;
}

/** Extract key topics/keywords from user requirements for context-aware generation */
function extractUserKeywords(requirements: string): string[] {
  const keywords: string[] = [];
  const text = requirements.toLowerCase();

  // SAP process keywords
  const processKeywords: Record<string, string> = {
    "procure-to-pay": "Procure-to-Pay",
    "p2p": "Procure-to-Pay",
    "purchase": "Purchasing",
    "procurement": "Procurement",
    "order-to-cash": "Order-to-Cash",
    "o2c": "Order-to-Cash",
    "sales order": "Sales Order Processing",
    "billing": "Billing",
    "invoice": "Invoice Processing",
    "3-way match": "3-Way Matching",
    "three-way match": "3-Way Matching",
    "goods receipt": "Goods Receipt",
    "payment": "Payment Processing",
    "credit management": "Credit Management",
    "inventory": "Inventory Management",
    "warehouse": "Warehouse Management",
    "production order": "Production Order",
    "mrp": "Material Requirements Planning",
    "bom": "Bill of Materials",
    "routing": "Routing",
    "cost center": "Cost Center Accounting",
    "profit center": "Profit Center Accounting",
    "internal order": "Internal Orders",
    "product costing": "Product Costing",
    "settlement": "Settlement",
    "results analysis": "Results Analysis",
    "wbs": "Work Breakdown Structure",
    "project system": "Project System",
    "asset accounting": "Asset Accounting",
    "general ledger": "General Ledger",
    "accounts payable": "Accounts Payable",
    "accounts receivable": "Accounts Receivable",
    "approval": "Approval Workflow",
    "workflow": "Workflow",
  };

  for (const [key, label] of Object.entries(processKeywords)) {
    if (text.includes(key)) keywords.push(label);
  }

  // Extract transaction codes mentioned
  const tcodeMatches = requirements.match(/\b(ME\d{2}N?|VA\d{2}|VL\d{2}N?|VF\d{2}|FB\d{2}|F-?\d{2}|MIGO|MIRO|CO\d{2}N?|KO\d{2}|KS\d{2}|MD\d{2}|MR\d{2}N?|FK\d{2}N?|XK\d{2}|MM\d{2}|MB\d{2}|MI\d{2}|CS\d{2}|CR\d{2}|CK\d{2}|KP\d{2}|KSU\d|S_ALR_\d+)\b/gi);
  if (tcodeMatches) {
    keywords.push(...new Set(tcodeMatches.map(t => t.toUpperCase())));
  }

  return [...new Set(keywords)].slice(0, 15);
}

/** Append agent memory context to a prompt if available */
export function withMemoryContext(prompt: string, memoryContext?: string): string {
  if (!memoryContext?.trim()) return prompt;
  return `${prompt}\n\n${memoryContext}`;
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

// ─── Consulting Quality Frameworks (McKinsey / BCG / Deloitte) ───

type ConsultingRole =
  | "project-director"
  | "business-analyst"
  | "solution-architect"
  | "technical-consultant"
  | "project-manager"
  | "bpmn-architect"
  | "quality-reviewer"
  | "cross-critique"
  | "general";

/**
 * Build consulting framework instructions tailored per specialist role.
 * Injects Pyramid Principle, MECE, and SCR into every prompt.
 */
function buildConsultingFramework(role: ConsultingRole): string {
  // ── Core frameworks all agents share ──
  const core = `
CONSULTING QUALITY FRAMEWORK — Apply these principles from top-tier management consulting:

1. PYRAMID PRINCIPLE (Barbara Minto / McKinsey):
   - Lead with the answer FIRST, then provide supporting evidence
   - Every paragraph opens with its conclusion or recommendation
   - Supporting points are grouped logically under the main point
   - Never build up to a conclusion — state it immediately, then justify

2. MECE (Mutually Exclusive, Collectively Exhaustive):
   - All lists, categories, and table rows must have ZERO overlap (Mutually Exclusive)
   - Together they must cover ALL possible cases with NO gaps (Collectively Exhaustive)
   - When listing process steps: every step is distinct, and together they cover the full end-to-end flow
   - When listing error scenarios: every scenario is unique, and together they cover all failure modes

3. SCR (Situation-Complication-Resolution):
   - Situation: What is the current state? (factual, concise)
   - Complication: Why must this change? (pain point, gap, risk, regulation)
   - Resolution: What does this specification deliver? (the solution)
`;

  // ── Role-specific consulting instructions ──
  const roleSpecific: Record<ConsultingRole, string> = {
    "project-director": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Project Director):
- Frame moduleStrategy using SCR: current state → why change → approach
- Process steps MUST be MECE: each step is distinct, together they cover the full process with no gaps
- Design decisions MUST follow Pyramid: state the decision first, then the rationale
- Risk areas MUST be MECE: no overlapping risks, all major risk categories covered
- Terminology glossary enforces consistency — define every ambiguous term ONCE
- Scope boundaries MUST clearly separate in-scope vs out-of-scope (MECE partitioning)`,

    "business-analyst": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Business Analyst — Executive Summary):
- Structure the entire summary using SCR: Situation (1st paragraph) → Complication (2nd paragraph) → Resolution (remaining paragraphs)
- First sentence of EVERY paragraph states its key point (Pyramid Principle)
- Benefits MUST be quantified with specific metrics: "reduce cycle time by X%", "eliminate Y manual steps", "save Z hours/month"
- Scope coverage MUST be MECE: list what IS covered and what is NOT — no ambiguity
- Use active voice: "This specification defines..." not "It is the purpose of this document to..."
- Avoid hedge words: write "will" not "should", "requires" not "may need"`,

    "solution-architect": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Solution Architect — Proposed Solution):
- Solution Overview: lead with the architectural approach (Pyramid), then detail why
- Process Flow steps MUST be MECE: each step is a distinct action, together they cover start-to-finish
- Every step MUST specify WHO does it, WHAT they do, and WHICH SAP transaction/app they use
- Design Decisions table: Decision column states the choice made (Pyramid — answer first), Rationale column justifies it
- Design Decisions MUST be MECE: cover all key architectural areas (data model, workflow, integration, authorization, reporting, performance) with no overlap
- Prefer standard SAP over custom: if using custom code, explicitly justify WHY standard SAP is insufficient`,

    "technical-consultant": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Technical Consultant — Error Handling & Output):
- Validation rules MUST be MECE: cover all input fields (no gaps), each rule is distinct (no overlap)
- Error scenarios MUST be MECE: cover all failure modes — validation errors, system errors, authorization errors, data errors, integration errors
- Error messages MUST be actionable: tell the user WHAT went wrong and HOW to fix it
  BAD: "Error in processing"
  GOOD: "Purchase Order quantity exceeds approved budget limit of $50,000. Reduce quantity or request budget increase via transaction FMBB."
- Output types MUST be MECE: cover all output channels (print, email, workflow, API, dashboard)
- Each error scenario: state the root cause first (Pyramid), then system behavior, then user action`,

    "project-manager": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Project Manager — Migration & Cutover):
- Migration objects MUST be MECE: cover ALL data categories (master data, transactional data, configuration, hierarchies) with no overlap
- Load sequence must respect dependencies: define the dependency chain explicitly
- Cutover tasks MUST be MECE: cover all cutover activities (technical prep, data freeze, migration, validation, go/no-go, hypercare) chronologically
- Every task has a clear owner, duration estimate, and dependencies (Pyramid — state what, who, when)
- Rollback plan: lead with the trigger criteria (Pyramid — when do we rollback?), then the procedure
- Include specific data volume estimates and performance implications for each migration object`,

    "bpmn-architect": `
ROLE-SPECIFIC CONSULTING GUIDANCE (BPMN Process Architect):
- Process flow MUST be MECE: every process path (happy path + all exception paths) is covered
- Every decision gateway MUST show ALL possible outcomes — never leave an unhandled branch
- Swim lanes represent MECE organizational roles: each role is distinct, together they cover all actors
- Node labels use Pyramid: start with a verb describing the action ("Create PO", "Verify Invoice")
- Include timing annotations: waiting states, batch processing windows, SLA expectations`,

    "quality-reviewer": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Quality Reviewer):
- CHECK that the Executive Summary follows SCR structure (Situation → Complication → Resolution)
- CHECK that every section's first sentence states the key point (Pyramid Principle)
- CHECK MECE compliance: process steps cover full flow, error scenarios cover all failure modes, migration objects cover all data
- CHECK that benefits are quantified with specific metrics, not vague ("improved efficiency")
- CHECK that error messages are actionable, not generic
- FIX any violations of these frameworks — don't just flag them, CORRECT them in the output
- ADD quantified metrics where the specialist left vague statements`,

    "cross-critique": `
ROLE-SPECIFIC CONSULTING GUIDANCE (Cross-Critique Reviewer):
- Evaluate MECE compliance: are there gaps or overlaps in the reviewed section?
- Check Pyramid Principle: does each paragraph/row lead with its key point?
- Verify quantified claims: are benefits specific ("30% reduction") or vague ("improved")?
- Check actionability: can a developer/consultant implement directly from this spec without guessing?
- ADD missing content that makes the section consulting-grade, don't just criticize`,

    general: `
ROLE-SPECIFIC CONSULTING GUIDANCE:
- Apply SCR to frame business context
- Apply MECE to all lists and categories
- Lead every section with its conclusion (Pyramid Principle)
- Quantify all benefits and impacts with specific metrics`,
  };

  return core + (roleSpecific[role] || roleSpecific.general);
}

/** Build an FSD type instruction to inject into AI prompts (RICEFW)
 *  Based on Westernacher FS Section Mapping (Florian's template)
 *  Each type has 7 common sections + type-specific sections */
function buildFsdTypeInstruction(fsdType?: FsdType): string {
  if (!fsdType || fsdType === "standard") return buildStandardFsdInstruction();

  const commonSections = `
COMMON SECTIONS (include these in every FSD regardless of type):
- Business Background: Why this development is needed, the business context and triggers
- Why SAP Standard Is Not Sufficient: Explicitly state what gaps exist in SAP standard that require this custom development
- Alternative Approaches Considered: List 2-3 alternatives that were evaluated and why they were rejected
- Out of Scope: Clearly define what is NOT covered by this specification
- Assumptions: List all assumptions made during the specification (e.g., system landscape, data quality, user access)
- Dependencies: Other projects, objects, transports, or teams this specification depends on
- Links: References to related documents, Jira tickets, SharePoint links, or other FSDs
`;

  const typeInstructions: Record<string, string> = {
    enhancement: `\nFSD TYPE: ENHANCEMENT (BADI / User Exit / Enhancement Spot)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

**Enhancement Logic:**
- Identify the specific BAdI, Enhancement Spot, User Exit, or implicit enhancement point
- Provide the BAdI definition name, filter values, and implementation class name
- Detail the custom ABAP logic required — use pseudo-code or structured logic description
- Include before/after behavior comparison (what SAP does standard vs. with enhancement active)
- Specify fallback/default behavior when the enhancement is not active
- Detail activation/deactivation strategy (switchable BAdIs, enhancement switches)

**Data Model (Enhancement):**
- List any custom tables (Z-tables), append structures, or CI includes needed
- Specify custom data elements, domains, and field catalog extensions
- Include table relationships and foreign key dependencies
- Detail any custom CDS views or database views required

**Test (Enhancement):**
- Unit test cases for the enhancement logic (positive and negative)
- Regression test cases to verify standard SAP behavior is not broken
- Include test data requirements specific to the enhancement
- Specify activation/deactivation testing scenarios\n`,

    interface: `\nFSD TYPE: INTERFACE (IDoc / BAPI / RFC / API)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

**APIs & Web Services:**
- Specify the interface type: IDoc, BAPI, RFC, REST API, OData, SOAP
- Detail source system, target system, protocol, direction (inbound/outbound/bidirectional)
- Specify middleware: SAP PI/PO, SAP CPI/Integration Suite, AIF, or direct connection
- Include simplified API overview if this is a straightforward pass-through

**API Business Object:**
- Identify the SAP Business Object being interfaced (e.g., PurchaseOrder, SalesOrder, BusinessPartner)
- Specify the BAPI or API name (e.g., BAPI_PO_CREATE1, API_BUSINESS_PARTNER)
- Detail the business object structure and key fields

**API Signature:**
- Full API signature: import parameters, export parameters, tables, changing parameters
- Include parameter data types, lengths, and mandatory/optional flags
- Provide a field mapping table: Source Field → Target Field → Transformation Rule → Default Value

**API Data Validation:**
- Input validation rules before calling the API (mandatory fields, value ranges, format checks)
- Cross-field validation rules (e.g., if field A = X then field B is mandatory)
- Data type and format conversion rules (date formats, number formats, encoding)

**API Logic:**
- Step-by-step processing logic in pseudo-code or structured text
- Include error handling, retry logic, and compensating actions
- Detail transformation and enrichment logic between source and target formats
- Specify idempotency handling for duplicate message detection

**API Confirm/Error:**
- Confirmation message structure and content
- Error response structure: error codes, messages, severity levels
- Alerting and monitoring: who gets notified on failure, SLA for resolution
- Dead-letter queue / parking lot handling for failed messages

**IDoc Structure (if IDoc-based):**
- Message type, IDoc type, basic type, extension type
- Segment structure: segment name, fields, mandatory/optional, max occurrences
- Partner profiles: sender, receiver, port, partner type

**Inbound Processing:**
- Inbound function module or process code
- Posting logic: how inbound data maps to SAP documents
- Duplicate check mechanism and reprocessing strategy
- Status management and monitoring (WE05, BD87)

**Outbound Processing:**
- Triggering event: change pointer, message control, workflow, custom trigger
- Outbound function module or process code
- Filtering rules: which data qualifies for outbound distribution
- Serialization and sequencing requirements

**Test (Interfaces):**
- Test cases for each direction (inbound/outbound)
- Include positive, negative, and edge case scenarios
- Specify test data requirements and system landscape for testing
- Include volume/performance test criteria\n`,

    report: `\nFSD TYPE: REPORT (ALV / Selection Screen / Dashboard)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

**Selection Criteria:**
- Selection screen layout: block structure, field arrangement
- Table of parameters: Parameter Name | Field/Table | Type | Mandatory | Default | F4 Help
- Include select-options (ranges) vs. parameters distinction
- Specify dynamic selection screen behavior (hide/show based on selections)
- Detail any custom F4 value helps or search helps

**Validation:**
- Input validation rules on the selection screen (mandatory combinations, date range checks)
- Authority checks before report execution (S_TCODE, custom auth objects)
- Cross-field validation rules

**Authorizations:**
- Authorization objects checked during execution
- Table: Auth Object | Field | Value Range | Description
- Detail organizational level restrictions (company code, plant, sales org)

**Data Selection / Error Handling:**
- Data selection logic: which tables/CDS views are read, join conditions
- Performance optimization: indexes used, parallel processing, buffering
- Error handling during data selection (missing data, timeout, authorization failures)

**Flow Diagram:**
- Processing flow from selection screen → data retrieval → processing → output
- Include decision points and parallel processing paths

**Report Output:**
- ALV grid layout: Column | Field | Header Text | Width | Alignment | Totals | Conditional Format
- Include color coding rules, traffic light indicators
- Detail subtotals, grand totals, and grouping hierarchy
- Specify toolbar customization (custom buttons, functions)
- Include output format options (ALV, PDF, Excel, email distribution)

**Drilldown:**
- Drilldown navigation: which fields are clickable
- Target transactions or reports for each drilldown
- Include hotspot and hyperlink definitions
- Detail popup details or secondary list behavior

**Batch / Scheduling:**
- Batch job scheduling: frequency, variant, server group
- Job chain dependencies if multiple jobs
- Monitoring and alerting for batch failures

**Appendix (Selection):**
- Screenshot mockups of selection screen layout
- Sample output screenshots or layouts\n`,

    form: `\nFSD TYPE: FORM (SmartForm / Adobe Form / Print Program)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

**Existing Form (Current State):**
- Current form name, type (SAPscript, SmartForm, Adobe Form)
- What is changing: complete replacement, modification, or new form
- Screenshots or description of current form layout if applicable

**Print Program / Data Model:**
- Driver program name and description
- Data retrieval logic: tables read, function modules called
- Print program interface: FORM routines or class methods
- Data model structure: header data, item data, text data, partner data

**Form Layout:**
- Page structure: first page, subsequent pages, final page, copy pages
- Window definitions: MAIN window, HEADER, FOOTER, ADDRESS, LOGO, custom windows
- Section-by-section layout description with field placements
- Include a wireframe or ASCII mockup of the form layout

**Styles:**
- Font definitions: font family, size, bold/italic for each text element
- Paragraph formats: alignment, spacing, indentation
- Character formats: colors, underlining, superscript
- Table formatting: borders, cell padding, alternating row colors

**Paper / Printing:**
- Paper size and orientation (A4 portrait, Letter landscape, label sizes)
- Margins: top, bottom, left, right
- Printer types and spool handling
- Duplex printing, stapling, tray selection requirements
- Output device configuration

**Long Texts:**
- SAP long text IDs used in the form (text objects, text names)
- Text include handling: how dynamic texts are pulled and positioned
- Rich text / SAPscript formatting tags used

**Legal Requirements:**
- Legal compliance: tax information, mandatory disclaimers, regulatory text
- Country-specific requirements (e.g., EU invoicing directives, Brazilian NF-e)
- Digital signature or e-invoicing requirements

**Follow-on:**
- Output determination: condition records, output types, partner functions
- Email distribution: PDF attachment, subject line, body text
- EDI/electronic output considerations
- Archive linkage (ArchiveLink, DMS)

**Test (Print Forms):**
- Test cases for each page type and output scenario
- Test multi-language output
- Test edge cases: very long texts, missing data, multiple pages
- Printer compatibility testing requirements\n`,

    conversion: `\nFSD TYPE: CONVERSION (Data Migration / LSMW / LTMC)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

=== UPLOAD (Legacy → SAP) ===

**Upload Business Object:**
- SAP business object being loaded (e.g., Material Master, Vendor, GL Account, Open Items)
- Target transaction or BAPI: LSMW recording, BAPI call, LTMC template
- Object dependencies and load sequence

**Source File:**
- Source system name and technology
- File format: CSV, Excel, XML, flat file
- File layout: column definitions, delimiter, encoding (UTF-8, ASCII)
- Include sample file structure with example data rows

**Source Validation:**
- Pre-load validation rules applied to the source file
- Data quality checks: completeness, uniqueness, format compliance
- Validation report format and error handling

**Selection Screen (Conversion):**
- Upload program selection screen parameters
- Test/production run toggle
- File path input, processing options

**Update Method:**
- BAPI, BDC recording, direct input, LTMC, or custom program
- Specify the exact BAPI name or recording transaction
- Commit frequency (per record, per batch, at end)

**Mapping (Upload):**
- Full field mapping table: Source Field | Target Field | Transformation Rule | Default | Mandatory
- Include lookup tables, value mappings, and derived fields
- Detail concatenation, splitting, and format conversion rules

**Reporting (Upload):**
- Upload execution report: success count, error count, details
- Reconciliation report: source totals vs. loaded totals

**Error Handling:**
- Error classification: data errors, authorization errors, system errors
- Error log format and storage
- Reprocessing strategy for failed records

**Transaction Volume:**
- Estimated record counts per object
- Expected load duration and performance requirements
- Parallel processing strategy for large volumes

**Batch Frequency:**
- One-time cutover load vs. recurring delta loads
- Scheduling requirements and job dependencies

=== DOWNLOAD (SAP → External) ===

**Download Target:**
- Target system or file destination
- File format and delivery mechanism (SFTP, API, shared drive)

**Download Selection:**
- Data selection criteria: date range, organizational units, status filters
- Performance considerations for large extractions

**Download Validation:**
- Post-extraction validation rules
- Completeness and accuracy checks

**Download Authorization:**
- Authorization checks for data extraction
- Data privacy considerations (GDPR, masking)

**Download Data Selection / Error:**
- Error handling during extraction
- Partial failure handling

**Download Flow:**
- End-to-end extraction process flow
- Scheduling and automation

**Download Mapping:**
- SAP field to target field mapping table
- Transformation and formatting rules

**Reporting (Download):**
- Extraction execution report
- Reconciliation with target system

**Batch Frequency (Download):**
- Extraction scheduling: daily, weekly, on-demand
- Delta vs. full extraction strategy

**Appendix (Conversion):**
- Sample source files
- Value mapping tables
- Load sequence diagram\n`,

    workflow: `\nFSD TYPE: WORKFLOW (SAP Business Workflow / Approval Chains)
${commonSections}
TYPE-SPECIFIC SECTIONS (you MUST include all of these as sub-sections):

**Workflow Definition:**
- Workflow template ID and description
- Triggering events: business object events, change documents, custom triggers
- Workflow container elements and their bindings to business object attributes

**Approval Chain Logic:**
- Approval levels, conditions, and thresholds
- Parallel vs. sequential approval patterns
- Escalation paths and deadlines per approval step
- Auto-approval rules and bypass conditions

**Agent Determination:**
- Agent determination rules per step: organizational, rule-based, custom expression
- Responsible agent resolution: position, job, role, user
- Substitution and delegation rules

**Notification Templates:**
- Email/notification templates for each workflow step
- Include subject line, body text, and dynamic placeholders
- Work item text and decision options (approve/reject/rework)

**Monitoring & Administration:**
- Workflow monitoring transactions (SWI5, SWI6, SWI14)
- Restart and repair procedures for stuck workflows
- Admin override capabilities
- Reporting on workflow throughput and SLA compliance

**Test (Workflow):**
- Test cases for each approval path (approve, reject, escalate, timeout)
- Test agent determination with different organizational assignments
- Test substitution and delegation scenarios\n`,
  };

  return typeInstructions[fsdType] || "";
}

/** Build S/4HANA standard FSD instruction (type = "standard" or undefined) */
function buildStandardFsdInstruction(): string {
  return `
COMMON SECTIONS TO INCLUDE:
- Business Background: Why this development/configuration is needed
- Why SAP Standard Is Not Sufficient: What gaps exist (if any — for config-only FSDs, explain why configuration is needed)
- Alternative Approaches Considered: Briefly list alternatives evaluated
- Out of Scope: What is NOT covered
- Assumptions: Key assumptions (landscape, data, access)
- Dependencies: Related projects, objects, or teams
- Purpose & Prerequisites: Document purpose and reader prerequisites
- Overview & Definitions: Key terms and abbreviations
- Scope: Functional scope with solution components
- Business Requirements: Detailed requirements traceable to business needs
- Extension Requirements: Custom developments needed (if any)
- Integration Requirements: Integration points with other modules/systems
- Analytics Requirements: Reporting and analytics needs
- Data Requirements: Master data, transactional data, migration needs
- Security Requirements: Authorization objects, roles, SoD considerations
- Testing Requirements: Test approach and key test scenarios
`;
}

/** Build type-specific sub-sections for the Proposed Solution (Section 4) */
function buildTypeSpecificSolutionSections(fsdType?: FsdType, module?: string, depth?: string): string {
  if (!fsdType || fsdType === "standard") return "";
  const detailed = depth === "comprehensive";

  const sections: Record<string, string> = {
    enhancement: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

### 4.4 Enhancement Logic
- Identify the specific BAdI / Enhancement Spot / User Exit / Implicit Enhancement
- Provide: BAdI definition name, filter values, implementation class/method name
- Write the enhancement logic in structured pseudo-code (IF/ELSE/LOOP)
- Include before/after behavior comparison table: Scenario | Standard Behavior | Enhanced Behavior
- Detail activation/deactivation strategy

### 4.5 Data Model
- List custom tables (Z-tables), append structures, CI includes
- Table: Object Type | Name | Description | Key Fields | Relationship
- Include custom data elements and domains if needed
- Detail any CDS view extensions`,

    interface: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

### 4.4 API / Web Service Specification
- Interface type (IDoc/BAPI/RFC/REST/OData/SOAP), direction, protocol
- Source system → Target system with middleware details

### 4.5 API Business Object & Signature
- Business Object name, BAPI/API name
- Parameter table: Parameter | Direction | Type | Length | Mandatory | Description

### 4.6 Field Mapping
- Full mapping table: Source Field | Target Field | Transformation Rule | Default | Mandatory
- Include ${detailed ? "15-20" : "8-12"} field mappings

### 4.7 API Data Validation
- Input validation rules table: Field | Rule | Error Code | Severity
- Cross-field validations

### 4.8 Processing Logic
- Step-by-step processing logic in pseudo-code
- Include retry logic, idempotency handling

### 4.9 Confirmation & Error Handling
- Success response structure
- Error response: Code | Message | Severity | Resolution
- Alerting and monitoring setup (AIF, SLT, custom)

### 4.10 IDoc Structure (if applicable)
- Message type, IDoc type, segments, partner profiles

### 4.11 Inbound Processing
- Function module / process code, posting logic, duplicate checks

### 4.12 Outbound Processing
- Triggering event, filter rules, serialization requirements`,

    report: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

### 4.4 Selection Criteria
- Selection screen layout with field table: Parameter | Field/Table | Type | Mandatory | Default | F4 Help
- Include ${detailed ? "10-14" : "6-8"} selection parameters
- Dynamic screen behavior rules

### 4.5 Data Selection & Processing Logic
- Data selection logic: tables/CDS views, join conditions, WHERE clauses
- Performance optimization approach (indexes, buffering, parallel processing)

### 4.6 Authorizations
- Authorization objects table: Auth Object | Field | Values | Description
- Organizational level restrictions

### 4.7 Report Output (ALV Layout)
- ALV columns table: Column | Field | Header Text | Width | Alignment | Totals | Conditional Format
- Include ${detailed ? "15-20" : "8-12"} columns
- Color coding and traffic light rules
- Subtotals and grouping hierarchy

### 4.8 Drilldown Navigation
- Drilldown table: Clickable Field | Target Transaction/Report | Parameters Passed
- Popup details and secondary list behavior

### 4.9 Batch Scheduling
- Job name, frequency, variant, server group
- Job chain dependencies and monitoring`,

    form: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

### 4.4 Existing Form (Current State)
- Current form name, type, and what is changing

### 4.5 Print Program / Data Model
- Driver program, data retrieval logic
- Data model: header data, item data, text data, partner data

### 4.6 Form Layout
- Page structure: first page, subsequent pages, final page, copies
- Window definitions: MAIN, HEADER, FOOTER, ADDRESS, LOGO
- Field placement wireframe or ASCII mockup

### 4.7 Styles
- Font table: Element | Font Family | Size | Style (Bold/Italic) | Color
- Paragraph formats and table formatting rules

### 4.8 Paper / Printing
- Paper size, orientation, margins
- Printer configuration, duplex, tray selection

### 4.9 Long Texts
- SAP text objects/IDs used, text include handling

### 4.10 Legal Requirements
- Tax information, regulatory disclaimers, country-specific compliance

### 4.11 Follow-on / Output Determination
- Output types, condition records, email distribution
- Archive linkage (ArchiveLink/DMS)`,

    conversion: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

=== UPLOAD (Legacy → SAP) ===

### 4.4 Upload Business Object & Method
- Business object, target BAPI/transaction, update method (BAPI/BDC/LTMC/Direct Input)

### 4.5 Source File Specification
- File format, layout, delimiter, encoding
- Sample file structure with column definitions

### 4.6 Source Validation & Selection Screen
- Pre-load validation rules
- Upload program selection screen parameters

### 4.7 Field Mapping (Upload)
- Full mapping table: Source Column | Target Field | Transformation | Default | Mandatory
- Include ${detailed ? "20-30" : "12-18"} field mappings
- Lookup tables and value mapping rules

### 4.8 Error Handling & Reporting (Upload)
- Error classification and handling
- Upload execution report format: success/error counts
- Reconciliation approach

### 4.9 Volume & Scheduling (Upload)
- Estimated record counts, expected duration, parallel processing
- One-time vs. recurring loads

=== DOWNLOAD (SAP → External) ===

### 4.10 Download Specification
- Target system, file format, delivery mechanism
- Selection criteria, authorization checks
- Field mapping (SAP → target)

### 4.11 Reconciliation & Monitoring
- Post-extraction validation
- Extraction scheduling and reporting`,

    workflow: `
MANDATORY TYPE-SPECIFIC SUB-SECTIONS (include after 4.3):

### 4.4 Workflow Definition
- Workflow template ID, triggering events
- Container elements and bindings

### 4.5 Approval Chain
- Approval levels table: Level | Condition | Approver Determination | Deadline | Escalation
- Parallel vs. sequential patterns
- Auto-approval and bypass rules

### 4.6 Agent Determination
- Rules per step: organizational, rule-based, custom expression
- Substitution and delegation rules

### 4.7 Notification Templates
- Email templates table: Step | Subject | Body Template | Recipient
- Work item text and decision options

### 4.8 Monitoring & Administration
- Monitoring transactions, restart procedures
- Admin override capabilities, SLA reporting`,
  };

  return sections[fsdType] || "";
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
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const wordLimit = depth === "comprehensive" ? 400 : 200;
  const consultingFramework = buildConsultingFramework("business-analyst");
  const commonSectionsPrompt = fsdType && fsdType !== "standard" ? `

IMPORTANT: After the executive summary paragraphs, you MUST also include these sub-sections (as ### headers):

### 2.1 Business Background
Explain why this ${fsdType} development is needed. What business process or pain point triggered this requirement?

### 2.2 Why SAP Standard Is Not Sufficient
Explicitly state what gaps exist in SAP standard functionality that require this custom ${fsdType}.

### 2.3 Alternative Approaches Considered
List 2-3 alternative approaches that were evaluated (e.g., different enhancement points, third-party tools, workarounds) and explain why they were rejected.

### 2.4 Out of Scope
Clearly list what is NOT covered by this specification (related but excluded processes, future phases, etc.).

### 2.5 Assumptions
List 3-5 key assumptions (system landscape, data quality, user training, organizational readiness).

### 2.6 Dependencies
List dependencies on other projects, FSDs, transports, master data, or teams.

### 2.7 Related Links
Placeholder section for links to related documents, Jira tickets, or references.
` : "";

  const prompt = `You are a senior SAP functional consultant at a top consulting firm. Write a professional executive summary for a Functional Specification Document (FSD).
${consultingFramework}
${userPriority}
${langInstruction}${depthInstruction}${fsdTypeInstruction}
Title: ${title}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

Write ${depth === "comprehensive" ? "4-5" : "2-3"} concise paragraphs covering:
1. Purpose of this specification document
2. Scope — what business processes are covered
3. Expected business benefits and outcomes${depth === "comprehensive" ? "\n4. Key stakeholders and organizational impact\n5. Success criteria and KPIs" : ""}
${commonSectionsPrompt}
Rules:
- Be specific to SAP ${module} and the ${processArea} process
- Use professional consulting language
${fsdType && fsdType !== "standard" ? "- Include ALL the sub-sections listed above — do not skip any" : "- Do NOT use markdown headers — just plain paragraphs"}
- Keep the executive summary under ${wordLimit} words (sub-sections can be additional)`;

  // Increase tokens when type-specific sections are included
  const hasTypeSections = fsdType && fsdType !== "standard";
  const maxTokens = hasTypeSections
    ? (depth === "comprehensive" ? 6144 : 4096)
    : (depth === "comprehensive" ? 4096 : 2048);
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
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const consultingFramework = buildConsultingFramework("solution-architect");
  // Build type-specific sub-sections for the proposed solution
  const typeSpecificSolution = buildTypeSpecificSolutionSections(fsdType, module, depth);

  const prompt = `You are a senior SAP ${module} solution architect. Design the proposed solution for this FSD.
${consultingFramework}
${userPriority}
${langInstruction}${depthInstruction}${fsdTypeInstruction}
Requirements: ${requirements}
Process Area: ${processArea}
Available SAP Tables: ${tables.slice(0, 15).join(', ') || 'Standard ' + module + ' tables'}
Key Transactions: ${tcodes.slice(0, 15).join(', ') || 'Standard ' + module + ' transactions'}
Fiori Apps: ${fioriApps.slice(0, 8).join(', ') || 'Standard ' + module + ' Fiori apps'}

Write the following in markdown format:

### 4.1 Solution Overview
A ${depth === "comprehensive" ? "4-5" : "2-3"} sentence overview of the solution approach. Reference the user's specific requirements — do NOT write a generic overview.

### 4.2 To-Be Process Flow
A numbered step-by-step process flow (${depth === "comprehensive" ? "12-18" : "8-12"} steps) showing the end-to-end process.
Format each step as: **Step N: [Action]** — [Who] uses [Transaction/App] to [what]. Output: [result]
Example: **Step 1: Create Purchase Requisition** — Requestor uses ME51N to enter material requirements. Output: PR document created with approval status "Pending".
Use → arrows between steps for flow direction. Include decision gateways where applicable.

### 4.3 Key Design Decisions
A markdown table with columns: Decision | Option Chosen | Rationale
Include ${depth === "comprehensive" ? "8-10" : "4-6"} design decisions specific to this process. Decisions MUST reference the user's requirements — not generic SAP best practices.
${typeSpecificSolution}
Rules:
- Be specific to SAP ${module}
- Reference actual tcodes and Fiori apps from the list above
- Keep it practical and implementable
- Every process step and design decision must be traceable to the user's input
${typeSpecificSolution ? "- Include ALL type-specific sub-sections listed above — these are MANDATORY for this FSD type" : ""}`;

  // Increase tokens significantly when type-specific sections are included (interface can have 12+ sub-sections)
  const hasTypeSections = fsdType && fsdType !== "standard";
  const maxTokens = hasTypeSections
    ? (depth === "comprehensive" ? 8192 : 6144)
    : (depth === "comprehensive" ? 4096 : 2048);
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
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const consultingFramework = buildConsultingFramework("technical-consultant");
  const prompt = `You are an SAP ${module} consultant. Define the output management requirements for this FSD.
${consultingFramework}
${userPriority}
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
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const consultingFramework = buildConsultingFramework("technical-consultant");
  const prompt = `You are an SAP ${module} consultant. Define error handling and validations for this FSD.
${consultingFramework}
${userPriority}
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
  const userPriority = buildUserInputPriorityInstruction(""); // No requirements context needed for migration
  const consultingFramework = buildConsultingFramework("project-manager");
  const prompt = `You are an SAP ${module} data migration specialist. Define the data migration plan for this FSD.
${consultingFramework}
${userPriority}
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
  const consultingFramework = buildConsultingFramework("project-manager");
  const prompt = `You are an SAP ${module} cutover manager. Define the cutover and go-live plan for this FSD.
${consultingFramework}
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
  const consultingFramework = buildConsultingFramework("bpmn-architect");
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const prompt = `You are an SAP ${module} process architect creating a BPMN 2.0 process diagram for SAP Signavio.
${personalityTraining}${consultingFramework}
${userPriority}
${langInstruction}${depthInstruction}${fsdTypeInstruction}
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

  const userPriority = buildUserInputPriorityInstruction(requirements);
  const consultingFramework = buildConsultingFramework("general");
  const prompt = `You are a senior SAP ${module} test manager. Generate detailed test scripts for a Functional Specification Document.
${consultingFramework}
${userPriority}
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
  const consultingFramework = buildConsultingFramework("project-director");
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const prompt = `You are a Senior SAP Project Director leading a team of 5 specialist consultants who will collaboratively write a Functional Specification Document (FSD). Your job is to deeply analyze the business requirements and create a comprehensive brief that all specialists will reference to ensure consistency.
${personalityTraining}${consultingFramework}
${userPriority}
${depthInstruction}${fsdTypeInstruction}
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
  const consultingFramework = buildConsultingFramework("business-analyst");
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const wordLimit = depth === "comprehensive" ? 500 : 250;
  const prompt = `You are a Senior SAP Business Analyst on an Agent Team writing a Functional Specification Document. Your Project Director has analyzed the requirements and provided a brief below. You MUST align your output with the Project Director's analysis — use the same terminology, reference the same process steps, and follow the design decisions.
${personalityTraining}${consultingFramework}
${userPriority}

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
  const consultingFramework = buildConsultingFramework("solution-architect");
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const prompt = `You are a Senior SAP ${module} Solution Architect on an Agent Team writing a Functional Specification Document. Your Project Director has analyzed the requirements and provided a brief below. You MUST align your solution with the Project Director's process steps and design decisions.
${personalityTraining}${consultingFramework}
${userPriority}

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
  const consultingFramework = buildConsultingFramework("technical-consultant");
  const userPriority = buildUserInputPriorityInstruction(requirements);
  const prompt = `You are a Senior SAP ${module} Technical Consultant on an Agent Team. Your Project Director has provided a brief below. Align your specifications with the Project Director's process steps, design decisions, and risk areas.
${personalityTraining}${consultingFramework}
${userPriority}

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
  const consultingFramework = buildConsultingFramework("project-manager");
  const prompt = `You are a Senior SAP ${module} Project Manager on an Agent Team. Your Project Director has provided a brief below. Align your plans with the Project Director's process steps, risk areas, and scope boundaries.
${personalityTraining}${consultingFramework}

${teamLeadBrief}

${langInstruction}${depthInstruction}${fsdTypeInstruction}
Process Area: ${processArea}
Key Tables: ${tables.slice(0, 15).join(", ") || "Standard " + module + " tables"}

IMPORTANT: Only include migration objects and cutover tasks directly relevant to the user's process. Do not include generic module-wide migration objects that are unrelated to the specified requirement.

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
  const consultingFramework = buildConsultingFramework("quality-reviewer");
  const prompt = `You are a Senior SAP Quality Reviewer. Five specialists wrote sections of an FSD. Review ALL outputs for consistency, alignment with the Project Director's brief, and consulting-grade quality, then return CORRECTED versions.
${consultingFramework}

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
6. PYRAMID PRINCIPLE compliance (every section leads with its conclusion)
7. MECE compliance (lists and tables have no overlaps, no gaps)
8. SCR structure in Executive Summary (Situation → Complication → Resolution)
9. QUANTIFIED BENEFITS (replace vague "improved efficiency" with specific metrics)

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

  const consultingFramework = buildConsultingFramework("cross-critique");
  const prompt = `You are a Senior SAP ${module} ${reviewerRole} performing a CROSS-CRITIQUE review. You are reviewing the work of the ${authorRole} from YOUR unique perspective as a ${reviewerRole}.
${consultingFramework}
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
