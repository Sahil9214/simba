/**
 * AI Workflow Type Definitions
 * Shared types for AI workflow integration
 * Safe for both client and server imports
 */

import type { FuzzyMatchResponse } from './fuzzyMatching.types';

// OCR Result type (previously from backend service)
export interface OCRResult {
  text: string;
  confidence: number;
  blocks?: any[];
  metadata?: Record<string, any>;
}

export interface AIWorkflowConfig {
  enableOCR: boolean;
  enableFuzzyMatching: boolean;
  enableAutoRouting: boolean;
  confidenceThresholds: {
    autoApprove: number;
    requiresReview: number;
    manualEntry: number;
  };
  entityTypes: ('sku' | 'shop' | 'brand' | 'category')[];
  notificationSettings: {
    onComplete: boolean;
    onHighConfidence: boolean;
    onFailure: boolean;
  };
}

export interface AIProcessingResult {
  id: string;
  uploadSessionId: string;
  ocrResult?: OCRResult;
  matchingResults: {
    skus: FuzzyMatchResponse[];
    shops: FuzzyMatchResponse[];
    brands: FuzzyMatchResponse[];
    categories: FuzzyMatchResponse[];
  };
  routing: {
    highConfidenceMatches: number;
    reviewQueueItems: number;
    manualEntryItems: number;
    autoProcessedItems: number;
  };
  processingTime: {
    ocrTime: number;
    matchingTime: number;
    totalTime: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence: {
    overall: number;
    byEntity: Record<string, number>;
  };
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface RouteDecision {
  action: 'auto_approve' | 'review_queue' | 'manual_entry';
  confidence: number;
  reasoning: string;
  suggestedMatches: Array<{
    entity: string;
    entityType: string;
    confidence: number;
  }>;
}
