"use client";

import { motion } from "framer-motion";
import { ScrollText, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut },
  }),
};

export default function ProposalPage() {
  return (
    <div className="relative z-10">
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Background glows */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-violet-100/30 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-purple-100/20 blur-2xl animate-float-fast" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-3xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100/80 backdrop-blur-sm border border-violet-200/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-violet-600">
              <Sparkles className="h-3.5 w-3.5" />
              Coming Soon
            </span>
          </motion.div>

          {/* Icon */}
          <motion.div variants={fadeUp} custom={0.1} className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-violet-50 border border-violet-100/60">
              <ScrollText className="h-10 w-10 text-violet-500" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            custom={0.2}
            className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl"
          >
            Proposal Generator
            <span className="block mt-2 bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              Coming Soon
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            custom={0.3}
            className="mx-auto mt-6 max-w-xl text-lg text-slate-500 leading-relaxed"
          >
            Create consulting proposals quickly using AI-assisted templates and
            structured client information.
          </motion.p>

          {/* Info card */}
          <motion.div variants={fadeUp} custom={0.4} className="mt-12">
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-violet-100/20 p-8 max-w-md mx-auto">
              <p className="text-sm text-slate-500 leading-relaxed">
                We&apos;re building an AI-powered proposal generator that will
                help consulting teams create professional proposals in minutes.
                Stay tuned for updates.
              </p>
            </div>
          </motion.div>

          {/* Back link */}
          <motion.div variants={fadeUp} custom={0.5} className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Agent Hub
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
