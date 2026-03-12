"use client";

import { motion } from "framer-motion";
import { FileText, Zap, Download, Brain, MessageSquare, Globe } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";

const features = [
  {
    icon: Brain,
    title: "6-Agent AI Team",
    description:
      "Specialized AI agents work in concert — scope analysis, process mapping, data modeling, authorization, testing, and integration — delivering comprehensive results.",
    color: "#0EA5E9",
    gradient: "from-sky-500 to-blue-600",
    span: "col-span-1 md:col-span-2",
    height: "min-h-[260px]",
  },
  {
    icon: Zap,
    title: "Under 30 Seconds",
    description:
      "Enterprise-grade documents generated in seconds, not weeks. From requirements to a complete FSD faster than making coffee.",
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-600",
    span: "col-span-1",
    height: "min-h-[260px]",
  },
  {
    icon: FileText,
    title: "14 FSD Sections",
    description:
      "Complete coverage including scope, process flows, data models, authorization concepts, test scenarios, and more.",
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-600",
    span: "col-span-1",
    height: "min-h-[260px]",
  },
  {
    icon: Download,
    title: "Professional Word Export",
    description:
      "Download beautifully formatted .docx documents with company branding, table of contents, styled tables, and headers/footers. Ready for your project team.",
    color: "#F59E0B",
    gradient: "from-amber-500 to-orange-600",
    span: "col-span-1 md:col-span-2",
    height: "min-h-[260px]",
  },
  {
    icon: MessageSquare,
    title: "AI Refinement Chat",
    description:
      "Refine any section with an intelligent chat interface. Target specific sections or the full document — the AI understands SAP context.",
    color: "#3B82F6",
    gradient: "from-blue-500 to-indigo-600",
    span: "col-span-1 md:col-span-2",
    height: "min-h-[260px]",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Generate FSDs in English, German, French, Spanish, and more. Perfect for global SAP implementations across regions.",
    color: "#EC4899",
    gradient: "from-pink-500 to-rose-600",
    span: "col-span-1",
    height: "min-h-[260px]",
  },
];

const ease = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

export function BentoFeatures() {
  return (
    <ScrollReveal>
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-40 -right-20 w-80 h-80 bg-sky-100/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-40 -left-20 w-80 h-80 bg-violet-100/20 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold text-sky-500 uppercase tracking-widest mb-3">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Everything You Need
            </h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
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
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
                whileHover={{
                  y: -6,
                  transition: { type: "spring", stiffness: 400, damping: 15 },
                }}
                className={`${feature.span} ${feature.height} group relative rounded-2xl bg-white/80 backdrop-blur-xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:bg-white transition-all duration-500 cursor-default overflow-hidden`}
              >
                {/* Hover gradient glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, ${feature.color}10 0%, transparent 60%)`,
                  }}
                />

                {/* Top accent line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 mb-5`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
