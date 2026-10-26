import { axiosInstance } from "@/lib/axios";
import { apiEndPoints } from "@/lib/axios/axios.endpoint";
import { useQuery } from "@tanstack/react-query";

async function fetchInventoryDataByShop(product: string, page = 1, searchTerm: string) {
  try {
    const response = await axiosInstance.get(apiEndPoints.inventoryModule.inventoryData(product, page, searchTerm));
    // Return both data and pagination metadata
    return {
      data: response?.data?.data || [],
      total: response?.data?.total || 0,
      pagination: response?.data?.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      }
    };
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
}

export const useFetchInventoryDataByShop = (product: string, page = 1, searchTerm: string) => {
  return useQuery({
    queryKey: ['fetch-inventory-shop', product, page, searchTerm],
    queryFn: () => fetchInventoryDataByShop(product, page, searchTerm),
    enabled: true, // Always enabled, backend will handle empty params
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // Always fresh for instant updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}


