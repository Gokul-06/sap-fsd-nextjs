"use client";

/**
 * History Page — Cursor-Based (Keyset) Pagination
 *
 * Why keyset over offset?
 *   OFFSET 1000 LIMIT 20  → DB scans 1020 rows, discards 1000 → O(n)
 *   WHERE id < cursor LIMIT 20 → B-tree index seek → O(log n) ≈ O(1)
 *
 * Loads 20 items at a time, "Load More" fetches next page via cursor.
 */

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Globe, Star, Wrench, Loader2 } from "lucide-react";
import { FSD_TYPE_LABELS } from "@/lib/types";
import type { FsdType } from "@/lib/types";
import { ExportDataButton } from "@/components/shared/export-data-button";

const PAGE_SIZE = 20;

interface FsdItem {
  id: string;
  title: string;
  projectName: string;
  primaryModule: string;
  processArea: string;
  aiEnabled: boolean;
  rating: number | null;
  language: string;
  fsdType: string;
  createdAt: string;
  author: string;
  _count: { comments: number };
}

export default function HistoryPage() {
  const [fsds, setFsds] = useState<FsdItem[]>([]);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(async (cursor?: string) => {
    const isFirstPage = !cursor;
    if (isFirstPage) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({ take: String(PAGE_SIZE) });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/fsd?${params}`);
      const data = await res.json();

      if (isFirstPage) {
        setFsds(data.fsds);
      } else {
        setFsds((prev) => [...prev, ...data.fsds]);
      }
      setTotal(data.total);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      // Show what we have
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy">FSD History</h1>
          <p className="text-muted-foreground mt-1">
            {total} document{total !== 1 ? "s" : ""} generated
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportDataButton />
          <Link
            href="/generate"
            className="bg-navy text-white px-5 py-2.5 rounded-lg font-medium hover:bg-navy-light transition-colors text-sm"
          >
            + New FSD
          </Link>
        </div>
      </div>

      {fsds.length > 0 ? (
        <>
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
                          {new Date(fsd.createdAt).toLocaleDateString(undefined, {
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

          {/* Load More — cursor-based O(1) pagination */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => nextCursor && fetchPage(nextCursor)}
                disabled={loadingMore}
                className="bg-navy/10 text-navy px-6 py-2.5 rounded-lg font-medium hover:bg-navy/20 transition-colors text-sm disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  `Load More (${fsds.length} of ${total})`
                )}
              </button>
            </div>
          )}
        </>
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
