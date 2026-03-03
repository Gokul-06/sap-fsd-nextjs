"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, Download, Shield, Zap, Brain } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const features = [
  {
    icon: Brain,
    title: "6-Agent AI Team",
    description:
      "Our multi-agent system uses specialized AI agents — each focused on a different aspect of your SAP specification. Working together for comprehensive results.",
    color: "#0EA5E9",
    bgColor: "bg-sky-50",
    span: "col-span-1 md:col-span-2", // Wide card (left)
    height: "min-h-[280px]",
  },
  {
    icon: Zap,
    title: "Under 30 seconds",
    description:
      "Enterprise-grade documents generated in seconds, not weeks. From requirements to a complete FSD faster than making coffee.",
    color: "#3B82F6",
    bgColor: "bg-blue-50",
    span: "col-span-1", // Normal card (right)
    height: "min-h-[280px]",
  },
  {
    icon: FileText,
    title: "14 FSD Sections",
    description:
      "Complete coverage including scope, process flows, data models, authorization, test scenarios, and more.",
    color: "#10B981",
    bgColor: "bg-emerald-50",
    span: "col-span-1", // Normal card (left bottom)
    height: "min-h-[280px]",
  },
  {
    icon: Download,
    title: "Professional Word Export",
    description:
      "Download as beautifully formatted .docx documents with company branding, table of contents, and styled tables. Ready for your project team.",
    color: "#8B5CF6",
    bgColor: "bg-violet-50",
    span: "col-span-1 md:col-span-2", // Wide card (right bottom)
    height: "min-h-[280px]",
  },
];

export function BentoFeatures() {
  return (
    <ScrollReveal>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
              Everything you need
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              A complete SAP specification platform, powered by AI
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                className={`${feature.span} ${feature.height} group relative rounded-2xl bg-white/70 backdrop-blur-xl p-8 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/90 transition-all duration-500 cursor-default overflow-hidden`}
              >
                {/* Subtle gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at top right, ${feature.color}08 0%, transparent 60%)`,
                  }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} transition-transform duration-300 group-hover:scale-110 mb-5`}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: feature.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-slate-800 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-transparent group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-current group-hover:to-transparent transition-all duration-500"
                  style={{ color: feature.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
