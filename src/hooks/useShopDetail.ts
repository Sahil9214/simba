import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ImageListData,
  ImageUploadData,
  ShopDetailData,
  ShopDetailClientService,
} from "@/lib/services/shopDetail.client";
import {
  createShop,
  fetchAllShopList,
  CreateShopPayload,
  ShopListItem,
  updateShop,
  deleteShop,
} from "@/lib/services/shop.services";

interface ShopListResponse {
  success: boolean;
  data: ShopListItem[];
  count?: number;
}

interface UseShopDetailOptions {
  enabled?: boolean;
}

export const useShopDetail = (
  dpCode: string | null | undefined,
  options?: UseShopDetailOptions
) => {
  const enabled = !!dpCode && (options?.enabled ?? true);

  return useQuery<ShopDetailData>({
    queryKey: ["shop-detail", dpCode],
    enabled,
    queryFn: async () => {
      if (!dpCode) {
        throw new Error("DP code is required to fetch shop details");
      }
      return ShopDetailClientService.getShopDetails(dpCode);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

interface UseShopImagesOptions {
  enabled?: boolean;
}

export const useShopImages = (
  dpCode: string | null | undefined,
  options?: UseShopImagesOptions
) => {
  const enabled = !!dpCode && (options?.enabled ?? true);

  return useQuery<ImageListData>({
    queryKey: ["shop-images", dpCode],
    enabled,
    queryFn: async () => {
      if (!dpCode) {
        throw new Error("DP code is required to fetch shop images");
      }
      return ShopDetailClientService.getShopImages(dpCode);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useUploadShopImage = (dpCode: string | null | undefined) => {
  const queryClient = useQueryClient();

  return useMutation<ImageUploadData, Error, File>({
    mutationKey: ["upload-shop-image", dpCode],
    mutationFn: async (file: File) => {
      if (!dpCode) {
        throw new Error("DP code is required to upload image");
      }
      return ShopDetailClientService.uploadImage(dpCode, file);
    },
    onSuccess: () => {
      if (dpCode) {
        queryClient.invalidateQueries({
          queryKey: ["shop-images", dpCode],
        });
      }
    },
  });
};

export const useShopList = (searchTerm: string) => {
  return useQuery<ShopListResponse>({
    queryKey: ["admin-shop-list", searchTerm],
    queryFn: async () => {
      const res = await fetchAllShopList(searchTerm);
      return res as ShopListResponse;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, CreateShopPayload>({
    mutationKey: ["admin-create-shop"],
    mutationFn: async (payload: CreateShopPayload) => {
      return createShop(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-list"] });
    },
  });
};

export const useUpdateShopMeta = () => {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    {
      id: string;
      payload: {
        shop_name?: string;
        original_dp_code?: string;
        state?: string;
        district?: string;
        vendor_code?: string;
        address?: string;
        contact_info?: string;
        alternate_names?: string[];
        is_active?: boolean;
      };
    }
  >({
    mutationKey: ["admin-update-shop"],
    mutationFn: async ({ id, payload }) => {
      return updateShop(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-list"] });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, string>({
    mutationKey: ["admin-delete-shop"],
    mutationFn: async (id: string) => {
      return deleteShop(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shop-list"] });
    },
  });
};

