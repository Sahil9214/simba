"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Loading state types
export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  stage?: string;
  message?: string;
  error?: string | null;
  startTime?: number;
}

export interface LoadingContextType {
  loadingStates: Record<string, LoadingState>;
  setLoadingState: (key: string, state: Partial<LoadingState>) => void;
  removeLoadingState: (key: string) => void;
  clearAllLoading: () => void;
  getLoadingState: (key: string) => LoadingState | null;
}

// Default loading state
const defaultLoadingState: LoadingState = {
  isLoading: false,
  progress: 0,
  stage: '',
  message: '',
  error: null,
  startTime: Date.now()
};

// Create context
const LoadingContext = createContext<LoadingContextType | null>(null);

// Loading state provider
export function LoadingStateProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Record<string, LoadingState>>({});

  const setLoadingState = (key: string, state: Partial<LoadingState>) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: {
        ...defaultLoadingState,
        ...prev[key],
        ...state,
        startTime: prev[key]?.startTime || Date.now()
      }
    }));
  };

  const removeLoadingState = (key: string) => {
    setLoadingStates(prev => {
      const { [key]: removed, ...rest } = prev;
      return rest;
    });
  };

  const clearAllLoading = () => {
    setLoadingStates({});
  };

  const getLoadingState = (key: string): LoadingState | null => {
    return loadingStates[key] || null;
  };

  const contextValue: LoadingContextType = {
    loadingStates,
    setLoadingState,
    removeLoadingState,
    clearAllLoading,
    getLoadingState
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

// Hook to use loading context
export function useLoadingState() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingState must be used within a LoadingStateProvider');
  }
  return context;
}

// Hook for individual loading states with automatic cleanup
export function useComponentLoading(key: string, autoRemove: boolean = true) {
  const { setLoadingState, removeLoadingState, getLoadingState } = useLoadingState();

  const loadingState = getLoadingState(key);

  const startLoading = (message?: string, stage?: string) => {
    setLoadingState(key, {
      isLoading: true,
      progress: 0,
      message: message || 'Loading...',
      stage: stage || 'initializing',
      error: null
    });
  };

  const updateProgress = (progress: number, message?: string, stage?: string) => {
    setLoadingState(key, {
      isLoading: true,
      progress: Math.min(Math.max(progress, 0), 100),
      message,
      stage
    });
  };

  const finishLoading = (message?: string) => {
    setLoadingState(key, {
      isLoading: false,
      progress: 100,
      message: message || 'Complete',
      stage: 'completed'
    });

    if (autoRemove) {
      setTimeout(() => removeLoadingState(key), 1000);
    }
  };

  const setError = (error: string) => {
    setLoadingState(key, {
      isLoading: false,
      error,
      stage: 'error'
    });
  };

  const clearLoading = () => {
    removeLoadingState(key);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoRemove) {
        removeLoadingState(key);
      }
    };
  }, [key, autoRemove, removeLoadingState]);

  return {
    loadingState,
    isLoading: loadingState?.isLoading || false,
    progress: loadingState?.progress || 0,
    message: loadingState?.message || '',
    stage: loadingState?.stage || '',
    error: loadingState?.error,
    startLoading,
    updateProgress,
    finishLoading,
    setError,
    clearLoading
  };
}

// Hook for progressive data loading
export function useProgressiveLoading<T>(
  key: string,
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: {
    stages?: string[];
    stageMessages?: Record<string, string>;
    autoStart?: boolean;
    retryCount?: number;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [attempt, setAttempt] = useState(0);
  const {
    loadingState,
    isLoading,
    startLoading,
    updateProgress,
    finishLoading,
    setError
  } = useComponentLoading(key);

  const {
    stages = ['fetching', 'processing', 'completing'],
    stageMessages = {
      fetching: 'Fetching data...',
      processing: 'Processing results...',
      completing: 'Finalizing...'
    },
    autoStart = true,
    retryCount = 2
  } = options;

  const executeLoad = async () => {
    if (isLoading) return;

    try {
      setData(null);
      startLoading(stageMessages.fetching || 'Loading...', 'fetching');

      // Simulate progressive stages
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const progress = ((i + 1) / stages.length) * 90; // Leave 10% for completion

        updateProgress(
          progress,
          stageMessages[stage] || `Stage ${i + 1}...`,
          stage
        );

        // Small delay to show progression
        if (i < stages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      // Execute the actual fetch
      const result = await fetchFn();

      // Complete
      updateProgress(100, 'Complete', 'completed');
      setData(result);
      finishLoading('Data loaded successfully');
      setAttempt(0);

    } catch (error) {
      console.error(`Loading failed for ${key}:`, error);

      if (attempt < retryCount) {
        setAttempt(prev => prev + 1);
        setTimeout(() => executeLoad(), 1000 * (attempt + 1)); // Exponential backoff
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load data');
      }
    }
  };

  // Auto start on mount or deps change
  useEffect(() => {
    if (autoStart) {
      executeLoad();
    }
  }, [autoStart, ...deps]);

  const retry = () => {
    setAttempt(0);
    executeLoad();
  };

  return {
    data,
    loadingState,
    isLoading,
    error: loadingState?.error,
    progress: loadingState?.progress || 0,
    stage: loadingState?.stage || '',
    message: loadingState?.message || '',
    retry,
    refetch: executeLoad
  };
}

// Progressive component wrapper
export function ProgressiveLoader<T>({
  loadingKey,
  fetchFn,
  deps = [],
  stages,
  stageMessages,
  renderSkeleton,
  renderError,
  children,
  retryCount = 2
}: {
  loadingKey: string;
  fetchFn: () => Promise<T>;
  deps?: React.DependencyList;
  stages?: string[];
  stageMessages?: Record<string, string>;
  renderSkeleton: (stage: string, progress: number) => ReactNode;
  renderError?: (error: string, retry: () => void) => ReactNode;
  children: (data: T, progress: number) => ReactNode;
  retryCount?: number;
}) {
  const {
    data,
    isLoading,
    error,
    progress,
    stage,
    retry
  } = useProgressiveLoading(loadingKey, fetchFn, deps, {
    stages,
    stageMessages,
    retryCount
  });

  if (error) {
    if (renderError) {
      return <>{renderError(error, retry)}</>;
    }

    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="space-y-4">
          <div className="text-red-600">
            <p className="font-medium">Failed to load data</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
          <button
            onClick={retry}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return <>{renderSkeleton(stage, progress)}</>;
  }

  return <>{children(data, progress)}</>;
}

// Loading performance monitor
export function useLoadingPerformance() {
  const { loadingStates } = useLoadingState();

  const getLoadingMetrics = () => {
    const states = Object.entries(loadingStates);
    const active = states.filter(([_, state]) => state.isLoading);
    const completed = states.filter(([_, state]) => !state.isLoading && !state.error);
    const failed = states.filter(([_, state]) => state.error);

    const avgDuration = completed.length > 0
      ? completed.reduce((sum, [_, state]) =>
          sum + (Date.now() - (state.startTime || Date.now())), 0) / completed.length
      : 0;

    return {
      totalStates: states.length,
      activeLoading: active.length,
      completedLoading: completed.length,
      failedLoading: failed.length,
      averageDuration: Math.round(avgDuration),
      successRate: states.length > 0 ? (completed.length / states.length) * 100 : 100
    };
  };

  return { getLoadingMetrics, loadingStates };
}

export default LoadingStateProvider;