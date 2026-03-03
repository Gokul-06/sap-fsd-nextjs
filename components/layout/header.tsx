"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// Auth imports — uncomment when Azure AD is configured
// import { useSession, signOut } from "next-auth/react";
// import { LogOut, LogIn, ChevronDown } from "lucide-react";

const navItems = [
  { href: "/generate", label: "Generate" },
  { href: "/features", label: "Features" },
];

export function Header() {
  const pathname = usePathname();
  // Auth state — uncomment when Azure AD is configured
  // const { data: session, status } = useSession();

  // Don't render header on login page
  if (pathname === "/auth/login") return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/40 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl font-bold text-slate-800 group-hover:text-sky-500 transition-colors">
              Westernacher
            </span>
            <span className="hidden text-border/60 sm:inline">|</span>
            <span className="hidden text-xs font-medium tracking-widest text-muted-foreground sm:inline">
              NONSTOP INNOVATION
            </span>
          </Link>
        </div>

        {/* Right side: Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-sky-600 bg-sky-50/70"
                    : "text-muted-foreground hover:text-slate-800 hover:bg-sky-50/50"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-sky-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth Section — uncomment when Azure AD is configured */}
      </div>
    </header>
  );
}
