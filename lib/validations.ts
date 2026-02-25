import { z } from "zod";

// ── FSD Generation ────────────────────────────────────────
export const generateFsdSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  projectName: z.string().min(1).max(200).trim(),
  author: z.string().min(1).max(100).trim(),
  companyName: z.string().max(200).trim().optional(),
  requirements: z.string().min(10, "Requirements must be at least 10 characters").max(50000).trim(),
  module: z.string().max(10).optional(),
  language: z.enum(["English", "German", "French", "Spanish", "Japanese", "Chinese"]).default("English"),
  documentDepth: z.enum(["standard", "comprehensive"]).default("standard"),
  generationMode: z.enum(["standard", "agent-team"]).default("standard"),
  fsdType: z.enum(["standard", "enhancement", "interface", "report", "form", "conversion", "workflow"]).default("standard"),
});

// ── Comment ───────────────────────────────────────────────
export const commentSchema = z.object({
  authorName: z.string().max(100).trim().default("Anonymous"),
  content: z.string().min(1, "Comment cannot be empty").max(5000).trim(),
});

// ── Rating ────────────────────────────────────────────────
export const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

// ── File Upload ───────────────────────────────────────────
export const fileUploadSchema = z.object({
  fileBase64: z.string().max(15_000_000, "File too large. Maximum 10MB allowed"), // ~10MB in base64
  fileName: z.string().max(255).optional(),
  mediaType: z.enum([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]).optional(),
});

// ── Refine ────────────────────────────────────────────────
export const refineSchema = z.object({
  instruction: z.string().min(3).max(2000).trim(),
  markdown: z.string().min(1).max(500000),
  module: z.string().max(10).optional(),
});

// ── Share ─────────────────────────────────────────────────
export const idParamSchema = z.object({
  id: z.string().min(1).max(50),
});

// ── Feedback Rule ─────────────────────────────────────────
export const feedbackRuleSchema = z.object({
  module: z.string().min(1).max(10),
  processArea: z.string().max(200).optional(),
  ruleType: z.enum(["content_improvement", "structure", "validation", "terminology"]),
  content: z.string().min(1).max(5000).trim(),
  source: z.enum(["comment", "manual", "ai_extracted"]).default("manual"),
});

// Helper to validate and return typed data or error response
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T } | { error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues;
    const firstIssue = issues[0];
    return { error: `Validation error: ${firstIssue?.path.join(".")}: ${firstIssue?.message}` };
  }
  return { data: result.data };
}
