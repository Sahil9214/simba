import { useQuery } from '@tanstack/react-query';

export interface StockLevel {
  closingStock: number;
  stockLevel: 'Healthy' | 'Medium' | 'Low';
}

export interface ShopBrandData {
  shopName: string;
  shopId: string;
  location: string;
  dpCode: string | null;
  brands: {
    [brandName: string]: StockLevel;
  };
}

interface ShopBrandStockFilters {
  searchTerm?: string;
  selectedLocation?: string;
  daysBack?: number;
  category?: string;
  limit?: number;
  offset?: number;
}

interface ShopBrandStockResponse {
  success: boolean;
  data: ShopBrandData[];
  totalShops: number;
  total_instock?: number;
  total_outstock?: number;
  metadata?: {
  
    total_outstock: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  error?: string;
}

export const useShopBrandStock = (filters: ShopBrandStockFilters) => {
  return useQuery<ShopBrandStockResponse>({
    queryKey: ['shop-brand-stock', filters],
    queryFn: async (): Promise<ShopBrandStockResponse> => {
      const params = new URLSearchParams();

      if (filters.searchTerm) {
        params.append('searchTerm', filters.searchTerm);
      }
      if (filters.selectedLocation) {
        params.append('selectedLocation', filters.selectedLocation);
      }

      if (filters.category) {
        params.append('category', filters.category);
      }
      // Default to 30 days if not specified
      params.append('daysBack', (filters.daysBack || 30).toString());

      if (filters.limit !== undefined) {
        params.append('limit', filters.limit.toString());
      }
      if (filters.offset !== undefined) {
        params.append('offset', filters.offset.toString());
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      // const response = await fetch(`${API_BASE_URL}/api/stocks/shop-brand-stock?${params.toString()}`, {
      //   headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      // });
      const response = await fetch(`${API_BASE_URL}/api/stocks/shop-brand-stock?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) {
        throw new Error('Failed to fetch shop-brand stock data');
      }

      const result: ShopBrandStockResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch shop-brand stock data');
      }
    
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
