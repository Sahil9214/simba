import { axiosInstance } from "@/lib/axios";
import { apiEndPoints } from "@/lib/axios/axios.endpoint";
import { useQuery } from "@tanstack/react-query"

// const fetchStaffPersonData = async (startDate?: string, endDate?: string) => {
//   try {
//     let url = `${API_BASE_URL}/api/staff-pl/staff`;
//     const params = new URLSearchParams();
//     if (startDate) params.append('startDate', startDate);
//     if (endDate) params.append('endDate', endDate);
//     if (params.toString()) url += `?${params.toString()}`;

//     const response = await fetch(url,
//       {
//         headers: {
//           "Authorization": `Bearer ${token}`
//         }
//       }
//     );
//     const data = await response.json();
//     return data
//   } catch (error) {
//     throw error
//   }
// }

const fetchStaffPersonData = async (startDate?: string, endDate?: string) => {
  const response = await axiosInstance.get(
    apiEndPoints.salesEmployeeData.staffPersonData(startDate, endDate)
  );
  return response.data;
}


export const useGetStaffPerson = (startDate?: string, endDate?: string) => {
  return useQuery(
    {
      queryKey: ["listOfStaff", startDate, endDate],
      queryFn: () => fetchStaffPersonData(startDate, endDate),
      staleTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  )
}



const fetchStaffDataById = async (staffId: string, startDate?: string, endDate?: string, category?: string) => {
  try {
    const response = await axiosInstance.get(
      apiEndPoints.salesEmployeeData.staffDetail(staffId, { startDate, endDate, category })
    );
    return response.data?.data;
  } catch (error) {
    throw error;
  }
}


export const useFetchStaffDataById = (staffId: string, enabled: boolean, startDate?: string, endDate?: string, category?: string) => {
  return useQuery({
    queryKey: ['staffPersonById', staffId, startDate, endDate, category],
    queryFn: () => fetchStaffDataById(staffId, startDate, endDate, category),
    enabled: enabled && !!staffId, // Only fetch when enabled is true AND staffId exists
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000)
  })
}



//for header of the sales-employee (stafff overview)
const fetchStaffMemeberOverall = async (staffId: string, startDate?: string, endDate?: string, category?: string) => {
  try {
    const response = await axiosInstance.get(
      apiEndPoints.salesEmployeeData.staffOverview(staffId, { startDate, endDate, category })
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}


export const useFetchStaffMemberOverall = (staffId: string, startDate?: string, endDate?: string, category?: string) => {
  return (
    useQuery({
      queryKey: ['fetchStaffMemeberOverall', staffId, startDate, endDate, category],
      queryFn: () => fetchStaffMemeberOverall(staffId, startDate, endDate, category),
      staleTime: 5 * 60 * 1000,
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000)
    })
  )
}





//for table Data

const fetchMarketShare = async ({
  date,
  staffId,
  dpCode,
  category,
  searchTerm,
  page = 1,
  limit = 2
}: {
  date: string;
  staffId: string;
  dpCode?: string;
  category?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}) => {

  try {
    const sanitizedDpCode = dpCode && dpCode !== 'all' ? dpCode : undefined;
    const sanitizedCategory = category && category.toLowerCase() !== 'all' ? category : undefined;
    const trimmedSearchTerm = searchTerm?.trim();

    const response = await axiosInstance.get(
      apiEndPoints.salesEmployeeData.marketShare({
        month: date,
        user: staffId,
        dpCode: sanitizedDpCode,
        category: sanitizedCategory,
        search: trimmedSearchTerm ? trimmedSearchTerm : undefined,

        includeBenchmark: true
      })
    );
    /// page , limit
    return response.data;
  } catch (error) {
    console.error(error, "Market share api error")
    throw error;
  }
}

export const useMarketShareComprehensive = ({
  date,
  staffId,
  dpCode,
  category,
  searchTerm,
  page = 1,
  limit = 2,
  enabled = true
}: {
  date: string;
  staffId: string;
  dpCode?: string;
  category?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
  enabled: boolean
}) => {
  return useQuery({
    queryKey: ['fetch-market-share', date, staffId, dpCode, category, searchTerm, page, limit],
    queryFn: () => fetchMarketShare({ date, staffId, dpCode, category, searchTerm, page, limit }),
    staleTime: 5 * 60 * 60 * 1000,
    retry: 10,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000),
    enabled,

  })
}
