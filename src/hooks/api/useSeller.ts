import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

async function sellerProductInputFields(
  shopName: string,
  category: string,
  productName: string,
) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://3.91.17.245:4000";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/seller/product/${shopName}/${category}/product/${productName}`,
      {
        headers: { Authorization: `Bearer ${token}` || "" },
      },
    );
    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching seller product input fields:", error);
    return null;
  }
}

async function sellerProductsList(categorySlug: string) {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://3.91.17.245:4000";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/seller/products/names/${categorySlug}`,
      {
        headers: { Authorization: `Bearer ${token}` || "" },
      },
    );
    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching seller products list:", error);
    return null;
  }
}

export function useSellerProductsList(categorySlug: string) {
  return useQuery({
    queryKey: ["seller", "products", "names", categorySlug],
    queryFn: () => sellerProductsList(categorySlug),
    enabled: !!categorySlug,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
export function useSellerProductNameByInput(
  shopName: string,
  category: string,
  productName: string,
) {
  return useQuery({
    queryKey: [
      "seller",
      "product",
      "name",
      "input",
      shopName,
      category,
      productName,
    ],
    queryFn: () => sellerProductInputFields(shopName, category, productName),
    enabled: true,
    retry: 3,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

//Post request for post the data if user fill the input field

async function staffMemberFillSKuInputListing(
  stockData: any,
  skuId: string,
  shopInfo: any,
) {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://3.91.17.245:4000";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const productStockData = stockData[skuId];

    await fetch(`${API_BASE_URL}/api/seller/daily-stocks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        shopId: shopInfo?.id,
        skuId,
        reportDate: new Date().toISOString().split("T")[0],
        openingStock: productStockData.openingStock,
        closingStock: productStockData.closingStock,
        breakage: productStockData.breakage,
        notes: productStockData.notes,
        availability: productStockData.availability,
        demand: parseInt(productStockData.demand as any) || 0,
      }),
    });
  } catch (error) {
    throw error;
  }
}

export const useStaffMemberFillSKuInputListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      stockData,
      skuId,
      shopInfo,
      shopName,
      category,
      productName,
    }: {
      stockData: any;
      skuId: string;
      shopInfo: any;
      shopName?: string;
      category?: string;
      productName?: string;
    }) => staffMemberFillSKuInputListing(stockData, skuId, shopInfo),
    onSuccess: (data, variables) => {
      // Invalidate the product details query to refetch updated data
      if (variables.shopName && variables.category && variables.productName) {
        queryClient.invalidateQueries({
          queryKey: [
            "seller",
            "product",
            "name",
            "input",
            variables.shopName,
            variables.category,
            variables.productName,
          ],
        });
      }

      // Invalidate the products list query to refresh the list
      if (variables.category) {
        queryClient.invalidateQueries({
          queryKey: ["seller", "products", "names", variables.category],
        });
      }

      // Also invalidate all seller product queries to ensure all related data is refreshed
      queryClient.invalidateQueries({
        queryKey: ["seller", "product"],
      });

      return data;
    },
    onError: (error) => {
      console.error("&&& error &&&", error);
      return error;
    },
  });
};

//hadnleExport in seller

async function handleExportSeller() {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://3.91.17.245:4000";
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    const response = await fetch(
      `${API_BASE_URL}/api/reports/staff/export?format=json&dataType=all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {}
}

export const useSellerExportData = () => {
  return useQuery({
    queryKey: ["export-report"],
    queryFn: () => handleExportSeller(),
    enabled: false, // Disable automatic fetching - only fetch on demand
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
