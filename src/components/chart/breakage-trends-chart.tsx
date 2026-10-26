"use client";

import React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Area,
    AreaChart,
} from "recharts";

interface BreakageTrendsChartProps {
    data: Array<{
        date: string;
        breakageCount: number;
        breakageValue: number;
        affectedShops: number;
        affectedSKUs: number;
    }>;
    title?: string;
    className?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
        <div className="font-inter bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
            <div className="font-medium text-sm text-gray-900 mb-2">
                {new Date(label).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })}
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-placeholder-gray">Breakage Count</span>
                    </div>
                    <span className="text-xs font-medium">{data.breakageCount}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Value Lost</span>
                    </div>
                    <span className="text-xs font-medium">₹{data.breakageValue.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Affected Shops</span>
                    </div>
                    <span className="text-xs font-medium">{data.affectedShops}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Affected SKUs</span>
                    </div>
                    <span className="text-xs font-medium">{data.affectedSKUs}</span>
                </div>
            </div>
        </div>
    );
};

export function BreakageTrendsChart({
    data,
    title = "Breakage Trends Over Time",
    className = ""
}: BreakageTrendsChartProps) {
    // Process data for chart - format dates and add moving averages
    const chartData = data.map((item, index) => {
        const date = new Date(item.date);
        return {
            ...item,
            formattedDate: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            fullDate: item.date,
        };
    }).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());

    if (!chartData || chartData.length === 0) {
        return (
            <div className={`w-full bg-white rounded-lg  p-6 ${className}`}>
                <h3 className="font-semibold text-sm md:text-lg mb-4">{title}</h3>
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded">
                    <p className="font-inter text-placeholder-gray">No trend data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full bg-white rounded-lg border-container-card p-4 ${className}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="font-semibold text-lg">{title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-inter text-placeholder-gray">Breakage Count</span>
                    </div>
                    <div className="font-inter text-placeholder-gray flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-inter text-placeholder-gray">Value (₹)</span>
                    </div>
                </div>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                        <defs>
                            <linearGradient id="breakageCountGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#EF4444" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#EF4444" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="breakageValueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F97316" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#F97316" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E5E7EB"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            yAxisId="count"
                            orientation="left"
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            tickLine={false}
                            axisLine={false}
                        />

                        <YAxis
                            yAxisId="value"
                            orientation="right"
                            tick={{ fontSize: 12, fill: "#6B7280" }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            yAxisId="count"
                            type="monotone"
                            dataKey="breakageCount"
                            stroke="#EF4444"
                            strokeWidth={2}
                            fill="url(#breakageCountGradient)"
                            dot={{ fill: "#EF4444", r: 4 }}
                            activeDot={{ r: 6, fill: "#EF4444", fontFamily: "geist" }}
                        />

                        <Line
                            yAxisId="value"
                            type="monotone"
                            dataKey="breakageValue"
                            stroke="#F97316"
                            strokeWidth={2}
                            dot={{ fill: "#F97316", r: 3 }}
                            activeDot={{ r: 5, fill: "#F97316", fontFamily: "geist" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="font-inter grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {chartData.reduce((sum, item) => sum + item.breakageCount, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-placeholder-gray">Total Breakages</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                        ₹{chartData.reduce((sum, item) => sum + item.breakageValue, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-placeholder-gray">Total Value Lost</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {Math.max(...chartData.map(item => item.affectedShops))}
                    </div>
                    <div className="text-xs text-placeholder-gray">Peak Shops Affected</div>
                </div>

                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                        {Math.max(...chartData.map(item => item.affectedSKUs))}
                    </div>
                    <div className="text-xs text-placeholder-gray">Peak SKUs Affected</div>
                </div>
            </div>
        </div>
    );
}

export default BreakageTrendsChart;
