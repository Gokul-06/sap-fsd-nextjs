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
import { Lightbulb, Loader2 } from "lucide-react";

interface PromoteCommentDialogProps {
  fsdId: string;
  commentId: string;
  commentContent: string;
  module: string;
  processArea: string;
  onPromoted?: () => void;
}

export function PromoteCommentDialog({
  fsdId,
  commentId,
  commentContent,
  onPromoted,
}: PromoteCommentDialogProps) {
  const [open, setOpen] = useState(false);
  const [ruleType, setRuleType] = useState("content_improvement");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handlePromote() {
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/fsd/${fsdId}/comment/${commentId}/promote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ruleType }),
        }
      );

      if (res.ok) {
        setOpen(false);
        onPromoted?.();
      }
    } catch (error) {
      console.error("Failed to promote:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-muted-foreground hover:text-wc-blue transition-colors"
          title="Promote to feedback rule"
        >
          <Lightbulb className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy">Promote to Feedback Rule</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Comment</label>
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3 max-h-24 overflow-y-auto">
              {commentContent}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Rule Type</label>
            <Select value={ruleType} onValueChange={setRuleType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content_improvement">Content Improvement</SelectItem>
                <SelectItem value="structure">Structure</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="terminology">Terminology</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Textarea
              value={commentContent}
              disabled
              className="text-sm opacity-60"
              rows={2}
            />
            <p className="text-xs text-muted-foreground mt-1">
              AI will extract a concise rule from this comment automatically.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-navy hover:bg-navy-light text-white"
              onClick={handlePromote}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting Rule...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Promote to Rule
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
