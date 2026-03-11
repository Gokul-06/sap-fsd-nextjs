"use client";

import { Lock, Sparkles, Database, FileText, Check } from "lucide-react";
import {
  SECTION_CONFIGS,
  SECTION_PRESETS,
  SECTION_GROUPS,
  SOURCE_LABELS,
  type SectionConfig,
} from "@/lib/constants/section-config";

interface SectionSelectorProps {
  selectedSections: Set<string>;
  onSelectionChange: (sections: Set<string>) => void;
}

export function SectionSelector({
  selectedSections,
  onSelectionChange,
}: SectionSelectorProps) {
  const toggleSection = (id: string) => {
    const section = SECTION_CONFIGS.find((s) => s.id === id);
    if (section?.required) return; // Can't toggle required sections
    const next = new Set(selectedSections);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const applyPreset = (sectionIds: string[]) => {
    // Always include required sections
    const required = SECTION_CONFIGS.filter((s) => s.required).map((s) => s.id);
    const next = new Set([...sectionIds, ...required]);
    onSelectionChange(next);
  };

  const activePreset = SECTION_PRESETS.find(
    (p) =>
      p.sectionIds.length === selectedSections.size &&
      p.sectionIds.every((id) => selectedSections.has(id))
  );

  const selectedCount = selectedSections.size;
  const totalCount = SECTION_CONFIGS.length;

  const sourceIcon = (source: string) => {
    switch (source) {
      case "ai":
        return <Sparkles className="h-3 w-3" />;
      case "registry":
        return <Database className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-[#1B2A4A]">
          Customize Your FSD
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Select which sections to include in your document ({selectedCount} of{" "}
          {totalCount} selected)
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SECTION_PRESETS.map((preset) => {
          const isActive = activePreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.sectionIds)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#0091DA] text-white shadow-md shadow-[#0091DA]/20"
                  : "bg-white/70 text-gray-600 hover:bg-white hover:text-[#0091DA] border border-gray-200 hover:border-[#0091DA]/30"
              }`}
            >
              {preset.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({preset.sectionIds.length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Section Groups */}
      <div className="space-y-5">
        {SECTION_GROUPS.map((group) => {
          const groupSections = SECTION_CONFIGS.filter(
            (s) => s.group === group.key
          );

          return (
            <div key={group.key}>
              {/* Group Header */}
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1B2A4A]/60">
                  {group.label}
                </h3>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">
                  {group.description}
                </span>
              </div>

              {/* Section Cards */}
              <div className="grid gap-2 sm:grid-cols-2">
                {groupSections.map((section) => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    isSelected={selectedSections.has(section.id)}
                    onToggle={() => toggleSection(section.id)}
                    sourceIcon={sourceIcon(section.source)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  isSelected,
  onToggle,
  sourceIcon,
}: {
  section: SectionConfig;
  isSelected: boolean;
  onToggle: () => void;
  sourceIcon: React.ReactNode;
}) {
  const sourceStyle = SOURCE_LABELS[section.source];

  return (
    <button
      onClick={onToggle}
      disabled={section.required}
      className={`group relative flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
        isSelected
          ? "border-[#0091DA]/30 bg-white shadow-sm"
          : "border-gray-200 bg-gray-50/50 opacity-60"
      } ${
        section.required
          ? "cursor-default"
          : "cursor-pointer hover:border-[#0091DA]/40 hover:shadow-md"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
          isSelected
            ? "border-[#0091DA] bg-[#0091DA]"
            : "border-gray-300 bg-white"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0091DA]">
            {section.number}
          </span>
          <span className="text-sm font-semibold text-[#1B2A4A] truncate">
            {section.title}
          </span>
          {section.required && (
            <Lock className="h-3 w-3 shrink-0 text-amber-500" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
          {section.description}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceStyle.color}`}
          >
            {sourceIcon}
            {sourceStyle.label}
          </span>
          {section.agentOwner && (
            <span className="text-[10px] text-gray-400">
              via {section.agentOwner}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
