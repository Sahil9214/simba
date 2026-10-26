/**
 * Error Boundary Types and Interfaces
 * Centralized type definitions for error handling system
 */

import { ReactNode, ErrorInfo } from 'react';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'api' | 'component' | 'data' | 'upload' | 'chart' | 'auth' | 'unknown';
export type RetryStrategy = 'immediate' | 'exponential' | 'linear' | 'none';

export interface ErrorDetails {
  id: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: string;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  strategy: RetryStrategy;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorDetails: ErrorDetails | null;
  lastRetryAt: number | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: ErrorDetails, retry: () => void) => ReactNode);
  retryConfig?: Partial<RetryConfig>;
  isolateErrors?: boolean;
  onError?: (errorDetails: ErrorDetails, errorInfo: ErrorInfo) => void;
  onRetry?: (retryCount: number, errorDetails: ErrorDetails) => void;
  onRecovery?: (errorDetails: ErrorDetails) => void;
  level?: 'component' | 'feature' | 'page' | 'app';
  context?: Record<string, any>;
  enableLogging?: boolean;
  enableTelemetry?: boolean;
}

export interface ErrorReportingConfig {
  endpoint?: string;
  apiKey?: string;
  enableAutoReporting?: boolean;
  includeStackTrace?: boolean;
  includeContext?: boolean;
  maxReportsPerSession?: number;
}

export interface ErrorRecoveryOptions {
  clearCache?: boolean;
  reloadComponent?: boolean;
  redirectTo?: string;
  showFallback?: boolean;
  customRecovery?: () => Promise<void> | void;
}

export interface ErrorMetrics {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  retrySuccess: number;
  retryFailure: number;
  averageRecoveryTime: number;
  lastUpdated: string;
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  autoClose?: boolean;
  duration?: number;
}

export interface ErrorContextValue {
  reportError: (error: Error, context?: Record<string, any>) => void;
  clearErrors: () => void;
  getErrorMetrics: () => ErrorMetrics;
  setErrorReportingConfig: (config: Partial<ErrorReportingConfig>) => void;
  addErrorNotification: (notification: Omit<ErrorNotification, 'id'>) => void;
  removeErrorNotification: (id: string) => void;
}

// Error classification utilities
export const ErrorClassification = {
  getCategory: (error: Error): ErrorCategory => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    if (message.includes('api') || message.includes('status') || stack.includes('axios')) {
      return 'api';
    }
    if (message.includes('upload') || message.includes('file')) {
      return 'upload';
    }
    if (message.includes('chart') || message.includes('render') || stack.includes('recharts')) {
      return 'chart';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (stack.includes('component') || message.includes('render')) {
      return 'component';
    }
    if (message.includes('data') || message.includes('parse') || message.includes('json')) {
      return 'data';
    }

    return 'unknown';
  },

  getSeverity: (error: Error, category: ErrorCategory): ErrorSeverity => {
    const message = error.message.toLowerCase();

    // Critical errors that break core functionality
    if (
      category === 'auth' ||
      message.includes('critical') ||
      message.includes('fatal') ||
      message.includes('crash')
    ) {
      return 'critical';
    }

    // High priority errors affecting user experience
    if (
      category === 'api' ||
      category === 'network' ||
      message.includes('failed') ||
      message.includes('error')
    ) {
      return 'high';
    }

    // Medium priority for component/chart errors
    if (category === 'component' || category === 'chart' || category === 'upload') {
      return 'medium';
    }

    // Low priority for minor issues
    return 'low';
  },

  shouldRetry: (category: ErrorCategory, severity: ErrorSeverity): boolean => {
    // Don't retry critical auth errors
    if (category === 'auth' && severity === 'critical') {
      return false;
    }

    // Retry network and API errors
    if (category === 'network' || category === 'api') {
      return true;
    }

    // Retry upload errors
    if (category === 'upload') {
      return true;
    }

    // Don't retry component or data parsing errors
    if (category === 'component' || category === 'data') {
      return false;
    }

    return severity !== 'critical';
  }
};

// Default configurations
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  strategy: 'exponential',
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2
};

export const DEFAULT_ERROR_REPORTING_CONFIG: ErrorReportingConfig = {
  enableAutoReporting: true,
  includeStackTrace: true,
  includeContext: true,
  maxReportsPerSession: 10
};