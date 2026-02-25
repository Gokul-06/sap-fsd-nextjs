"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, Sparkles } from "lucide-react";
import { AgentCard } from "@/components/training/agent-card";
import { QuestionnaireForm } from "@/components/training/questionnaire-form";
import {
  AGENT_ROLE_META,
  AGENT_ROLES,
  type AgentRole,
} from "@/lib/agent-training-questions";

interface TrainingData {
  id: string;
  agentRole: string;
  expertName: string;
  questionnaire: string; // JSON string
  personalityPrompt: string;
  isActive: boolean;
  createdAt: string;
}

type TrainingMap = Record<string, TrainingData | null>;

export default function TrainPage() {
  const [trainings, setTrainings] = useState<TrainingMap>({});
  const [selectedRole, setSelectedRole] = useState<AgentRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrainings = useCallback(async () => {
    try {
      const res = await fetch("/api/agent-training");
      if (res.ok) {
        const data = await res.json();
        setTrainings(data);
      }
    } catch (err) {
      console.error("Failed to fetch trainings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const handleSave = async (
    role: string,
    expertName: string,
    questionnaire: Record<string, string>,
  ) => {
    const res = await fetch("/api/agent-training", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentRole: role, expertName, questionnaire }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save training");
    }

    await fetchTrainings();
    setSelectedRole(null);
  };

  const handleDelete = async (role: AgentRole) => {
    if (!confirm(`Remove training for ${AGENT_ROLE_META[role].label}?`)) return;

    try {
      await fetch(`/api/agent-training/${role}`, { method: "DELETE" });
      await fetchTrainings();
    } catch (err) {
      console.error("Failed to delete training:", err);
    }
  };

  const trainedCount = Object.values(trainings).filter(Boolean).length;

  // If a role is selected, show the questionnaire form
  if (selectedRole) {
    const meta = AGENT_ROLE_META[selectedRole];
    const existing = trainings[selectedRole];
    let existingAnswers: Record<string, string> | undefined;

    if (existing?.questionnaire) {
      try {
        existingAnswers = JSON.parse(existing.questionnaire);
      } catch {
        existingAnswers = undefined;
      }
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <QuestionnaireForm
          meta={meta}
          existingAnswers={existingAnswers}
          existingExpertName={existing?.expertName}
          onSave={handleSave}
          onBack={() => setSelectedRole(null)}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0091DA]/10 to-purple-100">
            <Brain className="w-6 h-6 text-[#0091DA]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            Train Your Agent Team
          </h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Give each AI agent the brain of your best SAP experts. Answer
          role-specific questions and the agent will learn to think and write
          like your team.
        </p>

        {/* Stats bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border">
            <Sparkles className="w-4 h-4 text-[#0091DA]" />
            <span className="text-sm font-medium text-[#1B2A4A]">
              {trainedCount}/{AGENT_ROLES.length} agents trained
            </span>
          </div>
          {trainedCount > 0 && trainedCount < AGENT_ROLES.length && (
            <p className="text-sm text-muted-foreground">
              {AGENT_ROLES.length - trainedCount} more to go — untrained agents
              use default SAP expert personas
            </p>
          )}
          {trainedCount === AGENT_ROLES.length && (
            <p className="text-sm text-emerald-600 font-medium">
              All agents trained! Your team&apos;s expertise is fully loaded.
            </p>
          )}
        </div>
      </div>

      {/* Agent Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENT_ROLES.map((role) => (
            <div
              key={role}
              className="h-44 rounded-xl bg-slate-50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENT_ROLES.map((role) => (
            <AgentCard
              key={role}
              meta={AGENT_ROLE_META[role]}
              training={trainings[role] as TrainingData | null}
              isSelected={false}
              onClick={() => setSelectedRole(role)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-[#0091DA]/5 border border-[#0091DA]/10 rounded-xl">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-2">
          How it works
        </h3>
        <ol className="text-sm text-muted-foreground space-y-1">
          <li>
            1. <strong>Pick an agent</strong> — click any card above
          </li>
          <li>
            2. <strong>Answer questions</strong> — share how your expert thinks
            and works (minimum 3 questions)
          </li>
          <li>
            3. <strong>AI compiles</strong> — Claude distills the answers into a
            personality instruction
          </li>
          <li>
            4. <strong>Generate FSDs</strong> — the agent now thinks like your
            expert in every generation
          </li>
        </ol>
      </div>
    </div>
  );
}
