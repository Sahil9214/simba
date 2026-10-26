/**
 * Error Context and Provider
 * Global error state management and notification system
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  ErrorDetails,
  ErrorMetrics,
  ErrorNotification,
  ErrorReportingConfig,
  ErrorContextValue,
  ErrorCategory,
  ErrorSeverity,
  DEFAULT_ERROR_REPORTING_CONFIG
} from './types';
import { createErrorDetails, ErrorLogger } from './utils';

// Error state management
interface ErrorState {
  errors: ErrorDetails[];
  notifications: ErrorNotification[];
  metrics: ErrorMetrics;
  reportingConfig: ErrorReportingConfig;
  isReportingEnabled: boolean;
}

type ErrorAction =
  | { type: 'ADD_ERROR'; payload: ErrorDetails }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'ADD_NOTIFICATION'; payload: ErrorNotification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_METRICS'; payload: Partial<ErrorMetrics> }
  | { type: 'SET_REPORTING_CONFIG'; payload: Partial<ErrorReportingConfig> }
  | { type: 'TOGGLE_REPORTING'; payload: boolean };

const initialState: ErrorState = {
  errors: [],
  notifications: [],
  metrics: {
    totalErrors: 0,
    errorsByCategory: {} as Record<ErrorCategory, number>,
    errorsBySeverity: {} as Record<ErrorSeverity, number>,
    retrySuccess: 0,
    retryFailure: 0,
    averageRecoveryTime: 0,
    lastUpdated: new Date().toISOString()
  },
  reportingConfig: DEFAULT_ERROR_REPORTING_CONFIG,
  isReportingEnabled: true
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR':
      const newError = action.payload;
      const updatedErrors = [...state.errors, newError].slice(-50); // Keep last 50 errors

      // Update metrics
      const updatedMetrics = {
        ...state.metrics,
        totalErrors: state.metrics.totalErrors + 1,
        errorsByCategory: {
          ...state.metrics.errorsByCategory,
          [newError.category]: (state.metrics.errorsByCategory[newError.category] || 0) + 1
        },
        errorsBySeverity: {
          ...state.metrics.errorsBySeverity,
          [newError.severity]: (state.metrics.errorsBySeverity[newError.severity] || 0) + 1
        },
        lastUpdated: new Date().toISOString()
      };

      return {
        ...state,
        errors: updatedErrors,
        metrics: updatedMetrics
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload)
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: []
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        }
      };

    case 'SET_REPORTING_CONFIG':
      return {
        ...state,
        reportingConfig: {
          ...state.reportingConfig,
          ...action.payload
        }
      };

    case 'TOGGLE_REPORTING':
      return {
        ...state,
        isReportingEnabled: action.payload
      };

    default:
      return state;
  }
}

// Context creation
const ErrorContext = createContext<ErrorContextValue | null>(null);

// Provider component
interface ErrorProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<ErrorReportingConfig>;
}

export function ErrorProvider({ children, initialConfig }: ErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, {
    ...initialState,
    reportingConfig: {
      ...DEFAULT_ERROR_REPORTING_CONFIG,
      ...initialConfig
    }
  });

  const errorLogger = ErrorLogger.getInstance();

  // Auto-remove notifications after timeout
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    state.notifications.forEach(notification => {
      if (notification.autoClose !== false) {
        const timeout = setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, notification.duration || 5000);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [state.notifications]);

  // Sync with error logger metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const loggerStats = errorLogger.getErrorStats();
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          totalErrors: loggerStats.total,
          errorsByCategory: loggerStats.byCategory,
          errorsBySeverity: loggerStats.bySeverity
        }
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [errorLogger]);

  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorDetails = createErrorDetails(error, {
      ...context,
      reportedAt: new Date().toISOString()
    });

    // Add to state
    dispatch({ type: 'ADD_ERROR', payload: errorDetails });

    // Log through error logger
    if (state.isReportingEnabled) {
      errorLogger.log(errorDetails, context);
    }

    // Create notification for high/critical errors
    if (errorDetails.severity === 'high' || errorDetails.severity === 'critical') {
      const notification: ErrorNotification = {
        id: `notif_${errorDetails.id}`,
        type: 'error',
        title: 'Error Occurred',
        message: `${errorDetails.category} error: ${errorDetails.message.slice(0, 100)}...`,
        autoClose: true,
        duration: 8000,
        actions: [
          {
            label: 'Dismiss',
            action: () => dispatch({ type: 'REMOVE_NOTIFICATION', payload: `notif_${errorDetails.id}` }),
            variant: 'secondary'
          }
        ]
      };

      dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    }
  }, [state.isReportingEnabled, errorLogger]);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
    errorLogger.clearBuffer();
  }, [errorLogger]);

  const getErrorMetrics = useCallback(() => {
    return state.metrics;
  }, [state.metrics]);

  const setErrorReportingConfig = useCallback((config: Partial<ErrorReportingConfig>) => {
    dispatch({ type: 'SET_REPORTING_CONFIG', payload: config });
  }, []);

  const addErrorNotification = useCallback((notification: Omit<ErrorNotification, 'id'>) => {
    const fullNotification: ErrorNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  }, []);

  const removeErrorNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const contextValue: ErrorContextValue = {
    reportError,
    clearErrors,
    getErrorMetrics,
    setErrorReportingConfig,
    addErrorNotification,
    removeErrorNotification
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      <ErrorNotificationSystem
        notifications={state.notifications}
        onRemove={removeErrorNotification}
      />
    </ErrorContext.Provider>
  );
}

// Hook to use error context
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Notification system component
interface ErrorNotificationSystemProps {
  notifications: ErrorNotification[];
  onRemove: (id: string) => void;
}

function ErrorNotificationSystem({ notifications, onRemove }: ErrorNotificationSystemProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <ErrorNotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// Individual notification component
interface ErrorNotificationItemProps {
  notification: ErrorNotification;
  onRemove: (id: string) => void;
}

function ErrorNotificationItem({ notification, onRemove }: ErrorNotificationItemProps) {
  const { id, type, title, message, actions } = notification;

  const getNotificationStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 shadow-lg ${getNotificationStyles()}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs mt-1 opacity-90">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="ml-2 opacity-60 hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-3 flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`text-xs px-3 py-1 rounded ${
                action.variant === 'primary'
                  ? 'bg-current text-white opacity-90 hover:opacity-100'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const { reportError, addErrorNotification } = useErrorContext();

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<any>,
    options?: {
      context?: Record<string, any>;
      showNotification?: boolean;
      notificationTitle?: string;
      fallbackValue?: any;
    }
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));

      reportError(errorInstance, options?.context);

      if (options?.showNotification) {
        addErrorNotification({
          type: 'error',
          title: options.notificationTitle || 'Operation Failed',
          message: errorInstance.message,
          autoClose: true,
          duration: 5000
        });
      }

      return options?.fallbackValue;
    }
  }, [reportError, addErrorNotification]);

  const handleSyncError = useCallback((
    syncFn: () => any,
    options?: {
      context?: Record<string, any>;
      showNotification?: boolean;
      notificationTitle?: string;
      fallbackValue?: any;
    }
  ) => {
    try {
      return syncFn();
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));

      reportError(errorInstance, options?.context);

      if (options?.showNotification) {
        addErrorNotification({
          type: 'error',
          title: options.notificationTitle || 'Operation Failed',
          message: errorInstance.message,
          autoClose: true,
          duration: 5000
        });
      }

      return options?.fallbackValue;
    }
  }, [reportError, addErrorNotification]);

  return {
    handleAsyncError,
    handleSyncError,
    reportError,
    addErrorNotification
  };
}