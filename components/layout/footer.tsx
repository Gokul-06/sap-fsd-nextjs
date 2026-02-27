import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-white/50 backdrop-blur-sm py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Westernacher Consulting &middot; 2026
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
              Terms of Service
            </Link>
            <span className="text-xs text-muted-foreground/60">
              Powered by WE-AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
