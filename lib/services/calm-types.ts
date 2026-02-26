/**
 * SAP Cloud ALM (CALM) API Type Definitions
 * Covers Projects, Requirements, and Documents endpoints.
 */

// ─── OAuth Token ─────────────────────────────────────────

export interface CalmTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds
  scope?: string;
}

// ─── Projects ────────────────────────────────────────────

export interface CalmProject {
  id: string;
  name: string;
  description?: string;
  status?: string;
  projectType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalmProjectListResponse {
  value: CalmProject[];
  "@odata.count"?: number;
  "@odata.nextLink"?: string;
}

// ─── Requirements ────────────────────────────────────────

export interface CalmRequirement {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  type?: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalmRequirementListResponse {
  value: CalmRequirement[];
  "@odata.count"?: number;
  "@odata.nextLink"?: string;
}

// ─── Documents ───────────────────────────────────────────

export interface CalmDocument {
  id: string;
  name: string;
  description?: string;
  content?: string;
  projectId: string;
  documentType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalmDocumentCreatePayload {
  name: string;
  description?: string;
  content: string;
  projectId: string;
  documentType?: string;
}

export interface CalmDocumentUpdatePayload {
  name?: string;
  description?: string;
  content?: string;
}

// ─── Error ───────────────────────────────────────────────

export interface CalmApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ code: string; message: string }>;
  };
}

// ─── Mapped Types for FSD Integration ────────────────────

export interface CalmRequirementForFsd {
  id: string;
  title: string;
  description: string;
  priority?: string;
  status?: string;
}

export interface CalmProjectSummary {
  id: string;
  name: string;
  description?: string;
  requirementCount?: number;
}
