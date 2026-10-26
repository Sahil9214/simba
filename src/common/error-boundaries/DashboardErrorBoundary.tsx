/**
 * Dashboard Error Boundary
 * Specialized error boundary for dashboard-wide errors with dashboard-specific recovery
 */

import React from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { ErrorBoundaryProps } from './types';
import { BarChart3, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { deleteCookie } from 'cookies-next';

interface DashboardErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'level'> {
  dashboardType?: 'main' | 'analytics' | 'reporting' | 'performance';
  onDataRefresh?: () => void;
  fallbackData?: any;
}

export function DashboardErrorBoundary({
  children,
  dashboardType = 'main',
  onDataRefresh,
  fallbackData,
  ...props
}: DashboardErrorBoundaryProps) {
  const handleDashboardError = (errorDetails: any, errorInfo: any) => {
    // Dashboard-specific error logging
    console.error('Dashboard Error:', {
      dashboardType,
      error: errorDetails,
      fallbackAvailable: !!fallbackData
    });

    // Call parent error handler if provided
    if (props.onError) {
      props.onError(errorDetails, errorInfo);
    }
  };

  const handleDashboardRetry = () => {
    // Clear dashboard cache if available
    if (typeof window !== 'undefined' && window.localStorage) {
      const dashboardKeys = Object.keys(localStorage).filter(key =>
        key.includes('dashboard') || key.includes('analytics')
      );
      dashboardKeys.forEach(key =>{ localStorage.removeItem(key)
        deleteCookie(key)
      });
    }

    // Refresh data if handler provided
    if (onDataRefresh) {
      try {
        onDataRefresh();
      } catch (refreshError) {
        console.error('Error during dashboard data refresh:', refreshError);
      }
    }

    // Call parent retry handler if provided
    if (props.onRetry) {
      props.onRetry(0, {} as any);
    }
  };

  const createDashboardFallback = (errorDetails: any, retry: () => void) => {
    return (
      <DashboardErrorFallback
        dashboardType={dashboardType}
        errorDetails={errorDetails}
        onRetry={retry}
        onDataRefresh={onDataRefresh}
        fallbackData={fallbackData}
      />
    );
  };

  return (
    <BaseErrorBoundary
      {...props}
      level="feature"
      fallback={createDashboardFallback}
      onError={handleDashboardError}
      onRetry={handleDashboardRetry}
      retryConfig={{
        maxAttempts: 3,
        strategy: 'exponential',
        baseDelay: 2000,
        maxDelay: 10000,
        backoffMultiplier: 2
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
}

interface DashboardErrorFallbackProps {
  dashboardType: string;
  errorDetails: any;
  onRetry: () => void;
  onDataRefresh?: () => void;
  fallbackData?: any;
}

function DashboardErrorFallback({
  dashboardType,
  errorDetails,
  onRetry,
  onDataRefresh,
  fallbackData
}: DashboardErrorFallbackProps) {
  const getDashboardIcon = () => {
    switch (dashboardType) {
      case 'analytics':
        return <TrendingUp className="h-16 w-16 text-blue-500" />;
      case 'reporting':
        return <BarChart3 className="h-16 w-16 text-green-500" />;
      case 'performance':
        return <TrendingUp className="h-16 w-16 text-purple-500" />;
      default:
        return <BarChart3 className="h-16 w-16 text-gray-500" />;
    }
  };

  const getDashboardTitle = () => {
    switch (dashboardType) {
      case 'analytics':
        return 'Analytics Dashboard Error';
      case 'reporting':
        return 'Reporting Dashboard Error';
      case 'performance':
        return 'Performance Dashboard Error';
      default:
        return 'Dashboard Error';
    }
  };

  return (
    <div className="w-full bg-white shadow-sm rounded-2xl border-2 border-gray-200 p-8">
      <div className="text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          {getDashboardIcon()}
        </div>

        {/* Title and Message */}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {getDashboardTitle()}
        </h3>

        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          We&apos;re experiencing issues loading your dashboard data. This could be due to
          network connectivity or a temporary service disruption.
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-800">Error Details</span>
          </div>
          <p className="text-xs text-red-700 font-mono break-words">
            {errorDetails?.message || 'Unknown error occurred'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Dashboard
          </button>

          {onDataRefresh && (
            <button
              onClick={onDataRefresh}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          )}
        </div>

        {/* Fallback Data Notice */}
        {fallbackData && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Some dashboard features may be using cached or fallback data
              while we resolve this issue.
            </p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>If this problem persists, try refreshing the entire page or contact support.</p>
          <p className="mt-1">
            Error ID: {errorDetails?.id?.slice(-8) || 'Unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}

// HOC for dashboard components
export function withDashboardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    dashboardType?: 'main' | 'analytics' | 'reporting' | 'performance';
    onDataRefresh?: () => void;
    fallbackData?: any;
  }
) {
  return function WrappedDashboardComponent(props: P) {
    return (
      <DashboardErrorBoundary {...options}>
        <Component {...props} />
      </DashboardErrorBoundary>
    );
  };
}