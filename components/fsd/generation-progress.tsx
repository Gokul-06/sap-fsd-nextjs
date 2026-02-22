"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

const STEPS = [
  "Analyzing requirements and classifying SAP modules...",
  "Mapping tables, transactions, and Fiori apps...",
  "WE-AI writing executive summary and solution design...",
  "WE-AI generating test scenarios and cutover plan...",
  "Compiling final document...",
];

export function GenerationProgress() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Smooth progress bar
  useEffect(() => {
    const targetProgress = Math.min(((activeStep + 1) / STEPS.length) * 100, 95);
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= targetProgress) return prev;
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [activeStep]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#0091DA]/5 blur-3xl animate-float-slow" />
      </div>

      <div className="relative">
        {/* Animated icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-[#0091DA]/10 animate-ping opacity-20" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-navy to-[#2A3F6E] flex items-center justify-center shadow-lg shadow-navy/20">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-navy mb-2 text-center">
          Generating your FSD
        </h3>
        <p className="text-muted-foreground mb-3 text-center">
          WE-AI is writing 14 professional sections
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-sm mx-auto mb-8">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0091DA] to-[#33A7E4] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground/60 mt-2 text-center">
            {Math.round(progress)}% complete
          </p>
        </div>

        <div className="space-y-3 w-full max-w-md">
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 text-sm transition-all duration-500 rounded-lg px-3 py-2 ${
                  isDone
                    ? "text-wc-success bg-emerald-50/50"
                    : isActive
                    ? "text-[#0091DA] font-medium bg-[#0091DA]/5"
                    : "text-muted-foreground/40"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/20 flex-shrink-0" />
                )}
                {step}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
