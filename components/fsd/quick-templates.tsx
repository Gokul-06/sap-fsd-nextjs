"use client";

import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Receipt,
  Factory,
  Landmark,
  BarChart3,
  Warehouse,
  Zap,
} from "lucide-react";

export interface TemplateData {
  title: string;
  module: string;
  projectName: string;
  requirements: string;
}

interface QuickTemplatesProps {
  onSelect: (template: TemplateData) => void;
}

const templates = [
  {
    id: "p2p",
    icon: ShoppingCart,
    label: "Procure-to-Pay",
    badge: "MM",
    badgeColor: "bg-blue-100 text-blue-700",
    phase: "Explore → Realize",
    data: {
      title: "Procure-to-Pay Process Automation",
      module: "MM",
      projectName: "S/4HANA Transformation",
      requirements: `Automate the end-to-end Procure-to-Pay process in SAP S/4HANA:

1. Purchase Requisition: Auto-create PRs from MRP output with material group-based approval workflows (2-level: cost center manager → procurement lead for >$5,000).

2. Purchase Order: Implement source determination with preferred vendor lists, outline agreements, and contract release orders. Enable PO collaboration via Supplier Portal.

3. Goods Receipt: Three-way matching (PO–GR–IR) with configurable tolerances. Auto-post GR for consignment materials. Support evaluated receipt settlement (ERS) for key suppliers.

4. Invoice Verification: Automate invoice parking via OCR integration, duplicate invoice check, and workflow-based exception handling for price/quantity variances exceeding 2%.

5. Payment Processing: Configure automatic payment program (F110) with payment method selection, bank determination, and payment block management.

Cross-module: FI postings (GR/IR clearing), CO cost center assignments, budget availability check.`,
    },
  },
  {
    id: "o2c",
    icon: Receipt,
    label: "Order-to-Cash",
    badge: "SD",
    badgeColor: "bg-emerald-100 text-emerald-700",
    phase: "Explore → Realize",
    data: {
      title: "Order-to-Cash Process Optimization",
      module: "SD",
      projectName: "S/4HANA Transformation",
      requirements: `Design the Order-to-Cash process for SAP S/4HANA:

1. Sales Order Processing: Configure order types (standard, rush, returns), automatic pricing with condition techniques (price lists, discounts, surcharges, freight), credit check integration, and ATP check with backorder processing.

2. Delivery & Shipping: Implement delivery document creation with pick/pack/ship process, batch determination for serial-managed materials, output determination for delivery notes and shipping labels.

3. Billing: Auto-create invoices from deliveries with revenue account determination, tax calculation, rebate agreements, and inter-company billing scenarios.

4. Accounts Receivable: Customer credit management with automatic credit exposure updates, dunning program configuration (4-level dunning), and dispute management workflow.

5. Returns & Claims: Returns order processing with inspection, refund/credit memo creation, and integration with QM for quality notifications.

Cross-module: FI revenue recognition, CO profitability analysis (CO-PA), MM for returns to stock.`,
    },
  },
  {
    id: "r2r",
    icon: Landmark,
    label: "Record-to-Report",
    badge: "FI",
    badgeColor: "bg-amber-100 text-amber-700",
    phase: "Explore → Deploy",
    data: {
      title: "Record-to-Report Financial Close Process",
      module: "FI",
      projectName: "S/4HANA Finance Transformation",
      requirements: `Implement Record-to-Report process in SAP S/4HANA Finance:

1. General Ledger: Configure Universal Journal (ACDOCA) with multiple ledgers (leading + non-leading for IFRS/GAAP), parallel accounting, real-time segment reporting, and extension ledger for ML valuation.

2. Period-End Close: Automated closing cockpit with task dependencies — foreign currency valuation, GR/IR clearing, accruals/deferrals, depreciation runs, cost allocation cycles, and intercompany reconciliation.

3. Asset Accounting: New Asset Accounting with parallel valuation areas, group asset depreciation, asset transfers, retirements, and integration with project capitalization (PS/IM).

4. Bank Accounting: Advanced payment management, electronic bank statement auto-processing with BAM rules, cash management with liquidity forecasting.

5. Financial Reporting: Real-time financial statements, drill-down to line items via CDS views, management reporting with embedded analytics (SAP Analytics Cloud integration).

Cross-module: CO assessment/distribution cycles, MM inventory valuation (material ledger), SD revenue recognition.`,
    },
  },
  {
    id: "p2m",
    icon: Factory,
    label: "Plan-to-Produce",
    badge: "PP",
    badgeColor: "bg-purple-100 text-purple-700",
    phase: "Explore → Realize",
    data: {
      title: "Plan-to-Produce Manufacturing Process",
      module: "PP",
      projectName: "S/4HANA Manufacturing",
      requirements: `Design the Plan-to-Produce process for SAP S/4HANA Manufacturing:

1. Demand Planning: MRP Live with advanced planning parameters, forecast-based planning, safety stock optimization, and planning file entries for automatic MRP scheduling.

2. Production Planning: Create planned orders from MRP, convert to production orders with routing and BOM explosion. Configure scheduling (forward/backward), capacity planning with finite scheduling on work centers.

3. Shop Floor Execution: Production order confirmation (milestone, yield/scrap), goods issue to production (backflushing for repetitive manufacturing), co-product/by-product handling.

4. Quality Integration: In-process inspection lots triggered at operation level, usage decision integration, and defect recording with QM notifications.

5. Production Close: Order settlement to cost centers/profitability segments, WIP calculation, variance analysis (lot size, quantity, price, scrap variances).

Cross-module: MM for material availability, CO for production cost analysis, QM for quality checks, FI for inventory posting.`,
    },
  },
  {
    id: "controlling",
    icon: BarChart3,
    label: "Cost Management",
    badge: "CO",
    badgeColor: "bg-rose-100 text-rose-700",
    phase: "Explore → Deploy",
    data: {
      title: "Management Accounting & Cost Control",
      module: "CO",
      projectName: "S/4HANA Controlling",
      requirements: `Implement Controlling (CO) processes in SAP S/4HANA:

1. Cost Center Accounting: Standard cost center hierarchy, primary/secondary cost element configuration, statistical key figures, periodic assessment and distribution cycles.

2. Internal Orders: Configure order types for overhead cost collection (marketing campaigns, internal projects, maintenance orders), settlement rules, and budget management with availability control.

3. Product Costing: Standard cost estimate with BOM/routing explosion, cost component split, material ledger activation for actual costing, and cost object controlling.

4. Profitability Analysis: CO-PA configuration (costing-based), value fields mapping from SD billing, top-down distribution for overhead, and profitability reporting segments.

5. Planning & Budgeting: Cost center planning with activity-based costing, plan/actual variance analysis, integrated business planning interface.

Cross-module: FI for real-time reconciliation (Universal Journal), PP for production cost settlement, SD for revenue allocation, MM for material cost analysis.`,
    },
  },
  {
    id: "ewm",
    icon: Warehouse,
    label: "Warehouse Mgmt",
    badge: "EWM",
    badgeColor: "bg-cyan-100 text-cyan-700",
    phase: "Realize → Deploy",
    data: {
      title: "Extended Warehouse Management Implementation",
      module: "EWM",
      projectName: "S/4HANA EWM",
      requirements: `Implement Embedded EWM in SAP S/4HANA:

1. Warehouse Structure: Define warehouse number, storage types (high rack, block, staging), storage sections, and storage bins. Configure warehouse process types for inbound, outbound, and internal movements.

2. Inbound Processing: Automatic warehouse task creation from inbound delivery, putaway strategies (next empty bin, fixed storage, bulk storage), deconsolidation, and quality inspection integration.

3. Outbound Processing: Wave management for pick-pack-ship, pick point determination, wave templates with release criteria, packing station with HU management, and shipping point determination.

4. Physical Inventory: Annual/cycle counting procedures, inventory document management, zero stock check, and continuous inventory for ABC-classified materials.

5. RF Framework: Mobile device configuration for warehouse operators, transaction codes for picking confirmation, putaway, inventory count, and bin-to-bin transfers.

Cross-module: MM for goods receipt, SD for delivery processing, PP for production supply, QM for inspection management.`,
    },
  },
];

export function QuickTemplates({ onSelect }: QuickTemplatesProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-[#0091DA]" />
        <p className="text-sm font-semibold text-[#1B2A4A]">
          Quick Start — SAP Activate Templates
        </p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Pre-built requirements based on SAP Activate methodology. Click to auto-fill the form.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {templates.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.data)}
              className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border/60 bg-white hover:border-[#0091DA]/30 hover:bg-[#0091DA]/5 transition-all duration-200 text-left"
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-[#0091DA] flex-shrink-0 transition-colors" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#1B2A4A] truncate group-hover:text-[#0091DA] transition-colors">
                  {t.label}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1.5 py-0 h-4 ${t.badgeColor}`}
                  >
                    {t.badge}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                    {t.phase}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
