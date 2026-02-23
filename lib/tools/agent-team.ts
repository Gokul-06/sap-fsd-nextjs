/**
 * Agent Teams Orchestration Engine
 * Coordinates a 3-phase pipeline: Team Lead → Specialists → Quality Review
 * Produces higher-quality FSDs through shared context and cross-agent review.
 */

import type { AgentProgressEvent, AgentStatus, TeamLeadContext } from "@/lib/types";
import type { FSDInput, FSDOutput } from "@/lib/tools/generate-fsd";
import { generateFSDMarkdown } from "@/lib/templates/fsd-template";
import { classifyModules, identifyProcessArea } from "@/lib/tools/classify-module";
import {
  isAIEnabled,
  aiTeamLeadAnalysis,
  aiBusinessAnalyst,
  aiSolutionArchitect,
  aiTechnicalConsultant,
  aiProjectManager,
  aiQualityReviewer,
  serializeTeamLeadContext,
} from "@/lib/tools/claude-ai";
import {
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

/**
 * Main orchestration function for Agent Teams mode.
 * Runs 3 sequential phases with SSE progress events.
 */
export async function orchestrateAgentTeam(
  input: FSDInput,
  onProgress: (event: AgentProgressEvent) => void,
): Promise<FSDOutput> {
  const warnings: string[] = [];

  // ─── Step 0: Classify and prepare (same as standard) ───
  const classifiedModules = classifyModules(input.requirements);
  if (classifiedModules.length === 0) {
    warnings.push("Could not auto-detect SAP module. Using MM as default.");
  }

  const primaryModule = input.module || classifiedModules[0]?.module || "MM";
  const relatedModules = classifiedModules
    .filter((m) => !m.isPrimary)
    .map((m) => m.module);

  const integrationModules = getAffectedModules(primaryModule);
  for (const mod of integrationModules) {
    if (!relatedModules.includes(mod) && mod !== primaryModule) {
      relatedModules.push(mod);
    }
  }

  const processArea = identifyProcessArea(input.requirements, primaryModule);
  const integrations = getIntegrationsForModule(primaryModule);
  const crossModuleImpacts = integrations.map(
    (i) => `${i.sourceModule} → ${i.targetModule}: ${i.process} — ${i.dataFlow}`,
  );

  // Build static section content
  const sections = buildSectionContent(primaryModule, relatedModules, processArea, input.requirements, integrations);

  const language = input.language || "English";
  const depth = input.documentDepth || "standard";
  const extraContext = [input.feedbackContext || "", input.fewShotContext || ""]
    .filter(Boolean)
    .join("\n\n");

  const tableNames = flattenTableNames(primaryModule);
  const tcodeNames = flattenTcodeNames(primaryModule);
  const appNames = flattenAppNames(primaryModule);

  if (!isAIEnabled()) {
    warnings.push("ANTHROPIC_API_KEY not set. Agent Teams requires AI. Returning template output.");
    const markdown = generateFSDMarkdown({
      title: input.title, module: primaryModule, relatedModules,
      date: new Date().toISOString().split("T")[0],
      author: input.author || "GP", projectName: input.projectName,
      requirements: input.requirements, processArea, sections,
    });
    onProgress({ phase: "complete", status: "completed" });
    return { markdown, classifiedModules, primaryModule, processArea, language, crossModuleImpacts, warnings };
  }

  // ─── Phase 1: Team Lead Analysis ───
  onProgress({
    phase: "team-lead",
    status: "running",
    message: "Team Lead analyzing requirements and building shared context...",
  });

  let teamLeadCtx: TeamLeadContext;
  try {
    teamLeadCtx = await aiTeamLeadAnalysis(
      primaryModule, input.requirements, processArea,
      tableNames, tcodeNames, appNames,
      language, extraContext, depth,
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    warnings.push(`Team Lead analysis failed: ${msg}. Using fallback.`);
    teamLeadCtx = {
      moduleStrategy: `${primaryModule} implementation for ${processArea}.`,
      processSteps: ["Analyze", "Design", "Configure", "Test", "Go-live"],
      designDecisions: ["Use standard SAP functionality"],
      terminologyGlossary: {},
      riskAreas: ["Requirements need clarification"],
      crossModuleConsiderations: "Standard integrations apply.",
      keyStakeholders: ["Business Users", "IT Team"],
      scopeBoundaries: "As defined in requirements.",
    };
  }

  onProgress({ phase: "team-lead", status: "completed", message: "Team Lead brief ready" });

  const teamLeadBrief = serializeTeamLeadContext(teamLeadCtx);

  // ─── Phase 2: Specialist Agents (parallel) ───
  const specialistAgents = [
    { name: "Business Analyst", role: "Executive Summary & Requirements", status: "running" as AgentStatus },
    { name: "Solution Architect", role: "Solution Design & Process Flows", status: "running" as AgentStatus },
    { name: "Technical Consultant", role: "Error Handling & Output Management", status: "running" as AgentStatus },
    { name: "Project Manager", role: "Migration, Cutover & Testing", status: "running" as AgentStatus },
  ];

  onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents] });

  const [ba, sa, tc, pm] = await Promise.all([
    aiBusinessAnalyst(input.title, primaryModule, input.requirements, processArea, language, extraContext, depth, teamLeadBrief)
      .then((r) => {
        specialistAgents[0].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents] });
        return r;
      })
      .catch((err: unknown) => {
        specialistAgents[0].status = "failed";
        warnings.push(`Business Analyst failed: ${err instanceof Error ? err.message : "Unknown"}`);
        return "";
      }),

    aiSolutionArchitect(primaryModule, input.requirements, processArea, tableNames, tcodeNames, appNames, language, extraContext, depth, teamLeadBrief)
      .then((r) => {
        specialistAgents[1].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents] });
        return r;
      })
      .catch((err: unknown) => {
        specialistAgents[1].status = "failed";
        warnings.push(`Solution Architect failed: ${err instanceof Error ? err.message : "Unknown"}`);
        return "";
      }),

    aiTechnicalConsultant(primaryModule, processArea, input.requirements, language, extraContext, depth, teamLeadBrief)
      .then((r) => {
        specialistAgents[2].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents] });
        return r;
      })
      .catch((err: unknown) => {
        specialistAgents[2].status = "failed";
        warnings.push(`Technical Consultant failed: ${err instanceof Error ? err.message : "Unknown"}`);
        return "";
      }),

    aiProjectManager(primaryModule, processArea, tableNames, language, extraContext, depth, teamLeadBrief)
      .then((r) => {
        specialistAgents[3].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents] });
        return r;
      })
      .catch((err: unknown) => {
        specialistAgents[3].status = "failed";
        warnings.push(`Project Manager failed: ${err instanceof Error ? err.message : "Unknown"}`);
        return "";
      }),
  ]);

  onProgress({ phase: "specialists", status: "completed", agents: specialistAgents });

  // ─── Phase 3: Quality Review ───
  onProgress({
    phase: "quality-review",
    status: "running",
    message: "Quality Reviewer checking consistency across all sections...",
  });

  let reviewResult: {
    corrections: string[];
    finalSections: {
      executiveSummary: string;
      proposedSolution: string;
      outputManagement: string;
      errorHandling: string;
      dataMigration: string;
      cutoverPlan: string;
    };
  };

  try {
    reviewResult = await aiQualityReviewer(
      primaryModule, processArea, language, depth,
      { businessAnalyst: ba, solutionArchitect: sa, technicalConsultant: tc, projectManager: pm },
      teamLeadBrief,
    );

    if (reviewResult.corrections.length > 0) {
      warnings.push(`Quality Review applied ${reviewResult.corrections.length} corrections for consistency.`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    warnings.push(`Quality review failed: ${msg}. Using raw specialist outputs.`);
    // Fallback: use specialist outputs directly
    reviewResult = {
      corrections: [],
      finalSections: {
        executiveSummary: ba,
        proposedSolution: sa,
        outputManagement: extractSectionFromMarker(tc, "OUTPUT MANAGEMENT"),
        errorHandling: extractSectionFromMarker(tc, "ERROR HANDLING"),
        dataMigration: extractSectionFromMarker(pm, "DATA MIGRATION"),
        cutoverPlan: extractSectionFromMarker(pm, "CUTOVER PLAN"),
      },
    };
  }

  onProgress({ phase: "quality-review", status: "completed", message: "Quality review complete" });

  // ─── Final Assembly ───
  // Inject reviewed outputs into sections
  if (reviewResult.finalSections.executiveSummary) {
    sections["executive_summary"] = { content: reviewResult.finalSections.executiveSummary };
  }
  if (reviewResult.finalSections.proposedSolution) {
    sections["proposed_solution"] = { content: reviewResult.finalSections.proposedSolution };
  }
  if (reviewResult.finalSections.outputManagement) {
    sections["output_management"] = { content: reviewResult.finalSections.outputManagement };
  }
  if (reviewResult.finalSections.errorHandling) {
    sections["error_handling"] = { content: reviewResult.finalSections.errorHandling };
  }
  if (reviewResult.finalSections.dataMigration) {
    sections["data_migration"] = { content: reviewResult.finalSections.dataMigration };
  }
  if (reviewResult.finalSections.cutoverPlan) {
    sections["cutover"] = { content: reviewResult.finalSections.cutoverPlan };
  }

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

  const output: FSDOutput = {
    markdown,
    classifiedModules,
    primaryModule,
    processArea,
    language,
    crossModuleImpacts,
    warnings,
  };

  // Note: "complete" event with result is sent by the API route handler, not here
  return output;
}

/** Extract section from marker-separated output */
function extractSectionFromMarker(combined: string, sectionName: string): string {
  const marker = `=== ${sectionName} ===`;
  const idx = combined.indexOf(marker);
  if (idx === -1) return combined;
  const after = combined.substring(idx + marker.length).trim();
  const nextIdx = after.indexOf("===");
  if (nextIdx === -1) return after;
  return after.substring(0, nextIdx).trim();
}

/** Build static section content — same as generate-fsd.ts buildSectionContent */
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
  }>,
): Record<string, Record<string, string>> {
  const sections: Record<string, Record<string, string>> = {};

  // Section 3: Business Requirements
  const lines = requirements
    .split(/[\n.;]/)
    .map((l) => l.trim())
    .filter((l) => l.length > 10);
  let reqTable = "| Req ID | Description | Priority | MoSCoW |\n|--------|-------------|----------|--------|\n";
  lines.forEach((line, i) => {
    reqTable += `| FR-${String(i + 1).padStart(3, "0")} | ${line} | High | Must |\n`;
  });
  sections["business_requirements"] = { requirements_list: reqTable };

  // Section 5: SAP Configuration
  if (isModuleSupported(primaryModule)) {
    sections["sap_configuration"] = {
      config_items: generateModuleConfigMarkdown(primaryModule),
      master_data: generateMasterDataSimple(primaryModule),
    };
  }

  // Section 6: Technical Objects
  if (isModuleSupported(primaryModule)) {
    sections["technical_objects"] = {
      standard_tables: generateModuleTablesMarkdown(primaryModule),
      cds_views: generateModuleCdsViewsMarkdown(primaryModule),
      fiori_apps: generateModuleFioriAppsMarkdown(primaryModule),
      bapis_rfcs: generateModuleBapisMarkdown(primaryModule),
    };
  }

  // Section 7: Integration
  let intTable = "| Source Module | Target Module | Integration Point | Data Flow | Critical Considerations |\n|--------------|---------------|-------------------|-----------|------------------------|\n";
  for (const intg of integrations) {
    intTable += `| ${intg.sourceModule} | ${intg.targetModule} | ${intg.process} | ${intg.dataFlow} | ${intg.criticalConsiderations[0] || "N/A"} |\n`;
  }
  sections["integration"] = { cross_module: intTable };

  // Section 8: Authorization
  sections["authorization"] = { roles: generateModuleAuthorizationMarkdown(primaryModule) };

  // Section 12: Testing
  let testTable = "| Test ID | Source Module | Target Module | Scenario | Expected Result |\n|---------|--------------|---------------|----------|----------------|\n";
  integrations.forEach((intg, i) => {
    testTable += `| IT-${String(i + 1).padStart(3, "0")} | ${intg.sourceModule} | ${intg.targetModule} | Verify ${intg.process} | ${intg.dataFlow} |\n`;
  });
  sections["testing"] = {
    test_scenarios: generateModuleTestScenarios(primaryModule, processArea),
    integration_tests: testTable,
  };

  return sections;
}

/** Simplified master data table */
function generateMasterDataSimple(module: string): string {
  const mdMap: Record<string, string[][]> = {
    MM: [
      ["Material Master", "Basic, Purchasing, MRP, Accounting", "MDM Team", "Yes"],
      ["Vendor Master", "General, Company Code, Purchasing Org", "MDM Team", "Yes"],
      ["Purchasing Info Record", "General, Purchasing Org", "Procurement", "Yes"],
    ],
    SD: [
      ["Customer Master", "General, Company Code, Sales Area", "MDM Team", "Yes"],
      ["Material Master", "Basic, Sales Org, Plant", "MDM Team", "Yes"],
      ["Pricing Conditions", "Condition records, Scales", "Sales Team", "Yes"],
    ],
    FI: [
      ["GL Account Master", "COA, Company Code", "Finance Team", "Yes"],
      ["Vendor Master", "General, Company Code, Payment", "MDM Team", "Yes"],
      ["Customer Master", "General, Company Code, Dunning", "MDM Team", "Yes"],
    ],
    CO: [
      ["Cost Center Master", "Basic, Indicators", "Controlling Team", "Yes"],
      ["Profit Center Master", "Basic, Company Code Assignment", "Controlling Team", "Yes"],
      ["Activity Type", "Basic, Prices", "Controlling Team", "Yes"],
    ],
    PP: [
      ["Material Master", "Basic, MRP, Work Scheduling", "MDM Team", "Yes"],
      ["Bill of Material", "Header, Items", "Engineering", "Yes"],
      ["Work Center", "Basic, Capacities, Scheduling", "Production Team", "Yes"],
    ],
  };
  const objects = mdMap[module] || mdMap["MM"] || [];
  let table = "| Master Data Object | Fields / Views | Responsibility | Migration? |\n|-------------------|----------------|----------------|------------|\n";
  for (const row of objects) {
    table += `| ${row[0]} | ${row[1]} | ${row[2]} | ${row[3]} |\n`;
  }
  return table;
}
