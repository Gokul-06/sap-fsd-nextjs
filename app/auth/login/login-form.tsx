"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Sparkles, LogIn, User, AlertCircle, Shield } from "lucide-react";
import { FloatingClouds } from "@/components/shared/floating-clouds";

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
      {/* Background — matching app's cloud theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-sky-50/60 via-[45%] to-slate-100/80" />

      {/* Floating clouds behind the login card */}
      <div className="absolute inset-0 z-0">
        <FloatingClouds />
      </div>

      {/* Soft radial glows */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />
      <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-sky-100/40 blur-2xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-white/60 bg-white/70 p-8 backdrop-blur-xl shadow-xl shadow-sky-200/30">
          {/* Branding */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-50/80 px-4 py-1.5 border border-sky-200/50">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              <span className="text-xs font-medium text-sky-600 tracking-wide">
                Powered by WE-AI
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Westernacher
            </h1>
            <p className="mt-1 text-xs font-medium tracking-widest text-slate-400">
              NONSTOP INNOVATION
            </p>
            <p className="mt-4 text-sm text-slate-500">
              SAP Functional Specification Generator
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200/60 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">
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
                className="group relative w-full rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-sky-200/40 hover:border-sky-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center gap-3">
                  {loadingProvider === "microsoft" ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
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
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-medium text-slate-400">or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
            </>
          )}

          {/* Azure NOT Configured Banner */}
          {!isAzureConfigured && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200/60 px-4 py-3">
              <Shield className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">
                  Demo Mode
                </p>
                <p className="mt-0.5 text-xs text-amber-600/70">
                  Microsoft SSO will be available once Azure AD is configured.
                  For now, continue as a demo user.
                </p>
              </div>
            </div>
          )}

          {/* Demo Login Section */}
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Your name (optional)"
                value={demoName}
                onChange={(e) => setDemoName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) handleDemoLogin();
                }}
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400/30 transition-all disabled:opacity-50"
              />
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="group w-full rounded-xl border border-sky-200 bg-sky-50/50 px-6 py-3.5 text-sm font-medium text-sky-700 transition-all duration-300 hover:bg-sky-100/80 hover:border-sky-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                {loadingProvider === "demo" ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}
                Continue as Demo User
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Westernacher Consulting &mdash; Enterprise SAP Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
