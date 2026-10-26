/**
 * Client-safe AI Workflow Integration Service
 * Uses API routes instead of direct database access
 */

export type {
  AIWorkflowConfig,
  AIProcessingResult,
  RouteDecision,
} from '../types/aiWorkflow.types';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export class AIWorkflowIntegrationClientService {
  /**
   * Process uploaded files with AI workflow via API route
   */
  async processUploadedFiles(
    uploadSessionId: string,
    config?: any
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/ai/workflow/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadSessionId,
        config,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process AI workflow');
    }

    return response.json();
  }

  /**
   * Get AI processing result by upload session via API route
   */
  async getProcessingResult(uploadSessionId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/ai/workflow/result/${uploadSessionId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get processing result');
    }

    return response.json();
  }

  /**
   * Retry failed AI processing via API route
   */
  async retryProcessing(
    uploadSessionId: string,
    config?: any
  ): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/ai/workflow/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadSessionId,
        config,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to retry AI processing');
    }

    return response.json();
  }

  /**
   * Get processing statistics via API route
   */
  async getProcessingStats(dateRange?: { start: string; end: string }): Promise<{
    totalProcessed: number;
    successRate: number;
    averageConfidence: number;
    routingBreakdown: {
      autoProcessed: number;
      reviewQueue: number;
      manualEntry: number;
    };
    averageProcessingTime: number;
  }> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.set('startDate', dateRange.start);
      params.set('endDate', dateRange.end);
    }

    const url = `${API_BASE_URL}/api/ai/workflow/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get processing stats');
    }

    return response.json();
  }
}

// Export singleton instance
export const aiWorkflowIntegrationClient = new AIWorkflowIntegrationClientService();
