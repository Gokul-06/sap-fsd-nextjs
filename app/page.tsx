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
  Download,
  Shield,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";
import { Counter } from "@/components/animations/counter";
import { useEffect, useRef, useState } from "react";

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease },
  }),
};

/* ─── Data ─── */
const hubCards = [
  {
    title: "FSD Generator",
    subtitle: "Functional Specifications",
    description:
      "Generate comprehensive SAP Functional Specification Documents using our 6-agent AI system. From requirements to a complete, professional FSD in under 30 seconds.",
    href: "/fsd",
    icon: FileText,
    gradient: "from-sky-500 to-blue-600",
    glowColor: "rgba(14, 165, 233, 0.15)",
    lightBg: "bg-sky-500/10",
    tag: "Most Popular",
  },
  {
    title: "Proposal Generator",
    subtitle: "Consulting Proposals",
    description:
      "Create polished consulting proposals using AI-assisted templates and structured client information. Perfect for pre-sales and project kickoffs.",
    href: "/proposal",
    icon: ScrollText,
    gradient: "from-violet-500 to-purple-600",
    glowColor: "rgba(139, 92, 246, 0.15)",
    lightBg: "bg-violet-500/10",
    tag: "New",
  },
];

const stats = [
  { value: 14, suffix: "", label: "FSD Sections", icon: FileText },
  { value: 30, suffix: "s", label: "Generation Time", icon: Clock },
  { value: 6, suffix: "", label: "AI Agents", icon: Brain },
  { value: 100, suffix: "%", label: "SAP Coverage", icon: Shield },
];

const steps = [
  {
    step: "01",
    title: "Input Requirements",
    description:
      "Paste your business requirements or use our guided form with 7 structured sections.",
    icon: FileText,
    color: "text-sky-500",
  },
  {
    step: "02",
    title: "AI Generates",
    description:
      "Our 6-agent AI team analyzes and generates a comprehensive 14-section FSD document.",
    icon: Brain,
    color: "text-violet-500",
  },
  {
    step: "03",
    title: "Refine & Export",
    description:
      "Refine sections with AI chat, then download as a professionally formatted Word document.",
    icon: Download,
    color: "text-emerald-500",
  },
];

/* ─── Animated gradient text component ─── */
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

/* ─── Floating orb component ─── */
function FloatingOrb({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay }}
      className={`absolute rounded-full pointer-events-none ${className}`}
    />
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative">
      {/* ════════════════════════════════════════════
          HERO SECTION — Cinematic gradient mesh
      ════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 min-h-[80vh] flex items-center"
      >
        {/* Gradient mesh background */}
        <div className="absolute inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-sky-50/30" />

          {/* Animated orbs */}
          <FloatingOrb
            className="w-[600px] h-[600px] -top-40 -left-40 bg-sky-200/30 blur-[120px] animate-float-slow"
            delay={0}
          />
          <FloatingOrb
            className="w-[500px] h-[500px] -top-20 -right-32 bg-violet-200/25 blur-[100px] animate-float-medium"
            delay={0.5}
          />
          <FloatingOrb
            className="w-[400px] h-[400px] bottom-0 left-1/3 bg-blue-200/20 blur-[80px] animate-float-fast"
            delay={1}
          />

          {/* Interactive mouse-follow glow */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[120px] bg-sky-300/10 transition-all duration-[2000ms] ease-out pointer-events-none"
            style={{
              left: `${mousePosition.x * 100}%`,
              top: `${mousePosition.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-5xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/50 px-5 py-2 text-xs font-semibold tracking-wide text-sky-600 shadow-lg shadow-sky-100/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
              </span>
              Powered by WE-AI
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
            The future of AI-powered SAP consulting. Generate professional
            documents, specifications, and proposals in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            custom={0.35}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/generate"
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              Generate FSD
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/fsd"
              className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            >
              View Dashboard
              <ChevronRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          STATS — Animated counters
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
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
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-50 text-sky-500 mb-3 group-hover:scale-110 transition-transform duration-300">
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
          HUB CARDS — Premium glassmorphism
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-0 w-72 h-72 bg-violet-100/30 rounded-full blur-[80px]" />
          <div className="absolute bottom-20 left-0 w-72 h-72 bg-sky-100/30 rounded-full blur-[80px]" />
        </div>

        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Choose Your Tool
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              AI-powered document generation, built for SAP consultants
            </p>
          </motion.div>

          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            staggerDelay={0.2}
          >
            {hubCards.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title}>
                  <Link href={card.href} className="block group h-full">
                    <motion.div
                      whileHover={{
                        y: -8,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        },
                      }}
                      className="relative rounded-2xl bg-white/80 backdrop-blur-xl p-8 sm:p-10 border border-slate-200/60 shadow-lg shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/40 hover:bg-white transition-all duration-500 cursor-pointer overflow-hidden h-full flex flex-col"
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 30% 20%, ${card.glowColor} 0%, transparent 70%)`,
                        }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Top row: Icon + Tag */}
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                          >
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                            {card.tag}
                          </span>
                        </div>

                        {/* Subtitle */}
                        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-2">
                          {card.subtitle}
                        </p>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                          {card.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1">
                          {card.description}
                        </p>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors duration-300">
                          Get started
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                        </div>
                      </div>

                      {/* Bottom gradient line */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
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
          HOW IT WORKS — 3-step process
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="mx-auto max-w-5xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 px-4 py-1.5 text-xs font-semibold text-emerald-600 mb-4">
              <Zap className="h-3 w-3" />
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              From Requirements to FSD
            </h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">
              Three simple steps to generate professional SAP specifications
            </p>
          </motion.div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease }}
                  className="relative group"
                >
                  {/* Connector line (between cards) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-14 left-full w-full h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent z-0" />
                  )}

                  <div className="relative bg-white rounded-2xl border border-slate-200/60 p-8 hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-500 hover:-translate-y-1 h-full">
                    {/* Step number */}
                    <div className="flex items-center gap-4 mb-5">
                      <span className="text-4xl font-extrabold text-slate-100 group-hover:text-sky-100 transition-colors duration-300">
                        {item.step}
                      </span>
                      <div
                        className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 ${item.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          BOTTOM CTA — Final push
      ════════════════════════════════════════════ */}
      <section className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
          {/* Grid pattern overlay */}
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
            Ready to Transform Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400">
              SAP Documentation
            </span>
            ?
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto">
            Join the next generation of AI-powered SAP consulting.
            Generate your first FSD in under 30 seconds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-sky-500" />
              Start Generating
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/fsd"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Explore Dashboard
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
