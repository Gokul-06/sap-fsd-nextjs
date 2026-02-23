"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, X, FileText, Loader2 } from "lucide-react";

interface PdfUploadProps {
  onRequirementsExtracted: (requirements: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function PdfUpload({ onRequirementsExtracted }: PdfUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  async function processFile(file: File) {
    setError(null);

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("File exceeds 10 MB limit.");
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);

    try {
      // Convert to base64
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const res = await fetch("/api/extract-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          mediaType: "application/pdf",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Extraction failed");
      }

      const data = await res.json();
      onRequirementsExtracted(data.requirements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract requirements");
    } finally {
      setIsExtracting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function clearFile() {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {isExtracting ? (
        <div className="flex items-center gap-3 p-4 bg-[#0091DA]/5 border border-[#0091DA]/20 rounded-lg">
          <Loader2 className="h-5 w-5 text-[#0091DA] animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1B2A4A]">
              Extracting requirements from {fileName}...
            </p>
            <p className="text-xs text-muted-foreground">
              Claude is reading and analyzing the document
            </p>
          </div>
        </div>
      ) : fileName && !error ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="text-sm text-emerald-700 flex-1 truncate">{fileName}</span>
          <button onClick={clearFile} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            isDragging
              ? "border-[#0091DA] bg-[#0091DA]/5"
              : "border-[#0091DA]/20 hover:border-[#0091DA]/40 hover:bg-[#0091DA]/[0.02]"
          }`}
        >
          <FileUp className="h-5 w-5 text-[#0091DA]/60 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-[#1B2A4A] font-medium">
              Upload PDF (BRD, Requirements Doc)
            </p>
            <p className="text-xs text-muted-foreground">
              Drop a PDF here or click to browse · Max 10 MB
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-[#0091DA]/30 text-[#0091DA] hover:bg-[#0091DA]/5"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
