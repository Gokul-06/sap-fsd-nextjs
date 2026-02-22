/**
 * SAP CO (Controlling) Reference Data
 * Tables, Transactions, Fiori Apps, CDS Views, BAPIs, and Integration Points
 */

export const CO_TABLES = {
  costCenter: {
    CSKS: "Cost Center Master Data",
    CSKT: "Cost Center Texts",
    COSS: "CO Object: Cost Totals for Internal Postings (Secondary)",
    COSP: "CO Object: Cost Totals for External Postings (Primary)",
    CSKA: "Cost Element Master Data (Chart of Accounts)",
    CSKB: "Cost Element Master Data (Controlling Area)",
  },
  internalOrder: {
    AUFK: "Order Master Data",
    COBK: "CO Document Header",
    COEP: "CO Line Items (Actual)",
    AUFM: "Goods Movements for Order",
    JEST: "Object Status (Individual)",
    CAUFV: "Order Header – Production/Process",
  },
  profitabilityAnalysis: {
    CE1xxxx: "COPA Actual Line Items (Operating Concern Specific)",
    CE2xxxx: "COPA Plan Line Items (Operating Concern Specific)",
    CE3xxxx: "COPA Segment Level (Operating Concern Specific)",
    CE4xxxx: "COPA Forms (Operating Concern Specific)",
    T247: "Month Names (COPA Reporting)",
  },
  productCosting: {
    KEKO: "Product Cost Estimate Header",
    KEPH: "Cost Component Split – Product Costing",
    CKMLHD: "Material Ledger: Header Record",
    CKMLCR: "Material Ledger: Currency and Valuation Type",
    CKMLPP: "Material Ledger: Period Totals",
    CKMLRUNPERIOD: "Material Ledger Closing Run – Period Assignment",
  },
  activityAllocation: {
    CSLA: "Activity Type Master Data",
    CSLT: "Activity Type Texts",
    CSSL: "Cost Center / Activity Type – Totals",
    KAKO: "Cost Object Header",
    KALO: "Cost Object Line Items",
  },
  masterData: {
    TKA01: "Controlling Area",
    SETNODE: "Set Master Records (Lower-Level Sets / Values)",
    SETHEADER: "Set Header and Directory",
    CEPCT: "Profit Center Texts",
    CEPC: "Profit Center Master Data",
    TKA02: "Controlling Area Assignment to Company Code",
  },
};

export const CO_TCODES = {
  costCenter: {
    KS01: "Create Cost Center",
    KS02: "Change Cost Center",
    KS03: "Display Cost Center",
    KSH1: "Create Cost Center Group",
    KSH2: "Change Cost Center Group",
    KSH3: "Display Cost Center Group",
    S_ALR_87013611: "Cost Centers: Actual/Plan/Variance",
  },
  internalOrder: {
    KO01: "Create Internal Order",
    KO02: "Change Internal Order",
    KO03: "Display Internal Order",
    KO04: "Collective Change of Internal Orders",
    KOH1: "Create Order Group",
    KOH2: "Change Order Group",
    KO88: "Actual Settlement: Order",
  },
  profitabilityAnalysis: {
    KE21: "Create CO-PA Actual Line Item",
    KE24: "Display CO-PA Actual Line Items",
    KE30: "Execute Profitability Report",
    KEPM: "Maintain CO-PA Planning Data",
    KES1: "Create CO-PA Planning Level",
  },
  productCosting: {
    CK11N: "Create Material Cost Estimate",
    CK24: "Price Update – Mark/Release Standard Price",
    CK40N: "Costing Run",
    CKMLCP: "Material Ledger Closing – Cockpit",
    CKM3: "Material Price Analysis",
  },
  planning: {
    KP06: "Change Cost Center Planning (Activity-Independent)",
    KP26: "Change Cost Center Planning (Activity-Dependent)",
    KP46: "Change Statistical Key Figures Planning",
    KPF6: "Change Planning – Internal Orders",
    "7KE1": "Create CO-PA Planning Level",
  },
  allocation: {
    KSV5: "Execute Actual Distribution",
    KSU5: "Execute Actual Assessment",
    KB21N: "Enter Activity Allocation",
    KB31N: "Enter Statistical Key Figures – Actual",
    KB11N: "Enter Reposting of Primary Costs",
  },
  reporting: {
    KSB1: "Cost Center Line Item Report (Actual)",
    KOB1: "Internal Order Line Item Report (Actual)",
    S_ALR_87013611_RPT: "Cost Centers: Actual/Plan/Variance Report",
    S_ALR_87013620: "Cost Centers: Breakdown by Cost Element",
    GR55: "Execute Report Writer/Painter Report",
  },
  closing: {
    KSS2: "Execute Actual Overhead Calculation",
    KGI2: "Execute Actual Overhead – Order",
    CO88: "Actual Settlement: Production Orders",
    CKMVFM: "Perform Single-Level / Multi-Level Price Determination",
  },
  config: {
    SPRO: "IMG – Customizing",
    OKKS: "Maintain Number Ranges for Cost Centers",
    OKB9: "Automatic Account Assignment for Cost Element",
    OKP1: "Maintain CO Versions",
    KEA0: "Maintain Operating Concern",
    KEKE: "Maintain COPA Characteristics",
  },
};

export const CO_FIORI_APPS = {
  costCenter: {
    F1028: "Manage Cost Centers",
    F2700: "Cost Center – Plan/Actual",
    F1603: "Manage Journal Entries",
  },
  internalOrder: {
    F1029: "Manage Internal Orders",
    F2713: "Internal Order – Plan/Actual",
  },
  profitabilityAnalysis: {
    F2400: "Profitability Analysis – Actual Line Items",
    F2714: "Profitability Analysis – Multidimensional Reporting",
  },
  productCosting: {
    F2472: "Cost Estimates for Material",
  },
  analytics: {
    F1030: "Overhead Cost Controlling",
    F2698: "Cost Center Reports",
  },
};

export const CO_CDS_VIEWS = {
  costCenter: {
    I_CostCenter: "Cost Center Master Data",
    I_CostCenterActivityType: "Cost Center – Activity Type Assignment",
    C_CostCenterPlanActQuery: "Cost Center Plan vs. Actual Query",
  },
  internalOrder: {
    I_InternalOrder: "Internal Order Master Data",
    C_InternalOrderPlanActualQuery: "Internal Order Plan vs. Actual Query",
  },
  profitabilityAnalysis: {
    I_ProfitabilitySegment: "Profitability Segment",
    C_ProfitabilityAnalysisQuery: "Profitability Analysis Query (COPA)",
  },
  masterData: {
    I_CostElement: "Cost Element Master Data",
    I_ControllingArea: "Controlling Area",
    I_ProfitCenter: "Profit Center Master Data",
    I_ActivityType: "Activity Type Master Data",
  },
};

export const CO_BAPIS = {
  costCenter: {
    BAPI_COSTCENTER_CREATEMULTIPLE: "Create Cost Centers (Multiple)",
    BAPI_COSTCENTER_GETDETAIL1: "Get Cost Center Detail",
  },
  internalOrder: {
    BAPI_INTERNALORDER_CREATE: "Create Internal Order",
    BAPI_INTERNALORDER_CHANGE: "Change Internal Order",
    BAPI_INTERNALORDER_GETDETAIL: "Get Internal Order Detail",
  },
  activityAllocation: {
    BAPI_ACC_ACTIVITY_ALLOC_POST: "Post Activity Allocation",
  },
  planning: {
    BAPI_COSTACTPLN_POSTPRIMCOST: "Post Primary Cost Planning Data",
    BAPI_COSTACTPLN_POSTSECCOST: "Post Secondary Cost Planning Data",
  },
};

export const CO_INTEGRATION_POINTS = {
  FI: {
    description: "Financial Accounting Integration",
    touchpoints: [
      "Real-time FI-CO integration via Universal Journal (ACDOCA)",
      "Primary cost element creation mirrors G/L accounts",
      "Automatic CO posting on every FI cost-relevant line item",
      "Reconciliation ledger for cross-company-code cost allocation",
      "Revenue element posting to profitability analysis",
      "Accrual and deferral cost postings",
    ],
    tables: ["ACDOCA", "BSEG", "BKPF", "FAGLFLEXT", "COEP"],
  },
  MM: {
    description: "Materials Management Integration",
    touchpoints: [
      "Account assignment from Purchase Orders and Purchase Requisitions (cost center, order, WBS)",
      "Goods Receipt consumption posting to controlling objects",
      "Overhead cost assignment on procurement activities",
      "Invoice verification posting to cost objects",
      "Material price difference posting to cost centers",
    ],
    tables: ["EKPO", "EKKO", "MSEG", "RSEG", "COEP"],
  },
  SD: {
    description: "Sales & Distribution Integration",
    touchpoints: [
      "Revenue posting to CO-PA (value fields / characteristics)",
      "Cost of goods sold (COGS) determination in billing",
      "Margin analysis through profitability segments",
      "Sales deductions and rebate posting to COPA",
      "Condition-based revenue and cost assignment",
    ],
    tables: ["VBRK", "VBRP", "CE1xxxx", "CE3xxxx", "COEP"],
  },
  PP: {
    description: "Production Planning Integration",
    touchpoints: [
      "Production order confirmation triggers activity allocation",
      "Activity confirmation costing for work centers / cost centers",
      "Variance calculation on production orders (price, quantity, lot size, input)",
      "Overhead cost application on production orders",
      "Work-in-process calculation and settlement",
    ],
    tables: ["AFKO", "AFPO", "AFRU", "COSS", "COSP", "COBK"],
  },
  PS: {
    description: "Project System Integration",
    touchpoints: [
      "WBS element costing and budgeting",
      "Project actual cost collection from all sources",
      "Project settlement to fixed assets, cost centers, or profitability segments",
      "Overhead allocation on WBS elements and network activities",
      "Funds management commitment integration",
    ],
    tables: ["PRPS", "PROJ", "BPGE", "COEP", "AUFK"],
  },
};

export const CO_PROCESS_AREAS = [
  "Cost Center Accounting",
  "Internal Order Accounting",
  "Profitability Analysis (CO-PA)",
  "Product Costing",
  "Activity-Based Costing",
  "Planning & Budgeting",
  "Allocations & Settlements",
  "Overhead Cost Controlling",
  "Profit Center Accounting",
  "Transfer Pricing",
  "Material Ledger",
  "Actual Costing",
];

export const CO_CONFIG_AREAS = [
  "Controlling area",
  "Cost element categories",
  "Cost center hierarchy",
  "Activity types",
  "Statistical key figures",
  "Allocation cycles",
  "Settlement profiles",
  "Costing variants",
  "Valuation variants",
  "Overhead structures",
  "COPA operating concern",
  "Profitability segment characteristics",
  "Planning layout",
  "Number ranges",
];
