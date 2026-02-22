import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#1B2A4A]">
              Westernacher
            </span>
            <span className="hidden text-border sm:inline">|</span>
            <span className="hidden text-xs font-medium tracking-widest text-muted-foreground sm:inline">
              NONSTOP INNOVATION
            </span>
          </Link>
        </div>

        {/* Right side: Navigation + Badge */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link
              href="/generate"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1B2A4A]"
            >
              Generate
            </Link>
            <Link
              href="/history"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-[#1B2A4A]"
            >
              History
            </Link>
          </nav>
          <span className="rounded-full bg-[#0091DA]/10 px-3 py-1 text-xs font-semibold text-[#0091DA]">
            Digital Core NA
          </span>
        </div>
      </div>
    </header>
  );
}
