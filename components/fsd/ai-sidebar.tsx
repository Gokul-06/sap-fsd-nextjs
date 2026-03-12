"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Bot,
  X,
  MessageSquare,
  Wand2,
  ChevronRight,
} from "lucide-react";

interface AISidebarProps {
  onFieldsFilled: (fields: Record<string, string>) => void;
  onModuleDetected?: (module: string) => void;
  filledCount: number;
  totalFields: number;
  detectedModule?: string;
}

const EXAMPLE_PROMPTS = [
  "End-to-end procure-to-pay with 3-way matching and approval workflows",
  "Order-to-cash process with credit management and billing",
  "Record-to-report with automated journal entries and reconciliation",
  "Plan-to-produce with MRP, capacity planning, and shop floor control",
];

export function AISidebar({
  onFieldsFilled,
  onModuleDetected,
  filledCount,
  totalFields,
  detectedModule,
}: AISidebarProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<Record<string, string> | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleGenerate() {
    if (!input.trim() || input.trim().length < 10) {
      setError("Please describe your requirements in at least 10 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await fetch("/api/ai-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate requirements");
      }

      const data = await res.json();

      if (data.fields) {
        setLastResult(data.fields);
        onFieldsFilled(data.fields);
        setShowExamples(false);

        // Try to detect module from the response
        if (onModuleDetected && data.fields.processScope) {
          const scope = data.fields.processScope.toLowerCase();
          if (scope.includes("procure") || scope.includes("purchase") || scope.includes("mm")) {
            onModuleDetected("MM");
          } else if (scope.includes("sales") || scope.includes("order-to-cash") || scope.includes("sd")) {
            onModuleDetected("SD");
          } else if (scope.includes("financ") || scope.includes("accounting") || scope.includes("fi")) {
            onModuleDetected("FI");
          } else if (scope.includes("controlling") || scope.includes("cost") || scope.includes("co")) {
            onModuleDetected("CO");
          } else if (scope.includes("production") || scope.includes("planning") || scope.includes("pp")) {
            onModuleDetected("PP");
          } else if (scope.includes("warehouse") || scope.includes("ewm")) {
            onModuleDetected("EWM");
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleExampleClick(example: string) {
    setInput(example);
    setShowExamples(false);
    textareaRef.current?.focus();
  }

  const filledSections = lastResult
    ? Object.entries(lastResult).filter(([, v]) => v?.trim()).length
    : 0;

  return (
    <div className="space-y-4">
      {/* AI Header Card */}
      <div className="bg-gradient-to-br from-[#0091DA]/5 via-white to-indigo-50/30 border border-[#0091DA]/15 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-[#0091DA] to-indigo-600 rounded-xl shadow-md">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-[#1B2A4A] text-sm">AI Assistant</h3>
            <p className="text-[11px] text-muted-foreground">
              Describe your process — I&apos;ll structure it
            </p>
          </div>
          {detectedModule && (
            <Badge className="ml-auto bg-[#0091DA]/10 text-[#0091DA] border-[#0091DA]/20 text-[10px]">
              {detectedModule}
            </Badge>
          )}
        </div>

        {/* Input area */}
        <div className="space-y-3">
          <Textarea
            ref={textareaRef}
            placeholder="e.g. We need a procure-to-pay process with 3-way matching, ME21N, MIGO, MIRO transactions, $10K approval threshold..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            rows={4}
            className="resize-none text-sm border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20 bg-white rounded-xl"
            disabled={isLoading}
          />

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !input.trim()}
            className="w-full bg-gradient-to-r from-[#0091DA] to-indigo-600 hover:from-[#0091DA]/90 hover:to-indigo-600/90 text-white shadow-md hover:shadow-lg transition-all rounded-xl h-10"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Fill Requirements
                <span className="text-white/60 text-xs ml-1.5">⌘↵</span>
              </>
            )}
          </Button>
        </div>

        {/* Success feedback */}
        <AnimatePresence>
          {lastResult && filledSections > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/50 rounded-lg px-3 py-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Filled <strong>{filledSections}</strong> sections. Review and edit below.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example prompts */}
      <AnimatePresence>
        {showExamples && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-slate-600">
                  Try an example
                </span>
              </div>
              <div className="space-y-1.5">
                {EXAMPLE_PROMPTS.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left text-xs text-slate-600 hover:text-[#0091DA] hover:bg-[#0091DA]/5 rounded-lg px-3 py-2 transition-all flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-[#0091DA] transition-colors flex-shrink-0" />
                    <span className="line-clamp-1">{example}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-600">Form Progress</span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {filledCount}/{totalFields}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#0091DA] to-emerald-400 rounded-full"
            animate={{ width: `${(filledCount / totalFields) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex items-center gap-1 mt-2">
          {filledCount === totalFields ? (
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              All sections filled — ready to generate!
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              {totalFields - filledCount} section{totalFields - filledCount !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 border border-amber-200/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-semibold text-amber-800">Quick Tips</span>
        </div>
        <ul className="space-y-1.5 text-[11px] text-amber-900/70">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 mt-0.5">•</span>
            Include SAP transaction codes (ME21N, VA01, FB01)
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 mt-0.5">•</span>
            Mention approval thresholds and business rules
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 mt-0.5">•</span>
            Specify cross-module integrations (MM↔FI, SD↔FI)
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-amber-400 mt-0.5">•</span>
            Reference Fiori apps for modern UI requirements
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Mobile floating action button that opens the AI sidebar as a bottom sheet
 */
export function AISidebarFAB({
  onFieldsFilled,
  onModuleDetected,
  filledCount,
  totalFields,
  detectedModule,
}: AISidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB Button - only show on mobile */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-[#0091DA] to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all flex items-center justify-center hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#F0F2F5] rounded-t-3xl max-h-[85vh] overflow-y-auto lg:hidden"
            >
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-slate-300" />
              </div>

              {/* Close button */}
              <div className="flex items-center justify-between px-5 pb-3">
                <h3 className="font-bold text-[#1B2A4A]">AI Assistant</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-8">
                <AISidebar
                  onFieldsFilled={(fields) => {
                    onFieldsFilled(fields);
                    // Close sheet after a delay to show success
                    setTimeout(() => setIsOpen(false), 1500);
                  }}
                  onModuleDetected={onModuleDetected}
                  filledCount={filledCount}
                  totalFields={totalFields}
                  detectedModule={detectedModule}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
