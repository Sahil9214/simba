"use client";

import React from "react";

export function HorizontalRectangularChartSkeleton({ rows = 5, height = 258 }: { rows?: number; height?: number }) {
    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="mb-2 flex justify-between items-center">
                <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            </div>

            {/* Chart Skeleton */}
            <div
                className="flex flex-col gap-4 w-full animate-pulse"
                style={{ height }}
            >
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        {/* Y-axis label placeholder */}
                        <div className="h-3 w-20 rounded bg-gray-200 shrink-0" />

                        {/* Bar placeholder */}
                        <div className="relative flex-1 h-6 bg-gray-200 rounded-sm">
                            {/* fake top face */}
                            <div className="absolute -top-1 left-0 h-1 w-full bg-gray-300 rounded-sm" />
                            {/* fake right face */}
                            <div className="absolute right-0 top-0 h-full w-1 bg-gray-300 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
