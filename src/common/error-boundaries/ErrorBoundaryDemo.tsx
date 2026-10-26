/**
 * Error Boundary Demo Component
 * For testing and demonstrating error boundary functionality
 */

import React, { useState } from 'react';
import {
  DashboardErrorBoundary,
  ChartErrorBoundary,
  DataErrorBoundary,
  UploadErrorBoundary,
  useErrorHandler,
  useErrorContext,
  useDataErrorHandling,
  ErrorProvider
} from './index';

// Demo components that can trigger different types of errors
function ComponentWithError({ errorType }: { errorType: string }) {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    switch (errorType) {
      case 'network':
        throw new Error('Network timeout: Failed to fetch data from server');
      case 'api':
        throw new Error('API Error: 500 Internal Server Error');
      case 'chart':
        throw new Error('Chart rendering failed: Invalid data format');
      case 'upload':
        throw new Error('Upload failed: File size exceeds maximum limit');
      case 'data':
        throw new Error('Data parsing error: Invalid JSON format');
      case 'auth':
        throw new Error('Authentication failed: 401 Unauthorized');
      default:
        throw new Error('Something went wrong!');
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">Test Component ({errorType})</h3>
      <p className="text-sm text-gray-600 mb-3">
        This component can trigger a {errorType} error for testing purposes.
      </p>
      <button
        onClick={() => setShouldError(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Trigger {errorType} Error
      </button>
    </div>
  );
}

function AsyncErrorDemo() {
  const { handleAsyncError } = useErrorHandler();
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const triggerAsyncError = async () => {
    setIsLoading(true);
    setResult('');

    const result = await handleAsyncError(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Async operation failed!');
      },
      {
        context: { operation: 'demo-async' },
        showNotification: true,
        notificationTitle: 'Async Error Demo',
        fallbackValue: 'Fallback result'
      }
    );

    setResult(result || 'No result');
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h3 className="font-medium mb-2">Async Error Handling Demo</h3>
      <p className="text-sm text-gray-600 mb-3">
        Test async error handling with fallback values and notifications.
      </p>
      <button
        onClick={triggerAsyncError}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors mr-3"
      >
        {isLoading ? 'Loading...' : 'Trigger Async Error'}
      </button>
      {result && (
        <div className="mt-2 text-sm">
          <strong>Result:</strong> {result}
        </div>
      )}
    </div>
  );
}

function ErrorMonitoringDemo() {
  const { getErrorMetrics } = useErrorContext();
  const metrics = getErrorMetrics();
  // Simple health score calculation
  const healthScore = metrics.totalErrors > 5 ? 30 : 90;

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="font-medium mb-2">Error Monitoring Dashboard</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <strong>Total Errors:</strong> {metrics.totalErrors}
        </div>
        <div>
          <strong>Health Score:</strong> {healthScore}/100
        </div>
        <div>
          <strong>Last 24h:</strong> {metrics.totalErrors}
        </div>
        <div>
          <strong>Critical:</strong> {metrics.errorsBySeverity.critical || 0}
        </div>
        <div className="col-span-2">
          <strong>Most Common:</strong> {Object.entries(metrics.errorsByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'}
        </div>
      </div>
    </div>
  );
}

function NetworkStatusDemo() {
  const { clearRelatedCache, invalidateRelatedQueries, refetchRelatedQueries } = useDataErrorHandling([['demo', 'test']]);

  const testCacheOperations = () => {
    clearRelatedCache();

  };

  return (
    <div className="p-4 bg-yellow-50 rounded-lg">
      <h3 className="font-medium mb-2">Data Error Handling</h3>
      <div className="text-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Ready for retry operations</span>
        </div>
        <button
          onClick={testCacheOperations}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
}

export function ErrorBoundaryDemo() {
  return (
    <ErrorProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Error Boundary System Demo</h1>
          <p className="text-gray-600">
            This demo showcases the comprehensive error boundary system with different error types,
            monitoring, and recovery mechanisms.
          </p>
        </div>

        {/* Error Monitoring Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Error Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ErrorMonitoringDemo />
            <NetworkStatusDemo />
            <AsyncErrorDemo />
          </div>
        </section>

        {/* Dashboard Error Boundary Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Dashboard Error Boundary</h2>
          <DashboardErrorBoundary
            dashboardType="analytics"
            onDataRefresh={() => console.log('Dashboard data refresh triggered')}
          >
            <ComponentWithError errorType="api" />
          </DashboardErrorBoundary>
        </section>

        {/* Chart Error Boundary Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Chart Error Boundary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartErrorBoundary
              chartType="bar"
              chartTitle="Sales Chart"
              showFallbackChart={true}
              fallbackData={[
                { name: 'Product A', value: 100 },
                { name: 'Product B', value: 200 },
                { name: 'Product C', value: 150 }
              ]}
            >
              <ComponentWithError errorType="chart" />
            </ChartErrorBoundary>

            <ChartErrorBoundary
              chartType="pie"
              chartTitle="Distribution Chart"
              showFallbackChart={true}
              fallbackData={[
                { name: 'Category 1', value: 30 },
                { name: 'Category 2', value: 50 },
                { name: 'Category 3', value: 20 }
              ]}
            >
              <ComponentWithError errorType="data" />
            </ChartErrorBoundary>
          </div>
        </section>

        {/* Data Error Boundary Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Data Error Boundary</h2>
          <DataErrorBoundary
            queryKeys={[['demo', 'data']]}
            apiEndpoint="/api/demo/data"
            enableOfflineMode={true}
            fallbackData={{ message: 'Cached data available' }}
          >
            <ComponentWithError errorType="network" />
          </DataErrorBoundary>
        </section>

        {/* Upload Error Boundary Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Upload Error Boundary</h2>
          <UploadErrorBoundary
            uploadType="multiple"
            acceptedFileTypes={['.xlsx', '.csv', '.json']}
            maxFileSize={10 * 1024 * 1024} // 10MB
            onUploadRetry={(files) => console.log('Upload retry with files:', files)}
            onUploadCancel={() => console.log('Upload cancelled')}
          >
            <ComponentWithError errorType="upload" />
          </UploadErrorBoundary>
        </section>

        {/* Multiple Error Types Grid */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Various Error Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['network', 'auth', 'data', 'generic'].map(errorType => (
              <DataErrorBoundary key={errorType} queryKeys={[[errorType]]}>
                <ComponentWithError errorType={errorType} />
              </DataErrorBoundary>
            ))}
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">How to Test</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click the &quot;Trigger Error&quot; buttons to see different error boundary behaviors</li>
            <li>Test the retry functionality by clicking retry buttons in error states</li>
            <li>Monitor the error metrics in the monitoring dashboard</li>
            <li>Try the async error handling demo to see notification system</li>
            <li>Check network status changes and retry strategies</li>
            <li>Observe how different error types are categorized and handled</li>
          </ol>
        </section>
      </div >
    </ErrorProvider >
  );
}

export default ErrorBoundaryDemo;
