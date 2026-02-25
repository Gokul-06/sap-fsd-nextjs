"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowLeft, Save } from "lucide-react";
import type { AgentRoleMeta } from "@/lib/agent-training-questions";

interface QuestionnaireFormProps {
  meta: AgentRoleMeta;
  existingAnswers?: Record<string, string>;
  existingExpertName?: string;
  onSave: (
    role: string,
    expertName: string,
    questionnaire: Record<string, string>,
  ) => Promise<void>;
  onBack: () => void;
}

export function QuestionnaireForm({
  meta,
  existingAnswers,
  existingExpertName,
  onSave,
  onBack,
}: QuestionnaireFormProps) {
  const [expertName, setExpertName] = useState(existingExpertName || "");
  const [answers, setAnswers] = useState<Record<string, string>>(
    existingAnswers || {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = Object.values(answers).filter(
    (a) => a.trim().length > 0,
  ).length;
  const totalCount = meta.questions.length;
  const progress = Math.round((answeredCount / totalCount) * 100);

  const handleSubmit = async () => {
    if (!expertName.trim()) {
      setError("Please enter the expert's name");
      return;
    }

    if (answeredCount < 3) {
      setError("Please answer at least 3 questions to train the agent");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // Filter out empty answers
      const filledAnswers: Record<string, string> = {};
      for (const [q, a] of Object.entries(answers)) {
        if (a.trim()) filledAnswers[q] = a.trim();
      }
      await onSave(meta.role, expertName.trim(), filledAnswers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save training",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">
              Train: {meta.label}
            </h2>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${
            progress === 100
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "text-muted-foreground"
          }`}
        >
          {answeredCount}/{totalCount} answered ({progress}%)
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0091DA] to-emerald-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expert Name */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
            Expert Name
          </label>
          <Input
            value={expertName}
            onChange={(e) => setExpertName(e.target.value)}
            placeholder="e.g., Ravi Kumar, Sarah Chen..."
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground mt-1">
            The real person whose expertise this agent will learn from
          </p>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        {meta.questions.map((question, index) => (
          <Card
            key={index}
            className={
              answers[question]?.trim()
                ? "border-emerald-200 bg-emerald-50/30"
                : ""
            }
          >
            <CardContent className="p-4">
              <label className="block text-sm font-medium text-[#1B2A4A] mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0091DA]/10 text-[#0091DA] text-xs font-bold mr-2">
                  {index + 1}
                </span>
                {question}
              </label>
              <Textarea
                value={answers[question] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question]: e.target.value,
                  }))
                }
                placeholder="Share how this expert thinks about this..."
                rows={3}
                className="resize-none"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {answeredCount < 3
            ? `Answer at least ${3 - answeredCount} more question(s) to enable training`
            : "Ready to compile training!"}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={saving || answeredCount < 3 || !expertName.trim()}
          className="bg-gradient-to-r from-[#0091DA] to-[#0091DA]/80 text-white hover:from-[#0091DA]/90 hover:to-[#0091DA]/70"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Compiling personality...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Save & Compile Training
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
