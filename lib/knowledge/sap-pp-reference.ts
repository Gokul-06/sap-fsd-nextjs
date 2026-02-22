/**
 * SAP PP (Production Planning) Reference Data
 * Tables, Transactions, Fiori Apps, CDS Views, BAPIs, and Integration Points
 */

export const PP_TABLES = {
  productionOrder: {
    AFKO: "Order Header Data (PP Orders)",
    AFPO: "Order Item Data",
    AFVC: "Order Operations",
    AFVV: "Operation Quantities/Dates/Values",
    AUFK: "Order Master Data",
    AFRU: "Order Confirmation Data",
  },
  mrp: {
    PLAF: "Planned Orders",
    MDKP: "MRP Document Header",
    MDTB: "MRP Table Structure",
    RESB: "Reservation/Dependent Requirements",
    MDLC: "MRP List – Current Situation",
  },
  bom: {
    STKO: "BOM Header",
    STPO: "BOM Item",
    MAST: "Material to BOM Link",
    STAS: "BOM Item Selection (BOMs by Plant)",
  },
  routing: {
    PLKO: "Routing Header (Task List Header)",
    PLPO: "Routing Operations (Task List Operations)",
    MAPL: "Material to Routing Assignment",
    PLAS: "Routing Selection (Task List Selection)",
  },
  workCenter: {
    CRHD: "Work Center Header",
    CRCO: "Work Center – Cost Center Assignment",
    KAKO: "Capacity Header Data",
  },
  masterData: {
    MARC: "Plant Data for Material (MRP Views)",
    T399D: "Production Scheduling Profile",
    T024F: "MRP Controllers (Production Schedulers)",
    T006: "Units of Measure",
  },
};

export const PP_TCODES = {
  productionOrder: {
    CO01: "Create Production Order",
    CO02: "Change Production Order",
    CO03: "Display Production Order",
    CO05N: "Release Production Order (Collective)",
    CO11N: "Confirm Production Order Operation",
    CO15: "Confirm Production Order (Final Confirmation + GR)",
    COHV: "Mass Processing for Production Orders",
    COOIS: "Production Order Information System",
  },
  mrp: {
    MD01: "MRP Run – Total Planning (Online)",
    MD02: "MRP Run – Single Item (Single-Level)",
    MD04: "Stock/Requirements List",
    MD05: "MRP List – Individual Display",
    MD06: "MRP List – Collective Display",
    MD07: "Stock/Requirements List – Collective",
    MD20: "Create Planning File Entry",
  },
  bom: {
    CS01: "Create Material BOM",
    CS02: "Change Material BOM",
    CS03: "Display Material BOM",
    CS11: "BOM Multi-Level Explosion",
    CS12: "BOM Multi-Level Where-Used",
    CS13: "BOM Summarized Where-Used",
    CS15: "Single-Level Where-Used List",
  },
  routing: {
    CA01: "Create Routing",
    CA02: "Change Routing",
    CA03: "Display Routing",
    CA11: "Create Reference Operation Set",
    CA12: "Change Reference Operation Set",
    CA13: "Display Reference Operation Set",
  },
  workCenter: {
    CR01: "Create Work Center",
    CR02: "Change Work Center",
    CR03: "Display Work Center",
    CR05: "Work Center List",
    CR06: "Work Center Capacity Evaluation",
    CR07: "Work Center Capacity Leveling",
  },
  capacityPlanning: {
    CM01: "Capacity Planning – Work Center View",
    CM02: "Capacity Planning – Order View",
    CM21: "Capacity Leveling – Tabular",
    CM25: "Capacity Leveling – Variable View",
    CM50: "Capacity Evaluation – Standard Overview",
  },
  masterData: {
    MM01: "Create Material Master (incl. MRP/PP Views)",
    C223: "Create Production Version",
    C201: "Create Production Resource/Tool",
    OPL8: "Maintain Production Scheduling Profile",
  },
  reporting: {
    COOIS: "Production Order Information System",
    CO03: "Display Production Order",
    MF12: "Display Backflush Error Log",
    COHV: "Mass Processing for Production Orders",
    CM01: "Capacity Planning – Work Center View",
    CM50: "Capacity Evaluation – Standard Overview",
  },
  config: {
    SPRO: "IMG – Customizing",
    OPL8: "Production Scheduling Profile",
    OPJH: "Define Order Types for Production Orders",
    BS52: "Maintain Capacity Planning Profile",
    OPU3: "Define Confirmation Parameters",
  },
};

export const PP_FIORI_APPS = {
  productionOrder: {
    F2764: "Manage Production Orders",
    F2093: "Monitor Production Orders",
    F3013: "Confirm Production Operations",
  },
  mrp: {
    F2889: "Manage Material Coverage",
    F3100: "Monitor Material Requirements",
    F2074: "Stock – Requirements List",
  },
  bom: {
    F3339: "Manage Bills of Material",
    F3069: "Display BOM Comparison",
  },
  analytics: {
    F2890: "Production Operations Overview",
    F1989: "Manufacturing Overview",
  },
};

export const PP_CDS_VIEWS = {
  productionOrder: {
    I_ProductionOrderAPI01: "Production Order – API",
    I_ProductionOrderItemAPI01: "Production Order Item – API",
    I_ProductionOrderOperation: "Production Order Operation",
  },
  mrp: {
    I_PlannedOrderAPI01: "Planned Order – API",
    I_MRPMaterial: "MRP Material View",
    I_MaterialStock: "Material Stock Overview",
  },
  bom: {
    I_BillOfMaterialAPI01: "Bill of Material – API",
    I_BillOfMaterialItemAPI01: "Bill of Material Item – API",
  },
  masterData: {
    I_ProductPlantMRP: "Product Plant MRP Data",
    I_WorkCenter: "Work Center",
    I_ProductionVersion: "Production Version",
  },
};

export const PP_BAPIS = {
  productionOrder: {
    BAPI_PRODORD_CREATE: "Create Production Order",
    BAPI_PRODORD_CHANGE: "Change Production Order",
    BAPI_PRODORD_GET_DETAIL: "Get Production Order Details",
    BAPI_PRODORDCONF_CREATE_HDR: "Create Production Order Confirmation (Header)",
  },
  plannedOrder: {
    BAPI_PLANNEDORDER_CREATE: "Create Planned Order",
    BAPI_PLANNEDORDER_CHANGE: "Change Planned Order",
    BAPI_PLANNEDORDER_DELETE: "Delete Planned Order",
  },
  bom: {
    CSAP_MAT_BOM_CREATE: "Create Material BOM",
    CSAP_MAT_BOM_READ: "Read Material BOM",
  },
};

export const PP_MOVEMENT_TYPES = {
  "261": "Goods Issue for Production Order",
  "262": "Reversal of GI for Production (261)",
  "101": "Goods Receipt from Production",
  "102": "Reversal of GR from Production (101)",
  "531": "By-Product Receipt from Production",
  "541": "Transfer to Subcontractor",
  "542": "Reversal of Transfer to Subcontractor",
  "543": "Consumption from Subcontractor Stock",
  "311": "Transfer Posting Plant to Plant (1-Step)",
  "309": "Transfer Posting Material to Material",
};

export const PP_INTEGRATION_POINTS = {
  MM: {
    description: "Materials Management Integration",
    touchpoints: [
      "MRP creates Purchase Requisitions for external procurement",
      "Component availability check against warehouse stock",
      "Goods Issue (261) for component consumption to production order",
      "Goods Receipt (101) from production order into finished goods stock",
      "Reservation management for planned and production orders",
      "Subcontracting PO created from planned order",
    ],
    tables: ["EBAN", "RESB", "MKPF", "MSEG", "MARD"],
  },
  CO: {
    description: "Controlling Integration",
    touchpoints: [
      "Production order settles costs to cost objects (cost center, profit center)",
      "Activity confirmation posts actual costs against work centers",
      "Variance calculation (input, output, lot size, scrap variances)",
      "Preliminary costing at order creation via cost estimate",
      "Period-end settlement of production orders to FI/CO",
    ],
    tables: ["COBK", "COEP", "CKMLHD", "AUFK"],
  },
  QM: {
    description: "Quality Management Integration",
    touchpoints: [
      "In-process inspection lots triggered at operation level",
      "Quality notifications for production defects",
      "Usage decision determines stock posting (unrestricted, scrap, rework)",
      "Inspection plan linked to routing operations",
      "Results recording during production confirmation",
    ],
    tables: ["QALS", "QAVE", "QAMV", "QMEL"],
  },
  EWM: {
    description: "Extended Warehouse Management Integration",
    touchpoints: [
      "Production supply via staging of components from warehouse",
      "Pick and deliver components to production supply area",
      "Finished goods receipt triggers put-away in EWM",
      "Production material request (PMR) for ad-hoc demand",
    ],
    tables: ["/SCWM/AQUA", "/SCWM/ORDIM_O", "/SCWM/PRDO"],
  },
  SD: {
    description: "Sales & Distribution Integration",
    touchpoints: [
      "Make-to-Order (MTO) production linked to sales order",
      "Assembly processing for sales order BOM",
      "Availability check considers planned and production orders",
      "Planned independent requirements from demand management",
      "Delivery creation triggers goods issue for finished product",
    ],
    tables: ["VBAK", "VBAP", "PBIM", "PBED"],
  },
};

export const PP_PROCESS_AREAS = [
  "Production Order Management",
  "Material Requirements Planning (MRP)",
  "BOM Management",
  "Routing Management",
  "Work Center Management",
  "Capacity Planning",
  "Shop Floor Control",
  "Production Confirmation",
  "Subcontracting",
  "Repetitive Manufacturing",
  "Process Manufacturing",
  "Kanban",
  "Make-to-Order Production",
  "Production Scheduling",
];

export const PP_CONFIG_AREAS = [
  "Plant parameters for production planning",
  "MRP groups and MRP types",
  "MRP controllers (production schedulers)",
  "Scheduling parameters (lead time, in-house production time)",
  "Order types for production orders",
  "Production scheduling profiles",
  "Confirmation parameters (milestones, backflush, auto GR)",
  "Capacity planning profiles",
  "BOM usage types (production, engineering, costing)",
  "Routing usage (production, rate routing, reference operation set)",
  "Lot size procedures (fixed lot, lot-for-lot, period lot size)",
  "Safety stock configuration (static, dynamic, range of coverage)",
  "Backflush settings (at operation level, at goods receipt)",
  "Subcontracting settings (operation subcategory, external processing)",
];
