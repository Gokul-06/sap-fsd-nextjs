"use client";

import {
  Crown,
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  GitBranch,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgentRole, AgentRoleMeta } from "@/lib/agent-training-questions";

const ICONS: Record<string, React.ElementType> = {
  Crown,
  FileText,
  Cpu,
  Wrench,
  CalendarCheck,
  GitBranch,
};

interface AgentTrainingData {
  id: string;
  agentRole: string;
  expertName: string;
  isActive: boolean;
  createdAt: string;
}

interface AgentCardProps {
  meta: AgentRoleMeta;
  training: AgentTrainingData | null;
  isSelected: boolean;
  onClick: () => void;
  onDelete: (role: AgentRole) => void;
}

export function AgentCard({
  meta,
  training,
  isSelected,
  onClick,
  onDelete,
}: AgentCardProps) {
  const Icon = ICONS[meta.icon] || Circle;
  const isTrained = !!training;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "ring-2 ring-[#0091DA] shadow-lg"
          : "hover:ring-1 hover:ring-[#0091DA]/30"
      } ${isTrained ? "bg-emerald-50/50 border-emerald-200" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2.5 rounded-xl ${
              isTrained
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          {isTrained ? (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs"
            >
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Trained
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              <Circle className="w-3 h-3 mr-1" />
              Not trained
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-[#1B2A4A] mb-1">{meta.label}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {meta.description}
        </p>

        {isTrained && training && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-600 font-medium">
              Expert: {training.expertName}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meta.role);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {!isTrained && (
          <p className="text-xs text-[#0091DA] font-medium">
            Click to train &rarr;
          </p>
        )}
      </CardContent>
    </Card>
  );
}
