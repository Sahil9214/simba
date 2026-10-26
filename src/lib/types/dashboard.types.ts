/**
* Dashboard Type Definitions
* Shared types for dashboard operations
* Safe for both client and server imports
*/

export interface DashboardMetrics {
  totalStock: {
    value: number;
    unit: string;
    change: number;
    changeType: 'increase' | 'decrease';
    period: string;
  };
  topSku: {
    name: string;
    totalStock: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  topShop: {
    name: string;
    stockUnits: number;
    stockLeft: number;
    dpCode: string;
  };
  topLocation: {
    name: string;
    stockUnits: number;
    shopCount: number;
  };
}

export interface DashboardFilters {
  searchTerm?: string;
  searchByName?: string;
  selectedLocation?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  shopIds?: string[];
  skuIds?: string[];
  category?: string;
  filteredDpCode?: string;
}

export interface StockData {
  date: string;
  closingStock: number;
  breakage: number;
  govReport: number;
  fieldData: number;
}

export interface ShopPerformanceData {
  shopId: string;
  shopName: string;
  dpCode: string;
  stockUnits: number;
  totalBreakage: number;
  growthRate: number;
  location: string;
}

export interface ProductPerformanceData {
  skuId: string;
  skuName: string;
  totalStock: number;
  soldUnits: number;
  breakageUnits: number;
  revenue: number;
  growthRate: number;
}

export interface PeerComparisonData {
  date: string;
  fieldData: number;
  govReport: number;
  difference: number;
  percentageDiff: number;
}

export interface ReportingGapsData {
  date: string;
  expectedReports: number;
  receivedReports: number;
  missingReports: number;
  complianceRate: number;
}

export interface OverallSalesSplitData {
  category: string;
  value: number;
  percentage: number;
  growth: number;
}

export interface ShopSalesVsClosingData {
  shopId: string;
  shopName: string;
  dpCode: string;
  location: string;
  openingStock: number;
  purchases: number;
  sales: number;
  closingStock: number;
  expectedClosing: number;
  variance: number;
  variancePercentage: number;
}
