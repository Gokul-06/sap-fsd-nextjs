"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Inbox,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────
interface FeedbackItem {
  id: string;
  fsdId: string | null;
  feedbackType: string;
  section: string | null;
  description: string;
  userEmail: string | null;
  fsdModule: string | null;
  fsdTitle: string | null;
  generationMode: string | null;
  status: string;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  fsd?: { id: string; title: string; primaryModule: string } | null;
}

interface Stats {
  total: number;
  new: number;
  reviewing: number;
  resolved: number;
  wont_fix: number;
  resolvedThisWeek: number;
}

// ── Constants ───────────────────────────────────────────
const STATUS_CONFIG = {
  new: { label: "New", color: "bg-red-100 text-red-700", icon: Inbox },
  reviewing: { label: "Reviewing", color: "bg-amber-100 text-amber-700", icon: Eye },
  resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  wont_fix: { label: "Won't Fix", color: "bg-slate-100 text-slate-600", icon: XCircle },
} as const;

const TYPE_LABELS: Record<string, string> = {
  bug: "Bug / Error",
  incorrect_config: "Incorrect Config",
  missing_info: "Missing Info",
  improvement: "Improvement",
  general: "General",
};

const SECTION_LABELS: Record<string, string> = {
  process_scope: "Executive Summary",
  process_flow: "Process Flow",
  configuration: "Configuration",
  integration: "Integration",
  authorization: "Authorization",
  output_management: "Output Management",
  error_handling: "Error Handling",
  data_migration: "Data Migration",
  testing: "Testing",
  cutover: "Cutover Plan",
  appendix: "Appendix",
  entire_document: "Entire Document",
};

// ── Page ────────────────────────────────────────────────
export default function FeedbackDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotesMap, setAdminNotesMap] = useState<Record<string, string>>({});
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterType !== "all") params.set("feedbackType", filterType);
      if (filterModule !== "all") params.set("module", filterModule);
      params.set("take", "50");

      const [feedbackRes, statsRes] = await Promise.all([
        fetch(`/api/fsd-feedback?${params}`),
        fetch("/api/fsd-feedback/stats"),
      ]);

      if (feedbackRes.ok) {
        const data = await feedbackRes.json();
        setFeedbacks(data.feedbacks);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, filterModule]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(feedbackId: string, newStatus: string) {
    setUpdatingIds((prev) => new Set(prev).add(feedbackId));
    try {
      const res = await fetch(`/api/fsd-feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNotesMap[feedbackId] || undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, ...updated } : f))
        );
        toast({ title: `Status updated to "${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus}"` });
        // Refresh stats
        const statsRes = await fetch("/api/fsd-feedback/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (error) {
      console.error("Failed to update:", error);
      toast({ title: "Update failed", variant: "destructive" });
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(feedbackId);
        return next;
      });
    }
  }

  async function handleSaveNotes(feedbackId: string) {
    const notes = adminNotesMap[feedbackId];
    if (!notes) return;

    setUpdatingIds((prev) => new Set(prev).add(feedbackId));
    try {
      const feedback = feedbacks.find((f) => f.id === feedbackId);
      const res = await fetch(`/api/fsd-feedback/${feedbackId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: feedback?.status || "reviewing",
          adminNotes: notes,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, ...updated } : f))
        );
        toast({ title: "Notes saved" });
      }
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(feedbackId);
        return next;
      });
    }
  }

  async function handleDelete(feedbackId: string) {
    if (!confirm("Delete this feedback? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/fsd-feedback/${feedbackId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));
        toast({ title: "Feedback deleted" });
        const statsRes = await fetch("/api/fsd-feedback/stats");
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Feedback Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage user-reported issues from FSD generation
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{stats.new}</p>
              <p className="text-xs text-red-600 font-medium">New</p>
            </CardContent>
          </Card>
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{stats.reviewing}</p>
              <p className="text-xs text-amber-600 font-medium">Reviewing</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{stats.resolved}</p>
              <p className="text-xs text-emerald-600 font-medium">Resolved</p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-600">{stats.total}</p>
              <p className="text-xs text-slate-500 font-medium">Total</p>
              {stats.resolvedThisWeek > 0 && (
                <p className="text-[10px] text-emerald-600 mt-1">
                  +{stats.resolvedThisWeek} resolved this week
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1 block">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              <label className="text-xs text-muted-foreground mb-1 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">Bug / Error</SelectItem>
                  <SelectItem value="incorrect_config">Incorrect Config</SelectItem>
                  <SelectItem value="missing_info">Missing Info</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <label className="text-xs text-muted-foreground mb-1 block">Module</label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {["MM", "SD", "FI", "CO", "PP", "QM", "EWM", "TM"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : feedbacks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No feedback found</p>
            <p className="text-sm text-muted-foreground/70">
              {filterStatus !== "all" || filterType !== "all" || filterModule !== "all"
                ? "Try adjusting your filters."
                : "Feedback will appear here when users report issues."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => {
            const isExpanded = expandedId === fb.id;
            const statusConf = STATUS_CONFIG[fb.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
            const StatusIcon = statusConf.icon;

            return (
              <Card key={fb.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Main row */}
                  <button
                    className="w-full text-left p-4 flex items-start gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {/* Badges row */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={`${statusConf.color} text-[11px] gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConf.label}
                        </Badge>
                        <Badge variant="outline" className="text-[11px]">
                          {TYPE_LABELS[fb.feedbackType] || fb.feedbackType}
                        </Badge>
                        {fb.fsdModule && (
                          <Badge className="bg-sky-100 text-sky-700 text-[11px]">
                            {fb.fsdModule}
                          </Badge>
                        )}
                        {fb.section && (
                          <Badge variant="secondary" className="text-[11px]">
                            {SECTION_LABELS[fb.section] || fb.section}
                          </Badge>
                        )}
                        {fb.generationMode && (
                          <Badge variant="secondary" className="text-[10px] text-violet-600 bg-violet-50">
                            {fb.generationMode}
                          </Badge>
                        )}
                      </div>

                      {/* Description preview */}
                      <p className={`text-sm text-slate-700 ${isExpanded ? "" : "line-clamp-2"}`}>
                        {fb.description}
                      </p>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {fb.fsdTitle && (
                          <span className="truncate max-w-[200px]" title={fb.fsdTitle}>
                            FSD: {fb.fsdTitle}
                          </span>
                        )}
                        {fb.userEmail && (
                          <span>{fb.userEmail}</span>
                        )}
                        <span>{new Date(fb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </button>

                  {/* Expanded panel */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4 pt-3 bg-slate-50/50 space-y-4">
                      {/* Full description */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Full Description</label>
                        <div className="text-sm bg-white rounded-lg border p-3 whitespace-pre-wrap">
                          {fb.description}
                        </div>
                      </div>

                      {/* Link to FSD */}
                      {fb.fsdId && (
                        <Link
                          href={`/fsd/${fb.fsdId}`}
                          className="inline-flex items-center gap-1 text-sm text-wc-blue hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View FSD Document
                        </Link>
                      )}

                      {/* Admin Notes */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          Admin Notes
                        </label>
                        <Textarea
                          value={adminNotesMap[fb.id] ?? fb.adminNotes ?? ""}
                          onChange={(e) =>
                            setAdminNotesMap((prev) => ({
                              ...prev,
                              [fb.id]: e.target.value,
                            }))
                          }
                          placeholder="Add internal notes about this feedback..."
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => handleSaveNotes(fb.id)}
                          disabled={updatingIds.has(fb.id)}
                        >
                          {updatingIds.has(fb.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Save Notes
                        </Button>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-muted-foreground">Status:</label>
                          <Select
                            value={fb.status}
                            onValueChange={(val) => handleStatusChange(fb.id, val)}
                          >
                            <SelectTrigger className="h-8 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="reviewing">Reviewing</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="wont_fix">Won&apos;t Fix</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                          onClick={() => handleDelete(fb.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>

                      {fb.resolvedAt && (
                        <p className="text-[11px] text-muted-foreground">
                          Resolved: {new Date(fb.resolvedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
