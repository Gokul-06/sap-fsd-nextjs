"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, ScrollText, ArrowRight, Sparkles } from "lucide-react";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/stagger-container";

const easeOut = [0.25, 0.4, 0.25, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easeOut },
  }),
};

const hubCards = [
  {
    title: "FSD Generator",
    description:
      "Generate Functional Specification Documents using AI based on business requirements.",
    href: "/generate",
    icon: FileText,
    iconColor: "text-sky-500",
    iconBg: "bg-sky-50",
    hoverGradient:
      "radial-gradient(circle at top right, rgba(14,165,233,0.08) 0%, transparent 60%)",
    accentColor: "via-sky-400/50",
  },
  {
    title: "Proposal Generator",
    description:
      "Create consulting proposals quickly using AI-assisted templates and structured client information.",
    href: "/proposal",
    icon: ScrollText,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    hoverGradient:
      "radial-gradient(circle at top right, rgba(139,92,246,0.08) 0%, transparent 60%)",
    accentColor: "via-violet-400/50",
  },
];

export default function HomePage() {
  return (
    <div className="relative z-10">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 pt-24 pb-8 sm:px-6 sm:pt-32 sm:pb-12 lg:px-8">
        {/* Background glows */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/25 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-100/30 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-blue-100/20 blur-2xl animate-float-fast" />

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 backdrop-blur-sm border border-sky-200/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-sky-600">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by WE-AI
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            custom={0.1}
            className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl"
          >
            Westernacher AI Agent Hub
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.2}
            className="mx-auto mt-5 max-w-2xl text-lg text-slate-500 leading-relaxed sm:text-xl"
          >
            The future of AI-powered consulting at Westernacher.
          </motion.p>
        </motion.div>
      </section>

      {/* ── Hub Cards ── */}
      <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <StaggerContainer
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            staggerDelay={0.2}
          >
            {hubCards.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title}>
                  <Link href={card.href} className="block group h-full">
                    <motion.div
                      whileHover={{
                        y: -8,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                        },
                      }}
                      className="relative rounded-2xl bg-white/70 backdrop-blur-xl p-8 sm:p-10 border border-white/60 shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 hover:bg-white/90 transition-all duration-500 cursor-pointer overflow-hidden h-full flex flex-col"
                    >
                      {/* Content */}
                      <div className="relative z-10 flex-1 flex flex-col">
                        {/* Icon */}
                        <div
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${card.iconBg} transition-transform duration-300 group-hover:scale-110 mb-6`}
                        >
                          <Icon className={`h-7 w-7 ${card.iconColor}`} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-sky-600 transition-colors duration-300">
                          {card.title}
                        </h2>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6 flex-1">
                          {card.description}
                        </p>

                        {/* Arrow CTA */}
                        <div className="flex items-center gap-2 text-sm font-medium text-sky-500">
                          Get started
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>

                      {/* Bottom accent line */}
                      <div
                        className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-transparent ${card.accentColor} to-transparent`}
                      />

                      {/* Hover radial gradient */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                        style={{ background: card.hoverGradient }}
                      />
                    </motion.div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
