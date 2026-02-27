/**
 * Module Classification using Aho-Corasick Algorithm
 *
 * Previous: Nested loops — O(n × m × k) where n=text, m=keywords, k=keyword length
 * Now:      Single-pass scan — O(n + z) where n=text length, z=match count
 *
 * How it works:
 *   1. Build a trie (prefix tree) from all keywords at module load time
 *   2. Add failure links (like KMP, but for multiple patterns)
 *   3. Scan text exactly ONCE — the automaton follows trie edges + failure links
 *   4. Every match records which module + keyword matched
 *
 * Built once, reused for every classification call.
 */

import { classifyCache, hashString } from "@/lib/cache";

// ─── Types ──────────────────────────────────────────────────────

interface ModuleMatch {
  module: string;
  confidence: number;
  matchedKeywords: string[];
  isPrimary: boolean;
}

interface TrieNode {
  children: Map<number, TrieNode>; // char code → child node
  fail: TrieNode | null;           // failure link (suffix that is also a prefix)
  outputs: { module: string; keyword: string }[]; // patterns ending at this node
}

// ─── Aho-Corasick Automaton ─────────────────────────────────────

class AhoCorasick {
  private root: TrieNode;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode {
    return { children: new Map(), fail: null, outputs: [] };
  }

  /**
   * Insert a keyword pattern into the trie — O(keyword.length)
   */
  addPattern(keyword: string, module: string): void {
    let node = this.root;
    const lowerKeyword = keyword.toLowerCase();

    for (let i = 0; i < lowerKeyword.length; i++) {
      const charCode = lowerKeyword.charCodeAt(i);
      if (!node.children.has(charCode)) {
        node.children.set(charCode, this.createNode());
      }
      node = node.children.get(charCode)!;
    }

    node.outputs.push({ module, keyword });
  }

  /**
   * Build failure links using BFS — O(total keyword characters)
   * This is the key insight of Aho-Corasick:
   * When a character doesn't match, follow the failure link
   * (longest proper suffix that is also a prefix of some pattern)
   */
  build(): void {
    const queue: TrieNode[] = [];

    // Level 1: all children of root fail to root
    this.root.children.forEach((child) => {
      child.fail = this.root;
      queue.push(child);
    });

    // BFS to build failure links for deeper nodes
    while (queue.length > 0) {
      const current = queue.shift()!;

      current.children.forEach((child, charCode) => {
        queue.push(child);

        // Walk up failure links to find where this character matches
        let failNode = current.fail;
        while (failNode && !failNode.children.has(charCode)) {
          failNode = failNode.fail;
        }

        child.fail = failNode ? failNode.children.get(charCode)! : this.root;

        // Merge outputs from failure chain (dictionary suffix links)
        if (child.fail !== child) {
          child.outputs = child.outputs.concat(child.fail.outputs);
        }
      });
    }
  }

  /**
   * Search text for ALL keyword matches — O(text.length + matches)
   * Single pass through the text, following trie edges + failure links
   */
  search(text: string): Map<string, Set<string>> {
    const results = new Map<string, Set<string>>(); // module → matched keywords
    let node = this.root;

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);

      // Follow failure links until we find a matching edge or reach root
      while (node !== this.root && !node.children.has(charCode)) {
        node = node.fail!;
      }

      if (node.children.has(charCode)) {
        node = node.children.get(charCode)!;
      }

      // Collect all outputs at this node (includes failure chain outputs)
      for (const { module, keyword } of node.outputs) {
        if (!results.has(module)) {
          results.set(module, new Set());
        }
        results.get(module)!.add(keyword);
      }
    }

    return results;
  }
}

// ─── Keyword Dictionaries ───────────────────────────────────────

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

const PROCESS_AREAS: Record<string, Record<string, string[]>> = {
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
  CO: {
    "Cost Center Accounting": ["cost center", "cost center accounting", "overhead", "activity type"],
    "Internal Orders": ["internal order", "overhead order", "investment order"],
    "Product Costing": ["product costing", "cost estimate", "standard cost", "material cost"],
    "Profitability Analysis (CO-PA)": ["profitability analysis", "COPA", "profit segment", "contribution margin"],
    "Profit Center Accounting": ["profit center", "profit center accounting", "transfer pricing"],
    "Planning & Budgeting": ["planning", "budget", "cost planning", "forecast"],
  },
  PP: {
    "Production Orders": ["production order", "manufacturing order", "shop floor", "confirmation"],
    "Material Requirements Planning": ["MRP", "planned order", "requirements planning", "demand management"],
    "Bill of Materials": ["BOM", "bill of material", "component", "assembly"],
    "Capacity Planning": ["capacity", "work center", "scheduling", "capacity planning"],
    "Repetitive Manufacturing": ["repetitive manufacturing", "production line", "backflush"],
    "Process Manufacturing": ["process order", "recipe", "batch management"],
  },
};

// ─── Build Automatons at Module Load (once) ─────────────────────

/** Module classification automaton — scans for all module keywords */
const moduleAutomaton = new AhoCorasick();
for (const [module, keywords] of Object.entries(MODULE_KEYWORDS)) {
  for (const keyword of keywords) {
    moduleAutomaton.addPattern(keyword, module);
  }
}
moduleAutomaton.build();

/** Process area automatons — one per module for area identification */
const areaAutomatons = new Map<string, AhoCorasick>();
for (const [module, areas] of Object.entries(PROCESS_AREAS)) {
  const automaton = new AhoCorasick();
  for (const [area, keywords] of Object.entries(areas)) {
    for (const keyword of keywords) {
      automaton.addPattern(keyword, area);
    }
  }
  automaton.build();
  areaAutomatons.set(module, automaton);
}

// ─── Exported Functions ─────────────────────────────────────────

/**
 * Classify requirements text into SAP modules
 * Uses Aho-Corasick for O(n + z) single-pass matching + LRU cache
 */
export function classifyModules(requirementsText: string): ModuleMatch[] {
  // Check LRU cache first
  const cacheKey = hashString(requirementsText);
  const cached = classifyCache.get(cacheKey) as ModuleMatch[] | undefined;
  if (cached) return cached;

  const text = requirementsText.toLowerCase();

  // Single-pass scan through text — O(n + z)
  const matches = moduleAutomaton.search(text);

  const results: ModuleMatch[] = [];

  matches.forEach((matchedSet, module) => {
    const matchedKeywords = Array.from(matchedSet);
    const totalKeywords = MODULE_KEYWORDS[module]?.length || 1;

    const confidence = Math.min(
      (matchedKeywords.length / totalKeywords) * 3,
      1.0
    );

    results.push({
      module,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords,
      isPrimary: false,
    });
  });

  // Sort by confidence descending
  results.sort((a, b) => b.confidence - a.confidence);

  // Mark top as primary
  if (results.length > 0) {
    results[0].isPrimary = true;
  }

  // Store in cache
  classifyCache.set(cacheKey, results);

  return results;
}

/**
 * Identify process area within a module
 * Uses per-module Aho-Corasick automaton for O(n + z) matching
 */
export function identifyProcessArea(requirementsText: string, module: string): string {
  const automaton = areaAutomatons.get(module);
  if (!automaton) return "General";

  const text = requirementsText.toLowerCase();

  // Single-pass scan — O(n + z)
  const matches = automaton.search(text);

  let bestMatch = "General";
  let bestScore = 0;

  matches.forEach((matchedSet, area) => {
    if (matchedSet.size > bestScore) {
      bestScore = matchedSet.size;
      bestMatch = area;
    }
  });

  return bestMatch;
}
