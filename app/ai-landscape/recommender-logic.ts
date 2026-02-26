// ─────────────────────────────────────────────
// AI Model Recommender — Scoring Engine
// Pure client-side weighted scoring algorithm
// ─────────────────────────────────────────────

export interface RecommenderFormData {
  useCase: string;
  budget: string;
  privacy: string;
  scale: string;
  sapIntegration: string;
}

export interface ModelRecommendation {
  key: string;
  company: string;
  model: string;
  score: number;
  tagline: string;
  color: string;
}

export interface Recommendation {
  primary: ModelRecommendation;
  runnerUp: ModelRecommendation;
  reasons: string[];
  warnings: string[];
}

// ─── Model Candidate Pool ───────────────────

interface ModelCandidate {
  key: string;
  company: string;
  model: string;
  tagline: string;
  color: string;
}

const MODELS: ModelCandidate[] = [
  {
    key: "openai",
    company: "OpenAI",
    model: "GPT-5 / o3",
    tagline: "Consumer dominance, unified routing, strongest brand recognition",
    color: "green",
  },
  {
    key: "anthropic",
    company: "Anthropic",
    model: "Claude Opus 4 / Sonnet 4.5",
    tagline: "Safety-first, best coding (80.9% SWE-bench), 1M token context",
    color: "blue",
  },
  {
    key: "google",
    company: "Google DeepMind",
    model: "Gemini 2.5 Pro",
    tagline: "Largest context window, true multimodal, enterprise-scale infrastructure",
    color: "cyan",
  },
  {
    key: "meta",
    company: "Meta",
    model: "Llama 4 (Maverick / Scout)",
    tagline: "Fully open-source, self-hostable, zero API costs",
    color: "indigo",
  },
  {
    key: "mistral",
    company: "Mistral AI",
    model: "Mistral Large / Codestral",
    tagline: "European sovereignty, efficient, strong code generation",
    color: "purple",
  },
  {
    key: "xai",
    company: "xAI",
    model: "Grok 3",
    tagline: "Real-time data access, strong reasoning, X platform integration",
    color: "red",
  },
  {
    key: "deepseek",
    company: "DeepSeek",
    model: "DeepSeek-R1",
    tagline: "Cost-efficient reasoning, open-weight, competitive benchmarks",
    color: "orange",
  },
  {
    key: "alibaba",
    company: "Alibaba Cloud",
    model: "Qwen 2.5",
    tagline: "8M+ downloads, multilingual, open-weight, diverse model sizes",
    color: "yellow",
  },
];

// ─── Scoring Matrices ───────────────────────

type ScoreMap = Record<string, number>;

// Use Case scoring (weight: 10)
const USE_CASE_SCORES: Record<string, ScoreMap> = {
  coding: { anthropic: 10, openai: 7, google: 6, mistral: 5, deepseek: 4, meta: 3, xai: 2, alibaba: 2 },
  writing: { openai: 10, anthropic: 7, google: 6, alibaba: 4, mistral: 3, xai: 3, meta: 2, deepseek: 2 },
  config: { google: 10, anthropic: 8, openai: 6, mistral: 4, meta: 3, deepseek: 3, xai: 2, alibaba: 2 },
  reasoning: { anthropic: 10, xai: 8, deepseek: 7, openai: 6, google: 5, mistral: 3, meta: 2, alibaba: 2 },
  security: { anthropic: 10, mistral: 8, openai: 6, google: 5, meta: 4, deepseek: 2, xai: 2, alibaba: 2 },
  general: { openai: 10, anthropic: 8, google: 7, mistral: 5, xai: 4, meta: 3, deepseek: 3, alibaba: 3 },
};

// Budget scoring (weight: 8)
const BUDGET_SCORES: Record<string, ScoreMap> = {
  enterprise: { openai: 8, anthropic: 8, google: 8, xai: 5, mistral: 5, meta: 3, deepseek: 3, alibaba: 3 },
  moderate: { mistral: 8, google: 7, deepseek: 6, xai: 5, alibaba: 5, anthropic: 4, openai: 3, meta: 5 },
  free: { meta: 8, deepseek: 8, alibaba: 8, mistral: 6, google: 2, openai: -2, anthropic: -2, xai: 1 },
};

// Privacy scoring (weight: 7)
const PRIVACY_SCORES: Record<string, ScoreMap> = {
  eu_sovereignty: { mistral: 7, meta: 4, anthropic: 3, openai: 2, google: 2, deepseek: -4, alibaba: -4, xai: 1 },
  on_premise: { meta: 7, deepseek: 7, alibaba: 6, mistral: 6, openai: -4, anthropic: -2, google: -3, xai: -4 },
  cloud_ok: { openai: 4, anthropic: 4, google: 4, xai: 3, mistral: 3, meta: 2, deepseek: 2, alibaba: 2 },
  no_preference: { openai: 1, anthropic: 1, google: 1, meta: 1, mistral: 1, xai: 1, deepseek: 1, alibaba: 1 },
};

// Scale scoring (weight: 4)
const SCALE_SCORES: Record<string, ScoreMap> = {
  individual: { meta: 4, deepseek: 4, alibaba: 3, mistral: 3, openai: 2, anthropic: 2, google: 2, xai: 2 },
  department: { anthropic: 4, openai: 4, google: 3, mistral: 3, xai: 2, meta: 2, deepseek: 2, alibaba: 2 },
  enterprise_wide: { anthropic: 4, openai: 4, google: 4, mistral: 3, xai: 2, meta: 2, deepseek: 1, alibaba: 1 },
};

// SAP Integration scoring (weight: 6)
const SAP_SCORES: Record<string, ScoreMap> = {
  yes_deep: { anthropic: 6, openai: 5, google: 4, mistral: 2, xai: 1, meta: 1, deepseek: 1, alibaba: 1 },
  yes_light: { anthropic: 5, openai: 4, google: 3, mistral: 3, deepseek: 2, meta: 2, xai: 1, alibaba: 1 },
  no_sap: { openai: 1, anthropic: 1, google: 1, meta: 1, mistral: 1, xai: 1, deepseek: 1, alibaba: 1 },
};

// ─── Reason Templates ───────────────────────

const REASON_MAP: Record<string, Record<string, string>> = {
  openai: {
    coding: "GPT-5 excels at code generation with strong multi-language support and agentic workflows",
    writing: "Industry-leading creative writing and content generation with nuanced tone control",
    config: "Strong at understanding large configuration files and system architectures",
    reasoning: "o3 reasoning model delivers step-by-step analytical thinking for complex problems",
    security: "Enterprise-grade API with SOC 2 compliance and data processing agreements",
    general: "Strongest brand recognition and widest ecosystem of integrations and plugins",
    enterprise: "Mature enterprise offering with dedicated support, custom models, and SLAs",
    moderate: "Pay-per-token pricing allows flexible cost management",
    cloud_ok: "Robust cloud API with 99.9% uptime SLA and global infrastructure",
    department: "Team plans and organization-level controls for department rollouts",
    enterprise_wide: "Enterprise API agreements with volume discounts and dedicated capacity",
    yes_deep: "Strong SAP integration capabilities through structured output and function calling",
    yes_light: "Excellent for generating SAP documentation, ABAP code snippets, and configuration guides",
  },
  anthropic: {
    coding: "Best-in-class coding at 80.9% SWE-bench — understands full codebases with 1M token context",
    writing: "Professional, accurate writing with lowest hallucination rates in the industry",
    config: "1M token context window can process entire SAP configuration landscapes at once",
    reasoning: "Extended thinking mode enables deep, step-by-step reasoning for complex analysis",
    security: "Constitutional AI architecture — designed from the ground up for safety and compliance",
    general: "Balanced performance across all tasks with enterprise-grade reliability",
    enterprise: "Enterprise plans with data retention controls, SOC 2, and HIPAA eligibility",
    cloud_ok: "Enterprise cloud API with strong data privacy commitments and no training on your data",
    department: "Team workspace features with usage analytics and access controls",
    enterprise_wide: "Enterprise deployment with custom safety policies and dedicated support",
    yes_deep: "Powers SAP FSD generation, ABAP analysis, and deep configuration understanding",
    yes_light: "Excellent at SAP technical documentation, code generation, and process analysis",
  },
  google: {
    coding: "Gemini 2.5 Pro handles large codebases with true multimodal understanding",
    writing: "Strong multilingual content generation across 100+ languages",
    config: "1M token context — can ingest and analyze massive configuration files simultaneously",
    reasoning: "Mixture-of-Experts architecture efficiently handles complex reasoning tasks",
    security: "Google Cloud security infrastructure with enterprise compliance certifications",
    general: "True multimodal capabilities — text, code, images, audio, and video in one model",
    enterprise: "Backed by Google Cloud infrastructure with enterprise support and SLAs",
    moderate: "Competitive pricing with generous free tier and efficient token usage",
    cloud_ok: "Google Cloud Platform provides enterprise-grade security and global availability",
    enterprise_wide: "Seamless integration with Google Workspace and existing enterprise tools",
    yes_deep: "Integration with Google Cloud services for SAP workloads (SAP on GCP)",
  },
  meta: {
    coding: "Llama 4 supports self-hosted code generation with full customization",
    writing: "Open-source models can be fine-tuned for specific writing styles and domains",
    config: "Scout model offers 256K+ context for large configuration analysis",
    general: "Fully open-source — complete transparency and community-driven improvements",
    free: "Zero API costs — download and run locally or on your own cloud infrastructure",
    on_premise: "Full on-premise deployment — your data never leaves your infrastructure",
    individual: "Easy to set up locally for individual developers and researchers",
    no_sap: "Flexible open-source model adaptable to any domain through fine-tuning",
  },
  mistral: {
    coding: "Codestral delivers strong code generation optimized for European enterprise needs",
    security: "European company — full EU data sovereignty and GDPR compliance by design",
    general: "Efficient models that deliver strong performance with lower computational costs",
    eu_sovereignty: "Headquartered in France — built for European data sovereignty requirements",
    moderate: "Cost-efficient inference with competitive pricing across model sizes",
    on_premise: "Models available for on-premise deployment with commercial licenses",
    department: "Flexible deployment options suitable for department-level adoption",
  },
  xai: {
    reasoning: "Grok 3 demonstrates strong reasoning capabilities across complex benchmarks",
    general: "Real-time access to current information through X platform integration",
    enterprise: "Growing enterprise offering with API access and dedicated support",
  },
  deepseek: {
    reasoning: "DeepSeek-R1 achieves competitive reasoning scores at a fraction of the cost",
    general: "Open-weight model with impressive benchmarks for its parameter count",
    free: "Open-weight and free to use — excellent cost-to-performance ratio",
    on_premise: "Self-hostable with full model weights available for download",
    individual: "Lightweight deployment options ideal for individual researchers and developers",
  },
  alibaba: {
    writing: "Qwen 2.5 excels at multilingual content with strong Asian language support",
    general: "8M+ downloads — proven reliability and active open-source community",
    free: "Open-weight model family with diverse sizes from 0.5B to 72B parameters",
    on_premise: "Multiple model sizes allow deployment on various hardware configurations",
    individual: "Smaller model variants run efficiently on consumer hardware",
  },
};

// ─── Warning Templates ──────────────────────

function generateWarnings(primary: string, formData: RecommenderFormData): string[] {
  const warnings: string[] = [];

  const closedSource = ["openai", "anthropic", "xai"];
  if (closedSource.includes(primary) && formData.privacy === "on_premise") {
    warnings.push("This model is cloud-only — on-premise deployment is not available. Consider open-source alternatives for full data control.");
  }

  if (primary === "deepseek" && formData.privacy === "eu_sovereignty") {
    warnings.push("DeepSeek is a Chinese company — may not meet strict EU data sovereignty requirements. Consider Mistral for full EU compliance.");
  }

  if (primary === "alibaba" && formData.privacy === "eu_sovereignty") {
    warnings.push("Alibaba Cloud is a Chinese company — evaluate whether it aligns with your EU data sovereignty policies.");
  }

  if ((primary === "meta" || primary === "deepseek" || primary === "alibaba") && formData.sapIntegration === "yes_deep") {
    warnings.push("Open-source models require more custom integration work for deep SAP connectivity. Consider pairing with SAP BTP for seamless integration.");
  }

  if ((primary === "openai" || primary === "anthropic") && formData.budget === "free") {
    warnings.push("This model requires paid API access. For zero-cost options, Llama 4 or DeepSeek-R1 offer competitive open-source alternatives.");
  }

  if (primary === "xai" && formData.scale === "enterprise_wide") {
    warnings.push("xAI's enterprise offering is newer — evaluate SLA maturity and support infrastructure before large-scale rollout.");
  }

  return warnings;
}

// ─── Reason Generator ───────────────────────

function generateReasons(primaryKey: string, formData: RecommenderFormData): string[] {
  const reasons: string[] = [];
  const modelReasons = REASON_MAP[primaryKey] || {};

  // Use case reason (always included, highest priority)
  if (modelReasons[formData.useCase]) {
    reasons.push(modelReasons[formData.useCase]);
  }

  // Budget reason
  if (modelReasons[formData.budget]) {
    reasons.push(modelReasons[formData.budget]);
  }

  // Privacy reason
  if (modelReasons[formData.privacy]) {
    reasons.push(modelReasons[formData.privacy]);
  }

  // Scale reason
  if (modelReasons[formData.scale]) {
    reasons.push(modelReasons[formData.scale]);
  }

  // SAP reason
  if (modelReasons[formData.sapIntegration]) {
    reasons.push(modelReasons[formData.sapIntegration]);
  }

  // Ensure at least 3 reasons — add general if needed
  if (reasons.length < 3 && modelReasons["general"]) {
    reasons.push(modelReasons["general"]);
  }

  // Cap at 5 reasons max
  return reasons.slice(0, 5);
}

// ─── Main Scoring Function ──────────────────

export function computeRecommendation(formData: RecommenderFormData): Recommendation {
  // Initialize scores
  const scores: Record<string, number> = {};
  MODELS.forEach((m) => (scores[m.key] = 0));

  // Apply weighted scores from each dimension
  const useCaseScores = USE_CASE_SCORES[formData.useCase] || {};
  const budgetScores = BUDGET_SCORES[formData.budget] || {};
  const privacyScores = PRIVACY_SCORES[formData.privacy] || {};
  const scaleScores = SCALE_SCORES[formData.scale] || {};
  const sapScores = SAP_SCORES[formData.sapIntegration] || {};

  MODELS.forEach((m) => {
    scores[m.key] += useCaseScores[m.key] || 0;
    scores[m.key] += budgetScores[m.key] || 0;
    scores[m.key] += privacyScores[m.key] || 0;
    scores[m.key] += scaleScores[m.key] || 0;
    scores[m.key] += sapScores[m.key] || 0;
  });

  // Sort by score descending
  const sorted = MODELS.map((m) => ({ ...m, rawScore: scores[m.key] })).sort(
    (a, b) => b.rawScore - a.rawScore
  );

  // Normalize scores to 55-97% range
  const maxRaw = sorted[0].rawScore;
  const minRaw = sorted[sorted.length - 1].rawScore;
  const range = Math.max(maxRaw - minRaw, 1);

  function normalize(raw: number): number {
    return Math.round(55 + ((raw - minRaw) / range) * 42);
  }

  const primary: ModelRecommendation = {
    key: sorted[0].key,
    company: sorted[0].company,
    model: sorted[0].model,
    score: normalize(sorted[0].rawScore),
    tagline: sorted[0].tagline,
    color: sorted[0].color,
  };

  const runnerUp: ModelRecommendation = {
    key: sorted[1].key,
    company: sorted[1].company,
    model: sorted[1].model,
    score: normalize(sorted[1].rawScore),
    tagline: sorted[1].tagline,
    color: sorted[1].color,
  };

  const reasons = generateReasons(primary.key, formData);
  const warnings = generateWarnings(primary.key, formData);

  return { primary, runnerUp, reasons, warnings };
}
