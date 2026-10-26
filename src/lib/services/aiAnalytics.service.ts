/**
 * AI Analytics Service Types
 * Defines the data structures for AI performance analytics
 */

/**
 * Time range for analytics queries
 */
export type AIAnalyticsTimeRange = {
  startDate: string;
  endDate: string;
};

/**
 * AI Review Item
 */
export interface AIReviewItem {
  id: string;
  sessionId: string;
  entityType: string;
  aiValue: string;
  userValue: string;
  confidence: number;
  isCorrect: boolean;
  reviewedAt: string;
  processingTime?: number;
}

/**
 * AI Processing Metrics
 */
export interface AIProcessingMetrics {
  totalProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  averageConfidence: number;
  period: AIAnalyticsTimeRange;
}

/**
 * Confidence Distribution
 */
export interface ConfidenceDistribution {
  range: string;
  count: number;
  percentage: number;
  averageAccuracy?: number;
}

/**
 * Accuracy Metrics
 */
export interface AccuracyMetrics {
  overall: number;
  byEntityType: Record<string, number>;
  byConfidenceRange: Array<{
    range: string;
    accuracy: number;
    count: number;
  }>;
}

/**
 * Processing Time Metrics
 */
export interface ProcessingTimeMetrics {
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Accuracy Breakdown
 */
export interface AccuracyBreakdown {
  entityType: string;
  accuracy: number;
  totalReviews: number;
  correctPredictions: number;
  incorrectPredictions: number;
  averageConfidence: number;
}

/**
 * Confidence Analysis
 */
export interface ConfidenceAnalysis {
  distribution: ConfidenceDistribution[];
  averageConfidence: number;
  highConfidenceAccuracy: number;
  lowConfidenceAccuracy: number;
  confidenceThresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * User Review Patterns
 */
export interface UserReviewPatterns {
  totalReviews: number;
  reviewsByUser: Record<string, number>;
  averageReviewTime: number;
  mostReviewedEntityTypes: Array<{
    entityType: string;
    count: number;
    percentage: number;
  }>;
  reviewFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

/**
 * Error Analysis
 */
export interface ErrorAnalysis {
  totalErrors: number;
  errorRate: number;
  errorsByType: Record<string, number>;
  commonErrors: Array<{
    type: string;
    count: number;
    percentage: number;
    examples: string[];
  }>;
  errorTrends: Array<{
    date: string;
    errorCount: number;
    errorRate: number;
  }>;
}

/**
 * AI Performance Dashboard
 */
export interface AIPerformanceDashboard {
  metrics: AIProcessingMetrics;
  accuracy: AccuracyMetrics;
  confidenceAnalysis: ConfidenceAnalysis;
  processingTime: ProcessingTimeMetrics;
  userReviewPatterns: UserReviewPatterns;
  errorAnalysis: ErrorAnalysis;
  trends: {
    accuracy: Array<{
      date: string;
      accuracy: number;
    }>;
    processingTime: Array<{
      date: string;
      avgTime: number;
    }>;
    confidence: Array<{
      date: string;
      avgConfidence: number;
    }>;
  };
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp?: string;
  }>;
}

/**
 * Performance Alert
 */
export interface PerformanceAlert {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp?: string;
  metric?: string;
  threshold?: number;
  currentValue?: number;
}

/**
 * Trend Data Point
 */
export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * Performance Trends
 */
export interface PerformanceTrends {
  accuracy: TrendDataPoint[];
  processingTime: TrendDataPoint[];
  confidence: TrendDataPoint[];
  volume: TrendDataPoint[];
}

















