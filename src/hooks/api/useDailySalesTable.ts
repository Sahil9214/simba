import { axiosInstance } from "@/lib/axios"
import { apiEndPoints } from "@/lib/axios/axios.endpoint"
import { useQuery } from "@tanstack/react-query"

interface DailySalesTableParams {
  searchTerm?: string;
  reported_by?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

const fetchDailySalesTable = async (params?: DailySalesTableParams) => {
  const response = await axiosInstance.get(apiEndPoints.dailySalesTable.dailyTableData(params))
  return response.data
}

// Export function to fetch all data without pagination
export const fetchAllDailySalesTableData = async () => {
  const response = await axiosInstance.get(apiEndPoints.dailySalesTable.dailyTableData({}))
  return response.data
}

export const fetchExportDailyReportTableData = async (
  startDate?: string,
  endDate?: string
) => {
  const params =
    startDate && endDate
      ? { startDate, endDate }
      : undefined;

  const response = await axiosInstance.get(
    apiEndPoints.dailySalesTable.exportData, // ✅ only URL
    {
      params, // ✅ axios handles query string
      timeout: 300000,
      responseType: "json",
    }
  );

  return response.data;
};


export const useFetchDailyReportTableData = (params?: DailySalesTableParams) => {
  return useQuery({
    queryKey: ['daily-sales-report-table', params],
    queryFn: () => fetchDailySalesTable(params),
    retry: 3,
    staleTime: 5 * 60 * 1000,
  })
}
export const useExportDailyReportTableData = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['daily-sales-report-export', startDate, endDate],
    queryFn: () => fetchExportDailyReportTableData(startDate, endDate),
    retry: 2, // Reduce retries for large exports
    staleTime: 5 * 60 * 1000,
    enabled: false, // Manual trigger only for exports
    gcTime: 0, // Don't cache export data (was cacheTime in v4)
  })
}

