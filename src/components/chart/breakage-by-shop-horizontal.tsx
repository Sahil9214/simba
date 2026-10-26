// components/BreakageByShopHorizontal.tsx
"use client";

import { ChartHeadings } from "@/common/chartHeadings";
import { breakageByShopHorizontalColors } from "@/lib/colors";
import React, { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import { DataNotFoundError } from "@/common/error-boundaries/data-error";
import { ExportReportsButton } from "@/components/ui/export-reports-button";

type BreakdownItem = {
    product: string;
    count: number;
    color: string; // Tailwind class like "bg-red-500"
};

type ShopRow = {
    name: string;
    value: number;
    breakdown: BreakdownItem[];
};

interface BreakageByShopChartProps {
    apiUrl?: string;
    data?: ShopRow[];
    title?: string;
    description?: string;
    className?: string;
    searchTerm?: string;
    selectedLocation?: string;
}




const CustomTooltip = ({ active, payload, label, data }: any) => {
    const [windowWidth, setWindowWidth] = useState(0);
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
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

    if (!active || !payload || !payload.length) return null;
    const shopData: ShopRow = payload[0].payload;

    // prefer breakdown sum when available
    const calculatedTotal =
        Array.isArray(shopData.breakdown) && shopData.breakdown.length
            ? shopData.breakdown.reduce((s, it) => s + (Number(it.count) || 0), 0)
            : shopData.value || 0;

    // Get the bar color for this specific shop to match the tooltip
    const getBarColor = (shopName: string) => {
        const colors = [
            "#2563EB", "#3B82F6", "#60A5FA",
            "#93C5FD", "#BFDBFE", "#DBEAFE",
        ];
        const barIndex = data.findIndex((d: any) => d.name === shopName);
        return colors[barIndex] || colors[0];
    };

    const barColor = getBarColor(label);

    // Responsive tooltip width and styling
    const getTooltipStyles = () => {
        if (windowWidth < 480) {
            return {
                width: '160px',
                minHeight: '100px',
                padding: '8px',
                fontSize: '11px'
            };
        } else if (windowWidth < 768) {
            return {
                width: '180px',
                minHeight: '110px',
                padding: '10px',
                fontSize: '11px'
            };
        } else {
            return {
                width: '204px',
                minHeight: '114px',
                padding: '12px',
                fontSize: '12px'
            };
        }
    };

    const tooltipStyles = getTooltipStyles();

    return (
        <div
            role="tooltip"
            className="font-inter bg-white rounded-lg shadow-lg border"
            style={{
                width: tooltipStyles.width,
                // minHeight: tooltipStyles.minHeight,
                padding: tooltipStyles.padding,
                gap: '8px',
                borderColor: `${barColor}30`
            }}
        >

            <div className="mb-2">
                <p
                    className="font-inter font-medium text-sidebar-foreground"
                    style={{
                        fontSize: tooltipStyles.fontSize,
                        lineHeight: '16px'
                    }}
                >
                    Top Breakage by skus in this shop
                </p>
            </div>
            <div className="space-y-1.5 mb-3" style={{ gap: windowWidth < 480 ? '4px' : '6px' }}>
                {shopData.breakdown?.map((item, idx) => {
                    // Create complementary colors based on the bar color
                    const getComplementaryColor = (baseColor: string, index: number) => {
                        const colorVariations = [
                            baseColor, // Full intensity
                            baseColor + 'CC', // 80% opacity
                            baseColor + '99', // 60% opacity
                        ];
                        return colorVariations[index] || colorVariations[0];
                    };

                    const itemHeight = windowWidth < 480 ? '10px' : '12px';
                    const iconSize = windowWidth < 480 ? '6px' : '8px';
                    const itemColor = getComplementaryColor(barColor, idx);

                    return (
                        <div
                            key={idx}
                            className="flex"
                            style={{
                                gap: windowWidth < 480 ? '6px' : '8px',
                                height: itemHeight
                            }}
                        >
                            <div
                                className="rounded-sm shrink-0"
                                style={{
                                    width: iconSize,
                                    height: iconSize,
                                    backgroundColor: itemColor,
                                    borderRadius: '2px'
                                }}
                            />
                            <span
                                className="font-inter text-placeholder-gray"
                                style={{
                                    fontSize: tooltipStyles.fontSize,
                                    lineHeight: '100%'
                                }}
                            >
                                {item.product}
                            </span>
                        </div>
                    );
                })}
            </div>


        </div>
    );
};

export function BreakageByShopHorizontal({
    apiUrl,
    data: propData,
    title = "Breakage by Shop",
    description = "Shows number of broken units reported per shop. Use this chart to quickly spot hotspots where handling or storage issues may be recurring.",
    className = "",
    searchTerm,
    selectedLocation
}: BreakageByShopChartProps) {
    const [data, setData] = useState<ShopRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [windowWidth, setWindowWidth] = useState(0);

    // Window resize detection for responsive chart
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
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

    // fetch / use prop data
    useEffect(() => {
        if (propData && propData.length) {
            setData(propData);
            return;
        }
        if (!apiUrl) return;

        let cancelled = false;
        setIsLoading(true);
        setError(null);

        fetch(apiUrl)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((apiData) => {
                if (cancelled) return;
                const transformed: ShopRow[] = (apiData || []).map((item: any) => ({
                    name: item.shopName || item.name || item.shop || "Unknown",
                    value: Number(item.totalBreakage ?? item.value ?? item.total ?? 0),
                    breakdown: item.products || item.breakdown || item.productBreakdown || [],
                }));
                setData(transformed.length ? transformed : []);
            })
            .catch((err) => {
                console.error("Error fetching breakage data:", err);
                setError(String(err?.message ?? err));

            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [apiUrl, propData]);

    const memoData = useMemo(() => data || [], [data]);
    const chartData = useMemo(() => memoData.slice(0, 5), [memoData]);

    // Calculate maximum bar size to prevent single bar from being too large
    // For horizontal charts, maxBarSize controls the height of bars
    // Limit to ~50px per bar max, so even with 1 item it looks reasonable
    const maxBarSize = 50;

    // loading fallback UI
    if (isLoading) {
        return (
            <div className={`w-full bg-white rounded-lg p-6 shadow-sm ${className}`}>
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <p className="mt-4 text-gray-500 text-sm">Loading breakage data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <>
                <div className="font-inter flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 ">
                        {title && <ChartHeadings heading={title} />}
                        {description && <div className="font-inter text-sm text-placeholder-gray mt-1 pr-[20px]">{description}</div>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0">{/* reserved controls */}</div>
                </div>
                <div>
                    <DataNotFoundError />
                </div>
            </>
        );
    }

    // Handle empty data state
    if (!chartData || chartData.length === 0) {
        return (
            <>
                <div className="font-inter flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                    <div className="min-w-0 ">
                        {title && <ChartHeadings heading={title} />}
                        {description && <div className="font-inter text-sm text-placeholder-gray mt-1 pr-[20px]">{description}</div>}
                    </div>
                    <div className="flex items-center gap-2 opacity-0">{/* reserved controls */}</div>
                </div>
                <div>
                    <DataNotFoundError />
                </div>
            </>
        );
    }

    const handleExport = () => {
        try {
            const headers = ["Shop", "Total", "Breakdown"];

            // Build rows from all data (memoData), not just chartData which is limited to 5 items
            const rows = (memoData || []).map((r) => {
                const breakdownStr = Array.isArray(r.breakdown) && r.breakdown.length
                    ? r.breakdown
                        .map((b) => `${String(b.product ?? "").replace(/"/g, '""')}:${Number(b.count ?? 0)}`)
                        .join("; ")
                    : "";

                return {
                    Shop: r.name ?? "",
                    Total: Number(r.value ?? 0),
                    Breakdown: breakdownStr,
                };
            });

            // Create CSV string with proper escaping and BOM for Excel
            const csvLines = [
                headers.join(","),
                ...rows.map((row) =>
                    headers
                        .map((h) => {
                            const val = row[h as keyof typeof row] ?? "";
                            const str = String(val);
                            const escaped = str.replace(/"/g, '""');
                            return `"${escaped}"`;
                        })
                        .join(",")
                ),
            ];
            const csv = csvLines.join("\n");
            const bom = "\uFEFF";
            const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });

            // Build filename
            const dateStr = new Date().toISOString().slice(0, 10);
            const parts = ["breakage-by-shop"];
            if (selectedLocation) parts.push(`loc-${String(selectedLocation).replace(/\s+/g, "_")}`);
            if (searchTerm) parts.push(`q-${String(searchTerm).replace(/\s+/g, "_")}`);
            parts.push(dateStr);
            const fileName = `${parts.join("_")}.csv`;

            // Trigger download
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("CSV export failed:", e);
            // Optional: surface UI error if needed
        }
    };


    return (
        <section
            aria-labelledby="breakage-chart-title"
            className={`w-full bg-white rounded-lg border-4flex flex-col items-start p-0 gap-2.5 flex-none order-1 self-stretch grow-0 z-10 ${className}`}
        >
            {/* Header */}
            <div className="font-inter flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div className="min-w-0 ">
                    {title && <ChartHeadings heading={title} />}
                    {description && <div className="font-inter text-sm max-w-sm text-placeholder-gray mt-1 pr-[20px]">{description}</div>}
                </div>
                <div className="flex items-center gap-2 ">
                    <ExportReportsButton
                        onClick={handleExport}
                        fullWidth
                        size="md"
                    />
                </div>
            </div>

            {/* Chart area - responsive heights */}
            <div className="flex flex-col items-center p-0 gap-9 w-full h-[268px] min-h-[200px] flex-none order-0 grow-0">
                {/* Use responsive heights with Tailwind breakpoints */}
                <div className="w-full h-[268px]  min-h-[200px]  flex-none order-0 self-stretch grow-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical" // horizontal bars
                            margin={{
                                top: 8,
                                right: windowWidth < 480 ? 10 : windowWidth < 768 ? 60 : 40,
                                left: windowWidth < 480 ? 10 : windowWidth < 768 ? 40 : -10,
                                bottom: 8
                            }}
                            barCategoryGap={windowWidth < 480 ? "5%" : "10%"}
                        >
                            <XAxis type="number" hide />
                            <YAxis className="truncate max-w-[50px] font-inter"
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                width={windowWidth < 480 ? 80 : windowWidth < 768 ? 90 : 120}
                                tick={{
                                    fontSize: windowWidth < 480 ? 10 : windowWidth < 768 ? 11 : 10,
                                    fill: "#737373",

                                    fontWeight: 400,
                                    textAnchor: "end"
                                }}
                            />
                            <Tooltip content={(props) => <CustomTooltip {...props} data={chartData} />} cursor={false} />
                            <Bar
                                dataKey="value"
                                maxBarSize={maxBarSize}
                                shape={(props: any) => {
                                    const colors = { breakageByShopHorizontalColors }
                                    const barIndex = chartData.findIndex((d: ShopRow) => d.name === props.payload.name);
                                    const barColor = colors.breakageByShopHorizontalColors[barIndex] || colors.breakageByShopHorizontalColors[0];

                                    return (
                                        <rect
                                            x={props.x}
                                            y={props.y}
                                            width={props.width}
                                            height={props.height}
                                            fill={barColor}
                                            rx={8}
                                            ry={8}
                                        />
                                    );
                                }}
                                background={{ fill: "transparent" }}
                                className="font-inter"
                                label={{
                                    position: "right",
                                    offset: windowWidth < 480 ? 8 : 12,
                                    fill: "#0A0A0A",
                                    fontSize: windowWidth < 480 ? 10 : windowWidth < 768 ? 11 : 12,

                                    fontWeight: 400
                                }}
                                isAnimationActive={true}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Error row */}
            {error && (
                <div className="mt-3 text-xs text-red-600">
                    Error loading data: {error}
                </div>
            )}
        </section>
    );
}
