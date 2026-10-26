import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';

// Real-time monitoring interface definitions
export interface MonitoringMetrics {
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    lastChecked: string;
  };
  apiPerformance: {
    averageResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    activeConnections: number;
  };
  businessMetrics: {
    liveOrdersCount: number;
    activeUsers: number;
    salesVelocity: number;
    stockAlerts: number;
  };
  aiProcessing: {
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
  };
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  source: 'api' | 'business' | 'ai' | 'system';
  acknowledged: boolean;
  actionRequired: boolean;
}

export interface PerformanceThresholds {
  responseTime: { warning: number; critical: number };
  errorRate: { warning: number; critical: number };
  stockLevel: { warning: number; critical: number };
  processingQueue: { warning: number; critical: number };
}

// Query keys for real-time monitoring
export const REALTIME_MONITORING_QUERY_KEYS = {
  all: ['realtime-monitoring'] as const,
  metrics: () => ['realtime-monitoring', 'metrics'] as const,
  alerts: () => ['realtime-monitoring', 'alerts'] as const,
  performance: () => ['realtime-monitoring', 'performance'] as const,
  systemHealth: () => ['realtime-monitoring', 'system-health'] as const,
} as const;

/**
 * Hook for real-time system monitoring with live metrics
 *
 * @example
 * ```tsx
 * const {
 *   metrics,
 *   alerts,
 *   isHealthy,
 *   startMonitoring,
 *   stopMonitoring
 * } = useRealtimeMonitoring({
 *   refreshInterval: 5000,
 *   alertThresholds: customThresholds
 * });
 * ```
 */
export function useRealtimeMonitoring({
  refreshInterval = 30000, // 30 seconds
  alertThresholds,
  autoStart = true,
}: {
  refreshInterval?: number;
  alertThresholds?: Partial<PerformanceThresholds>;
  autoStart?: boolean;
} = {}) {
  const queryClient = useQueryClient();
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Default thresholds
  const defaultThresholds: PerformanceThresholds = {
    responseTime: { warning: 1000, critical: 3000 },
    errorRate: { warning: 0.05, critical: 0.1 },
    stockLevel: { warning: 10, critical: 5 },
    processingQueue: { warning: 50, critical: 100 },
  };

  const thresholds = { ...defaultThresholds, ...alertThresholds };

  // Simulate real-time metrics (in production, this would connect to WebSocket or SSE)
  const generateMockMetrics = useCallback((): MonitoringMetrics => {
    const now = new Date().toISOString();
    const random = (min: number, max: number) => Math.random() * (max - min) + min;

    const responseTime = random(200, 2000);
    const errorRate = random(0, 0.08);
    const queueSize = Math.floor(random(0, 80));

    // Calculate health score
    const healthFactors = [
      responseTime < thresholds.responseTime.warning ? 25 : responseTime < thresholds.responseTime.critical ? 15 : 0,
      errorRate < thresholds.errorRate.warning ? 25 : errorRate < thresholds.errorRate.critical ? 15 : 0,
      queueSize < thresholds.processingQueue.warning ? 25 : queueSize < thresholds.processingQueue.critical ? 15 : 0,
      25, // Base business health
    ];

    const healthScore = healthFactors.reduce((sum, factor) => sum + factor, 0);
    const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';

    return {
      systemHealth: {
        status: healthStatus,
        score: healthScore,
        lastChecked: now,
      },
      apiPerformance: {
        averageResponseTime: Math.round(responseTime),
        errorRate: Math.round(errorRate * 1000) / 1000,
        requestsPerMinute: Math.floor(random(50, 200)),
        activeConnections: Math.floor(random(10, 50)),
      },
      businessMetrics: {
        liveOrdersCount: Math.floor(random(5, 30)),
        activeUsers: Math.floor(random(20, 100)),
        salesVelocity: Math.round(random(1000, 5000)),
        stockAlerts: Math.floor(random(0, 15)),
      },
      aiProcessing: {
        queued: queueSize,
        processing: Math.floor(random(0, 10)),
        completed: Math.floor(random(100, 500)),
        failed: Math.floor(random(0, 20)),
        averageProcessingTime: Math.round(random(30, 120)),
      },
    };
  }, [thresholds]);

  // Generate alerts based on metrics
  const generateAlerts = useCallback((metrics: MonitoringMetrics): SystemAlert[] => {
    const alerts: SystemAlert[] = [];
    const now = new Date().toISOString();

    // Performance alerts
    if (metrics.apiPerformance.averageResponseTime > thresholds.responseTime.critical) {
      alerts.push({
        id: 'response-time-critical',
        type: 'critical',
        title: 'High Response Time',
        message: `API response time is ${metrics.apiPerformance.averageResponseTime}ms (critical threshold: ${thresholds.responseTime.critical}ms)`,
        timestamp: now,
        source: 'api',
        acknowledged: false,
        actionRequired: true,
      });
    } else if (metrics.apiPerformance.averageResponseTime > thresholds.responseTime.warning) {
      alerts.push({
        id: 'response-time-warning',
        type: 'warning',
        title: 'Elevated Response Time',
        message: `API response time is ${metrics.apiPerformance.averageResponseTime}ms`,
        timestamp: now,
        source: 'api',
        acknowledged: false,
        actionRequired: false,
      });
    }

    // Error rate alerts
    if (metrics.apiPerformance.errorRate > thresholds.errorRate.critical) {
      alerts.push({
        id: 'error-rate-critical',
        type: 'critical',
        title: 'High Error Rate',
        message: `Error rate is ${(metrics.apiPerformance.errorRate * 100).toFixed(1)}%`,
        timestamp: now,
        source: 'api',
        acknowledged: false,
        actionRequired: true,
      });
    }

    // Stock alerts
    if (metrics.businessMetrics.stockAlerts > thresholds.stockLevel.critical) {
      alerts.push({
        id: 'stock-critical',
        type: 'critical',
        title: 'Critical Stock Levels',
        message: `${metrics.businessMetrics.stockAlerts} locations have critical stock levels`,
        timestamp: now,
        source: 'business',
        acknowledged: false,
        actionRequired: true,
      });
    }

    // AI processing queue alerts
    if (metrics.aiProcessing.queued > thresholds.processingQueue.critical) {
      alerts.push({
        id: 'ai-queue-critical',
        type: 'critical',
        title: 'AI Processing Queue Overload',
        message: `${metrics.aiProcessing.queued} files queued for processing`,
        timestamp: now,
        source: 'ai',
        acknowledged: false,
        actionRequired: true,
      });
    }

    return alerts;
  }, [thresholds]);

  // Real-time metrics query
  const metricsQuery = useQuery({
    queryKey: REALTIME_MONITORING_QUERY_KEYS.metrics(),
    queryFn: generateMockMetrics,
    enabled: isMonitoring,
    refetchInterval: isMonitoring ? refreshInterval : false,
    refetchIntervalInBackground: true,
    staleTime: 0, // Always fresh for real-time data
  });

  // Generate alerts based on current metrics
  const alerts = useMemo(() => {
    if (!metricsQuery.data) return [];
    return generateAlerts(metricsQuery.data);
  }, [metricsQuery.data, generateAlerts]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    setConnectionStatus('connecting');

    // Simulate connection establishment
    setTimeout(() => {
      setConnectionStatus('connected');
      setLastUpdate(new Date());
      toast.success('Real-time monitoring started');
    }, 1000);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    setConnectionStatus('disconnected');
    toast.info('Real-time monitoring stopped');
  }, []);

  // Update last update time when data changes
  useEffect(() => {
    if (metricsQuery.data && isMonitoring) {
      setLastUpdate(new Date());
    }
  }, [metricsQuery.data, isMonitoring]);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (autoStart && !isMonitoring) {
      startMonitoring();
    }
  }, [autoStart, isMonitoring, startMonitoring]);

  // Health status derived from metrics
  const isHealthy = metricsQuery.data?.systemHealth.status === 'healthy';
  const hasWarnings = metricsQuery.data?.systemHealth.status === 'warning';
  const isCritical = metricsQuery.data?.systemHealth.status === 'critical';

  // Critical alerts count
  const criticalAlertsCount = alerts.filter(alert => alert.type === 'critical').length;
  const warningAlertsCount = alerts.filter(alert => alert.type === 'warning').length;

  return {
    // Data
    metrics: metricsQuery.data,
    alerts,

    // Status
    isMonitoring,
    connectionStatus,
    lastUpdate,
    isHealthy,
    hasWarnings,
    isCritical,

    // Counts
    criticalAlertsCount,
    warningAlertsCount,
    totalAlertsCount: alerts.length,

    // Controls
    startMonitoring,
    stopMonitoring,

    // Query states
    isLoading: metricsQuery.isLoading,
    isError: metricsQuery.isError,
    error: metricsQuery.error,
    refetch: metricsQuery.refetch,
  };
}

/**
 * Hook for monitoring specific system components
 */
export function useComponentMonitoring(component: 'api' | 'ai' | 'business' | 'system') {
  const { metrics, alerts, isMonitoring } = useRealtimeMonitoring();

  const componentData = useMemo(() => {
    if (!metrics) return null;

    switch (component) {
      case 'api':
        return {
          metrics: metrics.apiPerformance,
          alerts: alerts.filter(alert => alert.source === 'api'),
          status: metrics.apiPerformance.errorRate < 0.05 ? 'healthy' : 'warning',
        };
      case 'ai':
        return {
          metrics: metrics.aiProcessing,
          alerts: alerts.filter(alert => alert.source === 'ai'),
          status: metrics.aiProcessing.queued < 50 ? 'healthy' : 'warning',
        };
      case 'business':
        return {
          metrics: metrics.businessMetrics,
          alerts: alerts.filter(alert => alert.source === 'business'),
          status: metrics.businessMetrics.stockAlerts < 5 ? 'healthy' : 'warning',
        };
      case 'system':
        return {
          metrics: metrics.systemHealth,
          alerts: alerts.filter(alert => alert.source === 'system'),
          status: metrics.systemHealth.status,
        };
      default:
        return null;
    }
  }, [metrics, alerts, component]);

  return {
    data: componentData,
    isMonitoring,
  };
}

/**
 * Hook for alert management
 */
export function useAlertManagement() {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAcknowledgedAlerts(prev => new Set(prev).add(alertId));
    toast.success('Alert acknowledged');
  }, []);

  const acknowledgeAllAlerts = useCallback((alertIds: string[]) => {
    setAcknowledgedAlerts(prev => {
      const newSet = new Set(prev);
      alertIds.forEach(id => newSet.add(id));
      return newSet;
    });
    toast.success(`${alertIds.length} alerts acknowledged`);
  }, []);

  const clearAcknowledged = useCallback(() => {
    setAcknowledgedAlerts(new Set());
    toast.info('Acknowledged alerts cleared');
  }, []);

  return {
    acknowledgedAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    clearAcknowledged,
  };
}

// Types are already exported above with their interface declarations