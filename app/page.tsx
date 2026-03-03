import Link from "next/link";
import { HeroSection } from "@/components/shared/hero-section";
import { AlreadyKnewSection } from "@/components/shared/already-knew-section";
import { BentoFeatures } from "@/components/shared/bento-features";
import { HowItWorksSection } from "@/components/shared/how-it-works";
import { FaqSection } from "@/components/shared/faq-section";
import { CtaSection } from "@/components/shared/cta-section";
import { prisma } from "@/lib/db";
import { FileText } from "lucide-react";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { StatsSection } from "@/components/shared/stats-section";
import { RecentDocuments } from "@/components/shared/recent-documents";

export const dynamic = "force-dynamic";

async function getRecentFsds() {
  try {
    const fsds = await prisma.fsd.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        primaryModule: true,
        processArea: true,
        aiEnabled: true,
        createdAt: true,
        author: true,
      },
    });
    const total = await prisma.fsd.count();
    return { fsds, total };
  } catch {
    return { fsds: [], total: 0 };
  }
}

export default async function HomePage() {
  const { fsds, total } = await getRecentFsds();

  return (
    <div className="overflow-hidden">
      <HeroSection />

      {/* Gradient transition */}
      <div className="h-16 bg-gradient-to-b from-sky-100/60 to-sky-50/30" />

      {/* Already Knew? Stats */}
      <AlreadyKnewSection />

      {/* Bento Feature Grid — Cluely-style */}
      <BentoFeatures />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Quick Stats + Recent Documents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {total > 0 && <StatsSection total={total} />}

        {fsds.length > 0 && <RecentDocuments fsds={fsds} />}

        {/* Empty State */}
        {fsds.length === 0 && (
          <ScrollReveal>
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 mb-6">
                <FileText className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                No documents yet
              </h3>
              <p className="text-muted-foreground mb-8">
                Generate your first FSD to see it here
              </p>
              <Link
                href="/generate"
                className="bg-sky-500 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-sky-600 transition-all hover:shadow-lg hover:shadow-sky-500/20 inline-block btn-shimmer overflow-hidden relative"
              >
                Generate New FSD
              </Link>
            </div>
          </ScrollReveal>
        )}
      </div>

      {/* FAQ */}
      <FaqSection />

      {/* Bottom CTA */}
      <CtaSection />
    </div>
  );
}
