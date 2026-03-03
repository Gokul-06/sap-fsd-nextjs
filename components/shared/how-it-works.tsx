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
    color: "#0EA5E9",
    bgColor: "bg-sky-50",
    hoverBg: "group-hover:bg-sky-100/80",
  },
  {
    icon: Sparkles,
    title: "Generate with WE-AI",
    description:
      "Our 6-agent team analyzes your requirements using McKinsey frameworks and generates a comprehensive FSD in under 30 seconds.",
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    hoverBg: "group-hover:bg-blue-100/80",
  },
  {
    icon: Download,
    title: "Download & Share",
    description:
      "Export as a professional Word document, share via secure links, or refine with AI-powered chat. Ready for your project team.",
    color: "#10B981",
    bgColor: "bg-emerald-50",
    hoverBg: "group-hover:bg-emerald-100/80",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-semibold text-sky-500 uppercase tracking-widest mb-3">
            Simple & Powerful
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            How It Works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            From requirements to enterprise-grade specifications in three simple steps
          </p>
        </motion.div>

        {/* Steps grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 relative" staggerDelay={0.2}>
          {/* Connecting lines (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] -translate-y-1/2 z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              className="h-px bg-gradient-to-r from-sky-200/40 via-sky-300/30 to-sky-200/40 origin-left"
            />
          </div>

          {steps.map((step, i) => (
            <StaggerItem key={step.title}>
              <motion.div
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                className="group relative z-10 rounded-2xl bg-white/60 backdrop-blur-xl p-8 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/80 transition-all duration-500 cursor-default"
              >
                {/* Step number */}
                <div className="absolute -top-3 -left-1 w-7 h-7 rounded-full bg-white border-2 border-sky-200 flex items-center justify-center text-xs font-bold text-sky-500 group-hover:border-sky-400 group-hover:text-sky-600 transition-colors duration-300 shadow-sm">
                  {i + 1}
                </div>

                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${step.bgColor} ${step.hoverBg} transition-colors duration-300 mb-5`}
                >
                  <step.icon
                    className="h-7 w-7 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: step.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-transparent group-hover:via-current group-hover:to-transparent transition-all duration-500"
                  style={{ color: step.color }}
                />
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
