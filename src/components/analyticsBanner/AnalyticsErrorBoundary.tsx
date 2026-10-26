// AnalyticsErrorBoundary.tsx - Error boundary for analytics components
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Analytics Error Boundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // Here you would log to your monitoring service
      // e.g., Sentry, LogRocket, etc.
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;

    if (retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        retryCount: retryCount + 1
      });

      // Force component remount after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  handleReportError = () => {
    const { error } = this.state;
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy to clipboard or send to support
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Error details copied to clipboard. Please share with support team.');
  };

  render() {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;
    const canRetry = retryCount < this.maxRetries;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="bg-white shadow-sm p-6 rounded-2xl border-2 border-red-100">
          <div className="text-center">
            <div className="mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Analytics Dashboard Error
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                We&apos;re having trouble loading your analytics data. This might be due to a
                network issue or temporary service disruption.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-xs text-red-700 font-mono">
                {error?.message || 'Unknown error occurred'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - retryCount} left)
                </button>
              )}

              <button
                onClick={this.handleReportError}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <HelpCircle className="h-4 w-4" />
                Report Issue
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <p>Try refreshing the page or contact support if the problem persists.</p>
              <p className="mt-1">
                Error ID: {Date.now().toString(36).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC version for functional components
export function withAnalyticsErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <AnalyticsErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </AnalyticsErrorBoundary>
    );
  };
}