import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

// Clean up old entries periodically (every 100 requests)
let requestCount = 0;
function cleanupRateLimitMap() {
  requestCount++;
  if (requestCount % 100 === 0) {
    const now = Date.now();
    rateLimitMap.forEach((value, key) => {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }
}

export function middleware(request: NextRequest) {
  // ── CORS Preflight Handler ────────────────────────────────
  if (request.method === "OPTIONS" && request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = getAllowedOrigins(request);

    if (!allowedOrigins.includes(origin) && allowedOrigins[0] !== "*") {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();

  // ── CORS Headers for API routes ─────────────────────────
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const allowedOrigins = getAllowedOrigins(request);

    if (allowedOrigins.includes(origin) || allowedOrigins[0] === "*") {
      response.headers.set("Access-Control-Allow-Origin", origin || allowedOrigins[0]);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }

  // ── Security Headers ────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com https://va.vercel-scripts.com https://*.vercel-analytics.com; frame-ancestors 'none';"
  );

  // ── Rate Limiting for API routes ────────────────────────
  if (request.nextUrl.pathname.startsWith("/api/")) {
    cleanupRateLimitMap();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Stricter limits for heavy endpoints
    const heavyEndpoints = ["/api/generate", "/api/extract-requirements", "/api/doc-transform"];
    const isHeavy = heavyEndpoints.some((ep) => request.nextUrl.pathname.startsWith(ep));
    const limit = isHeavy ? 5 : 30; // 5 per minute for AI endpoints, 30 for others

    if (!rateLimit(ip, limit)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }
  }

  return response;
}

/** Build allowed origins list from request host + env */
function getAllowedOrigins(request: NextRequest): string[] {
  const host = request.headers.get("host") || "";
  const origins: string[] = [];

  // Allow same-origin (both http for dev and https for prod)
  if (host) {
    origins.push(`https://${host}`);
    if (host.includes("localhost")) {
      origins.push(`http://${host}`);
    }
  }

  // Allow Vercel preview URLs
  if (host.endsWith(".vercel.app")) {
    origins.push(`https://${host}`);
  }

  // Fallback: if no origins detected, allow same-origin only
  return origins.length > 0 ? origins : ["*"];
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
