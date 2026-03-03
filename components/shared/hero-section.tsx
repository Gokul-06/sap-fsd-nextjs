"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { value: "14", label: "FSD Sections" },
  { value: "200+", label: "SAP Objects" },
  { value: "10", label: "SAP Modules" },
  { value: "<30s", label: "Generation Time" },
];

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut },
  }),
};

/* ───── Typewriter component ───── */
const headlineText = "Generate SAP Specifications";

function TypewriterHeadline() {
  return (
    <span className="inline">
      {headlineText.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.04,
            delay: 0.4 + i * 0.035,
            ease: "easeOut",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/80 to-sky-100/60 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft radial glows */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-100/40 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-blue-100/20 blur-2xl animate-float-fast" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-4 py-1.5 backdrop-blur-sm border border-sky-200/60"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-500" />
          <span className="text-xs font-medium text-slate-600 tracking-wide">
            Powered by WE-AI
          </span>
        </motion.div>

        {/* Headline with Typewriter */}
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
          <TypewriterHeadline />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: easeOut }}
            className="block mt-2 bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent"
          >
            in Seconds
          </motion.span>
        </h1>

        {/* Subheading */}
        <motion.p
          initial="hidden"
          animate="visible"
          custom={1.7}
          variants={fadeUp}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed"
        >
          Enterprise-grade functional specification documents for SAP S/4HANA
          implementations — powered by WE-AI intelligence
        </motion.p>

        {/* Stats Grid — Glassmorphic cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial="hidden"
              animate="visible"
              custom={1.9 + i * 0.1}
              variants={fadeUp}
              whileHover={{
                scale: 1.06,
                y: -4,
                transition: { type: "spring", stiffness: 400, damping: 15 },
              }}
              className="group relative rounded-xl bg-white/60 px-4 py-6 backdrop-blur-xl border border-white/70 shadow-lg shadow-sky-100/40 transition-all duration-300 hover:bg-white/80 hover:shadow-xl hover:shadow-sky-200/50 hover:border-sky-200/50 cursor-default"
            >
              <p className="text-3xl font-bold text-slate-800 sm:text-4xl group-hover:text-sky-500 transition-colors duration-300">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-sky-400/0 to-transparent group-hover:via-sky-400/60 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2.3}
          variants={fadeUp}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/generate"
            className="group relative inline-flex items-center rounded-xl bg-sky-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 hover:scale-[1.04] overflow-hidden btn-shimmer"
          >
            Generate New FSD
            <svg
              className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center rounded-xl border border-sky-200 px-8 py-3.5 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-sky-50 hover:text-slate-800 hover:border-sky-300 hover:scale-[1.02]"
          >
            View Documents
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
