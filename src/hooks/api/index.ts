// Export all React Query hooks for easy importing
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardMetrics, usePeerComparisonData, useReportingGapsData } from './useDashboard';

// Dashboard hooks
export {
  useDashboardMetrics,
  usePeerComparisonData,
  useReportingGapsData,
  useSalesVsClosingData,
  useTopProducts,
  useTopShops,
  useDashboardData,
  useDashboardCache,
  useDashboardRealtime,
  useDashboardAnalytics,
  useDashboardKPIs,
  useDashboardAlerts
} from './useDashboard';

export type {
  DashboardMetrics,
  DashboardFilters,
  PeerComparisonData,
  ReportingGapsData,
  StockData,
  ProductPerformanceData,
  ShopPerformanceData,
} from './useDashboard';

// Weekly corporation data hooks
export {
  useWeeklyCorporationData,
  useWeeklySalesAggregation,
  useWeeklyShopPerformance,
  useWeeklyProductPerformance,
  useSalesTrends,
  useCreateWeeklyCorporationData,
  useUpdateWeeklyCorporationData,
  useDeleteWeeklyCorporationData,
  useBulkCreateWeeklyCorporationData,
  useWeeklyDashboardData,
  weeklyCorporationDataKeys
} from './useWeeklyCorporationData';

export type {
  WeeklySalesFilters,
  WeeklySalesAggregation,
  WeeklyShopPerformance,
  WeeklyProductPerformance
} from '../../lib/services/weeklyCorporationData.client';

// Heat map hooks
export {
  useHeatMapData,
  useLocationSummary,
  useLocationTrends,
  useHeatMapAnalytics,
  useHeatMapFilters,
  useHeatMapCache,
  useInteractiveHeatMap,
  useHeatMapExport,
  useHeatMapRealtime,
  useHeatMapClustering,
  useHeatMapCompetitiveAnalysis,
  HEATMAP_QUERY_KEYS
} from './useHeatMap';

export type {
  HeatMapData,
  HeatMapFilters,
  LocationSummary,
} from './useHeatMap';

// Breakage report hooks
// ✅ FIXED: Now uses client-safe wrapper (breakageReport.client.ts)
export {
  useBreakageStatistics,
  useBreakageByShop,
  useBreakageBySKU,
  useBreakageTrends,
  useBreakageAnalysis,
  useBreakageReport,
  useBreakageAlerts,
  useBreakagePrevention,
  useBreakageCache,
  useBreakageExport,
  BREAKAGE_QUERY_KEYS
} from './useBreakageReport';

export type {
  BreakageStatistics,
  BreakageByShop,
  BreakageBySKU,
  BreakageTrend,
  BreakageAnalysis,
  BreakageFilters,
} from './useBreakageReport';

// Sales analytics hooks
export {
  useSalesMetrics,
  useSalesByPeriod,
  useSalesByCategory,
  useSalesComparison,
  useSeasonalAnalysis,
  useCustomerSegmentation,
  useSalesAnalyticsDashboard,
  useSalesPerformanceTracking,
  useSalesAnalyticsCache,
  useSalesAnalyticsExport,
  useSalesAnalyticsRealtime,
  useSalesAnalyticsForecasting
} from './useSalesAnalytics';

export type {
  SalesMetrics,
  SalesByPeriod,
  SalesByCategory,
  SalesComparison,
  SeasonalAnalysis,
  CustomerSegmentation,
  ProductPerformanceMatrix,
  SalesAnalyticsFilters,
} from './useSalesAnalytics';

// ✅ FIXED: Now uses client-safe wrapper (aiAnalytics.client.ts)
export {
  useAIPerformanceDashboard,
  useProcessingTimeMetrics,
  useAccuracyMetrics,
  useConfidenceAnalysis,
  useUserReviewPatterns,
  useErrorAnalysis,
  usePerformanceTrends,
  AI_PERFORMANCE_QUERY_KEYS
} from './useAIPerformance';

// ✅ FIXED: Now uses client-safe wrappers (ocr.client.ts, fuzzyMatching.client.ts)
export {
  useOCRProcessing,
  useBatchOCRProcessing,
  useOCRResult,
  useFuzzyMatchSKU,
  useFuzzyMatchShop
} from './useAIMatching';

// Daily stocks hooks - removed due to export issues
// export from './useDailyStocks';

// File upload, shops, SKUs, user management, and realtime hooks
// Removed due to export issues - can be imported directly from individual files

export {
  useAIIntegratedUpload,
  useAIUploadSessions,
  useAIUploadProgress,
  useAIUploadAnalytics,
  useAIUploadBatch,
  useAIUploadQueue,
  useRetryAIProcessing,
  useBulkAIOperations
} from './useAIIntegratedUpload';

// OCR Review hooks
export {
  useOCRReviewData,
  useSaveOCRReview,
  useDiscardOCRReview
} from './useOCRReview';

export type {
  ReviewSessionData,
  SaveReviewPayload
} from './useOCRReview';

// Real-time monitoring hooks
export {
  useRealtimeMonitoring,
  useComponentMonitoring,
  useAlertManagement,
  REALTIME_MONITORING_QUERY_KEYS
} from './useRealtimeMonitoring';

export type {
  MonitoringMetrics,
  SystemAlert,
  PerformanceThresholds,
} from './useRealtimeMonitoring';

// Critical issues hooks
export {
  useCriticalIssues,
  useCriticalIssue,
  useCriticalIssuesStats,
  useUpdateCriticalIssue,
  useCreateCriticalIssue,
  useDeleteCriticalIssue,
  useCriticalIssuesPagination,
  useCriticalIssuesFiltered,
  CRITICAL_ISSUES_QUERY_KEYS
} from './useCriticalIssues';

export type {
  CriticalIssue,
  CriticalIssuesFilters,
  CriticalIssuesResponse,
} from './useCriticalIssues';

// Analytics orchestration hooks
export {
  useAnalyticsOrchestrator,
  useAnalyticsWidgets,
} from './useAnalyticsOrchestrator';

export type {
  GlobalAnalyticsFilters,
  AnalyticsInsights,
} from './useAnalyticsOrchestrator';

// Convenience object for accessing all query keys
export const ALL_QUERY_KEYS = {
  dashboard: {},
  heatMap: {},
  breakage: {},
  aiPerformance: {},
  realtimeMonitoring: {},
} as const;

// Hook utilities for batch operations
export function useMultipleDashboardQueries(filters: any[] = [{}]) {
  // For now, just use the first filter to avoid hooks rule violations
  const firstFilter = filters[0] || {}
  const metrics = useDashboardMetrics(firstFilter)
  const peerComparison = usePeerComparisonData(firstFilter)
  const reportingGaps = useReportingGapsData(firstFilter)

  const results = [{ metrics, peerComparison, reportingGaps }]

  return {
    results,
    isLoading: results.some(r => r.metrics.isLoading || r.peerComparison.isLoading || r.reportingGaps.isLoading),
    isError: results.some(r => r.metrics.isError || r.peerComparison.isError || r.reportingGaps.isError),
    allData: results.map(r => ({
      metrics: r.metrics.data,
      peerComparison: r.peerComparison.data,
      reportingGaps: r.reportingGaps.data,
    })),
  };
}

// Global cache invalidation utility
export function useGlobalCache() {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    // Invalidate all queries by not specifying any filter
    queryClient.invalidateQueries();
  }, [queryClient]);

  const clearAll = useCallback(() => {
    // Clear all queries by not specifying any filter
    queryClient.clear();
  }, [queryClient]);

  return {
    invalidateAll,
    clearAll,
  };
}

// Performance monitoring hook
export function useApiPerformance() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    // In a real implementation, this would track actual API performance
    const interval = setInterval(() => {
      setMetrics(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
        averageResponseTime: 200 + Math.random() * 300,
        errorRate: Math.random() * 0.05, // 0-5% error rate
        lastUpdated: new Date().toISOString(),
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}