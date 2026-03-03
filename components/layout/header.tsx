"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LogIn, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/generate", label: "Generate" },
  { href: "/train", label: "Train Agents" },
  { href: "/history", label: "History" },
  { href: "/templates", label: "Templates" },
  { href: "/features", label: "Features" },
  { href: "/feedback", label: "Feedback" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render header on login page
  if (pathname === "/auth/login") return null;

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const isDemo = (session?.user as unknown as Record<string, unknown> | undefined)?.role === "demo";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-lg">
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

        {/* Right side: Navigation + Auth */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-sky-600 bg-sky-50"
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

          {/* Auth Section */}
          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
          ) : session?.user ? (
            /* Logged in — User Menu */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-50"
              >
                {/* Avatar */}
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full border border-border/50"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                    {userInitials}
                  </div>
                )}
                <span className="hidden text-sm font-medium text-slate-800 sm:inline max-w-[120px] truncate">
                  {session.user.name || "User"}
                </span>
                {isDemo && (
                  <span className="hidden text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded sm:inline">
                    DEMO
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-white py-2 shadow-lg shadow-black/5 animate-fade-in-up">
                  <div className="px-4 py-2 border-b border-border/50">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut({ callbackUrl: "/auth/login" });
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Not logged in — Sign In Button */
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/20"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
