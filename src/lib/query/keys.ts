/**
 * Centralized query key factory
 * Provides type-safe, consistent query key patterns across all hooks
 */

// Base query key factory type
type QueryKeyFactory<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
  ? T[K]
  : T[K] extends readonly any[]
  ? T[K]
  : never;
};

// Query key factory function
export const createQueryKeys = <T extends Record<string, any>>(
  namespace: string,
  keys: T
): QueryKeyFactory<T> & { _namespace: string } => {
  const result = {} as any;

  // Add namespace for debugging
  result._namespace = namespace;

  // Process each key
  for (const [key, value] of Object.entries(keys)) {
    if (typeof value === 'function') {
      // Function-based key factory
      result[key] = (...args: any[]) => [namespace, key, ...args] as const;
    } else if (Array.isArray(value)) {
      // Array-based key
      result[key] = [namespace, key, ...value] as const;
    }
  }

  return result;
};

// Standard query key patterns used across hooks
export const DASHBOARD_KEYS = createQueryKeys('dashboard', {
  all: () => [],
  metrics: (filters: any) => [filters],
  peerComparison: (filters: any) => [filters],
  reportingGaps: (filters: any) => [filters],
  salesVsClosing: (filters: any) => [filters],
  topProducts: (filters: any, limit: number) => [filters, limit],
  topShops: (filters: any, limit: number) => [filters, limit],
  dpCodesPieChart: (filters: any) => [filters],
  demandBySku: (filters: any) => [filters],
  salesByPackSize: (filters: any) => [filters],
});

export const HEATMAP_KEYS = createQueryKeys('heatmap', {
  all: () => [],
  data: (filters: any) => [filters],
  summary: (filters: any) => [filters],
  trends: (location: string, type: string, filters: any) => [location, type, filters],
  clustering: (filters: any) => [filters],
  realtime: (filters: any) => [filters],
});

export const SALES_KEYS = createQueryKeys('sales', {
  all: () => [],
  metrics: (filters: any) => [filters],
  byPeriod: (period: string, filters: any) => [period, filters],
  byCategory: (filters: any) => [filters],
  comparison: (type: string, filters: any) => [type, filters],
  seasonal: (filters: any) => [filters],
  segmentation: (filters: any) => [filters],
  forecasting: (filters: any) => [filters],
  performance: (filters: any) => [filters],
  trends: (filters: any) => [filters],
});

export const BREAKAGE_KEYS = createQueryKeys('breakage', {
  all: () => [],
  statistics: (filters: any) => [filters],
  alerts: (filters: any) => [filters],
  prevention: (filters: any) => [filters],
  trends: (filters: any) => [filters],
});

export const AI_UPLOAD_KEYS = createQueryKeys('aiUpload', {
  all: () => [],
  sessions: () => [],
  session: (id: string) => [id],
  progress: (sessionId: string) => [sessionId],
  analytics: (timeRange: string, uploadedBy?: string) => [timeRange, uploadedBy],
  queue: () => [],
  batch: (batchId: string) => [batchId],
});

export const FILE_UPLOAD_KEYS = createQueryKeys('fileUpload', {
  all: () => [],
  uploadSessions: () => [],
  uploadSession: (id: string) => [id],
  files: (bucket: string, directory?: string) => [bucket, directory],
});

export const MONITORING_KEYS = createQueryKeys('monitoring', {
  all: () => [],
  health: () => [],
  components: () => [],
  alerts: () => [],
  metrics: (timeRange: string) => [timeRange],
});

// Utility to invalidate all queries for a namespace
export const getNamespacePattern = (namespace: string) => [namespace];

// Type helper for query key factories
export type QueryKeyFactoryResult<T> = T extends (...args: any[]) => infer R ? R : never;
