/**
 * Base Error Boundary Component
 * Core error boundary with comprehensive error handling, retry logic, and reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  ErrorBoundaryProps,
  ErrorBoundaryState,
  ErrorDetails,
  DEFAULT_RETRY_CONFIG,
  RetryConfig
} from './types';
import {
  createErrorDetails,
  calculateRetryDelay,
  shouldRetry,
  ErrorLogger,
  PerformanceMonitor,
  getUserFriendlyMessage
} from './utils';
import { ErrorFallbackUI } from './ErrorFallbackUI';

export class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private performanceEnd: (() => void) | null = null;
  private retryConfig: RetryConfig;
  private errorLogger: ErrorLogger;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorDetails: null,
      lastRetryAt: null
    };

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...props.retryConfig
    };

    this.errorLogger = ErrorLogger.getInstance();

    // Start performance monitoring for this boundary
    this.performanceEnd = PerformanceMonitor.startMeasurement(
      `error-boundary-${props.level || 'component'}`
    );
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = createErrorDetails(error, {
      ...this.props.context,
      level: this.props.level,
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({
      errorInfo,
      errorDetails
    });

    // Log the error
    if (this.props.enableLogging !== false) {
      this.errorLogger.log(errorDetails, {
        retryCount: this.state.retryCount,
        errorInfo
      });
    }

    // Call error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(errorDetails, errorInfo);
      } catch (handlerError) {
        console.error('Error in onError handler:', handlerError);
      }
    }

    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    if (this.performanceEnd) {
      this.performanceEnd();
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    const { retryCount, lastRetryAt } = this.state;
    return shouldRetry(error, retryCount, this.retryConfig, lastRetryAt);
  }

  private scheduleRetry = (): void => {
    const { retryCount } = this.state;
    const delay = calculateRetryDelay(retryCount, this.retryConfig);

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = (): void => {
    const { retryCount, errorDetails } = this.state;

    if (!errorDetails || retryCount >= this.retryConfig.maxAttempts) {
      return;
    }

    const newRetryCount = retryCount + 1;

    // Call retry handler if provided
    if (this.props.onRetry) {
      try {
        this.props.onRetry(newRetryCount, errorDetails);
      } catch (handlerError) {
        console.error('Error in onRetry handler:', handlerError);
      }
    }

    // Log retry attempt
    this.errorLogger.log({
      ...errorDetails,
      id: `${errorDetails.id}_retry_${newRetryCount}`,
      timestamp: new Date().toISOString(),
      context: {
        ...errorDetails.context,
        retryAttempt: newRetryCount,
        originalErrorId: errorDetails.id
      }
    });

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
      retryCount: newRetryCount,
      lastRetryAt: Date.now()
    });
  };

  private handleManualRetry = (): void => {
    const { errorDetails, retryCount } = this.state;

    if (!errorDetails) return;

    // Check if manual retry is allowed
    if (retryCount >= this.retryConfig.maxAttempts) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    this.handleRetry();
  };

  private handleRecovery = (): void => {
    const { errorDetails } = this.state;

    if (errorDetails && this.props.onRecovery) {
      try {
        this.props.onRecovery(errorDetails);
      } catch (handlerError) {
        console.error('Error in onRecovery handler:', handlerError);
      }
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorDetails: null,
      retryCount: 0,
      lastRetryAt: null
    });
  };

  private createFallbackProps() {
    const { errorDetails, retryCount } = this.state;

    if (!errorDetails) return null;

    const userFriendlyInfo = getUserFriendlyMessage(errorDetails);
    const canRetry = retryCount < this.retryConfig.maxAttempts;

    return {
      errorDetails,
      userFriendlyInfo,
      canRetry,
      retryCount,
      maxRetries: this.retryConfig.maxAttempts,
      onRetry: this.handleManualRetry,
      onRecovery: this.handleRecovery,
      level: this.props.level || 'component'
    };
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback, isolateErrors = true } = this.props;

    if (hasError) {
      const fallbackProps = this.createFallbackProps();

      if (!fallbackProps) {
        return null;
      }

      // Use custom fallback if provided
      if (fallback) {
        if (typeof fallback === 'function') {
          try {
            return fallback(fallbackProps.errorDetails, this.handleManualRetry);
          } catch (fallbackError) {
            console.error('Error in fallback component:', fallbackError);
            return <ErrorFallbackUI {...fallbackProps} />;
          }
        }
        return fallback;
      }

      // Use default error UI
      return <ErrorFallbackUI {...fallbackProps} />;
    }

    // Isolate errors by wrapping children in a container
    if (isolateErrors) {
      return (
        <div className="error-boundary-container">
          {children}
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for easy integration
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    return (
      <BaseErrorBoundary {...errorBoundaryProps}>
        <Component {...(props as any)} ref={ref} />
      </BaseErrorBoundary>
    );
  });

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Hook for error boundary context
export function useErrorBoundary() {
  return {
    throwError: (error: Error) => {
      throw error;
    },
    captureError: (error: Error, context?: Record<string, any>) => {
      const errorDetails = createErrorDetails(error, context);
      ErrorLogger.getInstance().log(errorDetails);
    }
  };
}