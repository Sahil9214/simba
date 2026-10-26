import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import {
  SalesMetrics,
  SalesByPeriod,
  SalesByCategory,
  SalesComparison,
  SeasonalAnalysis,
  CustomerSegmentation,
  ProductPerformanceMatrix,
  SalesAnalyticsFilters
} from '../../lib/services/salesAnalytics.service';
import { salesAnalyticsService } from '../../lib/services/salesAnalytics.client';
import { SALES_KEYS } from '@/lib/query/keys';
import { useStandardQuery, useStandardMutation } from '@/lib/query/hooks';

/**
 * Hook for fetching sales metrics
 */
export function useSalesMetrics(filters: SalesAnalyticsFilters = {}) {
  return useStandardQuery(
    SALES_KEYS.metrics(filters),
    () => salesAnalyticsService.getSalesMetrics(filters),
    {
      configType: 'analytics',
      onError: (error) => console.error('Failed to fetch sales metrics:', error)
    }
  );
}

/**
 * Hook for fetching sales data by period
 */
export function useSalesByPeriod(
  period: 'day' | 'week' | 'month' | 'quarter',
  filters: SalesAnalyticsFilters = {}
) {
  return useStandardQuery(
    SALES_KEYS.byPeriod(period, filters),
    () => salesAnalyticsService.getSalesByPeriod(period, filters),
    {
      configType: 'analytics',
      enabled: !!period,
      onError: (error) => console.error('Failed to fetch sales by period:', error)
    }
  );
}

/**
 * Hook for fetching sales data by category
 */
export function useSalesByCategory(filters: SalesAnalyticsFilters = {}) {
  return useStandardQuery(
    SALES_KEYS.byCategory(filters),
    () => salesAnalyticsService.getSalesByCategory(filters),
    {
      configType: 'analytics',
      onError: (error) => console.error('Failed to fetch sales by category:', error)
    }
  );
}

/**
 * Hook for fetching sales comparison data
 */
export function useSalesComparison(
  comparisonType: 'month' | 'quarter' | 'year',
  filters: SalesAnalyticsFilters = {}
) {
  return useQuery({
    queryKey: SALES_KEYS.comparison(comparisonType, filters),
    queryFn: () => salesAnalyticsService.getSalesComparison(comparisonType, filters),
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 40 * 60 * 1000, // 40 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
    retry: 3,
    enabled: !!comparisonType,
  });
}

/**
 * Hook for fetching seasonal analysis
 */
export function useSeasonalAnalysis(filters: SalesAnalyticsFilters = {}) {
  return useQuery({
    queryKey: SALES_KEYS.seasonal(filters),
    queryFn: () => salesAnalyticsService.getSeasonalAnalysis(filters),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
    retry: 3,
  });
}

/**
 * Hook for fetching customer segmentation
 */
export function useCustomerSegmentation(filters: SalesAnalyticsFilters = {}) {
  return useQuery({
    queryKey: SALES_KEYS.segmentation(filters),
    queryFn: () => salesAnalyticsService.getCustomerSegmentation(filters),
    staleTime: 25 * 60 * 1000, // 25 minutes
    gcTime: 50 * 60 * 1000, // 50 minutes
    refetchInterval: 45 * 60 * 1000, // Refetch every 45 minutes
    retry: 3,
  });
}

/**
 * Hook for comprehensive sales analytics dashboard
 */
export function useSalesAnalyticsDashboard(filters: SalesAnalyticsFilters = {}) {
  const metricsQuery = useSalesMetrics(filters);
  const byPeriodQuery = useSalesByPeriod('month', filters);
  const byCategoryQuery = useSalesByCategory(filters);
  const comparisonQuery = useSalesComparison('month', filters);
  const seasonalQuery = useSeasonalAnalysis(filters);
  const segmentationQuery = useCustomerSegmentation(filters);

  // Process data for enhanced insights
  const dashboardData = useMemo(() => {
    if (!metricsQuery.data) return null;

    const {
      data: metrics
    } = metricsQuery;

    const {
      data: byPeriod = []
    } = byPeriodQuery;

    const {
      data: byCategory = []
    } = byCategoryQuery;

    const {
      data: comparison
    } = comparisonQuery;

    const {
      data: seasonal
    } = seasonalQuery;

    const {
      data: segmentation
    } = segmentationQuery;

    // Calculate key insights
    const insights = {
      // Revenue trends
      revenueTrend: byPeriod.length >= 2 ? {
        direction: byPeriod[byPeriod.length - 1].revenue > byPeriod[byPeriod.length - 2].revenue ? 'up' : 'down',
        percentage: byPeriod.length >= 2 ?
          ((byPeriod[byPeriod.length - 1].revenue - byPeriod[byPeriod.length - 2].revenue) /
            byPeriod[byPeriod.length - 2].revenue) * 100 : 0
      } : null,

      // Category performance
      topCategories: byCategory.slice(0, 3).map(cat => ({
        name: cat.category,
        revenue: cat.revenue,
        marketShare: cat.marketShare,
        growth: cat.growthRate
      })),

      // Performance vs benchmarks
      benchmarkComparison: comparison && comparison.growth && comparison.benchmark ? {
        vsIndustry: comparison.growth.revenueGrowth - comparison.benchmark.industryAverage,
        vsCompetitors: comparison.growth.revenueGrowth - comparison.benchmark.competitorAverage,
        vsMarketLeader: comparison.growth.revenueGrowth - comparison.benchmark.marketLeaderValue
      } : null,

      // Seasonal patterns
      seasonalInsights: seasonal ? {
        currentPattern: seasonal.seasonality?.[seasonal.seasonality.length - 1]?.pattern || 'average',
        nextMonthForecast: seasonal.forecast[0]?.predictedRevenue || 0,
        confidence: seasonal.forecast[0]?.confidence || 0
      } : null,

      // Customer insights
      customerInsights: segmentation ? {
        totalSegments: segmentation.segments.length,
        highValueCustomers: segmentation.segments.find(s => s.segmentName === 'High Value Champions')?.shopCount || 0,
        growthOpportunity: segmentation.segments.find(s => s.segmentName === 'Potential Loyalists')?.shopCount || 0
      } : null,

      // Overall health score
      healthScore: Math.round(
        ((metrics?.growthRate ?? 0) > 0 ? 25 : 0) +
        (metrics?.salesTrend === 'increasing' ? 25 : metrics?.salesTrend === 'stable' ? 15 : 0) +
        (byCategory.length > 0 && (byCategory[0]?.growthRate ?? 0) > 0 ? 25 : 0) +
        (comparison?.growth?.revenueGrowth && comparison.growth.revenueGrowth > (comparison?.benchmark?.industryAverage || 0) ? 25 : 0)
      ),
    };

    return {
      metrics,
      byPeriod,
      byCategory,
      comparison,
      seasonal,
      segmentation,
      insights,
    };
  }, [
    metricsQuery.data,
    byPeriodQuery.data,
    byCategoryQuery.data,
    comparisonQuery.data,
    seasonalQuery.data,
    segmentationQuery.data,
  ]);

  const isLoading = metricsQuery.isLoading ||
    byPeriodQuery.isLoading ||
    byCategoryQuery.isLoading ||
    comparisonQuery.isLoading;

  const isError = metricsQuery.isError ||
    byPeriodQuery.isError ||
    byCategoryQuery.isError ||
    comparisonQuery.isError;

  const error = metricsQuery.error ||
    byPeriodQuery.error ||
    byCategoryQuery.error ||
    comparisonQuery.error;

  return {
    data: dashboardData,
    rawData: {
      metrics: metricsQuery.data,
      byPeriod: byPeriodQuery.data,
      byCategory: byCategoryQuery.data,
      comparison: comparisonQuery.data,
      seasonal: seasonalQuery.data,
      segmentation: segmentationQuery.data,
    },
    isLoading,
    isError,
    error,
    refetch: useCallback(() => {
      return Promise.all([
        metricsQuery.refetch(),
        byPeriodQuery.refetch(),
        byCategoryQuery.refetch(),
        comparisonQuery.refetch(),
      ]);
    }, [
      metricsQuery.refetch,
      byPeriodQuery.refetch,
      byCategoryQuery.refetch,
      comparisonQuery.refetch,
    ]),
  };
}

/**
 * Hook for sales performance tracking
 */
export function useSalesPerformanceTracking(filters: SalesAnalyticsFilters = {}) {
  const metricsQuery = useSalesMetrics(filters);
  const comparisonQuery = useSalesComparison('month', filters);

  const performanceData = useMemo(() => {
    if (!metricsQuery.data) return null;

    const { data: metrics } = metricsQuery;
    const { data: comparison } = comparisonQuery;

    // Define performance thresholds
    const thresholds = {
      excellent: 20,
      good: 10,
      average: 0,
      poor: -10,
    };

    // Calculate performance score
    const performanceScore = (growthRate: number) => {
      if (growthRate >= thresholds.excellent) return { level: 'excellent', score: 90 + Math.min(growthRate - thresholds.excellent, 10) };
      if (growthRate >= thresholds.good) return { level: 'good', score: 70 + (growthRate - thresholds.good) * 2 };
      if (growthRate >= thresholds.average) return { level: 'average', score: 50 + (growthRate - thresholds.average) * 2 };
      if (growthRate >= thresholds.poor) return { level: 'poor', score: 30 + (growthRate - thresholds.poor) * 2 };
      return { level: 'critical', score: Math.max(0, 30 + growthRate) };
    };

    const performance = performanceScore(metrics.growthRate ?? 0);

    // Generate alerts
    const alerts = [];

    if ((metrics.growthRate ?? 0) < -15) {
      alerts.push({
        type: 'critical' as const,
        title: 'Significant Revenue Decline',
        message: `Revenue has declined by ${Math.abs(metrics.growthRate ?? 0).toFixed(1)}%`,
      });
    } else if ((metrics.growthRate ?? 0) < 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Revenue Decline',
        message: `Revenue has declined by ${Math.abs(metrics.growthRate ?? 0).toFixed(1)}%`,
      });
    }

    if (metrics.salesTrend === 'decreasing') {
      alerts.push({
        type: 'warning' as const,
        title: 'Declining Sales Trend',
        message: 'Sales are showing a downward trend',
      });
    }

    // Benchmarking insights
    const benchmarkInsights = comparison && comparison.growth && comparison.benchmark ? {
      vsIndustry: {
        performance: comparison.growth.revenueGrowth - comparison.benchmark.industryAverage,
        status: comparison.growth.revenueGrowth > comparison.benchmark.industryAverage ? 'above' : 'below',
      },
      vsCompetitors: {
        performance: comparison.growth.revenueGrowth - comparison.benchmark.competitorAverage,
        status: comparison.growth.revenueGrowth > comparison.benchmark.competitorAverage ? 'above' : 'below',
      },
    } : null;

    return {
      performance,
      alerts,
      benchmarkInsights,
      recommendations: generateRecommendations(metrics, performance.level),
    };
  }, [metricsQuery.data, comparisonQuery.data]);

  return {
    data: performanceData,
    isLoading: metricsQuery.isLoading || comparisonQuery.isLoading,
    isError: metricsQuery.isError || comparisonQuery.isError,
    error: metricsQuery.error || comparisonQuery.error,
  };
}

/**
 * Helper function to generate recommendations based on performance
 */
function generateRecommendations(metrics: SalesMetrics, performanceLevel: string) {
  const recommendations = [];

  switch (performanceLevel) {
    case 'excellent':
      recommendations.push({
        priority: 'medium' as const,
        action: 'Scale successful strategies',
        description: 'Identify and replicate successful sales strategies across all regions',
      });
      break;

    case 'good':
      recommendations.push({
        priority: 'medium' as const,
        action: 'Optimize top performers',
        description: 'Focus on optimizing your top-performing products and channels',
      });
      break;

    case 'average':
      recommendations.push({
        priority: 'high' as const,
        action: 'Analyze performance gaps',
        description: 'Conduct detailed analysis to identify areas for improvement',
      });
      break;

    case 'poor':
      recommendations.push({
        priority: 'high' as const,
        action: 'Implement recovery strategies',
        description: 'Focus on customer retention and product portfolio optimization',
      });
      break;

    case 'critical':
      recommendations.push({
        priority: 'critical' as const,
        action: 'Emergency intervention required',
        description: 'Immediate action needed to address significant performance decline',
      });
      break;
  }

  // Add category-specific recommendations
  if (metrics.topPerformingCategory) {
    recommendations.push({
      priority: 'medium' as const,
      action: 'Leverage top category',
      description: `Focus marketing efforts on ${metrics.topPerformingCategory} which is your strongest category`,
    });
  }

  return recommendations;
}

/**
 * Hook for sales analytics cache management
 */
export function useSalesAnalyticsCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: SALES_KEYS.all() });
    salesAnalyticsService.clearCache();
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SALES_KEYS.all() });
  }, [queryClient]);

  const prefetchSalesData = useCallback((filters: SalesAnalyticsFilters = {}) => {
    return Promise.all([
      queryClient.prefetchQuery({
        queryKey: SALES_KEYS.metrics(filters),
        queryFn: () => salesAnalyticsService.getSalesMetrics(filters),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: SALES_KEYS.byPeriod('month', filters),
        queryFn: () => salesAnalyticsService.getSalesByPeriod('month', filters),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: SALES_KEYS.byCategory(filters),
        queryFn: () => salesAnalyticsService.getSalesByCategory(filters),
        staleTime: 15 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  return {
    clearCache,
    invalidateCache,
    prefetchSalesData,
  };
}

/**
 * Hook for real-time sales analytics monitoring
 */
export function useSalesAnalyticsRealtime(filters: SalesAnalyticsFilters = {}, interval: number = 300000) {
  const queryClient = useQueryClient();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const startRealTime = useCallback(() => {
    setIsRealTimeEnabled(true);
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: SALES_KEYS.metrics(filters) });
      queryClient.invalidateQueries({ queryKey: SALES_KEYS.byPeriod('month', filters) });
      setLastUpdate(new Date());
    }, interval);

    return () => {
      clearInterval(intervalId);
      setIsRealTimeEnabled(false);
    };
  }, [queryClient, filters, interval]);

  const stopRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
  }, []);

  return {
    isRealTimeEnabled,
    lastUpdate,
    startRealTime,
    stopRealTime,
  };
}

/**
 * Hook for sales analytics forecasting
 */
export function useSalesAnalyticsForecasting(filters: SalesAnalyticsFilters = {}) {
  const metricsQuery = useSalesMetrics(filters);
  const byPeriodQuery = useSalesByPeriod('month', filters);
  const seasonalQuery = useSeasonalAnalysis(filters);

  const forecast = useMemo(() => {
    if (!metricsQuery.data || !byPeriodQuery.data || !seasonalQuery.data) return null;

    const metrics = metricsQuery.data;
    const periodData = byPeriodQuery.data;
    const seasonal = seasonalQuery.data;

    // Simple trend-based forecasting
    const recentTrend = periodData.slice(-3); // Last 3 months
    const avgGrowthRate = recentTrend.reduce((acc, curr, idx) => {
      if (idx === 0) return acc;
      const prevRevenue = recentTrend[idx - 1].revenue;
      const growth = ((curr.revenue - prevRevenue) / prevRevenue) * 100;
      return acc + growth;
    }, 0) / (recentTrend.length - 1);

    // Generate next 3 months forecast
    const forecastMonths = [];
    let lastRevenue = periodData[periodData.length - 1]?.revenue || 0;

    for (let i = 1; i <= 3; i++) {
      const seasonalMultiplier = seasonal.seasonality?.[i - 1]?.salesIndex || 1;
      const forecasted = lastRevenue * (1 + avgGrowthRate / 100) * seasonalMultiplier;

      forecastMonths.push({
        month: i,
        revenue: forecasted,
        confidence: Math.max(0.6, 0.9 - (i * 0.1)), // Decreasing confidence
        growthRate: avgGrowthRate,
      });

      lastRevenue = forecasted;
    }

    return {
      trend: avgGrowthRate > 0 ? 'upward' : avgGrowthRate < 0 ? 'downward' : 'stable',
      confidence: avgGrowthRate !== 0 ? 'medium' : 'low',
      forecast: forecastMonths,
      insights: {
        expectedGrowth: avgGrowthRate,
        riskFactors: avgGrowthRate < -10 ? ['Declining trend', 'Market volatility'] : [],
        opportunities: avgGrowthRate > 10 ? ['Strong growth momentum', 'Market expansion'] : [],
      },
    };
  }, [metricsQuery.data, byPeriodQuery.data, seasonalQuery.data]);

  return {
    data: forecast,
    isLoading: metricsQuery.isLoading || byPeriodQuery.isLoading || seasonalQuery.isLoading,
    isError: metricsQuery.isError || byPeriodQuery.isError || seasonalQuery.isError,
    error: metricsQuery.error || byPeriodQuery.error || seasonalQuery.error,
  };
}

/**
 * Hook for sales data export
 */
export function useSalesAnalyticsExport() {
  const mutation = useMutation({
    mutationFn: async ({
      filters,
      format,
      dataType,
      period
    }: {
      filters: SalesAnalyticsFilters;
      format: 'csv' | 'json' | 'excel';
      dataType: 'metrics' | 'by-period' | 'by-category' | 'comparison' | 'all';
      period?: 'day' | 'week' | 'month' | 'quarter';
    }) => {
      let data;

      switch (dataType) {
        case 'metrics':
          data = await salesAnalyticsService.getSalesMetrics(filters);
          break;
        case 'by-period':
          data = await salesAnalyticsService.getSalesByPeriod(period || 'month', filters);
          break;
        case 'by-category':
          data = await salesAnalyticsService.getSalesByCategory(filters);
          break;
        case 'comparison':
          data = await salesAnalyticsService.getSalesComparison('month', filters);
          break;
        case 'all':
          data = {
            metrics: await salesAnalyticsService.getSalesMetrics(filters),
            byPeriod: await salesAnalyticsService.getSalesByPeriod('month', filters),
            byCategory: await salesAnalyticsService.getSalesByCategory(filters),
            comparison: await salesAnalyticsService.getSalesComparison('month', filters),
          };
          break;
        default:
          throw new Error('Invalid data type');
      }

      if (format === 'csv' && dataType === 'by-category') {
        const csvHeaders = 'Category,Revenue,Units,Market Share %,Growth Rate %,Top SKU\n';
        const csvRows = (data as SalesByCategory[]).map(cat =>
          `"${cat.category}",${cat.revenue},${cat.units ?? 0},${(cat.marketShare ?? 0).toFixed(2)},${(cat.growthRate ?? 0).toFixed(2)},"${cat.topSKU ?? ''}"`
        ).join('\n');
        return csvHeaders + csvRows;
      }

      return JSON.stringify(data, null, 2);
    },
    onSuccess: (data, variables) => {
      const blob = new Blob([data], {
        type: variables.format === 'csv' ? 'text/csv' : 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-analytics-${variables.dataType}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Sales analytics export failed:', error);
    },
  });

  return mutation;
}

// Export types for external use
export type {
  SalesMetrics,
  SalesByPeriod,
  SalesByCategory,
  SalesComparison,
  SeasonalAnalysis,
  CustomerSegmentation,
  ProductPerformanceMatrix,
  SalesAnalyticsFilters,
};
