"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Lightbulb, Target, CheckSquare } from "lucide-react";

const tips = [
  {
    icon: Target,
    title: "Discover Phase",
    color: "text-blue-600",
    bg: "bg-blue-50",
    content:
      "Start with high-level business requirements: pain points, desired outcomes, and KPIs. Focus on WHAT the business needs, not HOW the system should work.",
  },
  {
    icon: BookOpen,
    title: "Explore Phase",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    content:
      "Map requirements to SAP Fit-to-Standard workshops. Include transaction codes (e.g., ME21N, VA01), Fiori apps, and existing business rules that must be preserved.",
  },
  {
    icon: Lightbulb,
    title: "Realize Phase",
    color: "text-amber-600",
    bg: "bg-amber-50",
    content:
      "Detail configuration requirements: condition records, output types, number ranges, authorization roles, workflow approvals, enhancement spots, and custom reports.",
  },
  {
    icon: CheckSquare,
    title: "Deploy Phase",
    color: "text-purple-600",
    bg: "bg-purple-50",
    content:
      "Include cutover plan items: data migration objects, test scenarios (unit + integration), training needs, go-live checklist, and hypercare support scope.",
  },
];

export function MethodologyTips() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[#0091DA]/15 bg-gradient-to-br from-[#0091DA]/[0.03] to-transparent overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0091DA]/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#0091DA]" />
          <span className="text-sm font-semibold text-[#1B2A4A]">
            SAP Activate Methodology Guide
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0091DA]/10 text-[#0091DA] font-medium">
            Tips
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in-up">
          <p className="text-xs text-muted-foreground">
            Write better requirements by following the SAP Activate methodology phases:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className={`rounded-lg ${tip.bg} p-3 border border-transparent hover:border-current/10 transition-colors`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`h-3.5 w-3.5 ${tip.color}`} />
                    <p className={`text-xs font-semibold ${tip.color}`}>
                      {tip.title}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
            WE-AI automatically structures your input into a 14-section FSD following SAP best practices
          </p>
        </div>
      )}
    </div>
  );
}
