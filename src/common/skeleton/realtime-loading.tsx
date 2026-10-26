"use client";

import React, { useState, useEffect } from "react";
import { clsx } from "clsx";
import { Zap, Wifi, WifiOff, RefreshCw, AlertTriangle } from "lucide-react";

// Real-time data loading indicator
export interface RealTimeIndicatorProps {
  isConnected: boolean;
  isLoading: boolean;
  lastUpdate?: Date;
  connectionQuality?: "excellent" | "good" | "fair" | "poor" | "offline";
  dataSource?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onRefresh?: () => void;
  className?: string;
}

export function RealTimeIndicator({
  isConnected,
  isLoading,
  lastUpdate,
  connectionQuality = "good",
  dataSource,
  autoRefresh = true,
  refreshInterval = 30000,
  onRefresh,
  className
}: RealTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  // Update time ago display
  useEffect(() => {
    if (!lastUpdate) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo("Over 1h ago");
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !isConnected || isLoading) return;

    const interval = setInterval(() => {
      onRefresh?.();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, isLoading, refreshInterval, onRefresh]);

  const getStatusColor = () => {
    if (!isConnected) return "text-red-500 bg-red-50";
    if (isLoading) return "text-blue-500 bg-blue-50";

    switch (connectionQuality) {
      case "excellent":
        return "text-green-500 bg-green-50";
      case "good":
        return "text-green-500 bg-green-50";
      case "fair":
        return "text-yellow-500 bg-yellow-50";
      case "poor":
        return "text-orange-500 bg-orange-50";
      case "offline":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getStatusIcon = () => {
    if (!isConnected) return WifiOff;
    if (isLoading) return RefreshCw;

    switch (connectionQuality) {
      case "excellent":
      case "good":
        return Zap;
      case "fair":
      case "poor":
        return Wifi;
      case "offline":
        return WifiOff;
      default:
        return Wifi;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className={clsx(
      "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
      getStatusColor(),
      className
    )}>
      <StatusIcon className={clsx(
        "w-4 h-4",
        isLoading && "animate-spin"
      )} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
        <span className="font-medium">
          {!isConnected ? "Offline" :
           isLoading ? "Updating..." :
           "Live"}
        </span>

        {lastUpdate && (
          <span className="opacity-75">
            {timeAgo}
          </span>
        )}

        {dataSource && (
          <span className="opacity-60">
            • {dataSource}
          </span>
        )}
      </div>

      {!isLoading && onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Loading progress with stages
export interface LoadingProgressProps {
  stages: {
    name: string;
    status: "pending" | "active" | "completed" | "error";
    duration?: number;
    message?: string;
  }[];
  currentStage?: number;
  overallProgress?: number;
  showStageDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function LoadingProgress({
  stages,
  currentStage = 0,
  overallProgress,
  showStageDetails = true,
  compact = false,
  className
}: LoadingProgressProps) {
  const getStageIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "active":
        return "○";
      case "error":
        return "✗";
      default:
        return "○";
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "active":
        return "text-blue-600 bg-blue-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-400 bg-gray-50";
    }
  };

  const progress = overallProgress ?? ((currentStage / stages.length) * 100);

  if (compact) {
    return (
      <div className={clsx("space-y-2", className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {stages[currentStage]?.name || "Loading..."}
          </span>
          <span className="text-gray-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Overall progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Loading Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stage details */}
      {showStageDetails && (
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={stage.name}
              className={clsx(
                "flex items-center gap-3 p-2 rounded-lg text-sm transition-all",
                getStageColor(stage.status)
              )}
            >
              <span className="font-mono text-xs">
                {getStageIcon(stage.status)}
              </span>
              <span className="font-medium">{stage.name}</span>
              {stage.message && (
                <span className="text-xs opacity-75">
                  — {stage.message}
                </span>
              )}
              {stage.status === "active" && (
                <div className="ml-auto">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Data freshness indicator
export function DataFreshness({
  lastUpdate,
  maxAge = 300000, // 5 minutes
  className
}: {
  lastUpdate: Date;
  maxAge?: number;
  className?: string;
}) {
  const [freshness, setFreshness] = useState<"fresh" | "stale" | "expired">("fresh");

  useEffect(() => {
    const checkFreshness = () => {
      const age = Date.now() - lastUpdate.getTime();

      if (age < maxAge / 2) {
        setFreshness("fresh");
      } else if (age < maxAge) {
        setFreshness("stale");
      } else {
        setFreshness("expired");
      }
    };

    checkFreshness();
    const interval = setInterval(checkFreshness, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, [lastUpdate, maxAge]);

  const getIndicatorClass = () => {
    switch (freshness) {
      case "fresh":
        return "bg-green-500";
      case "stale":
        return "bg-yellow-500";
      case "expired":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getFreshnessText = () => {
    switch (freshness) {
      case "fresh":
        return "Data is current";
      case "stale":
        return "Data may be outdated";
      case "expired":
        return "Data needs refresh";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={clsx("flex items-center gap-2 text-xs", className)}>
      <div className={clsx(
        "w-2 h-2 rounded-full",
        getIndicatorClass(),
        freshness === "fresh" && "animate-pulse"
      )} />
      <span className="text-gray-600">{getFreshnessText()}</span>
    </div>
  );
}

// Loading overlay for components
export function LoadingOverlay({
  isVisible,
  message = "Loading...",
  progress,
  children,
  blur = true,
  className
}: {
  isVisible: boolean;
  message?: string;
  progress?: number;
  children?: React.ReactNode;
  blur?: boolean;
  className?: string;
}) {
  if (!isVisible) return null;

  return (
    <div className={clsx(
      "absolute inset-0 z-50 flex items-center justify-center",
      blur ? "backdrop-blur-sm bg-white/80" : "bg-white/90",
      className
    )}>
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          {progress !== undefined && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{Math.round(progress)}%</span>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// Smart loading state that adapts to connection
export function AdaptiveLoader({
  isLoading,
  connectionSpeed = "fast",
  children,
  fallback,
  timeout = 10000
}: {
  isLoading: boolean;
  connectionSpeed?: "fast" | "slow" | "offline";
  children: React.ReactNode;
  fallback: React.ReactNode;
  timeout?: number;
}) {
  const [showFallback, setShowFallback] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      setTimedOut(false);
      return;
    }

    // Show fallback immediately for slow connections
    if (connectionSpeed === "slow") {
      setShowFallback(true);
    }

    // Set timeout for all connections
    const timer = setTimeout(() => {
      setTimedOut(true);
      setShowFallback(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, connectionSpeed, timeout]);

  if (connectionSpeed === "offline") {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="space-y-3">
          <WifiOff className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">
            You&apos;re currently offline. Please check your connection.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && (showFallback || connectionSpeed === "slow")) {
    return (
      <div className="relative">
        {fallback}
        {timedOut && (
          <div className="absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Taking longer than expected...</span>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export default RealTimeIndicator;