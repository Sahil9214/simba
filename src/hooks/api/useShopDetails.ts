import { useQuery } from '@tanstack/react-query';
import { ShopDetailClientService, shopDetailClientService, ShopDetailData } from '@/lib/services/shopDetail.client';
import { ShopDetailPageClientService } from '@/lib/services/shopDetailPage.client';

export const SHOP_DETAILS_KEYS = {
  details: (dpCode: string) => ['shop', 'details', dpCode] as const,
  images: (dpCode: string) => ['shop', 'images', dpCode] as const,
} as const;

export function useShopDetails(dpCode: string) {
  return useQuery({
    queryKey: SHOP_DETAILS_KEYS.details(dpCode),
    queryFn: async () => {
      return await ShopDetailClientService.getShopDetails(dpCode);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!dpCode,
  });
}

export function useShopImages(dpCode: string) {
  return useQuery({
    queryKey: SHOP_DETAILS_KEYS.images(dpCode),
    queryFn: async () => {
      return await ShopDetailClientService.getShopImages(dpCode);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!dpCode,
  });
}
