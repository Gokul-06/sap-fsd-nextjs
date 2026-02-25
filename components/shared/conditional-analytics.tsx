"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { getConsentStatus } from "./cookie-consent";

export function ConditionalAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    setHasConsent(getConsentStatus() === "accepted");
  }, []);

  if (!hasConsent) return null;

  return <Analytics />;
}
