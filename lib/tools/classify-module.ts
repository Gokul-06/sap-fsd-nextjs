/**
 * Module Classification Logic
 * Analyzes unstructured requirements text and identifies SAP modules
 */

interface ModuleMatch {
  module: string;
  confidence: number;
  matchedKeywords: string[];
  isPrimary: boolean;
}

const MODULE_KEYWORDS: Record<string, string[]> = {
  MM: [
    "purchase order", "purchase requisition", "procurement", "vendor", "supplier",
    "goods receipt", "goods issue", "inventory", "stock", "material master",
    "invoice verification", "MIRO", "MIGO", "ME21N", "ME51N", "MRP",
    "warehouse", "storage location", "valuation", "batch", "consignment",
    "subcontracting", "source list", "info record", "outline agreement",
    "contract", "scheduling agreement", "release strategy", "physical inventory",
    "stock transfer", "material document", "movement type", "GR/IR",
    "procure to pay", "P2P", "procure-to-pay", "buying", "purchasing",
    "reorder point", "safety stock", "quota arrangement", "vendor evaluation",
    "blocked invoice", "three way match", "3-way match",
  ],
  SD: [
    "sales order", "delivery", "billing", "invoice", "pricing", "customer",
    "shipping", "dispatch", "sales organization", "distribution channel",
    "division", "ATP", "availability check", "credit management",
    "output determination", "rebate", "returns", "free goods", "listing",
    "exclusion", "intercompany", "third party", "consignment sales",
    "make to order", "BOM explosion", "sales document", "quotation",
    "inquiry", "contract", "scheduling agreement", "route determination",
    "shipping point", "loading group", "order to cash", "O2C",
    "VA01", "VL01N", "VF01", "VBAK", "VBAP",
  ],
  FI: [
    "general ledger", "GL", "accounts payable", "AP", "accounts receivable", "AR",
    "asset accounting", "fixed asset", "bank accounting", "payment",
    "dunning", "financial statement", "chart of accounts", "company code",
    "fiscal year", "posting period", "document type", "tax", "withholding tax",
    "currency", "exchange rate", "clearing", "reconciliation",
    "profit center", "business area", "segment", "bank statement",
    "electronic bank statement", "payment program", "F110", "FB01",
    "BSEG", "BKPF", "record to report", "R2R",
  ],
  CO: [
    "cost center", "profit center", "internal order", "controlling",
    "overhead", "activity type", "statistical key figure", "assessment",
    "distribution", "product costing", "cost estimate", "variance",
    "profitability analysis", "COPA", "cost element", "cost component",
    "settlement", "planning", "budget", "funds commitment",
    "WBS element", "KS01", "KP06", "CJ20N",
  ],
  PP: [
    "production order", "planned order", "work center", "routing",
    "BOM", "bill of material", "capacity", "shop floor",
    "confirmation", "backflush", "production planning", "demand management",
    "SOP", "MPS", "master production schedule", "make to stock",
    "process order", "repetitive manufacturing", "kanban",
    "CO11N", "CO01", "MD04", "CS01",
  ],
  QM: [
    "quality", "inspection", "inspection lot", "inspection plan",
    "quality notification", "usage decision", "certificate",
    "quality info record", "sampling", "QM view",
    "inspection type", "characteristics", "catalog",
    "vendor quality", "source inspection",
    "QA01", "QA02", "QM01",
  ],
  EWM: [
    "extended warehouse", "EWM", "warehouse task", "warehouse order",
    "put-away", "putaway", "picking", "packing", "staging",
    "storage bin", "storage type", "handling unit",
    "wave management", "labor management", "slotting",
    "yard management", "cross docking", "deconsolidation",
    "/SCWM/", "warehouse monitor",
  ],
  TM: [
    "transportation", "freight order", "freight unit", "carrier",
    "route", "shipment", "freight cost", "load planning",
    "vehicle scheduling", "carrier selection", "tendering",
    "transportation planning", "freight settlement",
    "transportation management", "shipping", "logistics execution",
  ],
  PM: [
    "plant maintenance", "work order", "maintenance order",
    "functional location", "equipment", "maintenance plan",
    "notification", "breakdown", "preventive maintenance",
    "condition monitoring", "measuring point", "task list",
    "IW31", "IW32", "IP10",
  ],
  PS: [
    "project system", "WBS", "work breakdown structure",
    "network", "milestone", "project planning",
    "project billing", "PS module", "CJ20N", "CJ01",
    "project budget", "earned value",
  ],
};

export function classifyModules(requirementsText: string): ModuleMatch[] {
  const text = requirementsText.toLowerCase();
  const results: ModuleMatch[] = [];

  for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
    const matchedKeywords: string[] = [];

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }

    if (matchedKeywords.length > 0) {
      const confidence = Math.min(
        (matchedKeywords.length / keywords.length) * 3, // Scale up — even a few matches is significant
        1.0
      );
      results.push({
        module,
        confidence: Math.round(confidence * 100) / 100,
        matchedKeywords,
        isPrimary: false,
      });
    }
  }

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  // Mark the top one as primary
  if (results.length > 0) {
    results[0].isPrimary = true;
  }

  return results;
}

export function identifyProcessArea(requirementsText: string, module: string): string {
  const text = requirementsText.toLowerCase();

  const processAreas: Record<string, Record<string, string[]>> = {
    MM: {
      "Procure-to-Pay (P2P)": ["purchase order", "procurement", "procure to pay", "p2p"],
      "Inventory Management": ["inventory", "stock", "goods receipt", "goods issue", "physical inventory"],
      "Invoice Verification": ["invoice verification", "MIRO", "blocked invoice", "3-way match"],
      "Material Requirements Planning": ["MRP", "reorder point", "safety stock", "requirements planning"],
      "Vendor Management": ["vendor evaluation", "vendor master", "supplier"],
      "Contract Management": ["contract", "outline agreement", "scheduling agreement"],
      "Subcontracting": ["subcontracting", "subcontract"],
      "Consignment": ["consignment"],
      "Stock Transfers": ["stock transfer", "transfer posting", "STO"],
    },
    SD: {
      "Order-to-Cash (O2C)": ["sales order", "order to cash", "o2c"],
      "Pricing & Conditions": ["pricing", "condition", "discount", "surcharge"],
      "Shipping & Delivery": ["delivery", "shipping", "dispatch", "goods issue"],
      "Billing": ["billing", "invoice", "credit memo", "debit memo"],
      "Credit Management": ["credit management", "credit limit", "credit exposure"],
      "Returns Processing": ["returns", "return order"],
    },
    FI: {
      "General Ledger": ["general ledger", "GL", "journal entry"],
      "Accounts Payable": ["accounts payable", "AP", "vendor payment"],
      "Accounts Receivable": ["accounts receivable", "AR", "customer payment", "dunning"],
      "Asset Accounting": ["fixed asset", "asset accounting", "depreciation"],
      "Bank Accounting": ["bank", "payment program", "bank statement"],
      "Tax Management": ["tax", "withholding tax", "GST", "VAT"],
    },
  };

  const areas = processAreas[module] || {};
  let bestMatch = "General";
  let bestScore = 0;

  for (const [area, keywords] of Object.entries(areas)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = area;
    }
  }

  return bestMatch;
}
