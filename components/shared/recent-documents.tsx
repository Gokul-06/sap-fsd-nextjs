"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/animations/scroll-reveal";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

interface FsdItem {
  id: string;
  title: string;
  primaryModule: string;
  processArea: string | null;
  aiEnabled: boolean;
  createdAt: Date;
  author: string;
}

interface RecentDocumentsProps {
  fsds: FsdItem[];
}

export function RecentDocuments({ fsds }: RecentDocumentsProps) {
  return (
    <ScrollReveal>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Recent Documents</h2>
            <p className="text-sm text-muted-foreground mt-1">Your latest generated specifications</p>
          </div>
          <Link
            href="/history"
            className="text-sm text-sky-500 hover:text-sky-600 font-medium inline-flex items-center gap-1 transition-colors group"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" staggerDelay={0.1}>
          {fsds.map((fsd) => (
            <StaggerItem key={fsd.id}>
              <Link href={`/fsd/${fsd.id}`}>
                <motion.div
                  whileHover={{
                    y: -8,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                >
                  <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 transition-all duration-500 cursor-pointer h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant="secondary"
                          className="bg-sky-100/80 text-sky-700 font-semibold"
                        >
                          {fsd.primaryModule}
                        </Badge>
                        {fsd.aiEnabled && (
                          <Badge className="bg-blue-50 text-blue-500 text-xs border-0">
                            WE-AI
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 line-clamp-2 mb-2 group-hover:text-sky-500 transition-colors duration-300">
                        {fsd.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {fsd.processArea} · {fsd.author}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(fsd.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      {/* Hover accent line */}
                      <div className="h-0.5 mt-4 rounded-full bg-transparent group-hover:bg-gradient-to-r group-hover:from-sky-400/40 group-hover:to-transparent transition-all duration-500" />
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </ScrollReveal>
  );
}
