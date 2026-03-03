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

/* ───── Cloud SVG paths ───── */
function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
      <path
        d="M160 60H40c-11 0-20-9-20-20s9-20 20-20c1.5 0 3 .15 4.4.45C49.5 10.2 59 3 70 3c8 0 15 3.8 19.5 9.6C93 7.5 99 4 106 4c13.3 0 24 10.7 24 24 0 1.2-.1 2.3-.3 3.4C135.5 33 140 37.7 140 43.5c0 .5 0 1-.1 1.5h20c11 0 20 9 20 20s-9 15-20 15Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ───── Floating cloud with Framer Motion ───── */
function FloatingCloud({
  size,
  top,
  left,
  right,
  opacity,
  duration,
  delay,
}: {
  size: number;
  top: string;
  left?: string;
  right?: string;
  opacity: number;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none text-sky-200"
      style={{ top, left, right, width: size, opacity }}
      animate={{
        x: [0, 25, -15, 0],
        y: [0, -10, 5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Cloud />
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/80 to-sky-100/60 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Soft radial glows */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-100/40 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-blue-100/20 blur-2xl animate-float-fast" />

        {/* Floating clouds */}
        <FloatingCloud size={220} top="8%" left="3%" opacity={0.25} duration={22} delay={0} />
        <FloatingCloud size={160} top="15%" right="5%" opacity={0.18} duration={18} delay={2} />
        <FloatingCloud size={280} top="55%" left="60%" opacity={0.12} duration={25} delay={4} />
        <FloatingCloud size={140} top="70%" left="8%" opacity={0.2} duration={20} delay={1} />
        <FloatingCloud size={180} top="35%" right="15%" opacity={0.15} duration={23} delay={3} />

        {/* Subtle drifting dots */}
        <div className="absolute right-0 top-0 h-full w-1/2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-sky-300/30 animate-drift"
              style={{
                top: `${15 + i * 16}%`,
                right: `${10 + i * 12}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${8 + i * 2}s`,
              }}
            />
          ))}
        </div>
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

        {/* Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0.15}
          variants={fadeUp}
          className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl"
        >
          Generate SAP Specifications
          <span className="block mt-2 bg-gradient-to-r from-sky-500 to-blue-500 bg-clip-text text-transparent">
            in Seconds
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial="hidden"
          animate="visible"
          custom={0.3}
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
              custom={0.4 + i * 0.1}
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
              {/* Animated bottom border on hover */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-sky-400/0 to-transparent group-hover:via-sky-400/60 transition-all duration-500" />
            </motion.div>
          ))}
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.8}
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
