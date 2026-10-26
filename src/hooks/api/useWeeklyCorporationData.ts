import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  weeklyCorporationDataClientService,
  WeeklySalesFilters,
  WeeklySalesAggregation,
  WeeklyShopPerformance,
  WeeklyProductPerformance
} from '@/lib/services/weeklyCorporationData.client';
import {
  WeeklyCorporationData,
  WeeklyCorporationDataInsert,
  WeeklyCorporationDataUpdate
} from '@/lib/types/database.types';

// Query keys for consistent caching
export const weeklyCorporationDataKeys = {
  all: ['weeklyCorporationData'] as const,
  lists: () => [...weeklyCorporationDataKeys.all, 'list'] as const,
  list: (filters: WeeklySalesFilters) => [...weeklyCorporationDataKeys.lists(), filters] as const,
  details: () => [...weeklyCorporationDataKeys.all, 'detail'] as const,
  detail: (id: string) => [...weeklyCorporationDataKeys.details(), id] as const,
  aggregation: (filters: WeeklySalesFilters) => [...weeklyCorporationDataKeys.all, 'aggregation', filters] as const,
  shopPerformance: (filters: WeeklySalesFilters) => [...weeklyCorporationDataKeys.all, 'shopPerformance', filters] as const,
  productPerformance: (filters: WeeklySalesFilters) => [...weeklyCorporationDataKeys.all, 'productPerformance', filters] as const,
  salesTrends: (filters: WeeklySalesFilters) => [...weeklyCorporationDataKeys.all, 'salesTrends', filters] as const,
};

/**
 * Hook to get weekly corporation data with optional filtering
 * @param filters - Optional filters for weekly data
 * @returns Query result with weekly corporation data
 *
 * @example
 * ```tsx
 * const { data: weeklyData, isLoading, error } = useWeeklyCorporationData({
 *   shop_id: 'shop123',
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useWeeklyCorporationData = (filters: WeeklySalesFilters = {}) => {
  return useQuery({
    queryKey: weeklyCorporationDataKeys.list(filters),
    queryFn: () => weeklyCorporationDataClientService.getWeeklyData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (weekly data doesn't change frequently)
  });
};

/**
 * Hook to get weekly sales aggregation
 * @param filters - Optional filters for aggregation
 * @returns Query result with aggregated sales data
 *
 * @example
 * ```tsx
 * const { data: aggregation, isLoading } = useWeeklySalesAggregation({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useWeeklySalesAggregation = (filters: WeeklySalesFilters = {}) => {
  return useQuery({
    queryKey: weeklyCorporationDataKeys.aggregation(filters),
    queryFn: () => weeklyCorporationDataClientService.getWeeklySalesAggregation(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get weekly shop performance
 * @param filters - Optional filters for shop performance
 * @returns Query result with shop performance data
 *
 * @example
 * ```tsx
 * const { data: shopPerformance, isLoading } = useWeeklyShopPerformance({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useWeeklyShopPerformance = (filters: WeeklySalesFilters = {}) => {
  return useQuery({
    queryKey: weeklyCorporationDataKeys.shopPerformance(filters),
    queryFn: () => weeklyCorporationDataClientService.getWeeklyShopPerformance(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get weekly product performance
 * @param filters - Optional filters for product performance
 * @returns Query result with product performance data
 *
 * @example
 * ```tsx
 * const { data: productPerformance, isLoading } = useWeeklyProductPerformance({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useWeeklyProductPerformance = (filters: WeeklySalesFilters = {}) => {
  return useQuery({
    queryKey: weeklyCorporationDataKeys.productPerformance(filters),
    queryFn: () => weeklyCorporationDataClientService.getWeeklyProductPerformance(filters),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to get sales trends over time
 * @param filters - Optional filters for trends
 * @returns Query result with sales trends data
 *
 * @example
 * ```tsx
 * const { data: salesTrends, isLoading } = useSalesTrends({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useSalesTrends = (filters: WeeklySalesFilters = {}) => {
  return useQuery({
    queryKey: weeklyCorporationDataKeys.salesTrends(filters),
    queryFn: () => weeklyCorporationDataClientService.getSalesTrends(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks

/**
 * Hook to create a new weekly corporation data record
 * @returns Mutation object for creating weekly data
 *
 * @example
 * ```tsx
 * const createWeeklyDataMutation = useCreateWeeklyCorporationData()
 *
 * const handleCreate = (data: WeeklyCorporationDataInsert) => {
 *   createWeeklyDataMutation.mutate(data, {
 *     onSuccess: (weeklyData) => {
 *       toast.success('Weekly data created successfully')
 *     }
 *   })
 * }
 * ```
 */
export const useCreateWeeklyCorporationData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weeklyCorporationDataClientService.createWeeklyData.bind(weeklyCorporationDataClientService),
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: weeklyCorporationDataKeys.all });
      toast.success('Weekly data created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create weekly data';
      toast.error(message);
    },
  });
};

/**
 * Hook to update a weekly corporation data record
 * @returns Mutation object for updating weekly data
 *
 * @example
 * ```tsx
 * const updateWeeklyDataMutation = useUpdateWeeklyCorporationData()
 *
 * const handleUpdate = (id: string, updates: WeeklyCorporationDataUpdate) => {
 *   updateWeeklyDataMutation.mutate({ id, updates })
 * }
 * ```
 */
export const useUpdateWeeklyCorporationData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: WeeklyCorporationDataUpdate }) =>
      weeklyCorporationDataClientService.updateWeeklyData(id, updates),
    onSuccess: (data) => {
      // Update the specific record in cache
      queryClient.setQueryData(weeklyCorporationDataKeys.detail(data.id), data);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: weeklyCorporationDataKeys.lists() });
      toast.success('Weekly data updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update weekly data';
      toast.error(message);
    },
  });
};

/**
 * Hook to delete a weekly corporation data record
 * @returns Mutation object for deleting weekly data
 *
 * @example
 * ```tsx
 * const deleteWeeklyDataMutation = useDeleteWeeklyCorporationData()
 *
 * const handleDelete = (id: string) => {
 *   deleteWeeklyDataMutation.mutate(id)
 * }
 * ```
 */
export const useDeleteWeeklyCorporationData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => weeklyCorporationDataClientService.deleteWeeklyData(id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: weeklyCorporationDataKeys.detail(id) });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: weeklyCorporationDataKeys.lists() });
      toast.success('Weekly data deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete weekly data';
      toast.error(message);
    },
  });
};

/**
 * Hook to bulk create weekly corporation data records
 * @returns Mutation object for bulk creating weekly data
 *
 * @example
 * ```tsx
 * const bulkCreateMutation = useBulkCreateWeeklyCorporationData()
 *
 * const handleBulkCreate = (records: WeeklyCorporationDataInsert[]) => {
 *   bulkCreateMutation.mutate(records)
 * }
 * ```
 */
export const useBulkCreateWeeklyCorporationData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: weeklyCorporationDataClientService.bulkCreateWeeklyData.bind(weeklyCorporationDataClientService),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: weeklyCorporationDataKeys.all });
      toast.success(`Successfully created ${data?.length || 0} weekly data records`);
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create weekly data records';
      toast.error(message);
    },
  });
};

/**
 * Combined hook for dashboard-specific weekly data
 * @param filters - Optional filters
 * @returns Object with all dashboard-relevant weekly data
 *
 * @example
 * ```tsx
 * const {
 *   data: { aggregation, shopPerformance, productPerformance, salesTrends },
 *   isLoading,
 *   error
 * } = useWeeklyDashboardData({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useWeeklyDashboardData = (filters: WeeklySalesFilters = {}) => {
  const aggregationQuery = useWeeklySalesAggregation(filters);
  const shopPerformanceQuery = useWeeklyShopPerformance(filters);
  const productPerformanceQuery = useWeeklyProductPerformance(filters);
  const salesTrendsQuery = useSalesTrends(filters);

  const isLoading = aggregationQuery.isLoading ||
                   shopPerformanceQuery.isLoading ||
                   productPerformanceQuery.isLoading ||
                   salesTrendsQuery.isLoading;

  const isError = aggregationQuery.isError ||
                  shopPerformanceQuery.isError ||
                  productPerformanceQuery.isError ||
                  salesTrendsQuery.isError;

  const error = aggregationQuery.error ||
                shopPerformanceQuery.error ||
                productPerformanceQuery.error ||
                salesTrendsQuery.error;

  return {
    data: {
      aggregation: aggregationQuery.data,
      shopPerformance: shopPerformanceQuery.data,
      productPerformance: productPerformanceQuery.data,
      salesTrends: salesTrendsQuery.data,
    },
    isLoading,
    isError,
    error,
    refetch: () => Promise.all([
      aggregationQuery.refetch(),
      shopPerformanceQuery.refetch(),
      productPerformanceQuery.refetch(),
      salesTrendsQuery.refetch(),
    ]),
  };
};