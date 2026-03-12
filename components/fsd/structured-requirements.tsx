"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  ClipboardList,
  ShieldCheck,
  ArrowRightLeft,
  BarChart3,
  Lock,
  Database,
  ChevronDown,
  Sparkles,
  FileText,
  Check,
} from "lucide-react";

interface StructuredField {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  hint: string;
  required?: boolean;
  rows?: number;
}

const FIELDS: StructuredField[] = [
  {
    id: "processScope",
    label: "Process Scope",
    icon: <GitBranch className="h-4 w-4" />,
    placeholder:
      "e.g. End-to-end Procure-to-Pay process covering purchase requisition creation, approval workflow, purchase order generation, goods receipt, invoice verification, and payment processing.",
    hint: "Define the end-to-end business process this FSD covers",
    required: true,
    rows: 3,
  },
  {
    id: "transactions",
    label: "SAP Transactions / Fiori Apps",
    icon: <ClipboardList className="h-4 w-4" />,
    placeholder:
      "e.g. ME21N (Create PO), ME51N (Create PR), MIGO (Goods Receipt), MIRO (Invoice Verification), F110 (Payment Run), Fiori App: Manage Purchase Orders (F0842)",
    hint: "List SAP transaction codes and Fiori apps involved",
    rows: 2,
  },
  {
    id: "businessRules",
    label: "Business Rules & Validations",
    icon: <ShieldCheck className="h-4 w-4" />,
    placeholder:
      "e.g.\n• POs above $10,000 require manager approval\n• 3-way match mandatory for all invoices\n• Tolerance group for price variance: 5%\n• Vendor must be approved before PO creation",
    hint: "Approval workflows, tolerances, conditions, and validation rules",
    rows: 3,
  },
  {
    id: "integrations",
    label: "Integrations & Interfaces",
    icon: <ArrowRightLeft className="h-4 w-4" />,
    placeholder:
      "e.g.\n• MM → FI: Automatic accounting entries on goods receipt\n• MM → CO: Cost center assignment on PR\n• External: Ariba integration for sourcing\n• EDI: Purchase orders sent to vendors via IDoc",
    hint: "Cross-module touchpoints (FI↔MM, SD↔FI) and external system integrations",
    rows: 3,
  },
  {
    id: "reportsAnalytics",
    label: "Reports & Analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    placeholder:
      "e.g.\n• Purchasing spend analysis by vendor/material group\n• Open PO aging report\n• GR/IR reconciliation dashboard\n• KPIs: Order cycle time, on-time delivery rate",
    hint: "Required dashboards, KPIs, custom reports, and Fiori analytical apps",
    rows: 2,
  },
  {
    id: "authorization",
    label: "Authorization & Roles",
    icon: <Lock className="h-4 w-4" />,
    placeholder:
      "e.g.\n• Buyer role: Create/change PRs and POs up to $50K\n• Approver role: Release POs based on value limits\n• Viewer role: Display-only access to purchasing documents",
    hint: "Role-based access requirements and segregation of duties",
    rows: 2,
  },
  {
    id: "dataMigration",
    label: "Data Migration",
    icon: <Database className="h-4 w-4" />,
    placeholder:
      "e.g.\n• Vendor master records: ~5,000 records from legacy ECC\n• Open purchase orders: ~1,200 records\n• Material master: ~15,000 records\n• Source lists and info records",
    hint: "Legacy data objects, volumes, and migration approach",
    rows: 2,
  },
];

interface StructuredRequirementsProps {
  value: string;
  onChange: (combined: string) => void;
  onTemplateAppliedChange?: (applied: boolean) => void;
  activeFieldId?: string | null;
}

function parseExistingRequirements(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!text) return fields;

  const sectionMap: Record<string, string> = {
    "PROCESS SCOPE": "processScope",
    "SAP TRANSACTIONS / FIORI APPS": "transactions",
    "BUSINESS RULES & VALIDATIONS": "businessRules",
    "INTEGRATIONS & INTERFACES": "integrations",
    "REPORTS & ANALYTICS": "reportsAnalytics",
    "AUTHORIZATION & ROLES": "authorization",
    "DATA MIGRATION": "dataMigration",
  };

  let currentField: string | null = null;
  const lines = text.split("\n");

  for (const line of lines) {
    const headerMatch = line.match(/^## (.+)$/);
    if (headerMatch) {
      const key = sectionMap[headerMatch[1].toUpperCase()];
      if (key) {
        currentField = key;
        fields[currentField] = "";
        continue;
      }
    }
    if (currentField && line.trim() !== "") {
      fields[currentField] = fields[currentField]
        ? `${fields[currentField]}\n${line}`
        : line;
    }
  }

  if (Object.keys(fields).length === 0 && text.trim()) {
    fields.processScope = text.trim();
  }

  return fields;
}

function combineFields(fieldValues: Record<string, string>): string {
  const parts: string[] = [];

  const labels: Record<string, string> = {
    processScope: "Process Scope",
    transactions: "SAP Transactions / Fiori Apps",
    businessRules: "Business Rules & Validations",
    integrations: "Integrations & Interfaces",
    reportsAnalytics: "Reports & Analytics",
    authorization: "Authorization & Roles",
    dataMigration: "Data Migration",
  };

  for (const field of FIELDS) {
    const val = fieldValues[field.id]?.trim();
    if (val) {
      parts.push(`## ${labels[field.id]}\n${val}`);
    }
  }

  return parts.join("\n\n");
}

export { FIELDS as REQUIREMENT_FIELDS };

export function StructuredRequirements({
  value,
  onChange,
  onTemplateAppliedChange,
  activeFieldId,
}: StructuredRequirementsProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    parseExistingRequirements(value)
  );
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(["processScope"])
  );
  const [mode, setMode] = useState<"structured" | "freeform">("structured");
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  // Sync from external value changes (e.g., AI sidebar filling fields)
  useEffect(() => {
    if (value) {
      const parsed = parseExistingRequirements(value);
      const currentCombined = combineFields(fieldValues);
      // Only update if the external value is genuinely different
      if (value !== currentCombined) {
        setFieldValues(parsed);
        // Auto-expand fields that have content
        const filledIds = Object.entries(parsed)
          .filter(([, v]) => v?.trim())
          .map(([k]) => k);
        if (filledIds.length > 0) {
          setExpandedFields(new Set(filledIds));
        }
      }
    }
  }, [value]);

  // Sync combined output when fields change
  useEffect(() => {
    if (mode === "structured") {
      const combined = combineFields(fieldValues);
      onChange(combined);
    }
  }, [fieldValues, mode]);

  // Handle external active field highlighting
  useEffect(() => {
    if (activeFieldId && FIELDS.some((f) => f.id === activeFieldId)) {
      setExpandedFields((prev) => new Set([...prev, activeFieldId]));
      // Focus the textarea after animation
      setTimeout(() => {
        textareaRefs.current[activeFieldId]?.focus();
      }, 300);
    }
  }, [activeFieldId]);

  const filledCount = FIELDS.filter(
    (f) => fieldValues[f.id]?.trim()
  ).length;
  const totalChars = Object.values(fieldValues).reduce(
    (sum, v) => sum + (v?.length || 0),
    0
  );

  function updateField(id: string, val: string) {
    setFieldValues((prev) => ({ ...prev, [id]: val }));
    onTemplateAppliedChange?.(false);
  }

  function toggleExpand(id: string) {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpandedFields(new Set(FIELDS.map((f) => f.id)));
  }

  function collapseAll() {
    setExpandedFields(new Set());
  }

  // Get border color class based on state
  function getBorderColor(fieldId: string, isExpanded: boolean, hasContent: boolean) {
    if (hasContent) return "border-l-emerald-400";
    if (isExpanded) return "border-l-[#0091DA]";
    return "border-l-slate-200";
  }

  return (
    <div className="space-y-3">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#1B2A4A]">
          Business Requirements <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-2">
          {/* Stats */}
          <span className="text-xs text-muted-foreground">
            {filledCount}/{FIELDS.length} sections · {totalChars} chars
          </span>

          {/* Mode toggle */}
          <div className="flex items-center bg-[#0091DA]/[0.06] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setMode("structured")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                mode === "structured"
                  ? "bg-white text-[#1B2A4A] shadow-sm"
                  : "text-muted-foreground hover:text-[#1B2A4A]"
              }`}
            >
              <ClipboardList className="h-3 w-3" />
              Guided
            </button>
            <button
              type="button"
              onClick={() => setMode("freeform")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                mode === "freeform"
                  ? "bg-white text-[#1B2A4A] shadow-sm"
                  : "text-muted-foreground hover:text-[#1B2A4A]"
              }`}
            >
              <FileText className="h-3 w-3" />
              Free-form
            </button>
          </div>
        </div>
      </div>

      {mode === "freeform" ? (
        <div>
          <Textarea
            placeholder={`Paste your business requirements, user stories, or process description here...\n\nExample:\n1. Process Scope: Define the end-to-end business process\n2. Transactions: Reference SAP transactions (ME21N, VA01, FB01...)\n3. Business Rules: Approval workflows, tolerances, validations\n4. Integrations: Cross-module touchpoints (FI↔MM, SD↔FI...)\n5. Reports & Analytics: Required dashboards, KPIs, Fiori apps\n6. Authorization: Role-based access requirements\n7. Data Migration: Legacy data objects to migrate`}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              onTemplateAppliedChange?.(false);
            }}
            className="min-h-[220px] resize-y font-mono text-sm border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Expand/Collapse controls */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-[10px] text-[#0091DA] hover:underline"
            >
              Expand all
            </button>
            <span className="text-[10px] text-muted-foreground">·</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-[10px] text-[#0091DA] hover:underline"
            >
              Collapse all
            </button>
          </div>

          {FIELDS.map((field, index) => {
            const isExpanded = expandedFields.has(field.id);
            const hasContent = !!fieldValues[field.id]?.trim();
            const charCount = fieldValues[field.id]?.length || 0;
            const borderColor = getBorderColor(field.id, isExpanded, hasContent);

            return (
              <div
                key={field.id}
                className={`border rounded-xl border-l-[3px] transition-all duration-300 overflow-hidden ${borderColor} ${
                  isExpanded
                    ? "bg-white shadow-sm ring-1 ring-[#0091DA]/10"
                    : hasContent
                    ? "bg-emerald-50/30 hover:bg-emerald-50/50"
                    : "bg-white hover:bg-slate-50/80"
                }`}
              >
                {/* Field header */}
                <button
                  type="button"
                  onClick={() => toggleExpand(field.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors duration-200 ${
                      hasContent
                        ? "bg-emerald-100 text-emerald-600"
                        : isExpanded
                        ? "bg-[#0091DA]/15 text-[#0091DA]"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold transition-colors ${
                        isExpanded ? "text-[#1B2A4A]" : "text-slate-700"
                      }`}>
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-destructive text-xs">*</span>
                      )}
                      {hasContent && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-emerald-600" />
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium tabular-nums">
                            {charCount} chars
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {field.hint}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                </button>

                {/* Expandable content with smooth animation */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0">
                        <Textarea
                          ref={(el) => { textareaRefs.current[field.id] = el; }}
                          placeholder={field.placeholder}
                          value={fieldValues[field.id] || ""}
                          onChange={(e) => updateField(field.id, e.target.value)}
                          rows={field.rows || 3}
                          className="resize-y text-sm border-slate-200 focus:border-[#0091DA] focus:ring-[#0091DA]/20 bg-slate-50/50 rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Progress bar */}
          <div className="pt-1">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0091DA] to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(filledCount / FIELDS.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                {filledCount}/{FIELDS.length}
              </span>
            </div>
          </div>

          {/* AI Tip */}
          <div className="flex items-center gap-2 text-xs text-[#0091DA] bg-[#0091DA]/[0.04] border border-[#0091DA]/10 rounded-lg px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Fill in as many sections as you can — the more detail you provide,
              the richer your generated FSD will be. Only Process Scope is required.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
