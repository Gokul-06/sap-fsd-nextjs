"use client";

import Link from "next/link";
import { ArrowRight, FileText, Cpu, Clock, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Counter } from "@/components/animations/counter";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

const stats = [
  { value: 14, suffix: "", label: "FSD Sections", sublabel: "Complete Coverage", icon: FileText, gradient: "from-sky-500 to-blue-500" },
  { value: 6, suffix: "+", label: "SAP Modules", sublabel: "MM · SD · FI · CO · PP · QM", icon: Cpu, gradient: "from-violet-500 to-purple-500" },
  { value: 30, prefix: "<", suffix: "s", label: "Generation", sublabel: "Enterprise-Grade Speed", icon: Clock, gradient: "from-emerald-500 to-teal-500" },
  { value: 100, suffix: "%", label: "AI-Powered", sublabel: "WE-AI Intelligence", icon: Shield, gradient: "from-amber-500 to-orange-500" },
];

export function AlreadyKnewSection() {
  return (
    <section className="py-20 px-4 relative">

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4"
        >
          <div>
            <span className="inline-block text-xs font-semibold text-sky-500 uppercase tracking-widest mb-3">
              By the Numbers
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              Built for Enterprise<span className="text-sky-500">.</span>
            </h2>
          </div>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-sky-500 transition-colors group"
          >
            Try it now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Stats grid — card style */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6" staggerDelay={0.12}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={stat.label}>
                <motion.div
                  whileHover={{
                    y: -6,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                  className="group relative rounded-2xl bg-white/80 backdrop-blur-xl p-6 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:bg-white transition-all duration-500 cursor-default overflow-hidden"
                >
                  {/* Gradient top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:text-sky-500 mb-4 transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Number */}
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                    <Counter
                      target={stat.value}
                      prefix={stat.prefix || ""}
                      suffix={stat.suffix}
                      duration={1.5}
                    />
                  </p>

                  {/* Labels */}
                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {stat.label}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                    {stat.sublabel}
                  </p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
