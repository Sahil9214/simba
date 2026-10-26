// Client-side wrapper for Breakage Report service - calls API routes
// Export all types from the service
export type {
  BreakageStatistics,
  BreakageByShop,
  BreakageBySKU,
  BreakageTrend,
  BreakageAnalysis,
  BreakageFilters,
} from './breakageReport.service';

import type { BreakageFilters } from './breakageReport.service';
import {
  DUMMY_BREAKAGE_STATISTICS,
  DUMMY_BREAKAGE_BY_SHOP,
  DUMMY_BREAKAGE_BY_SKU,
  DUMMY_BREAKAGE_TRENDS,
} from '@/lib/constants/dummyData';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Helper to build query string from filters
 */
function buildQueryString(filters: BreakageFilters = {}): string {
  const params = new URLSearchParams();
  if (filters.searchTerm) {
    params.append('searchTerm', filters.searchTerm);
  }
  if (filters.selectedLocation) {
    params.append('selectedLocation', filters.selectedLocation);
  }
  if (filters.dateRange?.start) {
    params.append('startDate', filters.dateRange.start);
  }
  if (filters.dateRange?.end) {
    params.append('endDate', filters.dateRange.end);
  }
  if (filters.shopIds?.length) {
    params.append('shopIds', filters.shopIds.join(','));
  }
  if (filters.skuIds?.length) {
    params.append('skuIds', filters.skuIds.join(','));
  }
  if (filters.minValue !== undefined) {
    params.append('minValue', String(filters.minValue));
  }
  if (filters.maxValue !== undefined) {
    params.append('maxValue', String(filters.maxValue));
  }
  if (filters.breakageCause?.length) {
    params.append('breakageCause', filters.breakageCause.join(','));
  }
  if (filters.category !== undefined) {
    params.append("category", String(filters.category))
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

class BreakageReportClientService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(method: string, filters: BreakageFilters): string {
    return `breakage_${method}_${JSON.stringify(filters)}`;
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
   * Get comprehensive breakage statistics
   */
  async getBreakageStatistics(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('statistics', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE_URL}/api/reports/breakage/statistics${queryString}`);

      if (!response.ok) {
        return DUMMY_BREAKAGE_STATISTICS;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch {
      return DUMMY_BREAKAGE_STATISTICS;
    }
  }

  /**
   * Get breakage data by shop
   */
  async getBreakageByShop(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('by_shop', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE_URL}/api/reports/breakage/by-shop${queryString}`);

      if (!response.ok) {
        return DUMMY_BREAKAGE_BY_SHOP;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch {
      return DUMMY_BREAKAGE_BY_SHOP;
    }
  }

  /**
   * Get breakage data by SKU
   */
  async getBreakageBySKU(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('by_sku', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE_URL}/api/reports/breakage/by-sku${queryString}`);
      if (!response.ok) {
        return DUMMY_BREAKAGE_BY_SKU;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch {
      return DUMMY_BREAKAGE_BY_SKU;
    }
  }

  /**
   * Get breakage trends over time
   */
  async getBreakageTrends(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('trends', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE_URL}/api/reports/breakage/trends${queryString}`);

      if (!response.ok) {
        return DUMMY_BREAKAGE_TRENDS;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch {
      return DUMMY_BREAKAGE_TRENDS;
    }
  }

  /**
   * Get breakage analysis with causes and recommendations
   */
  async getBreakageAnalysis(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('analysis', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const dummyAnalysis = {
      summary: {
        totalBreakages: 116,
        totalValue: 24360,
        affectedShops: 6,
        affectedSKUs: 5,
        breakageRate: 0.68,
      },
      causes: [
        { cause: "Handling Transit", count: 54, percentage: 46.5, value: 11340 },
        { cause: "Storage Damage", count: 38, percentage: 32.8, value: 7980 },
        { cause: "Display Mishap", count: 24, percentage: 20.7, value: 5040 },
      ],
      patterns: [],
      recommendations: [
        "Improve cushioning on transit crates for 650ml bottles",
        "Maintain maximum stack height of 4 layers in retail shops",
      ],
    };

    try {
      const queryString = buildQueryString(filters);
      const response = await fetch(`${API_BASE_URL}/api/reports/breakage/analysis${queryString}`);

      if (!response.ok) {
        return dummyAnalysis;
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch {
      return dummyAnalysis;
    }
  }

  /**
   * Get breakage alerts
   */
  async getBreakageAlerts(
    filters: BreakageFilters = {},
    thresholds = {
      breakagePercentage: 5,
      dailyBreakageValue: 1000,
      shopBreakageCount: 10,
    }
  ) {
    const cacheKey = this.getCacheKey('alerts', { ...filters, ...thresholds });
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams();
    const queryString = buildQueryString(filters);
    const baseParams = queryString ? queryString.substring(1) : '';

    if (baseParams) {
      baseParams.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params.append(key, value);
      });
    }

    params.append('breakagePercentage', String(thresholds.breakagePercentage));
    params.append('dailyBreakageValue', String(thresholds.dailyBreakageValue));
    params.append('shopBreakageCount', String(thresholds.shopBreakageCount));

    const response = await fetch(`${API_BASE_URL}/api/reports/breakage/alerts?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to fetch breakage alerts');
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Get breakage prevention insights
   */
  async getBreakagePrevention(filters: BreakageFilters = {}) {
    const cacheKey = this.getCacheKey('prevention', filters);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const queryString = buildQueryString(filters);
    const response = await fetch(`${API_BASE_URL}/api/reports/breakage/prevention${queryString}`);

    if (!response.ok) {
      throw new Error('Failed to fetch breakage prevention insights');
    }

    const data = await response.json();
    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Export breakage data
   */
  async exportBreakageData(
    filters: BreakageFilters = {},
    format: 'csv' | 'json' | 'excel' = 'json',
    dataType: 'statistics' | 'by-shop' | 'by-sku' | 'trends' | 'all' = 'statistics'
  ) {
    const params = new URLSearchParams();
    const queryString = buildQueryString(filters);
    const baseParams = queryString ? queryString.substring(1) : '';

    if (baseParams) {
      baseParams.split('&').forEach(param => {
        const [key, value] = param.split('=');
        params.append(key, value);
      });
    }

    params.append('format', format);
    params.append('dataType', dataType);

    const response = await fetch(`${API_BASE_URL}/api/reports/breakage/export?${params.toString()}`);

    if (!response.ok) {
      throw new Error('Failed to export breakage data');
    }

    if (format === 'csv') {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `breakage-report-${dataType}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    return await response.json();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const breakageReportService = new BreakageReportClientService();
