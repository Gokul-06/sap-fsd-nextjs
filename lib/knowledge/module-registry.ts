/**
 * Module Registry — Unified access layer for all SAP module reference data.
 * Replaces hardcoded "if (module === 'MM')" branches with a single registry pattern.
 */

import {
  MM_TABLES, MM_TCODES, MM_FIORI_APPS, MM_CDS_VIEWS, MM_BAPIS,
  MM_MOVEMENT_TYPES, MM_INTEGRATION_POINTS, MM_PROCESS_AREAS, MM_CONFIG_AREAS,
} from "./sap-mm-reference";

// Lazy imports — loaded only when the module is requested
function getSDRef() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./sap-sd-reference");
}
function getFIRef() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./sap-fi-reference");
}
function getCORef() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./sap-co-reference");
}
function getPPRef() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./sap-pp-reference");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GroupedData = Record<string, Record<string, string>>;

export interface ModuleReferenceData {
  tables: GroupedData;
  tcodes: GroupedData;
  fioriApps: GroupedData;
  cdsViews: GroupedData;
  bapis: GroupedData;
  movementTypes?: Record<string, string>;
  integrationPoints: Record<string, {
    description: string;
    touchpoints: string[];
    tables: string[];
  }>;
  processAreas: string[];
  configAreas: string[];
}

// ---------------------------------------------------------------------------
// Registry builder
// ---------------------------------------------------------------------------

function buildMMData(): ModuleReferenceData {
  return {
    tables: MM_TABLES,
    tcodes: MM_TCODES,
    fioriApps: MM_FIORI_APPS,
    cdsViews: MM_CDS_VIEWS,
    bapis: MM_BAPIS,
    movementTypes: MM_MOVEMENT_TYPES,
    integrationPoints: MM_INTEGRATION_POINTS,
    processAreas: MM_PROCESS_AREAS,
    configAreas: MM_CONFIG_AREAS,
  };
}

function buildSDData(): ModuleReferenceData {
  const ref = getSDRef();
  return {
    tables: ref.SD_TABLES,
    tcodes: ref.SD_TCODES,
    fioriApps: ref.SD_FIORI_APPS,
    cdsViews: ref.SD_CDS_VIEWS,
    bapis: ref.SD_BAPIS,
    integrationPoints: ref.SD_INTEGRATION_POINTS,
    processAreas: ref.SD_PROCESS_AREAS,
    configAreas: ref.SD_CONFIG_AREAS,
  };
}

function buildFIData(): ModuleReferenceData {
  const ref = getFIRef();
  return {
    tables: ref.FI_TABLES,
    tcodes: ref.FI_TCODES,
    fioriApps: ref.FI_FIORI_APPS,
    cdsViews: ref.FI_CDS_VIEWS,
    bapis: ref.FI_BAPIS,
    integrationPoints: ref.FI_INTEGRATION_POINTS,
    processAreas: ref.FI_PROCESS_AREAS,
    configAreas: ref.FI_CONFIG_AREAS,
  };
}

function buildCOData(): ModuleReferenceData {
  const ref = getCORef();
  return {
    tables: ref.CO_TABLES,
    tcodes: ref.CO_TCODES,
    fioriApps: ref.CO_FIORI_APPS,
    cdsViews: ref.CO_CDS_VIEWS,
    bapis: ref.CO_BAPIS,
    integrationPoints: ref.CO_INTEGRATION_POINTS,
    processAreas: ref.CO_PROCESS_AREAS,
    configAreas: ref.CO_CONFIG_AREAS,
  };
}

function buildPPData(): ModuleReferenceData {
  const ref = getPPRef();
  return {
    tables: ref.PP_TABLES,
    tcodes: ref.PP_TCODES,
    fioriApps: ref.PP_FIORI_APPS,
    cdsViews: ref.PP_CDS_VIEWS,
    bapis: ref.PP_BAPIS,
    movementTypes: ref.PP_MOVEMENT_TYPES,
    integrationPoints: ref.PP_INTEGRATION_POINTS,
    processAreas: ref.PP_PROCESS_AREAS,
    configAreas: ref.PP_CONFIG_AREAS,
  };
}

// ---------------------------------------------------------------------------
// Registry map
// ---------------------------------------------------------------------------

const MODULE_BUILDERS: Record<string, () => ModuleReferenceData> = {
  MM: buildMMData,
  SD: buildSDData,
  FI: buildFIData,
  CO: buildCOData,
  PP: buildPPData,
};

// Cache so we only build once per module per server lifecycle
const _cache: Record<string, ModuleReferenceData> = {};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the full reference data for a module. Returns null if module not in registry.
 */
export function getModuleData(mod: string): ModuleReferenceData | null {
  if (_cache[mod]) return _cache[mod];
  const builder = MODULE_BUILDERS[mod];
  if (!builder) return null;
  _cache[mod] = builder();
  return _cache[mod];
}

/** List of modules that have rich reference data */
export function getSupportedModules(): string[] {
  return Object.keys(MODULE_BUILDERS);
}

/** Check if a module has reference data */
export function isModuleSupported(mod: string): boolean {
  return mod in MODULE_BUILDERS;
}

// ---------------------------------------------------------------------------
// Convenience flatteners — for injecting into AI prompts
// ---------------------------------------------------------------------------

function flattenGrouped(grouped: GroupedData): string[] {
  const result: string[] = [];
  for (const group of Object.values(grouped)) {
    for (const [code, desc] of Object.entries(group)) {
      result.push(`${code} (${desc})`);
    }
  }
  return result;
}

function flattenGroupedKeys(grouped: GroupedData): string[] {
  const result: string[] = [];
  for (const group of Object.values(grouped)) {
    result.push(...Object.keys(group));
  }
  return result;
}

/**
 * Get all table names with descriptions for a module.
 * Returns ["EKKO (Purchase Order Header)", ...] or empty array.
 */
export function flattenTableNames(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? flattenGrouped(data.tables) : [];
}

/**
 * Get all transaction code names with descriptions.
 */
export function flattenTcodeNames(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? flattenGrouped(data.tcodes) : [];
}

/**
 * Get all Fiori app names with descriptions.
 */
export function flattenAppNames(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? flattenGrouped(data.fioriApps) : [];
}

/**
 * Get all CDS view names (keys only).
 */
export function flattenCdsViewKeys(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? flattenGroupedKeys(data.cdsViews) : [];
}

/**
 * Get all BAPI names (keys only).
 */
export function flattenBapiKeys(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? flattenGroupedKeys(data.bapis) : [];
}

/**
 * Get process areas for a module.
 */
export function getModuleProcessAreas(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? data.processAreas : [];
}

/**
 * Get config areas for a module.
 */
export function getModuleConfigAreas(mod: string): string[] {
  const data = getModuleData(mod);
  return data ? data.configAreas : [];
}

// ---------------------------------------------------------------------------
// Section generation helpers — used by generate-fsd.ts
// ---------------------------------------------------------------------------

/**
 * Generate a markdown table of SAP tables for a module, optionally filtered by relevance.
 */
export function generateModuleTablesMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| Table | Description | Category |\n|-------|-------------|----------|\n";
  for (const [category, tables] of Object.entries(data.tables)) {
    const categoryLabel = category.replace(/([A-Z])/g, " $1").trim();
    for (const [code, desc] of Object.entries(tables)) {
      md += `| ${code} | ${desc} | ${categoryLabel} |\n`;
    }
  }
  return md;
}

/**
 * Generate a markdown table of transaction codes for a module.
 */
export function generateModuleTcodesMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| Transaction | Description | Area |\n|------------|-------------|------|\n";
  for (const [area, tcodes] of Object.entries(data.tcodes)) {
    const areaLabel = area.replace(/([A-Z])/g, " $1").trim();
    for (const [code, desc] of Object.entries(tcodes)) {
      md += `| ${code} | ${desc} | ${areaLabel} |\n`;
    }
  }
  return md;
}

/**
 * Generate a markdown table of Fiori apps for a module.
 */
export function generateModuleFioriAppsMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| App ID | Description | Area |\n|--------|-------------|------|\n";
  for (const [area, apps] of Object.entries(data.fioriApps)) {
    const areaLabel = area.replace(/([A-Z])/g, " $1").trim();
    for (const [code, desc] of Object.entries(apps)) {
      md += `| ${code} | ${desc} | ${areaLabel} |\n`;
    }
  }
  return md;
}

/**
 * Generate a markdown table of CDS views for a module.
 */
export function generateModuleCdsViewsMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| CDS View | Description | Area |\n|----------|-------------|------|\n";
  for (const [area, views] of Object.entries(data.cdsViews)) {
    const areaLabel = area.replace(/([A-Z])/g, " $1").trim();
    for (const [code, desc] of Object.entries(views)) {
      md += `| ${code} | ${desc} | ${areaLabel} |\n`;
    }
  }
  return md;
}

/**
 * Generate a markdown table of BAPIs for a module.
 */
export function generateModuleBapisMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| BAPI/API | Description | Area |\n|----------|-------------|------|\n";
  for (const [area, bapis] of Object.entries(data.bapis)) {
    const areaLabel = area.replace(/([A-Z])/g, " $1").trim();
    for (const [code, desc] of Object.entries(bapis)) {
      md += `| ${code} | ${desc} | ${areaLabel} |\n`;
    }
  }
  return md;
}

/**
 * Generate a markdown table of configuration items for a module.
 */
export function generateModuleConfigMarkdown(mod: string): string {
  const data = getModuleData(mod);
  if (!data) return "";

  let md = "| # | Configuration Area | Transaction | Status |\n|---|-------------------|-------------|--------|\n";
  data.configAreas.forEach((area, i) => {
    md += `| ${i + 1} | ${area} | SPRO | To Be Configured |\n`;
  });
  return md;
}

/**
 * Generate authorization roles markdown for a module.
 */
export function generateModuleAuthorizationMarkdown(mod: string): string {
  const moduleNames: Record<string, string> = {
    MM: "Materials Management",
    SD: "Sales & Distribution",
    FI: "Financial Accounting",
    CO: "Controlling",
    PP: "Production Planning",
  };
  const moduleName = moduleNames[mod] || mod;

  return `| Role | Description | Authorization Objects |
|------|-------------|----------------------|
| Z_${mod}_ADMIN | ${moduleName} Administrator | Full access to ${mod} transactions, config |
| Z_${mod}_MANAGER | ${moduleName} Manager | Approve, release, reporting access |
| Z_${mod}_USER | ${moduleName} End User | Create, change, display operational transactions |
| Z_${mod}_DISPLAY | ${moduleName} Display Only | Display access to ${mod} documents and reports |
| Z_${mod}_ANALYST | ${moduleName} Analyst | Reporting and analytics access only |`;
}

/**
 * Generate test scenarios for a module + process area.
 */
export function generateModuleTestScenarios(mod: string, processArea: string): string {
  const moduleNames: Record<string, string> = {
    MM: "Materials Management",
    SD: "Sales & Distribution",
    FI: "Financial Accounting",
    CO: "Controlling",
    PP: "Production Planning",
  };
  const moduleName = moduleNames[mod] || mod;

  return `| # | Test Case | Type | Priority | Expected Result |
|---|-----------|------|----------|-----------------|
| 1 | Create ${moduleName} master data | Unit | High | Master data created successfully |
| 2 | Create ${processArea} document | Unit | High | Document created with correct data |
| 3 | Approval workflow for ${processArea} | Integration | High | Workflow triggers and completes |
| 4 | Post ${processArea} transaction | Integration | High | Transaction posted, updates reflected |
| 5 | Cross-module integration (${mod} → FI) | Integration | High | Financial document created correctly |
| 6 | ${processArea} reporting validation | Integration | Medium | Reports show correct aggregated data |
| 7 | Error handling - missing mandatory fields | Negative | High | Appropriate error message displayed |
| 8 | Error handling - invalid data combinations | Negative | Medium | Validation prevents incorrect posting |
| 9 | Authorization check - restricted user | Negative | High | Access denied for unauthorized actions |
| 10 | End-to-end ${processArea} process | UAT | Critical | Complete business process executes successfully |
| 11 | ${processArea} with special conditions | UAT | Medium | Edge cases handled correctly |
| 12 | Performance test - bulk ${processArea} | UAT | Medium | Process completes within acceptable time |`;
}
