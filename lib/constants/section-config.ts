/**
 * FSD Section Configuration
 * Enriched metadata for the section selector UI and agent skip logic
 */

export interface SectionConfig {
  id: string;
  number: number;
  title: string;
  description: string;
  required: boolean;
  source: "ai" | "static" | "registry";
  group: "core" | "technical" | "project";
  agentOwner: string | null; // which agent generates this section
}

export const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: "doc_control",
    number: 1,
    title: "Document Control",
    description: "Version history, approvals, and distribution list",
    required: true,
    source: "static",
    group: "core",
    agentOwner: null,
  },
  {
    id: "executive_summary",
    number: 2,
    title: "Executive Summary",
    description: "High-level overview of the requirement and proposed solution",
    required: true,
    source: "ai",
    group: "core",
    agentOwner: "Summary Writer",
  },
  {
    id: "business_requirements",
    number: 3,
    title: "Business Requirements",
    description: "Detailed business requirements and current pain points",
    required: true,
    source: "static",
    group: "core",
    agentOwner: null,
  },
  {
    id: "proposed_solution",
    number: 4,
    title: "Proposed Solution (To-Be)",
    description: "Detailed SAP solution design with process flows",
    required: true,
    source: "ai",
    group: "core",
    agentOwner: "Design Module",
  },
  {
    id: "sap_configuration",
    number: 5,
    title: "SAP Configuration",
    description: "Required SAP customizing and configuration settings",
    required: false,
    source: "registry",
    group: "technical",
    agentOwner: null,
  },
  {
    id: "technical_objects",
    number: 6,
    title: "Technical Objects",
    description: "Tables, CDS views, BAPIs, Fiori apps, and custom developments",
    required: false,
    source: "registry",
    group: "technical",
    agentOwner: null,
  },
  {
    id: "integration",
    number: 7,
    title: "Integration & Interfaces",
    description: "Cross-module and external system integration points",
    required: false,
    source: "static",
    group: "technical",
    agentOwner: null,
  },
  {
    id: "authorization",
    number: 8,
    title: "Authorization & Security",
    description: "Roles, authorizations, SoD, and data privacy",
    required: false,
    source: "registry",
    group: "technical",
    agentOwner: null,
  },
  {
    id: "output_forms",
    number: 9,
    title: "Output Management & Forms",
    description: "Printed outputs, emails, and notifications",
    required: false,
    source: "ai",
    group: "technical",
    agentOwner: "Technical Module",
  },
  {
    id: "error_handling",
    number: 10,
    title: "Error Handling & Validations",
    description: "Custom validations, error messages, and exception handling",
    required: true,
    source: "ai",
    group: "technical",
    agentOwner: "Technical Module",
  },
  {
    id: "migration",
    number: 11,
    title: "Data Migration",
    description: "Data migration requirements, objects, and approach",
    required: false,
    source: "ai",
    group: "project",
    agentOwner: "Planning Module",
  },
  {
    id: "testing",
    number: 12,
    title: "Test Scenarios",
    description: "Unit test, integration test, and UAT scenarios",
    required: true,
    source: "ai",
    group: "project",
    agentOwner: "Test Script Generator",
  },
  {
    id: "cutover",
    number: 13,
    title: "Cutover & Go-Live",
    description: "Cutover activities, dependencies, and rollback plan",
    required: false,
    source: "ai",
    group: "project",
    agentOwner: "Planning Module",
  },
  {
    id: "appendix",
    number: 14,
    title: "Appendix",
    description: "Glossary, abbreviations, and supplementary information",
    required: false,
    source: "static",
    group: "project",
    agentOwner: null,
  },
];

export const ALL_SECTION_IDS = SECTION_CONFIGS.map((s) => s.id);

export interface SectionPreset {
  id: string;
  label: string;
  description: string;
  sectionIds: string[];
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    id: "full",
    label: "Full FSD",
    description: "All 14 sections",
    sectionIds: ALL_SECTION_IDS,
  },
  {
    id: "quick",
    label: "Quick Overview",
    description: "Core sections + testing",
    sectionIds: [
      "doc_control",
      "executive_summary",
      "business_requirements",
      "proposed_solution",
      "error_handling",
      "testing",
    ],
  },
  {
    id: "technical",
    label: "Technical Focus",
    description: "Core + all technical sections",
    sectionIds: [
      "doc_control",
      "executive_summary",
      "business_requirements",
      "proposed_solution",
      "sap_configuration",
      "technical_objects",
      "integration",
      "authorization",
      "output_forms",
      "error_handling",
      "testing",
    ],
  },
  {
    id: "migration",
    label: "Migration Focus",
    description: "Core + migration-related sections",
    sectionIds: [
      "doc_control",
      "executive_summary",
      "business_requirements",
      "proposed_solution",
      "sap_configuration",
      "technical_objects",
      "migration",
      "testing",
      "cutover",
    ],
  },
];

export const SECTION_GROUPS = [
  { key: "core" as const, label: "Core Sections", description: "Essential document structure" },
  { key: "technical" as const, label: "Technical Sections", description: "SAP configuration & technical details" },
  { key: "project" as const, label: "Project Management", description: "Migration, testing & go-live" },
];

export const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  ai: { label: "AI Generated", color: "bg-sky-100 text-sky-700" },
  static: { label: "Template", color: "bg-gray-100 text-gray-600" },
  registry: { label: "SAP Registry", color: "bg-violet-100 text-violet-700" },
};
