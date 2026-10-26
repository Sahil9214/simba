"use client";
import React, { memo, useEffect, useState } from "react";
import { useReportingGapsData } from "@/hooks/api/useDashboard";
import { ChartHeadings } from "@/common/chartHeadings";
import { Input } from "../ui/input";
import { useDebounced } from "@/hooks/useDebounce";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

type Severity = "critical" | "moderate" | "low";

type GapItem = {
    id: string;
    title: string;
    subtitle: string;
    severity: Severity;
};

const SEVERITY_META: Record<
    Severity,
    { border: string; text: string; badgeBg: string; badgeText?: string }
> = {
    critical: { border: "#FEE2E2", text: "#EF4444", badgeBg: "#EF4444" },
    moderate: { border: "#FFEDD5", text: "#EA580C", badgeBg: "#F97316" },
    low: { border: "#FEF9C3", text: "#CA8A04", badgeBg: "#EAB308" },
};

// Removed hardcoded items - now using real API data

function CrateIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            className={`w-4 h-4 ${className}`}
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="1" y="2" width="14" height="12" rx="2" fill="currentColor" fillOpacity="0.08" />
            <rect x="3" y="4" width="10" height="1.2" rx="0.6" fill="currentColor" />
            <rect x="3" y="7" width="10" height="1.2" rx="0.6" fill="currentColor" />
            <rect x="3" y="10" width="10" height="1.2" rx="0.6" fill="currentColor" />
        </svg>
    );
}

export const ReportingGapsCard: React.FC<{ category?: string }> = memo(({ category }) => {

    const [searchShop, setSearchShop] = useState<string>("");
    const debouncedSearchShop = useDebounced(searchShop, 500);
    const [selectedDpCode, setSelectedDpCode] = useState<string>("all");


    // Fetch real data from API
    const { data: apiData, error } = useReportingGapsData({
        searchByName: debouncedSearchShop,
        filteredDpCode: selectedDpCode === "all" ? undefined : selectedDpCode,
        category: category || undefined,
    });

    useEffect(() => {

        setSearchShop(debouncedSearchShop);
    }, [debouncedSearchShop, setSearchShop]);


    // Transform API data to component format
    const transformToGapItems = (reportingGaps: any): { items: GapItem[], total: number } => {
        if (!reportingGaps?.shopWiseGaps || reportingGaps.shopWiseGaps.length === 0) {
            return {
                items: [],
                total: reportingGaps?.totalReports || reportingGaps?.missedReports || 0
            };
        }

        const items: GapItem[] = reportingGaps.shopWiseGaps
            .filter((gap: any) => gap.missedCount > 0 || gap.lateCount > 0) // Only show shops with issues
            .sort((a: any, b: any) => (b.missedCount + b.lateCount) - (a.missedCount + a.lateCount)) // Sort by most problems
            .map((gap: any, index: number) => {
                const totalProblems = gap.missedCount + gap.lateCount;

                // Determine severity based on missed/late reports
                let severity: Severity = "low";
                if (totalProblems >= 15) {
                    severity = "critical";
                } else if (totalProblems >= 5) {
                    severity = "moderate";
                }

                return {
                    id: gap.shopId || String(index + 1),
                    title: gap.shopName,
                    subtitle: `${totalProblems}+  ${gap.missedCount > 0 ? 'Reporting missed' : 'late'}`,
                    severity
                };
            });

        return {
            items: items,
            total: reportingGaps.totalReports || reportingGaps.missedReports || 0
        };
    };

    // if (isLoading) {
    //     return (
    //         <aside
    //             role="region"
    //             aria-label="Reporting Gaps"
    //             className="w-full h-full bg-white rounded-xl flex flex-col"
    //         >
    //             <div className="flex justify-between items-start gap-4 w-full">
    //                 <div className="flex-1 min-w-0">
    //                     <div className="flex justify-between items-start w-full">
    //                         <ChartHeadings heading="Reporting Gaps" />
    //                         <div className="inline-flex items-center py-1 px-2.5 gap-1 bg-gray-100 border border-gray-200 shadow-sm rounded-lg flex-shrink-0 ml-4 animate-pulse">
    //                             <span className="font-inter text-sm leading-5 font-medium text-gray-500">
    //                                 Loading...
    //                             </span>
    //                         </div>
    //                     </div>
    //                     <p className="font-inter mt-2 mb-3 text-sm leading-5 text-placeholder-gray w-full">
    //                         Highlighting where reported numbers differ most from actual sales
    //                     </p>
    //                     <div className="flex flex-col gap-2 w-full flex-1">
    //                         {[1, 2, 3, 4].map((i) => (
    //                             <div key={i} className="rounded-lg p-3 bg-gray-100 border-container-card w-full animate-pulse">
    //                                 <div className="flex justify-between items-start w-full">
    //                                     <div className="flex gap-3 items-center flex-1 min-w-0">
    //                                         <div className="w-4 h-4 bg-gray-300 rounded"></div>
    //                                         <div className="flex-1 min-w-0">
    //                                             <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    //                                             <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    //                                         </div>
    //                                     </div>
    //                                     <div className="w-12 h-5 bg-gray-300 rounded-full"></div>
    //                                 </div>
    //                             </div>
    //                         ))}
    //                     </div>
    //                 </div>
    //             </div>
    //         </aside>
    //     );
    // }

    // Handle error state
    if (error) {
        return (
            <aside
                role="region"
                aria-label="Reporting Gaps"
                className="w-full h-full bg-white rounded-[12px] py-4 flex flex-col"
            >
                <div className="flex justify-between items-start gap-4 w-full">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-inter font-semibold text-base leading-normal text-sidebar-foreground m-0 flex-1">
                            Reporting Gaps
                        </h3>
                        <p className="font-inter mt-2 mb-3 text-sm leading-5 text-red-600 w-full">
                            Failed to load reporting gaps data. Please try again later.
                        </p>
                    </div>
                </div>
            </aside>
        );
    }

    const { items: data, total } = transformToGapItems(apiData);
    return (
        <aside
            role="region"
            aria-label="Reporting Gaps"
            className="w-full h-full bg-white rounded-xl flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center gap-4 w-full">
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start w-full gap-3 sm:gap-4">
                        {/* Left Side - Heading */}
                        <ChartHeadings heading="Reporting Gaps" />

                        {/* Right Side - Filters + Total */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                            {/* Select */}
                            <Select
                                value={selectedDpCode}
                                onValueChange={(value) => setSelectedDpCode(value)}
                            >
                                <SelectTrigger className="h-9 text-sm">
                                    <SelectValue
                                        placeholder="Select DpCode"
                                        className="text-sm leading-5 font-medium text-placeholder-gray"
                                    />
                                </SelectTrigger>
                                <SelectContent className="text-sm leading-5 font-medium text-placeholder-gray">
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="DCCWS">DCCWS</SelectItem>
                                    <SelectItem value="DSCSC">DSCSC</SelectItem>
                                    <SelectItem value="DSIIDC">DSIIDC</SelectItem>
                                    <SelectItem value="DTTDC">DTTDC</SelectItem>

                                </SelectContent>
                            </Select>

                            {/* Search Input */}
                            <Input
                                placeholder="Search by shops"
                                className="w-full sm:w-32 h-9 text-sm"
                                onChange={(e) => setSearchShop(e.target.value)}
                            />

                            {/* Total */}
                            <div
                                aria-hidden
                                className="inline-flex items-center justify-center py-1 px-3 gap-1 bg-white border border-gray-200 shadow-sm rounded-lg flex-shrink-0 w-full sm:w-auto"
                            >
                                <span className="font-inter text-sm leading-5 font-medium">
                                    Missed Reports {total}
                                </span>
                            </div>
                        </div>
                    </div>



                    <p className="font-inter my-4 text-sm leading-5 text-placeholder-gray w-full">Highlighting where reported numbers differ most from actual sales</p>

                    {/* list container */}
                    <div className="flex flex-col gap-2 w-full flex-1 max-h-[300px] overflow-y-auto scrollbar-custom">
                        {data.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-sm">
                                    No reporting gaps found
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                    All shops are reporting on time
                                </div>
                            </div>
                        ) : (
                            data.map((it) => {
                                const meta = SEVERITY_META[it.severity];
                                return (
                                    <article
                                        key={it.id}
                                        className="rounded-lg p-3 bg-white border-2 w-full"
                                        style={{
                                            borderColor: meta.border,
                                        }}
                                        aria-labelledby={`gap-${it.id}-title`}
                                        role="listitem"
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex gap-3 items-center flex-1 min-w-0">
                                                <div className="flex items-center flex-shrink-0">
                                                    {/* Icon color is same as text color */}
                                                    <div style={{ color: meta.text }}>
                                                        <CrateIcon />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        id={`gap-${it.id}-title`}
                                                        className="font-inter font-semibold text-sm leading-5 m-0 truncate"
                                                        style={{
                                                            color: meta.text,
                                                        }}
                                                    >
                                                        {it.title}
                                                    </h4>
                                                    <p
                                                        className="font-inter text-xs leading-4 mt-1 m-0 opacity-95 truncate"
                                                        style={{
                                                            color: meta.text,
                                                        }}
                                                    >
                                                        {it.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* badge */}
                                            <div
                                                className="inline-flex items-center justify-center px-2 py-1 rounded-full min-w-[40px] h-5 flex-shrink-0 transition-all duration-200 hover:shadow-lg hover:scale-105 hover:ring-2 hover:ring-white/20"
                                                style={{
                                                    background: meta.badgeBg,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (it.severity === "critical") {
                                                        e.currentTarget.style.background = "#EC4899";
                                                    } else if (it.severity === "moderate") {
                                                        e.currentTarget.style.background = "#EC4899";
                                                    } else if (it.severity === "low") {
                                                        e.currentTarget.style.background = "#EC4899";
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = meta.badgeBg;
                                                }}
                                                aria-hidden
                                            >
                                                <span
                                                    className="font-inter text-xs font-medium text-white text-center"
                                                >
                                                    {it.severity === "critical" ? "Critical" : it.severity === "moderate" ? "Moderate" : "Low"}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                );
                            }))}
                    </div>
                </div>
            </div>
        </aside >
    );
});

export default ReportingGapsCard;
