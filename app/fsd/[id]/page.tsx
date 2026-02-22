"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { FsdResultStats } from "@/components/fsd/fsd-result-stats";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/fsd/star-rating";
import { PromoteCommentDialog } from "@/components/fsd/promote-comment-dialog";
import {
  ArrowLeft,
  Download,
  Share2,
  MessageSquare,
  Send,
  Copy,
} from "lucide-react";

interface FsdData {
  id: string;
  title: string;
  projectName: string;
  author: string;
  companyName: string | null;
  primaryModule: string;
  processArea: string;
  relatedModules: string;
  markdown: string;
  warnings: string;
  aiEnabled: boolean;
  rating: number | null;
  shareId: string | null;
  createdAt: string;
  comments: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
  }>;
}

export default function FsdDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const [fsd, setFsd] = useState<FsdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/fsd/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setFsd(data);
        if (data.shareId) {
          setShareUrl(`${window.location.origin}/shared/${data.shareId}`);
        }
      })
      .catch(() => toast({ title: "Error loading FSD", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [id, toast]);

  async function handleShare() {
    try {
      const res = await fetch(`/api/fsd/${id}/share`, { method: "POST" });
      const data = await res.json();
      const url = data.shareUrl || `${window.location.origin}/shared/${data.shareId}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast({ title: "Share link copied!", description: url });
    } catch {
      toast({ title: "Failed to generate share link", variant: "destructive" });
    }
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/fsd/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: commentName.trim() || "Anonymous",
          content: commentText.trim(),
        }),
      });
      const comment = await res.json();
      setFsd((prev) =>
        prev ? { ...prev, comments: [comment, ...prev.comments] } : prev
      );
      setCommentText("");
      toast({ title: "Comment added!" });
    } catch {
      toast({ title: "Failed to add comment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    if (!fsd) return;
    toast({ title: "Generating Word document..." });
    try {
      const res = await fetch("/api/generate-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fsd.title,
          projectName: fsd.projectName,
          author: fsd.author,
          requirements: "Re-generated from saved FSD",
          module: fsd.primaryModule,
          companyName: fsd.companyName,
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `FSD-${fsd.title.replace(/[^a-zA-Z0-9]/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    }
  }

  async function handleRate(rating: number) {
    try {
      const res = await fetch(`/api/fsd/${id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        setFsd((prev) => (prev ? { ...prev, rating } : prev));
        toast({ title: `Rated ${rating} star${rating > 1 ? "s" : ""}!` });
      }
    } catch {
      toast({ title: "Failed to save rating", variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!fsd) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-navy mb-2">FSD Not Found</h2>
        <Link href="/history" className="text-wc-blue hover:underline">
          Back to History
        </Link>
      </div>
    );
  }

  const relatedModules = JSON.parse(fsd.relatedModules || "[]") as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/history">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{fsd.title}</h1>
          <p className="text-muted-foreground mt-1">
            {fsd.projectName} · {fsd.author} ·{" "}
            {new Date(fsd.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge className="bg-navy/10 text-navy">{fsd.primaryModule}</Badge>
            {fsd.aiEnabled && (
              <Badge className="bg-wc-blue/10 text-wc-blue">AI-Powered</Badge>
            )}
          </div>
          {/* Star Rating */}
          <div className="mt-3">
            <StarRating
              currentRating={fsd.rating ?? 0}
              onRate={handleRate}
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <FsdResultStats
        primaryModule={fsd.primaryModule}
        sections={14}
        integrations={relatedModules.length}
        processArea={fsd.processArea}
      />

      {/* Actions */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Button
            className="bg-navy hover:bg-navy-light text-white"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" /> Download Word
          </Button>
          <Button variant="outline" onClick={handleShare}>
            {shareUrl ? (
              <>
                <Copy className="h-4 w-4 mr-2" /> Copy Share Link
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" /> Generate Share Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-lg text-navy">Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto border rounded-lg p-6 bg-white">
            <MarkdownRenderer markdown={fsd.markdown} />
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-lg text-navy flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({fsd.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
            <Input
              placeholder="Your name (optional)"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              className="bg-white"
            />
            <Textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="bg-white min-h-[80px]"
            />
            <Button
              size="sm"
              className="bg-navy hover:bg-navy-light text-white"
              onClick={handleComment}
              disabled={submitting || !commentText.trim()}
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>

          <Separator />

          {/* Comment List */}
          {fsd.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {fsd.comments.map((comment) => (
                <div key={comment.id} className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-navy">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <PromoteCommentDialog
                      fsdId={id}
                      commentId={comment.id}
                      commentContent={comment.content}
                      module={fsd.primaryModule}
                      processArea={fsd.processArea}
                    />
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
