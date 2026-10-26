"use client";

interface SkeletonProps {
    bars?: number;   // how many bars to render
    height?: number; // chart area height
}
export function CylindericalChartSkeleton({ bars = 5, height = 300 }: SkeletonProps) {
    return (
        <div className="w-full min-h-[380px] rounded-xl border border-gray-200 bg-white p-4 overflow-hidden shadow-sm">
            <div className="mb-2 flex justify-between items-center">
                <div className="h-5 w-28 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
            </div>

            <div
                className="flex items-end justify-around gap-4 w-full animate-pulse"
                style={{ height }}
            >
                {Array.from({ length: bars }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-full bg-gray-200 w-12 transition-all duration-300"
                        style={{
                            height: `${100 + Math.random() * (height - 100)}px`, // vary heights
                        }}
                    />
                ))}
            </div>

            <div className="mt-3 flex flex-row flex-wrap gap-4">
                {Array.from({ length: bars }).map((_, i) => (
                    <div key={i} className="flex flex-row items-center gap-2">
                        <span className="h-2 w-2 rounded-sm bg-gray-200" />
                        <span className="h-3 w-20 rounded bg-gray-200" />
                    </div>
                ))}
            </div>
        </div>
    );
}
