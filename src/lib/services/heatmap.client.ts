/**
 * Client-safe Heat Map Service
 * Uses API routes instead of direct database access
 */

export type {
  HeatMapData,
  LocationSummary,
  LocationTrend,
  HeatMapFilters
} from '../types/heatmap.types';

import { getCurrentDateISO, getDateDaysAgo } from '@/lib/utils';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export class HeatMapClientService {
  private cache: Map<string, any> = new Map();
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  private getCacheKey(method: string, filters: any): string {
    return `heatmap_${method}_${JSON.stringify(filters)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get heat map data for geographical visualization via API route
   */
  async getHeatMapData(filters: any = {}): Promise<any[]> {
    const cacheKey = this.getCacheKey('heatmap_data', filters);
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const {
        searchTerm,
        selectedLocation,
        metricType = 'sales',
        dateRange,
        minIntensity = 0,
        maxIntensity = 1
      } = filters;

      const endDate = dateRange?.end || getCurrentDateISO();
      const startDate = dateRange?.start || getDateDaysAgo(30);

      const params = new URLSearchParams({
        startDate,
        endDate,
        metricType,
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedLocation) params.append('selectedLocation', selectedLocation);

      const response = await fetch(`${API_BASE_URL}/api/analytics/heatmap?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch heat map data');
      }

      const heatMapData = await response.json();

      // Filter by intensity if specified
      let filteredData = heatMapData;
      if (minIntensity > 0 || maxIntensity < 1) {
        filteredData = heatMapData.filter((item: any) =>
          item.intensity >= minIntensity && item.intensity <= maxIntensity
        );
      }

      this.setCache(cacheKey, filteredData);
      return filteredData;
    } catch (error: any) {
      console.error('Failed to fetch heat map data:', error);
      throw new Error(error.message || 'Failed to fetch heat map data');
    }
  }

  /**
   * Get location summary statistics via API route
   */
  async getLocationSummary(filters: any = {}): Promise<any> {
    const cacheKey = this.getCacheKey('location_summary', filters);
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const heatMapData = await this.getHeatMapData(filters);

      // Calculate summary statistics
      const states = new Set(heatMapData.map((item: any) => item.state));
      const districts = new Set(heatMapData.map((item: any) => item.district));
      const shops = heatMapData.reduce((sum: number, item: any) => sum + item.metrics.shopCount, 0);
      const totalSales = heatMapData.reduce((sum: number, item: any) => sum + item.metrics.salesVolume, 0);
      const averageSales = totalSales / Math.max(heatMapData.length, 1);

      // Find top and worst performing locations
      const sortedByPerformance = [...heatMapData].sort((a: any, b: any) =>
        b.metrics.salesVolume - a.metrics.salesVolume
      );

      const summary = {
        totalStates: states.size,
        totalDistricts: districts.size,
        totalShops: shops,
        averageSales,
        topPerformingLocation: sortedByPerformance[0]?.district || 'N/A',
        worstPerformingLocation: sortedByPerformance[sortedByPerformance.length - 1]?.district || 'N/A'
      };

      this.setCache(cacheKey, summary);
      return summary;
    } catch (error: any) {
      console.error('Failed to get location summary:', error);
      throw new Error(error.message || 'Failed to get location summary');
    }
  }

  /**
   * Get location performance trends over time via API route
   */
  async getLocationTrends(
    location: string,
    locationType: 'state' | 'district',
    filters: any = {}
  ): Promise<any[]> {
    const cacheKey = this.getCacheKey(`location_trends_${location}_${locationType}`, filters);
    const cached = this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    try {
      const endDate = filters.dateRange?.end || new Date().toISOString();
      const startDate = filters.dateRange?.start ||
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      const params = new URLSearchParams({
        location,
        locationType,
        startDate,
        endDate,
      });

      const response = await fetch(`${API_BASE_URL}/api/analytics/heatmap/trends?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch location trends');
      }

      const trends = await response.json();

      this.setCache(cacheKey, trends);
      return trends;
    } catch (error: any) {
      console.error('Failed to get location trends:', error);
      throw new Error(error.message || 'Failed to get location trends');
    }
  }

  /**
   * Clear all cached heat map data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Debug function to clear cache
   */
  debugClearCache(): void {
    console.log('🧹 DEBUG: Clearing heat map cache...');
    this.clearCache();
    console.log('✅ DEBUG: Cache cleared');
  }
}

// Export singleton instance
export const heatMapClientService = new HeatMapClientService();
