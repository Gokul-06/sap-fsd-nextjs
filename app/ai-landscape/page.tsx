"use client";

import { useState, useEffect } from "react";
import { computeRecommendation, type RecommenderFormData, type Recommendation } from "./recommender-logic";

const useCaseOptions = [
  { value: "coding", label: "Coding & Development" },
  { value: "writing", label: "Creative Writing & Content" },
  { value: "config", label: "Configuration & Large Codebases" },
  { value: "reasoning", label: "Reasoning & Analysis" },
  { value: "security", label: "Security & Compliance" },
  { value: "general", label: "General Enterprise Tasks" },
];

const budgetOptions = [
  { value: "enterprise", label: "Enterprise Budget" },
  { value: "moderate", label: "Moderate / Cost-Effective" },
  { value: "free", label: "Free / Open-Source" },
];

const privacyOptions = [
  { value: "eu_sovereignty", label: "EU Data Sovereignty" },
  { value: "on_premise", label: "On-Premise Only" },
  { value: "cloud_ok", label: "Cloud APIs Acceptable" },
  { value: "no_preference", label: "No Special Requirements" },
];

const scaleOptions = [
  { value: "individual", label: "Individual / Small Team" },
  { value: "department", label: "Department-Wide" },
  { value: "enterprise_wide", label: "Enterprise-Wide Rollout" },
];

const sapOptions = [
  { value: "yes_deep", label: "Yes, Deep Integration (Joule, BTP)" },
  { value: "yes_light", label: "Yes, Light (Code Gen, Docs)" },
  { value: "no_sap", label: "No SAP Requirement" },
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
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <p className="text-blue-600 font-mono text-sm tracking-widest uppercase mb-4">Enterprise AI Intelligence</p>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-6">
            The AI Landscape 2026
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Models, Capabilities, Regulations &amp; SAP Impact &mdash; Everything your enterprise needs to know
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200">Last Updated: Feb 2026</span>
            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">8 Major Providers</span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200">3 Regulatory Frameworks</span>
          </div>
        </div>
      </section>

      {/* AI Models & Companies */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI Models &amp; Companies</h2>
        <p className="text-gray-500 mb-8">The major players shaping the AI frontier</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Company</th>
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Flagship Model</th>
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Type</th>
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Context Window</th>
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Key Strength</th>
                <th className="py-4 px-4 text-gray-500 font-medium text-sm">Open Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
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
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 font-semibold">
                    <span className="text-xs text-gray-400 mr-1.5">{row.flag}</span>
                    {row.company}
                  </td>
                  <td className="py-4 px-4 text-blue-700 font-mono text-sm">{row.model}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.type}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.ctx}</td>
                  <td className="py-4 px-4 text-sm text-gray-500">{row.strength}</td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.open === "Yes" ? "bg-green-50 text-green-700" : row.open === "Partial" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
                      {row.open}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-400">Market share (Enterprise): Anthropic 32% | OpenAI 25% | Google 14% | Others 29% (2025 data)</p>

        {/* Ownership & Investment */}
        <h3 className="text-xl font-bold mt-12 mb-4">Ownership, Investors &amp; Valuation</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-gray-500 font-medium text-sm">Company</th>
                <th className="py-3 px-4 text-gray-500 font-medium text-sm">Structure</th>
                <th className="py-3 px-4 text-gray-500 font-medium text-sm">Valuation</th>
                <th className="py-3 px-4 text-gray-500 font-medium text-sm">Key Investors / Owners</th>
                <th className="py-3 px-4 text-gray-500 font-medium text-sm">Stock / Ticker</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { company: "OpenAI", structure: "Private (transitioning to for-profit)", valuation: "$500B+ (seeking $750-830B)", investors: "Microsoft (~27%), Thrive Capital, Khosla Ventures, Softbank, a16z", stock: "Private — Exposure via MSFT (Microsoft)" },
                { company: "Anthropic", structure: "Private (Public Benefit Corp)", valuation: "$61.5B (Mar 2025) → $350B (Nov 2025)", investors: "Amazon ($8B, <33%), Google (14%, $3B+), ICONIQ Capital, Spark Capital, Salesforce", stock: "Private — Exposure via AMZN (Amazon), GOOGL (Alphabet)" },
                { company: "Google DeepMind", structure: "Division of Alphabet Inc.", valuation: "Part of Alphabet ($2.3T market cap)", investors: "100% owned by Alphabet (public)", stock: "GOOGL / GOOG (Nasdaq)" },
                { company: "Meta AI", structure: "Division of Meta Platforms", valuation: "Part of Meta ($1.8T market cap)", investors: "100% owned by Meta (public). Mark Zuckerberg ~13% ownership", stock: "META (Nasdaq)" },
                { company: "Mistral AI", structure: "Private (French)", valuation: "$14B (2025, doubled from $6B)", investors: "ASML (\u20ac2B), a16z, Lightspeed, General Catalyst, Nvidia, Microsoft", stock: "Private — EU sovereign AI play" },
                { company: "xAI", structure: "Private", valuation: "$230B+ (Dec 2025)", investors: "Elon Musk (founder), a16z, Sequoia, Valor Equity, Nvidia, Lightspeed. Total raised: $42.7B", stock: "Private — Exposure via TSLA (Tesla, Musk-related)" },
                { company: "DeepSeek", structure: "Private (Chinese)", valuation: "Undisclosed", investors: "Backed by High-Flyer (Huanfang Quantitative) — Chinese quant hedge fund", stock: "Private — No public exposure" },
                { company: "Alibaba (Qwen)", structure: "Division of Alibaba Group", valuation: "Part of Alibaba ($320B market cap)", investors: "100% owned by Alibaba (public). Softbank major shareholder", stock: "BABA (NYSE) / 9988 (HKEX)" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-sm">{row.company}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.structure}</td>
                  <td className="py-3 px-4 text-sm text-green-700 font-mono">{row.valuation}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{row.investors}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${row.stock.startsWith("Private") ? "bg-gray-100 text-gray-500" : "bg-green-50 text-green-700"}`}>
                      {row.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <p className="text-sm text-gray-600">
            <span className="text-blue-700 font-semibold">Investment Note:</span> Global AI investment reached <strong>$202.3 billion in 2025</strong> &mdash; representing 50% of all venture capital deployed worldwide. For public market exposure to private AI companies: <strong>MSFT</strong> (OpenAI), <strong>AMZN</strong> (Anthropic), <strong>GOOGL</strong> (Anthropic + DeepMind), <strong>META</strong> (Llama).
          </p>
        </div>
      </section>

      {/* Which AI For What? */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">Which AI For What?</h2>
        <p className="text-gray-500 mb-8">Best model for each enterprise task based on 2026 benchmarks</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { task: "Coding & Development", best: "Claude Opus 4", score: "80.9% SWE-bench", runners: "GPT-5 (~70%), Gemini 2.5 (~65%)", why: "Best at understanding full codebases, debugging complex logic, and producing working fixes across entire repositories. Extended thinking enables step-by-step reasoning.", color: "blue" },
            { task: "Creative Writing & Content", best: "GPT-5", score: "Top in creativity", runners: "Claude 4.5 (professional), Gemini (multilingual)", why: "Excels at generating human-like text with specific tone and intention. Best for marketing copy, blog posts, and creative content generation.", color: "purple" },
            { task: "Configuration & Large Codebases", best: "Gemini 2.5 Pro", score: "1M token context", runners: "Claude 4.5 (1M), GPT-5 (128K)", why: "Largest context window allows loading entire project directories. Ideal for SAP configuration analysis, system architecture review, and cross-module impact assessment.", color: "green" },
            { task: "Reasoning & Analysis", best: "Claude Opus 4 / o3", score: "Top reasoning benchmarks", runners: "Grok 3, DeepSeek-R1", why: "Extended thinking and chain-of-thought reasoning for complex problem-solving. Ideal for architecture decisions, risk analysis, and technical specification.", color: "orange" },
            { task: "Enterprise Security & Compliance", best: "Claude (Anthropic)", score: "Safety-first architecture", runners: "GPT-5, Mistral (EU sovereignty)", why: "Constitutional AI approach, least prone to hallucination, enterprise-grade safety. Mistral is the choice for European data sovereignty requirements.", color: "red" },
            { task: "Cost-Efficient / On-Premise", best: "Llama 4 / DeepSeek-R1", score: "Free & open-source", runners: "Qwen 2.5, Mistral", why: "Open-source models that can run on your own infrastructure. Zero API costs, full data control, customizable for industry-specific needs.", color: "teal" },
          ].map((card, i) => {
            const colorMap: Record<string, string> = {
              blue: "border-blue-200 bg-blue-50/50",
              purple: "border-purple-200 bg-purple-50/50",
              green: "border-green-200 bg-green-50/50",
              orange: "border-orange-200 bg-orange-50/50",
              red: "border-red-200 bg-red-50/50",
              teal: "border-teal-200 bg-teal-50/50",
            };
            const badgeMap: Record<string, string> = {
              blue: "bg-blue-100 text-blue-700",
              purple: "bg-purple-100 text-purple-700",
              green: "bg-green-100 text-green-700",
              orange: "bg-orange-100 text-orange-700",
              red: "bg-red-100 text-red-700",
              teal: "bg-teal-100 text-teal-700",
            };
            return (
              <div key={i} className={`rounded-xl border p-6 ${colorMap[card.color]}`}>
                <h3 className="text-lg font-bold mb-1">{card.task}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeMap[card.color]}`}>BEST: {card.best}</span>
                  <span className="text-xs text-gray-400">{card.score}</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{card.why}</p>
                <p className="text-xs text-gray-400">Runners-up: {card.runners}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8 p-4 rounded-lg bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="text-blue-700 font-semibold">Pro Tip:</span> The most productive enterprise teams in 2026 aren&apos;t choosing one model &mdash; they&apos;re using the <strong>right model for each task</strong>. Multi-model strategies are now the standard for AI-mature organizations.
          </p>
        </div>
      </section>

      {/* ─── AI Model Recommender ─── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="relative text-center mb-12">
            <p className="text-blue-600 font-mono text-sm tracking-widest uppercase mb-4">Interactive Tool</p>
            <h2 className="text-3xl font-bold mb-2">Find Your Ideal AI Model</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Answer five quick questions and we&apos;ll recommend the best AI model for your needs — with reasons.
            </p>
          </div>

          {recommenderStep === "form" ? (
            <div className="max-w-4xl mx-auto p-6 md:p-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Q1 — Use Case */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">1</span>
                  <h3 className="text-lg font-semibold">What will AI primarily help you with?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {useCaseOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, useCase: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.useCase === o.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q2 — Budget */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">2</span>
                  <h3 className="text-lg font-semibold">What is your budget model?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {budgetOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, budget: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.budget === o.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q3 — Privacy */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">3</span>
                  <h3 className="text-lg font-semibold">What are your data privacy requirements?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {privacyOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, privacy: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.privacy === o.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q4 — Scale */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">4</span>
                  <h3 className="text-lg font-semibold">How will you deploy AI?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {scaleOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, scale: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.scale === o.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Q5 — SAP */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold">5</span>
                  <h3 className="text-lg font-semibold">Do you need SAP integration?</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sapOptions.map((o) => (
                    <button key={o.value} onClick={() => setFormData((p) => ({ ...p, sapIntegration: o.value }))}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${formData.sapIntegration === o.value ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button onClick={handleRecommend} disabled={!isFormComplete}
                className={`mt-4 w-full py-4 rounded-xl font-semibold text-lg transition-all ${isFormComplete ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-200 cursor-pointer" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                Get My Recommendation
              </button>
            </div>
          ) : recommendation ? (
            <div className="max-w-4xl mx-auto">
              {/* Primary Recommendation */}
              <div className="p-6 md:p-8 rounded-2xl border border-blue-200 bg-blue-50/50 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />
                <div className="relative">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-mono uppercase tracking-wider border border-blue-200">
                    Best Match
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold mt-4 mb-1 text-gray-900">{recommendation.primary.model}</h3>
                  <p className="text-gray-500 text-sm mb-1">by {recommendation.primary.company}</p>
                  <p className="text-gray-400 text-sm mb-6">{recommendation.primary.tagline}</p>

                  {/* Score Bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-sm text-gray-400 whitespace-nowrap">Match Score</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${animatedScore}%` }} />
                    </div>
                    <span className="text-blue-700 font-mono font-bold text-lg">{animatedScore}%</span>
                  </div>

                  {/* Reasons */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-2">Why this model</p>
                    {recommendation.reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs flex-shrink-0 font-bold">&#10003;</span>
                        <p className="text-sm text-gray-600">{reason}</p>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {recommendation.warnings.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-sm text-amber-700 font-semibold mb-2">Things to consider</p>
                      {recommendation.warnings.map((w, i) => (
                        <p key={i} className="text-sm text-gray-500 mb-1">{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Runner-up */}
              <div className="mt-4 p-5 md:p-6 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">Runner-up</span>
                    <h4 className="text-lg font-bold mt-1 text-gray-800">{recommendation.runnerUp.model}</h4>
                    <p className="text-sm text-gray-500">by {recommendation.runnerUp.company} — {recommendation.runnerUp.tagline}</p>
                  </div>
                  <div className="flex items-center gap-3 md:min-w-[200px]">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${animatedRunnerScore}%` }} />
                    </div>
                    <span className="text-gray-500 font-mono font-bold">{animatedRunnerScore}%</span>
                  </div>
                </div>
              </div>

              {/* Start Over */}
              <div className="mt-6 text-center">
                <button onClick={handleStartOver}
                  className="text-sm text-blue-600 hover:text-blue-500 underline underline-offset-4 transition-colors">
                  &larr; Start over with different answers
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* AI Regulations */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI Regulations &amp; Compliance</h2>
        <p className="text-gray-500 mb-8">What enterprises must know before deploying AI</p>

        {/* EU AI Act */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4">EU AI Act &mdash; The Global Standard</h3>

          {/* Timeline */}
          <div className="relative mb-8">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-yellow-400 to-red-400" />
            {[
              { date: "Aug 1, 2024", event: "AI Act entered into force", status: "done" },
              { date: "Feb 2, 2025", event: "Prohibited AI practices banned + AI literacy obligations", status: "done" },
              { date: "Aug 2, 2025", event: "GPAI model obligations + governance rules apply", status: "done" },
              { date: "Aug 2, 2026", event: "HIGH-RISK AI systems — full compliance required", status: "upcoming" },
              { date: "Aug 2, 2027", event: "High-risk AI in regulated products (extended period)", status: "future" },
            ].map((item, i) => (
              <div key={i} className="relative pl-12 pb-6">
                <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${item.status === "done" ? "bg-green-500 border-green-400" : item.status === "upcoming" ? "bg-yellow-500 border-yellow-400 animate-pulse" : "bg-gray-300 border-gray-400"}`} />
                <p className="text-sm font-mono text-gray-400">{item.date}</p>
                <p className={`text-sm ${item.status === "upcoming" ? "text-amber-700 font-semibold" : "text-gray-600"}`}>
                  {item.event}
                  {item.status === "upcoming" && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">CRITICAL DEADLINE</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Risk Tiers */}
          <h4 className="text-lg font-semibold mb-4">4 Risk Tiers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { tier: "Unacceptable", color: "red", status: "BANNED", examples: "Social scoring, manipulative AI, real-time biometric surveillance, exploiting vulnerabilities", action: "Prohibited since Feb 2025" },
              { tier: "High Risk", color: "orange", status: "HEAVILY REGULATED", examples: "AI in employment, credit decisions, education, law enforcement, critical infrastructure", action: "Full compliance by Aug 2026: risk management, data governance, human oversight, documentation" },
              { tier: "Limited Risk", color: "yellow", status: "TRANSPARENCY REQUIRED", examples: "Chatbots, deepfakes, emotion recognition, AI-generated content", action: "Must inform users they're interacting with AI, label deepfakes" },
              { tier: "Minimal Risk", color: "green", status: "NO RESTRICTIONS", examples: "Spam filters, AI-powered games, inventory management, recommendation systems", action: "No specific obligations, voluntary codes of conduct encouraged" },
            ].map((tier, i) => {
              const borderMap: Record<string, string> = {
                red: "border-red-200 bg-red-50/50",
                orange: "border-orange-200 bg-orange-50/50",
                yellow: "border-yellow-200 bg-yellow-50/50",
                green: "border-green-200 bg-green-50/50",
              };
              const badgeColorMap: Record<string, string> = {
                red: "bg-red-100 text-red-700",
                orange: "bg-orange-100 text-orange-700",
                yellow: "bg-yellow-100 text-yellow-700",
                green: "bg-green-100 text-green-700",
              };
              return (
                <div key={i} className={`rounded-xl border p-5 ${borderMap[tier.color]}`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badgeColorMap[tier.color]}`}>{tier.status}</span>
                  <h5 className="text-lg font-bold mt-2 mb-2">{tier.tier} Risk</h5>
                  <p className="text-xs text-gray-500 mb-3">{tier.examples}</p>
                  <p className="text-xs text-gray-400 italic">{tier.action}</p>
                </div>
              );
            })}
          </div>

          {/* Penalties */}
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-8">
            <h4 className="text-lg font-semibold text-red-700 mb-2">Penalties for Non-Compliance</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-2xl font-bold text-red-600">&euro;35M / 7%</p>
                <p className="text-gray-500">Prohibited AI practices</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">&euro;15M / 3%</p>
                <p className="text-gray-500">Other AI Act infringements</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">&euro;7.5M / 1%</p>
                <p className="text-gray-500">Incorrect/misleading information</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Fines are based on global annual turnover, whichever is higher</p>
          </div>
        </div>

        {/* US Regulations */}
        <div className="mb-12">
          <h3 className="text-xl font-bold mb-4">United States &mdash; Federal vs State</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="font-bold mb-2">Federal Executive Order (Dec 2025)</h4>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>&bull; Trump signed EO to establish uniform federal AI policy</li>
                <li>&bull; AI Litigation Task Force to challenge burdensome state laws</li>
                <li>&bull; Commerce Dept evaluation of state AI laws by Mar 2026</li>
                <li>&bull; Goal: Prevent fragmented state-by-state regulation</li>
                <li>&bull; Pro-innovation stance: minimize regulatory burden</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h4 className="font-bold mb-2">Key State Laws</h4>
              <ul className="text-sm text-gray-500 space-y-2">
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
          <h3 className="text-xl font-bold mb-4">Global Regulatory Landscape</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { region: "European Union", approach: "Risk-based regulation", status: "EU AI Act (active)", stance: "Strictest" },
              { region: "United States", approach: "Federal vs State tension", status: "Executive Orders + State laws", stance: "Pro-innovation" },
              { region: "United Kingdom", approach: "Sector-specific", status: "AI Safety Institute", stance: "Balanced" },
              { region: "China", approach: "Government-controlled", status: "Deep synthesis + algorithm rules", stance: "Strategic control" },
            ].map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h5 className="font-bold text-sm mb-1">{item.region}</h5>
                <p className="text-xs text-gray-500">{item.approach}</p>
                <p className="text-xs text-blue-600 mt-1">{item.status}</p>
                <p className="text-xs text-gray-400 mt-1">Stance: {item.stance}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise Checklist */}
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
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
                <span className="text-blue-500 mt-0.5">&#9633;</span>
                <span className="text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI in SAP World */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold mb-2">AI in the SAP World</h2>
        <p className="text-gray-500 mb-8">How SAP is embedding AI across the enterprise</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { number: "400+", label: "Business AI Use Cases" },
            { number: "40", label: "Joule Agents" },
            { number: "2,100+", label: "Joule Skills" },
            { number: "70%", label: "Time Savings (Cash Mgmt)" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
              <p className="text-3xl font-bold text-blue-600">{stat.number}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "SAP Joule", desc: "Conversational AI copilot embedded across SAP applications. Helps with purchase requisitions, data analysis, and natural-language queries on business data.", tag: "Copilot" },
            { title: "Joule Agents", desc: "Autonomous AI agents for specific business tasks: Cash Management Agent, Bid Analysis Agent, Production Planning Agent, International Trade Classification Agent.", tag: "Autonomous" },
            { title: "Joule Studio (GA Q1 2026)", desc: "Build custom Joule agents and skills using SAP's built-in business knowledge. Enterprises can create domain-specific AI agents tailored to their processes.", tag: "Build Your Own" },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">{card.tag}</span>
              <h4 className="text-lg font-bold mt-3 mb-2">{card.title}</h4>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
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
              <div key={i} className="p-3 rounded-lg bg-white/70 border border-gray-100">
                <span className="font-semibold text-blue-700">{item.func}:</span>
                <span className="text-gray-500 ml-2">{item.cases}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-200">
        <p className="text-xs text-gray-400 mb-4">
          Sources: MIT Technology Review, Pluralsight, SAP News Center, EU Digital Strategy, LM Council Benchmarks,
          SAP Community, LegalNodes, SecurePrivacy, King &amp; Spalding, Baker Botts, Faros AI, PlayCode, Cosmic
        </p>
        <p className="text-xs text-gray-300">
          Prepared for internal enterprise reference. Last updated February 2026. Data sourced from public benchmarks and official documentation.
        </p>
      </footer>
    </div>
  );
}
