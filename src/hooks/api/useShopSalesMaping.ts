import { showToast } from "@/components/ui/toast";
import { axiosInstance } from "@/lib/axios";
import { apiEndPoints } from "@/lib/axios/axios.endpoint";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// --- API Functions ---

// 1. Fetch Shop Detail
export const fetchShopDetail = async ({
  search = "",
  limit = 50,
  offset = 0,
}: {
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await axiosInstance.get(
    apiEndPoints.userMappingModule.shopDetail,
    { params: { search, limit, offset } },
  );
  return response.data;
};

// 2. Upload Sales Mapping
const uploadSalesMapping = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post(
    apiEndPoints.userMappingModule.upload,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

// 3. Get Assigned Shops (Common function for both hooks)
const fetchAssignedShops = async ({
  id,
  search = "",
  limit = 30,
  offset = 0,
}: {
  id: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await axiosInstance.get(
    apiEndPoints.userMappingModule.userShops(id),
    {
      params: { search , limit, offset },
    },
  );
  return response.data;
};

// 4. Assign Shop
const assignShop = async ({
  userId,
  shopId,
}: {
  userId: string;
  shopId: string;
}) => {
  const response = await axiosInstance.post(
    apiEndPoints.userMappingModule.assign,
    { userId, shopId },
  );
  return response.data;
};

// 5. Unassign Shop
const unassignShop = async ({
  userId,
  shopId,
}: {
  userId: string;
  shopId: string;
}) => {
  const response = await axiosInstance.delete(
    apiEndPoints.userMappingModule.assign,
    { data: { userId, shopId } },
  );
  return response.data;
};

// --- Hooks ---

export const useGetShopsDetail = ({
  headerData,
}: {
  headerData: { salesPerson: string; search: string };
}) => {
  const { salesPerson, search } = headerData;
  return useQuery({
    queryKey: ["get-shop-sales-maping", salesPerson, search],
    queryFn: () => fetchShopDetail({ search: search, limit: 50, offset: 0 }),
    staleTime: 5 * 60 * 1000,
  });
};

export const useShopSalesMaping = () => {
  return useMutation({
    mutationFn: uploadSalesMapping,
    onSuccess: (data) => data?.summary,
    onError: (error: any) => {
      console.error("Error", error);
      showToast("error", error?.response?.data?.error || "Upload failed");
    },
  });
};

export const useGetAssignedShopsDetailById = () => {
  return useMutation({
    mutationFn: fetchAssignedShops,
  });
};

export const useAssignShopToUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignShop,
    onSuccess: () => {
      // Invalidate market share queries to reflect new shop assignments
      queryClient.invalidateQueries({
        queryKey: ["fetch-market-share"],
      });
    },
    onError: (error: any) => {
      console.error("Error assigning shop:", error);
    },
  });
};

export const useUnassignShopFromUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unassignShop,
    onSuccess: () => {
      // Invalidate market share queries to reflect shop unassignments
      queryClient.invalidateQueries({
        queryKey: ["fetch-market-share"],
      });
    },
    onError: (error: any) => {
      console.error("Error unassigning shop:", error);
    },
  });
};

// Enhanced hook same as useGetAssignedShopsDetailById but cleaner
export const useGetAssignedShopsDetailByIdWithPagination = () => {
  return useMutation({
    mutationFn: fetchAssignedShops,
  });
};
