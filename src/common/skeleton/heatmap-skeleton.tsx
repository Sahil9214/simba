"use client";

import React from "react";
import { clsx } from "clsx";

interface HeatMapSkeletonProps {
  showHeader?: boolean;
  showLegend?: boolean;
  showControls?: boolean;
  regions?: number;
  animate?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function HeatMapSkeleton({
  showHeader = true,
  showLegend = true,
  showControls = true,
  regions = 12,
  animate = true,
  className,
  title = "Geographic Performance",
  subtitle = "Sales distribution across regions"
}: HeatMapSkeletonProps) {
  const containerClass = clsx(
    "relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 space-y-4",
    animate && "animate-pulse",
    className
  );

  return (
    <div className={containerClass} role="status" aria-label="Loading heat map visualization">
      {/* Header Section */}
      {showHeader && (
        <HeatMapHeaderSkeleton
          title={title}
          subtitle={subtitle}
          showControls={showControls}
        />
      )}

      {/* Heat Map Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Map Area */}
        <div className="flex-1 min-h-96 relative">
          <GeographicMapSkeleton regions={regions} />
        </div>

        {/* Legend and Stats */}
        {showLegend && (
          <div className="w-full lg:w-80 space-y-4">
            <HeatMapLegendSkeleton />
            <RegionStatsSkeleton />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <HeatMapControlsSkeleton />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden rounded-2xl" />
    </div>
  );
}

// Header with title and controls
function HeatMapHeaderSkeleton({
  title,
  subtitle,
  showControls
}: {
  title: string;
  subtitle: string;
  showControls: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      {showControls && (
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      )}
    </div>
  );
}

// Geographic map visualization skeleton
function GeographicMapSkeleton({ regions }: { regions: number }) {
  return (
    <div className="relative w-full h-96 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Map background */}
      <div className="absolute inset-4 bg-gray-100 rounded animate-pulse">
        {/* Geographic regions */}
        <div className="grid grid-cols-4 gap-2 p-4 h-full">
          {Array.from({ length: regions }, (_, i) => (
            <RegionSkeleton
              key={i}
              intensity={Math.random()}
              delay={i * 100}
              index={i}
            />
          ))}
        </div>

        {/* Map overlay elements */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-12 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Compass/North indicator */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Loading state overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse mx-auto" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Individual region skeleton
function RegionSkeleton({
  intensity,
  delay,
  index
}: {
  intensity: number;
  delay: number;
  index: number;
}) {
  // Simulate different region shapes and sizes
  const shapes = [
    "rounded-lg", // rectangular regions
    "rounded-full", // circular regions
    "rounded-t-lg", // northern regions
    "rounded-b-lg", // southern regions
  ];

  const shape = shapes[index % shapes.length];
  const opacity = 0.3 + intensity * 0.7;
  const baseColor = intensity > 0.7 ? "bg-red-200" :
                   intensity > 0.4 ? "bg-yellow-200" :
                   intensity > 0.2 ? "bg-green-200" : "bg-blue-200";

  return (
    <div
      className={clsx(
        "relative min-h-12 border border-gray-200 animate-pulse",
        shape,
        baseColor
      )}
      style={{
        opacity,
        animationDelay: `${delay}ms`
      }}
    >
      {/* Region hover effect */}
      <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200" />

      {/* Data point indicator */}
      {intensity > 0.5 && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
      )}
    </div>
  );
}

// Color legend for heat map
function HeatMapLegendSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />

      {/* Color scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div>

        <div className="h-4 bg-gradient-to-r from-blue-200 via-yellow-200 to-red-200 rounded animate-pulse" />

        <div className="flex justify-between">
          <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Legend items */}
      <div className="space-y-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-8 bg-gray-300 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Regional statistics sidebar
function RegionStatsSkeleton() {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />

      {/* Top regions list */}
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="text-right space-y-1">
              <div className="h-3 w-12 bg-gray-300 rounded animate-pulse" />
              <div className="h-2 w-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Summary stats */}
      <div className="pt-3 border-t border-gray-200 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-8 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="flex justify-between items-center">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Bottom controls for time period, filters, etc.
function HeatMapControlsSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100">
      {/* Time period selector */}
      <div className="flex items-center gap-2">
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="h-8 w-12 bg-gray-200 rounded animate-pulse"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Additional controls */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default HeatMapSkeleton;