import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  dailyReportsClientService,
  DailyReport,
  DailyReportFilters,
  DailyReportsResponse,
  DailyReportsSummary
} from '@/lib/services/dailyReports.client';

/**
 * Query keys for daily reports data
 */
export const DAILY_REPORTS_KEYS = {
  all: () => ['daily-reports'] as const,
  lists: () => [...DAILY_REPORTS_KEYS.all(), 'list'] as const,
  list: (filters: DailyReportFilters) => [...DAILY_REPORTS_KEYS.lists(), filters] as const,
  detail: (id: string) => [...DAILY_REPORTS_KEYS.all(), 'detail', id] as const,
  summary: (filters: Partial<DailyReportFilters>) => [...DAILY_REPORTS_KEYS.all(), 'summary', filters] as const,
} as const;

/**
 * Hook for fetching daily reports list
 */
export function useDailyReports(filters: DailyReportFilters = {}) {
  return useQuery({
    queryKey: DAILY_REPORTS_KEYS.list(filters),
    queryFn: () => dailyReportsClientService.getDailyReports(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  });
}

/**
 * Hook for fetching daily reports summary
 */
export function useDailyReportsSummary(filters: Partial<DailyReportFilters> = {}) {
  return useQuery({
    queryKey: DAILY_REPORTS_KEYS.summary(filters),
    queryFn: () => dailyReportsClientService.getDailyReportsSummary(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 3,
  });
}

/**
 * Hook for fetching a single daily report by ID
 */
export function useDailyReportById(id: string) {
  return useQuery({
    queryKey: DAILY_REPORTS_KEYS.detail(id),
    queryFn: () => dailyReportsClientService.getDailyReportById(id),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
    retry: 2,
  });
}

/**
 * Hook for creating a daily report
 */
export function useCreateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>) =>
      dailyReportsClientService.createDailyReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_REPORTS_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to create daily report:', error);
    },
  });
}

/**
 * Hook for updating a daily report
 */
export function useUpdateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DailyReport> }) =>
      dailyReportsClientService.updateDailyReport(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: DAILY_REPORTS_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: DAILY_REPORTS_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to update daily report:', error);
    },
  });
}

/**
 * Hook for deleting a daily report
 */
export function useDeleteDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dailyReportsClientService.deleteDailyReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DAILY_REPORTS_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete daily report:', error);
    },
  });
}

/**
 * Hook for daily reports cache management
 */
export function useDailyReportsCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: DAILY_REPORTS_KEYS.all() });
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: DAILY_REPORTS_KEYS.all() });
  }, [queryClient]);

  const prefetchDailyReports = useCallback((filters: DailyReportFilters = {}) => {
    return queryClient.prefetchQuery({
      queryKey: DAILY_REPORTS_KEYS.list(filters),
      queryFn: () => dailyReportsClientService.getDailyReports(filters),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    clearCache,
    invalidateCache,
    prefetchDailyReports,
  };
}

// Export types for external use
export type {
  DailyReport,
  DailyReportFilters,
  DailyReportsResponse,
  DailyReportsSummary
};
