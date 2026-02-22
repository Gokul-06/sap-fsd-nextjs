/**
 * SAP Functional Specification Document (FSD) Template
 * Standardized template applicable across all SAP modules
 */

export interface FSDSection {
  id: string;
  title: string;
  description: string;
  required: boolean;
  subsections?: FSDSubSection[];
}

export interface FSDSubSection {
  id: string;
  title: string;
  placeholder: string;
}

export const FSD_TEMPLATE_SECTIONS: FSDSection[] = [
  {
    id: "doc_control",
    title: "1. Document Control",
    description: "Version history, approvals, and distribution",
    required: true,
    subsections: [
      { id: "version_history", title: "1.1 Version History", placeholder: "| Version | Date | Author | Description |\n|---------|------|--------|-------------|\n| 1.0 | {DATE} | {AUTHOR} | Initial Draft |" },
      { id: "approvals", title: "1.2 Approvals", placeholder: "| Role | Name | Signature | Date |\n|------|------|-----------|------|\n| Functional Lead | | | |\n| Technical Lead | | | |\n| Business Owner | | | |" },
      { id: "distribution", title: "1.3 Distribution List", placeholder: "| Name | Role | Organization |\n|------|------|--------------|\n| | | |" },
    ],
  },
  {
    id: "executive_summary",
    title: "2. Executive Summary",
    description: "High-level overview of the requirement and proposed solution",
    required: true,
    subsections: [
      { id: "purpose", title: "2.1 Purpose", placeholder: "Brief description of the document purpose and the business need it addresses." },
      { id: "scope", title: "2.2 Scope", placeholder: "Define what is in-scope and out-of-scope for this specification." },
      { id: "sap_module", title: "2.3 SAP Module(s)", placeholder: "Primary: {MODULE}\nSecondary: {RELATED_MODULES}" },
      { id: "references", title: "2.4 Related Documents", placeholder: "| Document | Version | Description |\n|----------|---------|-------------|\n| BRD | | Business Requirements Document |\n| | | |" },
    ],
  },
  {
    id: "business_requirements",
    title: "3. Business Requirements",
    description: "Detailed business requirements and current pain points",
    required: true,
    subsections: [
      { id: "current_process", title: "3.1 Current Process (As-Is)", placeholder: "Describe the current business process, including pain points and limitations." },
      { id: "business_rules", title: "3.2 Business Rules", placeholder: "| Rule ID | Description | Module | Priority |\n|---------|-------------|--------|----------|\n| BR-001 | | | |" },
      { id: "requirements_list", title: "3.3 Functional Requirements", placeholder: "| Req ID | Description | Priority | Module | MoSCoW |\n|--------|-------------|----------|--------|--------|\n| FR-001 | | | | Must |\n| FR-002 | | | | Should |" },
      { id: "non_functional", title: "3.4 Non-Functional Requirements", placeholder: "Performance, scalability, compliance, and other non-functional requirements." },
    ],
  },
  {
    id: "proposed_solution",
    title: "4. Proposed Solution (To-Be)",
    description: "Detailed SAP solution design",
    required: true,
    subsections: [
      { id: "solution_overview", title: "4.1 Solution Overview", placeholder: "High-level description of the proposed SAP solution." },
      { id: "process_flow", title: "4.2 Process Flow (To-Be)", placeholder: "```\n[Step 1] → [Step 2] → [Step 3] → [Step 4]\n```\nDetailed step-by-step process flow with SAP transactions/apps." },
      { id: "solution_components", title: "4.3 Solution Components", placeholder: "List of SAP components, transactions, Fiori apps, and custom developments involved." },
      { id: "decision_points", title: "4.4 Key Design Decisions", placeholder: "| Decision | Options Considered | Selected Option | Rationale |\n|----------|-------------------|-----------------|-----------|" },
    ],
  },
  {
    id: "sap_configuration",
    title: "5. SAP Configuration",
    description: "Required SAP customizing and configuration",
    required: true,
    subsections: [
      { id: "org_structure", title: "5.1 Organizational Structure", placeholder: "Relevant organizational units (Company Code, Plant, Purchasing Org, etc.)" },
      { id: "master_data", title: "5.2 Master Data Requirements", placeholder: "| Master Data Object | Fields / Views | Responsibility | Migration? |\n|-------------------|----------------|----------------|------------|\n| | | | |" },
      { id: "config_items", title: "5.3 Configuration Items", placeholder: "| Config Item | SPRO Path / TCode | Current Setting | New Setting | Rationale |\n|-------------|-------------------|-----------------|-------------|-----------|" },
      { id: "number_ranges", title: "5.4 Number Ranges", placeholder: "| Object | Range | Internal/External | Description |\n|--------|-------|-------------------|-------------|" },
    ],
  },
  {
    id: "technical_objects",
    title: "6. Technical Objects",
    description: "Tables, CDS views, BAPIs, and custom developments",
    required: true,
    subsections: [
      { id: "standard_tables", title: "6.1 Standard SAP Tables", placeholder: "| Table | Description | Usage in This Spec |\n|-------|-------------|-------------------|\n| | | |" },
      { id: "cds_views", title: "6.2 CDS Views / OData Services", placeholder: "| CDS View / Service | Description | Usage |\n|--------------------|-------------|-------|\n| | | |" },
      { id: "fiori_apps", title: "6.3 Fiori Apps", placeholder: "| App ID | App Name | Usage | Custom Extension? |\n|--------|----------|-------|------------------|\n| | | | |" },
      { id: "custom_development", title: "6.4 Custom Development", placeholder: "| Object Type | Name | Description | Complexity |\n|-------------|------|-------------|------------|\n| Enhancement | | | |\n| Report | | | |\n| Interface | | | |" },
      { id: "bapis_rfcs", title: "6.5 BAPIs / RFCs / APIs", placeholder: "| BAPI/RFC/API | Description | Direction | Usage |\n|-------------|-------------|-----------|-------|\n| | | | |" },
    ],
  },
  {
    id: "integration",
    title: "7. Integration & Interfaces",
    description: "Cross-module and external system integration",
    required: true,
    subsections: [
      { id: "cross_module", title: "7.1 Cross-Module Integration", placeholder: "| Source Module | Target Module | Integration Point | Data Flow |\n|--------------|---------------|-------------------|-----------|" },
      { id: "external_interfaces", title: "7.2 External Interfaces", placeholder: "| Interface ID | Source System | Target System | Protocol | Frequency | Data |\n|-------------|--------------|---------------|----------|-----------|------|\n| IF-001 | | | | | |" },
      { id: "idoc_messages", title: "7.3 IDocs / Message Types", placeholder: "| IDoc Type | Message Type | Direction | Description |\n|-----------|-------------|-----------|-------------|" },
      { id: "middleware", title: "7.4 Middleware / Integration Layer", placeholder: "Describe integration middleware (PI/PO, CPI, AIF) and integration patterns." },
    ],
  },
  {
    id: "authorization",
    title: "8. Authorization & Security",
    description: "Roles, authorizations, and security requirements",
    required: true,
    subsections: [
      { id: "roles", title: "8.1 Roles & Authorization Objects", placeholder: "| Role | Description | Auth Objects | T-Codes / Apps |\n|------|-------------|-------------|----------------|\n| | | | |" },
      { id: "sod", title: "8.2 Segregation of Duties (SoD)", placeholder: "| Conflicting Activities | Risk Level | Mitigation |\n|-----------------------|------------|------------|" },
      { id: "data_privacy", title: "8.3 Data Privacy (GDPR/Compliance)", placeholder: "Data privacy and compliance considerations." },
    ],
  },
  {
    id: "output_forms",
    title: "9. Output Management & Forms",
    description: "Printed outputs, emails, and notifications",
    required: false,
    subsections: [
      { id: "output_types", title: "9.1 Output Types", placeholder: "| Output | Condition | Medium | Form Template |\n|--------|-----------|--------|---------------|\n| | | | |" },
      { id: "email_notifications", title: "9.2 Email Notifications / Workflows", placeholder: "| Trigger | Recipients | Content | Workflow? |\n|---------|-----------|---------|-----------|" },
    ],
  },
  {
    id: "error_handling",
    title: "10. Error Handling & Validations",
    description: "Custom validations, error messages, and exception handling",
    required: true,
    subsections: [
      { id: "validations", title: "10.1 Custom Validations", placeholder: "| Validation | Rule | Error Message | Type (E/W/I) |\n|-----------|------|---------------|---------------|\n| | | | |" },
      { id: "error_scenarios", title: "10.2 Error Scenarios", placeholder: "| Scenario | Expected Behavior | Recovery Action |\n|----------|-------------------|----------------|\n| | | |" },
    ],
  },
  {
    id: "migration",
    title: "11. Data Migration",
    description: "Data migration requirements (if applicable)",
    required: false,
    subsections: [
      { id: "migration_objects", title: "11.1 Migration Objects", placeholder: "| Object | Source | Target | Volume | Tool |\n|--------|--------|--------|--------|------|\n| | | | | LTMC/LSMW |" },
      { id: "migration_approach", title: "11.2 Migration Approach", placeholder: "Describe the migration approach, tools, and cutover plan." },
    ],
  },
  {
    id: "testing",
    title: "12. Test Scenarios",
    description: "Unit test, integration test, and UAT scenarios",
    required: true,
    subsections: [
      { id: "test_scenarios", title: "12.1 Test Scenarios", placeholder: "| Test ID | Scenario | Steps | Expected Result | Module | Priority |\n|---------|----------|-------|-----------------|--------|----------|\n| TS-001 | | | | | High |\n| TS-002 | | | | | Medium |" },
      { id: "integration_tests", title: "12.2 Integration Test Scenarios", placeholder: "| Test ID | Source Module | Target Module | Scenario | Expected Result |\n|---------|--------------|---------------|----------|----------------|" },
      { id: "negative_tests", title: "12.3 Negative / Edge Case Tests", placeholder: "| Test ID | Scenario | Expected Error | Module |\n|---------|----------|----------------|--------|" },
    ],
  },
  {
    id: "cutover",
    title: "13. Cutover & Go-Live",
    description: "Cutover activities, dependencies, and rollback plan",
    required: false,
    subsections: [
      { id: "cutover_tasks", title: "13.1 Cutover Tasks", placeholder: "| Task | Responsible | Duration | Dependency |\n|------|------------|----------|------------|" },
      { id: "rollback", title: "13.2 Rollback Plan", placeholder: "Describe the rollback plan in case of issues during go-live." },
    ],
  },
  {
    id: "appendix",
    title: "14. Appendix",
    description: "Glossary, abbreviations, and supplementary information",
    required: false,
    subsections: [
      { id: "glossary", title: "14.1 Glossary & Abbreviations", placeholder: "| Term | Definition |\n|------|-----------|" },
      { id: "open_items", title: "14.2 Open Items / Assumptions", placeholder: "| ID | Item | Owner | Target Date | Status |\n|----|----- |-------|-------------|--------|\n| OI-001 | | | | Open |" },
    ],
  },
];

export function generateFSDMarkdown(params: {
  title: string;
  module: string;
  relatedModules: string[];
  date: string;
  author: string;
  projectName: string;
  requirements: string;
  processArea: string;
  sections: Record<string, Record<string, string>>;
}): string {
  const { title, module, relatedModules, date, author, projectName, requirements, processArea, sections } = params;

  let md = `# Functional Specification Document\n\n`;
  md += `## ${title}\n\n`;
  md += `**Project:** ${projectName}  \n`;
  md += `**SAP Module:** ${module}  \n`;
  md += `**Related Modules:** ${relatedModules.join(", ")}  \n`;
  md += `**Process Area:** ${processArea}  \n`;
  md += `**Document Status:** DRAFT  \n`;
  md += `**Created:** ${date}  \n`;
  md += `**Author:** ${author}  \n\n`;
  md += `---\n\n`;

  for (const section of FSD_TEMPLATE_SECTIONS) {
    md += `## ${section.title}\n\n`;
    md += `> ${section.description}\n\n`;

    // Check if AI generated full content for this section
    const aiContent = sections[section.id]?.["content"];
    if (aiContent) {
      md += `${aiContent}\n\n`;
      continue;
    }

    if (section.subsections) {
      for (const sub of section.subsections) {
        md += `### ${sub.title}\n\n`;
        const content = sections[section.id]?.[sub.id];
        if (content) {
          md += `${content}\n\n`;
        } else {
          // Apply smart defaults
          let placeholder = sub.placeholder;
          placeholder = placeholder.replace("{DATE}", date);
          placeholder = placeholder.replace("{AUTHOR}", author);
          placeholder = placeholder.replace("{MODULE}", module);
          placeholder = placeholder.replace("{RELATED_MODULES}", relatedModules.join(", "));
          md += `${placeholder}\n\n`;
        }
      }
    }
  }

  return md;
}
