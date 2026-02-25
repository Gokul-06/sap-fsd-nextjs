"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import Link from "next/link";

const CONSENT_KEY = "cookie-consent";

export type ConsentStatus = "accepted" | "rejected" | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentStatus;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getConsentStatus();
    if (!consent) {
      // Show banner after short delay for better UX
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    // Reload to activate analytics
    window.location.reload();
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="mx-auto max-w-4xl bg-white border border-border/60 rounded-xl shadow-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Shield className="h-5 w-5 text-[#0091DA] mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-[#1B2A4A] mb-1">Privacy &amp; Cookies</p>
              <p>
                We use analytics cookies to improve your experience. Your data is processed
                by AI services (Anthropic Claude) to generate documents.{" "}
                <Link href="/privacy" className="text-[#0091DA] hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="text-xs"
            >
              Reject All
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-[#0091DA] hover:bg-[#007bb8] text-white text-xs"
            >
              Accept Analytics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
