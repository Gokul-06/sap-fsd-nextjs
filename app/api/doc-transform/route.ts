/**
 * Document Transformation API
 * Accepts a QRG (Word/text) and generates SOP or User Manual
 */

import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/tools/claude-ai";
import { safeErrorResponse } from "@/lib/api-error";

export const maxDuration = 300;

/* ── Prompt: QRG → SOP ── */
function buildSOPPrompt(qrgText: string, processName: string, moduleName: string): string {
  return `You are an expert SAP documentation specialist at Westernacher Consulting. Your task is to transform a Quick Reference Guide (QRG) into a complete Standard Operating Procedure (SOP).

INPUT QRG:
${qrgText}

PROCESS: ${processName}
SAP MODULE: ${moduleName}

Generate a COMPLETE SOP document in markdown format with the following structure. Be thorough, enterprise-grade, and consistent with SAP best practices.

## REQUIRED SECTIONS:

### 1. HEADER
- Title: "${processName}" (same as QRG)
- Document type: Standard Operating Procedure (SOP)
- Version: 1.0
- Author: Gokul Palanisamy
- Date: ${new Date().toLocaleDateString("en-US")}

### 2. VERSION HISTORY TABLE
| Version | Date | Description | Author | Approver |
Generate first row with current date and "Document Creation" by Gokul Palanisamy

### 3. GLOSSARY TABLE
| Term/Abbreviation | Description |
Extract ALL SAP-specific terms from the QRG (T-codes, Movement Types, Stock Types, apps, etc.) and define them. Include at least 10 terms.

### 4. COMMONLY USED ICONS TABLE
| Icon | Description |
Include standard SAP Fiori icons: Execute, Continue, Cancel, Save, Create, Edit/Change, Copy, Delete, Filter, Sort, Find, Refresh, Display Additional Data

### 5. PROCESS OVERVIEW
Write 3-5 detailed paragraphs explaining:
- The purpose of this process end-to-end
- Who performs it and when
- How it connects to upstream/downstream processes
- Business significance and compliance implications
- System behavior and automation aspects
Write this as a professional narrative, not bullet points.

### 6. PROCESS FLOW
State: "Refer to Process Flow diagram" (placeholder for Visio)

### 7. PROCESS STEPS TABLE
| Step No. | Action |
Transform each QRG step into detailed SOP steps. For each step:
- Include sub-steps numbered clearly
- Add SAP navigation paths
- Include field-level details
- Add tips and verification points
- Reference the Fiori app names

### 8. APPENDICES

#### 8.1 What If / Exceptions
Generate AT LEAST 8 exception scenarios relevant to this process. For each:
- Title the exception (e.g., "Purchase Order Not Available for Goods Receipt")
- List 4-6 bullet point resolution steps
Think about: wrong data entry, system errors, missing data, authorization issues, device failures, configuration problems, quantity mismatches, output failures

#### 8.2 SAP Fiori Scenario – Additional Exceptions
Add 3-5 Fiori-specific exceptions (app not loading, session timeout, offline scenarios)

#### 8.3 Recommended Process Controls
Organize into these sub-sections:
**1. Pre-Process Controls** (documentation readiness, system readiness, device readiness)
**2. Execution Controls** (data validation, verification checks, cross-references)
**3. Post-Process Controls** (status verification, inventory checks, release authorization)
**4. Documentation & Traceability Controls** (archival, labeling, audit trail)

For each control, include specific checkpoints with bullet points.

FORMAT RULES:
- Use clean markdown with ## for sections, ### for sub-sections, #### for sub-sub-sections
- Use markdown tables where specified
- Use bullet points (- ) for lists
- Be specific to SAP — reference real T-codes, Fiori apps, movement types, tables
- Write in professional enterprise English
- Every section must be substantive — no placeholders or "to be determined"
- Target 3000+ words total`;
}

/* ── Prompt: QRG → User Manual ── */
function buildUserManualPrompt(qrgText: string, processName: string, moduleName: string): string {
  return `You are an expert SAP documentation specialist at Westernacher Consulting. Your task is to transform a Quick Reference Guide (QRG) into a complete User Manual following the HPC enterprise template structure.

INPUT QRG:
${qrgText}

PROCESS: ${processName}
SAP MODULE: ${moduleName}

Generate a COMPLETE User Manual in markdown format with the following structure. This must be enterprise-grade, thorough, and usable as a standalone training document.

## REQUIRED SECTIONS:

### COVER PAGE
- Project: SAP Implementation Project
- Document Title: "${processName} — User Manual"
- Document Number: UM-${moduleName}-001
- Revision: 0
- Author: Gokul Palanisamy
- Date: ${new Date().toLocaleDateString("en-US")}

### REVISION HISTORY TABLE
| Rev | Date | Revision Purpose | Description of Change | Author |
First row: Rev 0, current date, "New document", "Initial version", Gokul Palanisamy

### TABLE OF CONTENTS
Generate a proper numbered TOC for all sections

### 1. PURPOSE AND SCOPE

#### 1.1 Purpose
Write 2-3 paragraphs explaining:
- What this manual covers
- Who should use it
- What the reader will learn

#### 1.2 Scope
Define the boundaries:
- Which SAP processes are covered
- Which SAP modules/apps are involved
- What is NOT covered (explicit exclusions)

### 2. REQUIREMENTS

#### 2.1 System Requirements
- SAP Fiori Launchpad access
- Required roles and authorizations
- Browser requirements
- Network/connectivity requirements

#### 2.2 Process Requirements
- Pre-requisite master data (vendor, material, plant)
- Required upstream processes (e.g., PO must exist before GR)
- Required authorizations and approvals

### 3. PROCESS ACTIVITY — DESCRIPTION

#### 3.1 Process Map
State: "Refer to attached Process Flow diagram"
Describe the high-level flow in text: Step A → Step B → Step C

#### 3.2 Process Description
Write a comprehensive narrative (4-6 paragraphs) explaining:
- The end-to-end business process
- Key decision points
- System integrations
- Business rules and validations

#### 3.3 Roles and Responsibilities
| Role | Responsibilities |
Include at least 4 roles (Warehouse Clerk, Quality Control, Purchasing, Supervisor/Manager)

### 4. DETAILED PROCESS STEPS
For EACH step from the QRG, create a detailed section:

#### 4.X [Step Name]
**Navigation:** SAP Fiori Launchpad → App Name
**Prerequisites:** What must be done before this step
**Procedure:**
1. Numbered step-by-step instructions
2. Include field names, expected values
3. Add verification points
**Expected Result:** What should happen
**Tips:** Practical advice
**Common Errors:** What can go wrong and how to fix it

Transform ALL QRG steps into this detailed format.

### 5. PROCESS INTERFACES

#### 5.1 Inputs
| Process Step | Input From | Interface Information |
Map all inputs to each process step

#### 5.2 Outputs
| Process Step | Output To | Interface Information |
Map all outputs from each process step

### 6. TRAINING REQUIREMENTS
| Training Activity | Target Audience | Method |
Include at least 4 training activities

### 7. WORK PROCESS METRICS
| Metric Description | Leading/Lagging | Metric Information |
Include at least 4 metrics (processing time, accuracy rate, exception rate, compliance rate)

### 8. ASSURANCE ACTIVITIES

#### 8.1 Requirements
List applicable requirements:
- Internal process requirements
- Regulatory/compliance requirements
- Quality management requirements

#### 8.2 Assurance Activities
| Assurance Activity | LOD Level | Frequency | Executed By |
Include at least 3 activities

#### 8.3 Records Management
Describe document retention requirements

### APPENDICES

#### Appendix A — Abbreviations
| Abbreviation | Complete Term |
Extract ALL abbreviations from the QRG and define them (at least 10)

#### Appendix B — Glossary
| Term | Definition |
Define all technical terms (at least 10)

#### Appendix C — References
| No. | Document No. | Document Title |
Reference the QRG, SOP, and any related documents

#### Appendix D — Detailed Revision Description
| Rev | Date | Section | Description | Author |
First entry with current info

FORMAT RULES:
- Use clean markdown with ## for sections, ### for sub-sections
- Use markdown tables where specified
- Be specific to SAP — use real Fiori app names, T-codes, field names
- Write in professional enterprise English
- Every section must have real content — no "TBD" or "to be added"
- This should be usable as-is for training
- Target 4000+ words total`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const qrgText = formData.get("qrgText") as string | null;
    const outputType = formData.get("outputType") as string; // "sop" or "manual"
    const processName = formData.get("processName") as string;
    const moduleName = formData.get("moduleName") as string || "MM";

    let inputText = qrgText || "";

    // Parse Word file if provided
    if (file && file.size > 0) {
      try {
        const mammoth = await import("mammoth");
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await mammoth.convertToHtml({ buffer });
        // Strip HTML tags to get clean text
        inputText = result.value
          .replace(/<[^>]+>/g, "\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
      } catch {
        // Fallback: try reading as text
        inputText = await file.text();
      }
    }

    if (!inputText.trim()) {
      return NextResponse.json({ error: "No QRG content provided" }, { status: 400 });
    }

    if (!processName) {
      return NextResponse.json({ error: "Process name is required" }, { status: 400 });
    }

    // Build prompt based on output type
    const prompt = outputType === "manual"
      ? buildUserManualPrompt(inputText, processName, moduleName)
      : buildSOPPrompt(inputText, processName, moduleName);

    // Call Claude with high token limit for long documents
    const result = await callClaude(prompt, 8192);

    return NextResponse.json({
      success: true,
      outputType,
      processName,
      content: result,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorResponse(error, "Doc transform") },
      { status: 500 }
    );
  }
}
