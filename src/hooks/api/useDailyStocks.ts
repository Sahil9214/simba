import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DailyStocksClientService } from '@/lib/services/dailyStocks.client'
import { DailyStock, DailyStockInsert, DailyStockUpdate } from '@/lib/types/database.types'

// Query keys for consistent caching
export const dailyStocksKeys = {
  all: ['dailyStocks'] as const,
  lists: () => [...dailyStocksKeys.all, 'list'] as const,
  list: (filters: any) => [...dailyStocksKeys.lists(), filters] as const,
  details: () => [...dailyStocksKeys.all, 'detail'] as const,
  detail: (id: string) => [...dailyStocksKeys.details(), id] as const,
  byDate: (date: string, shopId?: string) => [...dailyStocksKeys.all, 'byDate', date, shopId] as const,
  byShop: (shopId: string, dateFrom?: string, dateTo?: string) => 
    [...dailyStocksKeys.all, 'byShop', shopId, dateFrom, dateTo] as const,
  bySKU: (skuId: string, dateFrom?: string, dateTo?: string) => 
    [...dailyStocksKeys.all, 'bySKU', skuId, dateFrom, dateTo] as const,
  latest: (shopId: string, skuId: string) => 
    [...dailyStocksKeys.all, 'latest', shopId, skuId] as const,
  summary: (filters: any) => [...dailyStocksKeys.all, 'summary', filters] as const,
  breakage: (filters: any) => [...dailyStocksKeys.all, 'breakage', filters] as const,
  trends: (shopId: string, skuId: string, days: number) => 
    [...dailyStocksKeys.all, 'trends', shopId, skuId, days] as const,
  missing: (date: string, shopIds: string[], skuIds: string[]) => 
    [...dailyStocksKeys.all, 'missing', date, shopIds, skuIds] as const,
  compliance: (dateFrom: string, dateTo: string) => 
    [...dailyStocksKeys.all, 'compliance', dateFrom, dateTo] as const,
}

/**
 * Hook to get daily stocks with optional filtering
 * @param filters - Optional filters for daily stocks
 * @returns Query result with daily stocks data
 * 
 * @example
 * ```tsx
 * const { data: stocks, isLoading, error } = useDailyStocks({
 *   shop_id: 'shop123',
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useDailyStocks = (filters?: {
  shop_id?: string
  sku_id?: string
  report_date?: string
  date_from?: string
  date_to?: string
  reported_by?: string
  has_breakage?: boolean
}) => {
  return useQuery({
    queryKey: dailyStocksKeys.list(filters),
    queryFn: () => DailyStocksClientService.getDailyStocks(filters),
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get a single daily stock record by ID
 * @param stockId - Daily stock ID
 * @param enabled - Whether the query should run
 * @returns Query result with daily stock data
 * 
 * @example
 * ```tsx
 * const { data: stock, isLoading } = useDailyStock(stockId)
 * ```
 */
export const useDailyStock = (stockId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: dailyStocksKeys.detail(stockId),
    queryFn: () => DailyStocksClientService.getDailyStockById(stockId),
    enabled: enabled && !!stockId,
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get latest stock for a specific shop and SKU
 * @param shopId - Shop ID
 * @param skuId - SKU ID
 * @param enabled - Whether the query should run
 * @returns Query result with latest stock data
 * 
 * @example
 * ```tsx
 * const { data: latestStock } = useLatestStock('shop123', 'sku456')
 * ```
 */
export const useLatestStock = (shopId: string, skuId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: dailyStocksKeys.latest(shopId, skuId),
    queryFn: () => DailyStocksClientService.getLatestStock(shopId, skuId),
    enabled: enabled && !!shopId && !!skuId,
    staleTime: 0, // Always fresh for latest stock
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get daily stocks for a specific date
 * @param date - Date in YYYY-MM-DD format
 * @param shopId - Optional shop ID filter
 * @returns Query result with daily stocks data
 * 
 * @example
 * ```tsx
 * const { data: stocksToday } = useStocksByDate('2024-01-15', 'shop123')
 * ```
 */
export const useStocksByDate = (date: string, shopId?: string) => {
  return useQuery({
    queryKey: dailyStocksKeys.byDate(date, shopId),
    queryFn: () => DailyStocksClientService.getStocksByDate(date, shopId),
    enabled: !!date,
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get stocks by shop for a date range
 * @param shopId - Shop ID
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Query result with shop stocks data
 * 
 * @example
 * ```tsx
 * const { data: shopStocks } = useStocksByShop('shop123', '2024-01-01', '2024-01-31')
 * ```
 */
export const useStocksByShop = (shopId: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: dailyStocksKeys.byShop(shopId, dateFrom, dateTo),
    queryFn: () => DailyStocksClientService.getStocksByShop(shopId, dateFrom, dateTo),
    enabled: !!shopId,
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get stocks by SKU across all shops
 * @param skuId - SKU ID
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Query result with SKU stocks data
 * 
 * @example
 * ```tsx
 * const { data: skuStocks } = useStocksBySKU('sku456', '2024-01-01', '2024-01-31')
 * ```
 */
export const useStocksBySKU = (skuId: string, dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: dailyStocksKeys.bySKU(skuId, dateFrom, dateTo),
    queryFn: () => DailyStocksClientService.getStocksBySKU(skuId, dateFrom, dateTo),
    enabled: !!skuId,
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get stock summary for a date range
 * @param filters - Optional filters
 * @returns Query result with stock summary
 * 
 * @example
 * ```tsx
 * const { data: summary } = useStockSummary({
 *   date_from: '2024-01-01',
 *   date_to: '2024-01-31'
 * })
 * ```
 */
export const useStockSummary = (filters?: {
  date_from?: string
  date_to?: string
  shop_id?: string
  sku_id?: string
}) => {
  return useQuery({
    queryKey: dailyStocksKeys.summary(filters),
    queryFn: () => DailyStocksClientService.getStockSummary(filters),
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get breakage analysis
 * @param filters - Optional filters
 * @returns Query result with breakage data
 * 
 * @example
 * ```tsx
 * const { data: breakageData } = useBreakageAnalysis({
 *   date_from: '2024-01-01',
 *   min_breakage: 5
 * })
 * ```
 */
export const useBreakageAnalysis = (filters?: {
  date_from?: string
  date_to?: string
  shop_id?: string
  min_breakage?: number
}) => {
  return useQuery({
    queryKey: dailyStocksKeys.breakage(filters),
    queryFn: () => DailyStocksClientService.getBreakageAnalysis(filters),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get stock trends for a shop/SKU combination
 * @param shopId - Shop ID
 * @param skuId - SKU ID
 * @param days - Number of days to analyze
 * @returns Query result with trend data
 * 
 * @example
 * ```tsx
 * const { data: trends } = useStockTrends('shop123', 'sku456', 30)
 * ```
 */
export const useStockTrends = (shopId: string, skuId: string, days: number = 30) => {
  return useQuery({
    queryKey: dailyStocksKeys.trends(shopId, skuId, days),
    queryFn: () => DailyStocksClientService.getStockTrends(shopId, skuId, days),
    enabled: !!shopId && !!skuId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get missing reports
 * @param date - Date to check
 * @param expectedShopIds - Expected shop IDs
 * @param expectedSKUIds - Expected SKU IDs
 * @returns Query result with missing reports
 * 
 * @example
 * ```tsx
 * const { data: missingReports } = useMissingReports(
 *   '2024-01-15',
 *   ['shop1', 'shop2'],
 *   ['sku1', 'sku2']
 * )
 * ```
 */
export const useMissingReports = (
  date: string,
  expectedShopIds: string[],
  expectedSKUIds: string[]
) => {
  return useQuery({
    queryKey: dailyStocksKeys.missing(date, expectedShopIds, expectedSKUIds),
    queryFn: () => DailyStocksClientService.getMissingReports(date, expectedShopIds, expectedSKUIds),
    enabled: !!date && expectedShopIds.length > 0 && expectedSKUIds.length > 0,
    staleTime: 0, // Always fresh for instant updates
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

/**
 * Hook to get reporting compliance
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Query result with compliance data
 * 
 * @example
 * ```tsx
 * const { data: compliance } = useReportingCompliance('2024-01-01', '2024-01-31')
 * ```
 */
export const useReportingCompliance = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: dailyStocksKeys.compliance(dateFrom, dateTo),
    queryFn: () => DailyStocksClientService.getReportingCompliance(dateFrom, dateTo),
    enabled: !!dateFrom && !!dateTo,
    staleTime: 10 * 60 * 1000, // 10 minutes for compliance reports
  })
}

// Mutation hooks

/**
 * Hook to create a new daily stock record
 * @returns Mutation object for creating daily stocks
 * 
 * @example
 * ```tsx
 * const createStockMutation = useCreateDailyStock()
 * 
 * const handleCreate = (stockData: DailyStockInsert) => {
 *   createStockMutation.mutate(stockData, {
 *     onSuccess: (stock) => {
 *       toast.success('Stock record created successfully')
 *     }
 *   })
 * }
 * ```
 */
export const useCreateDailyStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: DailyStocksClientService.createDailyStock,
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: dailyStocksKeys.all })
      toast.success('Stock record created successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create stock record'
      toast.error(message)
    },
  })
}

/**
 * Hook to update a daily stock record
 * @returns Mutation object for updating daily stocks
 * 
 * @example
 * ```tsx
 * const updateStockMutation = useUpdateDailyStock()
 * 
 * const handleUpdate = (stockId: string, updates: DailyStockUpdate) => {
 *   updateStockMutation.mutate({ stockId, updates })
 * }
 * ```
 */
export const useUpdateDailyStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ stockId, updates }: { stockId: string; updates: DailyStockUpdate }) =>
      DailyStocksClientService.updateDailyStock(stockId, updates),
    onSuccess: (data) => {
      // Update the specific stock in cache
      queryClient.setQueryData(dailyStocksKeys.detail(data.id), data)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: dailyStocksKeys.lists() })
      toast.success('Stock record updated successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update stock record'
      toast.error(message)
    },
  })
}

/**
 * Hook to delete a daily stock record
 * @returns Mutation object for deleting daily stocks
 * 
 * @example
 * ```tsx
 * const deleteStockMutation = useDeleteDailyStock()
 * 
 * const handleDelete = (stockId: string) => {
 *   deleteStockMutation.mutate(stockId)
 * }
 * ```
 */
export const useDeleteDailyStock = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: DailyStocksClientService.deleteDailyStock,
    onSuccess: (_, stockId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: dailyStocksKeys.detail(stockId) })
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: dailyStocksKeys.lists() })
      toast.success('Stock record deleted successfully')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete stock record'
      toast.error(message)
    },
  })
}

/**
 * Hook to bulk create daily stock records
 * @returns Mutation object for bulk creating daily stocks
 * 
 * @example
 * ```tsx
 * const bulkCreateMutation = useBulkCreateDailyStocks()
 * 
 * const handleBulkCreate = (stocks: DailyStockInsert[]) => {
 *   bulkCreateMutation.mutate(stocks)
 * }
 * ```
 */
export const useBulkCreateDailyStocks = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: DailyStocksClientService.bulkCreateDailyStocks,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dailyStocksKeys.all })
      toast.success(`Successfully created ${data.length} stock records`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create stock records'
      toast.error(message)
    },
  })
}