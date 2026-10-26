/**
 * Error Fallback UI Components
 * Reusable fallback interfaces for different error scenarios
 */

import React from 'react';
import {
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  WifiOff,
  Server,
  Upload,
  BarChart3,
  Shield,
  AlertCircle
} from 'lucide-react';
import { ErrorDetails } from './types';
import { NetworkMonitor } from './utils';

interface ErrorFallbackUIProps {
  errorDetails: ErrorDetails;
  userFriendlyInfo: {
    title: string;
    message: string;
    suggestions: string[];
  };
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onRecovery: () => void;
  level: 'component' | 'feature' | 'page' | 'app';
}

export function ErrorFallbackUI({
  errorDetails,
  userFriendlyInfo,
  canRetry,
  retryCount,
  maxRetries,
  onRetry,
  onRecovery,
  level
}: ErrorFallbackUIProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(NetworkMonitor.getStatus());

  React.useEffect(() => {
    const unsubscribe = NetworkMonitor.addListener(setIsOnline);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleCopyError = async () => {
    const errorReport = {
      id: errorDetails.id,
      message: errorDetails.message,
      category: errorDetails.category,
      severity: errorDetails.severity,
      timestamp: errorDetails.timestamp,
      url: errorDetails.url,
      userAgent: errorDetails.userAgent,
      stack: errorDetails.stack,
      context: errorDetails.context
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  const getErrorIcon = () => {
    switch (errorDetails.category) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-blue-500" />;
      case 'api':
        return <Server className="h-12 w-12 text-red-500" />;
      case 'upload':
        return <Upload className="h-12 w-12 text-yellow-500" />;
      case 'chart':
        return <BarChart3 className="h-12 w-12 text-purple-500" />;
      case 'auth':
        return <Shield className="h-12 w-12 text-orange-500" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-red-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (errorDetails.severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getContainerSize = () => {
    switch (level) {
      case 'app':
        return 'min-h-screen flex items-center justify-center p-4';
      case 'page':
        return 'min-h-[60vh] flex items-center justify-center p-6';
      case 'feature':
        return 'min-h-[40vh] flex items-center justify-center p-4';
      default:
        return 'min-h-[200px] flex items-center justify-center p-4';
    }
  };

  return (
    <div className={getContainerSize()}>
      <div className={`w-full max-w-md bg-white shadow-lg rounded-2xl border-2 ${getSeverityColor()}`}>
        {/* Header */}
        <div className="text-center p-6 pb-4">
          <div className="mb-4 flex justify-center">
            {getErrorIcon()}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {userFriendlyInfo.title}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {userFriendlyInfo.message}
          </p>

          {/* Network status indicator */}
          {!isOnline && (
            <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-gray-100 rounded-lg">
              <WifiOff className="h-4 w-4 text-red-500" />
              <span className="text-xs text-gray-700">No internet connection</span>
            </div>
          )}
        </div>

        {/* Error ID and basic info */}
        <div className="px-6 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Error ID: {errorDetails.id.slice(-8)}</span>
            <span>{new Date(errorDetails.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Suggestions */}
        {userFriendlyInfo.suggestions.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">What you can try:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {userFriendlyInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            {canRetry && (
              <button
                onClick={onRetry}
                disabled={!isOnline && errorDetails.category === 'network'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry ({maxRetries - retryCount} left)
              </button>
            )}

            <button
              onClick={onRecovery}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <AlertCircle className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Technical Details Toggle */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-3 text-left text-xs text-gray-500 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span>Technical Details</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          {showDetails && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Category:</label>
                  <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border">
                    {errorDetails.category} ({errorDetails.severity})
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-700">Message:</label>
                  <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border break-all">
                    {errorDetails.message}
                  </div>
                </div>

                {errorDetails.context && Object.keys(errorDetails.context).length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-700">Context:</label>
                    <div className="text-xs text-gray-600 font-mono bg-white p-2 rounded border max-h-20 overflow-y-auto">
                      {JSON.stringify(errorDetails.context, null, 2)}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyError}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied!' : 'Copy Details'}
                  </button>

                  <a
                    href={`mailto:support@simba.com?subject=Error Report ${errorDetails.id}&body=${encodeURIComponent(JSON.stringify(errorDetails, null, 2))}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Report
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal fallback for critical scenarios
export function MinimalErrorFallback({ message }: { message: string }) {
  return (
    <div className="min-h-[100px] flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700 font-medium">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-red-600 underline hover:no-underline"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

// Loading state that can handle errors
export function ErrorAwareLoading({
  isLoading,
  error,
  onRetry
}: {
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
          <p className="text-sm text-yellow-800">Failed to load</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 text-xs text-yellow-700 underline hover:no-underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
}