// components/DataDonutCard.tsx
"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { List } from "lucide-react";
import { useBreakageReport } from "@/hooks/api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DataRow, ChartCardProps } from "@/lib/types/legacy";
import { useDebounced } from "@/hooks/useDebounce";
import { useTopProducts, useTopShops, useDemandBySku, useSalesByPackSize } from "@/hooks/api/useDashboard";
import { DonutChartSkeleton } from "@/common/skeleton/pie-chart-skeleton";
import { showToast } from "@/components/ui/toast";
import * as XLSX from 'xlsx';
import { ChartHeadings } from "@/common/chartHeadings";
import { DataNotFoundError } from "@/common/error-boundaries/data-error";
import { ExportReportsButton } from "@/components/ui/export-reports-button";

interface ExtendedDataRow extends DataRow {
    sizeML?: number;
    breakageRate?: number;
    breakageCount?: number;
}

interface ExtendedChartCardProps extends ChartCardProps {
    showCenterData?: boolean;
    centerLabel?: string;
    searchTerm?: string;
    selectedLocation?: string;
    enableRealtime?: boolean;
    enableExport?: boolean;
    dataSource?: 'topPerformingProducts' | 'topResellersShops' | 'demandBySku' | 'salesByPackSize' | 'breakageShop';
    dateRange?: { start: string; end: string };
    category?: string;
}

export function DataDonutCard(props: ExtendedChartCardProps) {
    const {
        title,
        subtitle,
        data: controlledData,
        colors = ["#0ea5a4", "#34d399", "#7dd3fc", "#99f6e4", "#a7f3d0"],
        controls = { sort: true, filter: false, search: false },
        legend = { position: "right" },
        initialSort = { key: "value", dir: "desc" },
        loadingSkeleton = null,
        errorRenderer,
        onSelect,
        className = "",
        ariaLabel,
        filterOptions = [],
        listShownButton = false,
        showCenterData = true,
        centerLabel = "Total",
        searchTerm,
        selectedLocation,
        enableRealtime = false,
        enableExport = false,
        dataSource = 'topPerformingProducts',
        dateRange,
        category,
    } = props;

    // control states
    const [searchQ, setSearchQ] = useState("");
    const debouncedSearch = useDebounced(searchQ, 300);
    const [sortState, setSortState] = useState(initialSort);
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [listOpen, _setListOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isTooltipActive, setIsTooltipActive] = useState(false);

    // Refs for better hover management
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const legendContainerRef = useRef<HTMLDivElement>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Default limit for all API calls - hardcoded to 25
    const DEFAULT_LIMIT: number = 25;

    // Common filter object to avoid recreating on every render
    const commonFilters = useMemo(() => ({
        searchTerm: searchTerm || debouncedSearch,
        selectedLocation,
        dateRange,
        category
    }), [searchTerm, debouncedSearch, selectedLocation, dateRange, category]);

    // API data hooks for different data sources - conditionally enabled based on dataSource
    // This prevents all 5 queries from running simultaneously
    const topProductsQuery = useTopProducts(
        commonFilters,
        DEFAULT_LIMIT,
        { enabled: dataSource === 'topPerformingProducts' }
    );

    const topShopsQuery = useTopShops(
        commonFilters,
        714,
        { enabled: dataSource === 'topResellersShops' }
    );

    const demandBySkuQuery = useDemandBySku(
        commonFilters,
        { enabled: dataSource === 'demandBySku' }
    );

    const salesByPackSizeQuery = useSalesByPackSize(
        commonFilters,
        { enabled: dataSource === 'salesByPackSize' }
    );

    const breakageByShop = useBreakageReport(
        commonFilters,
        { enabled: dataSource === 'breakageShop' }
    );

    // Determine which query to use based on dataSource
    const activeQuery = useMemo(() => {
        switch (dataSource) {
            case 'topPerformingProducts':
                return topProductsQuery;
            case 'topResellersShops':
                return topShopsQuery;
            case 'demandBySku':
                return demandBySkuQuery;
            case 'salesByPackSize':
                return salesByPackSizeQuery;
            case 'breakageShop':
                return breakageByShop;
            default:
                return breakageByShop;

        }
    }, [dataSource, topProductsQuery, topShopsQuery, demandBySkuQuery, salesByPackSizeQuery, breakageByShop]);

    const dynamicData = useMemo(() => {
        if (!activeQuery.data) return null;

        switch (dataSource) {

            case 'topPerformingProducts':
                if (!Array.isArray(activeQuery.data)) return null;
                return activeQuery.data.map((item: any) => ({
                    key: item.skuId || item.productName?.toLowerCase().replace(/\s+/g, '-') || `product-${Math.random()}`,
                    label: `${item.productName} (${item.sizeML})ml` || 'Unknown Product',
                    value: item.salesUnits || 0,
                    sizeML: item.sizeML || 0
                }));

            case 'topResellersShops':
                if (!Array.isArray(activeQuery.data)) return null;
                return activeQuery.data.map((item: any) => ({
                    key: item.shopId || item.shopName?.toLowerCase().replace(/\s+/g, '-') || `shop-${Math.random()}`,
                    label: item.shopName || 'Unknown Shop',
                    value: item.stockUnits || 0
                }));

            case 'demandBySku':
                if (!Array.isArray(activeQuery.data)) return null;
                return activeQuery.data.map((item: any) => {
                    const productName = item.productName || 'Unknown SKU';
                    const sizeML = item.sizeML || 0;
                    const displayLabel = sizeML > 0
                        ? `${productName} (${sizeML}ml)`
                        : productName;

                    return {
                        key: item.skuId || productName?.toLowerCase().replace(/\s+/g, '-') || `sku-${Math.random()}`,
                        label: displayLabel,
                        value: item.demand || 0,
                        sizeML: sizeML
                    };
                });

            case 'salesByPackSize':
                if (!Array.isArray(activeQuery.data)) return null;
                return activeQuery.data.map((item: any) => {
                    const productName = item.productName || 'Unknown Pack Size';
                    const packSize = item.skuPackSize || item.sizeML || 0;
                    const displayLabel = packSize
                        ? `${productName} (${packSize}ml)`
                        : productName;

                    return {
                        key: item.skuId || productName?.toLowerCase().replace(/\s+/g, '-') || `pack-${Math.random()}`,
                        label: displayLabel,
                        value: item.sales || 0,
                        sizeML: packSize
                    };
                });
            case 'breakageShop':

                // breakageShop returns a different structure: { data: { bySKU, byShop, ... } }
                const breakageData = activeQuery.data as any;
                if (!breakageData?.bySKU || !Array.isArray(breakageData.bySKU)) return null;
                return breakageData.bySKU.map((item: any) => {
                    const productName = item.productName || "Unknown Product";
                    const category = item.category || "";
                    const sizeML = item.sizeML || 0;
                    const displayLabel = `${productName}${sizeML ? ` (${sizeML}ml)` : ''}`;

                    return {
                        key: item.skuId || productName?.toLowerCase().replace(/\s+/g, '-') || `sku-${Math.random()}`,
                        label: displayLabel,
                        value: item.breakageCount || 0,
                        sizeML: parseInt(sizeML),
                        breakageCount: item.breakageCount || 0,
                        breakageRate: item.breakageRate || 0
                    }
                })


            default:
                return null;
        }
    }, [dataSource, activeQuery.data]);

    const displayData: ExtendedDataRow[] = useMemo(() => {
        if (controlledData && controlledData.length > 0) {
            return controlledData;
        }
        if (dynamicData && dynamicData.length > 0) {
            return dynamicData;
        }
        return [];
    }, [controlledData, dynamicData]);

    // Apply search filter first
    const searchFilteredData = useMemo(() => {
        if (!controls.search || !debouncedSearch) return displayData;

        const searchTerm = debouncedSearch.toLowerCase().trim();
        return displayData.filter(item =>
            item.label.toLowerCase().includes(searchTerm) ||
            item.key.toLowerCase().includes(searchTerm)
        );
    }, [displayData, debouncedSearch, controls.search]);

    // Apply sorting
    const sortedData: ExtendedDataRow[] = useMemo(() => {
        if (!controls.sort || !searchFilteredData.length) return searchFilteredData;

        return [...searchFilteredData].sort((a, b) => {
            const aValue = a[sortState.key as keyof ExtendedDataRow];
            const bValue = b[sortState.key as keyof ExtendedDataRow];

            if (sortState.key === 'value') {
                const aNum = Number(aValue) || 0;
                const bNum = Number(bValue) || 0;
                return sortState.dir === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const aStr = String(aValue || '').toLowerCase();
            const bStr = String(bValue || '').toLowerCase();

            if (sortState.dir === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        });
    }, [searchFilteredData, sortState, controls.sort]);
    const total = useMemo(
        () => sortedData.reduce((s, r) => s + (Number.isFinite(r.value) ? r.value : Number(r.value) || 0), 0),
        [sortedData]
    );

    // Helper function to get color based on sort direction
    // For "low to high", we want light colors for small values (reverse colors)
    // For "high to low", we want dark colors for large values (normal colors)
    const getColorForIndex = useCallback((idx: number) => {
        const colorIndex = idx % colors.length;
        if (sortState.key === 'value' && sortState.dir === 'asc') {
            // Reverse colors for ascending sort (low to high)
            const reversedIndex = (colors.length - 1) - colorIndex;
            return colors[reversedIndex];
        }
        return colors[colorIndex];
    }, [colors, sortState]);

    // Center display data
    const centerDisplayData = useMemo(() => {
        if (!showCenterData) return null;

        if (hoveredItem && !isScrollingRef.current) {
            const hoveredData = sortedData.find(d => d.key === hoveredItem);
            if (hoveredData) {
                const percentage = total ? Math.round((Number(hoveredData.value) / total) * 100) : 0;
                return {
                    value: hoveredData.value,
                    label: hoveredData.label,
                    percentage
                };
            }
        }

        return {
            value: total,
            label: centerLabel,
            percentage: 100
        };
    }, [showCenterData, hoveredItem, sortedData, total, centerLabel]);

    // Get sort display text
    const getSortDisplayText = useCallback(() => {
        if (sortState.key === 'value') {
            return sortState.dir === 'desc' ? 'High to Low' : 'Low to High';
        }
        if (sortState.key === 'label') {
            return sortState.dir === 'asc' ? 'A to Z' : 'Z to A';
        }
        return `${sortState.key} ${sortState.dir === 'desc' ? '↓' : '↑'}`;
    }, [sortState]);

    const handleSliceClick = useCallback(
        (entry: any) => {
            const key = entry?.payload?.key ?? entry?.name;
            const row = sortedData.find((d) => d.key === key);
            if (onSelect && row) onSelect(row);
        },
        [sortedData, onSelect]
    );

    // Clear all hover states
    const clearHoverStates = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }
        setHoveredItem(null);
        setIsTooltipActive(false);
    }, []);

    // Improved hover handlers with scroll detection
    const handleMouseEnter = useCallback((key: string) => {
        // Don't set hover state if scrolling
        if (isScrollingRef.current) {
            return;
        }

        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
            tooltipTimeoutRef.current = null;
        }

        setHoveredItem(key);
        setIsTooltipActive(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Add small delay before clearing to allow smooth transitions
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredItem(null);
            setIsTooltipActive(false);
        }, 100);
    }, []);

    // Component-level mouse leave handler
    const handleComponentMouseLeave = useCallback(() => {
        clearHoverStates();
    }, [clearHoverStates]);

    // Enhanced scroll handler that catches all scroll events
    const handleScrollEvent = useCallback(() => {
        // Set scrolling flag
        isScrollingRef.current = true;

        // Clear all hover states immediately
        clearHoverStates();

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Reset scrolling flag after scroll ends
        scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 150);
    }, [clearHoverStates]);

    const handleFilterChange = (id: string, v: any) => {
        setFilters((prev) => ({ ...prev, [id]: v }));
    };

    const primaryFilterGroup = filterOptions.length > 0 ? filterOptions[0] : undefined;

    // Custom Tooltip with scroll awareness
    const CustomTooltip = useCallback(({ active, payload }: any) => {
        // Don't show tooltip if scrolling or not active
        if (!active || !payload || !payload.length || isScrollingRef.current || !isTooltipActive) {
            return null;
        }

        const entry = payload[0]?.payload ?? payload[0];
        const name = entry?.label ?? entry?.name ?? "";
        const value = entry?.value ?? 0;
        const sizeMl = entry?.sizeML ?? 0;

        const idx = sortedData.findIndex((d) => d.label === name || d.key === entry?.key);
        const color = getColorForIndex(idx >= 0 ? idx : 0);

        const getUnitLabel = () => {
            switch (dataSource) {
                case 'demandBySku':
                    return 'demand';
                case 'salesByPackSize':
                    return 'sales';
                case 'breakageShop':
                    return 'breakage';
                default:
                    return 'units';
            }
        };

        return (
            <div className="font-inter flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white shadow-xl rounded-lg border border-gray-100 pointer-events-none  max-w-[calc(100vw-2rem)] sm:max-w-[280px] md:max-w-[320px]">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div
                        className="w-1.5 h-4 rounded-sm shrink-0"
                        style={{ backgroundColor: color }}
                    />
                    <div className="flex flex-col leading-tight min-w-0 flex-1">
                        <span className="font-inter text-xs text-gray-500 font-normal whitespace-pre-wrap break-words line-clamp-2">{name}</span>
                    </div>
                </div>
                <div className="text-xs font-inter text-gray-900 font-medium whitespace-nowrap sm:ml-0">
                    {value.toLocaleString()} {getUnitLabel()} {sizeMl > 0 ? `(${sizeMl}ml)` : ""}
                </div>
            </div>
        );
    }, [sortedData, getColorForIndex, dataSource, isTooltipActive]);

    // Export functionality
    // Export functionality
    const handleExport = useCallback(async () => {
        try {
            const rows = sortedData || [];
            if (!rows.length) {
                showToast("warning", "No data to export");
                return;
            }

            const unitLabel = (() => {
                switch (dataSource) {
                    case 'demandBySku':
                        return 'demand';
                    case 'salesByPackSize':
                        return 'sales';
                    case 'breakageShop':
                        return 'breakage';
                    default:
                        return 'units';
                }
            })();

            // Build metadata header (first lines in CSV)
            const meta: string[][] = [
                ['Report Title', title || 'Donut Report'],
                ['Data Source', dataSource],
                ['Location', selectedLocation || 'All'],
                ['Search', (searchTerm || debouncedSearch || '').toString()],
                ['Sort', getSortDisplayText()],
                ['Date Range', dateRange ? `${dateRange.start} to ${dateRange.end}` : 'All'],
            ];

            // Build column headers by data source
            let header: string[] = [];
            switch (dataSource) {
                case 'topPerformingProducts':
                    header = ['Key', 'Product', 'Size (ml)', unitLabel];
                    break;
                case 'topResellersShops':
                    header = ['Key', 'Shop', unitLabel];
                    break;
                case 'demandBySku':
                    header = ['Key', 'SKU', 'Size (ml)', unitLabel];
                    break;
                case 'salesByPackSize':
                    header = ['Key', 'Product', 'Pack Size (ml)', unitLabel];
                    break;
                case 'breakageShop':
                    header = ['Key', 'Product', 'Size (ml)', unitLabel, 'Breakage Rate (%)'];
                    break;
                default:
                    header = ['Key', 'Label', unitLabel];
            }

            // Map data rows
            const dataRows: (string | number)[][] = rows.map((r) => {
                switch (dataSource) {
                    case 'topPerformingProducts':
                        return [r.key, r.label, r.sizeML ?? '', Number(r.value) || 0];
                    case 'topResellersShops':
                        return [r.key, r.label, Number(r.value) || 0];
                    case 'demandBySku':
                        return [r.key, r.label, r.sizeML ?? '', Number(r.value) || 0];
                    case 'salesByPackSize':
                        return [r.key, r.label, r.sizeML ?? '', Number(r.value) || 0];
                    case 'breakageShop':
                        return [r.key, r.label, r.sizeML ?? '', Number(r.value) || 0, (r as any).breakageRate?.toFixed(2) ?? ''];
                    default:
                        return [r.key, r.label, Number(r.value) || 0];
                }
            });

            // Assemble AOA: metadata + blank line + header + data
            const aoa: (string | number)[][] = [
                ...meta,
                [''],
                header,
                ...dataRows,
            ];

            // Create CSV with XLSX
            const ws = XLSX.utils.aoa_to_sheet(aoa);
            const csv = XLSX.utils.sheet_to_csv(ws);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const safeTitle = (title || 'donut-report').toLowerCase().replace(/[^a-z0-9\-]+/g, '-');
            const filename = `${safeTitle}_${dataSource}_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast("success", "CSV exported");
        } catch (err) {
            console.error(err);
            showToast("error", "Failed to export CSV");
        }
    }, [sortedData, dataSource, title, selectedLocation, searchTerm, debouncedSearch, getSortDisplayText, dateRange]);

    // Real-time updates
    useEffect(() => {
        if (enableRealtime && !controlledData) {
            const interval = setInterval(() => {
                activeQuery.refetch();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [enableRealtime, controlledData, activeQuery]);

    // Comprehensive scroll listener - captures all scroll events
    useEffect(() => {
        // Handler for window scroll
        window.addEventListener("scroll", handleScrollEvent, true);

        // Handler for legend container scroll
        const legendElement = legendContainerRef.current;
        if (legendElement) {
            legendElement.addEventListener("scroll", handleScrollEvent, true);
        }

        // Handler for chart container scroll
        const chartElement = chartContainerRef.current;
        if (chartElement) {
            chartElement.addEventListener("scroll", handleScrollEvent, true);
        }

        return () => {
            window.removeEventListener("scroll", handleScrollEvent, true);
            if (legendElement) {
                legendElement.removeEventListener("scroll", handleScrollEvent, true);
            }
            if (chartElement) {
                chartElement.removeEventListener("scroll", handleScrollEvent, true);
            }
        };
    }, [handleScrollEvent]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
            if (tooltipTimeoutRef.current) {
                clearTimeout(tooltipTimeoutRef.current);
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const isLoadingData = activeQuery.isLoading;
    const hasError = activeQuery.isError;

    if (isLoadingData && loadingSkeleton) return <div className={className}>{loadingSkeleton}</div>;
    if (isLoadingData && !loadingSkeleton && !controlledData) return <div className={className}><DonutChartSkeleton /></div>;
    if (hasError && errorRenderer) return <div className={className}>{errorRenderer(activeQuery.error)}</div>;
    if (hasError && !errorRenderer && !controlledData) {
        return (
            <div className={`flex flex-col w-full items-center justify-center gap-4 ${className}`}>
                <div className="min-w-0">
                    <ChartHeadings heading={title} />
                    {subtitle && (
                        <div className="mt-2 hidden md:block">
                            <div className="font-inter text-sm text-placeholder-gray max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">{subtitle}</div>
                        </div>
                    )}
                </div>
                <DataNotFoundError refetch={activeQuery.refetch} />
            </div>
        );
    }

    return (
        <div
            className={`bg-white w-full font-inter ${className}`}
            aria-label={ariaLabel ?? title}
            onMouseLeave={handleComponentMouseLeave}
        >
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div className="min-w-0">
                    <ChartHeadings heading={title} />
                    {subtitle && (
                        <div className="mt-2 hidden md:block">
                            <div className="font-inter 0 text-sm text-placeholder-gray max-w-xs sm:max-w-sm md:max-w-xs  ">{subtitle}</div>
                        </div>
                    )}
                </div>

                <div className="flex flex-col w-full  lg:w-auto   lg:flex-row gap-2 items-center">
                    <ExportReportsButton
                        onClick={handleExport}
                        fullWidth
                        size="md"
                    />

                    {controls.sort && (
                        <div className="border-container-card  w-full lg:w-[90px] rounded-lg">
                            <Select

                                value={`${String(sortState.key)}:${sortState.dir}`}
                                onValueChange={(val) => {
                                    const [key, dir] = String(val).split(":");
                                    setSortState({ key, dir: dir as "asc" | "desc" });
                                }}
                            >
                                <SelectTrigger className="w-full   text-sm outline-none border-none focus:outline-none focus:border-none focus-visible:outline-none focus-visible:border-none focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder={getSortDisplayText()} />
                                </SelectTrigger>
                                <SelectContent className="mr-10">
                                    <SelectItem className="font-inter text-sm" value="value:desc">High to Low</SelectItem>
                                    <SelectItem className="font-inter text-sm" value="value:asc">Low to High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {controls.filter && primaryFilterGroup && (
                        <div className="min-w-32 border-container-card rounded-lg">
                            <Label className="font-inter sr-only">Filter</Label>
                            <Select
                                value={filters[primaryFilterGroup.id] || "all"}
                                onValueChange={(val) => {
                                    handleFilterChange(primaryFilterGroup.id, val === "all" ? undefined : val);
                                }}
                            >
                                <SelectTrigger className="w-full outline-none border-none focus:outline-none focus:border-none focus-visible:outline-none focus-visible:border-none focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem className="font-inter" value="all">All</SelectItem>
                                    {primaryFilterGroup.values?.map((val) => (
                                        <SelectItem key={val} className="font-inter" value={val}>{val}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {listShownButton && (
                        <button className="box-border flex justify-center items-center w-9 h-9 bg-white border border-gray-200 shadow-sm rounded-md flex-none order-1 flex-grow-0 transition-all duration-200 hover:shadow-md">
                            <List size={16} style={{ color: "#0A0A0A" }} />
                        </button>
                    )}


                </div>
            </div>

            {subtitle && (
                <div className="mt-2 block md:hidden">
                    <div className="font-inter text-sm text-placeholder-gray max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">{subtitle}</div>
                </div>
            )}

            <div className={`mt-6 py-2 flex ${legend.position === "right" ? "flex-col lg:flex-row" : "flex-col"} gap-6 items-start`}>
                {!listOpen ? (
                    <>
                        {/* Chart Container */}
                        <div
                            ref={chartContainerRef}
                            className={`w-full ${legend.position === "right" ? "h-64 lg:h-60" : "h-64 md:h-60"} mt-3 flex items-center justify-center relative`}
                            role="img"
                            aria-label={`${title} chart`}
                        >
                            {sortedData.length === 0 || total === 0 ? (
                                <ResponsiveContainer className={`${legend.position === "right" ? "w-[300px] lg:w-[450px]" : "lg:w-[450px] w-[300px]"}`}>
                                    <PieChart>
                                        <Pie
                                            data={[{ key: 'empty', label: 'No Data', value: 1 }]}
                                            dataKey="value"
                                            nameKey="label"
                                            innerRadius="60%"
                                            outerRadius="90%"
                                            startAngle={90}
                                            endAngle={-270}
                                            animationBegin={0}
                                            animationDuration={300}
                                            animationEasing="ease-out"
                                        >
                                            <Cell
                                                fill="#F3F4F6"
                                                stroke="#E5E7EB"
                                                strokeWidth={2}
                                            />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer className={`${legend.position === "right" ? "w-[300px] lg:w-[450px]" : "lg:w-[450px] w-[300px]"}`}>
                                    <PieChart>
                                        <Pie
                                            data={sortedData.slice(0, 10)}
                                            dataKey="value"
                                            nameKey="label"
                                            innerRadius="60%"
                                            outerRadius="90%"
                                            startAngle={90}
                                            endAngle={-270}
                                            onClick={(e) => handleSliceClick(e)}
                                            onMouseEnter={(_, index) => {
                                                if (sortedData[index] && !isScrollingRef.current) {
                                                    handleMouseEnter(sortedData[index].key);
                                                }
                                            }}
                                            onMouseLeave={handleMouseLeave}
                                            animationBegin={0}
                                            animationDuration={300}
                                            animationEasing="ease-out"
                                        >
                                            {sortedData.map((entry, idx) => {
                                                const isHovered = hoveredItem === entry.key && !isScrollingRef.current;
                                                const baseColor = getColorForIndex(idx);

                                                return (
                                                    <Cell
                                                        key={String(entry.key)}
                                                        fill={baseColor}
                                                        stroke="#FFFFFF"
                                                        strokeWidth={2}
                                                        style={{
                                                            cursor: 'pointer',
                                                            filter: isHovered ? `drop-shadow(0 4px 8px ${baseColor}40)` : 'none',
                                                            transition: 'all 0.2s ease-in-out',
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Pie>
                                        <Tooltip
                                            content={<CustomTooltip />}
                                            wrapperStyle={{
                                                outline: "none",
                                                zIndex: 10000,
                                                pointerEvents: "none",
                                                visibility: isTooltipActive && !isScrollingRef.current ? "visible" : "hidden",
                                                maxWidth: "calc(100vw - 2rem)"
                                            }}
                                            cursor={{ fill: "transparent" }}
                                            isAnimationActive={false}
                                            allowEscapeViewBox={{ x: false, y: false }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}

                            {/* Center Data Display */}
                            {showCenterData && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        {sortedData.length === 0 || total === 0 ? (
                                            <>
                                                <div className="font-inter text-xl font-bold text-gray-400 transition-all duration-300 ease-out">
                                                    0
                                                </div>
                                                <div className="font-inter text-xs text-gray-400 mt-1 transition-all duration-300 ease-out max-w-[100px] truncate">
                                                    {debouncedSearch ? 'No results' : 'No data'}
                                                </div>
                                            </>
                                        ) : centerDisplayData && (
                                            <>
                                                <div className="font-inter text-xl font-bold text-slate-900 transition-all duration-300 ease-out">
                                                    {centerDisplayData.value.toLocaleString()}
                                                </div>
                                                <div className="font-inter text-xs text-placeholder-gray mt-1 transition-all duration-300 ease-out max-w-[100px] truncate">
                                                    {centerDisplayData.label}
                                                </div>
                                                {hoveredItem && !isScrollingRef.current && (
                                                    <div className="font-inter text-xs text-placeholder-gray mt-1 transition-all duration-300 ease-out">
                                                        {centerDisplayData.percentage}%
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Legend Container - Scrollable */}
                        <div
                            ref={legendContainerRef}
                            className={`${legend.position === "right" ? "w-full lg:w-full" : "w-full"} overflow-y-auto overflow-x-hidden scrollbar-custom`}
                            style={{
                                maxHeight: '280px',
                            }}
                            onScroll={handleScrollEvent}
                        >
                            {sortedData.slice(0, 10).map((d, idx) => {
                                const pct = total ? Math.round((Number(d.value) / total) * 100) : 0;
                                const color = getColorForIndex(idx);
                                const isHovered = hoveredItem === d.key && !isScrollingRef.current;

                                // Skip rendering if value is 0
                                if (Number(d.value) === 0) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={String(d.key)}
                                        className={`font-inter flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ease-out cursor-pointer ${isHovered
                                            ? 'bg-gray-50 shadow-sm transform translate-x-1'
                                            : 'hover:bg-gray-25 hover:shadow-xs'
                                            }`}
                                        style={{
                                            minHeight: '56px',
                                        }}
                                        onMouseEnter={() => {
                                            if (!isScrollingRef.current) {
                                                handleMouseEnter(d.key);
                                            }
                                        }}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        <div
                                            className="transition-all duration-200 ease-out w-4 h-4 rounded-full flex-shrink-0"
                                            style={{
                                                backgroundColor: color,
                                                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                                                boxShadow: isHovered ? `0 0 12px ${color}60` : 'none'
                                            }}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className={`font-inter text-sm font-semibold truncate transition-all duration-200 ease-out ${isHovered ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                {d.label}

                                            </div>
                                            <div className={`font-inter text-xs truncate transition-all flex flex-row gap-2 duration-200 ease-out ${isHovered ? 'text-gray-600' : 'text-gray-500'
                                                }`}>
                                                <p> {Number(d.value).toLocaleString()} {dataSource === 'demandBySku' ? 'demand' : dataSource === 'salesByPackSize' ? 'sales' : dataSource === 'breakageShop' ? 'breakage' : 'units'}
                                                </p>
                                                {d.sizeML && <p>({d.sizeML} ML)</p>}

                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}
