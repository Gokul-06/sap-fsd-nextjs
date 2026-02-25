"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-xl font-bold text-[#1B2A4A] group-hover:text-[#0091DA] transition-colors">
              Westernacher
            </span>
            <span className="hidden text-border/60 sm:inline">|</span>
            <span className="hidden text-xs font-medium tracking-widest text-muted-foreground sm:inline">
              NONSTOP INNOVATION
            </span>
          </Link>
        </div>

        {/* Right side: Navigation + Badge */}
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
                      ? "text-[#1B2A4A] bg-[#0091DA]/10"
                      : "text-muted-foreground hover:text-[#1B2A4A] hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#0091DA] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
          <span className="rounded-full bg-gradient-to-r from-[#0091DA]/10 to-[#0091DA]/5 px-3.5 py-1 text-xs font-semibold text-[#0091DA] border border-[#0091DA]/10">
            Digital Core NA
          </span>
        </div>
      </div>
    </header>
  );
}
