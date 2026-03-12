"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const ease = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

export function CtaSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Dark background with gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            SAP Specifications That{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-violet-400">
              Write Themselves
            </span>
            .
          </h2>
          <p className="mt-5 text-lg text-slate-400 max-w-xl mx-auto">
            Try it on your next project today. Generate your first FSD in under
            30 seconds.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/generate"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-slate-900 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4 text-sky-500" />
              Generate New FSD
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/fsd"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-sm font-semibold text-white/90 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Explore Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
