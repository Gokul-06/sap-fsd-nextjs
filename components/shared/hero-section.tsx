"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

const stats = [
  { value: "14", label: "FSD Sections", icon: "doc" },
  { value: "200+", label: "SAP Objects", icon: "cube" },
  { value: "10", label: "SAP Modules", icon: "grid" },
  { value: "<30s", label: "Generation Time", icon: "bolt" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1B2A4A] via-[#1E3258] to-[#2A3F6E] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Zig-zag moving lines */}
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 30 30 L 60 60"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
              <path
                d="M 0 0 L 30 30 L 0 60"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>

        {/* Animated floating orbs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#0091DA]/10 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#0091DA]/8 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-white/5 blur-2xl animate-float-fast" />

        {/* Diagonal lines */}
        <div className="absolute -left-4 top-0 h-full w-[600px] rotate-12 opacity-[0.04]">
          <div className="flex h-full flex-col justify-between">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-px w-full bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        </div>

        {/* Moving dots */}
        <div className="absolute right-0 top-0 h-full w-1/2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20 animate-drift"
              style={{
                top: `${15 + i * 15}%`,
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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-sm border border-white/10 animate-fade-in-up">
          <Sparkles className="h-3.5 w-3.5 text-[#0091DA]" />
          <span className="text-xs font-medium text-white/80 tracking-wide">
            Powered by WE-AI
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl animate-fade-in-up animation-delay-100">
          Generate SAP Specifications
          <span className="block mt-2 bg-gradient-to-r from-[#0091DA] to-[#33A7E4] bg-clip-text text-transparent">
            in Seconds
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60 leading-relaxed animate-fade-in-up animation-delay-200">
          Enterprise-grade functional specification documents for SAP S/4HANA implementations — powered by WE-AI intelligence
        </p>

        {/* Stat Cards */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="group relative rounded-xl bg-white/[0.07] px-4 py-6 backdrop-blur-sm border border-white/[0.08] transition-all duration-300 hover:bg-white/[0.12] hover:border-white/[0.15] hover:scale-105 hover:shadow-lg hover:shadow-[#0091DA]/10 animate-fade-in-up"
              style={{ animationDelay: `${300 + i * 100}ms` }}
            >
              <p className="text-3xl font-bold text-white sm:text-4xl group-hover:text-[#0091DA] transition-colors">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-medium text-white/50 uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#0091DA]/0 to-transparent group-hover:via-[#0091DA]/50 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up animation-delay-700">
          <Link
            href="/generate"
            className="group inline-flex items-center rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-[#1B2A4A] shadow-lg shadow-black/20 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-[#0091DA]/20 hover:scale-105"
          >
            Generate New FSD
            <svg
              className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <Link
            href="/history"
            className="inline-flex items-center rounded-xl border border-white/20 px-8 py-3.5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/30"
          >
            View Documents
          </Link>
        </div>
      </div>
    </section>
  );
}
