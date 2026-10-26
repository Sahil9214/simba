"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    TooltipProps,
} from "recharts";
import { usePeerComparisonData } from "@/hooks/api/useDashboard";
import { RectangularChartSkeleton } from "@/common/skeleton/rectangular-chart-skeleton";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { DataNotFoundError } from "@/common/error-boundaries/data-error";

/* Types */
type ChartRow = { name: string; simba: number; peers: number };

type Props = {
    data?: ChartRow[];
    height?: number;
    className?: string;
    searchTerm?: string;
    selectedLocation?: string;
    enableRealtime?: boolean;
    enableExport?: boolean;
    apiUrl?: string;
    category?: string;
};

/* Colors */
const COLORS = {
    simba: "#6366F1",
    peers: "#C7D2FE",
    grid: "#E5E5E5",
    xLabel: "#737373",
    title: "#0A0A0A",
};

const nf = new Intl.NumberFormat();

/* Tooltip */
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const simbaItem = payload.find((p: any) => p.dataKey === "simba");
    const peersItem = payload.find((p: any) => p.dataKey === "peers");

    return (
        <div
            role="dialog"
            aria-label={`Details for ${label}`}
            className="font-inter flex flex-col justify-center items-start py-2 px-3 sm:py-[6px] sm:px-[10px] gap-2 bg-white shadow-md rounded-lg z-10 flex-none min-w-[180px] max-w-[240px] sm:max-w-none"
        >
            <div className="flex flex-col items-start p-0 gap-1.5 flex-none order-0 self-stretch flex-grow-0">
                <div className="font-inter text-xs leading-normal font-medium text-gray-950 flex-none order-0 self-stretch flex-grow-0">
                    {label}
                </div>

                <div className="flex flex-col items-start p-0 gap-1.5 flex-none order-1 self-stretch flex-grow-0">
                    {simbaItem && (
                        <div className="flex flex-row items-center p-0 gap-2 flex-none order-0 w-full">
                            <span className="w-2 h-2 rounded-[2px] flex-none order-0 flex-shrink-0" style={{ background: COLORS.simba }} />
                            <div className="font-inter text-xs leading-normal font-normal text-neutral-600 flex-none order-1 flex-shrink-0">
                                Simba
                            </div>
                            <div className="flex flex-row justify-end items-center p-0 gap-0.5 flex-1 order-2 min-w-0">
                                <div className="font-inter text-xs leading-normal font-semibold text-gray-950 flex-none order-0 flex-shrink-0">
                                    {nf.format(Number(simbaItem.value ?? 0))}
                                </div>
                                <div className="font-inter text-xs leading-normal font-normal text-neutral-600 flex-none order-1 flex-shrink-0">
                                    Sales
                                </div>
                            </div>
                        </div>
                    )}

                    {peersItem && (
                        <div className="flex flex-row items-center p-0 gap-2 flex-none order-1 w-full">
                            <span className="w-2 h-2 rounded-[2px] flex-none order-0 flex-shrink-0" style={{ background: COLORS.peers }} />
                            <div className="font-inter text-xs leading-normal font-normal text-neutral-600 flex-none order-1 flex-shrink-0">
                                Peers (Other Brands)
                            </div>
                            <div className="flex flex-row justify-end items-center p-0 gap-0.5 flex-1 order-2 min-w-0">
                                <div className="font-inter text-xs leading-normal font-semibold text-gray-950 flex-none order-0 flex-shrink-0">
                                    {nf.format(Number(peersItem.value ?? 0))}
                                </div>
                                <div className="font-inter text-xs leading-normal font-normal text-neutral-600 flex-none order-1 flex-shrink-0">
                                    Sales
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export function PeerComparisonChart({
    data: propData,
    height = 268,
    className = "",
    searchTerm,
    selectedLocation,
    enableRealtime = false,
    enableExport = false,
    category
}: Props) {
    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch
    } = usePeerComparisonData({
        searchTerm,
        selectedLocation,
        category
    });

    const chartData = useMemo(() => {
        if (!apiData) return [];
        // console.log(apiData, "Peer comparison")
        return apiData.map((item: any) => ({
            name: item.period || item.shopName || item.name || 'Unknown',
            simba: item.simbaData || item.simbaValue || item.simba || 0,
            // peers: (Math.random() * 2000 + 5000).toFixed(0)
            peers: item.peerData || item.peerValue || item.peer || 0
        }));
    }, [propData, apiData]);

    const safeData = Array.isArray(chartData) ? chartData : [];

    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const responsiveHeight = useMemo(() => {
        if (windowWidth > 0) {
            if (windowWidth < 480) return 280;
            if (windowWidth < 640) return 320;
            if (windowWidth < 768) return 350;
            if (windowWidth < 1024) return 300;
            return height;
        }
        return height;
    }, [height, windowWidth]);

    const { yTicks, yTop } = useMemo(() => {
        const maxVal = safeData.reduce((acc, r) => Math.max(acc, r.simba, r.peers), 0);
        const desiredLines = 5;
        const rawStep = Math.ceil(maxVal / desiredLines) || 10;
        const step = Math.max(1, rawStep);
        const top = step * desiredLines;
        const ticks = Array.from({ length: desiredLines + 1 }, (_, i) => i * step);
        return { yTicks: ticks, yTop: top };
    }, [safeData]);

    // FIXED: Improved X-axis label truncation
    const formatXAxisLabel = (label: string) => {
        if (!label) return '';

        let maxLength = 12; // Default for large screens

        if (windowWidth > 0) {
            if (windowWidth < 480) {
                maxLength = 4; // Very small screens
            } else if (windowWidth < 640) {
                maxLength = 6; // Small screens
            } else if (windowWidth < 768) {
                maxLength = 8; // Medium screens
            } else if (windowWidth < 1024) {
                maxLength = 10; // Tablet
            }
        }

        if (label.length <= maxLength) return label;
        return label.substring(0, maxLength) + '...';
    };

    const barSize = useMemo(() => {
        const n = Math.max(1, safeData.length);
        if (windowWidth > 0) {
            let availableWidth = windowWidth;

            if (windowWidth < 480) {
                availableWidth = windowWidth - 60;
            } else if (windowWidth < 640) {
                availableWidth = windowWidth - 80;
            } else if (windowWidth < 768) {
                availableWidth = windowWidth - 100;
            } else if (windowWidth < 1024) {
                availableWidth = windowWidth - 120;
            } else if (windowWidth < 1280) {
                availableWidth = windowWidth - 200;
            } else {
                availableWidth = windowWidth - 300;
            }

            const groupWidth = availableWidth / n;
            const barWidth = Math.floor(groupWidth * 0.45);
            const computed = Math.max(16, Math.min(barWidth, 90));
            return computed;
        }

        const groupWidth = 400 / n;
        const barWidth = Math.floor(groupWidth * 0.45);
        return Math.max(18, Math.min(barWidth, 70));
    }, [safeData.length, windowWidth]);

    const handleExport = async (format: 'csv' | 'excel' | 'json') => {
        try {
            if (format === 'csv') {
                const csvHeaders = 'Shop Name,Simba Sales,Peer Sales\n';
                const csvRows = safeData.map(row =>
                    `"${row.name}",${row.simba},${row.peers}`
                ).join('\n');
                const csvContent = csvHeaders + csvRows;

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `peer-comparison-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
            } else if (format === 'excel') {
                const ws = XLSX.utils.json_to_sheet(safeData.map(row => ({
                    'Shop Name': row.name,
                    'Simba Sales': row.simba,
                    'Peer Sales': row.peers
                })));
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Peer Comparison');
                XLSX.writeFile(wb, `peer-comparison-${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (format === 'json') {
                const jsonContent = JSON.stringify(safeData, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `peer-comparison-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
            toast.success(`Data exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export data');
        }
    };

    useEffect(() => {
        if (enableRealtime) {
            const interval = setInterval(() => {
                refetch();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [enableRealtime, refetch]);

    if (isLoading && !propData) {
        return (
            <div className={className}>
                <RectangularChartSkeleton bars={6} height={height} />
            </div>
        );
    }

    if (isError && !propData) {
        return (
            <div className={`${className} p-4`}>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Failed to load peer comparison data</p>
                    <p className="text-gray-500 text-sm mb-4">{error?.message || 'Unknown error occurred'}</p>
                    <DataNotFoundError refetch={refetch} />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`${className}`}
            style={{ width: "100%", maxWidth: "100%" }}
            aria-label="Peer comparison chart container"
        >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                    <div className="font-inter text-base leading-normal font-bold flex items-center text-gray-950 h-6">
                        Peer Comparison
                        {enableRealtime && (
                            <span className="ml-2 flex items-center text-green-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                <span className="text-xs">Live</span>
                            </span>
                        )}
                    </div>
                    <div className="font-inter text-sm leading-5 sm:leading-6" style={{ color: "#737373" }}>
                        Simba vs Peer sales by top shops ({safeData.length} shops)
                        {searchTerm && (
                            <span className="ml-2 text-blue-600 whitespace-break-spaces">• Filtered by: {searchTerm}</span>
                        )}
                        {selectedLocation && (
                            <span className="ml-2 text-blue-600 whitespace-break-spaces">• Location: {selectedLocation}</span>
                        )}
                    </div>
                </div>
                {enableExport && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('csv')}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Export as CSV"
                        >
                            CSV
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Export as Excel"
                        >
                            Excel
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                            title="Export as JSON"
                        >
                            JSON
                        </button>
                    </div>
                )}
            </div>

            <div style={{ width: "100%", height: `${responsiveHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%" style={{ outline: "none" }}>
                    <BarChart
                        style={{ outline: "none" }}
                        data={safeData}
                        margin={{
                            top: windowWidth > 0 && windowWidth < 640 ? 30 : 20,
                            right: windowWidth > 0 && windowWidth < 640 ? 4 : 10,
                            left: windowWidth > 0 ?
                                (windowWidth < 480 ? -60 :
                                    windowWidth < 640 ? -35 : -60) : -60,
                            bottom: windowWidth > 0 ?
                                (windowWidth < 480 ? 30 :
                                    windowWidth < 640 ? 25 : 10) : 10
                        }}
                        barGap={windowWidth > 0 ?
                            (windowWidth < 480 ? 3 :
                                windowWidth < 640 ? 3 : 5) : 5}
                        barCategoryGap={windowWidth > 0 ?
                            (windowWidth < 480 ? "6" :
                                windowWidth < 640 ? "4" :
                                    windowWidth < 1024 ? "8" : "10") : "10"}
                    >
                        <CartesianGrid className="-z-1" horizontal={true} vertical={false} stroke={COLORS.grid} strokeWidth={1} horizontalPoints={yTicks} />
                        <XAxis
                            className="font-inter text-[8px] text-placeholder-gray"
                            dataKey="name"
                            axisLine={{ stroke: COLORS.grid, strokeWidth: 1 }}
                            tickLine={false}
                            tick={{
                                fill: COLORS.xLabel,
                                fontSize: windowWidth > 0 ?
                                    (windowWidth < 480 ? 9 :
                                        windowWidth < 640 ? 10 :
                                            windowWidth < 768 ? 11 : 12) : 12,
                                textAnchor: 'middle'
                            }}
                            tickFormatter={formatXAxisLabel}
                            interval={0}
                            height={windowWidth > 0 ?
                                (windowWidth < 480 ? 45 :
                                    windowWidth < 640 ? 55 :
                                        windowWidth < 768 ? 40 : 28) : 28}
                            angle={windowWidth > 0 ?
                                (windowWidth < 480 ? -30 :
                                    windowWidth < 640 ? -45 : 0) : 0}
                            textAnchor={windowWidth > 0 ?
                                (windowWidth < 640 ? 'end' : 'middle') : 'middle'}
                        />
                        <YAxis ticks={yTicks} domain={[0, yTop]} axisLine={false} tickLine={false} tick={false} />
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                        <Bar dataKey="simba" name="Simba" fill={COLORS.simba} maxBarSize={barSize * 0.8} radius={windowWidth > 0 ? (windowWidth < 480 ? [2, 2, 2, 2] : [6, 6, 6, 6]) : [6, 6, 6, 6]} />
                        <Bar dataKey="peers" name="Peers (Other Brands)" fill={COLORS.peers} maxBarSize={barSize * 0.8} radius={windowWidth > 0 ? (windowWidth < 480 ? [2, 2, 2, 2] : [6, 6, 6, 6]) : [6, 6, 6, 6]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-3">
                <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, background: COLORS.simba, borderRadius: 2 }} />
                    <p className="font-inter text-xs sm:text-sm font-semibold text-sidebar-foreground">Simba</p>
                </div>
                <div className="flex items-center gap-2">
                    <div style={{ width: 8, height: 8, background: COLORS.peers, borderRadius: 2 }} />
                    <p className="font-inter text-xs sm:text-sm font-semibold text-sidebar-foreground">Peers (Other Brands)</p>
                </div>
            </div>
        </div>
    );
}
