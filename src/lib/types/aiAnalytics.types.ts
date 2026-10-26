/**
 * AI Analytics Type Definitions
 * Shared types for AI analytics and performance tracking
 * Safe for both client and server imports
 */

export interface AIReviewItem {
  id: string;
  entity_type: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'corrected';
  is_correction_needed: boolean;
  original_match_accuracy?: number;
}

export interface AIProcessingMetrics {
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
}

export interface ConfidenceDistribution {
  high: number;
  medium: number;
  low: number;
}

export interface AccuracyMetrics {
  overall: number;
  bySku: number;
  byShop: number;
  byBrand: number;
  byCategory: number;
}

export interface AIAnalyticsTimeRange {
  startDate: string;
  endDate: string;
}

export interface ProcessingTimeMetrics {
  averageOcrTime: number;
  averageFuzzyMatchTime: number;
  averageTotalTime: number;
  p95OcrTime: number;
  p95FuzzyMatchTime: number;
  p95TotalTime: number;
}

export interface AccuracyBreakdown {
  overall: number;
  bySku: number;
  byShop: number;
  byBrand: number;
  byCategory: number;
}

export interface ConfidenceAnalysis {
  distribution: ConfidenceDistribution;
  averageConfidence: number;
  autoApprovedPercentage: number;
  reviewQueuePercentage: number;
  manualEntryPercentage: number;
}

export interface UserReviewPatterns {
  totalReviews: number;
  approvalRate: number;
  rejectionRate: number;
  correctionRate: number;
  averageReviewTime: number;
  mostActiveReviewers: Array<{
    userId: string;
    reviewCount: number;
    accuracy: number;
  }>;
}

export interface ErrorAnalysis {
  commonOcrErrors: Array<{
    errorType: string;
    frequency: number;
    examples: string[];
  }>;
  commonMatchingFailures: Array<{
    entity: string;
    originalText: string;
    expectedMatch: string;
    frequency: number;
  }>;
  lowConfidencePatterns: Array<{
    pattern: string;
    frequency: number;
    suggestions: string[];
  }>;
}

export interface AIPerformanceDashboard {
  timeRange: AIAnalyticsTimeRange;
  processingMetrics: ProcessingTimeMetrics;
  accuracyMetrics: AccuracyBreakdown;
  confidenceAnalysis: ConfidenceAnalysis;
  userReviewPatterns: UserReviewPatterns;
  errorAnalysis: ErrorAnalysis;
  trends: {
    accuracyTrend: Array<{ date: string; accuracy: number }>;
    processingTimeTrend: Array<{ date: string; avgTime: number }>;
    confidenceTrend: Array<{ date: string; avgConfidence: number }>;
    volumeTrend: Array<{ date: string; processed: number; reviewed: number }>;
  };
}
