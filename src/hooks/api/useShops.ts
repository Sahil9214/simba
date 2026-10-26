import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ShopsClientService } from '@/lib/services/shops.client'
import { Shop, ShopInsert, ShopUpdate } from '@/lib/types/database.types'

// Query keys for consistent caching
export const shopsKeys = {
  all: ['shops'] as const,
  lists: () => [...shopsKeys.all, 'list'] as const,
  list: (filters: any) => [...shopsKeys.lists(), filters] as const,
  details: () => [...shopsKeys.all, 'detail'] as const,
  detail: (id: string) => [...shopsKeys.details(), id] as const,
  locations: () => [...shopsKeys.all, 'locations'] as const,
  states: () => [...shopsKeys.locations(), 'states'] as const,
  districts: (state: string) => [...shopsKeys.locations(), 'districts', state] as const,
  search: (term: string) => [...shopsKeys.all, 'search', term] as const,
}

/**
 * Hook to get all shops with optional filtering
 * @param filters - Optional filters for shops
 * @returns Query result with shops data
 * 
 * @example
 * ```tsx
 * const { data: shops, isLoading, error } = useShops({
 *   state: 'Maharashtra',
 *   is_active: true
 * })
 * ```
 */
export const useShops = (filters?: {
  state?: string
  district?: string
  is_active?: boolean
  search?: string
}) => {
  return useQuery({
    queryKey: shopsKeys.list(filters),
    queryFn: () => ShopsClientService.getShops(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get a single shop by ID
 * @param shopId - Shop ID
 * @param enabled - Whether the query should run
 * @returns Query result with shop data
 * 
 * @example
 * ```tsx
 * const { data: shop, isLoading } = useShop(shopId)
 * ```
 */
export const useShop = (shopId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: shopsKeys.detail(shopId),
    queryFn: () => ShopsClientService.getShopById(shopId),
    enabled: enabled && !!shopId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get shop by DP code
 * @param dpCode - DP code to search for
 * @param enabled - Whether the query should run
 * @returns Query result with shop data
 * 
 * @example
 * ```tsx
 * const { data: shop } = useShopByDpCode('DP001')
 * ```
 */
export const useShopByDpCode = (dpCode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['shop', 'dpCode', dpCode],
    queryFn: () => ShopsClientService.getShopByDpCode(dpCode),
    enabled: enabled && !!dpCode,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get shops by location
 * @param state - State name
 * @param district - District name (optional)
 * @returns Query result with shops data
 * 
 * @example
 * ```tsx
 * const { data: shops } = useShopsByLocation('Maharashtra', 'Mumbai')
 * ```
 */
export const useShopsByLocation = (state: string, district?: string) => {
  return useQuery({
    queryKey: ['shops', 'location', state, district],
    queryFn: () => ShopsClientService.getShopsByLocation(state, district),
    enabled: !!state,
    staleTime: 10 * 60 * 1000, // 10 minutes (locations don't change frequently)
  })
}

/**
 * Hook to get all unique states
 * @returns Query result with states array
 * 
 * @example
 * ```tsx
 * const { data: states } = useStates()
 * ```
 */
export const useStates = () => {
  return useQuery({
    queryKey: shopsKeys.states(),
    queryFn: ShopsClientService.getStates,
    staleTime: 30 * 60 * 1000, // 30 minutes (states rarely change)
  })
}

/**
 * Hook to get districts for a specific state
 * @param state - State name
 * @returns Query result with districts array
 * 
 * @example
 * ```tsx
 * const { data: districts } = useDistricts('Maharashtra')
 * ```
 */
export const useDistricts = (state: string) => {
  return useQuery({
    queryKey: shopsKeys.districts(state),
    queryFn: () => ShopsClientService.getDistrictsByState(state),
    enabled: !!state,
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook to search shops
 * @param searchTerm - Search term
 * @param limit - Maximum results
 * @returns Query result with search results
 * 
 * @example
 * ```tsx
 * const { data: searchResults } = useShopSearch(searchTerm, 5)
 * ```
 */
export const useShopSearch = (searchTerm: string, limit: number = 10) => {
  return useQuery({
    queryKey: shopsKeys.search(searchTerm),
    queryFn: () => ShopsClientService.searchShops(searchTerm, limit),
    enabled: searchTerm.length >= 2, // Only search with 2+ characters
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  })
}

/**
 * Hook to get shops with user count
 * @returns Query result with shops and user counts
 * 
 * @example
 * ```tsx
 * const { data: shopsWithUsers } = useShopsWithUserCount()
 * ```
 */
export const useShopsWithUserCount = () => {
  return useQuery({
    queryKey: ['shops', 'withUserCount'],
    queryFn: ShopsClientService.getShopsWithUserCount,
    staleTime: 5 * 60 * 1000,
  })
}

// Mutation hooks

/**
 * Hook to create a new shop
 * @returns Mutation object for creating shops
 * 
 * @example
 * ```tsx
 * const createShopMutation = useCreateShop()
 * 
 * const handleCreate = (shopData: ShopInsert) => {
 *   createShopMutation.mutate(shopData, {
 *     onSuccess: (shop) => {
 *       toast.success(`Shop ${shop.shop_name} created successfully`)
 *     }
 *   })
 * }
 * ```
 */
export const useCreateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ShopsClientService.createShop,
    onSuccess: (data) => {
      // Invalidate and refetch shops queries
      queryClient.invalidateQueries({ queryKey: shopsKeys.all })
      toast.success(`Shop "${data.shop_name}" created successfully`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create shop'
      toast.error(message)
    },
  })
}

/**
 * Hook to update a shop
 * @returns Mutation object for updating shops
 * 
 * @example
 * ```tsx
 * const updateShopMutation = useUpdateShop()
 * 
 * const handleUpdate = (shopId: string, updates: ShopUpdate) => {
 *   updateShopMutation.mutate({ shopId, updates })
 * }
 * ```
 */
export const useUpdateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ shopId, updates }: { shopId: string; updates: ShopUpdate }) =>
      ShopsClientService.updateShop(shopId, updates),
    onSuccess: (data) => {
      // Update the specific shop in cache
      queryClient.setQueryData(shopsKeys.detail(data.id), data)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: shopsKeys.lists() })
      toast.success(`Shop "${data.shop_name}" updated successfully`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update shop'
      toast.error(message)
    },
  })
}

/**
 * Hook to deactivate a shop
 * @returns Mutation object for deactivating shops
 * 
 * @example
 * ```tsx
 * const deactivateShopMutation = useDeactivateShop()
 * 
 * const handleDeactivate = (shopId: string) => {
 *   deactivateShopMutation.mutate(shopId)
 * }
 * ```
 */
export const useDeactivateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ShopsClientService.deactivateShop,
    onSuccess: (data) => {
      queryClient.setQueryData(shopsKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: shopsKeys.lists() })
      toast.success(`Shop "${data.shop_name}" deactivated`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to deactivate shop'
      toast.error(message)
    },
  })
}

/**
 * Hook to reactivate a shop
 * @returns Mutation object for reactivating shops
 * 
 * @example
 * ```tsx
 * const reactivateShopMutation = useReactivateShop()
 * 
 * const handleReactivate = (shopId: string) => {
 *   reactivateShopMutation.mutate(shopId)
 * }
 * ```
 */
export const useReactivateShop = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ShopsClientService.reactivateShop,
    onSuccess: (data) => {
      queryClient.setQueryData(shopsKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: shopsKeys.lists() })
      toast.success(`Shop "${data.shop_name}" reactivated`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to reactivate shop'
      toast.error(message)
    },
  })
}

/**
 * Hook to bulk import shops
 * @returns Mutation object for bulk importing shops
 * 
 * @example
 * ```tsx
 * const bulkImportMutation = useBulkImportShops()
 * 
 * const handleImport = (shops: ShopInsert[]) => {
 *   bulkImportMutation.mutate(shops)
 * }
 * ```
 */
export const useBulkImportShops = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ShopsClientService.bulkImportShops,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shopsKeys.all })
      toast.success(`Successfully imported ${data.length} shops`)
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to import shops'
      toast.error(message)
    },
  })
}