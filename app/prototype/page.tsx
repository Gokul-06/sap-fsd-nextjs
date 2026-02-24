"use client";

import { useState } from "react";

/* ──────────────────────────────────────────────
   SVG Icon Components — clean, enterprise-grade
   ────────────────────────────────────────────── */

function Icon({ d, className = "w-5 h-5", stroke = "currentColor", fill = "none" }: { d: string; className?: string; stroke?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

// Composite icons that need multiple paths
function IconShield({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconTarget({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function IconUsers({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconLock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconChevron({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function IconPlus({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconGrid({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconSearch({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconArrowLeft({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function IconSettings({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconDownload({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconEye({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   Phase Icon Components
   ────────────────────────────────────────────── */
const phaseIcons: Record<string, (cls: string) => React.ReactNode> = {
  marketing: (cls) => <IconTarget className={cls} />,
  proposal: (cls) => <Icon className={cls} d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />,
  prepare: (cls) => <Icon className={cls} d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  discover: (cls) => <IconSearch className={cls} />,
  explore: (cls) => <Icon className={cls} d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  realize: (cls) => <IconSettings className={cls} />,
  deploy: (cls) => <Icon className={cls} d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

/* ──────────────────────────────────────────────
   Types & Data
   ────────────────────────────────────────────── */
type Screen = "login" | "dashboard" | "create-project" | "project-view" | "admin";
type Role = "admin" | "marketing" | "presales" | "project-manager" | "solution-architect" | "consultant" | "viewer";

interface RoleConfig {
  id: Role;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  accessPhases: string[];
  canEdit: boolean;
  canExport: boolean;
  canManageTeam: boolean;
  canManageProject: boolean;
  canAccessAdmin: boolean;
}

const roles: RoleConfig[] = [
  { id: "admin", label: "Administrator", desc: "Full platform access — manage projects, teams, and all lifecycle phases", color: "#E8491D", bgColor: "#FEF2F2", accessPhases: ["marketing", "proposal", "prepare", "discover", "explore", "realize", "deploy"], canEdit: true, canExport: true, canManageTeam: true, canManageProject: true, canAccessAdmin: true },
  { id: "project-manager", label: "Project Manager", desc: "Manage SAP Activate phases — Prepare through Deploy", color: "#0091DA", bgColor: "#EFF6FF", accessPhases: ["prepare", "discover", "explore", "realize", "deploy"], canEdit: true, canExport: true, canManageTeam: true, canManageProject: true, canAccessAdmin: false },
  { id: "presales", label: "Pre-Sales Manager", desc: "Marketing campaigns and proposal generation", color: "#7C3AED", bgColor: "#F5F3FF", accessPhases: ["marketing", "proposal"], canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false },
  { id: "marketing", label: "Marketing", desc: "Create marketing collateral — case studies, decks, campaigns", color: "#D97706", bgColor: "#FFFBEB", accessPhases: ["marketing"], canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false },
  { id: "solution-architect", label: "Solution Architect", desc: "Design solutions — Discover, Explore, and Realize phases", color: "#059669", bgColor: "#ECFDF5", accessPhases: ["discover", "explore", "realize"], canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false },
  { id: "consultant", label: "Consultant", desc: "Generate FSDs and build technical deliverables", color: "#0091DA", bgColor: "#EFF6FF", accessPhases: ["explore", "realize", "deploy"], canEdit: true, canExport: true, canManageTeam: false, canManageProject: false, canAccessAdmin: false },
  { id: "viewer", label: "Viewer", desc: "Read-only access to all project phases and documents", color: "#6B7280", bgColor: "#F9FAFB", accessPhases: ["marketing", "proposal", "prepare", "discover", "explore", "realize", "deploy"], canEdit: false, canExport: false, canManageTeam: false, canManageProject: false, canAccessAdmin: false },
];

const phases = [
  { id: "marketing", name: "Marketing", desc: "Generate leads, build brand, create sales collateral with AI" },
  { id: "proposal", name: "Proposal", desc: "Analyze RFPs and generate winning project proposals" },
  { id: "prepare", name: "Prepare", desc: "Set up project governance, charter, and risk assessment" },
  { id: "discover", name: "Discover", desc: "Assess fit-to-standard and map current processes" },
  { id: "explore", name: "Explore", desc: "Generate Functional Specification Documents with AI Agent Teams" },
  { id: "realize", name: "Realize", desc: "Build test scripts, configuration guides, and technical specs" },
  { id: "deploy", name: "Deploy", desc: "Prepare training materials, cutover plans, and go-live docs" },
];

const teamMembers = [
  { initials: "GP", name: "Gokul Palanisamy", email: "gokul.palanisamy@westernacher.com", role: "admin" as Role },
  { initials: "WL", name: "Wei Li", email: "wei.li@westernacher.com", role: "solution-architect" as Role },
  { initials: "FS", name: "Florian Schmidt", email: "florian.schmidt@westernacher.com", role: "project-manager" as Role },
  { initials: "AK", name: "Anna König", email: "anna.koenig@westernacher.com", role: "consultant" as Role },
  { initials: "MR", name: "Maria Rossi", email: "maria.rossi@westernacher.com", role: "marketing" as Role },
  { initials: "TJ", name: "Tom Jansen", email: "tom.jansen@westernacher.com", role: "presales" as Role },
  { initials: "KW", name: "Kristin Weber", email: "kristin.weber@westernacher.com", role: "viewer" as Role },
];

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export default function PrototypePage() {
  const [screen, setScreen] = useState<Screen>("login");
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [selectedRole, setSelectedRole] = useState<Role>("admin");

  const activePhase = phases[activePhaseIdx];
  const currentRole = roles.find((r) => r.id === selectedRole)!;
  const hasAccess = (phaseId: string) => currentRole.accessPhases.includes(phaseId);
  const firstAccessibleIdx = phases.findIndex((p) => hasAccess(p.id));

  /* Shared avatar */
  const Avatar = ({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" }) => (
    <div className={`${size === "md" ? "w-10 h-10 text-sm" : "w-7 h-7 text-[10px]"} rounded-full bg-[#1B2A4A] text-white font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );

  /* Status badge */
  const StatusBadge = ({ status }: { status: "complete" | "progress" | "locked" | "denied" | "readonly" }) => {
    const styles = {
      complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
      progress: "bg-blue-50 text-blue-700 border-blue-200",
      locked: "bg-slate-50 text-slate-400 border-slate-200",
      denied: "bg-red-50 text-red-500 border-red-200",
      readonly: "bg-amber-50 text-amber-600 border-amber-200",
    };
    const labels = { complete: "Complete", progress: "In Progress", locked: "Locked", denied: "No Access", readonly: "View Only" };
    return <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md border ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* ─── Top Prototype Nav ─── */}
      <div className="bg-[#1B2A4A] text-white px-6 py-2 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="font-bold tracking-wide text-[#0091DA]">PROTOTYPE</span>
          <span className="text-white/30">|</span>
          <span className="text-white/60">WE-AI Implementation Accelerator</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(
            [
              ["login", "Login"],
              ["dashboard", "Dashboard"],
              ["create-project", "New Project"],
              ["project-view", "Project"],
              ...(currentRole.canAccessAdmin ? [["admin", "Admin"]] : []),
            ] as [Screen, string][]
          ).map(([key, label]) => (
            <button key={key} onClick={() => setScreen(key)} className={`px-3 py-1 rounded transition-all ${screen === key ? "bg-[#0091DA] text-white" : "text-white/50 hover:text-white/80 hover:bg-white/10"}`}>
              {label}
            </button>
          ))}
          <div className="ml-3 pl-3 border-l border-white/15 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-[10px] font-semibold">GP</div>
            <span className="text-white/50">{currentRole.label}</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* LOGIN                                        */}
      {/* ════════════════════════════════════════════ */}
      {screen === "login" && (
        <div className="min-h-[calc(100vh-36px)] flex items-center justify-center bg-gradient-to-br from-[#1B2A4A] via-[#162340] to-[#0d1a33] relative overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0091DA]/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#0091DA]/5 rounded-full blur-[100px]" />

          <div className="w-full max-w-[1100px] relative z-10 px-8">
            <div className="text-center mb-10">
              <div className="text-2xl font-bold text-white tracking-tight">Westernacher</div>
              <div className="text-[11px] text-[#0091DA]/80 tracking-[0.25em] uppercase mt-1">Implementation Accelerator</div>
            </div>

            <div className="grid grid-cols-[1fr_360px] gap-10">
              {/* Role Selection */}
              <div>
                <div className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-4">Select role to preview access</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`text-left p-4 rounded-lg border transition-all ${
                        selectedRole === role.id
                          ? "border-[#0091DA]/60 bg-[#0091DA]/10"
                          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
                      }`}
                    >
                      <div className="text-sm font-semibold text-white/90 mb-0.5">{role.label}</div>
                      <p className="text-[11px] text-white/35 leading-relaxed mb-3">{role.desc}</p>
                      <div className="flex items-center gap-1">
                        {phases.map((p) => (
                          <div key={p.id} className={`h-1 flex-1 rounded-full ${role.accessPhases.includes(p.id) ? "bg-[#0091DA]" : "bg-white/8"}`} />
                        ))}
                      </div>
                      <div className="text-[10px] text-white/25 mt-2">{role.accessPhases.length} of {phases.length} phases</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Card */}
              <div className="bg-white rounded-xl shadow-2xl shadow-black/20 p-8">
                <h2 className="text-lg font-semibold text-[#1B2A4A] mb-0.5">Sign in</h2>
                <p className="text-sm text-slate-400 mb-6">Access your implementation projects</p>

                <button
                  onClick={() => { setActivePhaseIdx(Math.max(0, firstAccessibleIdx)); setScreen("dashboard"); }}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1B2A4A] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#243558] transition-all mb-4"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23" fill="white"><path d="M0 0h10.9v10.9H0zM12.1 0H23v10.9H12.1zM0 12.1h10.9V23H0zM12.1 12.1H23V23H12.1z" /></svg>
                  Continue with Microsoft
                </button>

                <div className="flex items-center gap-3 my-5"><div className="flex-1 h-px bg-slate-100" /><span className="text-[11px] text-slate-300">or</span><div className="flex-1 h-px bg-slate-100" /></div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">Email</label>
                    <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-400 bg-slate-50/50">gokul@westernacher.com</div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">Password</label>
                    <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-400 bg-slate-50/50">••••••••••</div>
                  </div>
                  <button onClick={() => { setActivePhaseIdx(Math.max(0, firstAccessibleIdx)); setScreen("dashboard"); }} className="w-full bg-[#0091DA] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#0081c4] transition-all">
                    Sign in
                  </button>
                </div>

                {/* Access preview */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-[11px] font-medium text-slate-400 mb-2">Access preview — {currentRole.label}</div>
                  <div className="flex flex-wrap gap-1">
                    {phases.map((p) => (
                      <span key={p.id} className={`text-[10px] px-2 py-0.5 rounded border font-medium ${hasAccess(p.id) ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-300 border-slate-200"}`}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* DASHBOARD                                    */}
      {/* ════════════════════════════════════════════ */}
      {screen === "dashboard" && (
        <div>
          <header className="bg-white border-b border-slate-200 px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-base font-bold text-[#1B2A4A]">Westernacher</span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] ml-2">Nonstop Innovation</span>
                </div>
                <nav className="flex items-center gap-1 text-sm">
                  {["Projects", "Templates", "Analytics", ...(currentRole.canAccessAdmin ? ["Admin"] : [])].map((tab, i) => (
                    <button key={tab} onClick={() => tab === "Admin" && setScreen("admin")} className={`px-3 py-1.5 rounded-md transition-all ${i === 0 ? "bg-[#0091DA]/10 text-[#0091DA] font-medium" : "text-slate-500 hover:text-[#1B2A4A] hover:bg-slate-50"}`}>
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-md border" style={{ backgroundColor: currentRole.bgColor, color: currentRole.color, borderColor: currentRole.color + "30" }}>
                  {currentRole.label}
                </span>
                <Avatar initials="GP" size="sm" />
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-semibold text-[#1B2A4A]">Welcome back, Gokul</h1>
                <p className="text-sm text-slate-400 mt-0.5">3 active projects · 2 pending review</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[11px] text-slate-400 border border-slate-200 rounded-md px-3 py-1.5 bg-white">
                  Access: <span className="font-medium text-[#1B2A4A]">{currentRole.accessPhases.length}/{phases.length} phases</span>
                  {!currentRole.canEdit && <span className="text-slate-300 ml-1">· Read-only</span>}
                </div>
                {currentRole.canManageProject && (
                  <button onClick={() => setScreen("create-project")} className="inline-flex items-center gap-1.5 bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#243558] transition-all">
                    <IconPlus className="w-4 h-4" /> New Project
                  </button>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[
                { label: "Active Projects", value: "3", sub: "+1 this month" },
                { label: "Documents Generated", value: "24", sub: "+8 this month" },
                { label: "Team Members", value: "7", sub: "Across 5 roles" },
                { label: "Completion Rate", value: "72%", sub: "Ahead of schedule" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-lg p-4 border border-slate-200/80">
                  <div className="text-[11px] text-slate-400 font-medium">{s.label}</div>
                  <div className="text-2xl font-semibold text-[#1B2A4A] mt-1">{s.value}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-5 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Lifecycle Pipeline</h3>
                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#0091DA]" />Accessible</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-slate-200" />Restricted</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {phases.map((phase, i) => {
                  const ok = hasAccess(phase.id);
                  return (
                    <div key={phase.id} className="flex items-center flex-1">
                      <div className={`flex-1 text-center py-3 rounded-md text-[11px] font-medium transition-all ${ok ? "bg-[#0091DA]/8 text-[#0091DA] border border-[#0091DA]/15" : "bg-slate-50 text-slate-300 border border-slate-100"}`}>
                        <div className="mb-1 flex justify-center">{ok ? phaseIcons[phase.id]("w-4 h-4") : <IconLock className="w-3.5 h-3.5" />}</div>
                        {phase.name}
                      </div>
                      {i < phases.length - 1 && <IconChevron className="w-3.5 h-3.5 text-slate-200 mx-0.5 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project list */}
            <div className="space-y-3">
              {[
                { name: "S/4HANA Greenfield Implementation", industry: "Manufacturing", modules: ["MM", "SD", "FI"], phase: "Explore", phaseIdx: 4, progress: 57, team: ["GP", "WL", "FS"], updated: "2h ago" },
                { name: "EWM Warehouse Transformation", industry: "Logistics", modules: ["EWM", "MM"], phase: "Prepare", phaseIdx: 2, progress: 28, team: ["GP", "AK"], updated: "1d ago" },
                { name: "FI/CO Finance Modernization", industry: "Financial Services", modules: ["FI", "CO"], phase: "Marketing", phaseIdx: 0, progress: 8, team: ["GP"], updated: "3d ago" },
              ].map((p, i) => {
                const ok = hasAccess(phases[p.phaseIdx].id);
                return (
                  <div key={i} onClick={() => { if (ok) { setActivePhaseIdx(p.phaseIdx); setScreen("project-view"); } }} className={`bg-white rounded-lg border border-slate-200/80 p-4 transition-all group ${ok ? "hover:border-[#0091DA]/30 hover:shadow-sm cursor-pointer" : "opacity-50 cursor-not-allowed"}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className={`text-sm font-semibold text-[#1B2A4A] truncate ${ok ? "group-hover:text-[#0091DA]" : ""}`}>{p.name}</h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#0091DA]/8 text-[#0091DA] flex-shrink-0">{p.phase}</span>
                          {!ok && <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-red-50 text-red-400 flex-shrink-0">Restricted</span>}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>{p.industry}</span>
                          <span className="text-slate-200">·</span>
                          <div className="flex gap-1">{p.modules.map((m) => <span key={m} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">{m}</span>)}</div>
                          <span className="text-slate-200">·</span>
                          <span>{p.updated}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 ml-4">
                        <div className="flex -space-x-1.5">{p.team.map((t, j) => <Avatar key={j} initials={t} />)}</div>
                        <div className="w-28">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Progress</span><span className="font-medium text-[#1B2A4A]">{p.progress}%</span></div>
                          <div className="h-1 bg-slate-100 rounded-full"><div className="h-full bg-[#0091DA] rounded-full" style={{ width: `${p.progress}%` }} /></div>
                        </div>
                        <IconChevron className={`w-4 h-4 ${ok ? "text-slate-300 group-hover:text-[#0091DA]" : "text-slate-200"}`} />
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
      {/* CREATE PROJECT                               */}
      {/* ════════════════════════════════════════════ */}
      {screen === "create-project" && (
        <div className="max-w-2xl mx-auto px-8 py-12">
          <button onClick={() => setScreen("dashboard")} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#0091DA] mb-6">
            <IconArrowLeft className="w-4 h-4" /> Back
          </button>

          {!currentRole.canManageProject ? (
            <div className="bg-white rounded-xl p-16 border border-slate-200/80 text-center">
              <IconLock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">Access restricted</h2>
              <p className="text-sm text-slate-400 mb-6">Your role ({currentRole.label}) cannot create projects.</p>
              <button onClick={() => setScreen("dashboard")} className="text-sm text-[#0091DA] font-medium hover:underline">Return to dashboard</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200/80">
              <h1 className="text-lg font-semibold text-[#1B2A4A] mb-1">New Project</h1>
              <p className="text-sm text-slate-400 mb-6">Set up a new SAP implementation project</p>

              <div className="space-y-5">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Project Name</label>
                  <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1B2A4A]">S/4HANA Greenfield Implementation</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Industry</label>
                    <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1B2A4A]">Manufacturing</div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Industry</label>
                    <div className="border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-400 flex items-center justify-between"><span>Manufacturing</span><IconChevron className="w-3.5 h-3.5 rotate-90 text-slate-300" /></div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-2">SAP Modules</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["MM", "SD", "FI", "CO", "PP", "EWM", "TM", "QM"].map((m) => (
                      <span key={m} className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-all ${["MM", "SD", "FI"].includes(m) ? "bg-[#1B2A4A] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{m}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-2">Starting Phase</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Marketing", desc: "Lead generation", id: "marketing" },
                      { label: "Proposal", desc: "RFP response", id: "proposal" },
                      { label: "Prepare", desc: "Governance", id: "prepare" },
                      { label: "Explore", desc: "FSD generation", id: "explore" },
                    ].map((ph, i) => {
                      const ok = hasAccess(ph.id);
                      return (
                        <div key={i} className={`p-3 rounded-lg border text-center transition-all ${!ok ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-40" : i === 0 ? "border-[#0091DA] bg-[#0091DA]/5" : "border-slate-200 hover:border-slate-300 cursor-pointer"}`}>
                          <div className="flex justify-center mb-1.5">{ok ? phaseIcons[ph.id]("w-4 h-4 text-slate-500") : <IconLock className="w-4 h-4 text-slate-300" />}</div>
                          <div className={`text-xs font-semibold ${!ok ? "text-slate-300" : i === 0 ? "text-[#0091DA]" : "text-[#1B2A4A]"}`}>{ph.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ok ? ph.desc : "No access"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => { setActivePhaseIdx(Math.max(0, firstAccessibleIdx)); setScreen("project-view"); }} className="w-full bg-[#1B2A4A] text-white rounded-lg py-3 text-sm font-medium hover:bg-[#243558] transition-all">
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* ADMIN                                        */}
      {/* ════════════════════════════════════════════ */}
      {screen === "admin" && (
        <div>
          <header className="bg-white border-b border-slate-200 px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setScreen("dashboard")} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#0091DA]"><IconArrowLeft className="w-4 h-4" /> Dashboard</button>
                <div className="h-4 w-px bg-slate-200" />
                <h1 className="text-sm font-semibold text-[#1B2A4A]">Administration</h1>
              </div>
              <button className="inline-flex items-center gap-1.5 bg-[#1B2A4A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#243558]"><IconPlus className="w-4 h-4" /> Invite Member</button>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-8 py-8">
            {!currentRole.canAccessAdmin ? (
              <div className="bg-white rounded-xl p-16 border border-slate-200/80 text-center max-w-lg mx-auto">
                <IconLock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">Administrator access required</h2>
                <p className="text-sm text-slate-400">Contact your administrator for access.</p>
              </div>
            ) : (
              <>
                {/* Access Matrix */}
                <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-[#1B2A4A]">Role Access Matrix</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phase-level permissions per role</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-[11px] font-medium text-slate-500 uppercase tracking-wider w-48">Role</th>
                          {phases.map((p) => (
                            <th key={p.id} className="px-2 py-3 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">{p.name}</th>
                          ))}
                          <th className="px-3 py-3 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">Edit</th>
                          <th className="px-3 py-3 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">Export</th>
                          <th className="px-3 py-3 text-center text-[10px] font-medium text-slate-400 uppercase tracking-wider">Admin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roles.map((role) => (
                          <tr key={role.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-[#1B2A4A]">{role.label}</span>
                            </td>
                            {phases.map((p) => (
                              <td key={p.id} className="px-2 py-3 text-center">
                                {role.accessPhases.includes(p.id) ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-500"><IconCheck className="w-3.5 h-3.5" /></span>
                                ) : (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-50 text-slate-300"><IconX className="w-3 h-3" /></span>
                                )}
                              </td>
                            ))}
                            <td className="px-3 py-3 text-center">{role.canEdit ? <span className="text-emerald-500"><IconCheck className="w-3.5 h-3.5 mx-auto" /></span> : <span className="text-slate-300"><IconX className="w-3 h-3 mx-auto" /></span>}</td>
                            <td className="px-3 py-3 text-center">{role.canExport ? <span className="text-emerald-500"><IconCheck className="w-3.5 h-3.5 mx-auto" /></span> : <span className="text-slate-300"><IconX className="w-3 h-3 mx-auto" /></span>}</td>
                            <td className="px-3 py-3 text-center">{role.canAccessAdmin ? <span className="text-[#E8491D]"><IconCheck className="w-3.5 h-3.5 mx-auto" /></span> : <span className="text-slate-300"><IconX className="w-3 h-3 mx-auto" /></span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1B2A4A]">Team Members</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{teamMembers.length} members</p>
                    </div>
                    <div className="flex items-center border border-slate-200 rounded-md px-3 py-1.5 bg-slate-50/50 w-52 gap-2">
                      <IconSearch className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[11px] text-slate-300">Search members...</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {teamMembers.map((m) => {
                      const mRole = roles.find((r) => r.id === m.role)!;
                      return (
                        <div key={m.initials} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                          <div className="flex items-center gap-3">
                            <Avatar initials={m.initials} size="md" />
                            <div>
                              <div className="text-sm font-medium text-[#1B2A4A]">{m.name}</div>
                              <div className="text-[11px] text-slate-400">{m.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] font-medium px-2.5 py-1 rounded-md border" style={{ backgroundColor: mRole.bgColor, color: mRole.color, borderColor: mRole.color + "30" }}>
                              {mRole.label}
                            </span>
                            <span className="text-[11px] text-slate-400">{mRole.accessPhases.length} phases</span>
                            <button className="text-[11px] text-slate-400 hover:text-[#0091DA] font-medium">Edit</button>
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
      {/* PROJECT VIEW                                 */}
      {/* ════════════════════════════════════════════ */}
      {screen === "project-view" && (
        <div>
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-8 py-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <button onClick={() => setScreen("dashboard")} className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0091DA] mb-0.5">
                    <IconArrowLeft className="w-3.5 h-3.5" /> All Projects
                  </button>
                  <h1 className="text-base font-semibold text-[#1B2A4A]">S/4HANA Greenfield Implementation</h1>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>Lead: Gokul Palanisamy</span>
                    <span className="text-slate-200">·</span>
                    <div className="flex gap-1">{["MM", "SD", "FI"].map((m) => <span key={m} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">{m}</span>)}</div>
                    <span className="text-slate-200">·</span>
                    <span className="px-1.5 py-0.5 rounded border text-[10px] font-medium" style={{ backgroundColor: currentRole.bgColor, color: currentRole.color, borderColor: currentRole.color + "30" }}>{currentRole.label}</span>
                    {!currentRole.canEdit && <span className="text-amber-500 font-medium">Read-only</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-2">
                    <div className="text-[11px] text-slate-400">Progress</div>
                    <div className="text-base font-semibold text-[#1B2A4A]">57%</div>
                  </div>
                  {currentRole.canManageProject && <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-sm hover:bg-slate-200"><IconSettings className="w-3.5 h-3.5" /> Settings</button>}
                  {currentRole.canExport && <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1B2A4A] text-white rounded-md text-sm hover:bg-[#243558]"><IconDownload className="w-3.5 h-3.5" /> Export</button>}
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="grid grid-cols-[260px_1fr] gap-6">
              {/* Sidebar */}
              <div className="space-y-1">
                <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-3 px-2">Lifecycle</div>
                {phases.map((phase, idx) => {
                  const ok = hasAccess(phase.id);
                  const isComplete = idx < 4;
                  const isActive = idx === 4;
                  const isLocked = idx > 4;
                  const isSel = activePhaseIdx === idx;

                  return (
                    <button
                      key={phase.id}
                      onClick={() => ok && !isLocked && setActivePhaseIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        !ok
                          ? "text-slate-300 cursor-not-allowed opacity-60"
                          : isSel
                          ? "bg-[#1B2A4A] text-white"
                          : isLocked
                          ? "text-slate-400 cursor-not-allowed hover:bg-slate-50"
                          : isComplete
                          ? "text-[#1B2A4A] hover:bg-slate-50"
                          : "text-[#1B2A4A] hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        !ok ? "bg-red-50" : isSel ? "bg-white/15" : isComplete ? "bg-emerald-50" : isActive ? "bg-blue-50" : "bg-slate-50"
                      }`}>
                        {!ok ? <IconLock className={`w-3.5 h-3.5 ${isSel ? "text-white/50" : "text-red-300"}`} /> : phaseIcons[phase.id](`w-4 h-4 ${isSel ? "text-white" : isComplete ? "text-emerald-600" : isActive ? "text-[#0091DA]" : "text-slate-400"}`)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isSel ? "text-white" : ""}`}>{phase.name}</div>
                        <div className={`text-[10px] ${isSel ? "text-white/60" : "text-slate-400"}`}>
                          {!ok ? "No access" : isComplete ? "Complete" : isActive ? "In progress" : isLocked ? "Locked" : ""}
                        </div>
                      </div>
                      {ok && isComplete && !isSel && <IconCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                      {(!ok || isLocked) && !isSel && <IconLock className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
                    </button>
                  );
                })}

                {/* Progress bar */}
                <div className="mt-6 px-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1.5"><span>Overall</span><span className="font-medium text-[#1B2A4A]">57%</span></div>
                  <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-[#0091DA] rounded-full" style={{ width: "57%" }} /></div>
                </div>

                {/* Permissions card */}
                <div className="mt-5 p-3.5 rounded-lg border border-slate-200/80 bg-white">
                  <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">Your Permissions</div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between"><span className="text-slate-400">Role</span><span className="font-medium" style={{ color: currentRole.color }}>{currentRole.label}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Phases</span><span className="font-medium text-[#1B2A4A]">{currentRole.accessPhases.length}/{phases.length}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Edit</span><span className={currentRole.canEdit ? "text-emerald-600 font-medium" : "text-red-400"}>
                      {currentRole.canEdit ? "Yes" : "No"}
                    </span></div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
                {/* Phase Header */}
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      {phases.indexOf(activePhase) < 2 ? "Pre-Project" : `Phase ${phases.indexOf(activePhase) - 1}`}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">{phaseIcons[activePhase.id]("w-4.5 h-4.5 text-[#1B2A4A]")}</div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#1B2A4A]">{activePhase.name}</h2>
                        <p className="text-[11px] text-slate-400">{activePhase.desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!hasAccess(activePhase.id) && <StatusBadge status="denied" />}
                    {hasAccess(activePhase.id) && !currentRole.canEdit && <StatusBadge status="readonly" />}
                    <StatusBadge status={activePhaseIdx < 4 ? "complete" : activePhaseIdx === 4 ? "progress" : "locked"} />
                  </div>
                </div>

                <div className="p-8">
                  {/* ACCESS DENIED */}
                  {!hasAccess(activePhase.id) && (
                    <div className="text-center py-16">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <IconLock className="w-6 h-6 text-slate-300" />
                      </div>
                      <h3 className="text-base font-semibold text-[#1B2A4A] mb-1">Access restricted</h3>
                      <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                        Your role ({currentRole.label}) does not include access to the {activePhase.name} phase. Contact your administrator to request access.
                      </p>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        {phases.filter((p) => hasAccess(p.id)).map((p) => {
                          const idx = phases.indexOf(p);
                          return (
                            <button key={p.id} onClick={() => setActivePhaseIdx(idx)} className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-slate-50 text-slate-600 font-medium hover:bg-[#0091DA]/10 hover:text-[#0091DA] transition-all">
                              {phaseIcons[p.id]("w-3.5 h-3.5")} {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* MARKETING */}
                  {hasAccess(activePhase.id) && activePhase.id === "marketing" && (
                    <div className="space-y-6">
                      <div className="bg-[#1B2A4A] rounded-lg p-6 text-white">
                        <h3 className="text-base font-semibold mb-1">AI-Powered Marketing Engine</h3>
                        <p className="text-sm text-white/60 mb-4">Generate professional sales collateral, thought leadership, and targeted outreach powered by your SAP domain expertise.</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] bg-white/10 text-white/70 px-2.5 py-1 rounded-md font-medium">12 assets created</span>
                          <span className="text-[11px] bg-white/10 text-white/70 px-2.5 py-1 rounded-md font-medium">3 campaigns active</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: "Case Study Generator", status: "complete", desc: "3 client success stories generated from past project data", count: "3 created" },
                          { name: "Industry Pitch Deck", status: "complete", desc: "Manufacturing-focused deck with SAP S/4HANA value propositions", count: "2 versions" },
                          { name: "Thought Leadership", status: "complete", desc: "5 blog posts and 2 whitepapers on S/4HANA migration", count: "7 articles" },
                          { name: "Competitor Analysis", status: "complete", desc: "Market positioning and competitive differentiators mapped", count: "4 reports" },
                          { name: "Email Campaign", status: "generating", desc: "AI generating personalized outreach for Manufacturing CIOs", count: "In progress" },
                          { name: "Event Proposals", status: "pending", desc: "SAP TechEd talk proposals and webinar outlines", count: "Queued" },
                        ].map((a, i) => (
                          <div key={i} className={`p-4 rounded-lg border transition-all ${currentRole.canEdit ? "hover:shadow-sm hover:border-slate-300 cursor-pointer" : ""} ${a.status === "generating" ? "border-[#0091DA]/20 bg-[#0091DA]/[0.02]" : "border-slate-200"}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#1B2A4A]">{a.name}</span>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${a.status === "complete" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : a.status === "generating" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}>
                                {a.count}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{a.desc}</p>
                            {a.status === "generating" && <div className="mt-3 h-1 bg-slate-100 rounded-full"><div className="h-full bg-[#0091DA] rounded-full w-1/2 animate-pulse" /></div>}
                          </div>
                        ))}
                      </div>

                      {currentRole.canEdit && (
                        <div className="flex items-center gap-2 justify-center pt-2">
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B2A4A] text-white rounded-md text-sm font-medium hover:bg-[#243558]"><IconPlus className="w-3.5 h-3.5" /> New Asset</button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-md text-sm hover:bg-slate-50"><IconGrid className="w-3.5 h-3.5" /> Analytics</button>
                          {currentRole.canExport && <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-md text-sm hover:bg-slate-50"><IconDownload className="w-3.5 h-3.5" /> Export</button>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROPOSAL */}
                  {hasAccess(activePhase.id) && activePhase.id === "proposal" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: "RFP Analysis", desc: "Extracted 47 requirements from client RFP" },
                          { name: "Proposal Document", desc: "40-page proposal with scope, timeline, team" },
                          { name: "Effort Estimation", desc: "1,240 person-days across 3 modules" },
                          { name: "Risk Assessment", desc: "12 risks identified, 4 high priority" },
                        ].map((a, i) => (
                          <div key={i} className={`p-4 rounded-lg border border-slate-200 transition-all ${currentRole.canEdit ? "hover:border-slate-300 hover:shadow-sm cursor-pointer" : ""}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#1B2A4A]">{a.name}</span>
                              <StatusBadge status="complete" />
                            </div>
                            <p className="text-[11px] text-slate-400">{a.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXPLORE */}
                  {hasAccess(activePhase.id) && activePhase.id === "explore" && (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 flex items-center gap-2">
                        <IconCheck className="w-4 h-4 text-emerald-600" />
                        <div className="text-sm text-emerald-800 font-medium">This phase is live</div>
                        <span className="text-[11px] text-emerald-600 ml-1">— FSD Generator with Agent Teams is deployed</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { name: "MM — Procurement FSD", status: "complete" as const, desc: "Generated with Agent Teams · 14 sections" },
                          { name: "SD — Sales FSD", status: "progress" as const, desc: "Agent Team: Phase 2 — Specialists running..." },
                          { name: "FI — Accounting FSD", status: "locked" as const, desc: "Queued · Will start after SD completes" },
                          { name: "Cross-Module Integration", status: "locked" as const, desc: "Requires all module FSDs to complete" },
                        ].map((a, i) => (
                          <div key={i} className="p-4 rounded-lg border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#1B2A4A]">{a.name}</span>
                              <StatusBadge status={a.status} />
                            </div>
                            <p className="text-[11px] text-slate-400">{a.desc}</p>
                            {a.status === "progress" && <div className="mt-3 h-1 bg-slate-100 rounded-full"><div className="h-full bg-[#0091DA] rounded-full w-2/3 animate-pulse" /></div>}
                          </div>
                        ))}
                      </div>
                      {currentRole.canEdit && (
                        <div className="flex items-center gap-2 pt-2 justify-center">
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1B2A4A] text-white rounded-md text-sm font-medium hover:bg-[#243558]">Generate Next FSD</button>
                          <button className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-md text-sm hover:bg-slate-50">View FSDs</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OTHER PHASES */}
                  {hasAccess(activePhase.id) && !["marketing", "proposal", "explore"].includes(activePhase.id) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {(activePhase.id === "prepare"
                          ? [{ name: "Project Charter", desc: "Governance, objectives, KPIs" }, { name: "Stakeholder Register", desc: "23 stakeholders across 4 departments" }, { name: "Risk Register", desc: "15 risks with mitigation plans" }, { name: "Implementation Roadmap", desc: "18-month timeline with milestones" }]
                          : activePhase.id === "discover"
                          ? [{ name: "Current State Analysis", desc: "AS-IS processes mapped for 3 modules" }, { name: "Fit-to-Standard Report", desc: "87% standard fit, 13% gaps" }, { name: "Solution Recommendations", desc: "S/4HANA + BTP + Fiori recommended" }, { name: "Business Case", desc: "ROI: 340% over 5 years" }]
                          : activePhase.id === "realize"
                          ? [{ name: "Test Scripts", desc: "Unit, integration, UAT test cases" }, { name: "Configuration Guide", desc: "Step-by-step SPRO configuration" }, { name: "Technical Specs", desc: "ABAP/Fiori development specs" }, { name: "Data Migration Plan", desc: "Object mapping and validation rules" }]
                          : [{ name: "Training Materials", desc: "Role-based user training guides" }, { name: "Cutover Runbook", desc: "Go-live checklist and procedures" }, { name: "End-User Docs", desc: "Quick reference cards and FAQs" }, { name: "Hypercare Plan", desc: "Post-go-live support procedures" }]
                        ).map((a, i) => {
                          const isComplete = activePhaseIdx < 4;
                          return (
                            <div key={i} className={`p-4 rounded-lg border border-slate-200 transition-all ${isComplete && currentRole.canEdit ? "hover:border-slate-300 hover:shadow-sm cursor-pointer" : ""}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-[#1B2A4A]">{a.name}</span>
                                <StatusBadge status={isComplete ? "complete" : "locked"} />
                              </div>
                              <p className="text-[11px] text-slate-400">{a.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                      {activePhaseIdx > 4 && (
                        <div className="text-center pt-4 text-sm text-slate-400 flex items-center justify-center gap-1.5">
                          <IconLock className="w-4 h-4" /> Complete Explore phase to unlock
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
