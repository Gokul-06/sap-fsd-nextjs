"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  SECTION_CONFIGS,
  SECTION_GROUPS,
  SOURCE_LABELS,
  type SectionConfig,
} from "@/lib/constants/section-config";
import {
  Send,
  RotateCcw,
  Loader2,
  CheckCircle2,
  User,
  Bot,
  FileText,
  MessageSquare,
  Layers,
  ClipboardList,
  Target,
  Lightbulb,
  Settings,
  Database,
  Link2,
  Shield,
  Printer,
  AlertTriangle,
  ArrowRightLeft,
  FlaskConical,
  Rocket,
  BookOpen,
  LayoutGrid,
  Cpu,
  CalendarCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// ─── Icon mapping for each section ───────────────────────────────────────
const SECTION_ICONS: Record<string, LucideIcon> = {
  doc_control: ClipboardList,
  executive_summary: FileText,
  business_requirements: Target,
  proposed_solution: Lightbulb,
  sap_configuration: Settings,
  technical_objects: Database,
  integration: Link2,
  authorization: Shield,
  output_forms: Printer,
  error_handling: AlertTriangle,
  migration: ArrowRightLeft,
  testing: FlaskConical,
  cutover: Rocket,
  appendix: BookOpen,
};

const GROUP_ICONS: Record<string, LucideIcon> = {
  core: LayoutGrid,
  technical: Cpu,
  project: CalendarCheck,
};

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
  core: {
    bg: "bg-sky-50/60",
    border: "border-sky-200/60",
    text: "text-sky-700",
    accent: "bg-sky-500",
  },
  technical: {
    bg: "bg-violet-50/60",
    border: "border-violet-200/60",
    text: "text-violet-700",
    accent: "bg-violet-500",
  },
  project: {
    bg: "bg-amber-50/60",
    border: "border-amber-200/60",
    text: "text-amber-700",
    accent: "bg-amber-500",
  },
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  editedSection?: string;
}

interface RecentFsd {
  id: string;
  title: string;
  primaryModule: string;
  createdAt: string;
}

interface RefinementChatProps {
  currentMarkdown: string;
  originalMarkdown: string;
  onMarkdownUpdate: (markdown: string) => void;
}

/** Extract section titles from the markdown for matching */
function extractSections(markdown: string): Array<{ title: string; number: string }> {
  const sections: Array<{ title: string; number: string }> = [];
  const regex = /^## (\d+)\.\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    sections.push({
      number: match[1],
      title: match[2].trim(),
    });
  }
  return sections;
}

export function RefinementChat({
  currentMarkdown,
  originalMarkdown,
  onMarkdownUpdate,
}: RefinementChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [recentFsds, setRecentFsds] = useState<RecentFsd[]>([]);
  const [targetSection, setTargetSection] = useState<string>("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isModified = currentMarkdown !== originalMarkdown;

  // Extract sections from current markdown to know which are present
  const presentSections = useMemo(
    () => extractSections(currentMarkdown),
    [currentMarkdown]
  );

  // Map of section numbers that exist in the document
  const presentSectionNumbers = useMemo(
    () => new Set(presentSections.map((s) => s.number)),
    [presentSections]
  );

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch recent FSDs on mount
  useEffect(() => {
    fetch("/api/fsd?take=5")
      .then((res) => res.json())
      .then((data) => {
        if (data?.fsds && Array.isArray(data.fsds)) {
          setRecentFsds(data.fsds);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-show chat when a section is selected
  useEffect(() => {
    if (targetSection) {
      setShowChat(true);
      // Delay focus to allow animation
      setTimeout(() => textareaRef.current?.focus(), 200);
    }
  }, [targetSection]);

  async function handleSend() {
    const instruction = input.trim();
    if (!instruction || isRefining) return;

    const sectionLabel = targetSection
      ? `[Section: ${targetSection}] `
      : "";

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `${sectionLabel}${instruction}`,
      timestamp: new Date(),
      editedSection: targetSection || undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsRefining(true);

    try {
      const res = await fetch("/api/fsd/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: currentMarkdown,
          instruction,
          targetSection: targetSection || undefined,
        }),
      });

      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Server error (${res.status})`);
        } else {
          throw new Error(
            res.status === 504
              ? "Request timed out. Try a simpler instruction."
              : `Server error (${res.status}). Please try again.`
          );
        }
      }

      const data = await res.json();
      onMarkdownUpdate(data.markdown);

      const sectionNote = data.editedSection
        ? ` Updated section: "${data.editedSection}".`
        : "";
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Changes applied successfully.${sectionNote}`,
        timestamp: new Date(),
        editedSection: data.editedSection,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refinement failed";
      toast({
        title: "Refinement failed",
        description: message,
        variant: "destructive",
      });

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Failed: ${message}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsRefining(false);
    }
  }

  function handleReset() {
    onMarkdownUpdate(originalMarkdown);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Document reset to original version.",
        timestamp: new Date(),
      },
    ]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSectionSelect(sectionConfig: SectionConfig) {
    const matchedTitle = presentSections.find(
      (s) => s.number === String(sectionConfig.number)
    )?.title;

    if (matchedTitle) {
      setTargetSection(matchedTitle);
    }
  }

  function handleSelectEntireDoc() {
    setTargetSection("");
    setShowChat(true);
    setTimeout(() => textareaRef.current?.focus(), 200);
  }

  // Group sections by their group
  const groupedSections = useMemo(() => {
    return SECTION_GROUPS.map((group) => ({
      ...group,
      sections: SECTION_CONFIGS.filter((s) => s.group === group.key),
    }));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Section Navigator */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-[#1B2A4A] to-[#0091DA] text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Section Navigator
            </CardTitle>
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-white/70 hover:text-white hover:bg-white/10 h-7"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
          <p className="text-[10px] text-white/60 mt-0.5">
            Click a section to refine it with AI
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* "Entire Document" option */}
          <button
            onClick={handleSelectEntireDoc}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 border-b border-slate-100 ${
              !targetSection && showChat
                ? "bg-gradient-to-r from-[#0091DA]/10 to-[#0091DA]/5 text-[#0091DA]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-lg transition-all ${
                !targetSection && showChat
                  ? "bg-[#0091DA] text-white shadow-md shadow-[#0091DA]/30"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-medium text-[13px]">Entire Document</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Refine the full FSD at once
              </p>
            </div>
            {!targetSection && showChat && (
              <CheckCircle2 className="h-4 w-4 text-[#0091DA] flex-shrink-0" />
            )}
          </button>

          {/* Grouped Sections */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {groupedSections.map((group) => {
              const colors = GROUP_COLORS[group.key];
              const GroupIcon = GROUP_ICONS[group.key];

              return (
                <div key={group.key}>
                  {/* Group Header */}
                  <div className={`sticky top-0 z-10 flex items-center gap-2 px-4 py-2 ${colors.bg} border-b ${colors.border} backdrop-blur-sm`}>
                    <div className={`h-1 w-1 rounded-full ${colors.accent}`} />
                    <GroupIcon className={`h-3.5 w-3.5 ${colors.text}`} />
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${colors.text}`}>
                      {group.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {group.sections.length}
                    </span>
                  </div>

                  {/* Section Items */}
                  {group.sections.map((section) => {
                    const SectionIcon = SECTION_ICONS[section.id] || FileText;
                    const isPresent = presentSectionNumbers.has(String(section.number));
                    const matchedTitle = presentSections.find(
                      (s) => s.number === String(section.number)
                    )?.title;
                    const isSelected = targetSection === matchedTitle && !!matchedTitle;
                    const sourceInfo = SOURCE_LABELS[section.source];

                    return (
                      <button
                        key={section.id}
                        onClick={() => isPresent && handleSectionSelect(section)}
                        disabled={!isPresent}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 border-b border-slate-50 group ${
                          isSelected
                            ? "bg-gradient-to-r from-[#0091DA]/10 to-transparent"
                            : isPresent
                            ? "hover:bg-slate-50/80 cursor-pointer"
                            : "opacity-40 cursor-not-allowed"
                        }`}
                      >
                        {/* Section Icon */}
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-lg flex-shrink-0 transition-all duration-200 ${
                            isSelected
                              ? "bg-[#0091DA] text-white shadow-md shadow-[#0091DA]/25 scale-105"
                              : isPresent
                              ? `bg-slate-100 text-slate-500 group-hover:bg-[#0091DA]/10 group-hover:text-[#0091DA] group-hover:scale-105`
                              : "bg-slate-50 text-slate-300"
                          }`}
                        >
                          <SectionIcon className="h-4 w-4" />
                        </div>

                        {/* Section Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? "bg-[#0091DA]/15 text-[#0091DA]"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {section.number}
                            </span>
                            <span
                              className={`font-medium text-[12px] truncate ${
                                isSelected
                                  ? "text-[#0091DA]"
                                  : isPresent
                                  ? "text-slate-700 group-hover:text-[#0091DA]"
                                  : "text-slate-400"
                              }`}
                            >
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${sourceInfo.color}`}
                            >
                              {sourceInfo.label}
                            </span>
                            {!isPresent && (
                              <span className="text-[9px] text-slate-400 italic">
                                Not in document
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-[#0091DA] animate-pulse" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Chat Panel — slides in when a section is selected or user clicks "Entire Document" */}
      {showChat && (
        <Card className="border-none shadow-sm animate-fade-in-up">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-[#1B2A4A] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#0091DA]" />
                {targetSection ? (
                  <span className="flex items-center gap-1.5">
                    Refine:
                    <Badge className="bg-[#0091DA]/10 text-[#0091DA] border-0 text-[11px] font-medium max-w-[180px] truncate">
                      {targetSection}
                    </Badge>
                  </span>
                ) : (
                  "Refine Entire Document"
                )}
              </CardTitle>
              <button
                onClick={() => {
                  setShowChat(false);
                  setTargetSection("");
                }}
                className="text-xs text-muted-foreground hover:text-slate-700 transition-colors px-2 py-1 rounded hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            {targetSection && (
              <p className="text-[10px] text-[#0091DA]/60 mt-0.5">
                Changes will only affect this section
              </p>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {/* Messages */}
            <div className="max-h-[250px] overflow-y-auto mb-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center py-5 text-sm text-muted-foreground">
                  <Bot className="h-7 w-7 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-[13px]">
                    {targetSection
                      ? `Tell WE-AI how to improve "${targetSection}"`
                      : "Ask WE-AI to refine your document"}
                  </p>
                  <p className="text-[11px] mt-1 text-muted-foreground/60">
                    e.g. &ldquo;Add more detail about error handling&rdquo;
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 text-sm ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                          <Bot className="h-3.5 w-3.5 text-[#1B2A4A]" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-[#1B2A4A] text-white"
                          : msg.content.startsWith("Failed:")
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {msg.role === "assistant" &&
                        !msg.content.startsWith("Failed:") &&
                        !msg.content.startsWith("Document reset") && (
                          <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                        )}
                      {msg.editedSection && msg.role === "user" && (
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white/80 text-[9px] px-1.5 py-0 mr-1.5 mb-0.5 inline-flex"
                        >
                          {msg.editedSection}
                        </Badge>
                      )}
                      {msg.role === "user"
                        ? msg.content.replace(
                            /^\[Section: .+?\]\s*/,
                            ""
                          )
                        : msg.content}
                    </div>
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="h-6 w-6 rounded-full bg-[#1B2A4A] flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isRefining && (
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <div className="h-6 w-6 rounded-full bg-[#1B2A4A]/10 flex items-center justify-center">
                    <Loader2 className="h-3.5 w-3.5 text-[#0091DA] animate-spin" />
                  </div>
                  <span className="text-[13px]">
                    WE-AI is{" "}
                    {targetSection
                      ? `updating "${targetSection}"...`
                      : "refining your document..."}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  targetSection
                    ? `How should I improve "${targetSection}"?`
                    : "Describe the changes you want..."
                }
                className="min-h-[44px] max-h-[120px] resize-none text-sm border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                rows={1}
                disabled={isRefining}
              />
              <Button
                size="icon"
                className="bg-gradient-to-b from-[#0091DA] to-[#1B2A4A] hover:from-[#0091DA]/90 hover:to-[#1B2A4A]/90 text-white flex-shrink-0 h-[44px] w-[44px] shadow-md"
                onClick={handleSend}
                disabled={!input.trim() || isRefining}
              >
                {isRefining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isModified && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                Document has been modified from original
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Documents */}
      {recentFsds.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B2A4A] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0091DA]" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {recentFsds.map((fsd) => (
                <Link
                  key={fsd.id}
                  href={`/fsd/${fsd.id}`}
                  target="_blank"
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 transition-colors group"
                >
                  <Badge
                    variant="secondary"
                    className="bg-[#1B2A4A]/10 text-[#1B2A4A] text-[10px] px-1.5 py-0 flex-shrink-0"
                  >
                    {fsd.primaryModule}
                  </Badge>
                  <span className="text-xs text-foreground truncate group-hover:text-[#0091DA] transition-colors flex-1">
                    {fsd.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {new Date(fsd.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/history"
              className="text-xs text-[#0091DA] hover:underline mt-2 block"
            >
              View all documents
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
