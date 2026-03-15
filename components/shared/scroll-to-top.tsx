"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scrolls the window to the top whenever the route (pathname) changes.
 * Next.js App Router does not do this automatically for client navigations.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
