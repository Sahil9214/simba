import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CriticalIssue, CriticalIssuesFilters, CriticalIssuesResponse } from '../../lib/services/criticalIssues.service';
import { CriticalIssuesClientService } from '../../lib/services/criticalIssues.client';

// Query Keys
export const CRITICAL_ISSUES_QUERY_KEYS = {
  all: ['critical-issues'] as const,
  lists: () => [...CRITICAL_ISSUES_QUERY_KEYS.all, 'list'] as const,
  list: (filters: CriticalIssuesFilters) => [...CRITICAL_ISSUES_QUERY_KEYS.lists(), filters] as const,
  details: () => [...CRITICAL_ISSUES_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CRITICAL_ISSUES_QUERY_KEYS.details(), id] as const,
  stats: () => [...CRITICAL_ISSUES_QUERY_KEYS.all, 'stats'] as const,
} as const;

// API Functions (now using client service)
async function fetchCriticalIssues(filters: CriticalIssuesFilters = {}): Promise<CriticalIssuesResponse> {
  return CriticalIssuesClientService.getCriticalIssues(filters);
}

async function fetchCriticalIssueById(id: string): Promise<CriticalIssue> {
  return CriticalIssuesClientService.getCriticalIssueById(id);
}

async function fetchCriticalIssuesStats(): Promise<{
  totalIssues: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  averageDaysStuck: number;
  categories: Record<string, number>;
}> {
  return CriticalIssuesClientService.getCriticalIssuesStats();
}

async function updateCriticalIssue({ id, updates }: { id: string; updates: Partial<CriticalIssue> }): Promise<CriticalIssue> {
  return CriticalIssuesClientService.updateCriticalIssue(id, updates);
}

async function createCriticalIssue(issue: Omit<CriticalIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<CriticalIssue> {
  return CriticalIssuesClientService.createCriticalIssue(issue);
}

async function deleteCriticalIssue(id: string): Promise<void> {
  return CriticalIssuesClientService.deleteCriticalIssue(id);
}

// Hooks
export function useCriticalIssues(filters: CriticalIssuesFilters = {}) {
  return useQuery({
    queryKey: CRITICAL_ISSUES_QUERY_KEYS.list(filters),
    queryFn: () => fetchCriticalIssues(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

export function useCriticalIssue(id: string) {
  return useQuery({
    queryKey: CRITICAL_ISSUES_QUERY_KEYS.detail(id),
    queryFn: () => fetchCriticalIssueById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCriticalIssuesStats() {
  return useQuery({
    queryKey: CRITICAL_ISSUES_QUERY_KEYS.stats(),
    queryFn: fetchCriticalIssuesStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: true,
  });
}

export function useUpdateCriticalIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCriticalIssue,
    onSuccess: (data, variables) => {
      // Invalidate and refetch critical issues list
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.lists() });
      
      // Update specific critical issue in cache
      queryClient.setQueryData(CRITICAL_ISSUES_QUERY_KEYS.detail(variables.id), data);
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Critical issue update error:', error);
    },
  });
}

export function useCreateCriticalIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCriticalIssue,
    onSuccess: (data) => {
      // Invalidate and refetch critical issues list
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.lists() });
      
      // Add new critical issue to cache
      queryClient.setQueryData(CRITICAL_ISSUES_QUERY_KEYS.detail(data.id), data);
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Critical issue creation error:', error);
    },
  });
}

export function useDeleteCriticalIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCriticalIssue,
    onSuccess: (_, variables) => {
      // Invalidate and refetch critical issues list
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.lists() });
      
      // Remove critical issue from cache
      queryClient.removeQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.detail(variables) });
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: CRITICAL_ISSUES_QUERY_KEYS.stats() });
    },
    onError: (error) => {
      console.error('Critical issue deletion error:', error);
    },
  });
}

// Utility Hooks
export function useCriticalIssuesPagination(filters: CriticalIssuesFilters, pageSize: number = 20) {
  const currentPage = Math.floor((filters.offset || 0) / pageSize) + 1;

  const queryResult = useCriticalIssues(filters);

  const nextPage = () => {
    const newOffset = (filters.offset || 0) + pageSize;
    return { ...filters, offset: newOffset, limit: pageSize };
  };

  const previousPage = () => {
    const newOffset = Math.max((filters.offset || 0) - pageSize, 0);
    return { ...filters, offset: newOffset, limit: pageSize };
  };

  const goToPage = (page: number) => {
    const newOffset = (page - 1) * pageSize;
    return { ...filters, offset: newOffset, limit: pageSize };
  };

  return {
    ...queryResult,
    pagination: {
      currentPage,
      pageSize,
      totalPages: queryResult.data?.pagination.totalPages || 0,
      nextPage,
      previousPage,
      goToPage,
      hasNextPage: currentPage < (queryResult.data?.pagination.totalPages || 0),
      hasPreviousPage: currentPage > 1,
    },
  };
}

export function useCriticalIssuesFiltered(baseFilters: CriticalIssuesFilters = {}) {
  const queryClient = useQueryClient();

  const applyFilter = (newFilters: Partial<CriticalIssuesFilters>) => {
    const combinedFilters = { ...baseFilters, ...newFilters, offset: 0 }; // Reset to first page
    
    // Prefetch the new query
    queryClient.prefetchQuery({
      queryKey: CRITICAL_ISSUES_QUERY_KEYS.list(combinedFilters),
      queryFn: () => fetchCriticalIssues(combinedFilters),
      staleTime: 2 * 60 * 1000,
    });

    return combinedFilters;
  };

  const clearFilters = () => {
    const clearedFilters = { limit: baseFilters.limit || 20 };
    
    // Prefetch the cleared query
    queryClient.prefetchQuery({
      queryKey: CRITICAL_ISSUES_QUERY_KEYS.list(clearedFilters),
      queryFn: () => fetchCriticalIssues(clearedFilters),
      staleTime: 2 * 60 * 1000,
    });

    return clearedFilters;
  };

  return {
    applyFilter,
    clearFilters,
  };
}

// Export types for convenience
export type {
  CriticalIssue,
  CriticalIssuesFilters,
  CriticalIssuesResponse,
};