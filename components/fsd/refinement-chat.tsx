"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isModified = currentMarkdown !== originalMarkdown;

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

  async function handleSend() {
    const instruction = input.trim();
    if (!instruction || isRefining) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: instruction,
      timestamp: new Date(),
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
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Refinement failed");
      }

      const data = await res.json();
      onMarkdownUpdate(data.markdown);

      // Add success message
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Changes applied successfully.",
        timestamp: new Date(),
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
          {/* Messages */}
          <div className="max-h-[300px] overflow-y-auto mb-3 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                <Bot className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p>Ask WE-AI to refine your document.</p>
                <p className="text-xs mt-1">
                  e.g. &ldquo;Add more detail to the authorization section&rdquo;
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
                    {msg.role === "assistant" && !msg.content.startsWith("Failed:") && !msg.content.startsWith("Document reset") && (
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                    )}
                    {msg.content}
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
                <span>WE-AI is refining your document...</span>
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
              placeholder="Type your changes..."
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
