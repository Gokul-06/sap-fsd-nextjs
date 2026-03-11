"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  ClipboardList,
  ShieldCheck,
  ArrowRightLeft,
  BarChart3,
  Lock,
  Database,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
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
}

function parseExistingRequirements(text: string): Record<string, string> {
  const fields: Record<string, string> = {};
  if (!text) return fields;

  // Try to parse structured format back
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

  // If nothing was parsed (plain text requirements), put everything in processScope
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

export function StructuredRequirements({
  value,
  onChange,
  onTemplateAppliedChange,
}: StructuredRequirementsProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    parseExistingRequirements(value)
  );
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(["processScope"])
  );
  const [mode, setMode] = useState<"structured" | "freeform">("structured");

  // Sync combined output when fields change
  useEffect(() => {
    if (mode === "structured") {
      const combined = combineFields(fieldValues);
      onChange(combined);
    }
  }, [fieldValues, mode]);

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
        /* Free-form textarea (original behavior) */
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
        /* Structured guided fields */
        <div className="space-y-2">
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

          {FIELDS.map((field) => {
            const isExpanded = expandedFields.has(field.id);
            const hasContent = !!fieldValues[field.id]?.trim();

            return (
              <div
                key={field.id}
                className={`border rounded-lg transition-all duration-200 ${
                  hasContent
                    ? "border-emerald-200/80 bg-emerald-50/30"
                    : "border-[#0091DA]/15 bg-white"
                }`}
              >
                {/* Field header — always visible, clickable */}
                <button
                  type="button"
                  onClick={() => toggleExpand(field.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#0091DA]/[0.02] transition-colors rounded-lg"
                >
                  <div
                    className={`p-1.5 rounded-md ${
                      hasContent
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-[#0091DA]/10 text-[#0091DA]"
                    }`}
                  >
                    {field.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#1B2A4A]">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-destructive text-xs">*</span>
                      )}
                      {hasContent && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      {field.hint}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Expandable textarea */}
                {isExpanded && (
                  <div className="px-4 pb-3 pt-0">
                    <Textarea
                      placeholder={field.placeholder}
                      value={fieldValues[field.id] || ""}
                      onChange={(e) => updateField(field.id, e.target.value)}
                      rows={field.rows || 3}
                      className="resize-y text-sm border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20 bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}

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
