"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  RotateCcw,
  Loader2,
  CheckCircle2,
  User,
  Bot,
  FileText,
  MessageSquare,
  ChevronDown,
  Layers,
  Pencil,
} from "lucide-react";

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

/** Extract section titles from the markdown for the section selector dropdown */
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
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isModified = currentMarkdown !== originalMarkdown;

  // Extract sections from current markdown
  const availableSections = useMemo(
    () => extractSections(currentMarkdown),
    [currentMarkdown]
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsSectionDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSend() {
    const instruction = input.trim();
    if (!instruction || isRefining) return;

    const sectionLabel = targetSection
      ? `[Section: ${targetSection}] `
      : "";

    // Add user message
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
        // Handle timeout (504) or other non-JSON responses
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

      // Add success message
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

      // Add error message
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

  function handleSectionSelect(sectionTitle: string) {
    setTargetSection(sectionTitle);
    setIsSectionDropdownOpen(false);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Chat Panel */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Refine Document
            </CardTitle>
            {isModified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-navy h-7"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Section Selector */}
          <div className="mb-3" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border transition-all ${
                  targetSection
                    ? "border-[#0091DA] bg-[#0091DA]/5 text-[#0091DA]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  {targetSection ? (
                    <Pencil className="h-3.5 w-3.5" />
                  ) : (
                    <Layers className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate">
                    {targetSection
                      ? `Editing: ${targetSection}`
                      : "Entire Document"}
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform flex-shrink-0 ${
                    isSectionDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {isSectionDropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                  {/* Entire Document option */}
                  <button
                    onClick={() => {
                      setTargetSection("");
                      setIsSectionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      !targetSection
                        ? "bg-[#0091DA]/5 text-[#0091DA] font-medium"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Entire Document</span>
                    {!targetSection && (
                      <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-[#0091DA]" />
                    )}
                  </button>

                  <div className="h-px bg-slate-100 my-0.5" />

                  {/* Section options */}
                  {availableSections.map((section) => (
                    <button
                      key={section.number}
                      onClick={() =>
                        handleSectionSelect(section.title)
                      }
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        targetSection === section.title
                          ? "bg-[#0091DA]/5 text-[#0091DA] font-medium"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0 flex-shrink-0 font-mono"
                      >
                        {section.number}
                      </Badge>
                      <span className="truncate">{section.title}</span>
                      {targetSection === section.title && (
                        <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-[#0091DA] flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {targetSection && (
              <p className="text-[10px] text-[#0091DA]/70 mt-1 px-1">
                Changes will only affect Section &ldquo;{targetSection}&rdquo;
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="max-h-[300px] overflow-y-auto mb-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p>Ask WE-AI to refine your document.</p>
                <p className="text-xs mt-1">
                  Select a section above to edit individual chapters, or edit
                  the entire document.
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
                      <div className="h-6 w-6 rounded-full bg-navy/10 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-navy" />
                      </div>
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[85%] ${
                      msg.role === "user"
                        ? "bg-navy text-white"
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
                      <div className="h-6 w-6 rounded-full bg-navy flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {isRefining && (
              <div className="flex gap-2 items-center text-sm text-muted-foreground">
                <div className="h-6 w-6 rounded-full bg-navy/10 flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 text-navy animate-spin" />
                </div>
                <span>
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
                  ? `Edit "${targetSection}"...`
                  : "Type your changes..."
              }
              className="min-h-[44px] max-h-[120px] resize-none text-sm"
              rows={1}
              disabled={isRefining}
            />
            <Button
              size="icon"
              className="bg-navy hover:bg-navy-light text-white flex-shrink-0 h-[44px] w-[44px]"
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

      {/* Recent Documents */}
      {recentFsds.length > 0 && (
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-navy flex items-center gap-2">
              <FileText className="h-4 w-4" />
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
                    className="bg-navy/10 text-navy text-[10px] px-1.5 py-0 flex-shrink-0"
                  >
                    {fsd.primaryModule}
                  </Badge>
                  <span className="text-xs text-foreground truncate group-hover:text-navy transition-colors flex-1">
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
              className="text-xs text-wc-blue hover:underline mt-2 block"
            >
              View all documents
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
