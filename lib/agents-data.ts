import {
  Crown,
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AgentStatus = "Active" | "Beta" | "In Development" | "Coming Soon";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  status: AgentStatus;
  color: string;
  bgColor: string;
  capabilities: string[];
  featured?: boolean;
}

export const AGENTS: Agent[] = [
  {
    id: "sap-fsd-author",
    name: "SAP FSD Author Agent",
    role: "Multi-Agent Orchestrator",
    description:
      "The lead agent that orchestrates the full multi-agent pipeline end-to-end. Analyses raw requirements, detects the primary SAP module, and coordinates 6 specialist agents to produce a complete 14-section Functional Specification Document.",
    icon: Sparkles,
    status: "Active",
    color: "#0EA5E9",
    bgColor: "bg-sky-50",
    capabilities: [
      "End-to-End Orchestration",
      "Multi-Agent Coordination",
      "14-Section FSD Generation",
      "Multi-Language Output",
      "Professional Word Export",
      "Cross-Module Detection",
    ],
    featured: true,
  },
  {
    id: "project-director",
    name: "Project Director",
    role: "Strategic Orchestrator",
    description:
      "Leads the agent team by analysing requirements, defining scope boundaries, detecting the primary SAP module, and producing a shared project brief that every downstream specialist follows.",
    icon: Crown,
    status: "Active",
    color: "#8B5CF6",
    bgColor: "bg-violet-50",
    capabilities: [
      "Requirements Analysis",
      "Scope Definition",
      "Module Classification",
      "Team Brief Creation",
    ],
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    role: "Executive Summary Author",
    description:
      "Writes the Executive Summary section of every FSD — scope, purpose, measurable business benefits, and stakeholder context. Bridges business language with SAP capabilities.",
    icon: FileText,
    status: "Active",
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    capabilities: [
      "Executive Summaries",
      "Business Case Writing",
      "Stakeholder Mapping",
      "Benefits Quantification",
    ],
  },
  {
    id: "solution-architect",
    name: "Solution Architect",
    role: "Technical Designer",
    description:
      "Designs the technical SAP solution — to-be process flows, configuration items, master data requirements, and integration architecture across modules.",
    icon: Cpu,
    status: "Active",
    color: "#10B981",
    bgColor: "bg-emerald-50",
    capabilities: [
      "Solution Design",
      "Process Flow Modelling",
      "SAP Configuration",
      "Integration Architecture",
    ],
  },
  {
    id: "technical-consultant",
    name: "Technical Consultant",
    role: "Error & Edge Case Specialist",
    description:
      "Handles error scenarios, custom validations, authorization concepts, and edge case handling. Ensures the specification covers what happens when things go wrong.",
    icon: Wrench,
    status: "Beta",
    color: "#F59E0B",
    bgColor: "bg-amber-50",
    capabilities: [
      "Error Handling",
      "Custom Validations",
      "Authorization Design",
      "Edge Case Analysis",
    ],
  },
  {
    id: "project-manager",
    name: "Project Manager",
    role: "Migration & Cutover Planner",
    description:
      "Plans the migration strategy, test scenarios, cutover activities, and go-live checklist. Produces actionable plans with dependencies and rollback procedures.",
    icon: CalendarCheck,
    status: "Active",
    color: "#EC4899",
    bgColor: "bg-pink-50",
    capabilities: [
      "Migration Planning",
      "Test Scenarios",
      "Cutover Strategy",
      "Go-Live Readiness",
    ],
  },
  {
    id: "bpmn-architect",
    name: "BPMN Process Architect",
    role: "Process Flow Designer",
    description:
      "Generates Signavio-compatible BPMN process diagrams with swim lanes, decision gateways, and end-to-end process visualization for SAP workflows.",
    icon: GitBranch,
    status: "Beta",
    color: "#06B6D4",
    bgColor: "bg-cyan-50",
    capabilities: [
      "BPMN Diagrams",
      "Swim Lane Design",
      "Process Visualization",
      "Signavio Compatibility",
    ],
  },
];

export const statusColorMap: Record<AgentStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-0",
  Beta: "bg-amber-100 text-amber-700 border-0",
  "In Development": "bg-blue-100 text-blue-700 border-0",
  "Coming Soon": "bg-slate-100 text-slate-500 border-0",
};
