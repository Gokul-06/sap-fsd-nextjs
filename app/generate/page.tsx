"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ModuleDetector } from "@/components/fsd/module-detector";
import { GenerationProgress } from "@/components/fsd/generation-progress";
import { FsdResultStats } from "@/components/fsd/fsd-result-stats";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { RefinementChat } from "@/components/fsd/refinement-chat";
import { QuickTemplates, TemplateData } from "@/components/fsd/quick-templates";
import { MethodologyTips } from "@/components/fsd/methodology-tips";
import { useFsdGeneration } from "@/hooks/use-fsd-generation";
import { useModuleClassification } from "@/hooks/use-module-classification";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Download,
  Save,
  Plus,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  AlertCircle,
  Pencil,
  Eye,
} from "lucide-react";

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [author, setAuthor] = useState("GP");
  const [companyName, setCompanyName] = useState("Westernacher");
  const [module, setModule] = useState("");
  const [language, setLanguage] = useState("English");
  const [requirements, setRequirements] = useState("");
  const [currentMarkdown, setCurrentMarkdown] = useState("");
  const [templateApplied, setTemplateApplied] = useState(false);

  // Inline editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");

  const { result: classificationResult, isLoading: isClassifying } =
    useModuleClassification(requirements);
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

  async function handleGenerate() {
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
    const data = await generate(formInput);
    if (data) {
      setStep(3);
    } else {
      setStep(1);
      toast({
        title: "Generation failed",
        description: error || "Please try again.",
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
    setRequirements("");
    setCurrentMarkdown("");
    setTemplateApplied(false);
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

      {/* Step 1 & 2: Full-width layout */}
      {step !== 3 && (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="French">Fran\u00e7ais (French)</SelectItem>
                          <SelectItem value="Spanish">Espa\u00f1ol (Spanish)</SelectItem>
                          <SelectItem value="Japanese">\u65e5\u672c\u8a9e (Japanese)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator className="bg-[#0091DA]/10" />

                  {/* Requirements textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium block text-[#1B2A4A]">
                        Business Requirements{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <Layers className="h-3 w-3" />
                        {requirements.length > 0 && (
                          <span>
                            {requirements.length} chars ·{" "}
                            {requirements.split(/\n/).filter(Boolean).length}{" "}
                            lines
                          </span>
                        )}
                      </div>
                    </div>
                    <Textarea
                      placeholder={`Paste your business requirements, user stories, or process description here...

Example (SAP Activate — Explore Phase):
─────────────────────────────────
1. Process Scope: Define the end-to-end business process
2. Transactions: Reference SAP transactions (ME21N, VA01, FB01...)
3. Business Rules: Approval workflows, tolerances, validations
4. Integrations: Cross-module touchpoints (FI↔MM, SD↔FI...)
5. Reports & Analytics: Required dashboards, KPIs, Fiori apps
6. Authorization: Role-based access requirements
7. Data Migration: Legacy data objects to migrate`}
                      value={requirements}
                      onChange={(e) => {
                        setRequirements(e.target.value);
                        if (templateApplied) setTemplateApplied(false);
                      }}
                      className="min-h-[220px] resize-y font-mono text-sm border-[#0091DA]/20 focus:border-[#0091DA] focus:ring-[#0091DA]/20"
                    />

                    {/* Smart tips based on content length */}
                    <div className="mt-2 flex items-start gap-2">
                      {requirements.length < 50 && requirements.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>
                            Add more detail for better results — include
                            transactions, business rules, and process steps
                          </span>
                        </div>
                      ) : requirements.length >= 200 ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                          <span>
                            Great detail! WE-AI will generate a comprehensive
                            14-section FSD
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/60">
                          <BookOpen className="h-3 w-3 inline mr-1" />
                          The more detail you provide, the richer the generated
                          specification
                        </p>
                      )}
                    </div>

                    <ModuleDetector
                      modules={classificationResult?.modules || null}
                      isLoading={isClassifying}
                    />
                  </div>

                  {/* SAP Activate Methodology Tips (collapsible) */}
                  <MethodologyTips />

                  {/* Animated Generate Button */}
                  <button
                    className="generate-btn w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0091DA] to-[#1B2A4A] text-white font-semibold py-4 text-base transition-all duration-300 hover:shadow-xl hover:shadow-[#0091DA]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {/* Shimmer overlay */}
                    <div className="absolute inset-0 animate-shimmer-btn opacity-30 pointer-events-none" />
                    <Sparkles className="h-5 w-5 relative z-10" />
                    <span className="relative z-10">Generate FSD with WE-AI</span>
                  </button>

                  {/* What you get */}
                  <div className="bg-[#0091DA]/[0.04] border border-[#0091DA]/10 rounded-lg p-4">
                    <p className="text-xs font-semibold text-[#1B2A4A] mb-2">
                      Your FSD will include:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 text-[11px] text-muted-foreground">
                      {[
                        "Executive Summary",
                        "Solution Design",
                        "Business Process Flow",
                        "Functional Requirements",
                        "Technical Architecture",
                        "Data Migration Plan",
                        "Integration Points",
                        "Authorization Concept",
                        "Test Scenarios",
                        "Cutover Plan",
                        "SAP Object Mapping",
                        "Cross-Module Impacts",
                        "Risk Assessment",
                        "Training Plan",
                      ].map((section) => (
                        <div key={section} className="flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-[#0091DA]" />
                          {section}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STEP 2: Loading */}
          {step === 2 && (
            <Card className="shadow-lg border border-[#0091DA]/10">
              <CardContent>
                <GenerationProgress />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* STEP 3: Results — Full-width two-column layout */}
      {step === 3 && result && (
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
            sections={14}
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
