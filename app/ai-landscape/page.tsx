"use client";

import { useState, useEffect } from "react";
import { computeRecommendation, type RecommenderFormData, type Recommendation } from "./recommender-logic";

const useCaseOptions = [
  { value: "coding", label: "Coding & Development", icon: "💻" },
  { value: "writing", label: "Creative Writing & Content", icon: "✍️" },
  { value: "config", label: "Configuration & Large Codebases", icon: "⚙️" },
  { value: "reasoning", label: "Reasoning & Analysis", icon: "🧠" },
  { value: "security", label: "Security & Compliance", icon: "🛡️" },
  { value: "general", label: "General Enterprise Tasks", icon: "🏢" },
];

const budgetOptions = [
  { value: "enterprise", label: "Enterprise Budget", icon: "💎" },
  { value: "moderate", label: "Moderate / Cost-Effective", icon: "⚖️" },
  { value: "free", label: "Free / Open-Source", icon: "🆓" },
];

const privacyOptions = [
  { value: "eu_sovereignty", label: "EU Data Sovereignty", icon: "🇪🇺" },
  { value: "on_premise", label: "On-Premise Only", icon: "🏠" },
  { value: "cloud_ok", label: "Cloud APIs Acceptable", icon: "☁️" },
  { value: "no_preference", label: "No Special Requirements", icon: "✅" },
];

const scaleOptions = [
  { value: "individual", label: "Individual / Small Team", icon: "👤" },
  { value: "department", label: "Department-Wide", icon: "👥" },
  { value: "enterprise_wide", label: "Enterprise-Wide Rollout", icon: "🌐" },
];

const sapOptions = [
  { value: "yes_deep", label: "Yes, Deep Integration (Joule, BTP)", icon: "🔗" },
  { value: "yes_light", label: "Yes, Light (Code Gen, Docs)", icon: "📝" },
  { value: "no_sap", label: "No SAP Requirement", icon: "➖" },
];

export default function AILandscapePage() {
  const [recommenderStep, setRecommenderStep] = useState<"form" | "result">("form");
  const [formData, setFormData] = useState<RecommenderFormData>({
    useCase: "",
    budget: "",
    privacy: "",
    scale: "",
    sapIntegration: "",
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedRunnerScore, setAnimatedRunnerScore] = useState(0);

  const isFormComplete = formData.useCase && formData.budget && formData.privacy && formData.scale && formData.sapIntegration;

  const handleRecommend = () => {
    const result = computeRecommendation(formData);
    setRecommendation(result);
    setAnimatedScore(0);
    setAnimatedRunnerScore(0);
    setRecommenderStep("result");
  };

  const handleStartOver = () => {
    setRecommenderStep("form");
    setRecommendation(null);
    setFormData({ useCase: "", budget: "", privacy: "", scale: "", sapIntegration: "" });
    setAnimatedScore(0);
    setAnimatedRunnerScore(0);
  };

  useEffect(() => {
    if (recommendation && recommenderStep === "result") {
      const t1 = setTimeout(() => setAnimatedScore(recommendation.primary.score), 150);
      const t2 = setTimeout(() => setAnimatedRunnerScore(recommendation.runnerUp.score), 300);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [recommendation, recommenderStep]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-blue-400 font-mono text-sm tracking-widest uppercase mb-4">Enterprise AI Intelligence</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent mb-6">
            The AI Landscape 2026
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Models, Capabilities, Regulations &amp; SAP Impact &mdash; Everything your enterprise needs to know
          </p>
          <div className="mt-8 flex justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Last Updated: Feb 2026</span>
            <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">8 Major Providers</span>
            <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">3 Regulatory Frameworks</span>
          </div>
        </div>
      </section>

      {/* AI Models & Companies */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI Models &amp; Companies</h2>
        <p className="text-gray-400 mb-8">The major players shaping the AI frontier</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Company</th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Flagship Model</th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Type</th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Context Window</th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Key Strength</th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">Open Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {[
                { company: "OpenAI", flag: "USA", model: "GPT-5 / o3", type: "Multimodal + Reasoning", ctx: "128K", strength: "Unified routing, agentic workflows, consumer dominance", open: "No" },
                { company: "Anthropic", flag: "USA", model: "Claude Opus 4 / Sonnet 4.5", type: "Multimodal + Extended Thinking", ctx: "1M tokens", strength: "Safety-first, best coding (80.9% SWE-bench), enterprise trust", open: "No" },
                { company: "Google", flag: "USA", model: "Gemini 2.5 Pro", type: "Multimodal (MoE)", ctx: "1M tokens", strength: "Largest context window, multimodal (text/audio/image/video)", open: "Partial" },
                { company: "Meta", flag: "USA", model: "Llama 4 (Maverick/Scout)", type: "Open-Source LLM", ctx: "256K+", strength: "Fully open-source, agentic, enterprise-customizable", open: "Yes" },
                { company: "Mistral", flag: "France", model: "Mistral Large / Codestral", type: "Efficient LLM", ctx: "128K", strength: "European sovereignty, efficient, strong code generation", open: "Partial" },
                { company: "xAI", flag: "USA", model: "Grok 3", type: "Reasoning + Real-time", ctx: "128K", strength: "Real-time data access, strong reasoning, X integration", open: "No" },
                { company: "DeepSeek", flag: "China", model: "DeepSeek-R1", type: "Reasoning LLM", ctx: "128K", strength: "Cost-efficient reasoning, open-weight, competitive performance", open: "Yes" },
                { company: "Alibaba", flag: "China", model: "Qwen 2.5", type: "General Purpose", ctx: "128K", strength: "8M+ downloads, multilingual, open-weight, diverse model sizes", open: "Yes" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-4 font-semibold">
                    <span className="mr-2">{row.flag === "USA" ? "\ud83c\uddfa\ud83c\uddf8" : row.flag === "France" ? "\ud83c\uddeb\ud83c\uddf7" : "\ud83c\udde8\ud83c\uddf3"}</span>
                    {row.company}
                  </td>
                  <td className="py-4 px-4 text-blue-300 font-mono text-sm">{row.model}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{row.type}</td>
                  <td className="py-4 px-4 text-sm text-gray-300">{row.ctx}</td>
                  <td className="py-4 px-4 text-sm text-gray-400">{row.strength}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.open === "Yes" ? "bg-green-500/10 text-green-400" : row.open === "Partial" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>
                      {row.open}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-500">Market share (Enterprise): Anthropic 32% | OpenAI 25% | Google 14% | Others 29% (2025 data)</p>

        {/* Ownership & Investment */}
        <h3 className="text-xl font-bold mt-12 mb-4">Ownership, Investors &amp; Valuation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="py-3 px-4 text-gray-400 font-medium text-sm">Company</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm">Structure</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm">Valuation</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm">Key Investors / Owners</th>
                <th className="py-3 px-4 text-gray-400 font-medium text-sm">Stock / Ticker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {[
                {
                  company: "OpenAI",
                  structure: "Private (transitioning to for-profit)",
                  valuation: "$500B+ (seeking $750-830B)",
                  investors: "Microsoft (~27%), Thrive Capital, Khosla Ventures, Softbank, a16z",
                  stock: "Private — No public ticker. Exposure via MSFT (Microsoft)",
                },
                {
                  company: "Anthropic",
                  structure: "Private (Public Benefit Corp)",
                  valuation: "$61.5B (Mar 2025) → $350B (Nov 2025)",
                  investors: "Amazon ($8B, <33%), Google (14%, $3B+), ICONIQ Capital, Spark Capital, Salesforce",
                  stock: "Private — Exposure via AMZN (Amazon), GOOGL (Alphabet)",
                },
                {
                  company: "Google DeepMind",
                  structure: "Division of Alphabet Inc.",
                  valuation: "Part of Alphabet ($2.3T market cap)",
                  investors: "100% owned by Alphabet (public)",
                  stock: "GOOGL / GOOG (Nasdaq)",
                },
                {
                  company: "Meta AI",
                  structure: "Division of Meta Platforms",
                  valuation: "Part of Meta ($1.8T market cap)",
                  investors: "100% owned by Meta (public). Mark Zuckerberg ~13% ownership",
                  stock: "META (Nasdaq)",
                },
                {
                  company: "Mistral AI",
                  structure: "Private (French)",
                  valuation: "$14B (2025, doubled from $6B)",
                  investors: "ASML (\u20ac2B), a16z, Lightspeed, General Catalyst, Nvidia, Microsoft",
                  stock: "Private — EU sovereign AI play",
                },
                {
                  company: "xAI",
                  structure: "Private",
                  valuation: "$230B+ (Dec 2025)",
                  investors: "Elon Musk (founder), a16z, Sequoia, Valor Equity, Nvidia, Lightspeed. Total raised: $42.7B",
                  stock: "Private — Exposure via TSLA (Tesla, Musk-related)",
                },
                {
                  company: "DeepSeek",
                  structure: "Private (Chinese)",
                  valuation: "Undisclosed",
                  investors: "Backed by High-Flyer (Huanfang Quantitative) — Chinese quant hedge fund",
                  stock: "Private — No public exposure",
                },
                {
                  company: "Alibaba (Qwen)",
                  structure: "Division of Alibaba Group",
                  valuation: "Part of Alibaba ($320B market cap)",
                  investors: "100% owned by Alibaba (public). Softbank major shareholder",
                  stock: "BABA (NYSE) / 9988 (HKEX)",
                },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-sm">{row.company}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">{row.structure}</td>
                  <td className="py-3 px-4 text-sm text-green-400 font-mono">{row.valuation}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">{row.investors}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.stock.startsWith("Private") ? "bg-gray-500/10 text-gray-400" : "bg-green-500/10 text-green-400"}`}>
                      {row.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
          <p className="text-sm text-gray-300">
            <span className="text-yellow-400 font-semibold">Investment Note:</span> Global AI investment reached <strong>$202.3 billion in 2025</strong> &mdash; representing 50% of all venture capital deployed worldwide. For public market exposure to private AI companies: <strong>MSFT</strong> (OpenAI), <strong>AMZN</strong> (Anthropic), <strong>GOOGL</strong> (Anthropic + DeepMind), <strong>META</strong> (Llama).
          </p>
        </div>
      </section>

      {/* Which AI For What? */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">Which AI For What?</h2>
        <p className="text-gray-400 mb-8">Best model for each enterprise task based on 2026 benchmarks</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              task: "Coding & Development",
              icon: "\ud83d\udcbb",
              best: "Claude Opus 4",
              score: "80.9% SWE-bench",
              runners: "GPT-5 (~70%), Gemini 2.5 (~65%)",
              why: "Best at understanding full codebases, debugging complex logic, and producing working fixes across entire repositories. Extended thinking enables step-by-step reasoning.",
              color: "blue",
            },
            {
              task: "Creative Writing & Content",
              icon: "\u270d\ufe0f",
              best: "GPT-5",
              score: "Top in creativity",
              runners: "Claude 4.5 (professional), Gemini (multilingual)",
              why: "Excels at generating human-like text with specific tone and intention. Best for marketing copy, blog posts, and creative content generation.",
              color: "purple",
            },
            {
              task: "Configuration & Large Codebases",
              icon: "\u2699\ufe0f",
              best: "Gemini 2.5 Pro",
              score: "1M token context",
              runners: "Claude 4.5 (1M), GPT-5 (128K)",
              why: "Largest context window allows loading entire project directories. Ideal for SAP configuration analysis, system architecture review, and cross-module impact assessment.",
              color: "green",
            },
            {
              task: "Reasoning & Analysis",
              icon: "\ud83e\udde0",
              best: "Claude Opus 4 / o3",
              score: "Top reasoning benchmarks",
              runners: "Grok 3, DeepSeek-R1",
              why: "Extended thinking and chain-of-thought reasoning for complex problem-solving. Ideal for architecture decisions, risk analysis, and technical specification.",
              color: "orange",
            },
            {
              task: "Enterprise Security & Compliance",
              icon: "\ud83d\udee1\ufe0f",
              best: "Claude (Anthropic)",
              score: "Safety-first architecture",
              runners: "GPT-5, Mistral (EU sovereignty)",
              why: "Constitutional AI approach, least prone to hallucination, enterprise-grade safety. Mistral is the choice for European data sovereignty requirements.",
              color: "red",
            },
            {
              task: "Cost-Efficient / On-Premise",
              icon: "\ud83d\udcb0",
              best: "Llama 4 / DeepSeek-R1",
              score: "Free & open-source",
              runners: "Qwen 2.5, Mistral",
              why: "Open-source models that can run on your own infrastructure. Zero API costs, full data control, customizable for industry-specific needs.",
              color: "teal",
            },
          ].map((card, i) => {
            const colorMap: Record<string, string> = {
              blue: "border-blue-500/30 bg-blue-500/5",
              purple: "border-purple-500/30 bg-purple-500/5",
              green: "border-green-500/30 bg-green-500/5",
              orange: "border-orange-500/30 bg-orange-500/5",
              red: "border-red-500/30 bg-red-500/5",
              teal: "border-teal-500/30 bg-teal-500/5",
            };
            const badgeMap: Record<string, string> = {
              blue: "bg-blue-500/10 text-blue-400",
              purple: "bg-purple-500/10 text-purple-400",
              green: "bg-green-500/10 text-green-400",
              orange: "bg-orange-500/10 text-orange-400",
              red: "bg-red-500/10 text-red-400",
              teal: "bg-teal-500/10 text-teal-400",
            };
            return (
              <div key={i} className={`rounded-xl border p-6 ${colorMap[card.color]}`}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="text-lg font-bold mb-1">{card.task}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeMap[card.color]}`}>BEST: {card.best}</span>
                  <span className="text-xs text-gray-500">{card.score}</span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{card.why}</p>
                <p className="text-xs text-gray-500">Runners-up: {card.runners}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
          <p className="text-sm text-gray-300">
            <span className="text-yellow-400 font-semibold">Pro Tip:</span> The most productive enterprise teams in 2026 aren&apos;t choosing one model &mdash; they&apos;re using the <strong>right model for each task</strong>. Multi-model strategies are now the standard for AI-mature organizations.
          </p>
        </div>
      </section>

      {/* ─── AI Model Recommender ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative text-center mb-12">
            <p className="text-blue-400 font-mono text-sm tracking-widest uppercase mb-4">Interactive Tool</p>
            <h2 className="text-3xl font-bold mb-2">Find Your Ideal AI Model</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Answer five quick questions and we&apos;ll recommend the best AI model for your needs — with reasons.
            </p>
          </div>

          {recommenderStep === "form" ? (
            <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-2xl border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
              {/* Q1 — Use Case */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">1</span>
                  <h3 className="text-lg font-semibold">What will AI primarily help you with?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {useCaseOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, useCase: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.useCase === o.value ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10" : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"}`}>
                      <span className="mr-2">{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 — Budget */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">2</span>
                  <h3 className="text-lg font-semibold">What is your budget model?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {budgetOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, budget: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.budget === o.value ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10" : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"}`}>
                      <span className="mr-2">{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 — Privacy */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">3</span>
                  <h3 className="text-lg font-semibold">What are your data privacy requirements?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {privacyOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, privacy: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.privacy === o.value ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10" : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"}`}>
                      <span className="mr-2">{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4 — Scale */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">4</span>
                  <h3 className="text-lg font-semibold">How will you deploy AI?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {scaleOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, scale: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.scale === o.value ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10" : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"}`}>
                      <span className="mr-2">{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5 — SAP */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">5</span>
                  <h3 className="text-lg font-semibold">Do you need SAP integration?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sapOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, sapIntegration: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.sapIntegration === o.value ? "border-blue-500 bg-blue-500/10 text-blue-300 shadow-lg shadow-blue-500/10" : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600 hover:text-gray-300"}`}>
                      <span className="mr-2">{o.icon}</span>{o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleRecommend} disabled={!isFormComplete}
                className={`mt-4 w-full py-4 rounded-xl font-semibold text-lg transition-all ${isFormComplete ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 cursor-pointer" : "bg-gray-800 text-gray-600 cursor-not-allowed"}`}>
                🚀 Get My Recommendation
              </button>
            </div>
          ) : recommendation ? (
            <div className="max-w-4xl mx-auto">
              {/* Primary Recommendation */}
              <div className="p-6 md:p-8 rounded-2xl border border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="relative">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono uppercase tracking-wider border border-blue-500/20">
                    ⭐ Best Match
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-4 mb-1">{recommendation.primary.model}</h3>
                  <p className="text-gray-400 text-sm mb-1">by {recommendation.primary.company}</p>
                  <p className="text-gray-500 text-sm mb-6">{recommendation.primary.tagline}</p>

                  {/* Score Bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Match Score</span>
                    <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${animatedScore}%` }} />
                    </div>
                    <span className="text-blue-400 font-mono font-bold text-lg">{animatedScore}%</span>
                  </div>

                  {/* Reasons */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">Why this model</p>
                    {recommendation.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center text-xs flex-shrink-0">✓</span>
                        <p className="text-sm text-gray-300">{reason}</p>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {recommendation.warnings.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                      <p className="text-sm text-yellow-400 font-semibold mb-2">⚠️ Things to consider</p>
                      {recommendation.warnings.map((w, i) => (
                        <p key={i} className="text-sm text-gray-400 mb-1">{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Runner-up */}
              <div className="mt-4 p-5 md:p-6 rounded-xl border border-gray-700/50 bg-gray-800/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Runner-up</span>
                    <h4 className="text-lg font-bold mt-1">{recommendation.runnerUp.model}</h4>
                    <p className="text-sm text-gray-400">by {recommendation.runnerUp.company} — {recommendation.runnerUp.tagline}</p>
                  </div>
                  <div className="flex items-center gap-3 md:min-w-[200px]">
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${animatedRunnerScore}%` }} />
                    </div>
                    <span className="text-gray-400 font-mono font-bold">{animatedRunnerScore}%</span>
                  </div>
                </div>
              </div>

              {/* Start Over */}
              <div className="mt-6 text-center">
                <button onClick={handleStartOver}
                  className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors">
                  ← Start over with different answers
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* AI Regulations */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI Regulations &amp; Compliance</h2>
        <p className="text-gray-400 mb-8">What enterprises must know before deploying AI</p>

        {/* EU AI Act */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>\ud83c\uddea\ud83c\uddfa</span> EU AI Act &mdash; The Global Standard
          </h3>

          {/* Timeline */}
          <div className="relative mb-8">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-yellow-500 to-red-500" />
            {[
              { date: "Aug 1, 2024", event: "AI Act entered into force", status: "done" },
              { date: "Feb 2, 2025", event: "Prohibited AI practices banned + AI literacy obligations", status: "done" },
              { date: "Aug 2, 2025", event: "GPAI model obligations + governance rules apply", status: "done" },
              { date: "Aug 2, 2026", event: "HIGH-RISK AI systems — full compliance required", status: "upcoming" },
              { date: "Aug 2, 2027", event: "High-risk AI in regulated products (extended period)", status: "future" },
            ].map((item, i) => (
              <div key={i} className="relative pl-12 pb-6">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${item.status === "done" ? "bg-green-500 border-green-400" : item.status === "upcoming" ? "bg-yellow-500 border-yellow-400 animate-pulse" : "bg-gray-600 border-gray-500"}`} />
                <p className="text-sm font-mono text-gray-500">{item.date}</p>
                <p className={`text-sm ${item.status === "upcoming" ? "text-yellow-300 font-semibold" : "text-gray-300"}`}>
                  {item.event}
                  {item.status === "upcoming" && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400">CRITICAL DEADLINE</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Risk Tiers */}
          <h4 className="text-lg font-semibold mb-4">4 Risk Tiers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                tier: "Unacceptable",
                color: "red",
                status: "BANNED",
                examples: "Social scoring, manipulative AI, real-time biometric surveillance, exploiting vulnerabilities",
                action: "Prohibited since Feb 2025",
              },
              {
                tier: "High Risk",
                color: "orange",
                status: "HEAVILY REGULATED",
                examples: "AI in employment, credit decisions, education, law enforcement, critical infrastructure",
                action: "Full compliance by Aug 2026: risk management, data governance, human oversight, documentation",
              },
              {
                tier: "Limited Risk",
                color: "yellow",
                status: "TRANSPARENCY REQUIRED",
                examples: "Chatbots, deepfakes, emotion recognition, AI-generated content",
                action: "Must inform users they're interacting with AI, label deepfakes",
              },
              {
                tier: "Minimal Risk",
                color: "green",
                status: "NO RESTRICTIONS",
                examples: "Spam filters, AI-powered games, inventory management, recommendation systems",
                action: "No specific obligations, voluntary codes of conduct encouraged",
              },
            ].map((tier, i) => {
              const borderMap: Record<string, string> = {
                red: "border-red-500/40 bg-red-500/5",
                orange: "border-orange-500/40 bg-orange-500/5",
                yellow: "border-yellow-500/40 bg-yellow-500/5",
                green: "border-green-500/40 bg-green-500/5",
              };
              const badgeColorMap: Record<string, string> = {
                red: "bg-red-500/20 text-red-400",
                orange: "bg-orange-500/20 text-orange-400",
                yellow: "bg-yellow-500/20 text-yellow-400",
                green: "bg-green-500/20 text-green-400",
              };
              return (
                <div key={i} className={`rounded-xl border p-5 ${borderMap[tier.color]}`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeColorMap[tier.color]}`}>{tier.status}</span>
                  <h5 className="text-lg font-bold mt-2 mb-2">{tier.tier} Risk</h5>
                  <p className="text-xs text-gray-400 mb-3">{tier.examples}</p>
                  <p className="text-xs text-gray-500 italic">{tier.action}</p>
                </div>
              );
            })}
          </div>

          {/* Penalties */}
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 mb-8">
            <h4 className="text-lg font-semibold text-red-400 mb-2">Penalties for Non-Compliance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold text-red-400">&euro;35M / 7%</p>
                <p className="text-gray-400">Prohibited AI practices</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400">&euro;15M / 3%</p>
                <p className="text-gray-400">Other AI Act infringements</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">&euro;7.5M / 1%</p>
                <p className="text-gray-400">Incorrect/misleading information</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Fines are based on global annual turnover, whichever is higher</p>
          </div>
        </div>

        {/* US Regulations */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>\ud83c\uddfa\ud83c\uddf8</span> United States &mdash; Federal vs State
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/20 p-5">
              <h4 className="font-bold mb-2">Federal Executive Order (Dec 2025)</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>&bull; Trump signed EO to establish uniform federal AI policy</li>
                <li>&bull; AI Litigation Task Force to challenge burdensome state laws</li>
                <li>&bull; Commerce Dept evaluation of state AI laws by Mar 2026</li>
                <li>&bull; Goal: Prevent fragmented state-by-state regulation</li>
                <li>&bull; Pro-innovation stance: minimize regulatory burden</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/20 p-5">
              <h4 className="font-bold mb-2">Key State Laws</h4>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>&bull; <strong>Colorado AI Act</strong> (Jun 30, 2026) &mdash; First comprehensive US AI law targeting high-risk systems</li>
                <li>&bull; <strong>California TFAIA</strong> (Jan 1, 2026) &mdash; Transparency requirements for frontier AI</li>
                <li>&bull; <strong>California SB 942</strong> (Aug 2, 2026) &mdash; AI content detection tools &amp; watermarking</li>
                <li>&bull; States pushing forward despite federal pushback</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>\ud83c\udf0d</span> Global Regulatory Landscape
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { region: "European Union", approach: "Risk-based regulation", status: "EU AI Act (active)", stance: "Strictest" },
              { region: "United States", approach: "Federal vs State tension", status: "Executive Orders + State laws", stance: "Pro-innovation" },
              { region: "United Kingdom", approach: "Sector-specific", status: "AI Safety Institute", stance: "Balanced" },
              { region: "China", approach: "Government-controlled", status: "Deep synthesis + algorithm rules", stance: "Strategic control" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-700/50 bg-gray-800/20 p-4">
                <h5 className="font-bold text-sm mb-1">{item.region}</h5>
                <p className="text-xs text-gray-400">{item.approach}</p>
                <p className="text-xs text-blue-400 mt-1">{item.status}</p>
                <p className="text-xs text-gray-500 mt-1">Stance: {item.stance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Checklist */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/20">
          <h4 className="text-lg font-bold mb-4">Enterprise Compliance Checklist (by Aug 2026)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              "Inventory all AI systems and classify by risk level",
              "Conduct conformity assessments for high-risk systems",
              "Implement risk management and data governance",
              "Ensure human oversight in AI decision-making",
              "Prepare technical documentation for regulators",
              "Train employees on AI literacy (mandatory since Feb 2025)",
              "Register high-risk AI systems in EU database",
              "Establish audit trails and logging mechanisms",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">\u25a1</span>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI in SAP World */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI in the SAP World</h2>
        <p className="text-gray-400 mb-8">How SAP is embedding AI across the enterprise</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { number: "400+", label: "Business AI Use Cases" },
            { number: "40", label: "Joule Agents" },
            { number: "2,100+", label: "Joule Skills" },
            { number: "70%", label: "Time Savings (Cash Mgmt)" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <p className="text-3xl font-bold text-blue-400">{stat.number}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "SAP Joule",
              desc: "Conversational AI copilot embedded across SAP applications. Helps with purchase requisitions, data analysis, and natural-language queries on business data.",
              tag: "Copilot",
            },
            {
              title: "Joule Agents",
              desc: "Autonomous AI agents for specific business tasks: Cash Management Agent, Bid Analysis Agent, Production Planning Agent, International Trade Classification Agent.",
              tag: "Autonomous",
            },
            {
              title: "Joule Studio (GA Q1 2026)",
              desc: "Build custom Joule agents and skills using SAP's built-in business knowledge. Enterprises can create domain-specific AI agents tailored to their processes.",
              tag: "Build Your Own",
            },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border border-gray-700/50 bg-gray-800/20 p-6">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">{card.tag}</span>
              <h4 className="text-lg font-bold mt-3 mb-2">{card.title}</h4>
              <p className="text-sm text-gray-400">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/5 to-green-500/5 border border-blue-500/20">
          <h4 className="text-lg font-bold mb-4">Key SAP AI Use Cases by Function</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {[
              { func: "Finance", cases: "Accruals automation, cash flow forecasting, reconciliation (70% time savings), invoice matching" },
              { func: "Procurement", cases: "Bid analysis agent, purchase requisition via Joule, supplier risk scoring, contract analysis" },
              { func: "Supply Chain", cases: "Demand sensing, production planning agent, inventory optimization, logistics scheduling" },
              { func: "HR", cases: "Candidate matching, employee onboarding automation, skills gap analysis, workforce planning" },
              { func: "Sales", cases: "Lead scoring, opportunity insights, quote generation, customer sentiment analysis" },
              { func: "Development", cases: "ABAP code generation with Joule, test script creation, code review, documentation generation" },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-800/30">
                <span className="font-semibold text-blue-300">{item.func}:</span>
                <span className="text-gray-400 ml-2">{item.cases}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-4">
          Sources: MIT Technology Review, Pluralsight, SAP News Center, EU Digital Strategy, LM Council Benchmarks,
          SAP Community, LegalNodes, SecurePrivacy, King &amp; Spalding, Baker Botts, Faros AI, PlayCode, Cosmic
        </p>
        <p className="text-xs text-gray-600">
          Prepared for internal enterprise reference. Last updated February 2026. Data sourced from public benchmarks and official documentation.
        </p>
      </footer>
    </div>
  );
}
