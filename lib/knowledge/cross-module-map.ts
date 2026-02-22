/**
 * Cross-Module Integration Map
 * Defines how SAP modules interact and share data
 */

export interface IntegrationLink {
  sourceModule: string;
  targetModule: string;
  process: string;
  dataFlow: string;
  keyObjects: string[];
  criticalConsiderations: string[];
}

export const CROSS_MODULE_INTEGRATIONS: IntegrationLink[] = [
  // MM ↔ FI
  {
    sourceModule: "MM",
    targetModule: "FI",
    process: "Goods Receipt Accounting",
    dataFlow: "GR creates accounting document with GR/IR clearing entry",
    keyObjects: ["Material Document", "Accounting Document", "GR/IR Account"],
    criticalConsiderations: [
      "Automatic account determination must be configured",
      "Valuation class drives GL account posting",
      "Movement type determines debit/credit logic",
      "GR/IR clearing account must be reconciled periodically",
    ],
  },
  {
    sourceModule: "MM",
    targetModule: "FI",
    process: "Invoice Verification",
    dataFlow: "MIRO creates FI document; clears GR/IR; posts to vendor account",
    keyObjects: ["Invoice Document", "FI Document", "Vendor Line Item"],
    criticalConsiderations: [
      "3-way match (PO, GR, Invoice) must be configured",
      "Tolerance limits for price/quantity variances",
      "Blocked invoices need release workflow",
      "Tax code determination and withholding tax",
    ],
  },
  // MM ↔ CO
  {
    sourceModule: "MM",
    targetModule: "CO",
    process: "Cost Object Assignment",
    dataFlow: "PR/PO account assignment posts to cost center, WBS, or order",
    keyObjects: ["Cost Center", "Internal Order", "WBS Element", "Account Assignment"],
    criticalConsiderations: [
      "Account assignment category determines CO object type",
      "Budget availability check for WBS/orders",
      "Real vs statistical posting logic",
      "Commitment management (PO commitments in CO)",
    ],
  },
  // MM ↔ SD
  {
    sourceModule: "MM",
    targetModule: "SD",
    process: "Third-Party Processing",
    dataFlow: "Sales order triggers PR → PO; vendor ships directly to customer",
    keyObjects: ["Sales Order", "Purchase Requisition", "Purchase Order", "Delivery"],
    criticalConsiderations: [
      "Item category TAS in sales order",
      "Schedule line category CS triggers PR",
      "GR posts statistical; billing references PO GR",
      "Shipping notification flow from vendor",
    ],
  },
  {
    sourceModule: "MM",
    targetModule: "SD",
    process: "Stock Transfer with Delivery",
    dataFlow: "STO creates delivery; GI at sending plant, GR at receiving plant",
    keyObjects: ["Stock Transport Order", "Outbound Delivery", "Material Document"],
    criticalConsiderations: [
      "Customer/vendor master required for inter-company",
      "Pricing in STO for inter-company billing",
      "Two-step vs one-step stock transfer",
      "In-transit stock visibility",
    ],
  },
  // MM ↔ PP
  {
    sourceModule: "MM",
    targetModule: "PP",
    process: "MRP-Driven Procurement",
    dataFlow: "MRP run creates planned orders → PRs for external procurement",
    keyObjects: ["MRP Run", "Planned Order", "Purchase Requisition", "BOM"],
    criticalConsiderations: [
      "MRP type and lot sizing procedure",
      "Planned delivery time and GR processing time",
      "Source list / quota arrangement for auto source determination",
      "Safety stock and reorder point configuration",
    ],
  },
  {
    sourceModule: "MM",
    targetModule: "PP",
    process: "Production Order Consumption",
    dataFlow: "GI for production order consumes components; GR receives finished goods",
    keyObjects: ["Production Order", "Reservation", "Material Document"],
    criticalConsiderations: [
      "Backflush vs manual GI",
      "Movement type 261 (GI) and 101 (GR for production)",
      "Batch determination during GI",
      "Subcontracting scenario (movement type 541)",
    ],
  },
  // MM ↔ QM
  {
    sourceModule: "MM",
    targetModule: "QM",
    process: "Quality Inspection at GR",
    dataFlow: "GR posts to QI stock; inspection lot created; usage decision releases stock",
    keyObjects: ["Inspection Lot", "Quality Info Record", "Usage Decision", "QI Stock"],
    criticalConsiderations: [
      "Material master QM view must be configured",
      "Inspection type 01 for GR inspection",
      "Stock posting: QI → unrestricted or blocked",
      "Skip lot / dynamic modification rules",
      "Certificate of analysis requirement",
    ],
  },
  // MM ↔ EWM
  {
    sourceModule: "MM",
    targetModule: "EWM",
    process: "Warehouse-Managed Procurement",
    dataFlow: "PO GR triggers inbound delivery in EWM; put-away follows",
    keyObjects: ["Inbound Delivery", "Warehouse Task", "Handling Unit", "Storage Bin"],
    criticalConsiderations: [
      "Decentralized vs embedded EWM",
      "Integration model: CIF vs AIF vs API",
      "Goods receipt in EWM vs ERP posting",
      "Batch management across systems",
      "HU management and packing",
    ],
  },
  // SD ↔ FI
  {
    sourceModule: "SD",
    targetModule: "FI",
    process: "Revenue Recognition",
    dataFlow: "Billing document creates FI accounting document",
    keyObjects: ["Billing Document", "Accounting Document", "Revenue Account"],
    criticalConsiderations: [
      "Account determination: condition type → GL account",
      "Tax determination and posting",
      "Credit memo and debit memo processing",
      "Rebate settlement",
    ],
  },
  // FI ↔ CO
  {
    sourceModule: "FI",
    targetModule: "CO",
    process: "Real-Time Integration",
    dataFlow: "FI postings with cost objects flow to CO in real-time",
    keyObjects: ["FI Document", "CO Document", "Cost Element"],
    criticalConsiderations: [
      "Primary cost elements must exist in both FI and CO",
      "Document splitting impact on CO",
      "Reconciliation ledger (deprecated in S/4HANA)",
      "Universal journal (ACDOCA) in S/4HANA",
    ],
  },
  // PP ↔ CO
  {
    sourceModule: "PP",
    targetModule: "CO",
    process: "Production Order Costing",
    dataFlow: "Production order collects actual costs; settlement to CO objects",
    keyObjects: ["Production Order", "Cost Estimate", "Variance", "Settlement Rule"],
    criticalConsiderations: [
      "Preliminary vs simultaneous costing",
      "Variance calculation (input, output, scrap)",
      "Order settlement to profitability segment",
      "Activity type confirmation and pricing",
    ],
  },
  // SD ↔ PP
  {
    sourceModule: "SD",
    targetModule: "PP",
    process: "Make-to-Order Production",
    dataFlow: "Sales order triggers planned order / production order for MTO items",
    keyObjects: ["Sales Order", "Planned Order", "Production Order", "BOM"],
    criticalConsiderations: [
      "MTO vs MTS strategy determines trigger",
      "Individual or collective requirements",
      "Customer-specific BOM and routing",
      "Order settlement to sales order cost",
    ],
  },
  // SD ↔ EWM
  {
    sourceModule: "SD",
    targetModule: "EWM",
    process: "Outbound Delivery Processing",
    dataFlow: "Outbound delivery triggers warehouse task for picking and shipping",
    keyObjects: ["Outbound Delivery", "Warehouse Task", "Handling Unit", "Shipping"],
    criticalConsiderations: [
      "Wave management for pick optimization",
      "Packing and HU management",
      "Goods issue posting synchronization",
      "Integration model: embedded vs decentralized EWM",
    ],
  },
  // FI ↔ MM
  {
    sourceModule: "FI",
    targetModule: "MM",
    process: "Automatic Payment Program",
    dataFlow: "F110 payment run clears vendor open items from MM invoices",
    keyObjects: ["Payment Document", "Vendor Line Items", "Bank Account"],
    criticalConsiderations: [
      "Payment method and bank determination",
      "Payment block on MM invoices",
      "Cash discount terms from PO/contract",
      "Withholding tax at payment time",
    ],
  },
  // CO ↔ PP
  {
    sourceModule: "CO",
    targetModule: "PP",
    process: "Activity Confirmation Costing",
    dataFlow: "Production confirmations post activity costs to cost centers and orders",
    keyObjects: ["Activity Type", "Cost Center", "Production Order", "Confirmation"],
    criticalConsiderations: [
      "Activity price calculation (plan vs actual)",
      "Target cost version for variance analysis",
      "Work-in-process calculation",
      "Month-end settlement rules",
    ],
  },
  // PP ↔ QM
  {
    sourceModule: "PP",
    targetModule: "QM",
    process: "In-Process Quality Inspection",
    dataFlow: "Production order triggers inspection lots at operation milestones",
    keyObjects: ["Inspection Lot", "Production Order", "Inspection Plan", "Results Recording"],
    criticalConsiderations: [
      "Inspection type 03 for in-process inspection",
      "Automatic usage decision and stock posting",
      "Defect recording and quality notifications",
      "Certificate of analysis for finished goods",
    ],
  },
];

export const MODULE_DESCRIPTIONS: Record<string, string> = {
  MM: "Materials Management – Procurement, Inventory, Invoice Verification",
  SD: "Sales & Distribution – Sales Orders, Delivery, Billing, Pricing",
  FI: "Financial Accounting – General Ledger, AP, AR, Asset Accounting",
  CO: "Controlling – Cost Centers, Profit Centers, Internal Orders, Product Costing",
  PP: "Production Planning – MRP, Production Orders, Shop Floor, Capacity",
  QM: "Quality Management – Inspection, Quality Notifications, Certificates",
  EWM: "Extended Warehouse Management – Warehouse Operations, Put-away, Picking",
  TM: "Transportation Management – Freight Orders, Carrier Selection, Route Planning",
  PM: "Plant Maintenance – Work Orders, Functional Locations, Equipment",
  HCM: "Human Capital Management – Personnel, Payroll, Time Management",
  PS: "Project System – WBS, Networks, Project Billing",
  RE: "Real Estate Management – Lease-in, Lease-out, Settlement",
};

export function getIntegrationsForModule(module: string): IntegrationLink[] {
  return CROSS_MODULE_INTEGRATIONS.filter(
    (link) => link.sourceModule === module || link.targetModule === module
  );
}

export function getAffectedModules(module: string): string[] {
  const modules = new Set<string>();
  CROSS_MODULE_INTEGRATIONS.forEach((link) => {
    if (link.sourceModule === module) modules.add(link.targetModule);
    if (link.targetModule === module) modules.add(link.sourceModule);
  });
  return Array.from(modules);
}
