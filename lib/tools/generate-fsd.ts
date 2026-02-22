/**
 * FSD Generation Engine
 * Takes classified requirements and produces a structured FSD markdown document
 */

import { FSD_TEMPLATE_SECTIONS, generateFSDMarkdown } from "@/lib/templates/fsd-template";
import { classifyModules, identifyProcessArea } from "@/lib/tools/classify-module";
import {
  isAIEnabled,
  aiExecutiveSummary,
  aiProposedSolution,
  aiOutputManagement,
  aiErrorHandling,
  aiDataMigration,
  aiCutoverPlan,
} from "@/lib/tools/claude-ai";
import {
  MM_TABLES,
  MM_TCODES,
  MM_FIORI_APPS,
  MM_CDS_VIEWS,
  MM_BAPIS,
  MM_MOVEMENT_TYPES,
  MM_INTEGRATION_POINTS,
  MM_PROCESS_AREAS,
  MM_CONFIG_AREAS,
} from "@/lib/knowledge/sap-mm-reference";
import {
  getIntegrationsForModule,
  getAffectedModules,
  CROSS_MODULE_INTEGRATIONS,
} from "@/lib/knowledge/cross-module-map";

export interface FSDInput {
  title: string;
  projectName: string;
  author: string;
  requirements: string;
  module?: string; // Optional override — if not provided, auto-classify
  includeAllSections?: boolean;
}

export interface FSDOutput {
  markdown: string;
  classifiedModules: Array<{
    module: string;
    confidence: number;
    isPrimary: boolean;
    matchedKeywords: string[];
  }>;
  primaryModule: string;
  processArea: string;
  crossModuleImpacts: string[];
  warnings: string[];
}

export async function generateFSD(input: FSDInput): Promise<FSDOutput> {
  const warnings: string[] = [];

  // Step 1: Classify modules from requirements
  const classifiedModules = classifyModules(input.requirements);

  if (classifiedModules.length === 0) {
    warnings.push(
      "Could not auto-detect SAP module from requirements. Using MM as default. Please specify the module explicitly."
    );
  }

  const primaryModule = input.module || classifiedModules[0]?.module || "MM";
  const relatedModules = classifiedModules
    .filter((m) => !m.isPrimary)
    .map((m) => m.module);

  // Add integration-based related modules
  const integrationModules = getAffectedModules(primaryModule);
  for (const mod of integrationModules) {
    if (!relatedModules.includes(mod) && mod !== primaryModule) {
      relatedModules.push(mod);
    }
  }

  // Step 2: Identify process area
  const processArea = identifyProcessArea(input.requirements, primaryModule);

  // Step 3: Get cross-module impacts
  const integrations = getIntegrationsForModule(primaryModule);
  const crossModuleImpacts = integrations.map(
    (i) =>
      `${i.sourceModule} → ${i.targetModule}: ${i.process} — ${i.dataFlow}`
  );

  // Step 4: Build section content (hardcoded data)
  const sections = buildSectionContent(
    primaryModule,
    relatedModules,
    processArea,
    input.requirements,
    integrations
  );

  // Step 5: AI-enhanced sections (if API key is available)
  if (isAIEnabled()) {
    try {
      // Collect table/tcode/app names for context
      const tableNames: string[] = [];
      const tcodeNames: string[] = [];
      const appNames: string[] = [];

      if (primaryModule === "MM") {
        for (const group of Object.values(MM_TABLES)) {
          for (const [tbl, desc] of Object.entries(group)) {
            tableNames.push(`${tbl} (${desc})`);
          }
        }
        for (const group of Object.values(MM_TCODES)) {
          for (const [tc, desc] of Object.entries(group)) {
            tcodeNames.push(`${tc} (${desc})`);
          }
        }
        for (const group of Object.values(MM_FIORI_APPS)) {
          for (const [id, name] of Object.entries(group)) {
            appNames.push(`${id}: ${name}`);
          }
        }
      }

      // Call Claude AI for all empty sections in parallel
      const [
        executiveSummary,
        proposedSolution,
        outputManagement,
        errorHandling,
        dataMigration,
        cutoverPlan,
      ] = await Promise.all([
        aiExecutiveSummary(input.title, primaryModule, input.requirements, processArea),
        aiProposedSolution(primaryModule, input.requirements, processArea, tableNames, tcodeNames, appNames),
        aiOutputManagement(primaryModule, processArea, input.requirements),
        aiErrorHandling(primaryModule, processArea, input.requirements),
        aiDataMigration(primaryModule, processArea, tableNames),
        aiCutoverPlan(primaryModule, processArea),
      ]);

      // Inject AI content into sections
      sections["executive_summary"] = { content: executiveSummary };
      sections["proposed_solution"] = { content: proposedSolution };
      sections["output_management"] = { content: outputManagement };
      sections["error_handling"] = { content: errorHandling };
      sections["data_migration"] = { content: dataMigration };
      sections["cutover"] = { content: cutoverPlan };

    } catch (err: any) {
      warnings.push(`AI enhancement partially failed: ${err.message}. Some sections use templates.`);
    }
  } else {
    warnings.push("ANTHROPIC_API_KEY not set. Sections 2, 4, 9, 10, 11, 13 will use placeholder templates.");
  }

  // Step 6: Generate markdown
  const today = new Date().toISOString().split("T")[0];
  const markdown = generateFSDMarkdown({
    title: input.title,
    module: primaryModule,
    relatedModules,
    date: today,
    author: input.author,
    projectName: input.projectName,
    requirements: input.requirements,
    processArea,
    sections,
  });

  return {
    markdown,
    classifiedModules,
    primaryModule,
    processArea,
    crossModuleImpacts,
    warnings,
  };
}

function buildSectionContent(
  primaryModule: string,
  relatedModules: string[],
  processArea: string,
  requirements: string,
  integrations: Array<{
    sourceModule: string;
    targetModule: string;
    process: string;
    dataFlow: string;
    keyObjects: string[];
    criticalConsiderations: string[];
  }>
): Record<string, Record<string, string>> {
  const sections: Record<string, Record<string, string>> = {};

  // Section 3: Business Requirements
  sections["business_requirements"] = {
    requirements_list: generateRequirementsTable(requirements),
  };

  // Section 5: SAP Configuration (module-specific)
  if (primaryModule === "MM") {
    sections["sap_configuration"] = {
      config_items: generateMMConfigTable(processArea),
      master_data: generateMMMasterDataTable(processArea),
    };
  }

  // Section 6: Technical Objects (module-specific)
  if (primaryModule === "MM") {
    sections["technical_objects"] = {
      standard_tables: generateMMTablesSection(processArea),
      cds_views: generateMMCDSViewsSection(processArea),
      fiori_apps: generateMMFioriAppsSection(processArea),
      bapis_rfcs: generateMMBAPIsSection(processArea),
    };
  }

  // Section 7: Integration
  sections["integration"] = {
    cross_module: generateIntegrationTable(integrations),
  };

  // Section 8: Authorization
  sections["authorization"] = {
    roles: generateAuthorizationSection(primaryModule, processArea),
  };

  // Section 12: Testing
  sections["testing"] = {
    test_scenarios: generateTestScenarios(primaryModule, processArea, requirements),
    integration_tests: generateIntegrationTestScenarios(primaryModule, integrations),
  };

  return sections;
}

// --- Helper generators ---

function generateRequirementsTable(requirements: string): string {
  const lines = requirements
    .split(/[\n.;]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  let table =
    "| Req ID | Description | Priority | MoSCoW |\n|--------|-------------|----------|--------|\n";

  lines.forEach((line, i) => {
    const id = `FR-${String(i + 1).padStart(3, "0")}`;
    table += `| ${id} | ${line} | High | Must |\n`;
  });

  return table;
}

function generateMMTablesSection(processArea: string): string {
  let table =
    "| Table | Description | Usage in This Spec |\n|-------|-------------|-------------------|\n";

  const relevantGroups = getRelevantMMGroups(processArea);

  for (const group of relevantGroups) {
    const tables = (MM_TABLES as Record<string, Record<string, string>>)[group];
    if (tables) {
      for (const [tbl, desc] of Object.entries(tables)) {
        table += `| ${tbl} | ${desc} | Read/Write |\n`;
      }
    }
  }

  return table;
}

function generateMMCDSViewsSection(processArea: string): string {
  let table =
    "| CDS View / Service | Description | Usage |\n|--------------------|-------------|-------|\n";

  const relevantGroups = getRelevantMMGroups(processArea);

  for (const group of relevantGroups) {
    const views = (MM_CDS_VIEWS as Record<string, Record<string, string>>)[group];
    if (views) {
      for (const [view, desc] of Object.entries(views)) {
        table += `| ${view} | ${desc} | Read |\n`;
      }
    }
  }

  return table;
}

function generateMMFioriAppsSection(processArea: string): string {
  let table =
    "| App ID | App Name | Usage | Custom Extension? |\n|--------|----------|-------|------------------|\n";

  const relevantGroups = getRelevantMMFioriGroups(processArea);

  for (const group of relevantGroups) {
    const apps = (MM_FIORI_APPS as Record<string, Record<string, string>>)[group];
    if (apps) {
      for (const [appId, appName] of Object.entries(apps)) {
        table += `| ${appId} | ${appName} | Standard | No |\n`;
      }
    }
  }

  return table;
}

function generateMMBAPIsSection(processArea: string): string {
  let table =
    "| BAPI/RFC/API | Description | Direction | Usage |\n|-------------|-------------|-----------|-------|\n";

  const relevantGroups = getRelevantMMBAPIGroups(processArea);

  for (const group of relevantGroups) {
    const bapis = (MM_BAPIS as Record<string, Record<string, string>>)[group];
    if (bapis) {
      for (const [bapi, desc] of Object.entries(bapis)) {
        table += `| ${bapi} | ${desc} | Inbound | Custom Development |\n`;
      }
    }
  }

  return table;
}

function generateMMConfigTable(processArea: string): string {
  let table =
    "| Config Item | SPRO Path / TCode | Current Setting | New Setting | Rationale |\n|-------------|-------------------|-----------------|-------------|-----------||\n";

  const configs = MM_CONFIG_AREAS.slice(0, 8); // Top 8 relevant configs
  configs.forEach((cfg) => {
    table += `| ${cfg} | SPRO > MM | TBD | TBD | Per business requirements |\n`;
  });

  return table;
}

function generateMMMasterDataTable(processArea: string): string {
  let table =
    "| Master Data Object | Fields / Views | Responsibility | Migration? |\n|-------------------|----------------|----------------|------------|\n";

  const masterDataObjects = [
    { object: "Material Master", views: "Basic, Purchasing, MRP, Accounting, Storage", resp: "MDM Team", migrate: "Yes" },
    { object: "Vendor Master", views: "General, Company Code, Purchasing Org", resp: "MDM Team", migrate: "Yes" },
    { object: "Purchasing Info Record", views: "General, Purchasing Org", resp: "Procurement", migrate: "Yes" },
    { object: "Source List", views: "Material/Vendor/Plant", resp: "Procurement", migrate: "Conditional" },
    { object: "Quota Arrangement", views: "Vendor split ratios", resp: "Procurement", migrate: "Conditional" },
  ];

  for (const md of masterDataObjects) {
    table += `| ${md.object} | ${md.views} | ${md.resp} | ${md.migrate} |\n`;
  }

  return table;
}

function generateIntegrationTable(
  integrations: Array<{
    sourceModule: string;
    targetModule: string;
    process: string;
    dataFlow: string;
    keyObjects: string[];
    criticalConsiderations: string[];
  }>
): string {
  let table =
    "| Source Module | Target Module | Integration Point | Data Flow | Critical Considerations |\n|--------------|---------------|-------------------|-----------|------------------------|\n";

  for (const intg of integrations) {
    table += `| ${intg.sourceModule} | ${intg.targetModule} | ${intg.process} | ${intg.dataFlow} | ${intg.criticalConsiderations[0] || "N/A"} |\n`;
  }

  return table;
}

function generateAuthorizationSection(module: string, processArea: string): string {
  let table =
    "| Role | Description | Auth Objects | T-Codes / Apps |\n|------|-------------|-------------|----------------|\n";

  if (module === "MM") {
    const roles = [
      { role: "Z_MM_BUYER", desc: "Procurement Buyer", auth: "M_BEST_EKG, M_BEST_EKO, M_BEST_WRK", tcodes: "ME21N, ME22N, ME23N" },
      { role: "Z_MM_PR_CREATOR", desc: "PR Creator", auth: "M_BANF_EKG, M_BANF_EKO, M_BANF_WRK", tcodes: "ME51N, ME52N, ME53N" },
      { role: "Z_MM_PR_APPROVER", desc: "PR Approver", auth: "M_BANF_FRG, M_EINK_FRG", tcodes: "ME54N, ME55" },
      { role: "Z_MM_PO_APPROVER", desc: "PO Approver", auth: "M_BEST_FRG, M_EINK_FRG", tcodes: "ME28, ME29N" },
      { role: "Z_MM_GR_CLERK", desc: "Goods Receipt Clerk", auth: "M_MSEG_BWA, M_MSEG_WMB", tcodes: "MIGO, MB01" },
      { role: "Z_MM_IV_CLERK", desc: "Invoice Verification Clerk", auth: "M_RECH_BUK, M_RECH_EKG", tcodes: "MIRO, MIR4, MRBR" },
      { role: "Z_MM_INV_MANAGER", desc: "Inventory Manager", auth: "M_MSEG_BWA, M_MSEG_LGO", tcodes: "MMBE, MB52, MI01" },
    ];

    for (const r of roles) {
      table += `| ${r.role} | ${r.desc} | ${r.auth} | ${r.tcodes} |\n`;
    }
  }

  return table;
}

function generateTestScenarios(module: string, processArea: string, requirements: string): string {
  let table =
    "| Test ID | Scenario | Steps | Expected Result | Priority |\n|---------|----------|-------|-----------------|----------|\n";

  if (module === "MM") {
    const scenarios = getMMTestScenarios(processArea);
    scenarios.forEach((s, i) => {
      table += `| TS-${String(i + 1).padStart(3, "0")} | ${s.scenario} | ${s.steps} | ${s.expected} | ${s.priority} |\n`;
    });
  }

  return table;
}

function generateIntegrationTestScenarios(
  module: string,
  integrations: Array<{
    sourceModule: string;
    targetModule: string;
    process: string;
    dataFlow: string;
  }>
): string {
  let table =
    "| Test ID | Source Module | Target Module | Scenario | Expected Result |\n|---------|--------------|---------------|----------|----------------|\n";

  integrations.forEach((intg, i) => {
    table += `| IT-${String(i + 1).padStart(3, "0")} | ${intg.sourceModule} | ${intg.targetModule} | Verify ${intg.process} | ${intg.dataFlow} |\n`;
  });

  return table;
}

// --- Mapping helpers ---

function getRelevantMMGroups(processArea: string): string[] {
  const mapping: Record<string, string[]> = {
    "Procure-to-Pay (P2P)": ["procurement", "invoiceVerification", "masterData"],
    "Inventory Management": ["inventory", "masterData"],
    "Invoice Verification": ["invoiceVerification", "procurement"],
    "Material Requirements Planning": ["procurement", "inventory", "masterData"],
    "Vendor Management": ["procurement", "masterData"],
    "Contract Management": ["procurement", "masterData"],
    General: ["procurement", "inventory", "invoiceVerification", "masterData"],
  };
  return mapping[processArea] || mapping["General"];
}

function getRelevantMMFioriGroups(processArea: string): string[] {
  const mapping: Record<string, string[]> = {
    "Procure-to-Pay (P2P)": ["procurement", "analytics"],
    "Inventory Management": ["inventory", "analytics"],
    "Invoice Verification": ["procurement"],
    General: ["procurement", "inventory", "analytics"],
  };
  return mapping[processArea] || mapping["General"];
}

function getRelevantMMBAPIGroups(processArea: string): string[] {
  const mapping: Record<string, string[]> = {
    "Procure-to-Pay (P2P)": ["purchaseOrder", "purchaseRequisition", "goodsMovement"],
    "Inventory Management": ["goodsMovement", "materialMaster"],
    "Invoice Verification": ["purchaseOrder"],
    General: ["purchaseOrder", "purchaseRequisition", "goodsMovement", "materialMaster", "vendor"],
  };
  return mapping[processArea] || mapping["General"];
}

function getMMTestScenarios(processArea: string): Array<{
  scenario: string;
  steps: string;
  expected: string;
  priority: string;
}> {
  const allScenarios = [
    {
      scenario: "Create Purchase Requisition",
      steps: "1. Open ME51N  2. Enter material, qty, plant  3. Save",
      expected: "PR created with correct account assignment",
      priority: "High",
    },
    {
      scenario: "PR Release Strategy",
      steps: "1. Open ME54N  2. Select PR  3. Release",
      expected: "PR released per release strategy",
      priority: "High",
    },
    {
      scenario: "Create Purchase Order from PR",
      steps: "1. Open ME21N  2. Reference PR  3. Assign vendor  4. Save",
      expected: "PO created with PR reference",
      priority: "High",
    },
    {
      scenario: "PO Release Strategy",
      steps: "1. Open ME28  2. Select PO  3. Release",
      expected: "PO released and ready for GR",
      priority: "High",
    },
    {
      scenario: "Goods Receipt against PO",
      steps: "1. Open MIGO  2. Select GR for PO  3. Enter PO number  4. Post",
      expected: "Material document and accounting document created",
      priority: "High",
    },
    {
      scenario: "Invoice Verification",
      steps: "1. Open MIRO  2. Enter PO reference  3. Enter invoice amount  4. Post",
      expected: "Invoice posted; GR/IR cleared",
      priority: "High",
    },
    {
      scenario: "3-Way Match Variance",
      steps: "1. Post invoice with price variance  2. Check tolerance",
      expected: "Invoice blocked if variance exceeds tolerance",
      priority: "Medium",
    },
    {
      scenario: "Stock Transfer between Plants",
      steps: "1. Create STO  2. Post GI at sending plant  3. Post GR at receiving plant",
      expected: "Stock moved; both material documents created",
      priority: "Medium",
    },
    {
      scenario: "Physical Inventory",
      steps: "1. Create PI doc (MI01)  2. Enter count (MI04)  3. Post differences (MI07)",
      expected: "Stock adjusted; variance document posted",
      priority: "Medium",
    },
    {
      scenario: "Vendor Returns",
      steps: "1. Create return PO  2. Post GI to vendor (mvt type 122)",
      expected: "Stock reduced; vendor credit expected",
      priority: "Medium",
    },
  ];

  return allScenarios;
}
