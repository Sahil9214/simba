'use client';

import React, { useState, useMemo } from 'react';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, TrendingUp, TrendingDown, Clock, Users, Target, RefreshCw, Download } from 'lucide-react';

import { 
  useAIPerformanceDashboard, 
  useAIPerformanceAlerts,
  useRefreshAIPerformance,
  useAIPerformanceSubscription,
  usePerformanceThresholds 
} from '@/hooks/api/useAIPerformance';
import type { AIAnalyticsTimeRange } from '@/lib/types/aiAnalytics.types';

// Chart components (dynamically imported to reduce bundle size)
import { Suspense, lazy } from 'react';
const AccuracyChart = lazy(() => import('./charts/AccuracyChart'));
const ProcessingTimeChart = lazy(() => import('./charts/ProcessingTimeChart'));
const ConfidenceChart = lazy(() => import('./charts/ConfidenceChart'));
const VolumeChart = lazy(() => import('./charts/VolumeChart'));
const ErrorAnalysisChart = lazy(() => import('./charts/ErrorAnalysisChart'));
const UserActivityChart = lazy(() => import('./charts/UserActivityChart'));

// Time range options
const TIME_RANGES = [
  { label: 'Last Hour', value: 'hour', hours: 1 },
  { label: 'Last 4 Hours', value: '4hours', hours: 4 },
  { label: 'Last 24 Hours', value: '24hours', hours: 24 },
  { label: 'Last 7 Days', value: '7days', hours: 24 * 7 },
  { label: 'Last 30 Days', value: '30days', hours: 24 * 30 },
] as const;

type TimeRangeValue = typeof TIME_RANGES[number]['value'];

export function AIPerformanceDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeValue>('24hours');
  
  // Calculate time range based on selection
  const timeRange: AIAnalyticsTimeRange = useMemo(() => {
    const now = new Date();
    const selectedRange = TIME_RANGES.find(r => r.value === selectedTimeRange);
    const hours = selectedRange?.hours || 24;
    
    return {
      startDate: subHours(now, hours).toISOString(),
      endDate: now.toISOString(),
    };
  }, [selectedTimeRange]);

  // Hooks for data fetching
  const { data: dashboardData, isLoading, error, refetch } = useAIPerformanceDashboard(timeRange);
  const { data: alerts } = useAIPerformanceAlerts();
  const refreshMutation = useRefreshAIPerformance();
  const { checkThresholds } = usePerformanceThresholds();
  
  // Set up real-time subscriptions
  useAIPerformanceSubscription(timeRange);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshMutation.mutateAsync(timeRange);
    refetch();
  };

  // Check performance thresholds
  const thresholdIssues = dashboardData ? checkThresholds(dashboardData) : [];

  // Performance summary cards
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatChange = (value: number, isPercentage = false) => {
    const suffix = isPercentage ? '%' : '';
    const color = value >= 0 ? 'text-green-600' : 'text-red-600';
    const icon = value >= 0 ? TrendingUp : TrendingDown;
    const Icon = icon;
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {value >= 0 ? '+' : ''}{value.toFixed(1)}{suffix}
        </span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-800">Failed to load AI performance data</h3>
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Performance Dashboard</h1>
          <p className="text-sm text-gray-600">
            Monitor AI matching performance, processing times, and accuracy metrics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedTimeRange} onValueChange={(value) => setSelectedTimeRange(value as TimeRangeValue)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Alerts */}
      {(alerts && alerts.length > 0) || thresholdIssues.length > 0 && (
        <div className="grid gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <div className="grid gap-2">
            {alerts?.map((alert: { severity: 'low' | 'medium' | 'high'; message: string }, index: number) => (
              <Card key={index} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                  <Badge variant="secondary" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {thresholdIssues.map((issue: { severity: 'low' | 'medium' | 'high'; message: string }, index: number) => (
              <Card key={`threshold-${index}`} className={`border-l-4 ${getSeverityColor(issue.severity)}`}>
                <CardContent className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">{issue.message}</span>
                  </div>
                  <Badge variant="secondary" className={getSeverityColor(issue.severity)}>
                    Threshold
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : dashboardData ? (
          <>
            {/* Overall Accuracy */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.accuracyMetrics.overall.toFixed(1)}%
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    of AI predictions are correct
                  </p>
                  {/* Note: Would need previous period data for trend */}
                </div>
              </CardContent>
            </Card>

            {/* Average Processing Time */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(dashboardData.processingMetrics.averageTotalTime / 1000)}s
                </div>
                <p className="text-xs text-muted-foreground">
                  from upload to result
                </p>
              </CardContent>
            </Card>

            {/* Average Confidence */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.confidenceAnalysis.averageConfidence.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  confidence score (0-1)
                </p>
              </CardContent>
            </Card>

            {/* Total Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews Completed</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.userReviewPatterns.totalReviews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  manual reviews in timeframe
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="accuracy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="confidence">Confidence</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="accuracy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accuracy Metrics</CardTitle>
              <CardDescription>
                AI matching accuracy trends and breakdown by entity type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <AccuracyChart 
                    accuracyMetrics={dashboardData.accuracyMetrics}
                    trends={dashboardData.trends.accuracyTrend}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Performance</CardTitle>
              <CardDescription>
                OCR and matching processing times with percentiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <ProcessingTimeChart 
                    processingMetrics={dashboardData.processingMetrics}
                    trends={dashboardData.trends.processingTimeTrend}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confidence Analysis</CardTitle>
              <CardDescription>
                Confidence score distribution and routing decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <ConfidenceChart 
                    confidenceAnalysis={dashboardData.confidenceAnalysis}
                    trends={dashboardData.trends.confidenceTrend}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processing Volume</CardTitle>
              <CardDescription>
                Daily processing volume and review queue trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <VolumeChart 
                    volumeTrend={dashboardData.trends.volumeTrend}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>
                Common OCR errors, matching failures, and improvement suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <ErrorAnalysisChart 
                    errorAnalysis={dashboardData.errorAnalysis}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>
                Review patterns, top reviewers, and user performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                {dashboardData && (
                  <UserActivityChart 
                    userReviewPatterns={dashboardData.userReviewPatterns}
                  />
                )}
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIPerformanceDashboard;