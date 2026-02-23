import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Globe,
  Brain,
  FileDown,
  Pencil,
  MessageSquare,
  BookTemplate,
  ThumbsUp,
  Share2,
  Shield,
  ArrowRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Generate comprehensive 14-section FSDs using Claude AI. Six parallel AI calls produce executive summaries, solution designs, error handling, data migration plans, and cutover strategies — all tailored to your SAP module.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
    link: "/generate",
    linkLabel: "Start Generating",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Generate FSDs in English, German, French, Spanish, or Japanese. SAP technical terms (transaction codes, table names, Fiori apps) stay in English while all narrative content is written in your chosen language.",
    status: "New",
    statusColor: "bg-[#0091DA]/10 text-[#0091DA]",
    link: "/generate",
    linkLabel: "Try It",
  },
  {
    icon: Brain,
    title: "SAP Module Intelligence",
    description:
      "Automatic module detection from your requirements text. Supports MM, SD, FI, CO, PP, QM, EWM, and TM with intelligent cross-module impact analysis. The AI identifies integration points between modules automatically.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: FileDown,
    title: "Professional Document Export",
    description:
      "Export to Word (.docx) with company branding, professional cover page, table of contents, styled tables with zebra striping, headers/footers, and page numbers. Ready for client delivery.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Pencil,
    title: "Inline Document Editor",
    description:
      "Toggle between Preview and Edit mode with a single click. Directly modify the generated markdown in a full-featured dark editor, then save your changes and download the updated document.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
    link: "/generate",
    linkLabel: "Try Editor",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Refinement",
    description:
      "Refine your FSD through natural language conversation. Ask WE-AI to add detail, restructure sections, update terminology, or customize content — without regenerating the entire document.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: BookTemplate,
    title: "Template Library",
    description:
      "Browse and reuse high-quality FSDs as templates. Save your best documents to the library, tag them by industry and module, and let your team discover proven starting points for new projects.",
    status: "New",
    statusColor: "bg-[#0091DA]/10 text-[#0091DA]",
    link: "/templates",
    linkLabel: "Browse Templates",
  },
  {
    icon: ThumbsUp,
    title: "Feedback Loop",
    description:
      "Rate FSDs with 5-star ratings, add detailed comments, and promote feedback into rules. The AI learns from your team's feedback to continuously improve future generations.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
    link: "/feedback",
    linkLabel: "Manage Feedback",
  },
  {
    icon: Share2,
    title: "Public Sharing",
    description:
      "Generate secure share links for any FSD. Share with stakeholders, clients, or team members who can view the full document without needing an account or login.",
    status: "Active",
    statusColor: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Shield,
    title: "Enterprise Authentication",
    description:
      "Microsoft Azure AD integration for enterprise deployments. Role-based access control, user isolation, and team workspaces. Each user sees only their own documents.",
    status: "Coming Soon",
    statusColor: "bg-amber-100 text-amber-700",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-[calc(100vh-68px-60px)] bg-[#F0F2F5]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0091DA] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by WE-AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Platform Features
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Everything you need to create professional SAP Functional
            Specification Documents — from AI generation to enterprise
            collaboration.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/generate">
              <Button
                size="lg"
                className="bg-white text-[#1B2A4A] hover:bg-white/90 font-semibold"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Start Generating
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <BookTemplate className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "SAP Modules", value: "8+" },
            { label: "FSD Sections", value: "14" },
            { label: "Languages", value: "5" },
            { label: "AI Sections", value: "6" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-sm text-center">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-[#0091DA]">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="enterprise-card border-none shadow-sm animate-fade-in-up group"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 bg-[#0091DA]/10 rounded-xl group-hover:bg-[#0091DA]/20 transition-colors">
                      <Icon className="h-5 w-5 text-[#0091DA]" />
                    </div>
                    <Badge
                      className={`${feature.statusColor} border-0 text-xs`}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-[#1B2A4A] mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  {feature.link && (
                    <Link href={feature.link}>
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0091DA] hover:text-[#007bb8] transition-colors">
                        {feature.linkLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
