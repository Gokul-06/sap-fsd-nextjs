/**
 * Agent Teams Orchestration Engine
 * Coordinates a 3-phase pipeline: Team Lead → Specialists → Quality Review
 * Produces higher-quality FSDs through shared context and cross-agent review.
 */

import type { AgentProgressEvent, AgentStatus, TeamLeadContext, FsdType } from "@/lib/types";
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
  aiTestScripts,
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

// ─── Timeout budgets (must sum to < 300s Vercel limit) ───
const PHASE1_TIMEOUT_MS = 60_000;   // Team Lead: 60s
const PHASE2_TIMEOUT_MS = 90_000;   // Specialists (parallel): 90s
const PHASE3_TIMEOUT_MS = 90_000;   // Quality Review + Test Scripts (parallel): 90s
// Total worst-case: 240s → 60s safety margin before 300s Vercel limit

/**
 * Wraps a promise with an orchestration-level timeout.
 * If the promise does not resolve within `ms`, rejects with a descriptive error.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

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
  const fsdType: FsdType = (input.fsdType as FsdType) || "standard";
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
    teamLeadCtx = await withTimeout(
      aiTeamLeadAnalysis(
        primaryModule, input.requirements, processArea,
        tableNames, tcodeNames, appNames,
        language, extraContext, depth, fsdType,
      ),
      PHASE1_TIMEOUT_MS,
      "Phase 1 (Team Lead)",
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    // Team Lead failure is critical — propagate the error with context
    onProgress({
      phase: "team-lead",
      status: "failed",
      message: `Team Lead failed: ${msg}`,
    });
    throw new Error(`Phase 1 (Team Lead) failed: ${msg}. Please try again or use Standard mode.`);
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

  const [ba, sa, tc, pm] = await withTimeout(Promise.all([
    aiBusinessAnalyst(input.title, primaryModule, input.requirements, processArea, language, extraContext, depth, teamLeadBrief, fsdType)
      .then((r) => {
        specialistAgents[0].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: "Business Analyst completed" });
        return r;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown";
        specialistAgents[0].status = "failed";
        warnings.push(`Business Analyst failed: ${msg}`);
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: `Business Analyst failed: ${msg}` });
        return "";
      }),

    aiSolutionArchitect(primaryModule, input.requirements, processArea, tableNames, tcodeNames, appNames, language, extraContext, depth, teamLeadBrief, fsdType)
      .then((r) => {
        specialistAgents[1].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: "Solution Architect completed" });
        return r;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown";
        specialistAgents[1].status = "failed";
        warnings.push(`Solution Architect failed: ${msg}`);
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: `Solution Architect failed: ${msg}` });
        return "";
      }),

    aiTechnicalConsultant(primaryModule, processArea, input.requirements, language, extraContext, depth, teamLeadBrief, fsdType)
      .then((r) => {
        specialistAgents[2].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: "Technical Consultant completed" });
        return r;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown";
        specialistAgents[2].status = "failed";
        warnings.push(`Technical Consultant failed: ${msg}`);
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: `Technical Consultant failed: ${msg}` });
        return "";
      }),

    aiProjectManager(primaryModule, processArea, tableNames, language, extraContext, depth, teamLeadBrief, fsdType)
      .then((r) => {
        specialistAgents[3].status = "completed";
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: "Project Manager completed" });
        return r;
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown";
        specialistAgents[3].status = "failed";
        warnings.push(`Project Manager failed: ${msg}`);
        onProgress({ phase: "specialists", status: "running", agents: [...specialistAgents], message: `Project Manager failed: ${msg}` });
        return "";
      }),
  ]), PHASE2_TIMEOUT_MS, "Phase 2 (Specialists)");

  // Check if ALL specialists failed — that's a critical failure
  const failedCount = specialistAgents.filter(a => a.status === "failed").length;
  if (failedCount === 4) {
    throw new Error("All 4 specialist agents failed. Please check your API key and try again.");
  }
  if (failedCount >= 3) {
    warnings.push(`WARNING: ${failedCount} of 4 specialists failed. Output quality will be significantly reduced.`);
  }

  onProgress({ phase: "specialists", status: "completed", agents: specialistAgents });

  // ─── Phase 3: Quality Review + AI Test Scripts (parallel) ───
  onProgress({
    phase: "quality-review",
    status: "running",
    message: "Quality Reviewer checking consistency + generating test scripts...",
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

  // Run quality review and test scripts in parallel (test scripts don't depend on review)
  let testScriptsResult = "";
  try {
    const [qrResult, tsResult] = await withTimeout(Promise.all([
      aiQualityReviewer(
        primaryModule, processArea, language, depth,
        { businessAnalyst: ba, solutionArchitect: sa, technicalConsultant: tc, projectManager: pm },
        teamLeadBrief,
      ),
      aiTestScripts(primaryModule, input.requirements, processArea, fsdType, language, extraContext, depth)
        .catch((tsErr: unknown) => {
          const tsMsg = tsErr instanceof Error ? tsErr.message : "Unknown";
          warnings.push(`AI test scripts failed: ${tsMsg}. Using static test scenarios.`);
          return "";
        }),
    ]), PHASE3_TIMEOUT_MS, "Phase 3 (Quality Review)");

    reviewResult = qrResult;
    testScriptsResult = tsResult;

    if (reviewResult.corrections.length > 0) {
      warnings.push(`Quality Review applied ${reviewResult.corrections.length} corrections for consistency.`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    warnings.push(`Quality review failed: ${msg}. Using specialist outputs directly (still good quality).`);
    onProgress({ phase: "quality-review", status: "running", message: `Quality review had issues, using specialist outputs directly` });
    // Fallback: use specialist outputs directly — this is OK since specialists already have Team Lead brief
    reviewResult = {
      corrections: [`Quality review skipped: ${msg}`],
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

  // Inject AI test scripts (replaces static Section 12)
  if (testScriptsResult) {
    sections["testing"] = { content: testScriptsResult };
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
