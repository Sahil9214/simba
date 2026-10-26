import { useQuery } from '@tanstack/react-query';
import { SellerProfileClientService, sellerProfileClientService, SellerProfileData } from '@/lib/services/seller.client';


/**
 * Query keys for seller profile
 */
export const SELLER_PROFILE_KEYS = {
  profile: ['seller', 'profile'] as const,
} as const;

/**
 * Hook for fetching seller profile data
 * @returns React Query result with seller profile data
 */
export function useSellerProfile() {
  return useQuery({
    queryKey: SELLER_PROFILE_KEYS.profile,
    queryFn: async () => {
      return await SellerProfileClientService.getSellerProfile();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching seller profile data with custom options
 * @param options - Custom query options
 * @returns React Query result with seller profile data
 */
export function useSellerProfileWithOptions(options: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: SELLER_PROFILE_KEYS.profile,
    queryFn: async () => {
      return await SellerProfileClientService.getSellerProfile()
    },
    enabled: options.enabled ?? true,
    refetchInterval: options.refetchInterval,
    staleTime: options.staleTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
