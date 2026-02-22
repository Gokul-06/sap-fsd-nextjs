"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  "Analyzing requirements and classifying SAP modules...",
  "Mapping tables, transactions, and Fiori apps...",
  "Claude AI writing executive summary and solution design...",
  "Claude AI generating test scenarios and cutover plan...",
  "Compiling final document...",
];

export function GenerationProgress() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="loading-ring mb-6" />
      <h3 className="text-xl font-semibold text-navy mb-2">
        Generating your FSD with AI...
      </h3>
      <p className="text-muted-foreground mb-8 text-center">
        Claude AI is writing 14 professional sections — this takes 20-40 seconds
      </p>
      <div className="space-y-3 w-full max-w-md">
        {STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? "text-wc-success"
                  : isActive
                  ? "text-wc-blue font-medium"
                  : "text-muted-foreground/50"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-muted-foreground/30 flex-shrink-0" />
              )}
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
