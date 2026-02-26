import { NextResponse } from "next/server";
import { isCalmConfigured, testCalmConnection } from "@/lib/services/calm-client";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  const configured = isCalmConfigured();

  if (!configured) {
    return NextResponse.json({ configured: false, connected: false });
  }

  const result = await testCalmConnection();

  logAudit("CALM_CONNECTION_TEST", "CALM", undefined, request, result.connected ? "success" : result.error);

  return NextResponse.json({
    configured: true,
    connected: result.connected,
    error: result.error || undefined,
  });
}
