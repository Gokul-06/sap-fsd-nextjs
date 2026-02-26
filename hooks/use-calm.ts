"use client";

import { useState, useEffect, useCallback } from "react";

interface CalmProject {
  id: string;
  name: string;
  description?: string;
}

interface CalmRequirement {
  id: string;
  title: string;
  description: string;
  priority?: string;
  status?: string;
}

interface CalmStatus {
  configured: boolean;
  connected: boolean;
  error?: string;
}

export function useCalm() {
  const [status, setStatus] = useState<CalmStatus>({ configured: false, connected: false });
  const [projects, setProjects] = useState<CalmProject[]>([]);
  const [requirements, setRequirements] = useState<CalmRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check CALM status on mount
  useEffect(() => {
    fetch("/api/calm/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch(() => setStatus({ configured: false, connected: false }));
  }, []);

  // Load projects
  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calm/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load requirements for a project
  const loadRequirements = useCallback(async (projectId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/calm/projects/${encodeURIComponent(projectId)}/requirements`);
      if (!res.ok) throw new Error("Failed to load requirements");
      const data = await res.json();
      setRequirements(data.requirements || []);
      return data.requirements || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requirements");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Push FSD to CALM
  const pushFsd = useCallback(async (fsdId: string, projectId: string, projectName: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/calm/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fsdId, projectId, projectName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to push FSD to CALM");
      }
      return await res.json();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to push FSD";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    projects,
    requirements,
    loading,
    error,
    loadProjects,
    loadRequirements,
    pushFsd,
  };
}
