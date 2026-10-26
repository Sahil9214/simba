"use client";

import React from "react";

interface SkeletonProps {
    bars?: number;
    height?: number;
}

export function RectangularChartSkeleton({ bars = 5, height = 300 }: SkeletonProps) {
    return (
        <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            </div>

            {/* Chart Skeleton */}
            <div
                className="relative flex items-end justify-around gap-4 w-full animate-pulse"
                style={{ height }}
            >
                {Array.from({ length: bars }).map((_, i) => (
                    <div
                        key={i}
                        className="relative w-10 bg-gray-200 rounded-sm"
                        style={{
                            height: `${80 + Math.random() * (height - 100)}px`,
                        }}
                    >
                        {/* fake top face */}
                        <div className="absolute top-0 left-0 h-2 w-full bg-gray-300 rounded-t-sm" />
                    </div>
                ))}
            </div>

            {/* Legend Skeleton */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
                {Array.from({ length: bars }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-sm bg-gray-200" />
                        <span className="h-3 w-20 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
