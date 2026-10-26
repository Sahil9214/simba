"use client";

import React from "react";
import { clsx } from "clsx";

interface StockwiseHeatMapSkeletonProps {
  showHeader?: boolean;
  showLegend?: boolean;
  showControls?: boolean;
  gridSize?: number;
  animate?: boolean;
  className?: string;
}

export function StockwiseHeatMapSkeleton({
  showHeader = true,
  showLegend = true,
  showControls = true,
  gridSize = 20,
  animate = true,
  className
}: StockwiseHeatMapSkeletonProps) {
  const containerClass = clsx(
    "relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 space-y-4",
    animate && "animate-pulse",
    className
  );

  return (
    <div className={containerClass} role="status" aria-label="Loading stock-wise heat map">
      {/* Header */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
          </div>
          {showControls && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          )}
        </div>
      )}

      {/* Heat map grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="grid grid-cols-8 gap-1 p-4 bg-gray-50 rounded-lg">
            {Array.from({ length: gridSize }, (_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray-200 rounded animate-pulse"
                style={{
                  animationDelay: `${i * 50}ms`,
                  backgroundColor: `hsl(${200 + Math.random() * 60}, 20%, ${80 + Math.random() * 15}%)`
                }}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="w-full lg:w-64 space-y-4">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden rounded-2xl" />
    </div>
  );
}

export default StockwiseHeatMapSkeleton;