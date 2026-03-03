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
          <Card className="border-none shadow-sm hover:shadow-xl hover:shadow-navy/10 transition-shadow duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-navy/5 rounded-xl group-hover:bg-navy/10 group-hover:scale-110 transition-all duration-300">
                <FileText className="h-6 w-6 text-navy" />
              </div>
              <div>
                <p className="text-3xl font-bold text-navy">
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
          <Card className="border-none shadow-sm hover:shadow-xl hover:shadow-wc-blue/10 transition-shadow duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-wc-blue/10 rounded-xl group-hover:bg-wc-blue/15 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="h-6 w-6 text-wc-blue" />
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
          <Card className="border-none shadow-sm hover:shadow-xl hover:shadow-wc-success/10 transition-shadow duration-500 group cursor-default">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-wc-success/10 rounded-xl group-hover:bg-wc-success/15 group-hover:scale-110 transition-all duration-300">
                <Clock className="h-6 w-6 text-wc-success" />
              </div>
              <div>
                <p className="text-3xl font-bold text-wc-success">
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
