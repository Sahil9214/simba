/**
 * Query utilities barrel export
 * Central export point for all query-related utilities
 */

// Configuration utilities
export { QUERY_CONFIGS, getQueryConfig, createQueryConfig } from './config';
export type { QueryConfigType } from './config';

// Query key factories
export {
  createQueryKeys,
  DASHBOARD_KEYS,
  HEATMAP_KEYS,
  SALES_KEYS,
  BREAKAGE_KEYS,
  AI_UPLOAD_KEYS,
  MONITORING_KEYS,
  getNamespacePattern,
} from './keys';
export type { QueryKeyFactoryResult } from './keys';

// Hook utilities
export {
  useStandardQuery,
  useStandardMutation,
  useQueryFilters,
  useRealtimeQuery,
  usePaginatedQuery,
} from './hooks';