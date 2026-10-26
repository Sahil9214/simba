/**
 * Enhanced Analytics Error Boundary
 * Upgraded version using the comprehensive error boundary system
 */

import React from 'react';
import { DashboardErrorBoundary } from '@/common/error-boundaries/DashboardErrorBoundary';
import { useQueryClient } from '@tanstack/react-query';
// Dashboard query keys removed - using default error handling

interface EnhancedAnalyticsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: any, errorInfo: any) => void;
  searchTerm?: string;
  selectedLocation?: string;
}

export function EnhancedAnalyticsErrorBoundary({
  children,
  fallback,
  onError,
  searchTerm = '',
  selectedLocation = ''
}: EnhancedAnalyticsErrorBoundaryProps) {
  const queryClient = useQueryClient();

  const handleAnalyticsError = (errorDetails: any, errorInfo: any) => {
    // Enhanced analytics-specific error logging
    console.error('Analytics Error (Enhanced):', {
      errorDetails,
      errorInfo,
      context: {
        searchTerm,
        selectedLocation,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // Call parent error handler if provided
    if (onError) {
      onError(errorDetails, errorInfo);
    }

    // Send to monitoring service (example)
    if (process.env.NODE_ENV === 'production') {
      // Here you would integrate with your actual monitoring service
      console.info('Would send to monitoring service:', {
        errorId: errorDetails.id,
        message: errorDetails.message,
        category: errorDetails.category,
        severity: errorDetails.severity,
        context: {
          component: 'AnalyticsBanner',
          searchTerm,
          selectedLocation
        }
      });
    }
  };

  const handleDataRefresh = () => {
    // Clear analytics-specific cache
    const filters = { searchTerm, selectedLocation };

    // Clear dashboard-related queries
    queryClient.removeQueries({
      queryKey: ['dashboard', 'metrics']
    });
    queryClient.removeQueries({
      queryKey: ['dashboard', 'peerComparison']
    });
    queryClient.removeQueries({
      queryKey: ['dashboard', 'reportingGaps']
    });
    queryClient.removeQueries({
      queryKey: ['dashboard', 'salesVsClosing']
    });

    // Refetch the data
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['dashboard']
      });
    }, 500);
  };

  return (
    <DashboardErrorBoundary
      dashboardType="analytics"
      onError={handleAnalyticsError}
      onDataRefresh={handleDataRefresh}
      context={{
        component: 'AnalyticsBanner',
        searchTerm,
        selectedLocation,
        timestamp: new Date().toISOString()
      }}
      fallback={fallback}
      retryConfig={{
        maxAttempts: 3,
        strategy: 'exponential',
        baseDelay: 2000,
        maxDelay: 10000,
        backoffMultiplier: 2
      }}
      enableLogging={true}
      enableTelemetry={process.env.NODE_ENV === 'production'}
    >
      {children}
    </DashboardErrorBoundary>
  );
}

// HOC version for easy migration
export function withEnhancedAnalyticsErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    onError?: (error: any, errorInfo: any) => void;
  }
) {
  return function WrappedComponent(props: P & { searchTerm?: string; selectedLocation?: string }) {
    return (
      <EnhancedAnalyticsErrorBoundary
        fallback={options?.fallback}
        onError={options?.onError}
        searchTerm={props.searchTerm}
        selectedLocation={props.selectedLocation}
      >
        <Component {...props} />
      </EnhancedAnalyticsErrorBoundary>
    );
  };
}

// Legacy compatibility - can be used as drop-in replacement
export const AnalyticsErrorBoundary = EnhancedAnalyticsErrorBoundary;
export const withAnalyticsErrorBoundary = withEnhancedAnalyticsErrorBoundary;