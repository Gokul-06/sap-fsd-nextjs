"use client";

import { Card, CardContent } from "@/components/ui/card";

interface FsdResultStatsProps {
  primaryModule: string;
  sections: number;
  integrations: number;
  processArea: string;
}

export function FsdResultStats({
  primaryModule,
  sections,
  integrations,
  processArea,
}: FsdResultStatsProps) {
  const stats = [
    { label: "Primary Module", value: primaryModule },
    { label: "Sections", value: String(sections) },
    { label: "Integrations", value: String(integrations) },
    { label: "Process Area", value: processArea },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-wc-blue">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
