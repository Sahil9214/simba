/**
 * Dashboard Client Service
 * Client-side wrapper for dashboard API routes
 * Provides type-safe methods for fetching dashboard data via API endpoints
 */

import type {
  DashboardMetrics,
  DashboardFilters,
  PeerComparisonData,
  ReportingGapsData,
  StockData,
  ProductPerformanceData,
  ShopPerformanceData,
  OverallSalesSplitData,
  ShopSalesVsClosingData,
} from '../types/dashboard.types';

// Re-export types for convenience
export type {
  DashboardMetrics,
  DashboardFilters,
  PeerComparisonData,
  ReportingGapsData,
  StockData,
  ProductPerformanceData,
  ShopPerformanceData,
  OverallSalesSplitData,
  ShopSalesVsClosingData,
};

/**
 * Helper function to build URLSearchParams from filters
 */
function buildFilterParams(filters: DashboardFilters): URLSearchParams {
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

  return params;
}

/**
 * Helper function to handle API response
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data;
}

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

class DashboardClientService {
  /**
   * Get comprehensive dashboard metrics for Analytics Banner
   */
  async getDashboardMetrics(filters: DashboardFilters = {}): Promise<DashboardMetrics> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/metrics?${params}`);
    return handleApiResponse<DashboardMetrics>(response);
  }

  /**
   * Get peer comparison data for charts - comparing field data vs government reports
   */
  async getPeerComparisonData(filters: DashboardFilters = {}): Promise<PeerComparisonData[]> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/peer-comparison?${params}`);
    return handleApiResponse<PeerComparisonData[]>(response);
  }

  /**
   * Get reporting gaps analysis
   */
  async getReportingGapsData(filters: DashboardFilters = {}): Promise<ReportingGapsData> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/reporting-gaps?${params}`);
    return handleApiResponse<ReportingGapsData>(response);
  }

  /**
   * Get stock vs breakage data (daily stock analysis)
   */
  async getSalesVsClosingData(filters: DashboardFilters = {}): Promise<StockData[]> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/sales-vs-closing?${params}`);
    return handleApiResponse<StockData[]>(response);
  }

  /**
   * Get top performing products by stock levels
   */
  async getTopProducts(filters: DashboardFilters = {}, limit: number = 10): Promise<ProductPerformanceData[]> {
    const params = buildFilterParams(filters);
    params.append('limit', limit.toString());
    const response = await fetch(`${API_BASE_URL}/api/dashboard/top-products-service?${params}`);

    return handleApiResponse<ProductPerformanceData[]>(response);
  }

  /**
   * Get top performing shops by stock levels
   */
  async getTopShops(filters: DashboardFilters = {}, limit: number = 10): Promise<ShopPerformanceData[]> {
    const params = buildFilterParams(filters);
    params.append('limit', limit.toString());
    const response = await fetch(`${API_BASE_URL}/api/dashboard/top-shops-service?${params}`);
    return handleApiResponse<ShopPerformanceData[]>(response);
  }

  /**
   * Get overall sales split data for DonutChart
   */
  async getOverallSalesSplitData(filters: DashboardFilters = {}): Promise<OverallSalesSplitData[]> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/overall-sales-split?${params}`);
    return handleApiResponse<OverallSalesSplitData[]>(response);
  }

  /**
   * Get shop-wise sales vs closing stock data
   */
  async getShopSalesVsClosingData(filters: DashboardFilters = {}): Promise<ShopSalesVsClosingData[]> {
    const params = buildFilterParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/dashboard/shop-sales-vs-closing?${params}`);
    return handleApiResponse<ShopSalesVsClosingData[]>(response);
  }
}

// Export singleton instance
export const dashboardClientService = new DashboardClientService();

// Export class for testing purposes
export { DashboardClientService };
