/**
 * Error Boundaries Index
 * Main exports for the error boundary system
 */

// Core Components
export { BaseErrorBoundary, withErrorBoundary, useErrorBoundary } from './BaseErrorBoundary';
export { ErrorFallbackUI, MinimalErrorFallback, ErrorAwareLoading } from './ErrorFallbackUI';

// Specialized Error Boundaries
export { DashboardErrorBoundary, withDashboardErrorBoundary } from './DashboardErrorBoundary';
export { ChartErrorBoundary, withChartErrorBoundary } from './ChartErrorBoundary';
export { DataErrorBoundary, withDataErrorBoundary, useDataErrorHandling } from './DataErrorBoundary';
export { UploadErrorBoundary, withUploadErrorBoundary } from './UploadErrorBoundary';

// Context and Hooks
export { ErrorProvider, useErrorContext, useErrorHandler } from './ErrorContext';

// Types
export type {
  ErrorSeverity,
  ErrorCategory,
  RetryStrategy,
  ErrorDetails,
  RetryConfig,
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorReportingConfig,
  ErrorRecoveryOptions,
  ErrorMetrics,
  ErrorNotification,
  ErrorContextValue
} from './types';

// Utilities
export {
  generateErrorId,
  createErrorDetails,
  calculateRetryDelay,
  shouldRetry,
  ErrorLogger,
  PerformanceMonitor,
  NetworkMonitor,
  getUserFriendlyMessage
} from './utils';

export {
  ErrorClassification,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_ERROR_REPORTING_CONFIG
} from './types';

// Pre-configured Error Boundaries for common use cases
import { withErrorBoundary } from './BaseErrorBoundary';
import { withChartErrorBoundary } from './ChartErrorBoundary';
import { withDataErrorBoundary } from './DataErrorBoundary';
import { withUploadErrorBoundary } from './UploadErrorBoundary';
import { withDashboardErrorBoundary } from './DashboardErrorBoundary';

/**
 * Quick configuration for analytics components
 */
export const withAnalyticsErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) =>
  withErrorBoundary(Component, {
    level: 'feature',
    enableLogging: true,
    enableTelemetry: true,
    retryConfig: {
      maxAttempts: 3,
      strategy: 'exponential',
      baseDelay: 2000,
      maxDelay: 10000,
      backoffMultiplier: 2
    }
  });

/**
 * Quick configuration for API components
 */
export const withApiErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  queryKeys?: string[][]
) =>
  withDataErrorBoundary(Component, {
    queryKeys,
    enableOfflineMode: true,
    cacheStrategy: 'normal'
  });

/**
 * Quick configuration for chart components
 */
export const withRechartsErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  chartTitle?: string
) =>
  withChartErrorBoundary(Component, {
    chartType: 'bar',
    chartTitle,
    showFallbackChart: true
  });

/**
 * Quick configuration for file upload components
 */
export const withFileUploadErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  acceptedTypes?: string[],
  maxSize?: number
) =>
  withUploadErrorBoundary(Component, {
    uploadType: 'multiple',
    acceptedFileTypes: acceptedTypes || ['.xlsx', '.csv', '.json'],
    maxFileSize: maxSize || 10 * 1024 * 1024 // 10MB default
  });

/**
 * Error boundary configuration for different app sections
 */
export const ErrorBoundaryPresets = {
  // Dashboard sections
  dashboard: {
    level: 'feature' as const,
    retryConfig: {
      maxAttempts: 3,
      strategy: 'exponential' as const,
      baseDelay: 2000,
      maxDelay: 10000,
      backoffMultiplier: 2
    }
  },

  // Chart components
  chart: {
    level: 'component' as const,
    retryConfig: {
      maxAttempts: 2,
      strategy: 'exponential' as const,
      baseDelay: 1000,
      maxDelay: 5000,
      backoffMultiplier: 2
    }
  },

  // API data components
  api: {
    level: 'component' as const,
    retryConfig: {
      maxAttempts: 3,
      strategy: 'exponential' as const,
      baseDelay: 1000,
      maxDelay: 8000,
      backoffMultiplier: 2
    }
  },

  // Upload components
  upload: {
    level: 'component' as const,
    retryConfig: {
      maxAttempts: 3,
      strategy: 'linear' as const,
      baseDelay: 2000,
      maxDelay: 8000,
      backoffMultiplier: 1.5
    }
  },

  // Critical app-level
  app: {
    level: 'app' as const,
    retryConfig: {
      maxAttempts: 1,
      strategy: 'immediate' as const,
      baseDelay: 0,
      maxDelay: 0,
      backoffMultiplier: 1
    }
  }
} as const;