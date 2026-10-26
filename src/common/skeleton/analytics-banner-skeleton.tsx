"use client";

import React from "react";
import { clsx } from "clsx";

interface AnalyticsBannerSkeletonProps {
  showHeader?: boolean;
  cardsCount?: number;
  variant?: "default" | "compact";
  staggered?: boolean;
}

export function AnalyticsBannerSkeleton({
  showHeader = true,
  cardsCount = 4,
  variant = "default",
  staggered = true
}: AnalyticsBannerSkeletonProps) {
  return (
    <section className="pt-5 bg-white shadow-sm p-4 rounded-2xl" role="status" aria-label="Loading analytics overview">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-8 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-7 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: cardsCount }, (_, index) => (
          <MetricCardSkeleton
            key={index}
            variant={variant}
            delay={staggered ? index * 100 : 0}
          />
        ))}
      </div>

      {/* Shimmer overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden rounded-2xl" />
    </section>
  );
}

// Individual metric card skeleton with enhanced animations
export function MetricCardSkeleton({
  variant = "default",
  delay = 0,
  showStatus = true,
  showBadge = false
}: {
  variant?: "default" | "compact" | "detailed";
  delay?: number;
  showStatus?: boolean;
  showBadge?: boolean;
}) {
  const cardClass = clsx(
    "relative group bg-white border border-gray-100 rounded-xl overflow-hidden",
    {
      "p-4": variant === 'default',
      "p-3": variant === 'compact',
      "p-6": variant === 'detailed',
    }
  );

  return (
    <div
      className={cardClass}
      style={{ animationDelay: `${delay}ms` }}
      role="status"
      aria-label="Loading metric"
    >
      {/* Header section */}
      <div className="flex items-start justify-between mb-3">
        <div className={clsx(
          "rounded-lg bg-gray-200 animate-pulse flex items-center justify-center",
          variant === 'compact' ? 'size-8' : 'size-10'
        )}>
          <div className={clsx(
            "bg-gray-300 rounded animate-pulse",
            variant === 'compact' ? 'w-4 h-4' : 'w-5 h-5'
          )} />
        </div>
        <div className="flex flex-col items-end gap-1">
          {showBadge && (
            <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse" />
          )}
          {showStatus && (
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className={clsx(
          "bg-gray-200 rounded animate-pulse",
          variant === 'compact' ? 'h-3 w-20' : 'h-4 w-24'
        )} />

        {variant !== 'compact' && (
          <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
        )}

        <div className="flex items-baseline gap-2 mt-3">
          <div className={clsx(
            "bg-gray-300 rounded animate-pulse font-bold",
            variant === 'compact' ? 'h-5 w-12' :
            variant === 'detailed' ? 'h-7 w-20' : 'h-6 w-16'
          )} />
          <div className={clsx(
            "bg-gray-200 rounded animate-pulse",
            variant === 'compact' ? 'h-3 w-8' : 'h-4 w-10'
          )} />
        </div>

        <div className="inline-flex items-center gap-1 mt-2">
          <div className="h-6 bg-gray-100 rounded-md w-20 animate-pulse border border-gray-200" />
        </div>

        {variant === 'detailed' && (
          <div className="pt-2 border-t border-gray-100 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden" />
    </div>
  );
}

export default AnalyticsBannerSkeleton;
