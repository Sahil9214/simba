/**
 * Heat Map Type Definitions
 * Shared types for heat map data and operations
 * Safe for both client and server imports
 */

export interface HeatMapData {
  region: string;
  state: string;
  district: string;
  shopId?: string;
  shopName?: string;
  dpCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  metrics: {
    salesVolume: number;
    marketPenetration: number;
    shopCount: number;
    averagePerformance: number;
    growthRate: number;
  };
  intensity: number; // 0-1 scale for heat visualization
  color: string;
}

export interface LocationSummary {
  totalStates: number;
  totalDistricts: number;
  totalShops: number;
  averageSales: number;
  topPerformingLocation: string;
  worstPerformingLocation: string;
}

export interface LocationTrend {
  date: string;
  salesVolume: number;
  growthRate: number;
}

export interface HeatMapFilters {
  searchTerm?: string;
  selectedLocation?: string;
  metricType?: 'sales' | 'penetration' | 'growth' | 'performance';
  dateRange?: {
    start: string;
    end: string;
  };
  minIntensity?: number;
  maxIntensity?: number;
}
