import { axiosInstance } from '@/lib/axios';
import { apiEndPoints } from '@/lib/axios/axios.endpoint';
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Direct seller profile hook without service layer
 */

async function fetchSellerProfile() {
  const response = await axiosInstance(apiEndPoints.staff.sellerProfile);
  return response.data?.data
}

export function useSellerProfileDirect() {
  return useQuery({
    queryKey: ['seller', 'profile', 'direct'],
    queryFn: () => fetchSellerProfile(),
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 10 * 1000, // 10 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
