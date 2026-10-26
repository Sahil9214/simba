"use client";

import React from "react";

interface DonutChartSkeletonProps {
    showControls?: boolean;
    legendPosition?: "right" | "bottom";
    showSearch?: boolean;
    showSort?: boolean;
    showExport?: boolean;
}

export function DonutChartSkeleton({
    showControls = true,
    legendPosition = "right",
    showSearch = false,
    showSort = true,
    showExport = false
}: DonutChartSkeletonProps) {
    return (
        <div className="w-[70%] h-full bg-white font-inter">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
                {/* Title and Subtitle */}
                <div className="min-w-0">
                    <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
                    <div className="mt-2 hidden md:block">
                        <div className="h-4 w-72 rounded bg-gray-200 animate-pulse" />
                    </div>
                </div>

                {/* Controls */}
                {showControls && (
                    <div className="flex gap-2 items-center">
                        {showSearch && (
                            <div className="min-w-[180px] h-9 rounded-lg bg-gray-200 animate-pulse" />
                        )}
                        {showSort && (
                            <div className="min-w-32 h-9 rounded-lg bg-gray-200 animate-pulse" />
                        )}
                        {showExport && (
                            <div className="w-24 h-9 rounded-lg bg-gray-200 animate-pulse" />
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Subtitle */}
            <div className="mt-2 block md:hidden">
                <div className="h-4 w-56 rounded bg-gray-200 animate-pulse" />
            </div>

            {/* Chart and Legend Container */}
            <div className={`mt-6 py-2 flex ${legendPosition === "right" ? "flex-col lg:flex-row" : "flex-col"} gap-6 items-start`}>
                {/* Chart Container */}
                <div
                    className={`w-full ${legendPosition === "right" ? "h-64 lg:h-60" : "h-64 md:h-60"} mt-3 flex items-center justify-center relative`}
                >
                    <div className={`${legendPosition === "right" ? "w-[300px] lg:w-[450px]" : "lg:w-[450px] w-[300px]"} h-full flex items-center justify-center`}>
                        {/* Donut Skeleton */}
                        <div className="relative flex items-center justify-center">
                            <div className="w-[200px] h-[200px] rounded-full border-[32px] border-gray-200 animate-pulse" />

                            {/* Center Data */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="h-7 w-20 rounded bg-gray-200 animate-pulse mb-2 mx-auto" />
                                    <div className="h-3 w-16 rounded bg-gray-200 animate-pulse mx-auto" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend Container */}
                <div
                    className={`${legendPosition === "right" ? "w-full lg:w-full" : "w-full"} overflow-y-auto overflow-x-hidden`}
                    style={{ maxHeight: '280px' }}
                >
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 py-2.5 px-3 rounded-lg"
                            style={{ minHeight: '56px' }}
                        >
                            {/* Color Indicator */}
                            <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />

                            {/* Text Content */}
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                                <div className="h-3 w-24 rounded bg-gray-200 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Demo component to show different variants
export default function SkeletonDemo() {
    return (
        <div className="min-h-screen bg-gray-50 p-8 space-y-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold mb-8">Donut Chart Skeleton Variants</h1>

                {/* Default variant */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Default (with sort)</h2>
                    <DonutChartSkeleton />
                </div>

                {/* With search and sort */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">With Search & Sort</h2>
                    <DonutChartSkeleton showSearch={true} showSort={true} />
                </div>

                {/* With all controls */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">With All Controls</h2>
                    <DonutChartSkeleton showSearch={true} showSort={true} showExport={true} />
                </div>

                {/* Bottom legend variant */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Bottom Legend Position</h2>
                    <DonutChartSkeleton legendPosition="bottom" showSearch={true} />
                </div>

                {/* Minimal variant */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Minimal (no controls)</h2>
                    <DonutChartSkeleton showControls={false} />
                </div>
            </div>
        </div>
    );
}
