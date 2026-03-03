"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Counter } from "@/components/animations/counter";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

const stats = [
  { value: 14, suffix: "", sub: "sections", label: "Complete FSD Coverage" },
  { value: 6, suffix: "+", sub: "SAP modules", label: "MM · SD · FI · CO · PP · QM" },
  { value: 30, prefix: "<", suffix: "s", sub: "generation", label: "Enterprise-Grade Speed" },
  { value: 100, suffix: "%", sub: "AI-powered", label: "WE-AI Intelligence" },
];

export function AlreadyKnewSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
        >
          <h2 className="text-4xl sm:text-5xl font-black text-slate-800 leading-tight">
            Already knew<span className="text-sky-500">?</span>
          </h2>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-sky-500 transition-colors group"
          >
            Try it now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Stats grid with blue vertical separators */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0" staggerDelay={0.15}>
          {stats.map((stat) => (
            <StaggerItem key={stat.sub}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative group cursor-default"
              >
                {/* Sky blue vertical line — grows on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-sky-400 transition-all duration-300 group-hover:w-[5px] group-hover:bg-sky-500" />
                <div className="pl-5">
                  <p className="text-3xl sm:text-4xl font-black text-slate-800">
                    <Counter
                      target={stat.value}
                      prefix={stat.prefix || ""}
                      suffix={stat.suffix}
                      duration={1.5}
                    />
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {stat.sub}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
