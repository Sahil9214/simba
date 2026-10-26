"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useReportingGapsData } from "@/hooks/api/useDashboard";
import { RectangularChartSkeleton } from "@/common/skeleton/rectangular-chart-skeleton";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ChartHeadings } from "@/common/chartHeadings";
import { DatabaseIcon } from "lucide-react";
import { ExportReportsButton } from "@/components/ui/export-reports-button";

export interface StoreData {
    shopName: string;
    govtData: number;
    fieldData: number;
    totalGap: number;
}

export interface ShopSalesVsClosingData {
    shopId: string;
    shopName: string;
    dpCode: string;
    location: string;
    salesData: number;
    closingStock?: number;
    totalGap: number;
    gapPercentage: number;
    marketSales?:number
    
}

export interface StoreReportVsFieldChartProps {
    color1?: string;
    color2?: string;
    heading?: string;
    description?: string;
    feature?: boolean;
    imageNode1?: string;
    imageNode2?: string;
    legend1?: string;
    legend2?: string;
    className?: string;
    searchTerm?: string;
    selectedLocation?: string;
    enableRealtime?: boolean;
    enableExport?: boolean;
    data?: StoreData[];
    dateRange?: { start: string; end: string };
    category?: string;
}
import { useShopSalesVsClosingData } from "@/hooks/api/useShopSalesVsCLosingData";
import { DataNotFoundError } from "@/common/error-boundaries/data-error";
import ErrorBoundaryDemo from "@/common/error-boundaries/ErrorBoundaryDemo";

export const CustomTooltip = ({
    active,
    payload,
    label,
    color1,
    color2,
    legend1,
    legend2,
}: any) => {
    if (!(active && payload && payload.length && payload[0]?.payload))
        return null;
    const d = payload[0].payload;
    color1 = color1 || "#F97316";
    color2 = color2 || "#3B82F6";
    legend1 = legend1 || "Govt";
    legend2 = legend2 || "Field";

    return (
        <div className="bg-white border border-gray-200 max-w-[250px] shadow-xl rounded-lg flex flex-col justify-between items-start gap-3 p-3 ">
            <div className="flex flex-col gap-2 w-full">
                <p className="font-inter text-sm font-semibold text-sidebar-foreground truncate">
                    {`Shop: ${label}`}
                </p>

                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className="w-2 h-2 rounded-xs"
                                style={{ background: color1 }}
                            />
                            <span className="font-inter text-xs text-placeholder-gray truncate">
                                {legend1} Data
                            </span>
                        </div>
                        <div className="flex-1" />

                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap w-20 justify-end">
                            <span
                                className="font-inter text-xs font-medium text-sidebar-foreground"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {d.govtData ?? 0}
                            </span>
                            <span className="font-inter text-xs text-sidebar-foreground">
                                Unit
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center w-full">
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className="w-2 h-2 rounded-xs"
                                style={{ background: color1 }}
                            />
                            <span className="font-inter text-xs text-placeholder-gray truncate">
                                {legend2} Data
                            </span>
                        </div>

                        <div className="flex-1" />

                        <div className="flex items-center gap-1 shrink-0 whitespace-nowrap w-20 justify-end">
                            <span
                                className="font-inter text-xs font-medium text-sidebar-foreground"
                                style={{ fontVariantNumeric: "tabular-nums" }}
                            >
                                {d.fieldData ?? 0}
                            </span>
                            <span className="font-inter text-xs text-sidebar-foreground">
                                Unit
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full border-t border-gray-200 pt-2">
                <div className="flex items-center w-full">
                    <span className="font-inter text-xs font-semibold text-sidebar-foreground">
                        Total
                    </span>
                    <div className="flex-1" />
                    <div className="flex items-center gap-1 shrink-0 whitespace-nowrap w-20 justify-end">
                        <span
                            className="font-inter text-xs font-medium text-sidebar-foreground"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {(d.govtData ?? 0) + (d.fieldData ?? 0)}
                        </span>
                        <span className="font-inter text-xs text-sidebar-foreground">
                            Unit
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function StoreReportVsFieldChart({
    color1 = "#F97316",
    color2 = "#3B82F6",
    heading = "Store Report vs Field Data",
    description,
    feature = true,
    imageNode1 = "/images/dark_node.png",
    imageNode2 = "/images/light_node.png",
    legend1 = "Government",
    legend2 = "Field",
    className = "",
    searchTerm,
    selectedLocation,
    enableRealtime = false,
    enableExport = false,
    data: propData,
    dateRange,
    category,
}: StoreReportVsFieldChartProps) {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "all">("all");

    const isSalesVsClosing =
        legend1.toLowerCase().includes("sales") ||
        legend2.toLowerCase().includes("closing");

    const reportingGapsQuery = useReportingGapsData({
        searchTerm,
        selectedLocation,
        dateRange,
        category,
    });

    const shopSalesVsClosingQuery = useShopSalesVsClosingData({
        searchTerm,
        selectedLocation,
        dateRange,
        category,
    });

    const {
        data: apiData,
        isLoading,
        isError,
        error,
        refetch,
    } = isSalesVsClosing ? shopSalesVsClosingQuery : reportingGapsQuery;
    const data: StoreData[] = useMemo(() => {
        if (propData) return propData;

        if (isSalesVsClosing) {
            if (apiData && Array.isArray(apiData)) {
                return apiData.map((shop: ShopSalesVsClosingData) => ({
                    shopName: shop.shopName,
                    govtData: shop.salesData,
                    fieldData: shop.marketSales,
                    totalGap: shop.totalGap,
                }));
            }
        } else {
            if ((apiData as any)?.shopWiseGaps) {
                return (apiData as any).shopWiseGaps.map((gap: any, index: number) => ({
                    shopName: gap.shopName || gap.name || `Shop ${index + 1}`,
                    govtData:
                        gap.missedCount ||
                        gap.govtData ||
                        Math.floor(Math.random() * 30) + 10,
                    fieldData:
                        gap.lateCount ||
                        gap.fieldData ||
                        Math.floor(Math.random() * 25) + 10,
                    totalGap:
                        (gap.missedCount || 0) + (gap.lateCount || 0) ||
                        Math.floor(Math.random() * 15) + 5,
                }));
            }
        }

        return [];
    }, [propData, apiData, isSalesVsClosing]);
    const filtered =
        data && data.length > 0
            ? data.filter(
                (d) =>
                    (d.govtData && d.govtData > 0) || (d.fieldData && d.fieldData > 0)
            )
            : [];

    const sorted =
        filtered.length > 0
            ? [...filtered]
                .sort((a, b) => {
                    if (sortOrder === "asc")
                        return (a.totalGap || 0) - (b.totalGap || 0);
                    if (sortOrder === "desc")
                        return (b.totalGap || 0) - (a.totalGap || 0);
                    return 0;
                })
                .slice(0, 70)
            : [];

    const chartData = sorted
        ?.map((d) => {
            const fieldData = Math.max(0, Number(d.fieldData) || 0);
            const govtData = Math.max(0, Number(d.govtData) || 0);
            const total = govtData - fieldData;

            return {
                name: d.shopName || "Unknown Shop",
                fieldData,
                damagedData: govtData,
                govtData,
                total,
            };
        })
        .filter((d) => {
            // Ensure all numeric values are valid and finite
            const isValid =
                !isNaN(d.fieldData) &&
                !isNaN(d.damagedData) &&
                !isNaN(d.govtData) &&
                !isNaN(d.total) &&
                isFinite(d.fieldData) &&
                isFinite(d.damagedData) &&
                isFinite(d.govtData) &&
                isFinite(d.total);

            // DEBUG: Log validity check
            if (!isValid && process.env.NODE_ENV === "development") {
                console.warn(
                    "[StoreReportVsFieldChart] Invalid chart data filtered out:",
                    d
                );
            }

            return isValid;
        });

    // DEBUG: Log final chart data


    const finalChartData = chartData;


    const handleExport = useCallback(
        async () => {
            try {
                const rows = (finalChartData || []).map((d: any) => ({
                    Shop: d.name,
                    [legend1]: d.govtData ?? 0,
                    [legend2]: d.fieldData ?? 0,
                    TotalGap: d.total ?? ((d.govtData ?? 0) - (d.fieldData ?? 0)),
                }));

                if (!rows.length) {
                    toast.info("No data available to export");
                    return;
                }

                const header = ["Shop", legend1, legend2, "TotalGap"] as string[];
                const worksheet = XLSX.utils.json_to_sheet(rows, { header });
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

                const makeSlug = (s: string | undefined) =>
                    (s || "")
                        .toString()
                        .trim()
                        .replace(/[^a-zA-Z0-9\s-_]+/g, "")
                        .replace(/\s+/g, "_")
                        .replace(/_+/g, "_");

                const parts = [
                    makeSlug(heading || (isSalesVsClosing ? "Sales_vs_Closing" : "Govt_vs_Field")),
                    makeSlug(selectedLocation),
                    makeSlug(searchTerm),
                    dateRange?.start && dateRange?.end
                        ? `${makeSlug(dateRange.start)}-to-${makeSlug(dateRange.end)}`
                        : "",
                ].filter(Boolean);

                const timestamp = new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace(/[:T]/g, "-");

                const filename = `${parts.join("_") || "report"}_${timestamp}.csv`;

                XLSX.writeFile(workbook, filename, { bookType: "csv" });
                toast.success("CSV exported successfully");
            } catch (err) {
                console.error("Export failed", err);
                toast.error("Failed to export CSV");
            }
        },
        [finalChartData, legend1, legend2, heading, selectedLocation, searchTerm, dateRange, isSalesVsClosing]
    );

    useEffect(() => {
        if (enableRealtime && !propData) {
            const interval = setInterval(() => {
                refetch();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [enableRealtime, propData, refetch]);

    if (isLoading && !propData) {
        return (
            <div className={`w-full ${className}`}>
                <RectangularChartSkeleton bars={8} height={350} />
            </div>
        );
    }

    if (isError && !propData) {
        return (
            <>
                <div className="flex-1">
                    <ChartHeadings heading={heading} />
                    {description && (
                        <div className="mt-1">
                            <div className="font-inter text-sm w-full text-gray-500">
                                {description} ({filtered.length} of {data.length} shops{" "}
                                {isSalesVsClosing ? "with sales data" : "with reporting gaps"}
                                )
                                {searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        • Filtered by: {searchTerm}
                                    </span>
                                )}
                                {selectedLocation && (
                                    <span className="ml-2 text-blue-600">
                                        • Location: {selectedLocation}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div>
                    <DataNotFoundError />
                </div>
            </>
        )
    }
    const hasNoData = !data || data.length === 0;
    const hasNoChartData = !chartData || chartData.length === 0;
    const shouldShowEmptyState = hasNoData || hasNoChartData;

    if (shouldShowEmptyState) {
        return (
            <div
                className={`w-full ${className}`}
                style={{ boxShadow: "none", border: "none" }}
            >
                <div className="px-0 py-2">
                    <div className="text-center">
                        <ChartHeadings heading={heading} />
                        <div className="text-gray-500 text-sm mb-4">
                            {isSalesVsClosing
                                ? "No shop sales vs closing stock data available for the selected criteria"
                                : "No store reporting data available for the selected criteria"}
                        </div>
                        {searchTerm && (
                            <div className="text-base font-inter text-placeholder-gray mb-2">
                                • Filtered by: {searchTerm}
                            </div>
                        )}
                        {selectedLocation && (
                            <div className="text-sm font-inter text-primary mb-4">
                                • Location: {selectedLocation}
                            </div>
                        )}
                        <div className="h-32 bg-gray-50 rounded-lg w-[98%] mx-auto flex items-center justify-center">
                            <div className="text-placeholder-gray text-sm">No data to display</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (finalChartData && finalChartData.length === 0) {
        return (
            <div className={`w-full ${className}`}>
                <DataNotFoundError />
            </div>
        );
    }

    return (
        <div
            className={`w-full ${className}`}
            style={{ boxShadow: "none", border: "none" }}
        >
            <div className={`${heading.includes("Report") ? "px-4" : ""}`}>
                <div className="flex flex-col lg:flex-row items-center justify-between">
                    <div>
                        <ChartHeadings heading={heading} />
                        {description && (
                            <div className="mt-1">
                                <div className="font-inter text-sm w-full text-gray-500 max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-md">
                                    {description} ({filtered.length} of {data.length} shops{" "}
                                    {isSalesVsClosing ? "with sales data" : "with reporting gaps"}
                                    )

                                </div>
                            </div>

                        )}

                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        {feature && (
                            <Select
                                value={sortOrder}
                                onValueChange={(value: "all" | "asc" | "desc") =>
                                    setSortOrder(value)
                                }
                            >
                                <SelectTrigger className="w-28 h-8">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Sort</SelectItem>
                                    <SelectItem value="asc">High to Low</SelectItem>
                                    <SelectItem value="desc">Low to High</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        <ExportReportsButton
                            onClick={handleExport}
                            className="lg:max-w-[200px]"
                            size="md"
                        />
                    </div>
                </div>
                <div className="flex justify-end items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <Image src={imageNode1!} alt="dark_node" width={16} height={16} />
                        <span className="text-sm text-[#000000] opacity-70">
                            {legend1} Data
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image src={imageNode2!} alt="light_node" width={16} height={16} />
                        <span className="text-sm text-[#000000] opacity-70">
                            {legend2} Data
                        </span>
                    </div>
                </div>
            </div>

            <div className="">
                <div className="h-64 md:h-60 w-full" style={{ paddingTop: "0px" }}>
                    {finalChartData && finalChartData.length > 0 ? (
                        <ResponsiveContainer className="mt-4 " width="100%" height={320}>
                            <BarChart
                                data={finalChartData}
                                margin={{ top: 20, right: 10, left: -22, bottom: 20 }}
                                barCategoryGap="10%"
                            >
                                <CartesianGrid stroke="#E5E5E5" horizontal vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={false}
                                    height={50}
                                    padding={{ left: 0, right: 0 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#666" }}
                                    allowDecimals={false}
                                    domain={[0, "auto"]}
                                />
                                <Tooltip
                                    content={
                                        <CustomTooltip
                                            color1={color1}
                                            color2={color2}
                                            legend1={legend1}
                                            legend2={legend2}
                                        />
                                    }
                                    cursor={{ fill: "rgba(199, 210, 254, 0.12)" }}
                                />

                                <Bar
                                    dataKey="damagedData"
                                    name={legend1}
                                    stackId="a"
                                    barSize={8}
                                    fill={color1}
                                    radius={[0, 0, 0, 0]}
                                    isAnimationActive={false}
                                />
                                <Bar
                                    dataKey="fieldData"
                                    name={legend2}
                                    stackId="a"
                                    barSize={8}
                                    fill={color2}
                                    radius={[2, 2, 0, 0]}
                                    isAnimationActive={false}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                            <ErrorBoundaryDemo />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
