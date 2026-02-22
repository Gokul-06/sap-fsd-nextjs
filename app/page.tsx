import Link from "next/link";
import { HeroSection } from "@/components/shared/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { FileText, Clock, Sparkles } from "lucide-react";

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
    <div>
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Quick Stats */}
        {total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-navy/5 rounded-xl">
                  <FileText className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy">{total}</p>
                  <p className="text-sm text-muted-foreground">FSDs Generated</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-wc-blue/10 rounded-xl">
                  <Sparkles className="h-6 w-6 text-wc-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-wc-blue">AI-Powered</p>
                  <p className="text-sm text-muted-foreground">Claude AI Enhanced</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-wc-success/10 rounded-xl">
                  <Clock className="h-6 w-6 text-wc-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-wc-success">&lt;30s</p>
                  <p className="text-sm text-muted-foreground">Average Generation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent FSDs */}
        {fsds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-navy">Recent Documents</h2>
              <Link
                href="/history"
                className="text-sm text-wc-blue hover:underline font-medium"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fsds.map((fsd) => (
                <Link key={fsd.id} href={`/fsd/${fsd.id}`}>
                  <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-navy/10 text-navy font-semibold"
                        >
                          {fsd.primaryModule}
                        </Badge>
                        {fsd.aiEnabled && (
                          <Badge className="bg-wc-blue/10 text-wc-blue text-xs">
                            AI
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy line-clamp-2 mb-2">
                        {fsd.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {fsd.processArea} · {fsd.author}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(fsd.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {fsds.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-navy mb-2">
              No documents yet
            </h3>
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
    </div>
  );
}
