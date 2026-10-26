
"use client";
import { useMemo, useState } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Sector,
} from "recharts";
import { useQuery } from '@tanstack/react-query';

interface DonutChartProps {
    apiUrl?: string;
    defaultColors?: string[];
    showCenterLabel?: boolean;
    squareLegend?: boolean;
    showLegend?: boolean;
    legendPosition?: "bottom" | "right";
    showLegendSeparator?: boolean;
    title?: string;
    data?: { name: string; overallValue: number }[];
    searchTerm?: string;
    selectedLocation?: string;
    queryKey?: string[]; // Optional custom query key
    enabled?: boolean; // Control when to fetch data
    refetchInterval?: number; // Auto-refetch interval in milliseconds
    category?: string;
}
import { DataNotFoundError } from "@/common/error-boundaries/data-error";

// Custom hook for fetching chart data
function useChartData({
    queryKey,
    enabled = true,
    refetchInterval,
    searchTerm,
    selectedLocation,
    category,
}: {

    category?: string;

    queryKey?: string[];
    enabled?: boolean;
    refetchInterval?: number;
    searchTerm?: string;
    selectedLocation?: string;
}) {
    return useQuery({
        queryKey: queryKey || ['chart-data', searchTerm, selectedLocation],
        queryFn: async () => {


            // Build query parameters
            const params = new URLSearchParams();
            if (searchTerm) params.append('searchTerm', searchTerm);
            if (selectedLocation && selectedLocation !== 'All') params.append('selectedLocation', selectedLocation);
            if (category) params.append('category', category);
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

            const fullUrl = `${API_BASE_URL}/api/dashboard/overall-sales-split?${params.toString()}`;


            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

            const response = await fetch(fullUrl, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch chart data: ${response.statusText}`);
            }

            const result = await response.json();

            // Handle different API response formats
            if (result.success && result.data) {
                return Array.isArray(result.data) ? result.data : [];
            }

            return Array.isArray(result) ? result : [];
        },
        enabled: enabled, // Only fetch if no static data provided
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchInterval,
        retry: 2,
    });
}

export function DonutChart({
    defaultColors = ["#FECACA", "#EF4444"],
    showCenterLabel = true,
    squareLegend = true,
    showLegend = true,
    legendPosition = "bottom",
    showLegendSeparator = true,
    title,
    data: staticData,
    searchTerm,
    selectedLocation,
    queryKey,
    enabled = true,
    refetchInterval,
    category,
}: DonutChartProps) {
    // Use React Query for data fetching
    const {
        data: apiData,
        isLoading,
        error,
        isError
    } = useChartData({
        queryKey,
        enabled,
        refetchInterval,
        searchTerm,
        selectedLocation,
        category,
    });
    const chartData = useMemo(() => {
        if (staticData) return staticData;
        if (apiData && Array.isArray(apiData) && apiData.length > 0) return apiData;
        return [];
    }, [staticData, apiData]);

    // which slice is hovered
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const total = chartData.reduce((acc, d) => acc + d.overallValue, 0);

    // Show loading state
    if (isLoading && !staticData) {
        return (
            <div className="flex items-center justify-center h-[300px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Show error state
    if (isError && !staticData) {
        return (
            <>
                <div className="flex flex-col items-center justify-center text-red-600">
                    <p className="font-medium">Failed to load chart data</p>
                    <p className="text-sm text-gray-500 mt-1">{error?.message}</p>
                </div>
                <div>
                    <DataNotFoundError />
                </div>
            </>
        );
    }

    // Show empty state
    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center max-h-[300px] text-gray-500">
                <p className="font-medium">No data available</p>
                <p className="text-sm mt-1">Chart data is empty or unavailable</p>
            </div>
        );
    }

    // active slice renderer: moves the slice outwards slightly and increases outerRadius
    const renderActiveShape = (props: any) => {
        const {
            cx,
            cy,
            startAngle,
            endAngle,
            innerRadius,
            outerRadius,
            fill,
            payload,
            midAngle,
        } = props;
        const offset = 2;
        const RAD = Math.PI / 180;
        // note: midAngle from recharts has a sign convention; using -midAngle works nicely
        const dx = Math.cos((-midAngle) * RAD) * offset;
        const dy = Math.sin((-midAngle) * RAD) * offset;

        return (
            <g>
                {/* translated sector (pop-out) */}
                <g transform={`translate(${dx}, ${dy})`}>
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius} // slightly larger outer radius for emphasis
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill={fill}
                    // cornerRadius={4}
                    />
                    {/* thin outline to make it crisp */}
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
                        outerRadius={outerRadius}
                        startAngle={startAngle}
                        endAngle={endAngle}
                        fill="none"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth={1}
                    />
                </g>
            </g>
        );
    };

    // custom tooltip content matching your CSS
    const CustomTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;
        const entry = payload[0]?.payload ?? payload[0];
        const name = entry?.name ?? "";
        const value = entry?.overallValue ?? 0;
        // color: try payload's fill or derive from data index
        const idx = chartData.findIndex((d) => d.name === name);
        const color = payload[0]?.color ?? defaultColors[(idx >= 0 ? idx : 0) % defaultColors.length];

        return (
            <div className="font-inter w-full box-border flex items-center gap-2 px-2.5 py-1.5 h-7 bg-white shadow-lg rounded-lg border border-gray-100 z-50"
            >
                <div style={{ width: 6, height: 16, borderRadius: 2, background: color }} />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <span style={{ fontSize: 12, color: "#737373", fontWeight: 400 }}>{name}</span>
                </div>
                <div style={{ marginLeft: 8, fontSize: 12, color: "#0A0A0A", fontWeight: 500 }}>
                    {value} Sales
                </div>
            </div>
        );
    };

    // Handle legend hover
    const handleLegendHover = (index: number) => {
        setActiveIndex(index);
    };

    const handleLegendLeave = () => {
        setActiveIndex(null);
    };

    return (
        <div
            className={`flex ${legendPosition === "right" ? "flex-col lg:flex-row items-center" : "flex-col items-center justify-center"
                } `}
        >

            <div className={`relative ${legendPosition === "right" ? "w-[300px] h-[300px] lg:w-[300px] lg:h-[300px]" : "w-[300px] h-[300px]"} `}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="overallValue"
                            nameKey="name"
                            innerRadius={80}
                            outerRadius={130}
                            paddingAngle={2}
                            cornerRadius={2}
                            isAnimationActive={true}
                            activeShape={renderActiveShape}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell - ${index} `} fill={defaultColors[index % defaultColors.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            cursor={false}
                            wrapperStyle={{ zIndex: 9999, pointerEvents: "none" }}
                            content={<CustomTooltip />}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                {showCenterLabel && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className="text-xl font-bold">{total}</p>
                            {total > 1 && <p className="font-inter font-normal text-gray-500">Sales</p>}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            {showLegend && (
                <div
                    className={`text - sm text - gray - 600 ${legendPosition === "right" ? "flex flex-col gap-4 lg:ml-6 w-full lg:w-auto" : "flex flex-row gap-6 mt-6"
                        } `}
                >
                    {chartData.map((entry, index) => {
                        const totalLocal = chartData.reduce((acc, item) => acc + item.overallValue, 0);
                        const percentage = ((entry.overallValue / totalLocal) * 100).toFixed(0);
                        const isHovered = activeIndex === index;

                        return (
                            <div
                                key={entry.name}
                                className={`flex items-center gap-2 cursor-pointer transition - all duration - 200 ${isHovered ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100 outline-none border-none focus:outline-none focus:border-none focus-visible:outline-none focus-visible:border-none'
                                    } `}
                                onMouseEnter={() => handleLegendHover(index)}
                                onMouseLeave={handleLegendLeave}
                            >
                                <span
                                    className={`${squareLegend ? "w-4 h-4 rounded-[4px]" : " w-3 h-3 rounded-[4px]"} transition - all duration - 200 ${isHovered ? 'scale-110 shadow-sm' : ''
                                        } `}
                                    style={{
                                        backgroundColor: defaultColors[index % defaultColors.length],
                                    }}
                                />
                                {title === "Demand" ? (
                                    <div className="leading-tight mt-1">
                                        <span className={`font - geist font - bold transition - colors duration - 200 ${isHovered ? 'text-gray-900' : 'text-placeholder-gray'
                                            } `}>{entry.name}</span>
                                        <br />
                                        <span className="font-inter font-normal text-gray-500">
                                            {entry.overallValue} ({percentage}%)
                                        </span>
                                    </div>
                                ) : (
                                    <span className={`transition - colors duration - 200 ${isHovered ? 'text-gray-900' : ''
                                        } `}>
                                        {entry.name} <span className="font-inter font-semibold">{entry.overallValue}</span> {title}
                                    </span>
                                )}
                                {legendPosition !== "right" && showLegendSeparator && index < chartData.length - 1 && (
                                    <span className="text-gray-300 ml-3">|</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
