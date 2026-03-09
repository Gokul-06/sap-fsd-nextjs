"use client";

import { motion } from "framer-motion";
import { Bot, ArrowRight, Zap, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { CtaSection } from "@/components/shared/cta-section";
import { AGENTS, statusColorMap, type Agent } from "@/lib/agents-data";

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut },
  }),
};

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 400, damping: 15 },
      }}
      className="group relative rounded-2xl bg-white/70 backdrop-blur-xl p-7 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/90 transition-all duration-500 cursor-default overflow-hidden h-full"
    >
      {/* Hover radial gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(circle at top right, ${agent.color}10 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10">
        {/* Icon + Status */}
        <div className="flex items-start justify-between mb-5">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${agent.bgColor} transition-transform duration-300 group-hover:scale-110`}
          >
            <agent.icon className="h-6 w-6" style={{ color: agent.color }} />
          </div>
          <Badge className={`${statusColorMap[agent.status]} text-xs`}>
            {agent.status}
          </Badge>
        </div>

        {/* Name & Role */}
        <h3 className="text-lg font-semibold text-slate-800 mb-1 group-hover:text-sky-600 transition-colors duration-300">
          {agent.name}
        </h3>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
          {agent.role}
        </p>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {agent.description}
        </p>

        {/* Capability pills */}
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${agent.color}60, transparent)`,
        }}
      />
    </motion.div>
  );
}

export default function AgentsPage() {
  const featuredAgent = AGENTS.find((a) => a.featured);
  const specialists = AGENTS.filter((a) => !a.featured);

  return (
    <div className="relative z-10">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Background glows */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl animate-float-medium" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-100/20 blur-3xl animate-float-fast" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-sky-600 border border-sky-100/60 shadow-sm">
              <Bot className="h-3.5 w-3.5" />
              Powered by WE-AI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl"
          >
            AI Agent Hub
            <span className="block mt-2 bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
              6 Specialists. One Mission.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed"
          >
            Each agent is trained on SAP enterprise best practices, working
            together through a multi-phase pipeline to produce complete
            specifications in seconds.
          </motion.p>

          {/* Quick highlights */}
          <motion.div
            variants={fadeUp}
            custom={0.35}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400"
          >
            <span className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-sky-500" />
              Under 30s generation
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" />
              Multi-Agent Reflexion
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-sky-500" />
              Peer-reviewed output
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Featured Agent ── */}
      {featuredAgent && (
        <section className="px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
              <motion.div
                whileHover={{
                  y: -6,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                  },
                }}
                className="group relative rounded-2xl bg-white/70 backdrop-blur-xl p-8 sm:p-10 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/90 transition-all duration-500 cursor-default overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background:
                      "radial-gradient(circle at top left, rgba(14, 165, 233, 0.06) 0%, transparent 50%)",
                  }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-50 shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <featuredAgent.icon
                      className="h-8 w-8"
                      style={{ color: featuredAgent.color }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors duration-300">
                        {featuredAgent.name}
                      </h2>
                      <Badge
                        className={`${statusColorMap[featuredAgent.status]} text-xs`}
                      >
                        {featuredAgent.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-sky-500 uppercase tracking-wider mb-3">
                      {featuredAgent.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-3xl">
                      {featuredAgent.description}
                    </p>

                    {/* Capability pills */}
                    <div className="flex flex-wrap gap-2">
                      {featuredAgent.capabilities.map((cap) => (
                        <span
                          key={cap}
                          className="text-xs px-3 py-1.5 rounded-full bg-sky-50 text-sky-600 border border-sky-100 font-medium"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0">
                    <Link
                      href="/generate"
                      className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.04] btn-shimmer overflow-hidden relative"
                    >
                      Try It Now
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
              </motion.div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* ── Specialist Agents Grid ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                The Specialist Team
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                Each agent is an expert in their domain, trained on SAP best
                practices and enterprise consulting frameworks.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            staggerDelay={0.12}
          >
            {specialists.map((agent) => (
              <StaggerItem key={agent.id}>
                <AgentCard agent={agent} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── How They Work Together ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
                How They Work Together
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                A 4-phase pipeline with built-in peer review for
                enterprise-grade quality.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            staggerDelay={0.15}
          >
            {[
              {
                step: "01",
                title: "Director Brief",
                desc: "Project Director analyses requirements and creates a shared context for all specialists.",
                color: "#8B5CF6",
              },
              {
                step: "02",
                title: "Parallel Writing",
                desc: "5 specialist agents write their sections simultaneously, each focused on their expertise.",
                color: "#3B82F6",
              },
              {
                step: "03",
                title: "Cross-Critique",
                desc: "Agents peer-review each other's work, catching inconsistencies and improving quality.",
                color: "#10B981",
              },
              {
                step: "04",
                title: "Quality Review",
                desc: "Final consistency check across all 14 sections — terminology, cross-references, and formatting.",
                color: "#0EA5E9",
              },
            ].map((phase) => (
              <StaggerItem key={phase.step}>
                <div className="group relative rounded-2xl bg-white/70 backdrop-blur-xl p-6 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/90 transition-all duration-500 text-center h-full">
                  {/* Step number */}
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-4 text-sm font-bold text-white"
                    style={{ backgroundColor: phase.color }}
                  >
                    {phase.step}
                  </div>
                  <h3 className="text-base font-semibold text-slate-800 mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {phase.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── CTA ── */}
      <CtaSection />
    </div>
  );
}
