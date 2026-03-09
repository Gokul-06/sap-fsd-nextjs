import Link from "next/link";

const footerLinks = {
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "AI Landscape", href: "/ai-landscape" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-slate-800">
              Westernacher
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              AI-powered consulting tools for enterprise teams.
            </p>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Powered by WE-AI
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-800 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-slate-800 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground/60">
            &copy; 2026 Westernacher Consulting. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
