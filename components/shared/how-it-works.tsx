"use client";

import { FileText, Sparkles, Download } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

const steps = [
  {
    icon: FileText,
    title: "Describe Your Process",
    description:
      "Enter your business requirements — from a quick one-liner to a detailed process description. Our AI understands SAP context.",
    gradient: "from-sky-500 to-blue-600",
    step: "01",
  },
  {
    icon: Sparkles,
    title: "Generate with WE-AI",
    description:
      "Our 6-agent team analyzes your requirements using enterprise best practices and generates a comprehensive FSD in under 30 seconds.",
    gradient: "from-violet-500 to-purple-600",
    step: "02",
  },
  {
    icon: Download,
    title: "Download & Share",
    description:
      "Export as a professional Word document, share via secure links, or refine with AI-powered chat. Ready for your project team.",
    gradient: "from-emerald-500 to-teal-600",
    step: "03",
  },
];

const ease = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-transparent -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 px-4 py-1.5 text-xs font-semibold text-emerald-600 mb-4">
            <Sparkles className="h-3 w-3" />
            Simple & Powerful
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="mt-3 text-slate-500 max-w-xl mx-auto">
            From requirements to enterprise-grade specifications in three simple steps
          </p>
        </motion.div>

        {/* Steps grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative" staggerDelay={0.2}>
          {/* Connecting lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%)] right-[calc(33.33%)] z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="h-px bg-gradient-to-r from-sky-200 via-violet-200 to-emerald-200 origin-left"
            />
          </div>

          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                className="group relative z-10 rounded-2xl bg-white/80 backdrop-blur-xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:bg-white transition-all duration-500 cursor-default h-full"
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-2xl`} />

                {/* Step number + Icon row */}
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-4xl font-extrabold text-slate-100 group-hover:text-sky-100 transition-colors duration-300">
                    {step.step}
                  </span>
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
