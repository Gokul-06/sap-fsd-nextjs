"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sparkles, LogIn, User, AlertCircle, Shield } from "lucide-react";

// Check if Azure AD is configured (passed via env var to client)
const isAzureConfigured = Boolean(
  process.env.NEXT_PUBLIC_AZURE_AD_CONFIGURED === "true"
);

export function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/generate";
  const error = searchParams.get("error");

  const [demoName, setDemoName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("microsoft");
    await signIn("microsoft-entra-id", { callbackUrl });
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("demo");
    await signIn("demo-login", {
      name: demoName.trim() || "Demo User",
      callbackUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background — navy gradient matching hero section */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B2A4A] via-[#1E3258] to-[#2A3F6E]">
        {/* Animated grid pattern */}
        <svg
          className="absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="login-grid"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 30 30 L 60 60"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
              <path
                d="M 0 0 L 30 30 L 0 60"
                fill="none"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>

        {/* Floating orbs */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#0091DA]/10 blur-3xl animate-float-slow" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#0091DA]/8 blur-3xl animate-float-medium" />
        <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-white/5 blur-2xl animate-float-fast" />

        {/* Drifting dots */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20 animate-drift"
            style={{
              top: `${15 + i * 15}%`,
              right: `${10 + i * 12}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/[0.12] bg-white/[0.07] p-8 backdrop-blur-xl shadow-2xl shadow-black/20">
          {/* Branding */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-[#0091DA]" />
              <span className="text-xs font-medium text-white/80 tracking-wide">
                Powered by WE-AI
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Westernacher
            </h1>
            <p className="mt-1 text-xs font-medium tracking-widest text-white/40">
              NONSTOP INNOVATION
            </p>
            <p className="mt-4 text-sm text-white/60">
              SAP Functional Specification Generator
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">
                {error === "CredentialsSignin"
                  ? "Sign in failed. Please try again."
                  : "An error occurred. Please try again."}
              </p>
            </div>
          )}

          {/* Microsoft SSO Button */}
          {isAzureConfigured && (
            <>
              <button
                onClick={handleMicrosoftLogin}
                disabled={isLoading}
                className="group relative w-full rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#1B2A4A] shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-[#0091DA]/20 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {loadingProvider === "microsoft" ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1B2A4A] border-t-transparent" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none">
                      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                    </svg>
                  )}
                  Sign in with Microsoft
                </div>
              </button>

              {/* Divider */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium text-white/30">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          {/* Azure NOT Configured Banner */}
          {!isAzureConfigured && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3">
              <Shield className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-300">
                  Demo Mode
                </p>
                <p className="mt-0.5 text-xs text-amber-300/70">
                  Microsoft SSO will be available once Azure AD is configured.
                  For now, continue as a demo user.
                </p>
              </div>
            </div>
          )}

          {/* Demo Login Section */}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Your name (optional)"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) handleDemoLogin();
                }}
                disabled={isLoading}
                className="w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-10 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#0091DA]/50 focus:outline-none focus:ring-1 focus:ring-[#0091DA]/50 transition-all disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="group w-full rounded-xl border border-white/20 bg-white/[0.05] px-6 py-3.5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/[0.12] hover:text-white hover:border-white/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {loadingProvider === "demo" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Continue as Demo User
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/20">
              Westernacher Consulting &mdash; Enterprise SAP Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
