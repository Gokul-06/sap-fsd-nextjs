"use client";

import { FileText, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Counter } from "@/components/animations/counter";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";

interface StatsSectionProps {
  total: number;
}

export function StatsSection({ total }: StatsSectionProps) {
  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14" staggerDelay={0.15}>
      <StaggerItem>
        <motion.div
          whileHover={{
            y: -6,
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
        >
          <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 transition-all duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-sky-50/80 rounded-xl group-hover:bg-sky-100 group-hover:scale-110 transition-all duration-300">
                <FileText className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">
                  <Counter target={total} duration={1.2} />
                </p>
                <p className="text-sm text-muted-foreground">FSDs Generated</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StaggerItem>

      <StaggerItem>
        <motion.div
          whileHover={{
            y: -6,
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
        >
          <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-sky-200/40 transition-all duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50/80 rounded-xl group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text">AI-Powered</p>
                <p className="text-sm text-muted-foreground">WE-AI Enhanced</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StaggerItem>

      <StaggerItem>
        <motion.div
          whileHover={{
            y: -6,
            transition: { type: "spring", stiffness: 400, damping: 15 },
          }}
        >
          <Card className="border-none bg-white/60 backdrop-blur-xl shadow-lg shadow-sky-100/30 hover:shadow-xl hover:shadow-emerald-200/30 transition-all duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-50/80 rounded-xl group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                <Clock className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-emerald-500">
                  &lt;<Counter target={30} duration={1} suffix="s" />
                </p>
                <p className="text-sm text-muted-foreground">Average Generation</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </StaggerItem>
    </StaggerContainer>
  );
}
