"use client";
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DataRow, ChartCardProps } from "@/lib/types/legacy";
import { useDebounced } from "@/hooks/useDebounce";
import { useDpCodesPieChart } from "@/hooks/api/useDashboard";
import { DonutChartSkeleton } from "@/common/skeleton/pie-chart-skeleton";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { ChartHeadings } from "@/common/chartHeadings";
import { DataNotFoundError } from "@/common/error-boundaries/data-error";
import { dpCodesColors } from "@/lib/colors";
import { ExportReportsButton } from "@/components/ui/export-reports-button";

interface DpCodeData {
  dpCode: string;
  count: number;
  percentage: number;
  shops: number;
}

interface DpCodesPieChartProps {
  title?: string;
  subtitle?: string;
  searchTerm?: string;
  selectedLocation?: string;
  enableRealtime?: boolean;
  enableExport?: boolean;
  className?: string;
  ariaLabel?: string;
  colors?: string[];
  onSelect?: (data: DataRow) => void;
  category?: string;
}

export function DpCodePieChart(props: DpCodesPieChartProps) {
  const {
    title = "Reporting Gaps by Department",
    subtitle = "Distribution of DP codes across all departments",
    searchTerm,
    selectedLocation,
    enableRealtime = false,
    enableExport = true,
    className = "",
    ariaLabel,
    colors: customColors,
    onSelect,
    category,
  } = props;

  // Control states
  const [searchQ, setSearchQ] = useState("");
  const debouncedSearch = useDebounced(searchQ, 300);
  const [sortState, setSortState] = useState({ key: "all", dir: "all" as "asc" | "desc" | "all" });
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

  // API data hook
  const dpCodesQuery = useDpCodesPieChart({
    searchTerm: searchTerm || debouncedSearch,
    selectedLocation,
    category
  });

  // Transform API data to chart format
  const chartData: DataRow[] = useMemo(() => {
    if (!dpCodesQuery.data?.dpCodes) return [];

    return dpCodesQuery.data.dpCodes.map((item: DpCodeData) => ({
      key: item.dpCode.toLowerCase().replace(/\s+/g, '-'),
      label: item.dpCode,
      value: item.count,
      meta: {
        percentage: item.percentage,
        shops: item.shops
      }
    }));
  }, [dpCodesQuery.data]);

  // Apply search filter
  const searchFilteredData = useMemo(() => {
    if (!debouncedSearch) return chartData;

    const searchTerm = debouncedSearch.toLowerCase().trim();
    return chartData.filter(item =>
      item.label.toLowerCase().includes(searchTerm) ||
      item.key.toLowerCase().includes(searchTerm)
    );
  }, [chartData, debouncedSearch]);

  // Apply sorting
  const sortedData: DataRow[] = useMemo(() => {
    if (!searchFilteredData.length) return searchFilteredData;

    return [...searchFilteredData].sort((a, b) => {
      const aValue = a[sortState.key as keyof DataRow];
      const bValue = b[sortState.key as keyof DataRow];

      if (sortState.key === 'value' || sortState.key === 'percentage') {
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
  }, [searchFilteredData, sortState]);

  const total = useMemo(
    () => sortedData.reduce((s, r) => s + (Number.isFinite(r.value) ? r.value : Number(r.value) || 0), 0),
    [sortedData]
  );

  // Center display data based on hover (with scroll awareness)
  const centerDisplayData = useMemo(() => {
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
      label: "Total Reports",
      percentage: 100
    };
  }, [hoveredItem, sortedData, total]);

  const colors = customColors || dpCodesColors;

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

  // Custom Tooltip with scroll awareness
  const CustomTooltip = useCallback(({ active, payload }: any) => {
    // Don't show tooltip if scrolling or not active
    if (!active || !payload || !payload.length || isScrollingRef.current || !isTooltipActive) {
      return null;
    }

    const entry = payload[0]?.payload ?? payload[0];
    const name = entry?.label ?? entry?.name ?? "";
    const value = entry?.value ?? 0;
    const percentage = entry?.meta?.percentage ?? 0;
    const shops = entry?.meta?.shops ?? 0;

    const idx = chartData.findIndex((d) => d.label === name || d.key === entry?.key);
    const color = colors[(idx >= 0 ? idx : 0) % colors.length];

    return (
      <div className="font-inter flex flex-wrap items-center gap-2 px-3 py-2 bg-white shadow-xl rounded-lg border border-gray-100 pointer-events-none">
        <div
          className="w-1.5 h-4 rounded-sm transition-all duration-200"
          style={{ backgroundColor: color }}
        />
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-gray-500 truncate font-normal">{name}</span>
          <span className="text-xs text-gray-400 truncate font-normal">{shops} shops</span>
        </div>
        <div className="ml-2 text-xs text-gray-900 truncate font-medium">
          {value} reports ({percentage.toFixed(1)}%)
        </div>
      </div>
    );
  }, [chartData, colors, isTooltipActive]);

  // Export functionality
  const handleExport = useCallback(() => {

  }, [])

  // Real-time updates
  useEffect(() => {
    if (enableRealtime) {
      const interval = setInterval(() => {
        dpCodesQuery.refetch();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [enableRealtime, dpCodesQuery]);

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

  // Show loading state
  const isLoadingData = dpCodesQuery.isLoading;
  const hasError = dpCodesQuery.isError;

  if (isLoadingData) return <div className={className}><DonutChartSkeleton /></div>;
  if (hasError) {
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
        <DataNotFoundError refetch={dpCodesQuery.refetch} />
      </div>
    );
  }

  return (
    <div
      className={`w-full font-inter ${className}`}
      aria-label={ariaLabel ?? title}
      onMouseLeave={handleComponentMouseLeave}
    >
      <div className="flex flex-col lg:flex-row mt-4 lg:mt-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <ChartHeadings heading={title} description={subtitle} />
        </div>

        <div className="flex flex-col  w-full lg:w-auto mt-4 lg:mt-0 lg:flex-row gap-2 items-center">
          <ExportReportsButton
            onClick={handleExport}
            fullWidth
            size="md"
          />
          <div className="border-container-card w-full lg:w-auto rounded-lg">
            <Select
              value={sortState.key === "all" ? "" : `${sortState.key}:${sortState.dir}`}
              onValueChange={(val) => {
                if (!val) return setSortState({ key: "all", dir: "all" });
                const [key, dir] = val.split(":");
                setSortState({ key, dir: dir as "asc" | "desc" });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value:desc">High to Low</SelectItem>
                <SelectItem value="value:asc">Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {subtitle && (
        <div className="mt-2 block md:hidden">
          <div className="font-inter text-sm text-placeholder-gray max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">{subtitle}</div>
        </div>
      )}

      <div className="mt-6 py-2 flex flex-col lg:flex-row gap-6 items-start">
        {!listOpen ? (
          <>
            {/* Chart Container */}
            <div
              ref={chartContainerRef}
              className="w-full h-64 lg:h-60 mt-3 flex items-center justify-center relative"
              role="img"
              aria-label={`${title} chart`}
            >
              {sortedData.length === 0 ? (
                <div className="flex items-center justify-center w-full h-full text-sm text-gray-500">
                  {debouncedSearch ? 'No results found' : 'No data'}
                </div>
              ) : (
                <ResponsiveContainer className="w-[300px] lg:w-[450px]">
                  <PieChart>
                    <Pie
                      data={sortedData}
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
                        const baseColor = colors[idx % colors.length];

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
                        visibility: isTooltipActive && !isScrollingRef.current ? "visible" : "hidden"
                      }}
                      cursor={{ fill: "transparent" }}
                      isAnimationActive={false}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Center Data Display */}
              {centerDisplayData && sortedData.length > 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
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
                  </div>
                </div>
              )}
            </div>

            {/* Legend Container - Scrollable */}
            <div
              ref={legendContainerRef}
              className="w-full lg:w-full overflow-y-auto overflow-x-hidden scrollbar-custom"
              style={{
                maxHeight: '280px',
              }}
              onScroll={handleScrollEvent}
            >
              {sortedData.map((d, idx) => {
                const pct = total ? Math.round((Number(d.value) / total) * 100) : 0;
                const color = colors[idx % colors.length];
                const isHovered = hoveredItem === d.key && !isScrollingRef.current;

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
                      <div className={`font-inter text-xs truncate transition-all duration-200 ease-out ${isHovered ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                        {Number(d.value).toLocaleString()} reports ({pct}%)
                      </div>
                      <div className={`font-inter text-xs truncate transition-all duration-200 ease-out ${isHovered ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                        {d.meta?.shops || 0} shops
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
