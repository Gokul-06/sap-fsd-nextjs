"use client";

import { useState } from "react";
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
} from "lucide-react";

export default function GeneratePage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [author, setAuthor] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [module, setModule] = useState("");
  const [requirements, setRequirements] = useState("");

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

  const formInput = {
    title,
    projectName: projectName || "SAP Project",
    author: author || "FSD Agent",
    requirements,
    module: module || undefined,
    companyName: companyName || undefined,
  };

  async function handleGenerate() {
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Please enter an FSD title.", variant: "destructive" });
      return;
    }
    if (!requirements.trim() || requirements.trim().length < 20) {
      toast({ title: "Missing requirements", description: "Please enter at least 20 characters of business requirements.", variant: "destructive" });
      return;
    }

    setStep(2);
    const data = await generate(formInput);
    if (data) {
      setStep(3);
    } else {
      setStep(1);
      toast({ title: "Generation failed", description: error || "Please try again.", variant: "destructive" });
    }
  }

  async function handleSave() {
    const saved = await saveToHistory(formInput);
    if (saved) {
      toast({ title: "Saved!", description: "FSD saved to history. You can access it anytime." });
    } else {
      toast({ title: "Save failed", description: "Could not save to history.", variant: "destructive" });
    }
  }

  async function handleDownload() {
    toast({ title: "Generating Word document...", description: "This may take a few seconds." });
    await downloadWord(formInput);
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
  }

  return (
    <div className="min-h-[calc(100vh-68px-60px)]">
      {/* Step Indicator */}
      <div className="bg-white border-b py-4">
        <div className="max-w-4xl mx-auto px-4">
          <StepIndicator currentStep={step} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* STEP 1: Form */}
        {step === 1 && (
          <Card className="shadow-lg border-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-navy/5 rounded-lg">
                  <FileText className="h-5 w-5 text-navy" />
                </div>
                <div>
                  <CardTitle className="text-xl text-navy">
                    FSD Requirements
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Fill in the project details and paste your business requirements
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    FSD Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Purchase Order Automation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g. S/4HANA Migration"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
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
                      <SelectItem value="MM">MM - Materials Management</SelectItem>
                      <SelectItem value="SD">SD - Sales & Distribution</SelectItem>
                      <SelectItem value="FI">FI - Financial Accounting</SelectItem>
                      <SelectItem value="CO">CO - Controlling</SelectItem>
                      <SelectItem value="PP">PP - Production Planning</SelectItem>
                      <SelectItem value="QM">QM - Quality Management</SelectItem>
                      <SelectItem value="EWM">EWM - Extended Warehouse</SelectItem>
                      <SelectItem value="TM">TM - Transportation</SelectItem>
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
                      <SelectItem value="docx">Word Document (.docx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Business Requirements <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Paste your business requirements, user stories, or process description here...&#10;&#10;Example: Automate purchase order creation for indirect materials with approval workflow based on cost center and amount thresholds. Include three-way matching for invoice verification and automatic GR posting."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="min-h-[200px] resize-y"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Tip: The more detail you provide, the better the AI-generated content will be.
                </p>

                <ModuleDetector
                  modules={classificationResult?.modules || null}
                  isLoading={isClassifying}
                />
              </div>

              <Button
                size="lg"
                className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-6 text-base"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate FSD with AI
              </Button>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Loading */}
        {step === 2 && (
          <Card className="shadow-lg border-none">
            <CardContent>
              <GenerationProgress />
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Results */}
        {step === 3 && result && (
          <div className="space-y-6">
            {/* Success Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-wc-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800">
                  FSD Generated Successfully!
                </p>
                <p className="text-sm text-emerald-600">
                  Your document is ready to download or preview below.
                </p>
              </div>
              {result.aiEnabled && (
                <Badge className="ml-auto bg-wc-blue text-white">
                  AI-Powered
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
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={handleStartOver}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New FSD
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="text-lg text-navy">
                  Document Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[600px] overflow-y-auto border rounded-lg p-6 bg-white">
                  <MarkdownRenderer markdown={result.markdown} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
