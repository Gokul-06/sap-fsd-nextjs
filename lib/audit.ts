import { prisma } from "@/lib/db";

export type AuditAction =
  | "CREATE_FSD"
  | "DELETE_FSD"
  | "SHARE_FSD"
  | "RATE_FSD"
  | "CREATE_COMMENT"
  | "CREATE_RULE"
  | "UPDATE_RULE"
  | "DELETE_RULE"
  | "EXPORT_DATA"
  | "GENERATE_FSD"
  | "CALM_CONNECTION_TEST"
  | "CALM_PULL_REQUIREMENTS"
  | "CALM_PUSH_FSD";

/**
 * Log an audit trail entry (GDPR compliance).
 * Fire-and-forget — never blocks the main request.
 */
export function logAudit(
  action: AuditAction,
  resource: string,
  resourceId?: string,
  request?: Request,
  details?: string
): void {
  const ipAddress = request
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown"
    : undefined;

  const userAgent = request
    ? request.headers.get("user-agent")?.substring(0, 200)
    : undefined;

  // Fire and forget — don't await, don't block
  prisma.auditLog
    .create({
      data: {
        action,
        resource,
        resourceId: resourceId || null,
        details: details || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    })
    .catch((err) => {
      console.error("[AuditLog] Failed to write audit log:", err);
    });
}
