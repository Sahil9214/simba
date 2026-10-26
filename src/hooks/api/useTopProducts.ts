import { useQuery } from '@tanstack/react-query';

interface TopProductsFilters {
  limit?: number;
  sortBy?: 'units' | 'revenue';
  searchTerm?: string;
  selectedLocation?: string;
  timeframe?: string;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  brand: string;
  manufacturer: string;
  totalStock: number;
  totalSales: number;
  shopCount: number;
  units: number;
  revenue: number;
  rank: number;
  percentage: number;
  revenuePercentage: number;
  averagePerShop: number;
}

interface TopProductsResponse {
  items: TopProduct[];
  total: number;
  aggregates: {
    totalUnits: number;
    totalRevenue: number;
    averageUnitsPerProduct: number;
    averageRevenuePerProduct: number;
  };
  metadata: {
    timeframe: number;
    startDate: string;
    endDate: string;
    sortBy: string;
    location: string;
    searchTerm?: string;
    totalProductsFound: number;
  };
}

export const TOP_PRODUCTS_QUERY_KEYS = {
  all: ['top-products'] as const,
  lists: () => [...TOP_PRODUCTS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: TopProductsFilters) => [...TOP_PRODUCTS_QUERY_KEYS.lists(), filters] as const,
} as const;

async function fetchTopProducts(filters: TopProductsFilters = {}): Promise<TopProductsResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
  const searchParams = new URLSearchParams();

  if (filters.limit) searchParams.set('limit', filters.limit.toString());
  if (filters.sortBy) searchParams.set('sortBy', filters.sortBy);
  if (filters.searchTerm) searchParams.set('searchTerm', filters.searchTerm);
  if (filters.selectedLocation) searchParams.set('selectedLocation', filters.selectedLocation);
  if (filters.timeframe) searchParams.set('timeframe', filters.timeframe);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const response = await fetch(`${API_BASE_URL}/api/dashboard/top-products-service?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch top products: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch top products');
  }

  return result.data;
}

export function useTopProducts(filters: TopProductsFilters = {}) {
  return useQuery({
    queryKey: TOP_PRODUCTS_QUERY_KEYS.list(filters),
    queryFn: () => fetchTopProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
}

// Export types for use in other components
export type { TopProduct, TopProductsResponse, TopProductsFilters };