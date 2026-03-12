import { HeroSection } from "@/components/shared/hero-section";
import { BentoFeatures } from "@/components/shared/bento-features";
import { HowItWorksSection } from "@/components/shared/how-it-works";
import { AlreadyKnewSection } from "@/components/shared/already-knew-section";
import { FaqSection } from "@/components/shared/faq-section";
import { CtaSection } from "@/components/shared/cta-section";

export const metadata = {
  title: "FSD Generator | Westernacher AI Agent Hub",
  description:
    "Generate SAP Functional Specification Documents in seconds with our AI-powered 6-agent team.",
};

export default function FsdLandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <AlreadyKnewSection />
      <BentoFeatures />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
    </main>
  );
}
