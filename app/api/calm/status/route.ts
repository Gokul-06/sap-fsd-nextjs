import { NextResponse } from "next/server";
import { isCalmConfigured, isCalmDemoMode, testCalmConnection } from "@/lib/services/calm-client";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  const configured = isCalmConfigured();
  const demoMode = isCalmDemoMode();

  if (!configured) {
    return NextResponse.json({ configured: false, connected: false, demoMode: false });
  }

  // In demo mode, skip real connection test
  if (demoMode) {
    return NextResponse.json({ configured: true, connected: true, demoMode: true });
  }

  const result = await testCalmConnection();

  logAudit("CALM_CONNECTION_TEST", "CALM", undefined, request, result.connected ? "success" : result.error);

  return NextResponse.json({
    configured: true,
    connected: result.connected,
    demoMode: false,
    error: result.error || undefined,
  });
}
