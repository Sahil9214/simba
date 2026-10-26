/**
 * Shared React Query configuration utilities
 * Eliminates duplication across hook files
 */

// Standard query configurations
export const QUERY_CONFIGS = {
  // Instant updates - always fresh data (inventory, stocks, real-time dashboards)
  fresh: {
    staleTime: 0, // Always consider stale for instant updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // No polling, rely on invalidation
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Short-lived data (dashboard metrics, real-time updates)
  realtime: {
    staleTime: 0, // Always consider stale
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 1000, // 30 seconds for real-time data
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Medium-lived data (analytics, reports)
  analytics: {
    staleTime: 30 * 1000, // 30 seconds (reduced for faster updates)
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchInterval: 2 * 60 * 1000, // 2 minutes (reduced from 15)
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Long-lived data (user data, settings, reference data)
  stable: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: false, // No automatic refetch
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },

  // Background data (non-critical updates)
  background: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchInterval: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(2000 * 2 ** attemptIndex, 60000),
  },
} as const;

// Configuration selection helper
export type QueryConfigType = keyof typeof QUERY_CONFIGS;

export const getQueryConfig = (type: QueryConfigType) => QUERY_CONFIGS[type];

// Custom configuration merger
export const createQueryConfig = (
  baseType: QueryConfigType,
  overrides: Partial<typeof QUERY_CONFIGS.realtime> = {}
) => ({
  ...QUERY_CONFIGS[baseType],
  ...overrides,
});