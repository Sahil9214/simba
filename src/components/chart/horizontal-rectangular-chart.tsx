

import React, { useMemo, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { InfoBadge } from "@/common/info-badge";
import { useSalesByCategory } from "@/hooks/api/useSalesAnalytics";
import { useTopProducts } from "@/hooks/api/useDashboard";
import { RectangularChartSkeleton } from "@/common/skeleton/rectangular-chart-skeleton";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";

// No fallback data - show empty state instead

interface HorizontalRectangularChartProps {
    searchTerm?: string;
    selectedLocation?: string;
    title?: string;
    className?: string;
    enableRealtime?: boolean;
    enableExport?: boolean;
    dataSource?: 'categories' | 'products' | 'custom';
    data?: Array<{ name: string; value: number }>;
}


const CubeBarHorizontal = ({ x, y, width, height }: any) => {
    const depth = 6;
    return (
        <g>
            {/* front face */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="url(#barGradient)"
            />

            {/* right face */}
            <polygon
                points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
                fill="#DC2626"
            />

            {/* top face */}
            <polygon
                points={`
          ${x},${y}
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + depth},${y - depth}
        `}
                fill="#F87171"
            />
        </g>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as any;
        return (
            <div className="rounded-lg border border-gray-200 bg-white/95 backdrop-blur px-3 py-2 shadow-md">
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-900">
                    {data.value}
                    <span className="ml-1 text-xs font-normal text-gray-500">units</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function HorizontalRectangularChart({
    searchTerm,
    selectedLocation,
    title = "Inventory Age Buckets",
    className = "",
    enableRealtime = false,
    enableExport = false,
    dataSource = 'categories',
    data: propData
}: HorizontalRectangularChartProps) {
    // Fetch data based on source
    const salesByCategoryQuery = useSalesByCategory({
        searchTerm,
        selectedLocation
    });

    const topProductsQuery = useTopProducts({
        searchTerm,
        selectedLocation
    }, 5);

    // Transform data based on source
    const data = useMemo(() => {
        if (propData) return propData;

        if (dataSource === 'categories' && salesByCategoryQuery.data) {
            return salesByCategoryQuery.data.slice(0, 5).map((item: any) => ({
                name: item.category || item.name,
                value: item.revenue || item.units || item.value || 0
            }));
        }

        if (dataSource === 'products' && topProductsQuery.data) {
            return topProductsQuery.data.map((item: any) => ({
                name: item.name || item.label,
                value: item.sales || item.value || item.units || 0
            }));
        }

        return []; // Return empty array instead of fallback data
    }, [propData, dataSource, salesByCategoryQuery.data, topProductsQuery.data]);

    // Calculate maxValue from data
    const maxValue = Math.max(...data.map((item: { name: string; value: number }) => item.value));

    // Export functionality
    const handleExport = useCallback(async (format: 'csv' | 'excel' | 'json') => {
        try {
            const exportData = data.map((item: { name: string; value: number }) => ({
                'Product/Category': item.name,
                'Value': item.value,
                'Percentage': maxValue ? ((item.value / maxValue) * 100).toFixed(2) + '%' : '0%'
            }));

            if (format === 'csv') {
                const csvHeaders = 'Product/Category,Value,Percentage\n';
                const csvRows = exportData.map((row: { 'Product/Category': string; 'Value': number; 'Percentage': string }) =>
                    `"${row['Product/Category']}",${row.Value},"${row.Percentage}"`
                ).join('\n');
                const csvContent = csvHeaders + csvRows;

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            } else if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, title);
                XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (format === 'json') {
                const jsonContent = JSON.stringify(exportData, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
            toast.success(`Data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        }
    }, [data, maxValue, title]);

    // Loading and error states
    const isLoadingData = (dataSource === 'categories' && salesByCategoryQuery.isLoading) ||
        (dataSource === 'products' && topProductsQuery.isLoading);

    const hasError = (dataSource === 'categories' && salesByCategoryQuery.isError) ||
        (dataSource === 'products' && topProductsQuery.isError);

    if (isLoadingData && !propData) {
        return (
            <div className={className}>
                <RectangularChartSkeleton bars={5} height={258} />
            </div>
        );
    }

    if (hasError && !propData) {
        return (
            <div className={`${className} p-4`}>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Failed to load chart data</p>
                    <p className="text-gray-500 text-sm mb-4">Please try refreshing the page</p>
                    <button
                        onClick={() => {
                            if (dataSource === 'categories') {
                                salesByCategoryQuery.refetch();
                            } else if (dataSource === 'products') {
                                topProductsQuery.refetch();
                            }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm ${className}`}>
            <div className="mb-2 flex justify-between items-center">
                <div className="flex-1">
                    <div className="font-inter text-base font-semibold text-gray-900 flex items-center">
                        {title}
                        {enableRealtime && (
                            <span className="ml-2 flex items-center text-green-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                <span className="text-xs">Live</span>
                            </span>
                        )}
                    </div>
                    {(searchTerm || selectedLocation) && (
                        <div className="text-sm text-gray-500 mt-1">
                            {searchTerm && (
                                <span className="text-blue-600">• Filtered by: {searchTerm}</span>
                            )}
                            {selectedLocation && (
                                <span className="ml-2 text-blue-600">• Location: {selectedLocation}</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <InfoBadge text="Hover a bar to see its exact value." />
                    {enableExport && (
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                title="Export as CSV"
                            >
                                CSV
                            </button>
                            <button
                                onClick={() => handleExport('excel')}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                title="Export as Excel"
                            >
                                Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={258}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 10, right: 40, left: 0, bottom: 5 }}
                    barCategoryGap="25%"
                // className='bg-[#D6DBED66]'
                >
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FCA5A5" />
                            <stop offset="100%" stopColor="#EF4444" />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="0"
                        horizontal={false}
                        vertical={true}
                    />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "rgba(0,0,0,0.7)" }}
                        width={100}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} /> {/* Use custom tooltip */}
                    <Bar
                        dataKey="value"
                        shape={(props: any) => <CubeBarHorizontal {...props} />}
                        // background={{ fill: "#D6DBED66" }}  // <-- background track
                        label={{
                            position: "right",
                            offset: 20,
                            fill: "#D6DBED66",
                            fontSize: 10,
                            fontFamily: "Inter",
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}