"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StepIndicator } from "@/components/shared/step-indicator";
import { GenerationProgress } from "@/components/fsd/generation-progress";
import { FsdResultStats } from "@/components/fsd/fsd-result-stats";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { RefinementChat } from "@/components/fsd/refinement-chat";
import { QuickTemplates, TemplateData } from "@/components/fsd/quick-templates";
import { MethodologyTips } from "@/components/fsd/methodology-tips";
import { PdfUpload } from "@/components/fsd/pdf-upload";
import { StructuredRequirements } from "@/components/fsd/structured-requirements";
import { TeamProgress } from "@/components/fsd/team-progress";
import { SectionSelector } from "@/components/fsd/section-selector";
import { useFsdGeneration } from "@/hooks/use-fsd-generation";
import { ALL_SECTION_IDS } from "@/lib/constants/section-config";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Save,
  Plus,
  CheckCircle2,
  Sparkles,
  Layers,
  AlertCircle,
  Pencil,
  Eye,
  Users,
  Wrench,
} from "lucide-react";
import type { FsdType } from "@/lib/types";
import { FSD_TYPE_LABELS } from "@/lib/types";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(ALL_SECTION_IDS)
  );
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [author, setAuthor] = useState("GP");
  const [companyName, setCompanyName] = useState("Westernacher");
  const [module, setModule] = useState("");
  const [language, setLanguage] = useState("English");
  const [documentDepth, setDocumentDepth] = useState<"standard" | "comprehensive">("standard");
  const [generationMode, setGenerationMode] = useState<"standard" | "agent-team">("standard");
  const [fsdType, setFsdType] = useState<FsdType>("standard");
  const [requirements, setRequirements] = useState("");
  const [currentMarkdown, setCurrentMarkdown] = useState("");
  const [templateApplied, setTemplateApplied] = useState(false);

  // Inline editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");

  const {
    isGenerating,
    result,
    error,
    isSaving,
    savedId,
    generate,
    saveToHistory,
    downloadWord,
    reset,
    agentProgress,
  } = useFsdGeneration();
  const { toast } = useToast();

  // Sync currentMarkdown when result changes
  useEffect(() => {
    if (result?.markdown) {
      setCurrentMarkdown(result.markdown);
    }
  }, [result]);

  // Pre-fill from template URL param (e.g., /generate?template=cuid123)
  useEffect(() => {
    const templateId = searchParams.get("template");
    if (templateId) {
      fetch(`/api/fsd/${templateId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setTitle(data.title ? `${data.title} (Copy)` : "");
            setProjectName(data.projectName || "");
            setModule(data.primaryModule || "");
            setLanguage(data.language || "English");
            // Extract requirements from the markdown business requirements section
            const reqMatch = data.markdown?.match(/### 3\.3 Functional Requirements\n\n([\s\S]*?)(?=\n### |\n## |$)/);
            if (reqMatch) {
              setRequirements(reqMatch[1].trim());
            }
            setTemplateApplied(true);
            toast({
              title: "Template loaded!",
              description: `Pre-filled from template: ${data.title}`,
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const formInput = {
    title,
    projectName: projectName || "SAP Project",
    author: author || "GP",
    requirements,
    module: module || undefined,
    companyName: companyName || undefined,
    language,
    documentDepth,
    generationMode,
    fsdType,
    selectedSections: Array.from(selectedSections),
  };

  function handleTemplateSelect(template: TemplateData) {
    setTitle(template.title);
    setModule(template.module);
    setProjectName(template.projectName);
    setRequirements(template.requirements);
    setTemplateApplied(true);
    toast({
      title: "Template loaded!",
      description: `${template.title} — review and customize the requirements below.`,
    });
  }

  function handleNextToSections() {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter an FSD title.",
        variant: "destructive",
      });
      return;
    }
    if (!requirements.trim() || requirements.trim().length < 20) {
      toast({
        title: "Missing requirements",
        description:
          "Please enter at least 20 characters of business requirements.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  }

  async function handleGenerate() {
    setStep(3);
    const data = await generate(formInput);
    if (data) {
      setStep(4);
    } else {
      setStep(2);
      toast({
        title: "Generation failed",
        description:
          generationMode === "agent-team"
            ? "Agent Team timed out or encountered an error. Check browser console for details, or try Standard mode."
            : error || "Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleSave() {
    const saved = await saveToHistory(formInput, currentMarkdown);
    if (saved) {
      toast({
        title: "Saved!",
        description: "FSD saved to history. You can access it anytime.",
      });
    } else {
      toast({
        title: "Save failed",
        description: "Could not save to history.",
        variant: "destructive",
      });
    }
  }

  async function handleDownload() {
    toast({
      title: "Generating Word document...",
      description: "This may take a few seconds.",
    });
    await downloadWord(formInput, currentMarkdown);
  }

  function handleStartOver() {
    reset();
    setStep(1);
    setTitle("");
    setProjectName("");
    setAuthor("GP");
    setCompanyName("Westernacher");
    setModule("");
    setLanguage("English");
    setDocumentDepth("standard");
    setGenerationMode("standard");
    setFsdType("standard");
    setRequirements("");
    setCurrentMarkdown("");
    setTemplateApplied(false);
    setSelectedSections(new Set(ALL_SECTION_IDS));
    setIsEditing(false);
    setEditBuffer("");
  }

  function toggleEditMode() {
    if (!isEditing) {
      // Entering edit mode — copy current markdown to buffer
      setEditBuffer(currentMarkdown);
      setIsEditing(true);
    } else {
      // Saving edits — apply buffer to currentMarkdown
      setCurrentMarkdown(editBuffer);
      setIsEditing(false);
      toast({
        title: "Changes applied",
        description: "Your edits have been saved to the document.",
      });
    }
  }

  function cancelEdit() {
    setIsEditing(false);
    setEditBuffer("");
  }

  return (
    <div className="min-h-[calc(100vh-68px-60px)] bg-[#F0F2F5]">
      {/* Step Indicator */}
      <div className="bg-white border-b border-[#0091DA]/10 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <StepIndicator currentStep={step} />
        </div>
      </div>

      {/* Step 1, 2 & 3: Full-width layout */}
      {step !== 4 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* STEP 1: Form */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              {/* Quick-Start Templates */}
              <Card className="shadow-sm border border-[#0091DA]/10 bg-gradient-to-br from-[#0091DA]/[0.02] to-white">
                <CardContent className="p-5">
                  <QuickTemplates onSelect={handleTemplateSelect} />
                </CardContent>
              </Card>

              {/* Main Form Card */}
              <Card className="shadow-lg border border-[#0091DA]/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0091DA]/10 rounded-lg">
                        <FileText className="h-5 w-5 text-[#0091DA]" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-[#1B2A4A]">
                          FSD Requirements
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fill in project details and business requirements
                        </p>
                      </div>
                    </div>
                    {templateApplied && (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Template Applied
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Project info fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        FSD Title{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g. Purchase Order Automation"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                      />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Concise name describing the functional scope
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        Project Name
                      </label>
                      <Input
                        placeholder="e.g. S/4HANA Migration Phase 2"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                      />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        SAP implementation project reference
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        Author
                      </label>
                      <Input
                        placeholder="Your name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        Company Name
                      </label>
                      <Input
                        placeholder="e.g. Westernacher"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        SAP Module
                      </label>
                      <Select value={module} onValueChange={setModule}>
                        <SelectTrigger className="border-[#0091DA]/20 focus:ring-[#0091DA]/20">
                          <SelectValue placeholder="Auto-detect from requirements" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="MM">
                            MM - Materials Management
                          </SelectItem>
                          <SelectItem value="SD">
                            SD - Sales & Distribution
                          </SelectItem>
                          <SelectItem value="FI">
                            FI - Financial Accounting
                          </SelectItem>
                          <SelectItem value="CO">CO - Controlling</SelectItem>
                          <SelectItem value="PP">
                            PP - Production Planning
                          </SelectItem>
                          <SelectItem value="QM">
                            QM - Quality Management
                          </SelectItem>
                          <SelectItem value="EWM">
                            EWM - Extended Warehouse
                          </SelectItem>
                          <SelectItem value="TM">
                            TM - Transportation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        Document Language
                      </label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="border-[#0091DA]/20 focus:ring-[#0091DA]/20">
                          <SelectValue placeholder="English" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="German">Deutsch (German)</SelectItem>
                          <SelectItem value="French">Français (French)</SelectItem>
                          <SelectItem value="Spanish">Español (Spanish)</SelectItem>
                          <SelectItem value="Japanese">日本語 (Japanese)</SelectItem>
                          <SelectItem value="Chinese">中文 (Chinese)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        <Wrench className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                        FSD Type (RICEFW)
                      </label>
                      <Select value={fsdType} onValueChange={(v) => setFsdType(v as FsdType)}>
                        <SelectTrigger className="border-[#0091DA]/20 focus:ring-[#0091DA]/20">
                          <SelectValue placeholder="Standard" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.entries(FSD_TYPE_LABELS) as [FsdType, string][]).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Tailors content to the specific FSD type
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        Document Depth
                      </label>
                      <Select value={documentDepth} onValueChange={(v) => setDocumentDepth(v as "standard" | "comprehensive")}>
                        <SelectTrigger className="border-[#0091DA]/20 focus:ring-[#0091DA]/20">
                          <SelectValue placeholder="Standard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive (deeper detail)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Comprehensive mode generates richer, more detailed sections
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-[#1B2A4A]">
                        <Users className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
                        Generation Mode
                      </label>
                      <Select value={generationMode} onValueChange={(v) => setGenerationMode(v as "standard" | "agent-team")}>
                        <SelectTrigger className="border-[#0091DA]/20 focus:ring-[#0091DA]/20">
                          <SelectValue placeholder="Standard" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Fast)</SelectItem>
                          <SelectItem value="agent-team">Agent Team (Higher Quality)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Agent Team uses 6 coordinated AI agents with quality review
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-[#0091DA]/10" />

                  {/* PDF Upload for Requirements Extraction */}
                  <PdfUpload
                    onRequirementsExtracted={(extracted) => {
                      setRequirements((prev) =>
                        prev.trim()
                          ? `${prev}\n\n--- Extracted from PDF ---\n${extracted}`
                          : extracted
                      );
                      toast({
                        title: "Requirements extracted!",
                        description: "PDF content has been added to the requirements field.",
                      });
                    }}
                  />

                  {/* Structured Requirements */}
                  <StructuredRequirements
                    value={requirements}
                    onChange={setRequirements}
                    onTemplateAppliedChange={setTemplateApplied}
                  />

                  {/* SAP Activate Methodology Tips (collapsible) */}
                  <MethodologyTips />

                  {/* AI Processing Disclosure (GDPR) */}
                  <div className="flex items-start gap-2 text-[11px] text-muted-foreground/70 bg-amber-50/50 border border-amber-200/40 rounded-lg px-3 py-2">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>
                      Your requirements will be processed by AI (Anthropic Claude) to generate the FSD.
                      By proceeding, you agree to our{" "}
                      <a href="/privacy" className="text-[#0091DA] hover:underline">Privacy Policy</a>.
                    </span>
                  </div>

                  {/* Next: Customize Sections Button */}
                  <button
                    className="generate-btn w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white font-semibold py-4 text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#0091DA]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    onClick={handleNextToSections}
                    disabled={isGenerating}
                  >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 animate-shimmer-btn opacity-30 pointer-events-none" />
                    <Layers className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">
                      Next: Customize Sections
                    </span>
                  </button>

                  {/* Section count hint */}
                  <div className="bg-[#0091DA]/[0.04] border border-[#0091DA]/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      <Layers className="h-3 w-3 inline mr-1" />
                      Next step: Choose which of the <span className="font-semibold text-[#0091DA]">14 FSD sections</span> to include in your document
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: Section Selector */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in-up">
              <Card className="shadow-lg border border-[#0091DA]/10">
                <CardContent className="p-6">
                  <SectionSelector
                    selectedSections={selectedSections}
                    onSelectionChange={setSelectedSections}
                  />

                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="border-[#0091DA]/30 text-[#0091DA] hover:bg-[#0091DA]/5"
                      onClick={() => setStep(1)}
                    >
                      ← Back to Requirements
                    </Button>
                    <button
                      className="generate-btn relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white font-semibold py-3 px-8 text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#0091DA]/30 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                      onClick={handleGenerate}
                    >
                      <div className="absolute inset-0 animate-shimmer-btn opacity-30 pointer-events-none" />
                      {generationMode === "agent-team" ? (
                        <Users className="h-5 w-5 relative z-10" />
                      ) : (
                        <Sparkles className="h-5 w-5 relative z-10" />
                      )}
                      <span className="relative z-10">
                        Generate FSD ({selectedSections.size} sections)
                      </span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 3: Loading */}
          {step === 3 && (
            <Card className="shadow-lg border border-[#0091DA]/10">
              <CardContent>
                {generationMode === "agent-team" ? (
                  <TeamProgress progress={agentProgress} />
                ) : (
                  <GenerationProgress />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* STEP 4: Results — Full-width two-column layout */}
      {step === 4 && result && (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-[#0091DA]/10 to-emerald-50 border border-[#0091DA]/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
            <CheckCircle2 className="h-6 w-6 text-wc-success flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-[#1B2A4A]">
                FSD Generated Successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Your document is ready. Use the chat to refine it, or edit
                directly — then download or save.
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {result.aiEnabled && (
                <Badge className="bg-[#0091DA] text-white border-0">
                  WE-AI Powered
                </Badge>
              )}
              <Badge variant="outline" className="border-[#1B2A4A]/30 text-[#1B2A4A]">
                by {author || "GP"}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <FsdResultStats
            primaryModule={result.primaryModule}
            sections={selectedSections.size}
            integrations={result.crossModuleImpacts.length}
            processArea={result.processArea}
          />

          {/* Actions */}
          <Card className="shadow-sm border border-[#0091DA]/10">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] hover:from-[#0091DA]/90 hover:to-[#1B2A4A]/90 text-white shadow-md hover:shadow-lg transition-all"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Word (.docx)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#0091DA]/30 text-[#0091DA] hover:bg-[#0091DA]/5"
                  onClick={handleSave}
                  disabled={isSaving || !!savedId}
                >
                  {savedId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2 text-wc-success" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? "Saving..." : "Save to History"}
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-[#1B2A4A] hover:bg-[#0091DA]/5"
                  onClick={handleStartOver}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New FSD
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-column: Chat + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            {/* Left: Chat Sidebar */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <RefinementChat
                currentMarkdown={currentMarkdown}
                originalMarkdown={result.markdown}
                onMarkdownUpdate={(md) => {
                  setCurrentMarkdown(md);
                  if (isEditing) {
                    setEditBuffer(md);
                  }
                }}
              />
            </div>

            {/* Right: Document Preview with Edit Toggle */}
            <Card className="shadow-lg border border-[#0091DA]/10">
              {/* ── Prominent Edit/Preview Toolbar ── */}
              <div className="border-b border-[#0091DA]/10 bg-gradient-to-r from-slate-50 to-white px-5 py-3">
                <div className="flex items-center justify-between">
                  {/* Tab-style toggle */}
                  <div className="flex items-center bg-[#0091DA]/[0.06] rounded-lg p-1">
                    <button
                      onClick={() => { if (isEditing) toggleEditMode(); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        !isEditing
                          ? "bg-white text-[#1B2A4A] shadow-sm"
                          : "text-muted-foreground hover:text-[#1B2A4A]"
                      }`}
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => { if (!isEditing) toggleEditMode(); }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        isEditing
                          ? "bg-[#0091DA] text-white shadow-sm"
                          : "text-muted-foreground hover:text-[#0091DA]"
                      }`}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Document
                    </button>
                  </div>

                  {/* Status badges + actions */}
                  <div className="flex items-center gap-3">
                    {currentMarkdown !== result.markdown && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 border-amber-300 bg-amber-50"
                      >
                        Modified
                      </Badge>
                    )}
                    {isEditing && (
                      <button
                        onClick={cancelEdit}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Discard changes
                      </button>
                    )}
                    {isEditing && (
                      <Button
                        size="sm"
                        className="bg-[#0091DA] hover:bg-[#0091DA]/90 text-white"
                        onClick={toggleEditMode}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                        Save Changes
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-0">
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      <Badge className="bg-[#1B2A4A]/80 text-green-300 border-0 text-[10px] font-mono">
                        MARKDOWN EDITOR
                      </Badge>
                    </div>
                    <textarea
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      className="w-full min-h-[calc(100vh-320px)] p-6 pt-12 font-mono text-sm bg-[#1B2A4A] text-green-300 border-0 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                      spellCheck={false}
                      placeholder="Edit your FSD markdown here..."
                    />
                  </div>
                ) : (
                  <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-6 bg-white">
                    <MarkdownRenderer markdown={currentMarkdown} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F2F5]" />}>
      <GeneratePageContent />
    </Suspense>
  );
}
