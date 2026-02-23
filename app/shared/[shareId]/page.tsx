import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { FsdResultStats } from "@/components/fsd/fsd-result-stats";
import { FileText, Globe, Share2 } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getFsdByShareId(shareId: string) {
  try {
    const fsd = await prisma.fsd.findUnique({
      where: { shareId },
      select: {
        id: true,
        title: true,
        projectName: true,
        author: true,
        primaryModule: true,
        processArea: true,
        relatedModules: true,
        markdown: true,
        aiEnabled: true,
        language: true,
        createdAt: true,
      },
    });
    return fsd;
  } catch {
    return null;
  }
}

export default async function SharedFsdPage({
  params,
}: {
  params: { shareId: string };
}) {
  const fsd = await getFsdByShareId(params.shareId);

  if (!fsd) {
    notFound();
  }

  const relatedModules = JSON.parse(fsd.relatedModules || "[]") as string[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Shared Badge */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span className="text-sm">Shared Document</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-navy">{fsd.title}</h1>
        <p className="text-muted-foreground mt-1">
          {fsd.projectName} · {fsd.author} ·{" "}
          {new Date(fsd.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <div className="flex gap-2 mt-2">
          <Badge className="bg-navy/10 text-navy">{fsd.primaryModule}</Badge>
          {fsd.aiEnabled && (
            <Badge className="bg-wc-blue/10 text-wc-blue">AI-Powered</Badge>
          )}
          {fsd.language && fsd.language !== "English" && (
            <Badge className="bg-violet-100 text-violet-700">
              <Globe className="h-3 w-3 mr-1" />
              {fsd.language}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <FsdResultStats
        primaryModule={fsd.primaryModule}
        sections={14}
        integrations={relatedModules.length}
        processArea={fsd.processArea}
      />

      {/* Preview */}
      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle className="text-lg text-navy flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[700px] overflow-y-auto border rounded-lg p-6 bg-white">
            <MarkdownRenderer markdown={fsd.markdown} />
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        Generated with Westernacher SAP FSD Generator
      </div>
    </div>
  );
}
