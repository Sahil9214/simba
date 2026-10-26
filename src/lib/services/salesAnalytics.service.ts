/**
 * Sales Analytics Service Types
 * Defines the data structures for sales analytics and reporting
 */

/**
 * Filters for sales analytics queries
 */
export interface SalesAnalyticsFilters {
  searchTerm?: string;
  selectedLocation?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string[];
  brand_name?: string[];
  shopIds?: string[];
  skuIds?: string[];
  minRevenue?: number;
  maxRevenue?: number;
  limit?: number;
  offset?: number;
}

/**
 * Comprehensive sales metrics
 */
export interface SalesMetrics {
  totalRevenue: number;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  salesGrowth: number;
  growthRate?: number;
  salesTrend?: 'increasing' | 'decreasing' | 'stable';
  topPerformingCategory?: string;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  topCategories: Array<{
    category: string;
    revenue: number;
    percentage: number;
  }>;
  topShops: Array<{
    id: string;
    name: string;
    revenue: number;
    salesCount: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Sales data by time period
 */
export interface SalesByPeriod {
  period: string;
  startDate: string;
  endDate: string;
  revenue: number;
  sales: number;
  orders: number;
  averageOrderValue: number;
  growth: number;
}

/**
 * Sales data by category
 */
export interface SalesByCategory {
  category: string;
  revenue: number;
  sales: number;
  orders: number;
  percentage: number;
  growth: number;
  growthRate?: number;
  marketShare?: number;
  units?: number;
  topSKU?: string;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

/**
 * Sales comparison with previous periods
 */
export interface SalesComparison {
  current: {
    period: string;
    revenue: number;
    sales: number;
    orders: number;
    averageOrderValue: number;
  };
  previous: {
    period: string;
    revenue: number;
    sales: number;
    orders: number;
    averageOrderValue: number;
  };
  comparison: {
    revenueChange: number;
    revenueChangePercentage: number;
    salesChange: number;
    salesChangePercentage: number;
    ordersChange: number;
    ordersChangePercentage: number;
    aovChange: number;
    aovChangePercentage: number;
  };
  growth?: {
    revenueGrowth: number;
    salesGrowth: number;
    ordersGrowth: number;
  };
  benchmark?: {
    industryAverage: number;
    competitorAverage: number;
    marketLeaderValue: number;
  };
}

/**
 * Seasonal analysis and trends
 */
export interface SeasonalAnalysis {
  seasons: Array<{
    name: string;
    period: string;
    revenue: number;
    sales: number;
    averageOrderValue: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  peakSeasons: Array<{
    season: string;
    revenue: number;
    percentage: number;
  }>;
  seasonality?: Array<{
    period: string;
    pattern: string;
    revenue: number;
    sales: number;
    salesIndex?: number;
  }>;
  forecast: Array<{
    period: string;
    predictedRevenue: number;
    predictedSales: number;
    confidence: number;
  }>;
  trends: {
    overall: 'increasing' | 'decreasing' | 'stable';
    seasonality: 'high' | 'medium' | 'low';
  };
}

/**
 * Customer segmentation analysis
 */
export interface CustomerSegmentation {
  segments: Array<{
    id: string;
    name: string;
    segmentName?: string;
    customerCount: number;
    shopCount?: number;
    revenue: number;
    averageOrderValue: number;
    orderFrequency: number;
    percentage: number;
  }>;
  topSegments: Array<{
    id: string;
    name: string;
    revenue: number;
    percentage: number;
  }>;
  insights: {
    highValueCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    churnRate: number;
  };
}

/**
 * Product performance matrix
 */
export interface ProductPerformanceMatrix {
  products: Array<{
    id: string;
    name: string;
    category: string;
    revenue: number;
    sales: number;
    growth: number;
    margin: number;
    performance: 'star' | 'potential' | 'maintain' | 'divest';
  }>;
  summary: {
    stars: number;
    potentials: number;
    maintains: number;
    divests: number;
  };
  recommendations: Array<{
    productId: string;
    productName: string;
    action: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Sales by pack size
 */
export interface SalesByPackSize {
  packSize: string;
  revenue: number;
  sales: number;
  percentage: number;
  growth: number;
}

/**
 * Time range options
 */
export type TimeRange = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * Comparison type options
 */
export type ComparisonType = 'month' | 'quarter' | 'year';

/**
 * Response wrapper for paginated results
 */
export interface PaginatedSalesResponse<T> {
  data: T;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

