import { useQuery, useQueryClient } from "@tanstack/react-query";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

const fetchRiskAndAlert = async () => {

  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/daily`);
    if (!response.ok) {
      throw new Error(`Failed to fetch risk and alert: ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
}


export function useRiskAndAlert() {
  const queryClient = useQueryClient(); // ✅ get query client instance

  return useQuery({
    queryKey: ['risk-and-alert'],
    queryFn: fetchRiskAndAlert,
    staleTime: 1000 * 60 * 5,
  });
}
