// Shared types for the SAP FSD Generator

export interface FSDGenerationRequest {
  title: string;
  projectName: string;
  author: string;
  requirements: string;
  module?: string;
  companyName?: string;
}

export interface FSDGenerationResponse {
  markdown: string;
  primaryModule: string;
  processArea: string;
  classifiedModules: ClassifiedModule[];
  crossModuleImpacts: string[];
  warnings: string[];
  aiEnabled: boolean;
}

export interface ClassifiedModule {
  module: string;
  confidence: number;
  isPrimary: boolean;
  matchedKeywords: string[];
}

export interface FSDHistoryItem {
  id: string;
  title: string;
  projectName: string;
  author: string;
  companyName: string | null;
  primaryModule: string;
  processArea: string;
  aiEnabled: boolean;
  shareId: string | null;
  docxBlobUrl: string | null;
  createdAt: Date;
}

export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
}
