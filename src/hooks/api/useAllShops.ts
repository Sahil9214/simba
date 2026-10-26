import { axiosInstance } from '@/lib/axios';
import { apiEndPoints } from '@/lib/axios/axios.endpoint';
import { useMutation, useQuery } from '@tanstack/react-query';

interface Shop {
  id: string;
  shop_name: string;
  dp_code: string;
  state: string;
  district: string;
  address: string;
  contact_info?: any;
  is_active: boolean;
}

interface AllShopsResponse {
  success: boolean;
  data: Shop[];
  count: number;
}


async function staffPanelAllShops(debouncedSearch: string) {
  const response = await axiosInstance.get(apiEndPoints.staff.allShops(debouncedSearch));

  return response.data
}




export function useAllShops(debouncedSearch: string) {
  return useQuery<AllShopsResponse>({
    queryKey: ['all-shops', debouncedSearch],
    queryFn: () => staffPanelAllShops(debouncedSearch),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

async function staffPanelShopDetail(shopId: string, lastVistedDate: string) {
  const response = await axiosInstance.get(apiEndPoints.staff.shopRecentVisitDetail(shopId, lastVistedDate));
  return response.data
}


export function useStaffPanelShopDetail(shopId: string, lastVistedDate: string, enabled: boolean = true) {
  return (
    useQuery({
      queryKey: ['staff-panel-shopDetail-by-id', shopId, lastVistedDate],
      queryFn: () => staffPanelShopDetail(shopId, lastVistedDate),
      retry: 3,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      enabled: enabled && !!shopId && !!lastVistedDate, // Only run query when enabled and params are available
    })
  )
}


async function postUpdateStaffData(payload: any) {
  const response = await axiosInstance.post(apiEndPoints.staff.updateStockData, payload);
  return response.data;
}


export const useUpdateStaffData = () => {
  return (
    useMutation({
      mutationKey: ['update-edit-stock-data'],
      mutationFn: (payload: any) => postUpdateStaffData(payload)
    })
  )
}
