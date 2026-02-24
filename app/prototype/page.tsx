"use client";

import { useState } from "react";

// ─── Westernacher Brand Tokens ───
const colors = {
  navy: "#1B2A4A",
  blue: "#0091DA",
  blueLight: "#E8F4FD",
  bg: "#F0F2F5",
  white: "#FFFFFF",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  slate: "#64748B",
  slateLight: "#94A3B8",
};

type Screen =
  | "login"
  | "dashboard"
  | "create-project"
  | "project-view"
  | "phase-proposal"
  | "phase-prepare"
  | "phase-discover"
  | "phase-explore"
  | "phase-realize"
  | "phase-deploy";

export default function PrototypePage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Prototype Navigation Bar */}
      <div className="bg-[#1B2A4A] text-white px-6 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#0091DA]">🎨 FIGMA PROTOTYPE</span>
          <span className="text-white/60">|</span>
          <span className="text-white/80">WE-AI Implementation Accelerator</span>
        </div>
        <div className="flex items-center gap-2">
          {(
            [
              ["login", "Login"],
              ["dashboard", "Dashboard"],
              ["create-project", "Create Project"],
              ["project-view", "Project View"],
            ] as [Screen, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setScreen(key)}
              className={`px-3 py-1 rounded-full transition-all ${
                screen === key
                  ? "bg-[#0091DA] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: LOGIN                                */}
      {/* ════════════════════════════════════════════ */}
      {screen === "login" && (
        <div className="min-h-[calc(100vh-36px)] flex items-center justify-center bg-gradient-to-br from-[#1B2A4A] to-[#0a1628]">
          <div className="w-full max-w-md">
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="text-3xl font-bold text-white mb-1">Westernacher</div>
              <div className="text-sm text-[#0091DA] tracking-widest uppercase">
                Nonstop Innovation
              </div>
            </div>

            {/* Login card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Welcome back</h2>
              <p className="text-sm text-slate-500 mb-6">
                Sign in to WE-AI Implementation Accelerator
              </p>

              {/* SSO Button */}
              <button className="w-full flex items-center justify-center gap-3 bg-[#0091DA] text-white rounded-xl py-3.5 font-semibold hover:bg-[#0081c4] transition-all mb-4">
                <svg className="w-5 h-5" viewBox="0 0 23 23" fill="white">
                  <path d="M0 0h10.9v10.9H0zM12.1 0H23v10.9H12.1zM0 12.1h10.9V23H0zM12.1 12.1H23V23H12.1z" />
                </svg>
                Sign in with Microsoft
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Email/Password */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">
                    Email
                  </label>
                  <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-400 bg-slate-50">
                    gokul@westernacher.com
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">
                    Password
                  </label>
                  <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-400 bg-slate-50">
                    ••••••••••
                  </div>
                </div>
                <button
                  onClick={() => setScreen("dashboard")}
                  className="w-full bg-[#1B2A4A] text-white rounded-xl py-3 font-semibold hover:bg-[#243558] transition-all"
                >
                  Sign In
                </button>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Protected by Westernacher Enterprise Security
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: PROJECT DASHBOARD                    */}
      {/* ════════════════════════════════════════════ */}
      {screen === "dashboard" && (
        <div>
          {/* App Header */}
          <div className="bg-white border-b border-slate-200 px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#1B2A4A]">Westernacher</span>
                <span className="text-xs text-slate-400 tracking-widest uppercase">
                  Nonstop Innovation
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-[#0091DA] font-semibold border-b-2 border-[#0091DA] pb-1">
                  Projects
                </span>
                <span className="text-slate-500 hover:text-[#1B2A4A] cursor-pointer">
                  Templates
                </span>
                <span className="text-slate-500 hover:text-[#1B2A4A] cursor-pointer">
                  Team
                </span>
                <span className="text-slate-500 hover:text-[#1B2A4A] cursor-pointer">
                  Analytics
                </span>
                <div className="w-8 h-8 rounded-full bg-[#0091DA] text-white flex items-center justify-center text-xs font-bold">
                  GP
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Welcome + Stats */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Good afternoon, Gokul 👋</h1>
                <p className="text-slate-500 mt-1">
                  3 active projects · 2 pending reviews
                </p>
              </div>
              <button
                onClick={() => setScreen("create-project")}
                className="bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
              >
                <span className="text-lg">+</span> New Project
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Active Projects", value: "3", icon: "📁", color: "#0091DA" },
                { label: "Documents Generated", value: "24", icon: "📄", color: "#10B981" },
                { label: "Agent Team Runs", value: "8", icon: "🤖", color: "#8B5CF6" },
                { label: "Team Members", value: "6", icon: "👥", color: "#F59E0B" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{stat.icon}</span>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: stat.color + "15", color: stat.color }}
                    >
                      This month
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-[#1B2A4A]">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Project Cards */}
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Your Projects</h2>
            <div className="space-y-4">
              {[
                {
                  name: "S/4HANA Migration — Duni Group",
                  client: "Duni Group",
                  modules: ["MM", "SD", "FI"],
                  phase: "Explore",
                  phaseNum: 3,
                  progress: 50,
                  team: ["GP", "WL", "FS"],
                  updated: "2 hours ago",
                },
                {
                  name: "EWM Implementation — Green Token",
                  client: "Green Token",
                  modules: ["EWM", "MM"],
                  phase: "Prepare",
                  phaseNum: 1,
                  progress: 20,
                  team: ["GP", "AK"],
                  updated: "1 day ago",
                },
                {
                  name: "FI/CO Transformation — Bank Corp",
                  client: "Bank Corp",
                  modules: ["FI", "CO"],
                  phase: "Proposal",
                  phaseNum: 0,
                  progress: 8,
                  team: ["GP"],
                  updated: "3 days ago",
                },
              ].map((project, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setActivePhase(project.phaseNum);
                    setScreen("project-view");
                  }}
                  className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0091DA]/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-bold text-[#1B2A4A] group-hover:text-[#0091DA] transition-colors">
                          {project.name}
                        </h3>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0091DA]/10 text-[#0091DA]">
                          Phase {project.phaseNum}: {project.phase}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Client: {project.client}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          {project.modules.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded font-medium"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                        <span>·</span>
                        <span>Updated {project.updated}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Team avatars */}
                      <div className="flex -space-x-2">
                        {project.team.map((member, j) => (
                          <div
                            key={j}
                            className="w-7 h-7 rounded-full bg-[#0091DA] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                      {/* Progress */}
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0091DA] rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-[#0091DA] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: CREATE PROJECT                       */}
      {/* ════════════════════════════════════════════ */}
      {screen === "create-project" && (
        <div className="max-w-3xl mx-auto px-8 py-12">
          <button
            onClick={() => setScreen("dashboard")}
            className="text-sm text-slate-500 hover:text-[#0091DA] mb-6 flex items-center gap-1"
          >
            ← Back to Dashboard
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#0091DA]/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1B2A4A]">Create New Project</h1>
                <p className="text-sm text-slate-500">Set up a new SAP implementation project</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Project Name */}
              <div>
                <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#1B2A4A] bg-white">
                  S/4HANA Migration — Duni Group
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">
                    Client Name
                  </label>
                  <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#1B2A4A]">
                    Duni Group
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">
                    Industry
                  </label>
                  <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-500 flex items-center justify-between">
                    <span>Manufacturing</span>
                    <span className="text-slate-300">▾</span>
                  </div>
                </div>
              </div>

              {/* SAP Modules */}
              <div>
                <label className="text-sm font-medium text-[#1B2A4A] block mb-2">
                  SAP Modules in Scope
                </label>
                <div className="flex flex-wrap gap-2">
                  {["MM", "SD", "FI", "CO", "PP", "EWM", "TM", "QM"].map((m) => (
                    <span
                      key={m}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                        ["MM", "SD", "FI"].includes(m)
                          ? "bg-[#0091DA] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div>
                <label className="text-sm font-medium text-[#1B2A4A] block mb-2">
                  Team Members
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { name: "GP", role: "Lead" },
                    { name: "WL", role: "Architect" },
                    { name: "FS", role: "Developer" },
                  ].map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#0091DA] text-white text-[10px] font-bold flex items-center justify-center">
                        {member.name}
                      </div>
                      <span className="text-xs text-slate-600">{member.role}</span>
                      <span className="text-slate-300 cursor-pointer">×</span>
                    </div>
                  ))}
                  <button className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:border-[#0091DA] hover:text-[#0091DA] transition-colors">
                    +
                  </button>
                </div>
              </div>

              {/* Starting Phase */}
              <div>
                <label className="text-sm font-medium text-[#1B2A4A] block mb-2">
                  Starting Phase
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Phase 0: Proposal", desc: "Start from RFP/Proposal" },
                    { label: "Phase 1: Prepare", desc: "SOW already signed" },
                    { label: "Phase 3: Explore", desc: "Jump to FSD generation" },
                  ].map((phase, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        i === 0
                          ? "border-[#0091DA] bg-[#0091DA]/5"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`text-sm font-semibold ${i === 0 ? "text-[#0091DA]" : "text-[#1B2A4A]"}`}>
                        {phase.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{phase.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActivePhase(0);
                  setScreen("project-view");
                }}
                className="w-full bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white rounded-xl py-3.5 font-semibold hover:shadow-lg transition-all"
              >
                Create Project →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: PROJECT VIEW (Phase-by-Phase)        */}
      {/* ════════════════════════════════════════════ */}
      {screen === "project-view" && (
        <div>
          {/* Project Header */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setScreen("dashboard")}
                    className="text-xs text-slate-400 hover:text-[#0091DA] mb-1 flex items-center gap-1"
                  >
                    ← All Projects
                  </button>
                  <h1 className="text-lg font-bold text-[#1B2A4A]">
                    S/4HANA Migration — Duni Group
                  </h1>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Client: Duni Group</span>
                    <span>·</span>
                    <div className="flex gap-1">
                      {["MM", "SD", "FI"].map((m) => (
                        <span key={m} className="px-1.5 py-0.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                    <span>·</span>
                    <span>Team: GP, WL, FS</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <div className="text-xs text-slate-500">Overall Progress</div>
                    <div className="text-lg font-bold text-[#0091DA]">50%</div>
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200">
                    Settings
                  </button>
                  <button className="px-4 py-2 bg-[#0091DA] text-white rounded-lg text-sm hover:bg-[#0081c4]">
                    Export All
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-[280px_1fr] gap-8">
              {/* Left: Phase Navigation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Implementation Phases
                </h3>
                {[
                  { num: 0, name: "Proposal", icon: "📋", status: "complete" },
                  { num: 1, name: "Prepare", icon: "📐", status: "complete" },
                  { num: 2, name: "Discover", icon: "🔍", status: "complete" },
                  { num: 3, name: "Explore", icon: "🧩", status: "active" },
                  { num: 4, name: "Realize", icon: "⚙️", status: "locked" },
                  { num: 5, name: "Deploy", icon: "🚀", status: "locked" },
                ].map((phase) => {
                  const isComplete = phase.status === "complete";
                  const isActive = phase.status === "active";
                  const isLocked = phase.status === "locked";

                  return (
                    <button
                      key={phase.num}
                      onClick={() => !isLocked && setActivePhase(phase.num)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        activePhase === phase.num
                          ? "bg-[#0091DA] text-white shadow-md"
                          : isLocked
                          ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                          : isComplete
                          ? "bg-emerald-50 text-[#1B2A4A] hover:bg-emerald-100"
                          : "bg-white text-[#1B2A4A] hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <span className="text-lg">{phase.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          Phase {phase.num}: {phase.name}
                        </div>
                        <div className={`text-[10px] ${activePhase === phase.num ? "text-white/70" : "text-slate-400"}`}>
                          {isComplete && "✅ Completed"}
                          {isActive && "🔵 In Progress"}
                          {isLocked && "🔒 Locked"}
                        </div>
                      </div>
                      {isLocked && (
                        <span className="text-slate-300 text-lg">🔒</span>
                      )}
                    </button>
                  );
                })}

                {/* Progress line */}
                <div className="mt-6 px-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Project Progress</span>
                    <span className="font-semibold text-[#0091DA]">50%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0091DA] to-[#10B981] rounded-full w-1/2" />
                  </div>
                </div>
              </div>

              {/* Right: Phase Content */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Phase Header */}
                <div className="bg-gradient-to-r from-[#0091DA]/10 to-[#0091DA]/5 px-8 py-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#0091DA] font-semibold uppercase tracking-wider mb-1">
                        Phase {activePhase}
                      </div>
                      <h2 className="text-xl font-bold text-[#1B2A4A]">
                        {
                          ["Proposal Generation", "Prepare", "Discover", "Explore — FSD Generation", "Realize", "Deploy"][
                            activePhase
                          ]
                        }
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        {
                          [
                            "Analyze RFP documents and generate project proposals",
                            "Set up project governance, charter, and risk assessment",
                            "Assess fit-to-standard and map current processes",
                            "Generate Functional Specification Documents with AI Agent Teams",
                            "Build test scripts, configuration guides, and technical specs",
                            "Prepare training materials, cutover plans, and go-live docs",
                          ][activePhase]
                        }
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        activePhase < 3
                          ? "bg-emerald-100 text-emerald-700"
                          : activePhase === 3
                          ? "bg-[#0091DA]/10 text-[#0091DA]"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {activePhase < 3 ? "✅ Complete" : activePhase === 3 ? "🔵 In Progress" : "🔒 Locked"}
                    </span>
                  </div>
                </div>

                {/* Phase Artifacts */}
                <div className="p-8">
                  {/* Phase 0: Proposal */}
                  {activePhase === 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "RFP Analysis", status: "complete", desc: "Extracted 47 requirements from client RFP" },
                          { name: "Proposal Document", status: "complete", desc: "40-page proposal with scope, timeline, team" },
                          { name: "Effort Estimation", status: "complete", desc: "1,240 person-days across 3 modules" },
                          { name: "Risk Assessment", status: "complete", desc: "12 risks identified, 4 high priority" },
                        ].map((artifact, i) => (
                          <div key={i} className="p-4 rounded-xl border border-slate-200 hover:border-[#0091DA]/30 cursor-pointer transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1B2A4A]">{artifact.name}</span>
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Done</span>
                            </div>
                            <p className="text-xs text-slate-500">{artifact.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center pt-4">
                        <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold">
                          📄 View Proposal Document
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Phase 3: Explore (Current) */}
                  {activePhase === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "MM — Procurement FSD", status: "complete", desc: "Generated with Agent Teams · 14 sections" },
                          { name: "SD — Sales FSD", status: "generating", desc: "Agent Team running: Phase 2 — Specialists..." },
                          { name: "FI — Accounting FSD", status: "pending", desc: "Queued · Will start after SD completes" },
                          { name: "Cross-Module Integration", status: "locked", desc: "Requires all module FSDs to complete" },
                        ].map((artifact, i) => (
                          <div key={i} className="p-4 rounded-xl border border-slate-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1B2A4A]">{artifact.name}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  artifact.status === "complete"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : artifact.status === "generating"
                                    ? "bg-[#0091DA]/10 text-[#0091DA]"
                                    : artifact.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {artifact.status === "complete" && "✅ Done"}
                                {artifact.status === "generating" && "⏳ Generating..."}
                                {artifact.status === "pending" && "⏸ Pending"}
                                {artifact.status === "locked" && "🔒 Locked"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{artifact.desc}</p>
                            {artifact.status === "generating" && (
                              <div className="mt-3">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#0091DA] rounded-full w-2/3 animate-pulse" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-4 justify-center">
                        <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold">
                          🤖 Generate Next FSD with Agent Teams
                        </button>
                        <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm">
                          📄 View Completed FSDs
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Other phases: generic artifacts */}
                  {![0, 3].includes(activePhase) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {(activePhase === 1
                          ? [
                              { name: "Project Charter", status: "complete", desc: "Governance structure, objectives, KPIs" },
                              { name: "Stakeholder Register", status: "complete", desc: "23 stakeholders across 4 departments" },
                              { name: "Risk Register", status: "complete", desc: "15 risks with mitigation plans" },
                              { name: "Implementation Roadmap", status: "complete", desc: "18-month timeline with milestones" },
                            ]
                          : activePhase === 2
                          ? [
                              { name: "Current State Analysis", status: "complete", desc: "AS-IS processes mapped for 3 modules" },
                              { name: "Fit-to-Standard Report", status: "complete", desc: "87% standard fit, 13% gaps identified" },
                              { name: "Solution Recommendations", status: "complete", desc: "S/4HANA + BTP + Fiori recommended" },
                              { name: "Business Case", status: "complete", desc: "ROI: 340% over 5 years" },
                            ]
                          : activePhase === 4
                          ? [
                              { name: "Test Scripts", status: "locked", desc: "Unit, integration, UAT test cases" },
                              { name: "Configuration Guide", status: "locked", desc: "Step-by-step SPRO configuration" },
                              { name: "Technical Specs", status: "locked", desc: "ABAP/Fiori development specs" },
                              { name: "Data Migration Plan", status: "locked", desc: "Object mapping and validation rules" },
                            ]
                          : [
                              { name: "Training Materials", status: "locked", desc: "Role-based user training guides" },
                              { name: "Cutover Runbook", status: "locked", desc: "Go-live checklist and procedures" },
                              { name: "End-User Docs", status: "locked", desc: "Quick reference cards and FAQs" },
                              { name: "Hypercare Plan", status: "locked", desc: "Post-go-live support procedures" },
                            ]
                        ).map((artifact, i) => (
                          <div key={i} className="p-4 rounded-xl border border-slate-200 transition-all">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#1B2A4A]">{artifact.name}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  artifact.status === "complete"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {artifact.status === "complete" ? "✅ Done" : "🔒 Locked"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{artifact.desc}</p>
                          </div>
                        ))}
                      </div>
                      {activePhase < 3 && (
                        <div className="text-center pt-4">
                          <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold">
                            📄 View Documents
                          </button>
                        </div>
                      )}
                      {activePhase > 3 && (
                        <div className="text-center pt-4 text-sm text-slate-400">
                          🔒 Complete the Explore phase to unlock this phase
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
