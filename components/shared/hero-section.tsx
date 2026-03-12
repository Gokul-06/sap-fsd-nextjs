"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

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
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
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
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:px-8 min-h-[85vh] flex items-center"
    >
      {/* ── Background layers ── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />

        {/* Animated orbs – vivid & visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute w-[700px] h-[700px] -top-40 -left-40 bg-sky-300/50 rounded-full blur-[100px] animate-float-slow"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute w-[600px] h-[600px] -top-20 -right-32 bg-violet-300/35 rounded-full blur-[90px] animate-float-medium"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
          className="absolute w-[500px] h-[500px] bottom-0 left-1/3 bg-blue-300/30 rounded-full blur-[70px] animate-float-fast"
        />

        {/* Mouse-follow glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] bg-sky-300/20 transition-all duration-[2000ms] ease-out pointer-events-none"
          style={{
            left: `${mousePosition.x * 100}%`,
            top: `${mousePosition.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl text-center w-full">
        {/* Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-sky-200/50 px-5 py-2 text-xs font-semibold tracking-wide text-sky-600 shadow-lg shadow-sky-100/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            Powered by WE-AI · 6-Agent System
          </span>
        </motion.div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-7xl leading-[1.1]">
          <TypewriterHeadline />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4, ease: easeOut }}
            className="block mt-2 bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 bg-clip-text text-transparent"
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
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl"
        >
          Enterprise-grade functional specification documents for SAP S/4HANA
          implementations — powered by WE-AI intelligence
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2.0}
          variants={fadeUp}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/generate"
            className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 overflow-hidden btn-shimmer"
          >
            <Sparkles className="h-4 w-4" />
            Generate New FSD
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center gap-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 px-8 py-3.5 text-sm font-semibold text-slate-700 hover:bg-white hover:border-slate-300 hover:text-slate-900 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
          >
            View Documents
            <ChevronRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
