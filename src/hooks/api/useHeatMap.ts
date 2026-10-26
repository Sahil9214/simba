import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  heatMapClientService,
  HeatMapData,
  HeatMapFilters,
  LocationSummary
} from '../../lib/services/heatmap.client';

// Query keys for heat map data
export const HEATMAP_QUERY_KEYS = {
  all: ['heatmap'] as const,
  data: (filters: HeatMapFilters) => ['heatmap', 'data', filters] as const,
  summary: (filters: HeatMapFilters) => ['heatmap', 'summary', filters] as const,
  trends: (location: string, type: 'state' | 'district', filters: HeatMapFilters) =>
    ['heatmap', 'trends', location, type, filters] as const,
} as const;

/**
 * Hook for fetching heat map data
 */
export function useHeatMapData(filters: HeatMapFilters = {}) {


  return useQuery({
    queryKey: HEATMAP_QUERY_KEYS.data(filters),
    queryFn: () => {
      console.log('🔥 DEBUG: React Query executing heatMapClientService.getHeatMapData');
      return heatMapClientService.getHeatMapData(filters);
    },
    staleTime: 0, // Always fresh for instant updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Rely on invalidation instead of polling
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching location summary statistics
 */
export function useLocationSummary(filters: HeatMapFilters = {}) {
  return useQuery({
    queryKey: HEATMAP_QUERY_KEYS.summary(filters),
    queryFn: () => heatMapClientService.getLocationSummary(filters),
    staleTime: 0, // Always fresh for instant updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Rely on invalidation instead of polling
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}

/**
 * Hook for fetching location performance trends
 */
export function useLocationTrends(
  location: string,
  locationType: 'state' | 'district',
  filters: HeatMapFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: HEATMAP_QUERY_KEYS.trends(location, locationType, filters),
    queryFn: () => heatMapClientService.getLocationTrends(location, locationType, filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 3,
    enabled: enabled && !!location,
  });
}

/**
 * Hook for comprehensive heat map data with processed insights
 */
export function useHeatMapAnalytics(filters: HeatMapFilters = {}) {
  const heatMapQuery = useHeatMapData(filters);
  const summaryQuery = useLocationSummary(filters);

  // Process heat map data for enhanced insights
  const processedData = useMemo(() => {
    if (!heatMapQuery.data || !summaryQuery.data) return null;

    const { data: heatMapData } = heatMapQuery;
    const { data: summary } = summaryQuery;

    // Calculate intensity statistics
    const intensities = heatMapData.map(item => item.intensity);
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const maxIntensity = Math.max(...intensities);
    const minIntensity = Math.min(...intensities);

    // Categorize locations by performance
    const highPerformers = heatMapData.filter(item => item.intensity >= 0.8);
    const mediumPerformers = heatMapData.filter(item => item.intensity >= 0.5 && item.intensity < 0.8);
    const lowPerformers = heatMapData.filter(item => item.intensity < 0.5);

    // Calculate regional insights
    const statePerformance = new Map<string, {
      totalSales: number;
      avgIntensity: number;
      districtCount: number;
    }>();

    heatMapData.forEach(item => {
      const current = statePerformance.get(item.state) || {
        totalSales: 0,
        avgIntensity: 0,
        districtCount: 0
      };

      current.totalSales += item.metrics.salesVolume;
      current.avgIntensity += item.intensity;
      current.districtCount += 1;

      statePerformance.set(item.state, current);
    });

    // Finalize state averages
    statePerformance.forEach((value, key) => {
      value.avgIntensity = value.avgIntensity / value.districtCount;
    });

    return {
      heatMapData,
      summary,
      statistics: {
        avgIntensity,
        maxIntensity,
        minIntensity,
        totalLocations: heatMapData.length,
      },
      performance: {
        high: highPerformers,
        medium: mediumPerformers,
        low: lowPerformers,
      },
      statePerformance: Array.from(statePerformance.entries()).map(([state, data]) => ({
        state,
        ...data,
      })),
    };
  }, [heatMapQuery.data, summaryQuery.data]);

  const isLoading = heatMapQuery.isLoading || summaryQuery.isLoading;
  const isError = heatMapQuery.isError || summaryQuery.isError;
  const error = heatMapQuery.error || summaryQuery.error;

  return {
    data: processedData,
    rawData: {
      heatMap: heatMapQuery.data,
      summary: summaryQuery.data,
    },
    isLoading,
    isError,
    error,
    refetch: useCallback(() => {
      return Promise.all([
        heatMapQuery.refetch(),
        summaryQuery.refetch(),
      ]);
    }, [heatMapQuery.refetch, summaryQuery.refetch]),
  };
}

/**
 * Hook for heat map filter management
 */
export function useHeatMapFilters(initialFilters: HeatMapFilters = {}) {
  const queryClient = useQueryClient();

  const updateFilters = useCallback((newFilters: Partial<HeatMapFilters>) => {
    const updatedFilters = { ...initialFilters, ...newFilters };

    // Prefetch data with new filters
    queryClient.prefetchQuery({
      queryKey: HEATMAP_QUERY_KEYS.data(updatedFilters),
      queryFn: () => heatMapClientService.getHeatMapData(updatedFilters),
      staleTime: 10 * 60 * 1000,
    });

    return updatedFilters;
  }, [initialFilters, queryClient]);

  const clearFilters = useCallback(() => {
    return {};
  }, []);

  const applyLocationFilter = useCallback((location: string) => {
    return updateFilters({ selectedLocation: location });
  }, [updateFilters]);

  const applyMetricFilter = useCallback((metricType: HeatMapFilters['metricType']) => {
    return updateFilters({ metricType });
  }, [updateFilters]);

  const applyIntensityFilter = useCallback((minIntensity: number, maxIntensity: number) => {
    return updateFilters({ minIntensity, maxIntensity });
  }, [updateFilters]);

  return {
    updateFilters,
    clearFilters,
    applyLocationFilter,
    applyMetricFilter,
    applyIntensityFilter,
  };
}

/**
 * Hook for heat map cache management
 */
export function useHeatMapCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: HEATMAP_QUERY_KEYS.all });
    heatMapClientService.clearCache();
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: HEATMAP_QUERY_KEYS.all });
  }, [queryClient]);

  const prefetchHeatMapData = useCallback((filters: HeatMapFilters = {}) => {
    return Promise.all([
      queryClient.prefetchQuery({
        queryKey: HEATMAP_QUERY_KEYS.data(filters),
        queryFn: () => heatMapClientService.getHeatMapData(filters),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: HEATMAP_QUERY_KEYS.summary(filters),
        queryFn: () => heatMapClientService.getLocationSummary(filters),
        staleTime: 15 * 60 * 1000,
      }),
    ]);
  }, [queryClient]);

  return {
    clearCache,
    invalidateCache,
    prefetchHeatMapData,
  };
}

/**
 * Hook for interactive heat map with drill-down capabilities
 */
export function useInteractiveHeatMap(filters: HeatMapFilters = {}) {


  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    type: 'state' | 'district';
  } | null>(null);

  const heatMapData = useHeatMapData(filters);


  const locationTrends = useLocationTrends(
    selectedLocation?.name || '',
    selectedLocation?.type || 'state',
    filters,
    !!selectedLocation
  );

  const selectLocation = useCallback((location: string, type: 'state' | 'district') => {
    setSelectedLocation({ name: location, type });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Find location data for selected location
  const selectedLocationData = useMemo(() => {
    if (!selectedLocation || !heatMapData.data) return null;

    return heatMapData.data.find(item => {
      if (selectedLocation.type === 'state') {
        return item.state === selectedLocation.name;
      } else {
        return item.district === selectedLocation.name;
      }
    });
  }, [selectedLocation, heatMapData.data]);

  return {
    heatMapData: heatMapData.data || [],
    selectedLocation,
    selectedLocationData,
    locationTrends: locationTrends.data,
    isLoading: heatMapData.isLoading || (selectedLocation && locationTrends.isLoading),
    isError: heatMapData.isError || locationTrends.isError,
    error: heatMapData.error || locationTrends.error,
    selectLocation,
    clearSelection,
    refetch: useCallback(async () => {
      const heatMapRefetch = await heatMapData.refetch();
      if (selectedLocation) {
        await locationTrends.refetch();
      }
      return heatMapRefetch;
    }, [heatMapData.refetch, locationTrends.refetch, selectedLocation]),
  };
}

/**
 * Hook for heat map real-time updates
 */
export function useHeatMapRealtime(filters: HeatMapFilters = {}, interval: number = 600000) {
  const queryClient = useQueryClient();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const startRealTime = useCallback(() => {
    setIsRealTimeEnabled(true);
    const intervalId = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: HEATMAP_QUERY_KEYS.data(filters) });
      queryClient.invalidateQueries({ queryKey: HEATMAP_QUERY_KEYS.summary(filters) });
      setLastUpdate(new Date());
      toast.success('Heat map data updated');
    }, interval);

    return () => {
      clearInterval(intervalId);
      setIsRealTimeEnabled(false);
    };
  }, [queryClient, filters, interval]);

  const stopRealTime = useCallback(() => {
    setIsRealTimeEnabled(false);
  }, []);

  useEffect(() => {
    return () => {
      if (isRealTimeEnabled) {
        setIsRealTimeEnabled(false);
      }
    };
  }, [isRealTimeEnabled]);

  return {
    isRealTimeEnabled,
    lastUpdate,
    startRealTime,
    stopRealTime,
  };
}

/**
 * Hook for advanced heat map visualizations with clustering
 */
export function useHeatMapClustering(filters: HeatMapFilters = {}) {
  const heatMapQuery = useHeatMapData(filters);

  const clusteredData = useMemo(() => {
    if (!heatMapQuery.data) return null;

    const data = heatMapQuery.data;

    // Simple k-means clustering by intensity and sales volume
    const clusters = {
      highPerformance: data.filter(item => item.intensity >= 0.8 && item.metrics.salesVolume > 1000),
      mediumPerformance: data.filter(item => item.intensity >= 0.5 && item.intensity < 0.8),
      lowPerformance: data.filter(item => item.intensity < 0.5),
      emergingMarkets: data.filter(item =>
        item.intensity >= 0.6 &&
        item.metrics.salesVolume < 500 &&
        item.metrics.marketPenetration < 0.3
      ),
    };

    // Calculate cluster statistics
    const clusterStats = Object.entries(clusters).map(([name, items]) => ({
      name,
      count: items.length,
      avgIntensity: items.reduce((sum, item) => sum + item.intensity, 0) / items.length || 0,
      totalSales: items.reduce((sum, item) => sum + item.metrics.salesVolume, 0),
      avgPenetration: items.reduce((sum, item) => sum + item.metrics.marketPenetration, 0) / items.length || 0,
      states: [...new Set(items.map(item => item.state))],
    }));

    // Identify opportunities
    const opportunities = [];

    if (clusters.emergingMarkets.length > 0) {
      opportunities.push({
        type: 'market-expansion',
        title: 'Emerging Market Opportunities',
        description: `${clusters.emergingMarkets.length} locations showing growth potential`,
        locations: clusters.emergingMarkets.map(item => `${item.district}, ${item.state}`),
        priority: 'medium',
      });
    }

    if (clusters.lowPerformance.length > clusters.highPerformance.length) {
      opportunities.push({
        type: 'performance-improvement',
        title: 'Performance Enhancement Needed',
        description: `${clusters.lowPerformance.length} underperforming locations need attention`,
        locations: clusters.lowPerformance.slice(0, 10).map(item => `${item.district}, ${item.state}`),
        priority: 'high',
      });
    }

    return {
      clusters,
      clusterStats,
      opportunities,
      insights: {
        dominantCluster: clusterStats.reduce((max, cluster) =>
          cluster.count > max.count ? cluster : max, clusterStats[0]
        ),
        growthPotential: clusters.emergingMarkets.length / data.length,
        marketMaturity: clusters.highPerformance.length / data.length,
      },
    };
  }, [heatMapQuery.data]);

  return {
    data: clusteredData,
    isLoading: heatMapQuery.isLoading,
    isError: heatMapQuery.isError,
    error: heatMapQuery.error,
  };
}

/**
 * Hook for heat map competitive analysis
 */
export function useHeatMapCompetitiveAnalysis(filters: HeatMapFilters = {}) {
  const heatMapQuery = useHeatMapData(filters);
  const summaryQuery = useLocationSummary(filters);

  const competitiveAnalysis = useMemo(() => {
    if (!heatMapQuery.data || !summaryQuery.data) return null;

    const data = heatMapQuery.data;
    const summary = summaryQuery.data;

    // Calculate market share and competitive positioning
    const stateAnalysis = data.reduce((acc, item) => {
      if (!acc[item.state]) {
        acc[item.state] = {
          totalMarketSize: 0,
          ourMarketShare: 0,
          penetrationRate: 0,
          competitiveGaps: [],
          strongholds: [],
          districts: [],
        };
      }

      acc[item.state].totalMarketSize += item.metrics.salesVolume;
      acc[item.state].penetrationRate += item.metrics.marketPenetration;
      acc[item.state].districts.push(item);

      // Identify strongholds (high intensity areas)
      if (item.intensity >= 0.8) {
        acc[item.state].strongholds.push(item.district);
      }

      // Identify competitive gaps (low intensity with high potential)
      if (item.intensity < 0.4 && item.metrics.shopCount > 10) {
        acc[item.state].competitiveGaps.push(item.district);
      }

      return acc;
    }, {} as Record<string, any>);

    // Finalize calculations
    Object.keys(stateAnalysis).forEach(state => {
      const stateData = stateAnalysis[state];
      stateData.penetrationRate = stateData.penetrationRate / stateData.districts.length;
      stateData.ourMarketShare = stateData.totalMarketSize / (summary.totalStates || 1);
    });

    // Generate strategic recommendations
    const recommendations: Array<{
      type: string;
      state: string;
      title: string;
      description: string;
      targetDistricts?: any[];
      priority: string;
    }> = [];

    Object.entries(stateAnalysis).forEach(([state, analysis]: [string, any]) => {
      if (analysis.competitiveGaps.length > 0) {
        recommendations.push({
          type: 'market-penetration',
          state,
          title: `Increase penetration in ${state}`,
          description: `${analysis.competitiveGaps.length} districts with expansion opportunities`,
          targetDistricts: analysis.competitiveGaps,
          priority: analysis.competitiveGaps.length > 3 ? 'high' : 'medium',
        });
      }

      if (analysis.strongholds.length > 2) {
        recommendations.push({
          type: 'market-defense',
          state,
          title: `Defend strongholds in ${state}`,
          description: `Maintain dominance in ${analysis.strongholds.length} key districts`,
          targetDistricts: analysis.strongholds,
          priority: 'medium',
        });
      }
    });

    return {
      stateAnalysis,
      recommendations,
      marketPosition: {
        totalStates: Object.keys(stateAnalysis).length,
        strongStateCount: Object.values(stateAnalysis).filter((s: any) => s.penetrationRate > 0.6).length,
        opportunityStates: Object.values(stateAnalysis).filter((s: any) => s.competitiveGaps.length > 2).length,
      },
    };
  }, [heatMapQuery.data, summaryQuery.data]);

  return {
    data: competitiveAnalysis,
    isLoading: heatMapQuery.isLoading || summaryQuery.isLoading,
    isError: heatMapQuery.isError || summaryQuery.isError,
    error: heatMapQuery.error || summaryQuery.error,
  };
}

/**
 * Hook for heat map data export
 */
export function useHeatMapExport() {
  const mutation = useMutation({
    mutationFn: async ({
      filters,
      format
    }: {
      filters: HeatMapFilters;
      format: 'csv' | 'json' | 'excel'
    }) => {
      const data = await heatMapClientService.getHeatMapData(filters);

      switch (format) {
        case 'csv':
          const csvHeaders = 'State,District,Sales Volume,Market Penetration,Shop Count,Intensity\n';
          const csvRows = data.map(item =>
            `"${item.state}","${item.district}",${item.metrics.salesVolume},${item.metrics.marketPenetration},${item.metrics.shopCount},${item.intensity}`
          ).join('\n');
          return csvHeaders + csvRows;

        case 'json':
          return JSON.stringify(data, null, 2);

        case 'excel':
          // In a real implementation, you'd use a library like xlsx
          return data;

        default:
          throw new Error('Unsupported export format');
      }
    },
    onSuccess: (data, variables) => {
      // Create download link
      const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], {
        type: variables.format === 'csv' ? 'text/csv' : 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `heatmap-data.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Heat map export failed:', error);
    },
  });

  return mutation;
}

// Export types for external use
export type {
  HeatMapData,
  HeatMapFilters,
  LocationSummary,
};
