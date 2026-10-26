import {
  SalesMetrics,
  SalesByPeriod,
  SalesByCategory,
  SalesComparison,
  SeasonalAnalysis,
  CustomerSegmentation,
  SalesAnalyticsFilters,
} from './salesAnalytics.service';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-side wrapper for Sales Analytics API
 * This service makes HTTP requests to API routes instead of direct database access
 */
class SalesAnalyticsClientService {
  private baseUrl = `${API_BASE_URL}/api/analytics/sales`;

  /**
   * Get authorization headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Helper to build query string from filters
   */
  private buildQueryString(filters: SalesAnalyticsFilters = {}): string {
    const params = new URLSearchParams();

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.selectedLocation) params.append('selectedLocation', filters.selectedLocation);
    if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
    if (filters.category?.length) params.append('category', filters.category.join(','));
    if (filters.brand_name?.length) params.append('brand_name', filters.brand_name.join(','));
    if (filters.shopIds?.length) params.append('shopIds', filters.shopIds.join(','));
    if (filters.skuIds?.length) params.append('skuIds', filters.skuIds.join(','));
    if (filters.minRevenue !== undefined) params.append('minRevenue', filters.minRevenue.toString());
    if (filters.maxRevenue !== undefined) params.append('maxRevenue', filters.maxRevenue.toString());

    return params.toString();
  }

  /**
   * Get comprehensive sales metrics
   */
  async getSalesMetrics(filters: SalesAnalyticsFilters = {}): Promise<SalesMetrics> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/metrics${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales metrics');
    }

    return response.json();
  }

  /**
   * Get sales data by time period
   */
  async getSalesByPeriod(
    period: 'day' | 'week' | 'month' | 'quarter',
    filters: SalesAnalyticsFilters = {}
  ): Promise<SalesByPeriod[]> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/by-period?period=${period}${queryString ? `&${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales by period');
    }

    return response.json();
  }

  /**
   * Get sales data by category
   */
  async getSalesByCategory(filters: SalesAnalyticsFilters = {}): Promise<SalesByCategory[]> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/by-category${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales by category');
    }

    return response.json();
  }

  /**
   * Get sales comparison with previous periods
   */
  async getSalesComparison(
    comparisonType: 'month' | 'quarter' | 'year',
    filters: SalesAnalyticsFilters = {}
  ): Promise<SalesComparison> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/comparison?comparisonType=${comparisonType}${queryString ? `&${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales comparison');
    }

    return response.json();
  }

  /**
   * Get seasonal analysis and forecasting
   */
  async getSeasonalAnalysis(filters: SalesAnalyticsFilters = {}): Promise<SeasonalAnalysis> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/seasonal${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seasonal analysis');
    }

    return response.json();
  }

  /**
   * Get customer segmentation analysis
   */
  async getCustomerSegmentation(filters: SalesAnalyticsFilters = {}): Promise<CustomerSegmentation> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/customer-segments${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customer segmentation');
    }

    return response.json();
  }

  /**
   * Clear cache (no-op for client-side, cache is server-side)
   */
  clearCache(): void {
    // Client-side cache clearing not needed
    // Server-side service handles caching
    console.log('Cache cleared (server-side)');
  }


  async getSalesByPackSize(filters: SalesAnalyticsFilters = {}): Promise<any[]> {
    const queryString = this.buildQueryString(filters);
    const url = `${this.baseUrl}/by-pack-size${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sales by pack size');
    }

    return response.json();
  }



}

export const salesAnalyticsService = new SalesAnalyticsClientService();
export default salesAnalyticsService;
