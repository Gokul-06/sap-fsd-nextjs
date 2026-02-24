"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type OutputType = "sop" | "manual";
type Status = "idle" | "uploading" | "generating" | "done" | "error";

const SAP_MODULES = ["MM", "SD", "FI", "CO", "PP", "EWM", "TM", "QM", "PM", "PS"];

export default function DocTransformPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processName, setProcessName] = useState("");
  const [moduleName, setModuleName] = useState("MM");
  const [outputType, setOutputType] = useState<OutputType>("sop");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for generation progress
  useEffect(() => {
    if (status === "generating") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".docx") || f.name.endsWith(".doc") || f.name.endsWith(".txt"))) {
      setFile(f);
    }
  }, []);

  const handleGenerate = async () => {
    if (!file || !processName.trim()) return;
    setStatus("generating");
    setError("");
    setResult("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("processName", processName.trim());
      formData.append("moduleName", moduleName);
      formData.append("outputType", outputType);

      const res = await fetch("/api/doc-transform", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult(data.content);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const handleExportWord = async () => {
    if (!result) return;
    setExporting(true);
    setError("");
    try {
      const res = await fetch("/api/doc-transform-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: result,
          processName,
          moduleName,
          author: "Gokul Palanisamy",
          documentType: outputType,
        }),
      });
      if (!res.ok) {
        let errMsg = "Export failed";
        try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch { /* ignore */ }
        throw new Error(errMsg);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${outputType.toUpperCase()}_${processName.replace(/\s+/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Word export failed. Try copying the content instead.");
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2">
              <span className="text-base font-bold text-[#1B2A4A]">Westernacher</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">Nonstop Innovation</span>
            </a>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-sm font-medium text-[#1B2A4A]">Document Transformer</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="/generate" className="text-slate-500 hover:text-[#0091DA]">FSD Generator</a>
            <a href="/doc-transform" className="text-[#0091DA] font-medium">Doc Transform</a>
            <a href="/history" className="text-slate-500 hover:text-[#0091DA]">History</a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-[#1B2A4A]">Document Transformer</h1>
          <p className="text-sm text-slate-400 mt-1">Upload a QRG to generate a complete SOP or User Manual — AI-powered, enterprise-grade</p>
        </div>

        {status !== "done" ? (
          /* ─── INPUT FORM ─── */
          <div className="grid grid-cols-[1fr_340px] gap-6">
            {/* Left: Main form */}
            <div className="space-y-5">
              {/* File Upload */}
              <div className="bg-white rounded-lg border border-slate-200/80 p-6">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-3">Upload QRG Document</label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    file ? "border-[#0091DA]/40 bg-[#0091DA]/[0.02]" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".docx,.doc,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                  />
                  {file ? (
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-[#0091DA]/10 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-[#0091DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#1B2A4A]">{file.name}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                      <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[11px] text-red-400 hover:text-red-500 mt-2">Remove</button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-600">Drop your QRG file here or <span className="text-[#0091DA] font-medium">browse</span></p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports .docx, .doc, .txt</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Process Details */}
              <div className="bg-white rounded-lg border border-slate-200/80 p-6">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-3">Process Details</label>
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1.5">Process Name</label>
                    <input
                      type="text"
                      value={processName}
                      onChange={(e) => setProcessName(e.target.value)}
                      placeholder="e.g., Good Receipts with Batch Management"
                      className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1B2A4A] placeholder:text-slate-300 focus:outline-none focus:border-[#0091DA] focus:ring-1 focus:ring-[#0091DA]/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1.5">SAP Module</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SAP_MODULES.map((m) => (
                        <button
                          key={m}
                          onClick={() => setModuleName(m)}
                          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            moduleName === m ? "bg-[#1B2A4A] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Type */}
              <div className="bg-white rounded-lg border border-slate-200/80 p-6">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-3">Output Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOutputType("sop")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      outputType === "sop" ? "border-[#0091DA] bg-[#0091DA]/[0.03]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#0091DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span className={`text-sm font-semibold ${outputType === "sop" ? "text-[#0091DA]" : "text-[#1B2A4A]"}`}>
                        Standard Operating Procedure
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Expands QRG with process overview, glossary, exception handling, and process controls
                    </p>
                  </button>
                  <button
                    onClick={() => setOutputType("manual")}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      outputType === "manual" ? "border-[#0091DA] bg-[#0091DA]/[0.03]" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-[#0091DA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <span className={`text-sm font-semibold ${outputType === "manual" ? "text-[#0091DA]" : "text-[#1B2A4A]"}`}>
                        User Manual
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Full training document with purpose, roles, detailed steps, metrics, and assurance activities
                    </p>
                  </button>
                </div>
              </div>

              {/* Generate Button */}
              {status !== "generating" && (
                <button
                  onClick={handleGenerate}
                  disabled={!file || !processName.trim()}
                  className={`w-full py-3.5 rounded-lg text-sm font-medium transition-all ${
                    !file || !processName.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-[#1B2A4A] text-white hover:bg-[#243558]"
                  }`}
                >
                  Generate {outputType === "sop" ? "SOP" : "User Manual"}
                </button>
              )}

              {/* Generating Progress */}
              {status === "generating" && (
                <div className="bg-white rounded-lg border border-slate-200/80 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10">
                      <svg className="animate-spin w-10 h-10" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="17" stroke="#E2E8F0" strokeWidth="3" />
                        <circle cx="20" cy="20" r="17" stroke="#0091DA" strokeWidth="3" strokeDasharray="50 57" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#1B2A4A]">
                        Generating {outputType === "sop" ? "Standard Operating Procedure" : "User Manual"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {elapsed < 10 ? "Parsing document..." :
                         elapsed < 30 ? "AI is writing content..." :
                         elapsed < 60 ? "Building detailed sections..." :
                         elapsed < 90 ? "Generating tables and exceptions..." :
                         "Finalizing document..."}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                    <div
                      className="bg-[#0091DA] h-1.5 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(95, elapsed * 0.8)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Elapsed: {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}</span>
                    <span>Typically takes 1-2 minutes</span>
                  </div>

                  {/* Progress steps */}
                  <div className="mt-4 space-y-2.5">
                    {[
                      { label: "Document parsed", time: 5 },
                      { label: "Content analysis complete", time: 15 },
                      { label: "Generating sections", time: 30 },
                      { label: "Building tables & exceptions", time: 60 },
                      { label: "Final review", time: 90 },
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        {elapsed >= step.time ? (
                          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                        ) : elapsed >= step.time - 10 ? (
                          <svg className="w-4 h-4 text-[#0091DA] animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="20 36" strokeLinecap="round" /></svg>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-200 flex-shrink-0" />
                        )}
                        <span className={`text-[12px] ${elapsed >= step.time ? "text-slate-600" : "text-slate-300"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{error}</div>
              )}
            </div>

            {/* Right: How it works */}
            <div className="space-y-5">
              <div className="bg-white rounded-lg border border-slate-200/80 p-5">
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">How it works</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Upload QRG", desc: "Drop your Quick Reference Guide (.docx)" },
                    { step: "2", title: "Set context", desc: "Name the process and select SAP module" },
                    { step: "3", title: "Choose output", desc: "SOP or User Manual format" },
                    { step: "4", title: "Generate", desc: "AI transforms QRG into full document" },
                    { step: "5", title: "Export", desc: "Download as Word or copy markdown" },
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#0091DA]/10 text-[#0091DA] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                      <div>
                        <div className="text-sm font-medium text-[#1B2A4A]">{s.title}</div>
                        <div className="text-[11px] text-slate-400">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-slate-200/80 p-5">
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-3">What gets generated</h3>
                <div className="space-y-2">
                  {outputType === "sop" ? (
                    ["Version History", "Glossary", "Icons Reference", "Process Overview", "Process Steps", "Exception Handling (8+)", "Process Controls"].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[11px]">
                        <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-slate-600">{s}</span>
                      </div>
                    ))
                  ) : (
                    ["Purpose & Scope", "Requirements", "Process Description", "Roles & Responsibilities", "Detailed Steps", "Process Interfaces", "Training Requirements", "Metrics & Assurance", "Appendices (4)"].map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[11px]">
                        <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-slate-600">{s}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-[#1B2A4A] rounded-lg p-5 text-white">
                <div className="text-sm font-semibold mb-1">Time savings</div>
                <p className="text-[11px] text-white/60 leading-relaxed">
                  A typical SOP takes 3-5 days to write manually. A User Manual takes 5-8 days. This tool generates either in under 2 minutes from your existing QRG.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div>
                    <div className="text-lg font-bold">~85%</div>
                    <div className="text-[10px] text-white/40">SOP time saved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">~90%</div>
                    <div className="text-[10px] text-white/40">Manual time saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ─── RESULT VIEW ─── */
          <div>
            {/* Result header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setStatus("idle"); setResult(""); }}
                  className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#0091DA]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  New Document
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <div>
                  <h2 className="text-base font-semibold text-[#1B2A4A]">{processName}</h2>
                  <p className="text-[11px] text-slate-400">{outputType === "sop" ? "Standard Operating Procedure" : "User Manual"} — {moduleName} Module</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-md text-sm hover:bg-slate-50">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                  Copy
                </button>
                <button onClick={handleExportWord} disabled={exporting} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium ${exporting ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-[#1B2A4A] text-white hover:bg-[#243558]"}`}>
                  {exporting ? (
                    <>
                      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" /></svg>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                      Export .docx
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Export error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 mb-4 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-500 text-xs ml-3">Dismiss</button>
              </div>
            )}

            {/* Result content */}
            <div className="bg-white rounded-lg border border-slate-200/80 p-8 prose prose-sm prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
