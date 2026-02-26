"use client";

import { useState } from "react";
import { useCalm } from "@/hooks/use-calm";

interface CalmImportProps {
  onImport: (text: string, projectId: string, projectName: string, requirementIds: string[]) => void;
}

export function CalmImport({ onImport }: CalmImportProps) {
  const { status, projects, requirements, loading, error, loadProjects, loadRequirements } = useCalm();
  const [expanded, setExpanded] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [selectedReqs, setSelectedReqs] = useState<Set<string>>(new Set());

  // Don't render if CALM is not configured
  if (!status.configured) return null;

  const handleExpand = () => {
    if (!expanded && projects.length === 0) {
      loadProjects();
    }
    setExpanded(!expanded);
  };

  const handleProjectSelect = async (projectId: string) => {
    setSelectedProjectId(projectId);
    const project = projects.find((p) => p.id === projectId);
    setSelectedProjectName(project?.name || "");
    setSelectedReqs(new Set());
    if (projectId) {
      await loadRequirements(projectId);
    }
  };

  const toggleReq = (reqId: string) => {
    setSelectedReqs((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) {
        next.delete(reqId);
      } else {
        next.add(reqId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedReqs.size === requirements.length) {
      setSelectedReqs(new Set());
    } else {
      setSelectedReqs(new Set(requirements.map((r) => r.id)));
    }
  };

  const handleImport = () => {
    const selected = requirements.filter((r) => selectedReqs.has(r.id));
    if (selected.length === 0) return;

    const lines: string[] = [
      `Project: ${selectedProjectName}`,
      `Source: SAP Cloud ALM (${selected.length} requirements)`,
      "",
    ];

    selected.forEach((req, idx) => {
      lines.push(`${idx + 1}. ${req.title}`);
      if (req.priority) lines.push(`   Priority: ${req.priority}`);
      if (req.description) lines.push(`   ${req.description}`);
      lines.push("");
    });

    onImport(
      lines.join("\n"),
      selectedProjectId,
      selectedProjectName,
      Array.from(selectedReqs)
    );
    setExpanded(false);
  };

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50/50 overflow-hidden">
      <button
        type="button"
        onClick={handleExpand}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          <span className="font-medium text-gray-900">Import from SAP Cloud ALM</span>
          {!status.connected && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Not connected
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-blue-200">
          {error && (
            <div className="mt-3 text-sm text-red-600 bg-red-50 rounded p-2">{error}</div>
          )}

          {/* Project selector */}
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
            <select
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={selectedProjectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Choose a CALM project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Requirements list */}
          {selectedProjectId && requirements.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Requirements ({requirements.length})
                </span>
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedReqs.size === requirements.length ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-md bg-white p-2">
                {requirements.map((req) => (
                  <label
                    key={req.id}
                    className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedReqs.has(req.id)}
                      onChange={() => toggleReq(req.id)}
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-gray-900 font-medium truncate">{req.title}</div>
                      {req.priority && (
                        <span className="text-xs text-gray-500">Priority: {req.priority}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedProjectId && requirements.length === 0 && !loading && (
            <p className="text-sm text-gray-500 mt-2">No requirements found in this project.</p>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading...
            </div>
          )}

          {/* Import button */}
          {selectedReqs.size > 0 && (
            <button
              type="button"
              onClick={handleImport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors"
            >
              Use {selectedReqs.size} requirement{selectedReqs.size > 1 ? "s" : ""}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
