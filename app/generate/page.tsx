"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

/** SAP Activate process areas for tagging */
const PROCESS_AREAS = [
  "Procure-to-Pay",
  "Order-to-Cash",
  "Record-to-Report",
  "Plan-to-Produce",
  "Hire-to-Retire",
  "Warehouse Management",
  "Transportation Management",
  "Asset Management",
  "Project Management",
  "Quality Management",
];

export default function GeneratePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [author, setAuthor] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [module, setModule] = useState("");
  const [requirements, setRequirements] = useState("");
  const [currentMarkdown, setCurrentMarkdown] = useState("");
  const [templateApplied, setTemplateApplied] = useState(false);

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

  const formInput = {
    title,
    projectName: projectName || "SAP Project",
    author: author || "FSD Agent",
    requirements,
    module: module || undefined,
    companyName: companyName || undefined,
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
    setAuthor("");
    setCompanyName("");
    setModule("");
    setRequirements("");
    setCurrentMarkdown("");
    setTemplateApplied(false);
  }

  return (
    <div className="min-h-[calc(100vh-68px-60px)]">
      {/* Step Indicator */}
      <div className="bg-white border-b py-4">
        <div className="max-w-4xl mx-auto px-4">
          <StepIndicator currentStep={step} />
        </div>
      </div>

      {/* Step 1 & 2: Centered narrow layout */}
      {step !== 3 && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* STEP 1: Form */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              {/* Quick-Start Templates */}
              <Card className="shadow-sm border-none bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-5">
                  <QuickTemplates onSelect={handleTemplateSelect} />
                </CardContent>
              </Card>

              {/* Main Form Card */}
              <Card className="shadow-lg border-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-navy/5 rounded-lg">
                        <FileText className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-navy">
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
                      <label className="text-sm font-medium mb-1.5 block">
                        FSD Title{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="e.g. Purchase Order Automation"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        Concise name describing the functional scope
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Project Name
                      </label>
                      <Input
                        placeholder="e.g. S/4HANA Migration Phase 2"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        SAP implementation project reference
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Author
                      </label>
                      <Input
                        placeholder="Your name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Company Name
                      </label>
                      <Input
                        placeholder="e.g. Westernacher"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        SAP Module
                      </label>
                      <Select value={module} onValueChange={setModule}>
                        <SelectTrigger>
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
                      <label className="text-sm font-medium mb-1.5 block">
                        Output Format
                      </label>
                      <Select value="docx" disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Word Document (.docx)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="docx">
                            Word Document (.docx)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Requirements textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium block">
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
                      className="min-h-[220px] resize-y font-mono text-sm"
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

                  {/* Generate button */}
                  <Button
                    size="lg"
                    className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-6 text-base"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate FSD with WE-AI
                  </Button>

                  {/* What you get */}
                  <div className="bg-slate-50 rounded-lg p-4">
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
            <Card className="shadow-lg border-none">
              <CardContent>
                <GenerationProgress />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* STEP 3: Results — Full-width two-column layout */}
      {step === 3 && result && (
        <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-6">
          {/* Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
            <CheckCircle2 className="h-6 w-6 text-wc-success flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800">
                FSD Generated Successfully!
              </p>
              <p className="text-sm text-emerald-600">
                Your document is ready. Use the chat to refine it, then download
                or save.
              </p>
            </div>
            {result.aiEnabled && (
              <Badge className="ml-auto bg-wc-blue text-white">
                WE-AI Powered
              </Badge>
            )}
          </div>

          {/* Stats */}
          <FsdResultStats
            primaryModule={result.primaryModule}
            sections={14}
            integrations={result.crossModuleImpacts.length}
            processArea={result.processArea}
          />

          {/* Actions */}
          <Card className="shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-navy hover:bg-navy-light text-white"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Word (.docx)
                </Button>
                <Button
                  size="lg"
                  variant="outline"
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
                <Button size="lg" variant="ghost" onClick={handleStartOver}>
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
                onMarkdownUpdate={setCurrentMarkdown}
              />
            </div>

            {/* Right: Document Preview */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-navy">
                    Document Preview
                  </CardTitle>
                  {currentMarkdown !== result.markdown && (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-300 bg-amber-50"
                    >
                      Modified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto border rounded-lg p-6 bg-white">
                  <MarkdownRenderer markdown={currentMarkdown} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
