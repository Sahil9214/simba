// types.ts - Type definitions for Analytics Banner components

export interface AnalyticsBannerProps {
  searchTerm: string;
  selectedLocation: string;
  refreshInterval?: number;
  enableRealtime?: boolean;
  onMetricClick?: (metricType: string, data: any) => void;
  className?: string;
}

export interface MetricData {
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  previousValue?: number;
  timestamp?: Date;
}

export interface TotalStockMetric extends MetricData {
  period: string;
  target?: number;
  targetAchievement?: number;
}

export interface TopSkuMetric {
  name: string;
  totalStock: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  category?: string;
  brand?: string;
  rank?: number;
}

export interface TopShopMetric {
  name: string;
  stockUnits: number;
  stockLeft: number;
  dpCode: string;
  location?: string;
  lastOrderDate?: string;
  averageDailyStock?: number;
}

export interface TopLocationMetric {
  name: string;
  stockUnits: number;
  shopCount: number;
  growthRate?: number;
  marketShare?: number;
  competitorCount?: number;
}

export interface EnhancedDashboardMetrics {
  totalStock: TotalStockMetric;
  topSku: TopSkuMetric;
  topShop: TopShopMetric;
  topLocation: TopLocationMetric;
  lastUpdated: Date;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
  alerts?: AlertData[];
}

export interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionRequired: boolean;
  priority: number;
  timestamp: Date;
}

export interface RealTimeConfig {
  enabled: boolean;
  interval: number; // in seconds
  endpoints: string[];
  fallbackData?: any;
}

export interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  locations?: string[];
  shops?: string[];
  skus?: string[];
  categories?: string[];
  brands?: string[];
}

// Component state types
export interface AnalyticsBannerState {
  isLoading: boolean;
  isError: boolean;
  isRefreshing: boolean;
  lastUpdated: Date;
  errorMessage?: string;
  retryCount: number;
}

// Animation and UI types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'bounce' | 'none';
export type MetricCardVariant = 'default' | 'compact' | 'detailed' | 'minimal';
export type StatusType = 'healthy' | 'warning' | 'critical' | 'info' | 'offline';

// Event handler types
export type MetricClickHandler = (metricType: keyof EnhancedDashboardMetrics, data: any) => void;
export type RefreshHandler = () => Promise<void>;
export type ErrorHandler = (error: Error, context: string) => void;