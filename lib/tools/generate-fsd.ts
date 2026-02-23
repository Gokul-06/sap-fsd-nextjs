/**
 * FSD Generation Engine
 * Takes classified requirements and produces a structured FSD markdown document
 * Uses module-registry for all module data (MM, SD, FI, CO, PP)
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
  aiProcessFlowDiagram,
} from "@/lib/tools/claude-ai";
import {
  getModuleData,
  isModuleSupported,
  flattenTableNames,
  flattenTcodeNames,
  flattenAppNames,
  generateModuleTablesMarkdown,
  generateModuleTcodesMarkdown,
  generateModuleFioriAppsMarkdown,
  generateModuleCdsViewsMarkdown,
  generateModuleBapisMarkdown,
  generateModuleConfigMarkdown,
  generateModuleAuthorizationMarkdown,
  generateModuleTestScenarios,
} from "@/lib/knowledge/module-registry";
import {
  getIntegrationsForModule,
  getAffectedModules,
} from "@/lib/knowledge/cross-module-map";

export interface FSDInput {
  title: string;
  projectName: string;
  author: string;
  requirements: string;
  module?: string; // Optional override — if not provided, auto-classify
  language?: string; // Output language — defaults to "English"
  documentDepth?: "standard" | "comprehensive"; // Document detail level
  includeAllSections?: boolean;
  feedbackContext?: string; // Injected feedback rules context
  fewShotContext?: string; // Injected few-shot examples context
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
  language: string;
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

  // Step 4: Build section content using module-registry (generic for all modules)
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
      // Collect table/tcode/app names for AI context — works for ALL modules
      const tableNames = flattenTableNames(primaryModule);
      const tcodeNames = flattenTcodeNames(primaryModule);
      const appNames = flattenAppNames(primaryModule);

      // Build extra context from feedback rules and few-shot examples
      const extraContext = [
        input.feedbackContext || "",
        input.fewShotContext || "",
      ].filter(Boolean).join("\n\n");

      // Call Claude AI for all empty sections in parallel
      const language = input.language || "English";
      const depth = input.documentDepth || "standard";
      const [
        executiveSummary,
        proposedSolution,
        outputManagement,
        errorHandling,
        dataMigration,
        cutoverPlan,
        processFlowDiagram,
      ] = await Promise.all([
        aiExecutiveSummary(input.title, primaryModule, input.requirements, processArea, language, extraContext, depth),
        aiProposedSolution(primaryModule, input.requirements, processArea, tableNames, tcodeNames, appNames, language, extraContext, depth),
        aiOutputManagement(primaryModule, processArea, input.requirements, language, extraContext, depth),
        aiErrorHandling(primaryModule, processArea, input.requirements, language, extraContext, depth),
        aiDataMigration(primaryModule, processArea, tableNames, language, extraContext, depth),
        aiCutoverPlan(primaryModule, processArea, language, extraContext, depth),
        aiProcessFlowDiagram(primaryModule, input.requirements, processArea, language, extraContext, depth),
      ]);

      // Inject AI content into sections
      sections["executive_summary"] = { content: executiveSummary };
      // Append process flow diagram to proposed solution
      const solutionWithDiagram = proposedSolution + "\n\n### 4.4 Process Flow Diagram\n\n" + processFlowDiagram;
      sections["proposed_solution"] = { content: solutionWithDiagram };
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
    author: input.author || "GP",
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
    language: input.language || "English",
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

  // Section 5: SAP Configuration (generic for all supported modules)
  if (isModuleSupported(primaryModule)) {
    sections["sap_configuration"] = {
      config_items: generateModuleConfigMarkdown(primaryModule),
      master_data: generateMasterDataTable(primaryModule, processArea),
    };
  }

  // Section 6: Technical Objects (generic for all supported modules)
  if (isModuleSupported(primaryModule)) {
    sections["technical_objects"] = {
      standard_tables: generateModuleTablesMarkdown(primaryModule),
      cds_views: generateModuleCdsViewsMarkdown(primaryModule),
      fiori_apps: generateModuleFioriAppsMarkdown(primaryModule),
      bapis_rfcs: generateModuleBapisMarkdown(primaryModule),
    };
  }

  // Section 7: Integration
  sections["integration"] = {
    cross_module: generateIntegrationTable(integrations),
  };

  // Section 8: Authorization (generic for all supported modules)
  sections["authorization"] = {
    roles: generateModuleAuthorizationMarkdown(primaryModule),
  };

  // Section 12: Testing (generic for all supported modules)
  sections["testing"] = {
    test_scenarios: generateModuleTestScenarios(primaryModule, processArea),
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

function generateMasterDataTable(module: string, processArea: string): string {
  const masterDataMap: Record<string, Array<{ object: string; views: string; resp: string; migrate: string }>> = {
    MM: [
      { object: "Material Master", views: "Basic, Purchasing, MRP, Accounting, Storage", resp: "MDM Team", migrate: "Yes" },
      { object: "Vendor Master", views: "General, Company Code, Purchasing Org", resp: "MDM Team", migrate: "Yes" },
      { object: "Purchasing Info Record", views: "General, Purchasing Org", resp: "Procurement", migrate: "Yes" },
      { object: "Source List", views: "Material/Vendor/Plant", resp: "Procurement", migrate: "Conditional" },
      { object: "Quota Arrangement", views: "Vendor split ratios", resp: "Procurement", migrate: "Conditional" },
    ],
    SD: [
      { object: "Customer Master", views: "General, Company Code, Sales Area", resp: "MDM Team", migrate: "Yes" },
      { object: "Material Master", views: "Basic, Sales Org, Plant, Distribution", resp: "MDM Team", migrate: "Yes" },
      { object: "Pricing Conditions", views: "Condition records, Scales", resp: "Sales Team", migrate: "Yes" },
      { object: "Credit Master", views: "Credit limits, Risk categories", resp: "Finance", migrate: "Conditional" },
      { object: "Output Master", views: "Output types, Partners, Media", resp: "IT Team", migrate: "Conditional" },
    ],
    FI: [
      { object: "GL Account Master", views: "COA, Company Code", resp: "Finance Team", migrate: "Yes" },
      { object: "Vendor Master", views: "General, Company Code, Payment", resp: "MDM Team", migrate: "Yes" },
      { object: "Customer Master", views: "General, Company Code, Dunning", resp: "MDM Team", migrate: "Yes" },
      { object: "Bank Master", views: "Bank key, Account ID", resp: "Treasury", migrate: "Yes" },
      { object: "Asset Master", views: "General, Depreciation areas, Time-dependent", resp: "Finance Team", migrate: "Conditional" },
    ],
    CO: [
      { object: "Cost Center Master", views: "Basic, Indicators, Communication", resp: "Controlling Team", migrate: "Yes" },
      { object: "Profit Center Master", views: "Basic, Indicators, Company Code Assignment", resp: "Controlling Team", migrate: "Yes" },
      { object: "Activity Type", views: "Basic, Prices, Allocation", resp: "Controlling Team", migrate: "Yes" },
      { object: "Cost Element Master", views: "Primary, Secondary", resp: "Controlling Team", migrate: "Yes" },
      { object: "Statistical Key Figures", views: "Basic data, Unit of measure", resp: "Controlling Team", migrate: "Conditional" },
    ],
    PP: [
      { object: "Material Master", views: "Basic, MRP, Work Scheduling, Production", resp: "MDM Team", migrate: "Yes" },
      { object: "Bill of Material", views: "Header, Items, Sub-items", resp: "Engineering", migrate: "Yes" },
      { object: "Work Center", views: "Basic, Capacities, Scheduling, Costing", resp: "Production Team", migrate: "Yes" },
      { object: "Routing", views: "Header, Operations, Component Assignment", resp: "Engineering", migrate: "Yes" },
      { object: "Production Version", views: "BOM/Routing assignment, Lot size", resp: "Production Team", migrate: "Conditional" },
    ],
  };

  const objects = masterDataMap[module] || masterDataMap["MM"];

  let table =
    "| Master Data Object | Fields / Views | Responsibility | Migration? |\n|-------------------|----------------|----------------|------------|\n";

  for (const md of objects) {
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
