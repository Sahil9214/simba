import { useQuery } from '@tanstack/react-query';
import { ShopDetailPageClientService } from '@/lib/services/shopDetailPage.client';

export const SHOP_DETAIL_PAGE_KEYS = {
  detailPage: (dpCode: string) => ['shop', 'detail-page', dpCode] as const,
} as const;

export function useShopDetailPage(dpCode: string) {
  return useQuery({
    queryKey: SHOP_DETAIL_PAGE_KEYS.detailPage(dpCode),
    queryFn: async () => {
      return await ShopDetailPageClientService.getShopDetailPageData(dpCode);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!dpCode,
  });
}
