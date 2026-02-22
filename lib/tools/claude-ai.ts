/**
 * Claude AI Integration for FSD Generation
 * Calls Anthropic API to generate intelligent narrative content
 * for FSD sections that require contextual writing.
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

async function callClaude(prompt: string): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = message.content[0];
  if (block.type === 'text') {
    return block.text;
  }
  return '';
}

// ─────────────────────────────────────────────
// Section Generators — Each returns markdown
// ─────────────────────────────────────────────

export async function aiExecutiveSummary(
  title: string,
  module: string,
  requirements: string,
  processArea: string,
): Promise<string> {
  const prompt = `You are a senior SAP functional consultant at a top consulting firm. Write a professional executive summary for a Functional Specification Document (FSD).

Title: ${title}
SAP Module: ${module}
Process Area: ${processArea}
Business Requirements: ${requirements}

Write 2-3 concise paragraphs covering:
1. Purpose of this specification document
2. Scope — what business processes are covered
3. Expected business benefits and outcomes

Rules:
- Be specific to SAP ${module} and the ${processArea} process
- Use professional consulting language
- Do NOT use markdown headers — just plain paragraphs
- Keep it under 200 words`;

  return await callClaude(prompt);
}

export async function aiProposedSolution(
  module: string,
  requirements: string,
  processArea: string,
  tables: string[],
  tcodes: string[],
  fioriApps: string[],
): Promise<string> {
  const prompt = `You are a senior SAP ${module} solution architect. Design the proposed solution for this FSD.

Requirements: ${requirements}
Process Area: ${processArea}
Available SAP Tables: ${tables.slice(0, 15).join(', ')}
Key Transactions: ${tcodes.slice(0, 15).join(', ')}
Fiori Apps: ${fioriApps.slice(0, 8).join(', ')}

Write the following in markdown format:

### 4.1 Solution Overview
A 2-3 sentence overview of the solution approach.

### 4.2 To-Be Process Flow
A numbered step-by-step process flow (8-12 steps) showing the end-to-end process. Include the SAP transaction or Fiori app used at each step.

### 4.3 Key Design Decisions
A markdown table with columns: Decision | Option Chosen | Rationale
Include 4-6 design decisions specific to this process.

Rules:
- Be specific to SAP ${module}
- Reference actual tcodes and Fiori apps from the list above
- Keep it practical and implementable`;

  return await callClaude(prompt);
}

export async function aiOutputManagement(
  module: string,
  processArea: string,
  requirements: string,
): Promise<string> {
  const prompt = `You are an SAP ${module} consultant. Define the output management requirements for this FSD.

Process Area: ${processArea}
Requirements: ${requirements}

Write in markdown format:

### 9.1 Output Types
A markdown table with columns: Output Type | Description | Format | Trigger | Recipient
Include 4-6 output types relevant to the ${processArea} process (e.g., purchase orders, GR slips, invoices, approval notifications).

### 9.2 Email Notifications & Workflows
A markdown table with columns: Notification | Trigger Event | Recipients | Template
Include 3-5 workflow notifications.

Rules:
- Be specific to SAP ${module} ${processArea}
- Include both printed outputs and email/workflow notifications
- Reference SAP output types (MEDRUCK, etc.) where applicable`;

  return await callClaude(prompt);
}

export async function aiErrorHandling(
  module: string,
  processArea: string,
  requirements: string,
): Promise<string> {
  const prompt = `You are an SAP ${module} consultant. Define error handling and validations for this FSD.

Process Area: ${processArea}
Requirements: ${requirements}

Write in markdown format:

### 10.1 Input Validations
A markdown table with columns: Field/Check | Validation Rule | Error Message | Severity
Include 6-8 specific input validations for the ${processArea} process.

### 10.2 Business Rule Validations
A markdown table with columns: Rule ID | Business Rule | Action on Failure | Resolution
Include 5-7 business rules (tolerance checks, approval limits, duplicate checks, etc.).

### 10.3 Error Scenarios
A markdown table with columns: Scenario | Root Cause | System Behavior | User Action
Include 4-6 common error scenarios.

Rules:
- Be specific to SAP ${module} ${processArea}
- Include realistic error messages
- Reference SAP message classes where possible`;

  return await callClaude(prompt);
}

export async function aiDataMigration(
  module: string,
  processArea: string,
  tables: string[],
): Promise<string> {
  const prompt = `You are an SAP ${module} data migration specialist. Define the data migration plan for this FSD.

Process Area: ${processArea}
Key Tables: ${tables.slice(0, 15).join(', ')}

Write in markdown format:

### 11.1 Migration Objects
A markdown table with columns: Object | Source | Target Table(s) | Migration Tool | Priority
Include 5-8 migration objects split into master data and transactional data.

### 11.2 Migration Approach
Describe the migration approach in 4-6 bullet points covering:
- Tool selection (LTMC, LSMW, BAPIs, custom programs)
- Data cleansing rules
- Validation and reconciliation approach
- Sequence and dependencies
- Cutover timing

Rules:
- Be specific to SAP ${module}
- Reference actual migration tools available in S/4HANA
- Include realistic dependencies between objects`;

  return await callClaude(prompt);
}

export async function aiCutoverPlan(
  module: string,
  processArea: string,
): Promise<string> {
  const prompt = `You are an SAP ${module} cutover manager. Define the cutover and go-live plan for this FSD.

Process Area: ${processArea}

Write in markdown format:

### 13.1 Cutover Tasks
A markdown table with columns: # | Task | Owner | Duration | Dependencies | Status
Include 10-14 cutover tasks in chronological order (transport, data freeze, migration, validation, go/no-go, etc.).

### 13.2 Rollback Plan
Describe the rollback plan in 4-5 bullet points covering:
- Rollback trigger criteria
- Rollback procedure steps
- Data restoration approach
- Communication plan

Rules:
- Be specific to SAP ${module} ${processArea}
- Include realistic timeframes
- Cover both technical and business cutover activities`;

  return await callClaude(prompt);
}
