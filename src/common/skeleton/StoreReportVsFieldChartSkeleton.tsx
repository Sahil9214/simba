import React from "react";

interface StoreChartSkeletonProps {
  className?: string;
  showLegend?: boolean;
  showFilters?: boolean;
  showDescription?: boolean;
  barCount?: number;
  height?: number;
}

export function StoreChartSkeleton({
  className = "",
  showLegend = true,
  showFilters = true,
  showDescription = true,
  barCount = 8,
  height = 240
}: StoreChartSkeletonProps) {
  return (
    <div className={`w-full ${className} animate-pulse`} style={{ boxShadow: "none", border: "none" }}>
      <div className="px-0">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title Skeleton */}
            <div className="h-5 bg-gray-200 rounded w-64 mb-2"></div>

            {/* Description Skeleton */}
            {showDescription && (
              <div className="mt-1">
                <div className="h-4 bg-gray-100 rounded w-96 mb-1"></div>
                <div className="h-3 bg-gray-100 rounded w-48"></div>
              </div>
            )}
          </div>

          {/* Filter Controls Skeleton */}
          {showFilters && (
            <div className="flex items-center gap-2">
              <div className="w-28 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
          )}
        </div>

        {/* Legend Section */}
        {showLegend && (
          <div className="flex justify-end items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-100 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-100 rounded"></div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div className="p-6">
        <div className="w-full" style={{ height: `${height}px`, paddingTop: "0px" }}>
          {/* Chart Grid Background */}
          <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute w-full border-t border-gray-200"
                  style={{
                    top: `${(i / 5) * 100}%`,
                  }}
                ></div>
              ))}
            </div>

            {/* Y-Axis Labels */}
            <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`y-label-${i}`} className="w-6 h-3 bg-gray-200 rounded"></div>
              ))}
            </div>

            {/* Bar Chart Skeleton */}
            <div className="absolute inset-0 flex items-end justify-center px-12 pb-8">
              <div className="flex items-end justify-between w-full h-full pt-8">
                {Array.from({ length: barCount }).map((_, i) => {
                  // Generate varied heights for more realistic skeleton
                  const heights = [60, 80, 45, 90, 70, 55, 85, 40, 75, 65, 50, 95, 35, 78, 88];
                  const barHeight = heights[i % heights.length];

                  return (
                    <div
                      key={`bar-${i}`}
                      className="flex flex-col items-center gap-2"
                      style={{ width: `${Math.max(8, 90 / barCount)}%` }}
                    >
                      {/* Individual Bar */}
                      <div className="relative w-full flex justify-center">
                        <div
                          className="bg-gradient-to-t from-gray-300 to-gray-200 rounded-t"
                          style={{
                            width: "8px",
                            height: `${barHeight}%`,
                            minHeight: "12px"
                          }}
                        >
                          {/* Shimmer Effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                        </div>
                      </div>

                      {/* X-Axis Label Placeholder */}
                      <div className="w-6 h-2 bg-gray-200 rounded mt-1"></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart Loading Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Custom Styles for Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

// Usage Examples Component
export function SkeletonExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Full Featured Skeleton</h2>
        <StoreChartSkeleton />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Compact Version</h2>
        <StoreChartSkeleton
          showDescription={false}
          showFilters={false}
          barCount={6}
          height={180}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Minimal Version</h2>
        <StoreChartSkeleton
          showDescription={false}
          showFilters={false}
          showLegend={false}
          barCount={5}
          height={160}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Wide Chart Skeleton</h2>
        <StoreChartSkeleton
          barCount={12}
          height={280}
        />
      </div>
    </div>
  );
}

export default SkeletonExamples;
