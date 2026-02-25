"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export function ExportDataButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fsd-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-navy/20 text-navy hover:bg-navy/5 transition-colors disabled:opacity-50"
      title="Export all your data (GDPR Art. 20)"
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export My Data"}
    </button>
  );
}
