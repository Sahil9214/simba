"use client";

import React from "react";

interface SkeletonProps {
    height?: number;
    points?: number;
}

export function LineChartSkeleton({ height = 220, points = 6 }: SkeletonProps) {
    return (
        <div className="relative h-64 md:h-full bg-white border border-gray-100 shadow-sm rounded-[10px] p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
            </div>

            {/* Legend */}
            <div className="flex justify-end items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-10 rounded bg-gray-200 animate-pulse" />
                    <div className="h-3 w-12 rounded bg-gray-200 animate-pulse" />
                </div>
            </div>

            {/* Chart skeleton */}
            <div
                className="relative flex items-end gap-6 justify-between w-full animate-pulse"
                style={{ height }}
            >
                {Array.from({ length: points }).map((_, i) => (
                    <div
                        key={i}
                        className="w-2 rounded-full bg-gray-200"
                        style={{
                            height: `${50 + Math.random() * (height - 50)}px`, // varied column heights
                        }}
                    />
                ))}

                {/* Simulated line */}
                <div className="absolute top-1/3 left-0 h-[2px] w-full bg-gray-200/70 rounded" />
                <div className="absolute top-2/3 left-0 h-[2px] w-full bg-gray-200/70 rounded" />
            </div>
        </div>
    );
}
