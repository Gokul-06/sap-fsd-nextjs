import Link from "next/link";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe, Star, Wrench } from "lucide-react";
import { FSD_TYPE_LABELS } from "@/lib/types";
import type { FsdType } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getFsds() {
  try {
    const fsds = await prisma.fsd.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        projectName: true,
        primaryModule: true,
        processArea: true,
        aiEnabled: true,
        rating: true,
        language: true,
        fsdType: true,
        createdAt: true,
        author: true,
        _count: { select: { comments: true } },
      },
    });
    return fsds;
  } catch {
    return [];
  }
}

export default async function HistoryPage() {
  const fsds = await getFsds();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">FSD History</h1>
          <p className="text-muted-foreground mt-1">
            {fsds.length} document{fsds.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Link
          href="/generate"
          className="bg-navy text-white px-5 py-2.5 rounded-lg font-medium hover:bg-navy-light transition-colors text-sm"
        >
          + New FSD
        </Link>
      </div>

      {fsds.length > 0 ? (
        <div className="space-y-3">
          {fsds.map((fsd) => (
            <Link key={fsd.id} href={`/fsd/${fsd.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-3">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-navy/5 rounded-lg flex-shrink-0">
                      <FileText className="h-5 w-5 text-navy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-navy truncate">
                          {fsd.title}
                        </h3>
                        {fsd.aiEnabled && (
                          <Badge className="bg-wc-blue/10 text-wc-blue text-xs flex-shrink-0">
                            AI
                          </Badge>
                        )}
                        {fsd.language && fsd.language !== "English" && (
                          <Badge className="bg-violet-100 text-violet-700 text-xs flex-shrink-0">
                            <Globe className="h-3 w-3 mr-1" />
                            {fsd.language}
                          </Badge>
                        )}
                        {fsd.fsdType && fsd.fsdType !== "standard" && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs flex-shrink-0">
                            <Wrench className="h-3 w-3 mr-1" />
                            {FSD_TYPE_LABELS[fsd.fsdType as FsdType] || fsd.fsdType}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {fsd.projectName} · {fsd.processArea} · {fsd.author}
                        {fsd._count.comments > 0 && (
                          <span className="ml-2">
                            · {fsd._count.comments} comment{fsd._count.comments !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {fsd.rating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < fsd.rating!
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className="bg-navy/10 text-navy font-semibold"
                      >
                        {fsd.primaryModule}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(fsd.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-navy mb-2">No documents yet</h3>
          <p className="text-muted-foreground mb-6">
            Generate your first FSD to see it here
          </p>
          <Link
            href="/generate"
            className="bg-navy text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-light transition-colors inline-block"
          >
            Generate New FSD
          </Link>
        </div>
      )}
    </div>
  );
}
