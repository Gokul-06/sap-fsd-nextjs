"use client";

import type { AgentProgressEvent, AgentStatus } from "@/lib/types";
import {
  Brain,
  FileText,
  Layers,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

interface TeamProgressProps {
  progress: AgentProgressEvent | null;
}

const SPECIALIST_ICONS = [FileText, Layers, ShieldCheck, ClipboardList];

function StatusIcon({ status }: { status: AgentStatus }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (status === "running") {
    return <Loader2 className="h-4 w-4 text-[#0091DA] animate-spin" />;
  }
  if (status === "failed") {
    return <div className="h-4 w-4 rounded-full bg-red-400" />;
  }
  return <div className="h-4 w-4 rounded-full border-2 border-slate-200" />;
}

function PhaseConnector({ active }: { active: boolean }) {
  return (
    <div className="flex justify-center py-1">
      <div
        className={`w-0.5 h-6 transition-colors duration-700 ${
          active ? "bg-emerald-400" : "bg-slate-200"
        }`}
      />
    </div>
  );
}

function getPhaseStatus(
  progress: AgentProgressEvent | null,
  phase: "team-lead" | "specialists" | "quality-review",
): AgentStatus {
  if (!progress) return "pending";

  const phaseOrder = ["team-lead", "specialists", "quality-review"];
  const currentIdx = phaseOrder.indexOf(progress.phase);
  const targetIdx = phaseOrder.indexOf(phase);

  if (progress.phase === "complete" || progress.phase === "error") return "completed";
  if (currentIdx > targetIdx) return "completed";
  if (currentIdx === targetIdx) return progress.status;
  return "pending";
}

export function TeamProgress({ progress }: TeamProgressProps) {
  const tlStatus = getPhaseStatus(progress, "team-lead");
  const specStatus = getPhaseStatus(progress, "specialists");
  const qrStatus = getPhaseStatus(progress, "quality-review");

  // Compute overall progress percentage
  let pct = 0;
  if (tlStatus === "running") pct = 10;
  if (tlStatus === "completed") pct = 25;
  if (specStatus === "running") {
    const doneCount = progress?.agents?.filter((a) => a.status === "completed").length || 0;
    pct = 25 + (doneCount / 4) * 45;
  }
  if (specStatus === "completed") pct = 70;
  if (qrStatus === "running") pct = 80;
  if (qrStatus === "completed") pct = 95;
  if (progress?.phase === "complete") pct = 100;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#0091DA]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute w-16 h-16 mx-auto rounded-full bg-[#0091DA]/10 animate-ping opacity-20" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#0091DA] flex items-center justify-center shadow-lg">
              <Sparkles className="h-7 w-7 text-white animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#1B2A4A] mb-1">
            Agent Team Working
          </h3>
          <p className="text-sm text-muted-foreground">
            6 AI agents coordinating to build your FSD
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto mb-8">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0091DA] to-emerald-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground/60 mt-1.5 text-center">
            {Math.round(pct)}% complete
          </p>
        </div>

        {/* ─── Phase 1: Team Lead ─── */}
        <div
          className={`rounded-xl border-2 p-4 transition-all duration-500 ${
            tlStatus === "running"
              ? "border-[#0091DA] bg-[#0091DA]/5 shadow-md shadow-[#0091DA]/10"
              : tlStatus === "completed"
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                tlStatus === "completed"
                  ? "bg-emerald-100"
                  : tlStatus === "running"
                  ? "bg-[#0091DA]/10"
                  : "bg-slate-100"
              }`}
            >
              <Brain
                className={`h-5 w-5 ${
                  tlStatus === "completed"
                    ? "text-emerald-600"
                    : tlStatus === "running"
                    ? "text-[#0091DA]"
                    : "text-slate-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">
                  Phase 1
                </span>
                <span className="text-sm font-medium text-[#1B2A4A]">
                  Team Lead
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {tlStatus === "running"
                  ? "Analyzing requirements, building shared context..."
                  : tlStatus === "completed"
                  ? "Shared brief ready — terminology, process steps, decisions"
                  : "Waiting to start..."}
              </p>
            </div>
            <StatusIcon status={tlStatus} />
          </div>
        </div>

        <PhaseConnector active={tlStatus === "completed"} />

        {/* ─── Phase 2: Specialists ─── */}
        <div
          className={`rounded-xl border-2 p-4 transition-all duration-500 ${
            specStatus === "running"
              ? "border-[#0091DA] bg-[#0091DA]/5 shadow-md shadow-[#0091DA]/10"
              : specStatus === "completed"
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                specStatus === "completed"
                  ? "bg-emerald-100"
                  : specStatus === "running"
                  ? "bg-[#0091DA]/10"
                  : "bg-slate-100"
              }`}
            >
              <Layers
                className={`h-5 w-5 ${
                  specStatus === "completed"
                    ? "text-emerald-600"
                    : specStatus === "running"
                    ? "text-[#0091DA]"
                    : "text-slate-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">
                  Phase 2
                </span>
                <span className="text-sm font-medium text-[#1B2A4A]">
                  Specialist Agents
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {specStatus === "running"
                  ? "4 specialists working in parallel with shared context..."
                  : specStatus === "completed"
                  ? "All specialists completed"
                  : "Waiting for Team Lead..."}
              </p>
            </div>
            <StatusIcon status={specStatus} />
          </div>

          {/* Specialist agent cards — 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {(progress?.agents || [
              { name: "Business Analyst", role: "Executive Summary", status: "pending" as AgentStatus },
              { name: "Solution Architect", role: "Solution Design", status: "pending" as AgentStatus },
              { name: "Technical Consultant", role: "Error Handling", status: "pending" as AgentStatus },
              { name: "Project Manager", role: "Migration & Cutover", status: "pending" as AgentStatus },
            ]).map((agent, i) => {
              const Icon = SPECIALIST_ICONS[i] || FileText;
              return (
                <div
                  key={agent.name}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-300 ${
                    agent.status === "completed"
                      ? "bg-emerald-50 text-emerald-700"
                      : agent.status === "running"
                      ? "bg-[#0091DA]/5 text-[#0091DA]"
                      : agent.status === "failed"
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{agent.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{agent.role}</div>
                  </div>
                  <StatusIcon status={agent.status} />
                </div>
              );
            })}
          </div>
        </div>

        <PhaseConnector active={specStatus === "completed"} />

        {/* ─── Phase 3: Quality Review ─── */}
        <div
          className={`rounded-xl border-2 p-4 transition-all duration-500 ${
            qrStatus === "running"
              ? "border-[#0091DA] bg-[#0091DA]/5 shadow-md shadow-[#0091DA]/10"
              : qrStatus === "completed"
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                qrStatus === "completed"
                  ? "bg-emerald-100"
                  : qrStatus === "running"
                  ? "bg-[#0091DA]/10"
                  : "bg-slate-100"
              }`}
            >
              <Search
                className={`h-5 w-5 ${
                  qrStatus === "completed"
                    ? "text-emerald-600"
                    : qrStatus === "running"
                    ? "text-[#0091DA]"
                    : "text-slate-400"
                }`}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wide">
                  Phase 3
                </span>
                <span className="text-sm font-medium text-[#1B2A4A]">
                  Quality Review
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {qrStatus === "running"
                  ? "Checking consistency, terminology, cross-references..."
                  : qrStatus === "completed"
                  ? "All sections reviewed and corrected"
                  : "Waiting for specialists..."}
              </p>
            </div>
            <StatusIcon status={qrStatus} />
          </div>
        </div>
      </div>
    </div>
  );
}
