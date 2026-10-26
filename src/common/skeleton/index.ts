// Legacy chart skeletons
import { CylindericalChartSkeleton } from "./cylinderical-chart-skeleton";
import { LineChartSkeleton } from "./line-chart-skeleton";
import { RectangularChartSkeleton } from "./rectangular-chart-skeleton";
import { DonutChartSkeleton } from "./pie-chart-skeleton";
import { HorizontalRectangularChartSkeleton } from "./horizontal-chart-skeleton";
import { BreakageChartSkeleton } from "./breakage-chart-skeleton";
import { StockwiseHeatMapSkeleton } from "./stockwise-heat-map-skeleton";
import { MetricCardSkeleton } from "./metricCardSkeleton";
import { PeerComparisonChartSkeleton } from "./peercomparison-skeleton";
// New comprehensive skeleton system
import { AnalyticsBannerSkeleton } from "./analytics-banner-skeleton";
import { ChartSkeleton } from "./chart-skeleton";
import {
  TableSkeleton,
  UploadTableSkeleton,
  SalesTableSkeleton,
  DemandTableSkeleton,
  TableHeaderSkeleton,
  TablePaginationSkeleton
} from "./table-skeleton";
import { HeatMapSkeleton } from "./heatmap-skeleton";
import {
  UploadCentreSkeleton,
  UploadingStateSkeleton,
  ProcessingStateSkeleton,
  CompletedStateSkeleton
} from "./upload-centre-skeleton";

// Loading state management
import {
  LoadingStateProvider,
  useLoadingState,
  useComponentLoading,
  useProgressiveLoading,
  ProgressiveLoader,
  useLoadingPerformance
} from "./loading-state-manager";

// Progressive and animated skeletons
import {
  ProgressiveSkeleton,
  StaggeredSkeleton,
  ShimmerSkeleton,
  PulseWaveSkeleton,
  BreathingSkeleton,
  LoadingDots,
  TypingSkeleton,
  ProgressBarSkeleton
} from "./progressive-skeleton";

// Real-time loading components
import {
  RealTimeIndicator,
  LoadingProgress,
  DataFreshness,
  LoadingOverlay,
  AdaptiveLoader
} from "./realtime-loading";


// Legacy exports (for backward compatibility)
export {
  CylindericalChartSkeleton,
  LineChartSkeleton,
  RectangularChartSkeleton,
  DonutChartSkeleton,
  HorizontalRectangularChartSkeleton,
  BreakageChartSkeleton,
  PeerComparisonChartSkeleton
};

// New comprehensive skeleton system exports
export {
  // Analytics components
  AnalyticsBannerSkeleton,
  MetricCardSkeleton,

  // Chart skeletons
  ChartSkeleton,

  // Table skeletons
  TableSkeleton,
  TableHeaderSkeleton,
  TablePaginationSkeleton,
  UploadTableSkeleton,
  SalesTableSkeleton,
  DemandTableSkeleton,

  // Specialized skeletons
  HeatMapSkeleton,
  UploadCentreSkeleton,
  UploadingStateSkeleton,
  ProcessingStateSkeleton,
  CompletedStateSkeleton,

  // Loading state management
  LoadingStateProvider,
  useLoadingState,
  useComponentLoading,
  useProgressiveLoading,
  ProgressiveLoader,
  useLoadingPerformance,

  // Progressive and animated components
  ProgressiveSkeleton,
  StaggeredSkeleton,
  ShimmerSkeleton,
  PulseWaveSkeleton,
  BreathingSkeleton,
  LoadingDots,
  TypingSkeleton,
  ProgressBarSkeleton,

  // Real-time loading components
  RealTimeIndicator,
  LoadingProgress,
  DataFreshness,
  LoadingOverlay,
  AdaptiveLoader
};
