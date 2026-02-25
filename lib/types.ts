// Shared types for the SAP FSD Generator

export interface FSDGenerationRequest {
  title: string;
  projectName: string;
  author: string;
  requirements: string;
  module?: string;
  companyName?: string;
}

export interface FSDGenerationResponse {
  markdown: string;
  primaryModule: string;
  processArea: string;
  classifiedModules: ClassifiedModule[];
  crossModuleImpacts: string[];
  warnings: string[];
  aiEnabled: boolean;
}

export interface ClassifiedModule {
  module: string;
  confidence: number;
  isPrimary: boolean;
  matchedKeywords: string[];
}

export interface FSDHistoryItem {
  id: string;
  title: string;
  projectName: string;
  author: string;
  companyName: string | null;
  primaryModule: string;
  processArea: string;
  aiEnabled: boolean;
  shareId: string | null;
  docxBlobUrl: string | null;
  createdAt: Date;
}

export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────
// FSD Type (RICEFW)
// ─────────────────────────────────────────────

export type FsdType =
  | "standard"
  | "enhancement"
  | "interface"
  | "report"
  | "form"
  | "conversion"
  | "workflow";

export const FSD_TYPE_LABELS: Record<FsdType, string> = {
  standard: "Standard",
  enhancement: "Enhancement (BADIs, User Exits)",
  interface: "Interface (IDocs, APIs, RFC)",
  report: "Report (ALV, Selection Screens)",
  form: "Form (SmartForms, Adobe Forms)",
  conversion: "Conversion (Data Migration)",
  workflow: "Workflow (Approvals, Events)",
};

// ─────────────────────────────────────────────
// Agent Teams Types
// ─────────────────────────────────────────────

export type AgentPhase = "team-lead" | "specialists" | "quality-review" | "complete" | "error";
export type AgentStatus = "pending" | "running" | "completed" | "failed";

export interface AgentInfo {
  name: string;
  role: string;
  status: AgentStatus;
}

export interface AgentProgressEvent {
  phase: AgentPhase;
  status: AgentStatus;
  agents?: AgentInfo[];
  message?: string;
  result?: FSDGenerationResponse;
  error?: string;
}

export interface TeamLeadContext {
  moduleStrategy: string;
  processSteps: string[];
  designDecisions: string[];
  terminologyGlossary: Record<string, string>;
  riskAreas: string[];
  crossModuleConsiderations: string;
  keyStakeholders: string[];
  scopeBoundaries: string;
}
