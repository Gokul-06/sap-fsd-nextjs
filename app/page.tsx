import Link from "next/link";
import { HeroSection } from "@/components/shared/hero-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { FileText, Clock, Sparkles, ArrowRight } from "lucide-react";

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

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Quick Stats */}
        {total > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            <Card className="border-none shadow-sm enterprise-card group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-navy/5 rounded-xl group-hover:bg-navy/10 transition-colors">
                  <FileText className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-navy">{total}</p>
                  <p className="text-sm text-muted-foreground">FSDs Generated</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm enterprise-card group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-wc-blue/10 rounded-xl group-hover:bg-wc-blue/15 transition-colors">
                  <Sparkles className="h-6 w-6 text-wc-blue" />
                </div>
                <div>
                  <p className="text-3xl font-bold gradient-text">AI-Powered</p>
                  <p className="text-sm text-muted-foreground">WE-AI Enhanced</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm enterprise-card group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-wc-success/10 rounded-xl group-hover:bg-wc-success/15 transition-colors">
                  <Clock className="h-6 w-6 text-wc-success" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-wc-success">&lt;30s</p>
                  <p className="text-sm text-muted-foreground">Average Generation</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent FSDs */}
        {fsds.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-navy">Recent Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">Your latest generated specifications</p>
              </div>
              <Link
                href="/history"
                className="text-sm text-wc-blue hover:text-wc-blue/80 font-medium inline-flex items-center gap-1 transition-colors group"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {fsds.map((fsd, i) => (
                <Link key={fsd.id} href={`/fsd/${fsd.id}`}>
                  <Card
                    className="border-none shadow-sm enterprise-card cursor-pointer h-full animate-fade-in-up"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-navy/10 text-navy font-semibold"
                        >
                          {fsd.primaryModule}
                        </Badge>
                        {fsd.aiEnabled && (
                          <Badge className="bg-wc-blue/10 text-wc-blue text-xs border-0">
                            WE-AI
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-navy line-clamp-2 mb-2 group-hover:text-wc-blue transition-colors">
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 mb-6">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-semibold text-navy mb-2">
              No documents yet
            </h3>
            <p className="text-muted-foreground mb-8">
              Generate your first FSD to see it here
            </p>
            <Link
              href="/generate"
              className="bg-navy text-white px-8 py-3.5 rounded-xl font-medium hover:bg-navy-light transition-all hover:shadow-lg hover:shadow-navy/20 inline-block"
            >
              Generate New FSD
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
