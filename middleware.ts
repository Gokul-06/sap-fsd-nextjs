import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Public routes that don't require authentication ─────────
const publicRoutes = [
  "/",               // Landing page
  "/auth",           // Login pages
  "/api/auth",       // NextAuth API endpoints
  "/shared",         // Shared FSD links (public)
  "/features",       // Features page
  "/privacy",        // Privacy policy
  "/terms",          // Terms of service
];

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth Check ──
  if (!isPublicRoute(pathname)) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── CORS Preflight Handler ────────────────────────────────
  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
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
  if (pathname.startsWith("/api/")) {
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
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com https://va.vercel-scripts.com https://*.vercel-analytics.com https://*.hana.ondemand.com https://*.alm.cloud.sap; frame-ancestors 'none';"
  );

  // ── Rate Limiting for API routes ────────────────────────
  if (pathname.startsWith("/api/")) {
    cleanupRateLimitMap();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Stricter limits for heavy endpoints
    const heavyEndpoints = ["/api/generate", "/api/extract-requirements", "/api/doc-transform"];
    const isHeavy = heavyEndpoints.some((ep) => pathname.startsWith(ep));
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
