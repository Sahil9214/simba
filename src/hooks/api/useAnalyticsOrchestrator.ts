import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import all the specialized hooks
import { useDashboardData, useDashboardKPIs, useDashboardAlerts } from './useDashboard';
import { useSalesAnalyticsDashboard, useSalesAnalyticsForecasting } from './useSalesAnalytics';
import { useHeatMapAnalytics, useHeatMapClustering, useHeatMapCompetitiveAnalysis } from './useHeatMap';
import { useRealtimeMonitoring } from './useRealtimeMonitoring';
import { useAIUploadAnalytics } from './useAIIntegratedUpload';
import { ALL_QUERY_KEYS } from './index';

// Centralized filters interface
export interface GlobalAnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  selectedLocation?: string;
  searchTerm?: string;
  shopIds?: string[];
  skuIds?: string[];
  category?: string[];
  metricType?: 'sales' | 'penetration' | 'performance' | 'growth';
}

// Analytics insights interface
export interface AnalyticsInsights {
  overview: {
    healthScore: number;
    status: 'excellent' | 'good' | 'needs_attention' | 'critical';
    primaryMetric: string;
    secondaryMetrics: string[];
  };
  trends: {
    salesGrowth: number;
    marketExpansion: number;
    aiProcessingEfficiency: number;
    customerSatisfaction: number;
  };
  alerts: {
    critical: number;
    warnings: number;
    total: number;
    recentAlerts: Array<{
      id: string;
      title: string;
      type: 'critical' | 'warning' | 'info';
      timestamp: string;
    }>;
  };
  opportunities: Array<{
    id: string;
    type: 'market-expansion' | 'product-optimization' | 'process-improvement';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
  }>;
  recommendations: Array<{
    id: string;
    category: 'sales' | 'operations' | 'ai' | 'market';
    action: string;
    reasoning: string;
    priority: 'immediate' | 'short-term' | 'long-term';
  }>;
}

/**
 * Central orchestration hook for all analytics in the Simba Beer Analytics Portal
 *
 * This hook serves as the main entry point for comprehensive analytics,
 * combining data from dashboard, sales, heat map, real-time monitoring, and AI systems.
 *
 * @example
 * ```tsx
 * const {
 *   insights,
 *   isLoading,
 *   refreshAll,
 *   enableRealTime,
 *   exportData
 * } = useAnalyticsOrchestrator({
 *   dateRange: { start: '2024-01-01', end: '2024-12-31' },
 *   selectedLocation: 'Delhi'
 * });
 * ```
 */
export function useAnalyticsOrchestrator(filters: GlobalAnalyticsFilters = {}) {
  const queryClient = useQueryClient();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Core data hooks
  const dashboardData = useDashboardData();
  const dashboardKPIs = useDashboardKPIs();
  const dashboardAlerts = useDashboardAlerts();

  const salesAnalytics = useSalesAnalyticsDashboard(filters);
  const salesForecasting = useSalesAnalyticsForecasting(filters);

  const heatMapAnalytics = useHeatMapAnalytics(filters);
  const heatMapClustering = useHeatMapClustering(filters);
  const heatMapCompetitive = useHeatMapCompetitiveAnalysis(filters);

  const realtimeMonitoring = useRealtimeMonitoring({
    refreshInterval: 30000,
    autoStart: isRealTimeEnabled,
  });

  const aiUploadAnalytics = useAIUploadAnalytics();

  // Consolidated loading state
  const isLoading = useMemo(() => {
    return dashboardData.isLoading ||
      salesAnalytics.isLoading ||
      heatMapAnalytics.isLoading ||
      aiUploadAnalytics.isLoading;
  }, [
    dashboardData.isLoading,
    salesAnalytics.isLoading,
    heatMapAnalytics.isLoading,
    aiUploadAnalytics.isLoading,
  ]);

  // Consolidated error state
  const hasErrors = useMemo(() => {
    return dashboardData.isError ||
      salesAnalytics.isError ||
      heatMapAnalytics.isError ||
      aiUploadAnalytics.isError;
  }, [
    dashboardData.isError,
    salesAnalytics.isError,
    heatMapAnalytics.isError,
    aiUploadAnalytics.isError,
  ]);

  // Generate comprehensive insights
  const insights = useMemo((): AnalyticsInsights | null => {
    if (isLoading || !dashboardKPIs.data || !salesAnalytics.data) return null;

    const dashboardInsights = dashboardKPIs.data.insights;
    const salesInsights = salesAnalytics.data?.insights;
    const heatMapInsights = null; // heatMapAnalytics.data doesn't have insights property
    const clusteringInsights = null; // heatMapClustering.data doesn't have insights property
    const competitiveInsights = heatMapCompetitive.data;
    const systemAlerts = dashboardAlerts.alerts;
    const monitoringAlerts = realtimeMonitoring.alerts || [];

    // Calculate overall health score
    const healthComponents = [
      dashboardInsights.healthScore || 50,
      salesInsights?.healthScore || 50,
      50, // Default score since heatMapInsights is not available
      realtimeMonitoring.isHealthy ? 100 : (realtimeMonitoring.hasWarnings ? 70 : 30),
    ];

    const overallHealthScore = Math.round(
      healthComponents.reduce((sum, score) => sum + score, 0) / healthComponents.length
    );

    const status = overallHealthScore >= 90 ? 'excellent' :
      overallHealthScore >= 75 ? 'good' :
        overallHealthScore >= 50 ? 'needs_attention' : 'critical';

    // Consolidate alerts
    const allAlerts = [
      ...systemAlerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        type: alert.type,
        timestamp: new Date().toISOString(),
      })),
      ...monitoringAlerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        type: alert.type,
        timestamp: alert.timestamp,
      })),
    ];

    // Generate opportunities
    const opportunities = [];

    // Market expansion opportunities - disabled due to missing insights data
    // if (heatMapInsights && clusteringInsights?.opportunities) {
    //   opportunities.push(...clusteringInsights.opportunities.map(opp => ({
    //     id: `market-${opp.type}`,
    //     type: 'market-expansion' as const,
    //     title: opp.title,
    //     description: opp.description,
    //     priority: opp.priority as 'high' | 'medium' | 'low',
    //     estimatedImpact: 'Medium to High revenue potential',
    //   })));
    // }

    // Sales optimization opportunities
    if (salesInsights && salesForecasting.data?.insights) {
      const forecast = salesForecasting.data.insights;
      if (forecast.opportunities.length > 0) {
        opportunities.push({
          id: 'sales-optimization',
          type: 'product-optimization' as const,
          title: 'Sales Growth Acceleration',
          description: `Leverage ${forecast.opportunities.join(', ')} to accelerate growth`,
          priority: 'high' as const,
          estimatedImpact: `Potential ${forecast.expectedGrowth.toFixed(1)}% growth increase`,
        });
      }
    }

    // AI processing improvements
    if (aiUploadAnalytics.data?.insights.needsAttention) {
      opportunities.push({
        id: 'ai-optimization',
        type: 'process-improvement' as const,
        title: 'AI Processing Optimization',
        description: 'Improve AI upload processing efficiency and reduce failure rates',
        priority: 'medium' as const,
        estimatedImpact: 'Reduced processing time and higher success rates',
      });
    }

    // Generate recommendations
    const recommendations = [];

    // Performance-based recommendations
    if (status === 'critical' || status === 'needs_attention') {
      recommendations.push({
        id: 'performance-improvement',
        category: 'operations' as const,
        action: 'Implement immediate performance improvement measures',
        reasoning: `Overall health score is ${overallHealthScore}%, indicating need for intervention`,
        priority: 'immediate' as const,
      });
    }

    // Sales-based recommendations
    if (salesInsights) {
      recommendations.push({
        id: 'sales-strategy',
        category: 'sales' as const,
        action: `Focus on ${salesInsights.topCategories?.[0]?.name || 'top-performing'} category expansion`,
        reasoning: 'Leverage highest-performing product categories for growth',
        priority: 'short-term' as const,
      });
    }

    // Market expansion recommendations
    if (competitiveInsights?.recommendations) {
      recommendations.push(...competitiveInsights.recommendations.map(rec => ({
        id: `market-${rec.type}`,
        category: 'market' as const,
        action: rec.title,
        reasoning: rec.description,
        priority: rec.priority === 'high' ? 'immediate' as const :
          rec.priority === 'medium' ? 'short-term' as const : 'long-term' as const,
      })));
    }

    return {
      overview: {
        healthScore: overallHealthScore,
        status,
        primaryMetric: 'Overall Business Health',
        secondaryMetrics: ['Sales Growth', 'Market Penetration', 'System Performance'],
      },
      trends: {
        salesGrowth: salesInsights?.revenueTrend?.percentage || 0,
        marketExpansion: 0, // heatMapInsights not available
        aiProcessingEfficiency: 100 - (aiUploadAnalytics.data?.overview.failureRate || 0),
        customerSatisfaction: 85, // This would come from customer satisfaction surveys
      },
      alerts: {
        critical: allAlerts.filter(a => a.type === 'critical').length,
        warnings: allAlerts.filter(a => a.type === 'warning').length,
        total: allAlerts.length,
        recentAlerts: allAlerts.slice(0, 5),
      },
      opportunities,
      recommendations,
    };
  }, [
    isLoading,
    dashboardKPIs.data,
    salesAnalytics.data,
    heatMapAnalytics.data,
    heatMapClustering.data,
    heatMapCompetitive.data,
    dashboardAlerts.alerts,
    realtimeMonitoring.alerts,
    realtimeMonitoring.isHealthy,
    realtimeMonitoring.hasWarnings,
    salesForecasting.data,
    aiUploadAnalytics.data,
  ]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([
        dashboardData.refetch(),
        salesAnalytics.refetch(),
        heatMapAnalytics.refetch(),
        aiUploadAnalytics.refetch(),
        realtimeMonitoring.refetch(),
      ]);
      setLastRefresh(new Date());
      toast.success('All analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh analytics data');
    }
  }, [
    dashboardData.refetch,
    salesAnalytics.refetch,
    heatMapAnalytics.refetch,
    aiUploadAnalytics.refetch,
    realtimeMonitoring.refetch,
  ]);

  // Enable/disable real-time monitoring
  const enableRealTime = useCallback((enabled: boolean) => {
    setIsRealTimeEnabled(enabled);
    if (enabled) {
      realtimeMonitoring.startMonitoring();
      toast.success('Real-time monitoring enabled');
    } else {
      realtimeMonitoring.stopMonitoring();
      toast.info('Real-time monitoring disabled');
    }
  }, [realtimeMonitoring.startMonitoring, realtimeMonitoring.stopMonitoring]);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    // Clear all queries by not specifying any filter
    queryClient.clear();
    toast.success('All caches cleared');
  }, [queryClient]);

  // Export consolidated data
  const exportData = useCallback(async (format: 'json' | 'csv' = 'json') => {
    const exportData = {
      timestamp: new Date().toISOString(),
      filters,
      insights,
      rawData: {
        dashboard: dashboardData.data,
        sales: salesAnalytics.rawData,
        heatMap: heatMapAnalytics.rawData,
        monitoring: realtimeMonitoring.metrics,
        aiUploads: aiUploadAnalytics.data,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `simba-analytics-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Analytics data exported successfully');
  }, [filters, insights, dashboardData.data, salesAnalytics.rawData, heatMapAnalytics.rawData, realtimeMonitoring.metrics, aiUploadAnalytics.data]);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    totalQueries: Object.keys(ALL_QUERY_KEYS).length,
    activeQueries: Object.keys(ALL_QUERY_KEYS).length, // Simplified count
    lastRefresh,
    averageResponseTime: realtimeMonitoring.metrics?.apiPerformance.averageResponseTime || 0,
    errorRate: realtimeMonitoring.metrics?.apiPerformance.errorRate || 0,
  }), [lastRefresh, realtimeMonitoring.metrics]);

  return {
    // Core data
    insights,
    performanceMetrics,

    // States
    isLoading,
    hasErrors,
    isRealTimeEnabled,
    lastRefresh,

    // Raw data access (for specialized use cases)
    rawData: {
      dashboard: dashboardData.data,
      sales: salesAnalytics.data,
      heatMap: heatMapAnalytics.data,
      monitoring: realtimeMonitoring.metrics,
      aiUploads: aiUploadAnalytics.data,
    },

    // Actions
    refreshAll,
    enableRealTime,
    clearAllCaches,
    exportData,

    // Individual hook access (for fine-grained control)
    hooks: {
      dashboard: dashboardData,
      sales: salesAnalytics,
      heatMap: heatMapAnalytics,
      monitoring: realtimeMonitoring,
      aiUploads: aiUploadAnalytics,
    },
  };
}

/**
 * Hook for analytics widgets - provides simplified data for dashboard widgets
 */
export function useAnalyticsWidgets(widgetType: 'summary' | 'alerts' | 'trends' | 'opportunities') {
  const { insights, isLoading, hasErrors } = useAnalyticsOrchestrator();

  const widgetData = useMemo(() => {
    if (!insights) return null;

    switch (widgetType) {
      case 'summary':
        return {
          healthScore: insights.overview.healthScore,
          status: insights.overview.status,
          primaryMetric: insights.overview.primaryMetric,
          trends: insights.trends,
        };

      case 'alerts':
        return {
          critical: insights.alerts.critical,
          warnings: insights.alerts.warnings,
          total: insights.alerts.total,
          recent: insights.alerts.recentAlerts,
        };

      case 'trends':
        return insights.trends;

      case 'opportunities':
        return {
          opportunities: insights.opportunities.slice(0, 3), // Top 3
          recommendations: insights.recommendations.slice(0, 3), // Top 3
        };

      default:
        return null;
    }
  }, [insights, widgetType]);

  return {
    data: widgetData,
    isLoading,
    hasErrors,
  };
}

// Types are already exported above with their interface declarations
