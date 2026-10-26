/**
 * Error Boundary Utilities
 * Helper functions for error handling, retry logic, and error reporting
 */

import {
  ErrorDetails,
  RetryConfig,
  ErrorCategory,
  ErrorSeverity,
  RetryStrategy,
  ErrorClassification
} from './types';

/**
 * Generate unique error ID
 */
export function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create comprehensive error details
 */
export function createErrorDetails(
  error: Error,
  context?: Record<string, any>
): ErrorDetails {
  const category = ErrorClassification.getCategory(error);
  const severity = ErrorClassification.getSeverity(error, category);

  return {
    id: generateErrorId(),
    message: error.message,
    stack: error.stack,
    severity,
    category,
    timestamp: new Date().toISOString(),
    context,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userId: context?.userId,
    sessionId: context?.sessionId || generateSessionId()
  };
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate retry delay based on strategy
 */
export function calculateRetryDelay(
  retryCount: number,
  config: RetryConfig
): number {
  const { strategy, baseDelay, maxDelay, backoffMultiplier } = config;

  let delay: number;

  switch (strategy) {
    case 'immediate':
      delay = 0;
      break;
    case 'linear':
      delay = baseDelay * (retryCount + 1);
      break;
    case 'exponential':
      delay = baseDelay * Math.pow(backoffMultiplier, retryCount);
      break;
    default:
      delay = baseDelay;
  }

  return Math.min(delay, maxDelay);
}

/**
 * Check if retry should be attempted
 */
export function shouldRetry(
  error: Error,
  retryCount: number,
  config: RetryConfig,
  lastRetryAt: number | null
): boolean {
  // Check max attempts
  if (retryCount >= config.maxAttempts) {
    return false;
  }

  // Check minimum time between retries (prevent rapid retries)
  const now = Date.now();
  const minTimeBetweenRetries = 500; // 500ms minimum
  if (lastRetryAt && (now - lastRetryAt) < minTimeBetweenRetries) {
    return false;
  }

  // Check if error type is retryable
  const category = ErrorClassification.getCategory(error);
  const severity = ErrorClassification.getSeverity(error, category);

  return ErrorClassification.shouldRetry(category, severity);
}

/**
 * Enhanced error logger with structured data
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private errorBuffer: ErrorDetails[] = [];
  private maxBufferSize = 100;

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  log(errorDetails: ErrorDetails, additionalContext?: Record<string, any>): void {
    const enhancedError = {
      ...errorDetails,
      context: {
        ...errorDetails.context,
        ...additionalContext
      }
    };

    // Add to buffer
    this.errorBuffer.push(enhancedError);
    if (this.errorBuffer.length > this.maxBufferSize) {
      this.errorBuffer.shift();
    }

    // Console logging with structured format
    const logLevel = this.getLogLevel(errorDetails.severity);
    console[logLevel]('🚨 Error Boundary Caught Error:', {
      id: errorDetails.id,
      message: errorDetails.message,
      category: errorDetails.category,
      severity: errorDetails.severity,
      timestamp: errorDetails.timestamp,
      context: enhancedError.context,
      stack: errorDetails.stack
    });

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production' && this.shouldReportError(errorDetails)) {
      this.sendToMonitoringService(enhancedError);
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }

  private shouldReportError(errorDetails: ErrorDetails): boolean {
    // Rate limiting and filtering logic
    const recentErrors = this.errorBuffer.filter(
      err => Date.now() - new Date(err.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    // Don't report if too many similar errors recently
    const similarErrors = recentErrors.filter(
      err => err.message === errorDetails.message && err.category === errorDetails.category
    );

    return similarErrors.length <= 3; // Max 3 similar errors per 5 minutes
  }

  private async sendToMonitoringService(errorDetails: ErrorDetails): Promise<void> {
    try {
      // This would integrate with your monitoring service (Sentry, LogRocket, etc.)
      const payload = {
        ...errorDetails,
        environment: process.env.NODE_ENV,
        version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        buildId: process.env.NEXT_PUBLIC_BUILD_ID || 'unknown'
      };

      // Example: Send to custom endpoint
      if (process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_ERROR_REPORTING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (reportingError) {
      console.warn('Failed to report error to monitoring service:', reportingError);
    }
  }

  getRecentErrors(limit = 10): ErrorDetails[] {
    return this.errorBuffer.slice(-limit);
  }

  clearBuffer(): void {
    this.errorBuffer = [];
  }

  getErrorStats() {
    const now = Date.now();
    const last24Hours = this.errorBuffer.filter(
      err => now - new Date(err.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const byCategory = last24Hours.reduce((acc, err) => {
      acc[err.category] = (acc[err.category] || 0) + 1;
      return acc;
    }, {} as Record<ErrorCategory, number>);

    const bySeverity = last24Hours.reduce((acc, err) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>);

    return {
      total: last24Hours.length,
      byCategory,
      bySeverity,
      lastError: this.errorBuffer[this.errorBuffer.length - 1]
    };
  }
}

/**
 * Performance monitoring for error-prone areas
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(key: string): () => void {
    const start = performance.now();

    return () => {
      const duration = performance.now() - start;
      const existing = this.measurements.get(key) || [];
      existing.push(duration);

      // Keep only last 100 measurements
      if (existing.length > 100) {
        existing.shift();
      }

      this.measurements.set(key, existing);

      // Log slow operations
      if (duration > 1000) { // > 1 second
        console.warn(`🐌 Slow operation detected: ${key} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  static getStats(key: string) {
    const measurements = this.measurements.get(key) || [];
    if (measurements.length === 0) return null;

    const sorted = [...measurements].sort((a, b) => a - b);
    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    return {
      count: measurements.length,
      average: Math.round(avg),
      p50: Math.round(p50),
      p95: Math.round(p95),
      p99: Math.round(p99),
      min: Math.round(sorted[0]),
      max: Math.round(sorted[sorted.length - 1])
    };
  }

  static getAllStats() {
    const stats: Record<string, any> = {};
    for (const [key] of this.measurements) {
      stats[key] = this.getStats(key);
    }
    return stats;
  }
}

/**
 * Network status utilities
 */
export class NetworkMonitor {
  private static listeners: Set<(isOnline: boolean) => void> = new Set();
  private static isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  static {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners(true);
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners(false);
      });
    }
  }

  static addListener(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  static getStatus() {
    return this.isOnline;
  }

  private static notifyListeners(isOnline: boolean) {
    this.listeners.forEach(callback => callback(isOnline));
  }
}

/**
 * Utility to create user-friendly error messages
 */
export function getUserFriendlyMessage(error: ErrorDetails): {
  title: string;
  message: string;
  suggestions: string[];
} {
  const { category, severity, message } = error;
  const isOffline = !NetworkMonitor.getStatus();

  // Network-related errors
  if (category === 'network' || isOffline) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      suggestions: [
        'Check your internet connection',
        'Try again in a few moments',
        'Refresh the page if the problem persists'
      ]
    };
  }

  // API errors
  if (category === 'api') {
    if (message.includes('500')) {
      return {
        title: 'Server Error',
        message: 'Our servers are experiencing issues. Please try again shortly.',
        suggestions: [
          'Wait a few minutes and try again',
          'Refresh the page',
          'Contact support if the problem continues'
        ]
      };
    }

    if (message.includes('401') || message.includes('403')) {
      return {
        title: 'Access Denied',
        message: 'You may need to log in again to access this feature.',
        suggestions: [
          'Try logging out and back in',
          'Check with your administrator for access',
          'Refresh the page'
        ]
      };
    }

    return {
      title: 'Data Loading Error',
      message: 'We\'re having trouble loading your data. This is usually temporary.',
      suggestions: [
        'Click retry to try again',
        'Refresh the page',
        'Check your internet connection'
      ]
    };
  }

  // Upload errors
  if (category === 'upload') {
    return {
      title: 'Upload Failed',
      message: 'There was a problem uploading your file. Please try again.',
      suggestions: [
        'Check your file size and format',
        'Ensure you have a stable internet connection',
        'Try uploading a different file to test'
      ]
    };
  }

  // Chart rendering errors
  if (category === 'chart') {
    return {
      title: 'Chart Display Error',
      message: 'Unable to display this chart. The data might be loading or there could be a temporary issue.',
      suggestions: [
        'Try refreshing the page',
        'Check if other charts are working',
        'Try again in a few moments'
      ]
    };
  }

  // Authentication errors
  if (category === 'auth') {
    return {
      title: 'Authentication Error',
      message: 'You may need to log in again to continue using the application.',
      suggestions: [
        'Log out and log back in',
        'Check your session hasn\'t expired',
        'Contact support if you continue having issues'
      ]
    };
  }

  // Default fallback
  return {
    title: severity === 'critical' ? 'Critical Error' : 'Something Went Wrong',
    message: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
    suggestions: [
      'Try refreshing the page',
      'Clear your browser cache',
      'Contact support if the problem persists'
    ]
  };
}