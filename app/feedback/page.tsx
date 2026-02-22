"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

interface FeedbackRule {
  id: string;
  module: string;
  processArea: string | null;
  ruleType: string;
  content: string;
  source: string;
  active: boolean;
  appliedCount: number;
  createdAt: string;
}

const MODULES = ["MM", "SD", "FI", "CO", "PP", "QM", "EWM", "TM", "PM", "PS"];
const RULE_TYPES = [
  { value: "content_improvement", label: "Content Improvement" },
  { value: "structure", label: "Structure" },
  { value: "validation", label: "Validation" },
  { value: "terminology", label: "Terminology" },
];

export default function FeedbackPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<FeedbackRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New rule form state
  const [newModule, setNewModule] = useState("MM");
  const [newProcessArea, setNewProcessArea] = useState("");
  const [newRuleType, setNewRuleType] = useState("content_improvement");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchRules();
  }, [filterModule]);

  async function fetchRules() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterModule !== "all") params.set("module", filterModule);
      const res = await fetch(`/api/feedback-rules?${params}`);
      const data = await res.json();
      setRules(data);
    } catch {
      toast({ title: "Failed to load rules", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(ruleId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/feedback-rules/${ruleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) => (r.id === ruleId ? { ...r, active: !currentActive } : r))
        );
        toast({ title: `Rule ${!currentActive ? "activated" : "deactivated"}` });
      }
    } catch {
      toast({ title: "Failed to toggle rule", variant: "destructive" });
    }
  }

  async function handleDelete(ruleId: string) {
    if (!confirm("Delete this feedback rule?")) return;
    try {
      const res = await fetch(`/api/feedback-rules/${ruleId}`, { method: "DELETE" });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
        toast({ title: "Rule deleted" });
      }
    } catch {
      toast({ title: "Failed to delete rule", variant: "destructive" });
    }
  }

  async function handleCreate() {
    if (!newContent.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/feedback-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: newModule,
          processArea: newProcessArea || null,
          ruleType: newRuleType,
          content: newContent.trim(),
          source: "manual",
        }),
      });
      if (res.ok) {
        const rule = await res.json();
        setRules((prev) => [rule, ...prev]);
        setNewContent("");
        setNewProcessArea("");
        setShowCreateForm(false);
        toast({ title: "Rule created!" });
      }
    } catch {
      toast({ title: "Failed to create rule", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  const activeCount = rules.filter((r) => r.active).length;
  const totalApplied = rules.reduce((sum, r) => sum + r.appliedCount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Feedback Rules
          </h1>
          <p className="text-muted-foreground mt-1">
            {rules.length} rule{rules.length !== 1 ? "s" : ""} · {activeCount} active · {totalApplied} total applications
          </p>
        </div>
        <Button
          className="bg-navy hover:bg-navy-light text-white"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-navy">Create Manual Rule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Module</label>
                <Select value={newModule} onValueChange={setNewModule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Process Area (optional)</label>
                <Input
                  value={newProcessArea}
                  onChange={(e) => setNewProcessArea(e.target.value)}
                  placeholder="e.g. Procure-to-Pay"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Rule Type</label>
                <Select value={newRuleType} onValueChange={setNewRuleType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((rt) => (
                      <SelectItem key={rt.value} value={rt.value}>{rt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Rule Content</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Describe the improvement rule..."
                className="min-h-[80px]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="bg-navy hover:bg-navy-light text-white"
                onClick={handleCreate}
                disabled={creating || !newContent.trim()}
              >
                {creating ? "Creating..." : "Create Rule"}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULES.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rules List */}
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : rules.length === 0 ? (
        <Card className="border-none shadow-sm">
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-2">No feedback rules yet</h3>
            <p className="text-muted-foreground">
              Create rules manually or promote comments from FSD reviews to build your knowledge base.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id} className={`border-none shadow-sm ${!rule.active ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge className="bg-navy/10 text-navy">{rule.module}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {RULE_TYPES.find((rt) => rt.value === rule.ruleType)?.label || rule.ruleType}
                      </Badge>
                      {rule.processArea && (
                        <Badge variant="secondary" className="text-xs">{rule.processArea}</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs bg-slate-100">
                        via {rule.source}
                      </Badge>
                      {rule.appliedCount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Applied {rule.appliedCount}x
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{rule.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created {new Date(rule.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(rule.id, rule.active)}
                      title={rule.active ? "Deactivate" : "Activate"}
                    >
                      {rule.active ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
