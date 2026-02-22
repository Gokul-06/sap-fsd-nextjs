"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "14", sub: "sections", label: "Complete FSD Coverage" },
  { value: "6+", sub: "SAP modules", label: "MM · SD · FI · CO · PP · QM" },
  { value: "<30s", sub: "generation", label: "Enterprise-Grade Speed" },
  { value: "100%", sub: "AI-powered", label: "WE-AI Intelligence" },
];

export function AlreadyKnewSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <h2 className="text-4xl sm:text-5xl font-black text-[#1B2A4A] leading-tight">
            Already knew<span className="text-[#0091DA]">?</span>
          </h2>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#1B2A4A] hover:text-[#0091DA] transition-colors group"
          >
            Try it now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Stats grid with blue vertical separators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
          {stats.map((stat, i) => (
            <div
              key={stat.value}
              className="relative animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Blue vertical line — Westernacher style */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-[#0091DA]" />
              <div className="pl-5">
                <p className="text-3xl sm:text-4xl font-black text-[#1B2A4A]">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-[#1B2A4A]/70 mt-0.5">
                  {stat.sub}
                </p>
                <p className="text-xs text-muted-foreground mt-2 hidden sm:block">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
