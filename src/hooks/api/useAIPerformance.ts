import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  aiAnalyticsClientService,
  AIAnalyticsTimeRange,
  AIPerformanceDashboard
} from '../../lib/services/aiAnalytics.client';

// Query keys for AI performance data
export const AI_PERFORMANCE_QUERY_KEYS = {
  dashboard: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'dashboard', timeRange] as const,
  alerts: () => ['aiPerformance', 'alerts'] as const,
  processingMetrics: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'processing', timeRange] as const,
  accuracyMetrics: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'accuracy', timeRange] as const,
  confidenceAnalysis: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'confidence', timeRange] as const,
  userPatterns: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'userPatterns', timeRange] as const,
  errorAnalysis: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'errors', timeRange] as const,
  trends: (timeRange: AIAnalyticsTimeRange) => ['aiPerformance', 'trends', timeRange] as const,
} as const;

// Hook for comprehensive AI performance dashboard data
export function useAIPerformanceDashboard(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.dashboard(timeRange),
    queryFn: () => aiAnalyticsClientService.getDashboardData(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
  });
}

// Hook for real-time performance alerts
export function useAIPerformanceAlerts() {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.alerts(),
    queryFn: () => aiAnalyticsClientService.getPerformanceAlerts(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });
}

// Hook for processing time metrics only
export function useProcessingTimeMetrics(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.processingMetrics(timeRange),
    queryFn: () => aiAnalyticsClientService.getProcessingTimeMetrics(timeRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3,
  });
}

// Hook for accuracy metrics only
export function useAccuracyMetrics(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.accuracyMetrics(timeRange),
    queryFn: () => aiAnalyticsClientService.getAccuracyMetrics(timeRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3,
  });
}

// Hook for confidence analysis only
export function useConfidenceAnalysis(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.confidenceAnalysis(timeRange),
    queryFn: () => aiAnalyticsClientService.getConfidenceAnalysis(timeRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
    retry: 3,
  });
}

// Hook for user review patterns only
export function useUserReviewPatterns(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.userPatterns(timeRange),
    queryFn: () => aiAnalyticsClientService.getUserReviewPatterns(timeRange),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000, // Less frequent for user patterns
    retry: 3,
  });
}

// Hook for error analysis only
export function useErrorAnalysis(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.errorAnalysis(timeRange),
    queryFn: () => aiAnalyticsClientService.getErrorAnalysis(timeRange),
    staleTime: 10 * 60 * 1000, // Longer stale time for error analysis
    refetchInterval: 15 * 60 * 1000,
    retry: 3,
  });
}

// Hook for performance trends only
export function usePerformanceTrends(timeRange: AIAnalyticsTimeRange) {
  return useQuery({
    queryKey: AI_PERFORMANCE_QUERY_KEYS.trends(timeRange),
    queryFn: () => aiAnalyticsClientService.getTrends(timeRange),
    staleTime: 10 * 60 * 1000,
    refetchInterval: 20 * 60 * 1000, // Less frequent for trends
    retry: 3,
  });
}

// Hook for real-time subscriptions to AI performance updates
// NOTE: Real-time subscriptions are disabled after migration from Supabase to AWS RDS
// Use polling with refetchInterval in queries instead
export function useAIPerformanceSubscription(timeRange: AIAnalyticsTimeRange) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Real-time subscriptions are not available with AWS RDS
    // Polling is handled by individual queries with refetchInterval


    // Optional: Set up periodic invalidation as fallback
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: AI_PERFORMANCE_QUERY_KEYS.dashboard(timeRange)
      });
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [queryClient, timeRange]);
}

// Hook for refreshing all AI performance data
export function useRefreshAIPerformance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeRange: AIAnalyticsTimeRange) => {
      // Invalidate all AI performance queries for the given time range
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.dashboard(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.processingMetrics(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.accuracyMetrics(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.confidenceAnalysis(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.userPatterns(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.errorAnalysis(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.trends(timeRange)
        }),
        queryClient.invalidateQueries({
          queryKey: AI_PERFORMANCE_QUERY_KEYS.alerts()
        }),
      ]);
    },
    onSuccess: () => {
      console.log('AI performance data refreshed successfully');
    },
    onError: (error) => {
      console.error('Failed to refresh AI performance data:', error);
    },
  });
}

// Hook for performance comparison between time ranges
export function useAIPerformanceComparison(
  currentRange: AIAnalyticsTimeRange,
  previousRange: AIAnalyticsTimeRange
) {
  const currentData = useQuery({
    queryKey: [...AI_PERFORMANCE_QUERY_KEYS.dashboard(currentRange), 'current'],
    queryFn: () => aiAnalyticsClientService.getDashboardData(currentRange),
    staleTime: 5 * 60 * 1000,
  });

  const previousData = useQuery({
    queryKey: [...AI_PERFORMANCE_QUERY_KEYS.dashboard(previousRange), 'previous'],
    queryFn: () => aiAnalyticsClientService.getDashboardData(previousRange),
    staleTime: 10 * 60 * 1000, // Previous data can be stale longer
    enabled: !!currentData.data, // Only fetch previous data after current data loads
  });

  // Calculate comparison metrics
  const comparison = {
    accuracyChange: currentData.data && previousData.data
      ? currentData.data.accuracyMetrics.overall - previousData.data.accuracyMetrics.overall
      : 0,
    processingTimeChange: currentData.data && previousData.data
      ? currentData.data.processingMetrics.averageTotalTime - previousData.data.processingMetrics.averageTotalTime
      : 0,
    confidenceChange: currentData.data && previousData.data
      ? currentData.data.confidenceAnalysis.averageConfidence - previousData.data.confidenceAnalysis.averageConfidence
      : 0,
    volumeChange: currentData.data && previousData.data
      ? (currentData.data.userReviewPatterns.totalReviews - previousData.data.userReviewPatterns.totalReviews)
      : 0,
  };

  return {
    currentData,
    previousData,
    comparison,
    isLoading: currentData.isLoading || previousData.isLoading,
    error: currentData.error || previousData.error,
  };
}

// Custom hook for performance threshold monitoring
export function usePerformanceThresholds() {
  const queryClient = useQueryClient();

  const thresholds = {
    minAccuracy: 75, // Minimum acceptable accuracy percentage
    maxProcessingTime: 15000, // Maximum acceptable processing time in ms
    minConfidence: 0.5, // Minimum acceptable average confidence
    maxErrorRate: 25, // Maximum acceptable error rate percentage
  };

  // Function to check if current performance meets thresholds
  const checkThresholds = (dashboard: AIPerformanceDashboard) => {
    const issues = [];

    if (dashboard.accuracy.overall < thresholds.minAccuracy) {
      issues.push({
        type: 'accuracy',
        message: `Accuracy (${dashboard.accuracy.overall}%) below threshold (${thresholds.minAccuracy}%)`,
        severity: 'high' as const
      });
    }

    if (dashboard.processingTime.average > thresholds.maxProcessingTime) {
      issues.push({
        type: 'processing_time',
        message: `Average processing time (${Math.round(dashboard.processingTime.average / 1000)}s) above threshold (${thresholds.maxProcessingTime / 1000}s)`,
        severity: 'medium' as const
      });
    }

    if (dashboard.confidenceAnalysis.averageConfidence < thresholds.minConfidence) {
      issues.push({
        type: 'confidence',
        message: `Average confidence (${dashboard.confidenceAnalysis.averageConfidence}) below threshold (${thresholds.minConfidence})`,
        severity: 'high' as const
      });
    }

    const errorRate = 100 - dashboard.accuracy.overall;
    if (errorRate > thresholds.maxErrorRate) {
      issues.push({
        type: 'error_rate',
        message: `Error rate (${Math.round(errorRate)}%) above threshold (${thresholds.maxErrorRate}%)`,
        severity: 'high' as const
      });
    }

    return issues;
  };

  return {
    thresholds,
    checkThresholds,
  };
}
