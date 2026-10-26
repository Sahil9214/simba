/**
 * Breakage Report Service Types
 * Defines the data structures for breakage tracking and reporting
 */

/**
 * Filters for breakage queries
 */
export interface BreakageFilters {
  searchTerm?: string;
  selectedLocation?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  shopIds?: string[];
  skuIds?: string[];
  minValue?: number;
  maxValue?: number;
  breakageCause?: string[];
  category?: string;
  limit?: number;
  offset?: number;
}

/**
 * Breakage statistics summary
 */
export interface BreakageStatistics {
  totalBreakages: number;
  totalValue: number;
  averageValue: number;
  breakageRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  periodStart: string;
  periodEnd: string;
  topCauses: Array<{
    cause: string;
    count: number;
    percentage: number;
  }>;
  bySeverity: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Breakage data by shop
 */
export interface BreakageByShop {
  shopId: string;
  shopName: string;
  dpCode?: string;
  location: string;
  breakageCount: number;
  breakageValue: number;
  breakagePercentage: number;
  averageBreakageValue: number;
  topBreakageReasons: string[];
  lastBreakageDate?: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Breakage data by SKU
 */
export interface BreakageBySKU {
  skuId: string;
  skuName: string;
  category: string;
  breakageCount: number;
  breakageValue: number;
  breakageRate: number;
  averageBreakageValue: number;
  affectedShops: number;
  topBreakageReasons: string[];
  lastBreakageDate?: string;
}

/**
 * Breakage trend data point
 */
export interface BreakageTrend {
  date: string;
  breakageCount: number;
  breakageValue: number;
  breakageRate: number;
  movingAverage?: number;
}

/**
 * Breakage analysis
 */
export interface BreakageAnalysis {
  summary: {
    totalBreakages: number;
    totalValue: number;
    affectedShops: number;
    affectedSKUs: number;
    averageCostPerBreakage: number;
  };
  byCause: Array<{
    cause: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  byCategory: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  byLocation: Array<{
    location: string;
    count: number;
    value: number;
    shopCount: number;
  }>;
  timeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  recommendations: Array<{
    type: string;
    priority: 'high' | 'medium' | 'low';
    message: string;
    estimatedSavings?: number;
  }>;
}

/**
 * Breakage report export data
 */
export interface BreakageReportExport {
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  statistics: BreakageStatistics;
  byShop: BreakageByShop[];
  bySKU: BreakageBySKU[];
  trends: BreakageTrend[];
  analysis: BreakageAnalysis;
}

/**
 * Breakage alert
 */
export interface BreakageAlert {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  shopId?: string;
  skuId?: string;
  date?: string;
}

/**
 * Breakage prevention insight
 */
export interface BreakagePreventionInsight {
  category: string;
  currentBreakageRate: number;
  targetBreakageRate: number;
  potentialSavings: number;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

















