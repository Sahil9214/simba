import React from 'react';

type SkeletonProps = {
  height?: number;
  className?: string;
  bars?: number;
};

export function PeerComparisonChartSkeleton({
  height = 268,
  className = "",
  bars = 6
}: SkeletonProps) {
  return (
    <div className={`${className} animate-pulse`} aria-label="Loading peer comparison chart">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
        <div className="flex-1 min-w-0">
          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          {/* Subtitle skeleton */}
          <div className="h-5 bg-gray-100 rounded w-64" />
        </div>
      </div>

      {/* Chart Area Skeleton */}
      <div
        className="relative bg-gray-50 rounded-lg border border-gray-100"
        style={{ width: "100%", height: `${height}px` }}
      >
        {/* Y-axis grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-px bg-gray-200 w-full" />
          ))}
        </div>

        {/* Bars skeleton */}
        <div className="absolute inset-0 flex items-end justify-around px-8 pb-12 pt-8">
          {[...Array(bars)].map((_, i) => (
            <div key={i} className="flex gap-1 items-end" style={{ width: `${100 / bars - 2}%` }}>
              {/* Simba bar */}
              <div
                className="bg-indigo-200 rounded-t"
                style={{
                  width: '45%',
                  height: `${Math.random() * 60 + 30}%`,
                }}
              />
              {/* Peers bar */}
              <div
                className="bg-indigo-100 rounded-t"
                style={{
                  width: '45%',
                  height: `${Math.random() * 50 + 25}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* X-axis labels skeleton */}
        <div className="absolute bottom-2 left-8 right-8 flex justify-around">
          {[...Array(bars)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded" style={{ width: `${100 / bars - 3}%` }} />
          ))}
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>
      </div>
    </div>
  );
}

// Demo
export default function Demo() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-white">
      <div>
        <h2 className="text-xl font-bold mb-4">Peer Comparison Chart Skeleton</h2>
        <PeerComparisonChartSkeleton />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Larger Height (400px)</h2>
        <PeerComparisonChartSkeleton height={400} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">More Bars (10 bars)</h2>
        <PeerComparisonChartSkeleton bars={10} />
      </div>
    </div>
  );
}
