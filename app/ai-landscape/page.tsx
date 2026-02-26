"use client";

export default function AILandscapePage() {
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
