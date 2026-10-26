/**
 * Shared hook utilities for common React Query patterns
 * Reduces boilerplate and ensures consistency across all hooks
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getQueryConfig, QueryConfigType } from './config';

// Enhanced query hook with standard configurations
export function useStandardQuery<TData, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options: {
    configType?: QueryConfigType;
    enabled?: boolean;
    select?: (data: TData) => any;
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
    showErrorToast?: boolean;
  } & Partial<UseQueryOptions<TData, TError>> = {}
) {
  const {
    configType = 'analytics',
    enabled = true,
    select,
    onSuccess,
    onError,
    showErrorToast = true,
    ...customOptions
  } = options;

  const config = getQueryConfig(configType);

  return useQuery({
    queryKey,
    queryFn,
    enabled,
    select,
    ...config,
    ...customOptions,
    // Note: onSuccess and onError were removed in React Query v5
    // Error handling should be done using useEffect or other patterns
  });
}

// Enhanced mutation hook with standard error handling
export function useStandardMutation<TData, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    invalidateQueries?: readonly unknown[][];
  } & Partial<UseMutationOptions<TData, TError, TVariables>> = {}
) {
  const queryClient = useQueryClient();

  const {
    onSuccess,
    onError,
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    invalidateQueries = [],
    ...customOptions
  } = options;

  return useMutation({
    mutationFn,
    ...customOptions,
    onSuccess: (data: TData, variables: TVariables) => {
      // Show success toast
      if (showSuccessToast) {
        toast.success(successMessage);
      }

      // Invalidate related queries
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      // Call custom success handler
      onSuccess?.(data, variables);
    },
    onError: (error: TError, variables: TVariables) => {
      // Show error toast
      if (showErrorToast) {
        const message = error instanceof Error ? error.message : 'Operation failed';
        toast.error(message);
      }

      // Call custom error handler
      onError?.(error, variables);
    },
  });
}

// Hook for managing filters with query integration
export function useQueryFilters<T extends Record<string, any>>(
  initialFilters: T,
  options: {
    debounceMs?: number;
    syncWithURL?: boolean;
  } = {}
) {
  const { debounceMs = 300, syncWithURL = false } = options;

  // State management for filters
  const [filters, setFilters] = useState(initialFilters);

  // Debounced filters for query optimization
  const debouncedFilters = useMemo(() => {
    // Implementation would use a debounce utility
    return filters;
  }, [filters]);

  // Filter update utilities
  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Clear individual filter
  const clearFilter = useCallback((key: keyof T) => {
    setFilters(prev => ({ ...prev, [key]: initialFilters[key] }));
  }, [initialFilters]);

  return {
    filters: debouncedFilters,
    rawFilters: filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters: useMemo(
      () => JSON.stringify(filters) !== JSON.stringify(initialFilters),
      [filters, initialFilters]
    ),
  };
}

// Hook for managing real-time data updates
export function useRealtimeQuery<TData, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options: {
    realtimeEnabled?: boolean;
    interval?: number;
    onUpdate?: (data: TData) => void;
    visibilityRefetch?: boolean;
  } & Parameters<typeof useStandardQuery>[2] = {}
) {
  const {
    realtimeEnabled = true,
    interval = 30000, // 30 seconds
    onUpdate,
    visibilityRefetch = true,
    ...queryOptions
  } = options;

  const query = useStandardQuery(
    queryKey,
    queryFn,
    {
      configType: 'realtime',
      refetchInterval: realtimeEnabled ? interval : false,
      refetchOnWindowFocus: visibilityRefetch,
      ...queryOptions,
      // Note: onSuccess removed for React Query v5 compatibility
    }
  );

  // Manual refresh capability
  const refresh = useCallback(() => {
    query.refetch();
  }, [query]);

  // Toggle real-time updates
  const toggleRealtime = useCallback(() => {
    // This would update the refetch interval
    // Implementation depends on specific requirements
  }, []);

  return {
    ...query,
    refresh,
    toggleRealtime,
    isRealtime: realtimeEnabled,
    lastUpdate: query.dataUpdatedAt,
  };
}

// Hook for managing paginated queries
export function usePaginatedQuery<TData, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: (page: number, pageSize: number) => Promise<{ data: TData[]; total: number; hasMore: boolean }>,
  options: {
    initialPage?: number;
    pageSize?: number;
    keepPreviousData?: boolean;
  } & Parameters<typeof useStandardQuery>[2] = {}
) {
  const {
    initialPage = 1,
    pageSize = 20,
    keepPreviousData = true,
    ...queryOptions
  } = options;

  const [page, setPage] = useState(initialPage);

  const query = useStandardQuery(
    [...queryKey, page, pageSize],
    () => queryFn(page, pageSize),
    {
      // Note: keepPreviousData removed for React Query v5 compatibility
      ...queryOptions,
    }
  );

  const nextPage = useCallback(() => {
    if ((query.data as any)?.hasMore) {
      setPage(prev => prev + 1);
    }
  }, [(query.data as any)?.hasMore]);

  const previousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((targetPage: number) => {
    setPage(Math.max(1, targetPage));
  }, []);

  const resetPage = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    ...query,
    page,
    pageSize,
    totalItems: (query.data as any)?.total ?? 0,
    hasNextPage: (query.data as any)?.hasMore ?? false,
    hasPreviousPage: page > 1,
    nextPage,
    previousPage,
    goToPage,
    resetPage,
  };
}

// Add missing useState import
import { useState } from 'react';