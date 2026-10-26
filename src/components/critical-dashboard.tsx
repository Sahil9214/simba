// components/CriticalDashboard.tsx
"use client";

import React, { useMemo } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { useCriticalIssues, CriticalIssue } from '../hooks/api/useCriticalIssues';

/**
 * Types
 */
// Use the CriticalIssue type from the API service
export type CriticalItemType = CriticalIssue;

export type ColorTokens = {
    bg: string; // background hex or css var
    border: string; // border color hex
    title: string; // title color
    dot: string; // small text / icon color
};

/**
 * Default tokens (exact HEXs from your Figma)
 * You may override these with theme tokens or via props.
 */
const DEFAULT_TOKENS: Record<CriticalItemType["level"], ColorTokens> = {
    1: {
        bg: "#FFEDD5",
        border: "#FED7AA",
        title: "#9A3412",
        dot: "#9A3412",
    },
    2: {
        bg: "#FEE2E2",
        border: "#FECACA",
        title: "#991B1B",
        dot: "#991B1B",
    },
    3: {
        bg: "#FEF9C3",
        border: "#FEF08A",
        title: "#854D0E",
        dot: "#854D0E",
    },
};

/**
 * Dummy data for fallback when API fails
 */
const DUMMY_CRITICAL_ISSUES: CriticalItemType[] = [
    {
        id: "dummy-1",
        title: "CP Wine Shop - Connaught Place",
        risk: "Low Stock Alert",
        description: "Simba Strong Beer 650ml - Only 2 cases remaining",
        time: "2 days ago",
        level: 1,
        shopId: "shop-001",
        skuId: "sku-001",
        location: "Connaught Place, Delhi",
        severity: "high",
        category: "stock",
        daysStuck: 2,
        closingStock: 24, // 2 cases = 24 bottles
        salesLast30Days: 180,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-2",
        title: "Karol Bagh Beer Shop",
        risk: "High Breakage Rate",
        description: "Simba Premium Beer 330ml - 8 bottles broken this week",
        time: "1 day ago",
        level: 2,
        shopId: "shop-002",
        skuId: "sku-002",
        location: "Karol Bagh, Delhi",
        severity: "medium",
        category: "performance",
        daysStuck: 1,
        closingStock: 45,
        salesLast30Days: 320,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-3",
        title: "Lajpat Nagar Wine Store",
        risk: "Data Variance Alert",
        description: "22.5% variance detected in Simba vodka stock data",
        time: "3 days ago",
        level: 3,
        shopId: "shop-003",
        skuId: "sku-003",
        location: "Lajpat Nagar, Delhi",
        severity: "low",
        category: "compliance",
        daysStuck: 3,
        closingStock: 18,
        salesLast30Days: 95,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-4",
        title: "Chandni Chowk Liquor Shop",
        risk: "Low Stock Alert",
        description: "Simba Wine 750ml - Only 6 bottles remaining",
        time: "4 hours ago",
        level: 2,
        shopId: "shop-004",
        skuId: "sku-004",
        location: "Chandni Chowk, Delhi",
        severity: "medium",
        category: "stock",
        daysStuck: 0,
        closingStock: 6,
        salesLast30Days: 45,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-5",
        title: "Saket Beer & Wine Shop",
        risk: "High Breakage Rate",
        description: "Simba Strong Beer 500ml - 12 bottles broken in last week",
        time: "5 days ago",
        level: 1,
        shopId: "shop-005",
        skuId: "sku-005",
        location: "Saket, Delhi",
        severity: "high",
        category: "performance",
        daysStuck: 5,
        closingStock: 8,
        salesLast30Days: 280,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-6",
        title: "Rajouri Garden Wine Shop",
        risk: "Low Stock Alert",
        description: "Simba Vodka 180ml - Only 4 bottles remaining",
        time: "6 hours ago",
        level: 1,
        shopId: "shop-006",
        skuId: "sku-006",
        location: "Rajouri Garden, Delhi",
        severity: "high",
        category: "stock",
        daysStuck: 0,
        closingStock: 4,
        salesLast30Days: 120,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "dummy-7",
        title: "Pitampura Beer Shop",
        risk: "Data Variance Alert",
        description: "18.3% variance detected in Simba beer stock data",
        time: "2 days ago",
        level: 2,
        shopId: "shop-007",
        skuId: "sku-007",
        location: "Pitampura, Delhi",
        severity: "medium",
        category: "compliance",
        daysStuck: 2,
        closingStock: 32,
        salesLast30Days: 210,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

/**
 * Hook: useCriticalData - Now uses real API with dummy data fallback
 * Wrapper around the useCriticalIssues hook for backward compatibility
 */
export function useCriticalData(opts?: {
    initialData?: CriticalItemType[] | null;
    filters?: any;
    useDummyData?: boolean; // New option to force dummy data
}) {
    const { data: apiResponse, isLoading, refetch, error } = useCriticalIssues({
        limit: 10, // Show top 10 critical issues
        ...opts?.filters,
    });

    // Transform API response to match expected format
    const apiData = opts?.initialData || (apiResponse as any)?.items || null;

    // Use dummy data if:
    // 1. useDummyData is explicitly set to true
    // 2. API returns no data and there's no error (empty response)
    // 3. There's an error and we want to show something to the user
    const shouldUseDummyData = opts?.useDummyData ||
        (!isLoading && !error && (!apiData || apiData.length === 0)) ||
        (error && !apiData);

    const data = shouldUseDummyData ? DUMMY_CRITICAL_ISSUES : apiData;

    return {
        data,
        isLoading,
        refetch,
        error,
        isUsingDummyData: shouldUseDummyData
    };
}

/**
 * Example TanStack Query snippet you can paste into useCriticalData (replace simulated block above):
 *
 * import { useQuery } from "@tanstack/react-query";
 *
 * export function useCriticalDataWithTanStack() {
 *   return useQuery(['critical-items'], async () => {
 *     const res = await fetch('/api/critical-items'); // your endpoint
 *     if (!res.ok) throw new Error('Failed to fetch');
 *     return (await res.json()) as CriticalItemType[];
 *   }, {
 *     staleTime: 1000 * 60 * 2, // 2 minutes
 *     cacheTime: 1000 * 60 * 10,
 *   });
 * }
 *
 * Then in the component use:
 * const { data, isLoading } = useCriticalDataWithTanStack();
 */

/**
 * Component props:
 * - data: pass dynamic data from parent (API results). If not provided, component uses useCriticalData hook.
 * - tokens: override default colors (useful for theme or tenant overrides).
 * - onViewDetails: callback when user clicks "View Details".
 */





export type CriticalDashboardProps = {
    data?: CriticalItemType[] | null;
    tokens?: Partial<Record<1 | 2 | 3, Partial<ColorTokens>>>;
    onViewDetails?: (item: CriticalItemType) => void;
    showHeader?: boolean;
    filters?: any; // Optional filters for the API call
    useDummyData?: boolean; // New prop to force dummy data
};

const CriticalDashboard: React.FC<CriticalDashboardProps> = ({
    data: dataProp = null,
    tokens,
    onViewDetails,
    showHeader = true,
    filters,
    useDummyData = false, // New prop to control dummy data usage
}) => {
    // if parent provides data, use it; otherwise use the hook (real API fetch with dummy fallback)
    const { data: apiData, isLoading, error, isUsingDummyData } = useCriticalData({
        initialData: dataProp,
        filters,
        useDummyData
    });
    const data = dataProp ?? apiData ?? [];

    // merge tokens: default <- user tokens
    const mergedTokens = useMemo(() => {
        return {
            1: { ...DEFAULT_TOKENS[1], ...(tokens?.[1] ?? {}) },
            2: { ...DEFAULT_TOKENS[2], ...(tokens?.[2] ?? {}) },
            3: { ...DEFAULT_TOKENS[3], ...(tokens?.[3] ?? {}) },
        } as Record<1 | 2 | 3, ColorTokens>;
    }, [tokens]);

    return (

        <div className="bg-white rounded-[12px] p-4 sm:p-6 shadow-sm border border-gray-100" role="region" aria-label="Red Flags & Critical Issues">
            {showHeader && (
                <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: mergedTokens[2].bg }}>
                        <AlertTriangle className="w-4 h-4" style={{ color: "#DC2626" }} />
                    </div>
                    <h3 className="font-inter font-semibold text-base sm:text-lg leading-[20px] text-[#111827]">
                        Red Flags &amp; Critical Issues
                        {isUsingDummyData && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                Demo Data
                            </span>
                        )}
                    </h3>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {isLoading ? (
                    // simple skeleton while loading
                    <>
                        <RowSkeleton />
                        <RowSkeleton />
                        <RowSkeleton />
                    </>
                ) : error && !isUsingDummyData ? (
                    <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-medium">Failed to load critical issues</p>
                        <p className="text-xs mt-1">{error.message}</p>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                        <p>No critical issues found</p>
                    </div>
                ) : (
                    data.map((item: CriticalItemType) => (
                        <CriticalRow key={item.id ?? `${item.title}-${item.time}`} item={item} tokens={mergedTokens} onViewDetails={onViewDetails} />
                    ))
                )}
            </div>
        </div>

    );
};

export default CriticalDashboard;

/* -------------------------------------------------------------------------- */
/* ------------------------------- Row / Skeleton --------------------------- */
/* -------------------------------------------------------------------------- */

const CriticalRow: React.FC<{
    item: CriticalItemType;
    tokens: Record<1 | 2 | 3, ColorTokens>;
    onViewDetails?: (item: CriticalItemType) => void;
}> = ({ item, tokens, onViewDetails }) => {
    const s = tokens[item.level] ?? tokens[1];

    return (
        <div
            role="listitem"
            className="w-full rounded-xl border px-3 sm:px-4 lg:px-5 py-3 sm:py-4 flex items-start flex-col sm:flex-row justify-between gap-3 sm:gap-4 transition-colors"
            style={{ backgroundColor: s.bg, borderColor: s.border, borderStyle: "solid" }}
        >
            <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <h4 className="font-inter font-semibold text-sm sm:text-base leading-[20px] sm:leading-[24px] break-words" style={{ color: s.title }}>
                        {item.title}
                    </h4>

                    <span
                        className="inline-flex items-center gap-1 rounded-full px-2 sm:px-3 py-1 font-inter text-xs font-medium leading-4 align-middle bg-white/80 border border-white/60 shadow-sm self-start sm:self-auto"
                        style={{ color: s.title }}
                    >
                        {item.risk}
                    </span>
                </div>

                <p className="mt-2 font-inter font-normal text-xs sm:text-[13.67px] leading-[18px] sm:leading-[20px] tracking-normal break-words" style={{ color: s.dot }}>
                    {item.description}
                </p>

                <div className="mt-2 sm:mt-3 flex items-center gap-2 text-xs sm:text-sm" style={{ color: s.dot }}>
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-inter font-normal text-[10px] sm:text-[11.81px] leading-3 sm:leading-4 tracking-normal align-middle">{item.time}</span>
                </div>
            </div>

            <div className="flex items-start sm:items-center w-full sm:w-auto">
                <button
                    type="button"
                    onClick={() => onViewDetails?.(item)}
                    className="self-start sm:self-center shrink-0 rounded-lg bg-white px-3 sm:px-4 py-1.5 sm:py-1 text-xs sm:text-sm font-semibold hover:bg-white/95 shadow w-full sm:w-auto text-center"
                    style={{ color: s.title, border: "1px solid rgba(255,255,255,0.7)" }}
                    aria-label={`View details for ${item.title}`}
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

function RowSkeleton() {
    return (
        <div className="w-full rounded-xl border px-3 sm:px-4 lg:px-5 py-3 sm:py-4 flex items-start flex-col sm:flex-row justify-between gap-3 sm:gap-4 animate-pulse" style={{ borderColor: "#E5E7EB" }}>
            <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-6 bg-gray-200 rounded-full w-24 self-start sm:self-auto" />
                </div>

                <div className="mt-2 sm:mt-3 h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-2 sm:mt-3 flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-gray-200 flex-shrink-0" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
            </div>

            <div className="flex items-start sm:items-center w-full sm:w-auto">
                <div className="h-7 sm:h-8 w-full sm:w-28 bg-gray-200 rounded" />
            </div>
        </div>
    );
}
