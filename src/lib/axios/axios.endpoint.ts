import { partialMatchKey } from "@tanstack/react-query";

type QueryValue = string | number | undefined | null | boolean;

const buildQueryString = (params: Record<string, QueryValue>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const serializedValue = String(value).trim();
      if (serializedValue.length > 0) {
        searchParams.append(key, serializedValue);
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const apiEndPoints = {
  inventoryModule: {
    inventoryData: (product: string, page: number, search: string) => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (product && product.trim()) {
        params.append('category', product);
      }
      if (search && search.trim()) {
        params.append('searchTerm', search);
      }
      return `/api/inventory/by-shop?${params.toString()}`;
    }
  },
  userMappingModule: {
    shopDetail: `/api/admin/staff-shop-manage/users?role=staff`, // For GET list
    upload: `/api/admin/staff-shop-manage/upload`,
    assign: `/api/admin/staff-shop-manage/assign`,
    userShops: (id: string) => `/api/admin/staff-shop-manage/user/${id}/shops`
  },
  salesEmployeeData: {
    staffPersonData: (startDate?: string, endDate?: string) => {
      return `/api/staff-pl/staff${buildQueryString({ startDate, endDate })}`;
    },
    staffDetail: (
      staffId: string,
      params?: { startDate?: string; endDate?: string; category?: string }
    ) => `/api/staff-pl/${staffId}${buildQueryString(params ?? {})}`,
    staffOverview: (
      staffId: string,
      params?: { startDate?: string; endDate?: string; category?: string }
    ) => `/api/staff-pl/${staffId}/overview${buildQueryString(params ?? {})}`,
    marketShare: (params: {
      month: string;
      user: string;
      dpCode?: string;
      category?: string;
      search?: string;
      page?: number;
      limit?: number;
      includeBenchmark?: boolean
    }) => `/api/market-share/comprehensive${buildQueryString(params)}`,

  },
  dailySalesTable: {
    dailyTableData: (params: any) => `/api/reports/daily/sales${buildQueryString(params)}`,
    exportData: "/api/reports/daily/export",
    },
  staff: {
    allShops: (debouncedSearch: string) => `/api/seller/shop?searchTerm=${debouncedSearch}&is_active=true`,
    shopRecentVisitDetail: (shopId: string, lastVistedDate: string) => `/api/seller/report/daily?shopId=${shopId}&reportDate=${lastVistedDate}`,
    updateStockData: `/api/seller/daily-stocks`,
    sellerProfile: `/api/seller/profile`
  },
  userMapping: {
    deleteUser: (userId: string) => `/api/auth/users/${userId}`,
    updateUserToggleStatus: (userId: string) => `/api/auth/users/${userId}`,
    updateUser: (userId: string) => `/api/auth/users/${userId}`
  },
  uploadCenter: {
    deleteFile: (fileId: string) => `/api/upload/${fileId}`,
    ocrReviewData: (sessionId: string) => `/api/upload-sessions/${sessionId}/review`,
  },
  demandBySku: (params: any) => `/api/demand/by-sku-date-range${params}`,
  salesByPackSize: (params: any) => `/api/demand/sales-pack-size-date-range?${params}`,
  topShops: (params: any) => {
    // params already includes ? from buildQueryString, so use it directly
    return `/api/dashboard/top-shops-service${params}`;
  },
  topProducts: (params: any) => {
    // params already includes ? from buildQueryString, so use it directly
    return `/api/dashboard/top-products-service${params}`;
  },
  salesVsClosing: (params: any) => `/api/dashboard/sales-vs-closing?${params}`,
  peerComparison: (params: any) => `/api/dashboard/peer-comparison?${params}`,
  dashboardMatric: (params: string) => `/api/dashboard/metrics${params}`,
  reportingGaps: (params: any) => `/api/dashboard/reporting-gaps${params}`,
  listOfAllShop:`/api/shops`,
  listOfAllSkus:`/api/skus`,
  skuById: (id: string) => `/api/skus/${id}`,
  inventorySync: `/api/inventory/sync`,

}
