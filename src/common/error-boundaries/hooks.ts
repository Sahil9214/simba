/**
 * Error Boundary Hooks
 * Custom hooks for error handling and monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  ErrorDetails,
  ErrorMetrics,
  ErrorSeverity,
  ErrorCategory,
  RetryConfig,
  DEFAULT_RETRY_CONFIG
} from './types';
import {
  ErrorLogger,
  PerformanceMonitor,
  NetworkMonitor,
  createErrorDetails,
  shouldRetry,
  calculateRetryDelay
} from './utils';
import { useErrorContext } from './ErrorContext';

/**
 * Hook for handling async operations with error boundaries
 */
export function useAsyncErrorBoundary<T = any>() {
  const [state, setState] = useState<{
    data: T | null;
    error: Error | null;
    isLoading: boolean;
    retryCount: number;
  }>({
    data: null,
    error: null,
    isLoading: false,
    retryCount: 0
  });

  const { reportError } = useErrorContext();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const execute = useCallback(async (
    asyncFn: () => Promise<T>,
    options?: {
      retryConfig?: Partial<RetryConfig>;
      context?: Record<string, any>;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ) => {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options?.retryConfig };

    const attemptExecution = async (attemptCount = 0): Promise<void> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await asyncFn();
        setState({
          data: result,
          error: null,
          isLoading: false,
          retryCount: attemptCount
        });

        if (options?.onSuccess) {
          options.onSuccess(result);
        }
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        const errorDetails = createErrorDetails(errorInstance, {
          ...options?.context,
          attemptCount,
          asyncOperation: true
        });

        reportError(errorInstance, options?.context);

        if (shouldRetry(errorInstance, attemptCount, retryConfig, null)) {
          const delay = calculateRetryDelay(attemptCount, retryConfig);

          setState(prev => ({
            ...prev,
            isLoading: false,
            retryCount: attemptCount + 1
          }));

          retryTimeoutRef.current = setTimeout(() => {
            attemptExecution(attemptCount + 1);
          }, delay);
        } else {
          setState({
            data: null,
            error: errorInstance,
            isLoading: false,
            retryCount: attemptCount
          });

          if (options?.onError) {
            options.onError(errorInstance);
          }
        }
      }
    };

    await attemptExecution();
  }, [reportError]);

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setState({
      data: null,
      error: null,
      isLoading: false,
      retryCount: 0
    });
  }, []);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

/**
 * Hook for monitoring error rates and patterns
 */
export function useErrorMonitoring() {
  const [metrics, setMetrics] = useState<ErrorMetrics>({
    totalErrors: 0,
    errorsByCategory: {} as Record<ErrorCategory, number>,
    errorsBySeverity: {} as Record<ErrorSeverity, number>,
    retrySuccess: 0,
    retryFailure: 0,
    averageRecoveryTime: 0,
    lastUpdated: new Date().toISOString()
  });

  const errorLogger = ErrorLogger.getInstance();

  useEffect(() => {
    const updateMetrics = () => {
      const stats = errorLogger.getErrorStats();
      setMetrics({
        totalErrors: stats.total,
        errorsByCategory: stats.byCategory,
        errorsBySeverity: stats.bySeverity,
        retrySuccess: 0, // Would be tracked separately
        retryFailure: 0,
        averageRecoveryTime: 0,
        lastUpdated: new Date().toISOString()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [errorLogger]);

  const getErrorTrends = useCallback(() => {
    const recentErrors = errorLogger.getRecentErrors(20);
    const last24Hours = recentErrors.filter(
      error => Date.now() - new Date(error.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    return {
      totalLast24Hours: last24Hours.length,
      criticalLast24Hours: last24Hours.filter(e => e.severity === 'critical').length,
      mostCommonCategory: Object.entries(metrics.errorsByCategory)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
      errorRate: last24Hours.length / 24 // per hour
    };
  }, [errorLogger, metrics]);

  const getHealthScore = useCallback(() => {
    const trends = getErrorTrends();
    const baseScore = 100;

    // Deduct points for errors
    let score = baseScore;
    score -= Math.min(trends.totalLast24Hours * 2, 50); // Max 50 points for total errors
    score -= Math.min(trends.criticalLast24Hours * 10, 30); // Max 30 points for critical errors
    score -= Math.min(trends.errorRate * 5, 20); // Max 20 points for error rate

    return Math.max(score, 0);
  }, [getErrorTrends]);

  return {
    metrics,
    getErrorTrends,
    getHealthScore,
    recentErrors: errorLogger.getRecentErrors(10)
  };
}

/**
 * Hook for network-aware error handling
 */
export function useNetworkErrorHandling() {
  const [isOnline, setIsOnline] = useState(NetworkMonitor.getStatus());
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'unknown'>('unknown');

  useEffect(() => {
    const unsubscribe = NetworkMonitor.addListener(setIsOnline);

    // Monitor connection quality
    const measureConnection = () => {
      if (!isOnline) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
      const start = performance.now();
      fetch(`${API_BASE_URL}/health`, { method: 'HEAD', cache: 'no-cache' })
        .then(() => {
          const duration = performance.now() - start;
          setConnectionQuality(duration < 1000 ? 'good' : 'poor');
        })
        .catch(() => {
          setConnectionQuality('poor');
        });
    };

    measureConnection();
    const interval = setInterval(measureConnection, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isOnline]);

  const getRetryStrategy = useCallback((error: Error) => {
    if (!isOnline) {
      return { shouldRetry: false, delay: 0, reason: 'offline' };
    }

    const isNetworkError = error.message.toLowerCase().includes('network') ||
                          error.message.toLowerCase().includes('fetch');

    if (!isNetworkError) {
      return { shouldRetry: true, delay: 1000, reason: 'standard' };
    }

    // Network error handling based on connection quality
    if (connectionQuality === 'poor') {
      return { shouldRetry: true, delay: 5000, reason: 'poor_connection' };
    }

    return { shouldRetry: true, delay: 2000, reason: 'network_error' };
  }, [isOnline, connectionQuality]);

  return {
    isOnline,
    connectionQuality,
    getRetryStrategy
  };
}

/**
 * Hook for performance-aware error handling
 */
export function usePerformanceErrorHandling(componentName: string) {
  const performanceEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    performanceEndRef.current = PerformanceMonitor.startMeasurement(componentName);

    return () => {
      if (performanceEndRef.current) {
        performanceEndRef.current();
      }
    };
  }, [componentName]);

  const getPerformanceStats = useCallback(() => {
    return PerformanceMonitor.getStats(componentName);
  }, [componentName]);

  const isPerformanceIssue = useCallback((error: Error) => {
    const stats = getPerformanceStats();
    if (!stats) return false;

    // Consider it a performance issue if average time > 2 seconds
    return stats.average > 2000 || error.message.toLowerCase().includes('timeout');
  }, [getPerformanceStats]);

  return {
    getPerformanceStats,
    isPerformanceIssue
  };
}

/**
 * Hook for cache-aware error handling
 */
export function useCacheErrorHandling(queryKeys: string[][] = []) {
  const queryClient = useQueryClient();

  const getCacheStatus = useCallback(() => {
    const cacheData = queryKeys.map(queryKey => ({
      queryKey,
      data: queryClient.getQueryData(queryKey),
      state: queryClient.getQueryState(queryKey)
    }));

    return {
      hasCachedData: cacheData.some(item => item.data !== undefined),
      cacheData,
      staleCacheCount: cacheData.filter(item =>
        (item.state?.dataUpdatedAt && Date.now() - item.state.dataUpdatedAt > 5 * 60 * 1000)
      ).length
    };
  }, [queryClient, queryKeys]);

  const clearRelatedCache = useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.removeQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  const invalidateRelatedCache = useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  const shouldUseCachedData = useCallback((error: Error) => {
    const cacheStatus = getCacheStatus();
    const isNetworkError = error.message.toLowerCase().includes('network') ||
                          error.message.toLowerCase().includes('fetch');

    return isNetworkError && cacheStatus.hasCachedData;
  }, [getCacheStatus]);

  return {
    getCacheStatus,
    clearRelatedCache,
    invalidateRelatedCache,
    shouldUseCachedData
  };
}

/**
 * Hook for component-level error recovery
 */
export function useErrorRecovery() {
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [lastRecoveryAt, setLastRecoveryAt] = useState<number | null>(null);

  const recover = useCallback(async (options?: {
    clearCache?: boolean;
    reloadComponent?: boolean;
    customRecovery?: () => Promise<void> | void;
  }) => {
    const now = Date.now();

    // Prevent rapid recovery attempts
    if (lastRecoveryAt && (now - lastRecoveryAt) < 2000) {
      return false;
    }

    setRecoveryAttempts(prev => prev + 1);
    setLastRecoveryAt(now);

    try {
      if (options?.clearCache) {
        // Clear browser cache entries
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
      }

      if (options?.customRecovery) {
        await options.customRecovery();
      }

      if (options?.reloadComponent) {
        // Force component remount by updating key
        return true;
      }

      return true;
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
      return false;
    }
  }, [lastRecoveryAt]);

  const reset = useCallback(() => {
    setRecoveryAttempts(0);
    setLastRecoveryAt(null);
  }, []);

  return {
    recoveryAttempts,
    lastRecoveryAt,
    recover,
    reset,
    canRecover: recoveryAttempts < 3 // Max 3 recovery attempts
  };
}

/**
 * Hook for accessibility-aware error handling
 */
export function useAccessibleErrorHandling() {
  const announceError = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    // Create or update live region for screen readers
    let liveRegion = document.getElementById('error-live-region');

    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'error-live-region';
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    // Update the live region content
    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }, []);

  const focusManagement = useCallback((errorElement?: HTMLElement | null) => {
    if (errorElement) {
      // Focus the error element for keyboard users
      errorElement.focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return {
    announceError,
    focusManagement
  };
}