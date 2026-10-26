/**
 * Data Error Boundary
 * Specialized error boundary for API/data loading errors with intelligent retry strategies
 */

import React from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { ErrorBoundaryProps } from './types';
import { Database, Wifi, RefreshCw, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DataErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'level'> {
  queryKeys?: string[][];
  apiEndpoint?: string;
  fallbackData?: any;
  enableOfflineMode?: boolean;
  cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
  onDataMutation?: () => void;
}

export function DataErrorBoundary({
  children,
  queryKeys = [],
  apiEndpoint,
  fallbackData,
  enableOfflineMode = true,
  cacheStrategy = 'normal',
  onDataMutation,
  ...props
}: DataErrorBoundaryProps) {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDataError = (errorDetails: any, errorInfo: any) => {
    // Data-specific error logging
    console.error('Data Error:', {
      apiEndpoint,
      queryKeys,
      isOnline,
      cacheStrategy,
      error: errorDetails,
      hasFallback: !!fallbackData
    });

    // Invalidate related queries on certain errors
    if (errorDetails.category === 'api' && errorDetails.message.includes('stale')) {
      queryKeys.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }

    // Call parent error handler if provided
    if (props.onError) {
      props.onError(errorDetails, errorInfo);
    }
  };

  const handleDataRetry = (retryCount: number, errorDetails: any) => {
    // Progressive cache clearing based on retry count
    if (retryCount === 1) {
      // First retry: clear specific queries
      queryKeys.forEach(queryKey => {
        queryClient.removeQueries({ queryKey });
      });
    } else if (retryCount === 2) {
      // Second retry: clear all related cache
      if (apiEndpoint) {
        const endpointPattern = apiEndpoint.split('/').pop();
        queryClient.removeQueries({
          predicate: (query) =>
            query.queryKey.some(key =>
              typeof key === 'string' && key.includes(endpointPattern || '')
            )
        });
      }
    }

    // Call parent retry handler if provided
    if (props.onRetry) {
      props.onRetry(retryCount, errorDetails);
    }
  };

  const createDataFallback = (errorDetails: any, retry: () => void) => {
    return (
      <DataErrorFallback
        errorDetails={errorDetails}
        apiEndpoint={apiEndpoint}
        fallbackData={fallbackData}
        isOnline={isOnline}
        enableOfflineMode={enableOfflineMode}
        onRetry={retry}
        onClearCache={() => {
          queryKeys.forEach(queryKey => {
            queryClient.removeQueries({ queryKey });
          });
          retry();
        }}
        onDataMutation={onDataMutation}
      />
    );
  };

  const getRetryConfig = () => {
    const baseConfig = {
      maxAttempts: isOnline ? 3 : 1,
      strategy: 'exponential' as const,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    };

    // Adjust retry strategy based on cache strategy
    switch (cacheStrategy) {
      case 'aggressive':
        return { ...baseConfig, maxAttempts: 5, baseDelay: 500 };
      case 'minimal':
        return { ...baseConfig, maxAttempts: 1, baseDelay: 2000 };
      default:
        return baseConfig;
    }
  };

  return (
    <BaseErrorBoundary
      {...props}
      level="component"
      fallback={createDataFallback}
      onError={handleDataError}
      onRetry={handleDataRetry}
      retryConfig={getRetryConfig()}
    >
      {children}
    </BaseErrorBoundary>
  );
}

interface DataErrorFallbackProps {
  errorDetails: any;
  apiEndpoint?: string;
  fallbackData?: any;
  isOnline: boolean;
  enableOfflineMode: boolean;
  onRetry: () => void;
  onClearCache: () => void;
  onDataMutation?: () => void;
}

function DataErrorFallback({
  errorDetails,
  apiEndpoint,
  fallbackData,
  isOnline,
  enableOfflineMode,
  onRetry,
  onClearCache,
  onDataMutation
}: DataErrorFallbackProps) {
  const [retryStatus, setRetryStatus] = React.useState<'idle' | 'retrying' | 'success' | 'failed'>('idle');

  const getErrorType = () => {
    if (!isOnline) return 'offline';
    if (errorDetails?.message?.includes('timeout')) return 'timeout';
    if (errorDetails?.message?.includes('500')) return 'server';
    if (errorDetails?.message?.includes('401') || errorDetails?.message?.includes('403')) return 'auth';
    if (errorDetails?.message?.includes('404')) return 'notfound';
    return 'generic';
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'offline':
        return <Wifi className="h-12 w-12 text-orange-500" />;
      case 'timeout':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'server':
        return <Database className="h-12 w-12 text-red-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-gray-500" />;
    }
  };

  const getErrorMessage = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'offline':
        return 'You appear to be offline. Some features may not be available.';
      case 'timeout':
        return 'The request is taking longer than expected. Please try again.';
      case 'server':
        return 'Our servers are temporarily unavailable. Please try again in a few moments.';
      case 'auth':
        return 'Authentication required. Please log in again to access this data.';
      case 'notfound':
        return 'The requested data could not be found. It may have been moved or deleted.';
      default:
        return 'Unable to load data. This might be a temporary network issue.';
    }
  };

  const handleRetryWithStatus = async () => {
    setRetryStatus('retrying');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate retry delay
      onRetry();
      setRetryStatus('success');
      setTimeout(() => setRetryStatus('idle'), 2000);
    } catch (error) {
      setRetryStatus('failed');
      setTimeout(() => setRetryStatus('idle'), 2000);
    }
  };

  const shouldShowFallbackData = () => {
    return fallbackData && (!isOnline && enableOfflineMode);
  };

  return (
    <div className="w-full bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="text-center">
        {/* Status Icon */}
        <div className="mb-4 flex justify-center">
          {getErrorIcon()}
        </div>

        {/* Title */}
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Data Loading Error
        </h4>

        {/* Error Message */}
        <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
          {getErrorMessage()}
        </p>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        {/* API Endpoint Info */}
        {apiEndpoint && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 max-w-md mx-auto">
            <p className="text-xs text-gray-600 font-mono break-all">
              Endpoint: {apiEndpoint}
            </p>
          </div>
        )}

        {/* Fallback Data Notice */}
        {shouldShowFallbackData() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-blue-800">Offline Mode Active</span>
            </div>
            <p className="text-xs text-blue-700">
              Showing cached data. Some information may be outdated.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={handleRetryWithStatus}
            disabled={retryStatus === 'retrying' || !isOnline}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {retryStatus === 'retrying' ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Retrying...
              </>
            ) : retryStatus === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Success!
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Retry
              </>
            )}
          </button>

          <button
            onClick={onClearCache}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Database className="h-4 w-4" />
            Clear Cache
          </button>

          {onDataMutation && (
            <button
              onClick={onDataMutation}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-gray-500">
          {!isOnline ? (
            <p>Connect to the internet to access fresh data.</p>
          ) : (
            <p>If this problem persists, try refreshing the page or contact support.</p>
          )}
          <p className="mt-1">
            Error ID: {errorDetails?.id?.slice(-8) || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}

// HOC for data components
export function withDataErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    queryKeys?: string[][];
    apiEndpoint?: string;
    enableOfflineMode?: boolean;
    cacheStrategy?: 'aggressive' | 'normal' | 'minimal';
  }
) {
  return function WrappedDataComponent(props: P) {
    return (
      <DataErrorBoundary {...options}>
        <Component {...props} />
      </DataErrorBoundary>
    );
  };
}

// Hook for data error handling
export function useDataErrorHandling(queryKeys: string[][] = []) {
  const queryClient = useQueryClient();

  const clearRelatedCache = React.useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.removeQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  const invalidateRelatedQueries = React.useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  const refetchRelatedQueries = React.useCallback(() => {
    queryKeys.forEach(queryKey => {
      queryClient.refetchQueries({ queryKey });
    });
  }, [queryClient, queryKeys]);

  return {
    clearRelatedCache,
    invalidateRelatedQueries,
    refetchRelatedQueries
  };
}