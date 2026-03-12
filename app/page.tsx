"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  ScrollText,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Shield,
  ChevronRight,
  Globe,
  Bot,
} from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { Counter } from "@/components/animations/counter";
import { PageBackground } from "@/components/shared/page-background";

/* ─── Animation presets ─── */
const ease = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease },
  }),
};

/* ─── Hub-level data ─── */
const agents = [
  {
    title: "FSD Generator",
    subtitle: "Functional Specifications",
    description:
      "Generate comprehensive SAP Functional Specification Documents with our 6-agent AI system. 14 sections covering scope, process flows, data models, authorization, and more — in under 30 seconds.",
    href: "/fsd",
    icon: FileText,
    gradient: "from-sky-500 to-blue-600",
    glowColor: "rgba(14, 165, 233, 0.15)",
    tag: "Live",
    tagColor: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
    highlights: ["14 FSD Sections", "6 AI Agents", "Word Export", "AI Refinement Chat"],
  },
  {
    title: "Proposal Generator",
    subtitle: "Consulting Proposals",
    description:
      "Create polished SAP consulting proposals using AI-assisted templates and structured client information. Perfect for pre-sales, project kickoffs, and client presentations.",
    href: "/proposal",
    icon: ScrollText,
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    tag: "Live",
    tagColor: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
    highlights: ["AI Templates", "Client Structuring", "Professional Export", "Multi-Language"],
  },
];

const platformStats = [
  { value: 2, suffix: "", label: "AI Agents", icon: Bot },
  { value: 8, suffix: "+", label: "SAP Modules", icon: Globe },
  { value: 30, suffix: "s", label: "Avg. Generation", icon: Zap },
  { value: 6, suffix: "", label: "Specialized AIs", icon: Brain },
];

const capabilities = [
  {
    icon: Brain,
    title: "Multi-Agent Architecture",
    description:
      "Each agent leverages specialized AI models working in concert — analyzing requirements, mapping processes, and generating enterprise-grade documents.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: Shield,
    title: "SAP Best Practices",
    description:
      "Built on deep SAP knowledge — 200+ objects, transaction codes, Fiori apps, CDS views, and BAPIs baked into every generated document.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Zap,
    title: "Seconds, Not Weeks",
    description:
      "What used to take days of manual work now happens in under 30 seconds. Enterprise-grade output at the speed of thought.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

/* ─── Components ─── */
function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 ${className}`}
    >
      {children}
    </span>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  return (
    <div className="relative">
      {/* Page-level seamless background */}
      <PageBackground />

      {/* ════════════════════════════════════════════
          HERO — The AI Agent Hub
      ════════════════════════════════════════════ */}
      <section className="relative px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 min-h-[70vh] flex items-center">
        <motion.div initial="hidden" animate="visible" className="relative mx-auto max-w-5xl text-center">
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/50 px-5 py-2 text-xs font-semibold tracking-wide text-sky-600 shadow-lg shadow-sky-100/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              {agents.length} AI Agents Active
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.1]"
          >
            Westernacher{" "}
            <GradientText>AI Agent</GradientText>{" "}
            Hub
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl"
          >
            Your AI-powered toolkit for SAP consulting. Generate specifications,
            proposals, and documents — each powered by specialized AI agents.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeUp}
            custom={0.35}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#agents"
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Bot className="h-4 w-4" />
              Explore Agents
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </a>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              Read Our Blog
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          PLATFORM STATS
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/60 backdrop-blur-sm text-sky-500 mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-slate-900 tabular-nums">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          AGENT CARDS
      ════════════════════════════════════════════ */}
      <section id="agents" className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-sky-200/50 px-4 py-1.5 text-xs font-semibold text-sky-600 mb-4">
              <Bot className="h-3 w-3" />
              AI Agents
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Choose Your Agent
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Each agent is purpose-built for a specific SAP consulting workflow
            </p>
          </motion.div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" staggerDelay={0.2}>
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <StaggerItem key={agent.title}>
                  <Link href={agent.href} className="block group h-full">
                    <motion.div
                      whileHover={{
                        y: -8,
                        transition: { type: "spring", stiffness: 400, damping: 15 },
                      }}
                      className="relative rounded-2xl bg-white/70 backdrop-blur-xl p-8 sm:p-10 border border-white/50 shadow-lg shadow-slate-200/30 hover:shadow-2xl hover:shadow-slate-300/40 hover:bg-white/90 transition-all duration-500 cursor-pointer overflow-hidden h-full flex flex-col"
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 30% 20%, ${agent.glowColor} 0%, transparent 70%)`,
                        }}
                      />

                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Icon + Tag */}
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                          >
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wide uppercase ${agent.tagColor}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {agent.tag}
                          </span>
                        </div>

                        {/* Subtitle */}
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                          {agent.subtitle}
                        </p>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                          {agent.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
                          {agent.description}
                        </p>

                        {/* Highlight pills */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {agent.highlights.map((h) => (
                            <span
                              key={h}
                              className="inline-flex items-center rounded-lg bg-slate-50/80 border border-slate-100/80 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                            >
                              {h}
                            </span>
                          ))}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors duration-300">
                          Explore Agent
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </div>
                      </div>

                      {/* Bottom gradient */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${agent.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />
                    </motion.div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PLATFORM CAPABILITIES
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-violet-200/50 px-4 py-1.5 text-xs font-semibold text-violet-600 mb-4">
              <Sparkles className="h-3 w-3" />
              Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Why WE-AI Agent Hub
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Enterprise-grade AI built specifically for SAP consulting workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {capabilities.map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease }}
                  whileHover={{
                    y: -6,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  className="group relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 p-8 hover:shadow-xl hover:shadow-slate-200/40 hover:bg-white/90 transition-all duration-500 cursor-default overflow-hidden"
                >
                  {/* Top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cap.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl`} />

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${cap.gradient} shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {cap.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your AI Consulting{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400">
              Toolkit Awaits
            </span>
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto">
            Pick an agent and transform how your team delivers SAP projects.
            Specifications, proposals, and more — powered by WE-AI.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/fsd"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <FileText className="h-4 w-4 text-sky-500" />
              FSD Generator
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/proposal"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <ScrollText className="h-4 w-4 text-violet-400" />
              Proposal Generator
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
