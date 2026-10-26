import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  dashboardClientService,
  DashboardMetrics,
  DashboardFilters,
  PeerComparisonData,
  ReportingGapsData,
  StockData,
  ProductPerformanceData,
  ShopPerformanceData
} from '../../lib/services/dashboard.client';
import { DASHBOARD_KEYS } from '@/lib/query/keys';
import { useStandardQuery } from '@/lib/query/hooks';
import { axiosInstance } from '@/lib/axios';
import { apiEndPoints } from '@/lib/axios/axios.endpoint';

// Helper function to build query string from filters
const buildQueryString = (filters: DashboardFilters, limit?: number | string): string => {
  const params = new URLSearchParams();
  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
  if (filters.selectedLocation) params.append('selectedLocation', filters.selectedLocation);
  if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
  if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
  if (filters.shopIds?.length) params.append('shopIds', filters.shopIds.join(','));
  if (filters.skuIds?.length) params.append('skuIds', filters.skuIds.join(','));
  if (filters.category) params.append('category', filters.category.toUpperCase());
  if (limit !== undefined) params.append('limit', String(limit));
  return params.toString() ? `?${params.toString()}` : '';
};

// Helper function to build query string for reporting gaps
const buildReportingGapsQuery = (filters: DashboardFilters): string => {
  const params = new URLSearchParams();
  if (filters.searchByName) params.append('searchByName', filters.searchByName);
  if (filters.selectedLocation) params.append('selectedLocation', filters.selectedLocation);
  if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
  if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
  if (filters.filteredDpCode) params.append('filteredDpCode', filters.filteredDpCode);
  if (filters.category) params.append('category', filters.category.toUpperCase());
  return params.toString() ? `?${params.toString()}` : '';
};

/**
 * Hook for fetching dashboard metrics (Analytics Banner data)
 */
export function useDashboardMetrics(filters: DashboardFilters = {}) {
  return useStandardQuery(
    DASHBOARD_KEYS.metrics(filters),
    async () => {
      const queryString = buildQueryString(filters);
      const endpoint = apiEndPoints.dashboardMatric(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch dashboard metrics');
      }

      return response.data.data;
    },
    {
      configType: 'realtime',
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true, // Enable for instant updates
      refetchOnReconnect: true, // Enable for instant updates
      retry: 2,
      onError: (error) => console.error('Failed to fetch dashboard metrics:', error)
    }
  );
}

/**
 * Hook for fetching peer comparison data
 */
export function usePeerComparisonData(filters: DashboardFilters = {}) {
  return useStandardQuery(
    DASHBOARD_KEYS.peerComparison(filters),
    async () => {
      const queryString = buildQueryString(filters);
      const endpoint = apiEndPoints.peerComparison(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch peer comparison data');
      }

      return response.data.data;
    },
    {
      configType: 'analytics',
      onError: (error) => console.error('Failed to fetch peer comparison data:', error)
    }
  );
}

/**
 * Hook for fetching reporting gaps data
 */
export function useReportingGapsData(filters: DashboardFilters = {}) {
  return useStandardQuery(
    DASHBOARD_KEYS.reportingGaps(filters),
    async () => {
      const queryString = buildReportingGapsQuery(filters);
      const endpoint = apiEndPoints.reportingGaps(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch reporting gaps data');
      }

      return response.data.data;
    },
    {
      configType: 'realtime',
      onError: (error) => console.error('Failed to fetch reporting gaps data:', error)
    }
  );
}

/**
 * Hook for fetching stock vs breakage data
 */
export function useSalesVsClosingData(filters: DashboardFilters = {}) {
  return useStandardQuery(
    DASHBOARD_KEYS.salesVsClosing(filters),
    async () => {
      const queryString = buildQueryString(filters);
      const endpoint = apiEndPoints.salesVsClosing(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch sales vs closing data');
      }

      return response.data.data;
    },
    {
      configType: 'realtime',
      onError: (error) => console.error('Failed to fetch stock vs breakage data:', error)
    }
  );
}

/**
 * Hook for fetching top performing products
 */
export function useTopProducts(filters: DashboardFilters = {}, limit: number | string = "All", options?: { enabled?: boolean }) {
  return useStandardQuery(
    DASHBOARD_KEYS.topProducts(filters, typeof limit === 'number' ? limit : 100),
    async () => {
      const queryString = buildQueryString(filters, limit);
      const endpoint = apiEndPoints.topProducts(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch top products');
      }

      return response.data.data;
    },
    {
      configType: 'analytics',
      enabled: options?.enabled !== undefined ? options.enabled : (limit === "All" || (typeof limit === 'number' && limit > 0)),
      onError: (error) => console.error('Failed to fetch top products:', error)
    }
  );
}

/**
 * Hook for fetching top performing shops
 */
export function useTopShops(filters: DashboardFilters = {}, limit: number | string = "All", options?: { enabled?: boolean }) {
  return useStandardQuery(
    DASHBOARD_KEYS.topShops(filters, typeof limit === 'number' ? limit : 100),
    async () => {
      const queryString = buildQueryString(filters, limit);
      const endpoint = apiEndPoints.topShops(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch top shops');
      }

      return response.data.data;
    },
    {
      configType: 'analytics',
      enabled: options?.enabled !== undefined ? options.enabled : (limit === "All" || (typeof limit === 'number' && limit > 0)),
      onError: (error) => console.error('Failed to fetch top shops:', error)
    }
  );
}

/**
 * Hook for fetching demand by SKU
 */
export function useDemandBySku(filters: DashboardFilters = {}, options?: { enabled?: boolean }) {
  return useStandardQuery(
    DASHBOARD_KEYS.demandBySku(filters),
    async () => {
      const queryString = buildQueryString(filters);
      const endpoint = apiEndPoints.demandBySku(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch demand by SKU');
      }

      return response.data.data?.items;
    },
    {
      configType: 'analytics',
      enabled: options?.enabled !== undefined ? options.enabled : true,
      onError: (error) => console.error('Failed to fetch demand by SKU:', error)
    }
  );
}

/**
 * Hook for fetching sales by pack size
 */
export function useSalesByPackSize(filters: DashboardFilters = {}, options?: { enabled?: boolean }) {
  return useStandardQuery(
    DASHBOARD_KEYS.salesByPackSize(filters),
    async () => {
      const queryString = buildQueryString(filters);
      const endpoint = apiEndPoints.salesByPackSize(queryString);
      const response = await axiosInstance.get(endpoint);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch sales by pack size');
      }

      return response.data.data?.items;
    },
    {
      configType: 'analytics',
      enabled: options?.enabled !== undefined ? options.enabled : true,
      onError: (error) => console.error('Failed to fetch sales by pack size:', error)
    }
  );
}

/**
 * Hook for fetching DP codes pie chart data
 */
export function useDpCodesPieChart(filters: DashboardFilters = {}) {
  return useStandardQuery(
    DASHBOARD_KEYS.dpCodesPieChart(filters),
    async () => {
      const queryString = buildQueryString(filters, "All");
      // Note: dpCodesPieChart endpoint is not in apiEndPoints, using direct path
      const response = await axiosInstance.get(`/api/dashboard/dp-codes-pie-chart${queryString}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch DP codes pie chart data');
      }

      return response.data.data;
    },
    {
      configType: 'realtime',
      onError: (error) => console.error('Failed to fetch DP codes pie chart data:', error)
    }
  );
}

/**
 * Hook for comprehensive dashboard data (combines multiple queries)
 */
export function useDashboardData(filters: DashboardFilters = {}) {
  const metricsQuery = useDashboardMetrics(filters);
  const peerComparisonQuery = usePeerComparisonData(filters);
  const reportingGapsQuery = useReportingGapsData(filters);
  const salesVsClosingQuery = useSalesVsClosingData(filters);
  const topProductsQuery = useTopProducts(filters, 5);
  const topShopsQuery = useTopShops(filters, 5);

  const isLoading = metricsQuery.isLoading ||
    peerComparisonQuery.isLoading ||
    reportingGapsQuery.isLoading ||
    salesVsClosingQuery.isLoading ||
    topProductsQuery.isLoading ||
    topShopsQuery.isLoading;

  const isError = metricsQuery.isError ||
    peerComparisonQuery.isError ||
    reportingGapsQuery.isError ||
    salesVsClosingQuery.isError ||
    topProductsQuery.isError ||
    topShopsQuery.isError;

  const error = metricsQuery.error ||
    peerComparisonQuery.error ||
    reportingGapsQuery.error ||
    salesVsClosingQuery.error ||
    topProductsQuery.error ||
    topShopsQuery.error;

  return {
    data: {
      metrics: metricsQuery.data,
      peerComparison: peerComparisonQuery.data,
      reportingGaps: reportingGapsQuery.data,
      salesVsClosing: salesVsClosingQuery.data,
      topProducts: topProductsQuery.data,
      topShops: topShopsQuery.data,
    },
    isLoading,
    isError,
    error,
    refetch: useCallback(() => {
      return Promise.all([
        metricsQuery.refetch(),
        peerComparisonQuery.refetch(),
        reportingGapsQuery.refetch(),
        salesVsClosingQuery.refetch(),
        topProductsQuery.refetch(),
        topShopsQuery.refetch(),
      ]);
    }, [
      metricsQuery.refetch,
      peerComparisonQuery.refetch,
      reportingGapsQuery.refetch,
      salesVsClosingQuery.refetch,
      topProductsQuery.refetch,
      topShopsQuery.refetch,
    ]),
  };
}

/**
 * Hook for clearing dashboard cache
 */
export function useDashboardCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: DASHBOARD_KEYS.all() });
    // Note: Server-side cache clearing not needed with API routes
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all() });
  }, [queryClient]);

  const prefetchDashboardData = useCallback((filters: DashboardFilters = {}) => {
    return Promise.all([
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_KEYS.metrics(filters),
        queryFn: () => dashboardClientService.getDashboardMetrics(filters),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_KEYS.peerComparison(filters),
        queryFn: () => dashboardClientService.getPeerComparisonData(filters),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: DASHBOARD_KEYS.reportingGaps(filters),
        queryFn: () => dashboardClientService.getReportingGapsData(filters),
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  return {
    clearCache,
    invalidateCache,
    prefetchDashboardData,
  };
}

/**
 * Hook for real-time dashboard updates with WebSocket-like functionality
 */
export function useDashboardRealtime(filters: DashboardFilters = {}, enabled: boolean = true) {
  const queryClient = useQueryClient();

  const enableRealtime = useCallback(() => {
    if (!enabled) return;

    // Set up real-time updates every 30 seconds for critical metrics
    const interval = setInterval(() => {
      queryClient.invalidateQueries({
        queryKey: DASHBOARD_KEYS.metrics(filters),
        exact: false
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient, filters, enabled]);

  return {
    enableRealtime,
  };
}

/**
 * Hook for dashboard KPI calculations and insights
 */
export function useDashboardKPIs(filters: DashboardFilters = {}) {
  const metricsQuery = useDashboardMetrics(filters);
  const peerComparisonQuery = usePeerComparisonData(filters);
  const topProductsQuery = useTopProducts(filters, 10);
  const topShopsQuery = useTopShops(filters, 10);

  const kpis = useMemo(() => {
    if (!metricsQuery.data) return null;

    const metrics = metricsQuery.data;
    const peerData = peerComparisonQuery.data;
    const topProducts = topProductsQuery.data || [];
    const topShops = topShopsQuery.data || [];

    // Calculate health score based on multiple factors
    const healthScore = Math.round(
      (metrics.totalStock.change > 0 ? 25 : 0) +
      (topProducts.length >= 5 ? 25 : topProducts.length * 5) +
      (topShops.length >= 5 ? 25 : topShops.length * 5) +
      (peerData && peerData.length > 0 && metrics.totalStock.value > (peerData[0]?.peerData || 0) ? 25 : 0)
    );

    // Generate insights
    const insights = {
      stockTrend: metrics.totalStock.changeType,
      topPerformer: metrics.topShop.name,
      bestProduct: metrics.topSku.name,
      healthScore,
      riskFactors: [
        ...(metrics.totalStock.changeType === 'decrease' ? ['Declining Stock Levels'] : []),
        ...(topShops.length < 3 ? ['Limited Active Shops'] : []),
        ...(healthScore < 50 ? ['Low Performance Score'] : []),
      ],
      opportunities: [
        ...(topProducts.length > 5 ? ['Diverse Product Portfolio'] : []),
        ...(metrics.totalStock.changeType === 'increase' ? ['Growing Inventory'] : []),
        ...(healthScore > 75 ? ['Strong Performance Base'] : []),
      ],
    };

    return {
      metrics,
      insights,
      trends: {
        stockGrowth: metrics.totalStock.change,
        productDiversity: topProducts.length,
        marketPresence: topShops.length,
      },
    };
  }, [metricsQuery.data, peerComparisonQuery.data, topProductsQuery.data, topShopsQuery.data]);

  return {
    data: kpis,
    isLoading: metricsQuery.isLoading || peerComparisonQuery.isLoading,
    isError: metricsQuery.isError || peerComparisonQuery.isError,
    error: metricsQuery.error || peerComparisonQuery.error,
  };
}

/**
 * Hook for dashboard alerts and notifications
 */
export function useDashboardAlerts(filters: DashboardFilters = {}) {
  const metricsQuery = useDashboardMetrics(filters);
  const reportingGapsQuery = useReportingGapsData(filters);

  const alerts = useMemo(() => {
    if (!metricsQuery.data) return [];

    const metrics = metricsQuery.data;
    const reportingGaps = reportingGapsQuery.data;
    const alertList = [];

    // Sales decline alert
    if (metrics.totalStock.changeType === 'decrease' && Math.abs(metrics.totalStock.change) > 10) {
      alertList.push({
        id: 'sales-decline',
        type: 'critical' as const,
        title: 'Significant Sales Decline',
        message: `Stock levels have decreased by ${Math.abs(metrics.totalStock.change)}% in the last ${metrics.totalStock.period}`,
        actionRequired: true,
        priority: 1,
      });
    }

    // Low stock alert
    if (metrics.topShop.stockLeft < 5) {
      alertList.push({
        id: 'low-stock',
        type: 'warning' as const,
        title: 'Low Stock Alert',
        message: `${metrics.topShop.name} has only ${metrics.topShop.stockLeft} units left`,
        actionRequired: true,
        priority: 2,
      });
    }

    // Reporting gaps alert
    if (reportingGaps && reportingGaps.missedReports > 0) {
      alertList.push({
        id: 'reporting-gaps',
        type: 'info' as const,
        title: 'Data Reporting Gaps',
        message: `${reportingGaps.missedReports} missed reports detected`,
        actionRequired: false,
        priority: 3,
      });
    }

    return alertList.sort((a, b) => a.priority - b.priority);
  }, [metricsQuery.data, reportingGapsQuery.data]);

  return {
    alerts,
    criticalCount: alerts.filter(a => a.type === 'critical').length,
    warningCount: alerts.filter(a => a.type === 'warning').length,
    totalCount: alerts.length,
    hasActionRequired: alerts.some(a => a.actionRequired),
  };
}

/**
 * Hook for dashboard analytics with error handling and retry logic
 */
export function useDashboardAnalytics(filters: DashboardFilters = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newFilters: DashboardFilters) => {
      const results = await Promise.allSettled([
        dashboardClientService.getDashboardMetrics(newFilters),
        dashboardClientService.getPeerComparisonData(newFilters),
        dashboardClientService.getReportingGapsData(newFilters),
        dashboardClientService.getSalesVsClosingData(newFilters),
      ]);

      const fulfilled = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      const rejected = results
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map(result => result.reason);

      if (rejected.length > 0) {
        console.warn('Some dashboard analytics failed:', rejected);
      }

      return {
        successful: fulfilled,
        failed: rejected,
        successRate: (fulfilled.length / results.length) * 100,
      };
    },
    onSuccess: (data, variables) => {
      // Update cache with successful results
      queryClient.setQueryData(DASHBOARD_KEYS.metrics(variables), data.successful[0]);
      queryClient.setQueryData(DASHBOARD_KEYS.peerComparison(variables), data.successful[1]);
      queryClient.setQueryData(DASHBOARD_KEYS.reportingGaps(variables), data.successful[2]);
      queryClient.setQueryData(DASHBOARD_KEYS.salesVsClosing(variables), data.successful[3]);
    },
    onError: (error) => {
      console.error('Dashboard analytics mutation failed:', error);
    },
    retry: 2,
    retryDelay: 1000,
  });

  return mutation;
}

// Export types for external use
export type {
  DashboardMetrics,
  DashboardFilters,
  PeerComparisonData,
  ReportingGapsData,
  StockData,
  ProductPerformanceData,
  ShopPerformanceData,
};
