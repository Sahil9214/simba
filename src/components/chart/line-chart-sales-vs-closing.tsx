
import React, { useEffect, useMemo, useCallback } from "react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { useSalesVsClosingData } from "@/hooks/api/useDashboard";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { ChartHeadings } from "@/common/chartHeadings";
import { DataNotFoundError } from "@/common/error-boundaries/data-error";
import { ExportReportsButton } from "@/components/ui/export-reports-button";


interface LineChartProps {
    apiUrl?: string;
    title?: string;
    data?: Array<{ month: string; opening: number; closing: number }>;
    openingColor?: string;
    closingColor?: string;
    searchTerm?: string;
    selectedLocation?: string;
    category?: string;
    enableRealtime?: boolean;
    enableExport?: boolean;
    className?: string;
    description?: string;
}

// Custom tooltip component to match exact old design
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="bg-white rounded-lg shadow-lg px-[10px] py-[6px]"
            style={{
                boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div
                className="flex flex-col gap-1.5 w-full h-full"
            >
                <div className="text-sm font-medium text-gray-900 font-inter">
                    {label}
                </div>
                <div className="flex flex-col gap-1.5 w-full h-full">
                    {payload.map((entry: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-2"
                            style={{ width: '155px', height: '16px' }}
                        >
                            <div
                                className="rounded-sm"
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: entry.name === 'Sales' ? '#6366F1' : '#10B981',
                                    borderRadius: '2px'
                                }}
                            ></div>
                            <span
                                className="flex-1 font-inter"
                                style={{

                                    fontWeight: 400,
                                    fontSize: '12px',
                                    lineHeight: '16px',
                                    color: '#737373'
                                }}
                            >
                                {entry.name}
                            </span>
                            <span
                                className="text-right font-inter"
                                style={{

                                    fontWeight: 400,
                                    fontSize: '12px',
                                    lineHeight: '16px',
                                    color: '#0A0A0A'
                                }}
                            >
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Optimized legend component using Tailwind CSS
const CustomLegend = ({ openingColor = "#6366F1", closingColor = "#10B981" }: { openingColor?: string; closingColor?: string }) => {
    const LegendItem = ({ color, label }: { color: string; label: string }) => (
        <div className="flex items-center gap-1 p-1">
            <div className="relative w-4 h-4 flex items-center justify-center">
                <div className="absolute w-4 h-0.5 top-1.5 left-0" style={{ backgroundColor: color, zIndex: 1 }} />
                <div className="absolute w-4 h-4 rounded-full opacity-25" style={{ backgroundColor: color, zIndex: 2 }} />
                <div className="absolute w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: color, left: '4px', top: '3.5px', zIndex: 3 }} />
            </div>
            <span className="text-xs font-inter text-gray-600 font-normal" >
                {label}
            </span>
        </div>
    );

    return (
        <div className="w-full h-6 flex justify-end">
            <div className="flex items-center gap-2 px-2">
                <LegendItem color={openingColor} label="Sales" />
                <LegendItem color={closingColor} label="Closing" />
            </div>
        </div>
    );
};

// Custom dot component with ripple effect
const CustomDot = (props: any) => {
    const { cx, cy, fill, stroke, strokeWidth, r } = props;

    return (
        <g>
            <circle cx={cx} cy={cy} r={10} fill={stroke} opacity={0.25} />
            <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </g>
    );
};

export function LineChartSalesVsClosing({
    category,
    title = "Sales vs Closing Stock Trend (5-Months)",
    data: propData,
    openingColor = "#6366F1",
    closingColor = "#10B981",
    searchTerm,
    selectedLocation,
    enableRealtime = false,
    enableExport = false,
    className = "",
    description,

}: LineChartProps) {
    // Fetch sales vs closing data from API
    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch
    } = useSalesVsClosingData({
        searchTerm,
        selectedLocation,
        category
    });
    const data = useMemo(() => {
        if (propData) return propData;

        if (apiData && Array.isArray(apiData)) {
            return apiData.map((item: any) => ({
                month: item.date || item.period || item.month,
                //!dummy data dikhana hai muje abhi sack of the reason
                opening: item.govReport || item.fieldData || 0,
                // opening: Math.floor(Math.random() * (7000 - 3000 + 1)) + 3000, // Random value between 3000 and 7000
                // Use closingStock for Closing Stock
                closing: item.closingStock || item.closing || item.stock || 0
            }));
        }

        return [];
    }, [propData, apiData]);

    // Export functionality1
    // Export functionality

    const handleExport = useCallback(async () => {
        try {
            if (!data || data.length === 0) {
                toast.error("No data available to export");
                return;
            }

            // Prepare CSV data
            const csvHeaders = ["Period/Month", "Sales", "Closing Stock"];
            const csvRows = data.map(item => [
                item.month,
                item.opening,
                item.closing
            ]);

            // Create CSV content
            const csvContent = [
                csvHeaders.join(","),
                ...csvRows.map(row => row.join(","))
            ].join("\n");

            // Create blob and download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `Sales_vs_Closing_Stock_${timestamp}.csv`;

            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("CSV file downloaded successfully!");
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Failed to export data");
        }
    }, [data]);

    // Real-time updates
    useEffect(() => {
        if (enableRealtime && !propData) {
            const interval = setInterval(() => {
                refetch();
            }, 30000); // Refresh every 30 seconds

            return () => clearInterval(interval);
        }
    }, [enableRealtime, propData, refetch]);

    // Show loading state
    if (isLoading && !propData) {
        return (
            <div className={`flex flex-col justify-center items-center p-8 shadow-sm rounded-lg bg-white w-full max-w-4xl h-96 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Loading chart data...</p>
            </div>
        );
    }

    // Show error state
    if (isError && !propData) {
        return (
            <div className={`${className} p-4`}>
                <ChartHeadings heading={title} />
                {description && (
                    <div className="mt-1">
                        <div className="font-inter text-sm w-full text-gray-500">
                            {description}
                            {searchTerm && (
                                <span className="ml-2 text-blue-600">• Filtered by: {searchTerm}</span>
                            )}
                            {selectedLocation && (
                                <span className="ml-2 text-blue-600">• Location: {selectedLocation}</span>
                            )}
                        </div>
                    </div>
                )}
                <DataNotFoundError />
            </div>
        );
    }

    return (
        <div className={`flex flex-col  items-start p-0 gap-4 bg-white rounded-xl w-full  ${className}`}>
            <div className="flex flex-col items-start p-2 gap-4 bg-white rounded-xl w-full max-h-[428px]">
                {/* Header */}
                <div className="flex flex-col items-start p-0 gap-1 w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-center w-full">
                        <div >
                            <ChartHeadings heading={title} />
                            <p className="font-inter text-sm text-gray-600 w-full max-w-sm" >
                                Highlighting where reported numbers differ most from actual sales
                                {(searchTerm || selectedLocation) && (
                                    <span>
                                        {searchTerm && (
                                            <span className="ml-2 text-blue-600">• Filtered by: {searchTerm}</span>
                                        )}
                                        {selectedLocation && (
                                            <span className="ml-2 text-blue-600">• Location: {selectedLocation}</span>
                                        )}
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <ExportReportsButton
                                onClick={handleExport}
                                fullWidth
                                size="md"
                            />

                        </div>

                    </div>
                </div>

                {/* Legends */}
                <div className="w-full h-4 flex justify-end">
                    <CustomLegend openingColor={openingColor} closingColor={closingColor} />
                </div>

                {/* Chart Container */}
                <div className="flex flex-col items-center justify-center bg-white w-full h-68">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 1, left: 10 }}>
                            <CartesianGrid stroke="rgba(0, 0, 26, 0.15)" strokeDasharray="0" vertical={false} horizontal={true} />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                padding={{ left: -20, right: 0 }}
                                tick={{
                                    fill: "rgba(0, 0, 0, 0.7)",
                                    fontSize: 12,
                                    fontFamily: "Inter",
                                    textAnchor: "middle"
                                }}
                                tickFormatter={(value: string) => {
                                    const date = new Date(value); // agar value "2025-09-01" jaisi hai
                                    return date.toLocaleString("default", { month: "short" });
                                    // output -> Jan, Feb, Mar
                                }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fill: "rgba(0, 0, 0, 0.7)",
                                    fontSize: 12,
                                    fontFamily: "Inter"
                                }}
                                domain={[0, 'auto']}
                                width={29}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Area
                                type="monotone"
                                dataKey="opening"
                                name="Sales"
                                stroke={openingColor}
                                strokeWidth={1}
                                fill="transparent"
                                dot={<CustomDot />}
                                activeDot={{ r: 6 }}
                                style={{
                                    filter: "drop-shadow(0px 3px 3px rgba(137, 121, 255, 0.4)), drop-shadow(0px 6px 9px rgba(137, 121, 255, 0.4)), drop-shadow(0px 9px 18px rgba(137, 121, 255, 0.4))"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="closing"
                                name="Closing"
                                stroke={closingColor}
                                strokeWidth={1}
                                fill="transparent"
                                dot={<CustomDot />}
                                activeDot={{ r: 6 }}
                                style={{
                                    filter: "drop-shadow(0px 3px 3px #22C55E), drop-shadow(0px 6px 9px #DCFCE7), drop-shadow(0px 9px 18px #BBF7D0)"
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
