/**
 * SAP Cloud ALM — Mock Data for Demo Mode
 * Realistic Westernacher project data for showcasing the CALM integration.
 * Activated when CALM_DEMO_MODE=true (no real API credentials needed).
 */

import type { CalmProjectSummary, CalmRequirementForFsd } from "./calm-types";

// ─── Mock Projects ──────────────────────────────────────

export const MOCK_PROJECTS: CalmProjectSummary[] = [
  {
    id: "PROJ-WE-S4HANA-2026",
    name: "S/4HANA Transformation — Westernacher Global",
    description: "End-to-end S/4HANA migration for Westernacher global operations including MM, SD, FI, CO, PP modules.",
  },
  {
    id: "PROJ-WE-EWM-ROLLOUT",
    name: "EWM Rollout — European Distribution Centers",
    description: "Extended Warehouse Management implementation across 5 European distribution centers.",
  },
  {
    id: "PROJ-WE-TM-INTEGRATION",
    name: "Transportation Management Integration",
    description: "SAP TM integration with existing logistics partners and carrier management systems.",
  },
  {
    id: "PROJ-WE-FIORI-UX",
    name: "Fiori UX Modernization",
    description: "Fiori launchpad rollout and custom app development for key business processes.",
  },
  {
    id: "PROJ-WE-BTP-EXTENSIONS",
    name: "BTP Side-by-Side Extensions",
    description: "SAP BTP extensions including CAP services, workflow automation, and integration flows.",
  },
];

// ─── Mock Requirements per Project ──────────────────────

const MOCK_REQUIREMENTS_MAP: Record<string, CalmRequirementForFsd[]> = {
  "PROJ-WE-S4HANA-2026": [
    {
      id: "REQ-001",
      title: "Implement 3-way match for Purchase Order processing",
      description: "Configure automated 3-way matching (PO, GR, IR) with tolerance groups. Include exception handling workflow for mismatches exceeding 5% tolerance. Integration with Ariba for external procurement.",
      priority: "Very High",
      status: "In Progress",
    },
    {
      id: "REQ-002",
      title: "Configure Material Ledger with actual costing",
      description: "Enable Material Ledger in productive company codes (1000, 2000, 3000). Configure actual costing runs for month-end close. Parallel valuation in group currency (EUR) and local currencies.",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-003",
      title: "Credit management integration with SD billing",
      description: "Implement SAP Credit Management (FIN-FSCM-CR) with automatic credit checks during order entry. Configure credit exposure calculation including open orders, deliveries, and billing documents. Define credit limit rules by customer segment.",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "REQ-004",
      title: "Intercompany Sales Order processing across company codes",
      description: "Design intercompany billing flow for sales between company codes 1000 (DE) and 2000 (US). Include automatic intercompany pricing, STO creation, and elimination entries for consolidation.",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-005",
      title: "Production Planning with MRP Live and demand-driven MRP",
      description: "Activate MRP Live for materials with MRP type PD. Configure DDMRP buffer profiles for critical components. Include integration with PP/DS for finite capacity planning at bottleneck work centers.",
      priority: "Very High",
      status: "In Progress",
    },
    {
      id: "REQ-006",
      title: "Asset lifecycle management with parallel depreciation areas",
      description: "Configure asset accounting with depreciation areas for local GAAP, IFRS, and tax reporting. Include asset under construction (AuC) settlement workflow. Integration with PM for technical asset linkage.",
      priority: "Medium",
      status: "Open",
    },
    {
      id: "REQ-007",
      title: "Batch management and traceability for regulated products",
      description: "Implement batch determination strategies in SD and PP. Enable batch-level quality management with QM inspection lots. Configure shelf-life management and batch traceability reports per EU regulatory requirements.",
      priority: "Very High",
      status: "Open",
    },
    {
      id: "REQ-008",
      title: "Output management migration to BTP Forms and Adobe Forms",
      description: "Migrate legacy SAPscript and SmartForms to Adobe Forms via BTP Document Management. Cover PO forms, delivery notes, invoices, and dunning letters. Include barcode and QR code support.",
      priority: "Medium",
      status: "Open",
    },
  ],

  "PROJ-WE-EWM-ROLLOUT": [
    {
      id: "REQ-E001",
      title: "Warehouse structure and storage bin configuration for Berlin DC",
      description: "Define warehouse structure: 3 storage types (high-rack, floor, picking). Configure activity areas and storage sections. Include HU management with SSCC labels.",
      priority: "Very High",
      status: "In Progress",
    },
    {
      id: "REQ-E002",
      title: "Wave management and pick-pack-ship process",
      description: "Configure wave management with automatic wave creation rules based on delivery priority and route. Include RF-based picking with optimized pick paths. Pack station integration with Zebra label printers.",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-E003",
      title: "Yard management for dock door scheduling",
      description: "Implement yard management with dock door appointment scheduling. Include yard task creation for trailer moves. Integration with TM for inbound/outbound transportation planning.",
      priority: "Medium",
      status: "Open",
    },
    {
      id: "REQ-E004",
      title: "Quality inspection during goods receipt in EWM",
      description: "Configure QM-triggered inspection during EWM inbound process. Include sampling procedures and inspection rules. Automatic stock posting to quality or unrestricted based on usage decision.",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "REQ-E005",
      title: "Cross-docking and flow-through processing",
      description: "Enable opportunistic and pre-planned cross-docking. Configure push deployment for time-sensitive goods. Include integration with production supply (JIT/JIS) for automotive parts.",
      priority: "Medium",
      status: "Open",
    },
  ],

  "PROJ-WE-TM-INTEGRATION": [
    {
      id: "REQ-T001",
      title: "Carrier selection and freight tendering process",
      description: "Configure carrier selection based on lane-rate agreements. Implement freight tendering with automatic carrier assignment. Include spot-bid process for overflow capacity.",
      priority: "Very High",
      status: "Open",
    },
    {
      id: "REQ-T002",
      title: "Freight cost calculation and settlement",
      description: "Implement freight cost calculation with multi-dimensional rate tables. Configure freight settlement with automatic accrual posting. Include carrier invoice verification with tolerance checks.",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-T003",
      title: "Real-time shipment tracking integration",
      description: "Integrate with carrier visibility platforms (project44, FourKites) for real-time tracking. Configure event-based milestone tracking. Include ETA prediction and exception alerting.",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "REQ-T004",
      title: "Route optimization for European distribution network",
      description: "Configure route optimization considering driving time regulations, toll costs, and CO2 emissions. Include multi-stop consolidation for LTL shipments across EU corridors.",
      priority: "Medium",
      status: "Open",
    },
  ],

  "PROJ-WE-FIORI-UX": [
    {
      id: "REQ-F001",
      title: "Custom Fiori app for supplier collaboration portal",
      description: "Develop Fiori Elements app for supplier self-service: PO confirmation, ASN creation, invoice submission. Include supplier performance dashboard with KPI tiles.",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "REQ-F002",
      title: "Role-based Fiori launchpad configuration",
      description: "Configure Fiori launchpad groups and catalogs for 12 business roles. Include SAP Start integration and My Inbox for workflow approvals. Deploy via SAP Build Work Zone.",
      priority: "Very High",
      status: "In Progress",
    },
    {
      id: "REQ-F003",
      title: "Mobile inventory management app for warehouse",
      description: "Develop mobile-optimized Fiori app for cycle counting, stock overview, and goods movement posting. Include barcode scanning via device camera. Offline capability for connectivity gaps.",
      priority: "High",
      status: "Open",
    },
  ],

  "PROJ-WE-BTP-EXTENSIONS": [
    {
      id: "REQ-B001",
      title: "CAP-based approval workflow microservice",
      description: "Build CAP (Node.js) service for multi-level approval workflows. Include configurable approval matrix by document type and amount. Integration with SAP Build Process Automation.",
      priority: "High",
      status: "In Progress",
    },
    {
      id: "REQ-B002",
      title: "Integration flow for third-party logistics API",
      description: "Build SAP Integration Suite iFlow for bidirectional data exchange with 3PL systems. Include message mapping for DESADV/RECADV EDI messages. Error handling with dead-letter queue.",
      priority: "High",
      status: "Open",
    },
    {
      id: "REQ-B003",
      title: "Event-driven architecture with SAP Event Mesh",
      description: "Configure SAP Event Mesh for business event distribution. Include event topics for PO creation, GR posting, and invoice receipt. Consumer microservices for analytics and notification.",
      priority: "Medium",
      status: "Open",
    },
  ],
};

// ─── Mock Data Accessors ────────────────────────────────

export function getMockProjects(): CalmProjectSummary[] {
  return MOCK_PROJECTS;
}

export function getMockRequirements(projectId: string): CalmRequirementForFsd[] {
  return MOCK_REQUIREMENTS_MAP[projectId] || [];
}
