/**
 * Chart Error Boundary
 * Specialized error boundary for chart components with chart-specific recovery
 */

import React from 'react';
import { BaseErrorBoundary } from './BaseErrorBoundary';
import { ErrorBoundaryProps } from './types';
import { BarChart3, PieChart, LineChart, TrendingUp, AlertTriangle, RefreshCw, Download } from 'lucide-react';

interface ChartErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'level'> {
  chartType?: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap';
  chartTitle?: string;
  fallbackData?: any[];
  onDataExport?: () => void;
  showFallbackChart?: boolean;
}

export function ChartErrorBoundary({
  children,
  chartType = 'bar',
  chartTitle,
  fallbackData,
  onDataExport,
  showFallbackChart = false,
  ...props
}: ChartErrorBoundaryProps) {
  const handleChartError = (errorDetails: any, errorInfo: any) => {
    // Chart-specific error logging
    console.error('Chart Error:', {
      chartType,
      chartTitle,
      error: errorDetails,
      hasData: !!fallbackData,
      dataLength: fallbackData?.length || 0
    });

    // Call parent error handler if provided
    if (props.onError) {
      props.onError(errorDetails, errorInfo);
    }
  };

  const createChartFallback = (errorDetails: any, retry: () => void) => {
    return (
      <ChartErrorFallback
        chartType={chartType}
        chartTitle={chartTitle}
        errorDetails={errorDetails}
        fallbackData={fallbackData}
        onRetry={retry}
        onDataExport={onDataExport}
        showFallbackChart={showFallbackChart}
      />
    );
  };

  return (
    <BaseErrorBoundary
      {...props}
      level="component"
      fallback={createChartFallback}
      onError={handleChartError}
      retryConfig={{
        maxAttempts: 2,
        strategy: 'exponential',
        baseDelay: 1000,
        maxDelay: 5000,
        backoffMultiplier: 2
      }}
    >
      {children}
    </BaseErrorBoundary>
  );
}

interface ChartErrorFallbackProps {
  chartType: string;
  chartTitle?: string;
  errorDetails: any;
  fallbackData?: any[];
  onRetry: () => void;
  onDataExport?: () => void;
  showFallbackChart: boolean;
}

function ChartErrorFallback({
  chartType,
  chartTitle,
  errorDetails,
  fallbackData,
  onRetry,
  onDataExport,
  showFallbackChart
}: ChartErrorFallbackProps) {
  const getChartIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-12 w-12 text-blue-500" />;
      case 'pie':
      case 'donut':
        return <PieChart className="h-12 w-12 text-green-500" />;
      case 'area':
        return <TrendingUp className="h-12 w-12 text-purple-500" />;
      default:
        return <BarChart3 className="h-12 w-12 text-gray-500" />;
    }
  };

  const getErrorMessage = () => {
    const baseMessage = `Unable to render ${chartTitle || `${chartType} chart`}`;

    if (errorDetails?.category === 'data') {
      return `${baseMessage} due to data formatting issues.`;
    }
    if (errorDetails?.category === 'network') {
      return `${baseMessage} due to network connectivity issues.`;
    }
    return `${baseMessage}. This might be a temporary rendering issue.`;
  };

  return (
    <div className="w-full bg-white border-2 border-gray-200 rounded-xl p-6">
      <div className="text-center">
        {/* Chart Icon */}
        <div className="mb-4 flex justify-center">
          {getChartIcon()}
        </div>

        {/* Title */}
        <h4 className="text-lg font-medium text-gray-900 mb-2">
          Chart Display Error
        </h4>

        {/* Error Message */}
        <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
          {getErrorMessage()}
        </p>

        {/* Error Details */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 max-w-sm mx-auto">
          <div className="flex items-center justify-center mb-1">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-xs font-medium text-red-800">Technical Details</span>
          </div>
          <p className="text-xs text-red-700 font-mono break-words">
            {errorDetails?.message || 'Chart rendering failed'}
          </p>
        </div>

        {/* Fallback Chart */}
        {showFallbackChart && fallbackData && fallbackData.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 mb-2">Simplified chart view:</p>
            <SimpleFallbackChart data={fallbackData} type={chartType} />
          </div>
        )}

        {/* Data Summary */}
        {fallbackData && (
          <div className="mb-4 text-xs text-gray-500">
            <p>Data points available: {fallbackData.length}</p>
            {fallbackData.length > 0 && (
              <p>Sample: {JSON.stringify(fallbackData[0]).slice(0, 50)}...</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Chart
          </button>

          {onDataExport && (
            <button
              onClick={onDataExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-4 text-xs text-gray-500">
          Try refreshing or switch to table view if the chart continues to have issues.
        </p>
      </div>
    </div>
  );
}

// Simple fallback chart component
function SimpleFallbackChart({ data, type }: { data: any[]; type: string }) {
  if (!data || data.length === 0) return null;

  // Extract numeric values for a simple visualization
  const values = data.map((item, index) => {
    if (typeof item === 'number') return item;
    if (typeof item === 'object' && item !== null) {
      const numericKeys = Object.keys(item).filter(key =>
        typeof item[key] === 'number' && !isNaN(item[key])
      );
      return numericKeys.length > 0 ? item[numericKeys[0]] : index;
    }
    return index;
  });

  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue || 1;

  if (type === 'pie' || type === 'donut') {
    // Simple pie representation
    return (
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full border-8 border-blue-300 border-t-blue-600"></div>
      </div>
    );
  }

  // Simple bar chart representation
  return (
    <div className="flex items-end justify-center gap-1 h-16">
      {values.slice(0, 10).map((value, index) => {
        const height = ((value - minValue) / range) * 100;
        return (
          <div
            key={index}
            className="bg-blue-400 w-2 min-h-[4px]"
            style={{ height: `${Math.max(height, 10)}%` }}
            title={`Value: ${value}`}
          />
        );
      })}
    </div>
  );
}

// HOC for chart components
export function withChartErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    chartType?: 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap';
    chartTitle?: string;
    showFallbackChart?: boolean;
  }
) {
  return function WrappedChartComponent(props: P) {
    return (
      <ChartErrorBoundary {...options}>
        <Component {...props} />
      </ChartErrorBoundary>
    );
  };
}