"use client";

import React from "react";
import { clsx } from "clsx";

interface ChartSkeletonProps {
  type: "donut" | "bar" | "line" | "area" | "cylindrical" | "horizontal" | "mixed";
  height?: number;
  showHeader?: boolean;
  showLegend?: boolean;
  showControls?: boolean;
  animate?: boolean;
  className?: string;
  title?: string;
}

export function ChartSkeleton({
  type,
  height = 320,
  showHeader = true,
  showLegend = true,
  showControls = false,
  animate = true,
  className,
  title
}: ChartSkeletonProps) {
  const containerClass = clsx(
    "relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 flex flex-col gap-4",
    animate && "animate-pulse",
    className
  );

  return (
    <div className={containerClass} role="status" aria-label={`Loading ${type} chart`}>
      {/* Header Section */}
      {showHeader && (
        <ChartHeaderSkeleton showControls={showControls} title={title} />
      )}

      {/* Legend Section */}
      {showLegend && type !== "donut" && (
        <ChartLegendSkeleton type={type} />
      )}

      {/* Chart Content */}
      <div className="flex-1 relative" style={{ minHeight: height }}>
        {renderChartContent(type, height, showLegend)}
      </div>

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden rounded-2xl" />
    </div>
  );
}

// Chart header with title and controls
function ChartHeaderSkeleton({ showControls, title }: { showControls: boolean; title?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
      </div>
      {showControls && (
        <div className="flex items-center gap-2">
          <div className="h-8 w-20 rounded bg-gray-200 animate-pulse" />
          <div className="h-8 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Chart legend component
function ChartLegendSkeleton({ type }: { type: string }) {
  const legendCount = type === "mixed" ? 4 : type === "line" ? 3 : 2;

  return (
    <div className="flex justify-end items-center gap-6 mb-4">
      {Array.from({ length: legendCount }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Render specific chart content based on type
function renderChartContent(type: string, height: number, showLegend: boolean) {
  switch (type) {
    case "donut":
      return <DonutChartSkeleton height={height} showLegend={showLegend} />;
    case "bar":
    case "cylindrical":
      return <BarChartSkeleton height={height} />;
    case "horizontal":
      return <HorizontalBarChartSkeleton height={height} />;
    case "line":
    case "area":
      return <LineChartSkeleton height={height} />;
    case "mixed":
      return <MixedChartSkeleton height={height} />;
    default:
      return <DefaultChartSkeleton height={height} />;
  }
}

// Donut chart specific skeleton
function DonutChartSkeleton({ height, showLegend }: { height: number; showLegend: boolean }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-8">
        {/* Donut chart circle */}
        <div className="relative">
          <div
            className="rounded-full border-8 border-gray-200 animate-pulse"
            style={{
              width: Math.min(height * 0.8, 200),
              height: Math.min(height * 0.8, 200),
              borderTopColor: '#e5e7eb',
              borderRightColor: '#d1d5db',
              borderBottomColor: '#9ca3af',
              borderLeftColor: '#6b7280'
            }}
          />
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-1">
              <div className="h-6 w-16 bg-gray-300 rounded animate-pulse" />
              <div className="h-3 w-12 bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>

        {/* Legend for donut charts */}
        {showLegend && (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-2 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Bar chart skeleton
function BarChartSkeleton({ height }: { height: number }) {
  const barCount = 8;

  return (
    <div className="h-full flex items-end justify-between px-4" style={{ height }}>
      {Array.from({ length: barCount }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-16">
          {/* Bar */}
          <div
            className="w-8 bg-gray-200 rounded-t animate-pulse"
            style={{
              height: `${40 + Math.random() * (height - 80)}px`,
              animationDelay: `${i * 100}ms`
            }}
          />
          {/* X-axis label */}
          <div className="h-3 w-6 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Horizontal bar chart skeleton
function HorizontalBarChartSkeleton({ height }: { height: number }) {
  const barCount = 6;

  return (
    <div className="h-full space-y-4 py-4" style={{ height }}>
      {Array.from({ length: barCount }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          {/* Y-axis label */}
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          {/* Bar */}
          <div className="flex-1 h-6 relative">
            <div
              className="h-full bg-gray-200 rounded animate-pulse"
              style={{
                width: `${30 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          </div>
          {/* Value */}
          <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Line chart skeleton
function LineChartSkeleton({ height }: { height: number }) {
  const pointCount = 8;

  return (
    <div className="h-full relative p-4" style={{ height }}>
      {/* Grid lines */}
      <div className="absolute inset-4 border-l border-b border-gray-200">
        {/* Horizontal grid lines */}
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-gray-100"
            style={{ top: `${(i + 1) * 20}%` }}
          />
        ))}
        {/* Vertical grid lines */}
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-gray-100"
            style={{ left: `${(i + 1) * 20}%` }}
          />
        ))}
      </div>

      {/* Chart lines and points */}
      <div className="relative h-full flex items-end justify-between px-4">
        {Array.from({ length: pointCount }, (_, i) => (
          <div
            key={i}
            className="relative"
            style={{
              height: `${40 + Math.random() * 60}%`,
              animationDelay: `${i * 150}ms`
            }}
          >
            {/* Data point */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
            {/* Connecting line to next point */}
            {i < pointCount - 1 && (
              <div className="absolute top-1 left-full w-8 h-0.5 bg-gray-200 animate-pulse transform origin-left rotate-12" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Mixed chart skeleton (combination of bar and line)
function MixedChartSkeleton({ height }: { height: number }) {
  return (
    <div className="h-full relative" style={{ height }}>
      {/* Background grid */}
      <div className="absolute inset-4 border-l border-b border-gray-200 opacity-30" />

      {/* Bar chart layer */}
      <div className="absolute inset-0 flex items-end justify-between px-8 pb-8">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`bar-${i}`}
            className="w-6 bg-gray-200 rounded-t animate-pulse"
            style={{
              height: `${30 + Math.random() * 40}%`,
              animationDelay: `${i * 100}ms`
            }}
          />
        ))}
      </div>

      {/* Line chart overlay */}
      <div className="absolute inset-0 flex items-end justify-between px-8 pb-8">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={`line-${i}`}
            className="relative"
            style={{ height: `${50 + Math.random() * 30}%` }}
          >
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Default fallback chart skeleton
function DefaultChartSkeleton({ height }: { height: number }) {
  return (
    <div className="h-full flex items-center justify-center" style={{ height }}>
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  );
}

export default ChartSkeleton;