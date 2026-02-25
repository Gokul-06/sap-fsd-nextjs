// ─────────────────────────────────────────────
// Agent Training Questionnaires
// 62 role-specific questions across 6 agent roles
// ─────────────────────────────────────────────

export const AGENT_ROLES = [
  "project-director",
  "business-analyst",
  "solution-architect",
  "technical-consultant",
  "project-manager",
  "bpmn-architect",
] as const;

export type AgentRole = (typeof AGENT_ROLES)[number];

export interface AgentRoleMeta {
  role: AgentRole;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  questions: string[];
}

export const AGENT_ROLE_META: Record<AgentRole, AgentRoleMeta> = {
  "project-director": {
    role: "project-director",
    label: "Project Director",
    description:
      "Leads the team, analyzes requirements, creates the shared brief that all specialists follow.",
    icon: "Crown",
    questions: [
      "When you receive new requirements, what's the first thing you analyze?",
      "How do you decide which SAP module is primary vs secondary?",
      "What's your approach to identifying risks in a project?",
      "How do you define scope boundaries — what's your 'in/out' philosophy?",
      "How do you ensure terminology consistency across a large team?",
      "What stakeholder groups do you always consider, even if not mentioned?",
      "How detailed should process steps be — high-level or granular?",
      "What's your philosophy on cross-module integration points?",
      "How do you prioritize design decisions when there are trade-offs?",
      "What's your signature approach that makes your project briefs stand out?",
    ],
  },

  "business-analyst": {
    role: "business-analyst",
    label: "Business Analyst",
    description:
      "Writes the Executive Summary — scope, purpose, benefits, and business context.",
    icon: "FileText",
    questions: [
      "How do you structure an executive summary — what comes first?",
      "What tone do you use — formal corporate or accessible?",
      "How do you quantify business benefits when numbers aren't given?",
      "What's your approach to defining scope — detailed boundaries or high-level?",
      "How do you handle assumptions vs. confirmed requirements?",
      "What stakeholder concerns do you always address?",
      "How long should an executive summary be — concise or comprehensive?",
      "What's your approach to linking business requirements to SAP capabilities?",
      "How do you present risks — embedded in text or separate section?",
      "What makes a great executive summary in your experience?",
    ],
  },

  "solution-architect": {
    role: "solution-architect",
    label: "Solution Architect",
    description:
      "Designs the Proposed Solution — process flows, design decisions, and technical approach.",
    icon: "Cpu",
    questions: [
      "When you see a requirement, what's your first design instinct?",
      "How do you decide between standard SAP config vs custom development?",
      "What's your approach to the To-Be process flow — simple or detailed?",
      "How many design decisions do you typically document and why?",
      "Which SAP tables/tcodes do you reference most for your module?",
      "How do you handle gaps between requirements and SAP standard?",
      "What's your philosophy on enhancements — minimize or embrace?",
      "How do you structure the Proposed Solution section?",
      "What integration patterns do you prefer (IDoc, BAPI, RFC, API)?",
      "How do you address performance considerations in your designs?",
      "What's your approach to authorization/security in solution design?",
      "What distinguishes a great solution architecture from an average one?",
    ],
  },

  "technical-consultant": {
    role: "technical-consultant",
    label: "Technical Consultant",
    description:
      "Handles Error Handling, Output Management — validations, exceptions, reports, and notifications.",
    icon: "Wrench",
    questions: [
      "How do you approach error handling — defensive or permissive?",
      "What validation rules do you always include regardless of requirements?",
      "How do you categorize errors — by severity, by type, or by user impact?",
      "What's your approach to output management (reports, forms, notifications)?",
      "How detailed should error messages be for end users vs logs?",
      "What edge cases do you always consider?",
      "How do you handle data validation across integrated modules?",
      "What's your approach to batch processing error scenarios?",
      "How do you document retry logic and recovery procedures?",
      "What technical details do you always include that others miss?",
    ],
  },

  "project-manager": {
    role: "project-manager",
    label: "Project Manager",
    description:
      "Plans Data Migration and Cutover — timelines, rollback, and go-live strategy.",
    icon: "CalendarCheck",
    questions: [
      "How do you structure a data migration approach — big bang or phased?",
      "What's your risk tolerance for cutover — conservative or aggressive?",
      "How do you estimate timelines for migration activities?",
      "What rollback scenarios do you always plan for?",
      "How detailed should the cutover checklist be?",
      "What stakeholder communication do you build into the plan?",
      "How do you handle legacy data quality issues?",
      "What's your approach to parallel run / dual maintenance periods?",
      "How do you prioritize migration objects?",
      "What makes a cutover plan bulletproof in your experience?",
    ],
  },

  "bpmn-architect": {
    role: "bpmn-architect",
    label: "BPMN Architect",
    description:
      "Creates Signavio-quality BPMN 2.0 process flow diagrams with swim lanes and SAP transaction codes.",
    icon: "GitBranch",
    questions: [
      "How granular should swim lanes be — roles or departments?",
      "How many process steps is ideal for a readable diagram?",
      "When do you use exclusive vs parallel gateways?",
      "How do you handle exception flows — separate path or annotations?",
      "What start/end event patterns do you prefer?",
      "How do you label tasks — verb-noun or detailed descriptions?",
      "Do you include SAP transaction codes on tasks?",
      "How do you represent approvals and decision points?",
      "What's your philosophy on diagram complexity vs readability?",
      "What makes a BPMN diagram Signavio-quality in your view?",
    ],
  },
};

// Helper to get all roles as an array
export function getAllAgentRoles(): AgentRoleMeta[] {
  return AGENT_ROLES.map((role) => AGENT_ROLE_META[role]);
}

// Helper to get questions for a specific role
export function getQuestionsForRole(role: AgentRole): string[] {
  return AGENT_ROLE_META[role]?.questions ?? [];
}
