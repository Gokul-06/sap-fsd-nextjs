"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_TYPES = [
  { value: "bug", label: "Bug / Error in FSD" },
  { value: "incorrect_config", label: "Incorrect SAP Configuration" },
  { value: "missing_info", label: "Missing Information" },
  { value: "improvement", label: "Improvement Suggestion" },
  { value: "general", label: "General Comment" },
] as const;

const FSD_SECTIONS = [
  { value: "entire_document", label: "Entire Document" },
  { value: "process_scope", label: "Executive Summary" },
  { value: "process_flow", label: "Proposed Solution / Process Flow" },
  { value: "configuration", label: "SAP Configuration" },
  { value: "integration", label: "Integration / Cross-Module" },
  { value: "authorization", label: "Authorization Roles" },
  { value: "output_management", label: "Output Management" },
  { value: "error_handling", label: "Error Handling" },
  { value: "data_migration", label: "Data Migration" },
  { value: "testing", label: "Testing" },
  { value: "cutover", label: "Cutover Plan" },
  { value: "appendix", label: "Appendix" },
] as const;

interface ReportIssueDialogProps {
  /** ID of the saved FSD (if available) */
  fsdId?: string;
  /** Module of the FSD */
  fsdModule?: string;
  /** Title of the FSD */
  fsdTitle?: string;
  /** Generation mode used */
  generationMode?: string;
  /** Custom trigger button (optional) */
  trigger?: React.ReactNode;
}

export function ReportIssueDialog({
  fsdId,
  fsdModule,
  fsdTitle,
  generationMode,
  trigger,
}: ReportIssueDialogProps) {
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  function resetForm() {
    setFeedbackType("");
    setSection("");
    setDescription("");
    setUserEmail("");
    setSubmitted(false);
  }

  async function handleSubmit() {
    if (!feedbackType || description.length < 10) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fsd-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fsdId: fsdId || undefined,
          feedbackType,
          section: section || undefined,
          description,
          userEmail: userEmail || undefined,
          fsdModule: fsdModule || undefined,
          fsdTitle: fsdTitle || undefined,
          generationMode: generationMode || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast({
          title: "Feedback submitted",
          description: "Thank you! The team will review your report.",
        });
        // Auto-close after brief delay
        setTimeout(() => {
          setOpen(false);
          resetForm();
        }, 2000);
      } else {
        const data = await res.json();
        toast({
          title: "Failed to submit",
          description: data.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        title: "Failed to submit",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 text-amber-600 border-amber-200 hover:bg-amber-50">
            <AlertTriangle className="h-4 w-4" />
            Report Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report an Issue
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="text-lg font-medium text-navy">Thank you!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your feedback has been submitted. The team will review it shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Auto-context badge */}
            {(fsdModule || fsdTitle) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {fsdModule && (
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-medium">
                    {fsdModule}
                  </span>
                )}
                {fsdTitle && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full truncate max-w-[200px]">
                    {fsdTitle}
                  </span>
                )}
                {generationMode && (
                  <span className="px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full">
                    {generationMode}
                  </span>
                )}
              </div>
            )}

            {/* Feedback Type */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Feedback Type <span className="text-red-500">*</span>
              </label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  {FEEDBACK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Section <span className="text-muted-foreground">(optional)</span>
              </label>
              <Select value={section} onValueChange={setSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Which section?" />
                </SelectTrigger>
                <SelectContent>
                  {FSD_SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or suggestion in detail..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {description.length}/5000 characters (min 10)
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Your Email <span className="text-muted-foreground">(optional, for follow-up)</span>
              </label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-navy hover:bg-navy-light text-white"
                onClick={handleSubmit}
                disabled={isSubmitting || !feedbackType || description.length < 10}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
