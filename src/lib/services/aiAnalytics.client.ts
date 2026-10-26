/**
 * Client-safe AI Analytics Service
 * Uses API routes instead of direct database access
 */

export type {
  AIReviewItem,
  AIProcessingMetrics,
  ConfidenceDistribution,
  AccuracyMetrics,
  AIAnalyticsTimeRange,
  ProcessingTimeMetrics,
  AccuracyBreakdown,
  ConfidenceAnalysis,
  UserReviewPatterns,
  ErrorAnalysis,
  AIPerformanceDashboard
} from './aiAnalytics.service';

export class AIAnalyticsClientService {
  private readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

  /**
   * Get comprehensive AI performance dashboard data via API route
   */
  async getDashboardData(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/dashboard?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch AI analytics dashboard');
    }

    return response.json();
  }

  /**
   * Get performance alerts via API route
   */
  async getPerformanceAlerts(): Promise<Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp?: string;
  }>> {
    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/alerts`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch performance alerts');
    }

    return response.json();
  }

  /**
   * Get processing time metrics and percentiles via API route
   */
  async getProcessingTimeMetrics(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/processing-time?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch processing time metrics');
    }

    return response.json();
  }

  /**
   * Calculate accuracy metrics by entity type via API route
   */
  async getAccuracyMetrics(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/accuracy?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch accuracy metrics');
    }

    return response.json();
  }

  /**
   * Analyze confidence score distributions via API route
   */
  async getConfidenceAnalysis(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/confidence?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch confidence analysis');
    }

    return response.json();
  }

  /**
   * Analyze user review patterns via API route
   */
  async getUserReviewPatterns(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/review-patterns?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user review patterns');
    }

    return response.json();
  }

  /**
   * Analyze common errors and failures via API route
   */
  async getErrorAnalysis(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/errors?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch error analysis');
    }

    return response.json();
  }

  /**
   * Get performance trends over time via API route
   */
  async getTrends(timeRange: { startDate: string; endDate: string }): Promise<any> {
    const params = new URLSearchParams({
      startDate: timeRange.startDate,
      endDate: timeRange.endDate,
    });

    const response = await fetch(`${this.API_BASE_URL}/api/ai/analytics/trends?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch performance trends');
    }

    return response.json();
  }
}

// Export singleton instance
export const aiAnalyticsClientService = new AIAnalyticsClientService();
