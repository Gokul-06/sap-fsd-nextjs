"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookTemplate,
  Search,
  Star,
  Globe,
  ArrowRight,
  Sparkles,
  Eye,
} from "lucide-react";

const INDUSTRIES = [
  "Manufacturing",
  "Pharma",
  "Retail",
  "Automotive",
  "Utilities",
  "Public Sector",
];

const MODULES = ["MM", "SD", "FI", "CO", "PP", "QM", "EWM", "TM"];

const MODULE_COLORS: Record<string, string> = {
  MM: "bg-blue-100 text-blue-700",
  SD: "bg-emerald-100 text-emerald-700",
  FI: "bg-violet-100 text-violet-700",
  CO: "bg-amber-100 text-amber-700",
  PP: "bg-rose-100 text-rose-700",
  QM: "bg-cyan-100 text-cyan-700",
  EWM: "bg-teal-100 text-teal-700",
  TM: "bg-orange-100 text-orange-700",
};

interface TemplateItem {
  id: string;
  title: string;
  projectName: string;
  author: string;
  primaryModule: string;
  processArea: string;
  industry: string | null;
  rating: number | null;
  language: string;
  createdAt: string;
  markdown: string;
  _count: { comments: number };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, [moduleFilter, industryFilter]);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleFilter !== "all") params.set("module", moduleFilter);
      if (industryFilter !== "all") params.set("industry", industryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch {
      console.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchTemplates();
  }

  function getPreviewSnippet(markdown: string): string {
    // Extract first meaningful paragraph (skip headers and metadata)
    const lines = markdown.split("\n").filter((l) => {
      const trimmed = l.trim();
      return (
        trimmed.length > 20 &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("|") &&
        !trimmed.startsWith("**") &&
        !trimmed.startsWith(">") &&
        !trimmed.startsWith("---")
      );
    });
    const preview = lines.slice(0, 2).join(" ").trim();
    return preview.length > 150 ? preview.substring(0, 147) + "..." : preview;
  }

  function renderStars(rating: number | null) {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              i <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-68px-60px)] bg-[#F0F2F5]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B2A4A] to-[#0091DA] text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <BookTemplate className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Template Library</h1>
          </div>
          <p className="text-white/70 max-w-2xl">
            Browse and reuse high-quality FSDs as starting points. Save your best
            documents as templates for your team to discover and build upon.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="border-none shadow-sm mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 border-[#0091DA]/20 focus:border-[#0091DA]"
                />
              </div>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-[160px] border-[#0091DA]/20">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {MODULES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px] border-[#0091DA]/20">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                className="bg-[#0091DA] hover:bg-[#007bb8] text-white"
              >
                <Search className="h-4 w-4 mr-1.5" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {templates.length} template{templates.length !== 1 ? "s" : ""} found
          </p>
          <Link href="/generate">
            <Button variant="outline" size="sm" className="text-[#0091DA] border-[#0091DA]/30 hover:bg-[#0091DA]/5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Create New FSD
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="loading-ring" />
          </div>
        )}

        {/* Empty state */}
        {!loading && templates.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-12 text-center">
              <BookTemplate className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
                No templates yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Templates are high-quality FSDs saved by your team. Generate an FSD,
                rate it highly, then save it as a template from the document detail page.
              </p>
              <Link href="/generate">
                <Button className="bg-[#0091DA] hover:bg-[#007bb8] text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Your First FSD
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Template cards grid */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, i) => (
              <Card
                key={template.id}
                className="enterprise-card border-none shadow-sm animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <CardContent className="p-0">
                  {/* Card header band */}
                  <div className="bg-gradient-to-r from-[#1B2A4A] to-[#0091DA]/80 px-5 py-3 flex items-center justify-between">
                    <Badge
                      className={`${
                        MODULE_COLORS[template.primaryModule] ||
                        "bg-gray-100 text-gray-700"
                      } border-0 text-xs font-semibold`}
                    >
                      {template.primaryModule}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {template.language !== "English" && (
                        <Badge className="bg-white/20 text-white border-0 text-xs">
                          <Globe className="h-3 w-3 mr-1" />
                          {template.language}
                        </Badge>
                      )}
                      {template.industry && (
                        <Badge className="bg-white/20 text-white border-0 text-xs">
                          {template.industry}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="font-semibold text-[#1B2A4A] mb-1 line-clamp-2">
                      {template.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {template.processArea} &middot; by {template.author}
                    </p>

                    {renderStars(template.rating)}

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                      {getPreviewSnippet(template.markdown) ||
                        "Professional SAP Functional Specification Document template."}
                    </p>

                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                      <Link href={`/fsd/${template.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-[#1B2A4A] border-[#1B2A4A]/20 hover:bg-[#1B2A4A]/5"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </Link>
                      <Link
                        href={`/generate?template=${template.id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full bg-[#0091DA] hover:bg-[#007bb8] text-white"
                        >
                          Use
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
