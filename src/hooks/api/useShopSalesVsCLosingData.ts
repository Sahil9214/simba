import { useState as useLocalState, useCallback as useLocalCallback, useEffect } from 'react';
import { ShopSalesVsClosingData } from "@/lib/types/dashboard.types";
import { DUMMY_SHOP_SALES_VS_CLOSING } from "@/lib/constants/dummyData";

export const useShopSalesVsClosingData = ({ searchTerm, selectedLocation, dateRange, category }: { searchTerm?: string; selectedLocation?: string; dateRange?: { start: string; end: string }; category?: string }) => {
  const [data, setData] = useLocalState<ShopSalesVsClosingData[] | null>(null);
  const [isLoading, setIsLoading] = useLocalState(false);
  const [isError, setIsError] = useLocalState(false);
  const [error, setError] = useLocalState<Error | null>(null);

  const fetchData = useLocalCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedLocation) params.append('selectedLocation', selectedLocation);
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }
      if (category) params.append('category', category);

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const response = await fetch(`${API_BASE_URL}/api/dashboard/shop-sales-vs-closing?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      if (!result.success || !result.data) {
        setData(DUMMY_SHOP_SALES_VS_CLOSING as unknown as ShopSalesVsClosingData[]);
      } else {
        setData(result.data);
      }
    } catch (err) {
      console.warn("Using dummy data fallback for shop sales vs closing:", err);
      setData(DUMMY_SHOP_SALES_VS_CLOSING as unknown as ShopSalesVsClosingData[]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedLocation, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchData
  };
};
