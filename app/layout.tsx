import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/shared/cookie-consent";
import { ConditionalAnalytics } from "@/components/shared/conditional-analytics";
import { AuthProvider } from "@/components/providers/session-provider";
import { FloatingClouds } from "@/components/shared/floating-clouds";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Westernacher | AI Agent Hub",
  description:
    "AI-powered consulting tools by Westernacher. Generate functional specifications, proposals, and more using AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="fixed inset-0 z-0 bg-gradient-to-b from-white via-sky-50/60 via-[45%] to-slate-100/80 pointer-events-none" />
          <FloatingClouds />
          <div className="relative z-10 flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <CookieConsent />
          <ConditionalAnalytics />
        </AuthProvider>
      </body>
    </html>
  );
}
