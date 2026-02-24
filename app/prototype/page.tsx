"use client";

import { useState } from "react";

type Screen = "login" | "dashboard" | "create-project" | "project-view" | "admin";

/* ──────────────────────────────────────────────
   RBAC — Roles & Phase Access Matrix
   ────────────────────────────────────────────── */

type Role = "admin" | "marketing" | "presales" | "project-manager" | "solution-architect" | "consultant" | "viewer";

interface RoleConfig {
  id: Role;
  label: string;
  desc: string;
  icon: string;
  color: string;
  bgColor: string;
  accessPhases: string[];          // phase IDs this role can access
  canEdit: boolean;                 // can create/modify artifacts
  canExport: boolean;               // can export documents
  canManageTeam: boolean;           // can add/remove team members
  canManageProject: boolean;        // can create projects, change settings
  canAccessAdmin: boolean;          // can access admin panel
}

const roles: RoleConfig[] = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full platform access — manage projects, team, and all phases",
    icon: "👑",
    color: "#E8491D",
    bgColor: "#E8491D15",
    accessPhases: ["marketing", "proposal", "prepare", "discover", "explore", "realize", "deploy"],
    canEdit: true, canExport: true, canManageTeam: true, canManageProject: true, canAccessAdmin: true,
  },
  {
    id: "project-manager",
    label: "Project Manager",
    desc: "Manage SAP Activate phases — Prepare through Deploy",
    icon: "📋",
    color: "#0091DA",
    bgColor: "#0091DA15",
    accessPhases: ["prepare", "discover", "explore", "realize", "deploy"],
    canEdit: true, canExport: true, canManageTeam: true, canManageProject: true, canAccessAdmin: false,
  },
  {
    id: "presales",
    label: "Pre-Sales Manager",
    desc: "Marketing campaigns and proposal generation",
    icon: "💼",
    color: "#8B5CF6",
    bgColor: "#8B5CF615",
    accessPhases: ["marketing", "proposal"],
    canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false,
  },
  {
    id: "marketing",
    label: "Marketing",
    desc: "Create marketing collateral — case studies, pitch decks, campaigns",
    icon: "🎯",
    color: "#F59E0B",
    bgColor: "#F59E0B15",
    accessPhases: ["marketing"],
    canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false,
  },
  {
    id: "solution-architect",
    label: "Solution Architect",
    desc: "Design solutions — Discover, Explore, and Realize phases",
    icon: "🏗️",
    color: "#10B981",
    bgColor: "#10B98115",
    accessPhases: ["discover", "explore", "realize"],
    canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false,
  },
  {
    id: "consultant",
    label: "Consultant",
    desc: "Generate FSDs and build technical deliverables",
    icon: "⚙️",
    color: "#0091DA",
    bgColor: "#0091DA15",
    accessPhases: ["explore", "realize", "deploy"],
    canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false,
  },
  {
    id: "viewer",
    label: "Viewer (Read-Only)",
    desc: "View project progress and documents — no editing rights",
    icon: "👁️",
    color: "#64748B",
    bgColor: "#64748B15",
    accessPhases: ["marketing", "proposal", "prepare", "discover", "explore", "realize", "deploy"],
    canEdit: false, canExport: false, canManageTeam: false, canManageProject: false, canAccessAdmin: false,
  },
];

const phases = [
  { id: "marketing", num: -1, name: "Marketing", icon: "🎯", desc: "Generate leads, build brand, create sales collateral with AI" },
  { id: "proposal", num: 0, name: "Proposal", icon: "📋", desc: "Analyze RFPs and generate winning project proposals" },
  { id: "prepare", num: 1, name: "Prepare", icon: "📐", desc: "Set up project governance, charter, and risk assessment" },
  { id: "discover", num: 2, name: "Discover", icon: "🔍", desc: "Assess fit-to-standard and map current processes" },
  { id: "explore", num: 3, name: "Explore", icon: "🧩", desc: "Generate Functional Specification Documents with AI Agent Teams" },
  { id: "realize", num: 4, name: "Realize", icon: "⚙️", desc: "Build test scripts, configuration guides, and technical specs" },
  { id: "deploy", num: 5, name: "Deploy", icon: "🚀", desc: "Prepare training materials, cutover plans, and go-live docs" },
];

/* ──────────────────────────────────────────────
   Demo team members for admin panel
   ────────────────────────────────────────────── */
const teamMembers = [
  { initials: "GP", name: "Gokul Palanisamy", email: "gokul@westernacher.com", role: "admin" as Role },
  { initials: "WL", name: "Wei Li", email: "wei@westernacher.com", role: "solution-architect" as Role },
  { initials: "FS", name: "Florian Schmidt", email: "florian@westernacher.com", role: "project-manager" as Role },
  { initials: "AK", name: "Anna König", email: "anna@westernacher.com", role: "consultant" as Role },
  { initials: "MR", name: "Maria Rossi", email: "maria@westernacher.com", role: "marketing" as Role },
  { initials: "TJ", name: "Tom Jansen", email: "tom@westernacher.com", role: "presales" as Role },
  { initials: "KW", name: "Kristin Weber", email: "kristin@westernacher.com", role: "viewer" as Role },
];

export default function PrototypePage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  const activePhase = phases[activePhaseIdx];
  const currentRole = roles.find((r) => r.id === selectedRole)!;
  const hasAccess = (phaseId: string) => currentRole.accessPhases.includes(phaseId);

  // Find first accessible phase index
  const firstAccessibleIdx = phases.findIndex((p) => hasAccess(p.id));

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Prototype Navigation Bar */}
      <div className="bg-[#1B2A4A] text-white px-6 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#0091DA]">🎨 PROTOTYPE</span>
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
              ...(currentRole.canAccessAdmin ? [["admin", "Admin Panel"]] : []),
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
          {/* Role Badge */}
          <div className="ml-3 pl-3 border-l border-white/20 flex items-center gap-1.5">
            <span className="text-sm">{currentRole.icon}</span>
            <span className="text-white/70">{currentRole.label}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: LOGIN                                */}
      {/* ════════════════════════════════════════════ */}
      {screen === "login" && (
        <div className="min-h-[calc(100vh-36px)] flex items-center justify-center bg-gradient-to-br from-[#1B2A4A] via-[#0a1628] to-[#0d2847] relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#0091DA]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#0091DA]/5 rounded-full blur-3xl" />

          <div className="w-full max-w-5xl relative z-10 px-6">
            {/* Logo area */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#0091DA] animate-pulse" />
                <span className="text-xs text-[#0091DA]">AI-Powered Platform</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">Westernacher</div>
              <div className="text-sm text-[#0091DA] tracking-widest uppercase">
                Nonstop Innovation
              </div>
              <p className="text-white/40 text-sm mt-2">WE-AI Implementation Accelerator</p>
            </div>

            {/* Login + Role Selection Grid */}
            <div className="grid grid-cols-[1fr_380px] gap-8">
              {/* LEFT: Role Selection */}
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Select Your Role to Preview Access
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedRole === role.id
                          ? "border-[#0091DA] bg-[#0091DA]/10 ring-1 ring-[#0091DA]/40"
                          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{role.icon}</span>
                        <div>
                          <div className={`text-sm font-bold ${selectedRole === role.id ? "text-[#0091DA]" : "text-white"}`}>
                            {role.label}
                          </div>
                        </div>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed">{role.desc}</p>
                      {/* Phase Access Dots */}
                      <div className="flex items-center gap-1 mt-3">
                        {phases.map((p) => (
                          <div
                            key={p.id}
                            className={`w-5 h-1.5 rounded-full transition-all ${
                              role.accessPhases.includes(p.id)
                                ? "bg-[#0091DA]"
                                : "bg-white/10"
                            }`}
                            title={p.name}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-white/30">
                          {role.accessPhases.length} of {phases.length} phases
                        </span>
                        {role.canEdit && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">Edit</span>}
                        {role.canExport && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">Export</span>}
                        {role.canAccessAdmin && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#E8491D]/20 text-[#E8491D]">Admin</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT: Login Card */}
              <div>
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/20">
                  <h2 className="text-xl font-bold text-[#1B2A4A] mb-1">Welcome back</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Sign in to access your projects
                  </p>

                  {/* SSO Button */}
                  <button
                    onClick={() => {
                      setActivePhaseIdx(Math.max(0, firstAccessibleIdx));
                      setScreen("dashboard");
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-[#0091DA] text-white rounded-xl py-3.5 font-semibold hover:bg-[#0081c4] transition-all shadow-lg shadow-[#0091DA]/25 mb-4"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="white">
                      <path d="M0 0h10.9v10.9H0zM12.1 0H23v10.9H12.1zM0 12.1h10.9V23H0zM12.1 12.1H23V23H12.1z" />
                    </svg>
                    Sign in with Microsoft
                  </button>

                  <div className="flex items-center gap-3 my-5">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-xs text-slate-400">or use email</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Email</label>
                      <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-400 bg-slate-50">
                        gokul@westernacher.com
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Password</label>
                      <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-400 bg-slate-50">
                        ••••••••••
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActivePhaseIdx(Math.max(0, firstAccessibleIdx));
                        setScreen("dashboard");
                      }}
                      className="w-full bg-[#1B2A4A] text-white rounded-xl py-3 font-semibold hover:bg-[#243558] transition-all"
                    >
                      Sign In
                    </button>
                  </div>

                  {/* Current role preview */}
                  <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{currentRole.icon}</span>
                      <span className="text-xs font-bold text-[#1B2A4A]">Signing in as: {currentRole.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {phases.map((p) => (
                        <span
                          key={p.id}
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                            hasAccess(p.id)
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-50 text-red-400"
                          }`}
                        >
                          {hasAccess(p.id) ? "✓" : "✗"} {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-400 mt-5">
                    🔒 Protected by Westernacher Enterprise Security
                  </p>
                </div>
              </div>
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
                <span className="text-[10px] text-slate-400 tracking-widest uppercase">Nonstop Innovation</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                {["Projects", "Templates", "Team", "Analytics", ...(currentRole.canAccessAdmin ? ["Admin"] : [])].map((tab, i) => (
                  <span
                    key={tab}
                    onClick={() => tab === "Admin" && setScreen("admin")}
                    className={
                      i === 0
                        ? "text-[#0091DA] font-semibold border-b-2 border-[#0091DA] pb-1"
                        : tab === "Admin"
                        ? "text-[#E8491D] hover:text-[#E8491D] cursor-pointer font-medium"
                        : "text-slate-500 hover:text-[#1B2A4A] cursor-pointer"
                    }
                  >
                    {tab}
                  </span>
                ))}
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0091DA] to-[#1B2A4A] text-white flex items-center justify-center text-xs font-bold">
                    GP
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1B2A4A]">Gokul P.</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: currentRole.bgColor, color: currentRole.color }}>
                        {currentRole.icon} {currentRole.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Welcome */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[#1B2A4A]">Good afternoon, Gokul 👋</h1>
                <p className="text-slate-500 mt-1">3 active projects · 2 pending reviews</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Role access summary */}
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
                  <span className="text-slate-400">Your access: </span>
                  <span className="font-semibold text-[#1B2A4A]">{currentRole.accessPhases.length}/{phases.length} phases</span>
                  {currentRole.canEdit && <span className="ml-2 text-emerald-600">· Edit</span>}
                  {!currentRole.canEdit && <span className="ml-2 text-slate-400">· Read-only</span>}
                </div>
                {currentRole.canManageProject && (
                  <button
                    onClick={() => setScreen("create-project")}
                    className="bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-[#0091DA]/20 transition-all"
                  >
                    <span className="text-lg">+</span> New Project
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              {[
                { label: "Active Projects", value: "3", icon: "📁", color: "#0091DA" },
                { label: "Marketing Assets", value: "12", icon: "🎯", color: "#E8491D", phase: "marketing" },
                { label: "Proposals Won", value: "5", icon: "🏆", color: "#10B981", phase: "proposal" },
                { label: "Documents Generated", value: "24", icon: "📄", color: "#8B5CF6" },
                { label: "Team Members", value: "6", icon: "👥", color: "#F59E0B" },
              ].map((stat) => {
                const dimmed = stat.phase && !hasAccess(stat.phase);
                return (
                  <div key={stat.label} className={`bg-white rounded-xl p-4 border border-slate-100 shadow-sm transition-all ${
                    dimmed ? "opacity-40 cursor-not-allowed" : "hover:shadow-md cursor-pointer"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{stat.icon}</span>
                      {dimmed ? (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">🔒 No access</span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: stat.color + "15", color: stat.color }}>
                          This month
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-[#1B2A4A]">{dimmed ? "—" : stat.value}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Lifecycle Pipeline Visual with Access Indicators */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1B2A4A]">Implementation Lifecycle Pipeline</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#0091DA]" /> Your access</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-200" /> Restricted</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {phases.map((phase, i) => {
                  const accessible = hasAccess(phase.id);
                  return (
                    <div key={phase.id} className="flex items-center flex-1">
                      <div className={`flex-1 text-center py-2.5 px-2 rounded-lg text-[10px] font-semibold transition-all ${
                        accessible
                          ? "bg-gradient-to-b from-[#0091DA]/10 to-[#0091DA]/5 text-[#0091DA] border border-[#0091DA]/20 cursor-pointer hover:shadow-sm"
                          : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                      }`}>
                        <span className="text-base block mb-0.5">{accessible ? phase.icon : "🔒"}</span>
                        {phase.name}
                      </div>
                      {i < phases.length - 1 && (
                        <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Cards */}
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Your Projects</h2>
            <div className="space-y-4">
              {[
                { name: "S/4HANA Migration — Duni Group", client: "Duni Group", modules: ["MM", "SD", "FI"], phase: "Explore", phaseIdx: 4, progress: 57, team: ["GP", "WL", "FS"], updated: "2 hours ago" },
                { name: "EWM Implementation — Green Token", client: "Green Token", modules: ["EWM", "MM"], phase: "Prepare", phaseIdx: 2, progress: 28, team: ["GP", "AK"], updated: "1 day ago" },
                { name: "FI/CO Transformation — Bank Corp", client: "Bank Corp", modules: ["FI", "CO"], phase: "Marketing", phaseIdx: 0, progress: 8, team: ["GP"], updated: "3 days ago" },
              ].map((project, i) => {
                const projectPhaseAccessible = hasAccess(phases[project.phaseIdx].id);
                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (projectPhaseAccessible) {
                        setActivePhaseIdx(project.phaseIdx);
                        setScreen("project-view");
                      }
                    }}
                    className={`bg-white rounded-xl p-5 border border-slate-100 shadow-sm transition-all group ${
                      projectPhaseAccessible
                        ? "hover:shadow-md hover:border-[#0091DA]/30 cursor-pointer"
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-base font-bold text-[#1B2A4A] transition-colors ${projectPhaseAccessible ? "group-hover:text-[#0091DA]" : ""}`}>{project.name}</h3>
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#0091DA]/10 text-[#0091DA]">
                            {phases[project.phaseIdx].icon} {project.phase}
                          </span>
                          {!projectPhaseAccessible && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-400">
                              🔒 No access to this phase
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Client: {project.client}</span>
                          <span>·</span>
                          <div className="flex gap-1">
                            {project.modules.map((m) => (
                              <span key={m} className="px-1.5 py-0.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded font-medium">{m}</span>
                            ))}
                          </div>
                          <span>·</span>
                          <span>Updated {project.updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          {project.team.map((member, j) => (
                            <div key={j} className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0091DA] to-[#1B2A4A] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                              {member}
                            </div>
                          ))}
                        </div>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progress</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#0091DA] to-[#10B981] rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                        <svg className={`w-5 h-5 ${projectPhaseAccessible ? "text-slate-300 group-hover:text-[#0091DA]" : "text-slate-200"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: CREATE PROJECT                       */}
      {/* ════════════════════════════════════════════ */}
      {screen === "create-project" && (
        <div className="max-w-3xl mx-auto px-8 py-12">
          <button onClick={() => setScreen("dashboard")} className="text-sm text-slate-500 hover:text-[#0091DA] mb-6 flex items-center gap-1">
            ← Back to Dashboard
          </button>

          {!currentRole.canManageProject ? (
            /* No permission to create */
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-100 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Access Restricted</h2>
              <p className="text-sm text-slate-500 mb-4">Your role ({currentRole.icon} {currentRole.label}) doesn&apos;t have permission to create projects.</p>
              <p className="text-xs text-slate-400">Contact your Admin or Project Manager to create a project.</p>
              <button onClick={() => setScreen("dashboard")} className="mt-6 px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold">
                ← Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#0091DA] to-[#1B2A4A] rounded-xl flex items-center justify-center">
                  <span className="text-xl">📁</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1B2A4A]">Create New Project</h1>
                  <p className="text-sm text-slate-500">Set up a new SAP implementation project</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Project Name <span className="text-red-500">*</span></label>
                  <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#1B2A4A]">S/4HANA Migration — Duni Group</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Client Name</label>
                    <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-[#1B2A4A]">Duni Group</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#1B2A4A] block mb-1.5">Industry</label>
                    <div className="border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-500 flex items-center justify-between">
                      <span>Manufacturing</span><span className="text-slate-300">▾</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-2">SAP Modules in Scope</label>
                  <div className="flex flex-wrap gap-2">
                    {["MM", "SD", "FI", "CO", "PP", "EWM", "TM", "QM"].map((m) => (
                      <span key={m} className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                        ["MM", "SD", "FI"].includes(m) ? "bg-[#0091DA] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Team Members with Roles */}
                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-2">Team Members & Roles</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { name: "GP", role: "Admin", roleIcon: "👑" },
                      { name: "WL", role: "Architect", roleIcon: "🏗️" },
                      { name: "FS", role: "PM", roleIcon: "📋" },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                        <div className="w-6 h-6 rounded-full bg-[#0091DA] text-white text-[10px] font-bold flex items-center justify-center">{m.name}</div>
                        <span className="text-xs text-slate-600">{m.roleIcon} {m.role}</span>
                        <span className="text-slate-300 cursor-pointer">×</span>
                      </div>
                    ))}
                    <button className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:border-[#0091DA] hover:text-[#0091DA]">+</button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#1B2A4A] block mb-2">Starting Phase</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Marketing", desc: "Start with lead gen", icon: "🎯", id: "marketing" },
                      { label: "Proposal", desc: "Start from RFP", icon: "📋", id: "proposal" },
                      { label: "Prepare", desc: "SOW signed", icon: "📐", id: "prepare" },
                      { label: "Explore", desc: "Jump to FSD", icon: "🧩", id: "explore" },
                    ].map((phase, i) => {
                      const accessible = hasAccess(phase.id);
                      return (
                        <div key={i} className={`p-3 rounded-lg border-2 transition-all text-center ${
                          !accessible
                            ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50"
                            : i === 0
                            ? "border-[#0091DA] bg-[#0091DA]/5 cursor-pointer"
                            : "border-slate-200 hover:border-slate-300 cursor-pointer"
                        }`}>
                          <span className="text-lg">{accessible ? phase.icon : "🔒"}</span>
                          <div className={`text-xs font-semibold mt-1 ${!accessible ? "text-slate-400" : i === 0 ? "text-[#0091DA]" : "text-[#1B2A4A]"}`}>{phase.label}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">{accessible ? phase.desc : "No access"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => { setActivePhaseIdx(Math.max(0, firstAccessibleIdx)); setScreen("project-view"); }}
                  className="w-full bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white rounded-xl py-3.5 font-semibold hover:shadow-lg hover:shadow-[#0091DA]/20 transition-all"
                >
                  Create Project →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* SCREEN: ADMIN PANEL                          */}
      {/* ════════════════════════════════════════════ */}
      {screen === "admin" && (
        <div>
          {/* App Header */}
          <div className="bg-white border-b border-slate-200 px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-[#1B2A4A]">Westernacher</span>
                <span className="text-[10px] text-slate-400 tracking-widest uppercase">Nonstop Innovation</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setScreen("dashboard")} className="text-sm text-slate-500 hover:text-[#0091DA]">← Dashboard</button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8">
            {!currentRole.canAccessAdmin ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-100 text-center max-w-lg mx-auto">
                <div className="text-5xl mb-4">🔒</div>
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Admin Access Required</h2>
                <p className="text-sm text-slate-500">Your role ({currentRole.icon} {currentRole.label}) doesn&apos;t have admin access.</p>
                <button onClick={() => setScreen("dashboard")} className="mt-6 px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold">
                  ← Back to Dashboard
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
                      👑 Admin Panel
                    </h1>
                    <p className="text-slate-500 mt-1">Manage team members, roles, and platform access</p>
                  </div>
                  <button className="bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:shadow-lg transition-all">
                    <span>+</span> Invite Member
                  </button>
                </div>

                {/* Access Matrix Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <h3 className="text-sm font-bold text-[#1B2A4A]">Role Access Matrix</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Shows which phases each role can access</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#1B2A4A] text-white">
                          <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">Role</th>
                          {phases.map((p) => (
                            <th key={p.id} className="px-2 py-3 text-center font-medium text-[10px] uppercase tracking-wider">
                              <div>{p.icon}</div>
                              {p.name}
                            </th>
                          ))}
                          <th className="px-3 py-3 text-center font-medium text-[10px] uppercase tracking-wider">Edit</th>
                          <th className="px-3 py-3 text-center font-medium text-[10px] uppercase tracking-wider">Export</th>
                          <th className="px-3 py-3 text-center font-medium text-[10px] uppercase tracking-wider">Team</th>
                          <th className="px-3 py-3 text-center font-medium text-[10px] uppercase tracking-wider">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role, ri) => (
                          <tr key={role.id} className={`border-b border-slate-100 ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-blue-50/30`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span>{role.icon}</span>
                                <span className="font-semibold text-[#1B2A4A]">{role.label}</span>
                              </div>
                            </td>
                            {phases.map((p) => (
                              <td key={p.id} className="px-2 py-3 text-center">
                                {role.accessPhases.includes(p.id) ? (
                                  <span className="inline-block w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 leading-6 text-xs">✓</span>
                                ) : (
                                  <span className="inline-block w-6 h-6 rounded-full bg-red-50 text-red-300 leading-6 text-xs">✗</span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center">
                              {role.canEdit ? <span className="text-emerald-500">✓</span> : <span className="text-red-300">✗</span>}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {role.canExport ? <span className="text-emerald-500">✓</span> : <span className="text-red-300">✗</span>}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {role.canManageTeam ? <span className="text-emerald-500">✓</span> : <span className="text-red-300">✗</span>}
                            </td>
                            <td className="px-3 py-3 text-center">
                              {role.canAccessAdmin ? <span className="text-[#E8491D] font-bold">✓</span> : <span className="text-red-300">✗</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#1B2A4A]">Team Members</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{teamMembers.length} members across your organization</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-400 bg-slate-50 w-48">
                        🔍 Search members...
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {teamMembers.map((member) => {
                      const memberRole = roles.find((r) => r.id === member.role)!;
                      return (
                        <div key={member.initials} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0091DA] to-[#1B2A4A] text-white text-sm font-bold flex items-center justify-center">
                              {member.initials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-[#1B2A4A]">{member.name}</div>
                              <div className="text-xs text-slate-400">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: memberRole.bgColor, color: memberRole.color }}>
                              {memberRole.icon} {memberRole.label}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <span>{memberRole.accessPhases.length} phases</span>
                            </div>
                            <button className="text-xs text-slate-400 hover:text-[#0091DA] px-2 py-1 rounded hover:bg-slate-100">
                              Edit →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
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
                  <button onClick={() => setScreen("dashboard")} className="text-xs text-slate-400 hover:text-[#0091DA] mb-1 flex items-center gap-1">← All Projects</button>
                  <h1 className="text-lg font-bold text-[#1B2A4A]">S/4HANA Migration — Duni Group</h1>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>Client: Duni Group</span>
                    <span>·</span>
                    <div className="flex gap-1">
                      {["MM", "SD", "FI"].map((m) => (
                        <span key={m} className="px-1.5 py-0.5 bg-[#1B2A4A]/10 text-[#1B2A4A] rounded font-medium">{m}</span>
                      ))}
                    </div>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: currentRole.bgColor, color: currentRole.color }}>
                      {currentRole.icon} {currentRole.label}
                    </span>
                    {!currentRole.canEdit && <span className="text-red-400 font-medium">· Read-only</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-4">
                    <div className="text-xs text-slate-500">Overall Progress</div>
                    <div className="text-lg font-bold text-[#0091DA]">57%</div>
                  </div>
                  {currentRole.canManageProject && (
                    <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200">Settings</button>
                  )}
                  {currentRole.canExport && (
                    <button className="px-4 py-2 bg-[#0091DA] text-white rounded-lg text-sm hover:bg-[#0081c4]">Export All</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-[280px_1fr] gap-8">
              {/* Left: Phase Navigation */}
              <div className="space-y-1.5">
                <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Full Lifecycle</h3>
                {phases.map((phase, idx) => {
                  const accessible = hasAccess(phase.id);
                  const isComplete = idx < 4;
                  const isActive = idx === 4;
                  const isLocked = idx > 4;
                  const isSelected = activePhaseIdx === idx;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => accessible && !isLocked && setActivePhaseIdx(idx)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        !accessible
                          ? "bg-red-50/50 text-slate-300 cursor-not-allowed border border-red-100/50"
                          : isSelected
                          ? "bg-gradient-to-r from-[#0091DA] to-[#0091DA]/90 text-white shadow-lg shadow-[#0091DA]/20"
                          : isLocked
                          ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                          : isComplete
                          ? "bg-emerald-50/80 text-[#1B2A4A] hover:bg-emerald-100 border border-emerald-200/50"
                          : "bg-white text-[#1B2A4A] hover:bg-slate-50 border border-slate-200"
                      }`}
                    >
                      <span className="text-lg">{accessible ? phase.icon : "🚫"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{phase.name}</div>
                        <div className={`text-[10px] ${isSelected ? "text-white/70" : "text-slate-400"}`}>
                          {!accessible && "🔒 No access"}
                          {accessible && isComplete && !isSelected && "✅ Completed"}
                          {accessible && isActive && !isSelected && "🔵 In Progress"}
                          {accessible && isLocked && "🔒 Locked"}
                          {isSelected && accessible && isComplete && "✅ Completed"}
                          {isSelected && accessible && isActive && "🔵 In Progress"}
                        </div>
                      </div>
                      {!accessible && <span className="text-red-300 text-xs">🔒</span>}
                      {accessible && isLocked && <span className="text-slate-300">🔒</span>}
                    </button>
                  );
                })}

                <div className="mt-6 px-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>Overall</span>
                    <span className="font-semibold text-[#0091DA]">57%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#0091DA] to-[#10B981] rounded-full" style={{ width: "57%" }} />
                  </div>
                </div>

                {/* Role Access Summary */}
                <div className="mt-4 p-3 bg-white rounded-xl border border-slate-100">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Permissions</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Role</span>
                      <span className="font-medium" style={{ color: currentRole.color }}>{currentRole.icon} {currentRole.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Phases</span>
                      <span className="font-medium text-[#1B2A4A]">{currentRole.accessPhases.length}/{phases.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Edit</span>
                      <span className={currentRole.canEdit ? "text-emerald-600 font-medium" : "text-red-400"}>
                        {currentRole.canEdit ? "✓ Yes" : "✗ No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Export</span>
                      <span className={currentRole.canExport ? "text-emerald-600 font-medium" : "text-red-400"}>
                        {currentRole.canExport ? "✓ Yes" : "✗ No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Phase Content */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Phase Header */}
                <div className={`px-8 py-6 border-b border-slate-100 ${
                  !hasAccess(activePhase.id)
                    ? "bg-gradient-to-r from-red-50 to-orange-50"
                    : activePhase.id === "marketing"
                    ? "bg-gradient-to-r from-orange-50 to-amber-50"
                    : "bg-gradient-to-r from-[#0091DA]/10 to-[#0091DA]/5"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                        !hasAccess(activePhase.id) ? "text-red-500"
                          : activePhase.id === "marketing" ? "text-orange-500"
                          : "text-[#0091DA]"
                      }`}>
                        {activePhase.num >= 0 ? `Phase ${activePhase.num}` : "Pre-Phase"}
                      </div>
                      <h2 className="text-xl font-bold text-[#1B2A4A] flex items-center gap-2">
                        <span className="text-2xl">{activePhase.icon}</span>
                        {activePhase.name}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">{activePhase.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!hasAccess(activePhase.id) && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                          🚫 No Access
                        </span>
                      )}
                      {hasAccess(activePhase.id) && !currentRole.canEdit && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          👁️ View Only
                        </span>
                      )}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        activePhaseIdx < 4 ? "bg-emerald-100 text-emerald-700"
                          : activePhaseIdx === 4 ? "bg-[#0091DA]/10 text-[#0091DA]"
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {activePhaseIdx < 4 ? "✅ Complete" : activePhaseIdx === 4 ? "🔵 In Progress" : "🔒 Locked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Phase Content */}
                <div className="p-8">
                  {/* ── ACCESS DENIED ── */}
                  {!hasAccess(activePhase.id) && (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Phase Access Restricted</h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto mb-2">
                        Your role ({currentRole.icon} <strong>{currentRole.label}</strong>) doesn&apos;t have access to the <strong>{activePhase.name}</strong> phase.
                      </p>
                      <p className="text-xs text-slate-400 mb-6">
                        Contact your Admin to request access, or switch to a phase you have permissions for.
                      </p>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        <span className="text-xs text-slate-400">Your phases:</span>
                        {phases.filter((p) => hasAccess(p.id)).map((p) => {
                          const idx = phases.indexOf(p);
                          return (
                            <button
                              key={p.id}
                              onClick={() => setActivePhaseIdx(idx)}
                              className="text-xs px-3 py-1.5 rounded-full bg-[#0091DA]/10 text-[#0091DA] font-medium hover:bg-[#0091DA]/20 transition-all"
                            >
                              {p.icon} {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── MARKETING PHASE ── */}
                  {hasAccess(activePhase.id) && activePhase.id === "marketing" && (
                    <div className="space-y-6">
                      {/* Marketing Hero */}
                      <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0d2847] rounded-xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0091DA]/20 rounded-full blur-3xl" />
                        <div className="relative z-10">
                          <h3 className="text-lg font-bold mb-1">AI-Powered Marketing Engine</h3>
                          <p className="text-sm text-white/70 mb-4">Generate professional sales collateral, thought leadership, and targeted outreach — all powered by your SAP domain expertise.</p>
                          <div className="flex items-center gap-3">
                            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-medium">12 assets created</span>
                            <span className="bg-[#0091DA]/20 text-[#0091DA] text-xs px-2.5 py-1 rounded-full font-medium">3 campaigns active</span>
                          </div>
                        </div>
                      </div>

                      {/* Marketing Artifacts Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "Case Study Generator", status: "complete", desc: "3 client success stories generated from past project data", icon: "📰", count: "3 created" },
                          { name: "Industry Pitch Deck", status: "complete", desc: "Manufacturing-focused deck with SAP S/4HANA value props", icon: "📊", count: "2 versions" },
                          { name: "Thought Leadership", status: "complete", desc: "5 blog posts and 2 whitepapers on S/4HANA migration", icon: "✍️", count: "7 articles" },
                          { name: "Competitor Analysis", status: "complete", desc: "Westernacher vs 4 competitors — differentiators mapped", icon: "🔎", count: "4 reports" },
                          { name: "Email Campaign", status: "generating", desc: "AI generating personalized outreach for Manufacturing CIOs", icon: "📧", count: "In progress..." },
                          { name: "Event Proposals", status: "pending", desc: "SAP TechEd talk proposals and webinar outlines", icon: "🎤", count: "Queued" },
                        ].map((artifact, i) => (
                          <div key={i} className={`p-4 rounded-xl border transition-all ${currentRole.canEdit ? "hover:shadow-md cursor-pointer" : ""} ${
                            artifact.status === "generating" ? "border-[#0091DA]/30 bg-[#0091DA]/[0.02]" : "border-slate-200 hover:border-[#0091DA]/30"
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{artifact.icon}</span>
                                <span className="text-sm font-semibold text-[#1B2A4A]">{artifact.name}</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                artifact.status === "complete" ? "bg-emerald-100 text-emerald-700"
                                  : artifact.status === "generating" ? "bg-[#0091DA]/10 text-[#0091DA]"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {artifact.count}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{artifact.desc}</p>
                            {artifact.status === "generating" && (
                              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#0091DA] to-[#0091DA]/60 rounded-full w-1/2 animate-pulse" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Marketing Actions */}
                      {currentRole.canEdit && (
                        <div className="flex items-center gap-3 justify-center pt-2">
                          <button className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg transition-all">
                            🎯 Generate New Marketing Asset
                          </button>
                          <button className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                            📊 View Campaign Analytics
                          </button>
                          {currentRole.canExport && (
                            <button className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                              📤 Export All Assets
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── PROPOSAL PHASE ── */}
                  {hasAccess(activePhase.id) && activePhase.id === "proposal" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "RFP Analysis", status: "complete", desc: "Extracted 47 requirements from client RFP", icon: "📑" },
                          { name: "Proposal Document", status: "complete", desc: "40-page proposal with scope, timeline, team", icon: "📄" },
                          { name: "Effort Estimation", status: "complete", desc: "1,240 person-days across 3 modules", icon: "⏱️" },
                          { name: "Risk Assessment", status: "complete", desc: "12 risks identified, 4 high priority", icon: "⚠️" },
                        ].map((a, i) => (
                          <div key={i} className={`p-4 rounded-xl border border-slate-200 transition-all ${currentRole.canEdit ? "hover:border-[#0091DA]/30 cursor-pointer hover:shadow-md" : ""}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span>{a.icon}</span>
                                <span className="text-sm font-semibold text-[#1B2A4A]">{a.name}</span>
                              </div>
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Done</span>
                            </div>
                            <p className="text-xs text-slate-500">{a.desc}</p>
                          </div>
                        ))}
                      </div>
                      <div className="text-center pt-4">
                        <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold shadow-md shadow-[#0091DA]/20">📄 View Proposal Document</button>
                      </div>
                    </div>
                  )}

                  {/* ── EXPLORE PHASE (Built) ── */}
                  {hasAccess(activePhase.id) && activePhase.id === "explore" && (
                    <div className="space-y-4">
                      {/* Built badge */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                        <span className="text-lg">✅</span>
                        <div>
                          <span className="text-sm font-semibold text-emerald-800">This phase is live!</span>
                          <span className="text-xs text-emerald-600 ml-2">FSD Generator with Agent Teams is deployed and working</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "MM — Procurement FSD", status: "complete", desc: "Generated with Agent Teams · 14 sections", icon: "📦" },
                          { name: "SD — Sales FSD", status: "generating", desc: "Agent Team: Phase 2 — Specialists running...", icon: "💰" },
                          { name: "FI — Accounting FSD", status: "pending", desc: "Queued · Will start after SD completes", icon: "🏦" },
                          { name: "Cross-Module Integration", status: "locked", desc: "Requires all module FSDs to complete", icon: "🔗" },
                        ].map((a, i) => (
                          <div key={i} className="p-4 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span>{a.icon}</span>
                                <span className="text-sm font-semibold text-[#1B2A4A]">{a.name}</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                a.status === "complete" ? "bg-emerald-100 text-emerald-700"
                                  : a.status === "generating" ? "bg-[#0091DA]/10 text-[#0091DA]"
                                  : a.status === "pending" ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-400"
                              }`}>
                                {a.status === "complete" ? "Done" : a.status === "generating" ? "Generating..." : a.status === "pending" ? "Pending" : "Locked"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">{a.desc}</p>
                            {a.status === "generating" && (
                              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#0091DA] rounded-full w-2/3 animate-pulse" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {currentRole.canEdit && (
                        <div className="flex items-center gap-3 pt-4 justify-center">
                          <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold shadow-md shadow-[#0091DA]/20">🤖 Generate Next FSD</button>
                          <button className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm">📄 View Completed FSDs</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── OTHER PHASES ── */}
                  {hasAccess(activePhase.id) && !["marketing", "proposal", "explore"].includes(activePhase.id) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {(activePhase.id === "prepare"
                          ? [
                              { name: "Project Charter", desc: "Governance, objectives, KPIs", icon: "📋" },
                              { name: "Stakeholder Register", desc: "23 stakeholders across 4 departments", icon: "👥" },
                              { name: "Risk Register", desc: "15 risks with mitigation plans", icon: "⚠️" },
                              { name: "Implementation Roadmap", desc: "18-month timeline with milestones", icon: "🗺️" },
                            ]
                          : activePhase.id === "discover"
                          ? [
                              { name: "Current State Analysis", desc: "AS-IS processes mapped for 3 modules", icon: "📋" },
                              { name: "Fit-to-Standard Report", desc: "87% standard fit, 13% gaps", icon: "✅" },
                              { name: "Solution Recommendations", desc: "S/4HANA + BTP + Fiori recommended", icon: "💡" },
                              { name: "Business Case", desc: "ROI: 340% over 5 years", icon: "📈" },
                            ]
                          : activePhase.id === "realize"
                          ? [
                              { name: "Test Scripts", desc: "Unit, integration, UAT test cases", icon: "🧪" },
                              { name: "Configuration Guide", desc: "Step-by-step SPRO configuration", icon: "⚙️" },
                              { name: "Technical Specs", desc: "ABAP/Fiori development specs", icon: "💻" },
                              { name: "Data Migration Plan", desc: "Object mapping and validation rules", icon: "📦" },
                            ]
                          : [
                              { name: "Training Materials", desc: "Role-based user training guides", icon: "📚" },
                              { name: "Cutover Runbook", desc: "Go-live checklist and procedures", icon: "🚀" },
                              { name: "End-User Docs", desc: "Quick reference cards and FAQs", icon: "📖" },
                              { name: "Hypercare Plan", desc: "Post-go-live support procedures", icon: "🛡️" },
                            ]
                        ).map((a, i) => {
                          const isComplete = activePhaseIdx < 4;
                          const isLocked = activePhaseIdx > 4;
                          return (
                            <div key={i} className={`p-4 rounded-xl border transition-all ${
                              isComplete && currentRole.canEdit ? "border-slate-200 hover:border-[#0091DA]/30 cursor-pointer hover:shadow-md" : "border-slate-200"
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span>{a.icon}</span>
                                  <span className="text-sm font-semibold text-[#1B2A4A]">{a.name}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isComplete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                  {isComplete ? "Done" : "Locked"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{a.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                      {activePhaseIdx < 4 && (
                        <div className="text-center pt-4">
                          <button className="px-6 py-2.5 bg-[#0091DA] text-white rounded-lg text-sm font-semibold shadow-md shadow-[#0091DA]/20">📄 View Documents</button>
                        </div>
                      )}
                      {activePhaseIdx > 4 && (
                        <div className="text-center pt-6 text-sm text-slate-400">🔒 Complete the Explore phase to unlock</div>
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
