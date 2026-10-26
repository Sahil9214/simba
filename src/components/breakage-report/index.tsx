import { useMemo, useState, useEffect, memo } from "react";
import { useBreakageReport, useBreakageAlerts, useBreakageExport } from "@/hooks/api/useBreakageReport";
import { BreakageReportControls } from "./breakageReportControls";
import { BreakageReportHeader } from "./breakageReportHeader";
import { BreakageStatisticsSummary } from "./breakageStatisticsSummary";
import { BreakageChartsSection } from "./breakageChartSection";
import { BreakageAlertsSection } from "./breakageAlertSection";
import { BreakageInsightsSection } from "./breakageInsightSection";



export function BreakageReport({ dateRange, category }: { dateRange?: any, category?: any }) {
    const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d'>('30d');
    const [searchShop, setSearchShop] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchShop);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [searchShop]);

    const filters = useMemo(() => ({
        searchTerm: debouncedSearch || "",
        dateRange: dateRange,
        selectedTimeRange: selectedTimeRange === '7d' ? 7 : 30,
        category: category
    }), [debouncedSearch, selectedTimeRange, category, dateRange]);
    const breakageReport = useBreakageReport(filters);
    const breakageAlerts = useBreakageAlerts(filters);
    const exportMutation = useBreakageExport();

    // Handle export
    const handleExport = (format: 'csv' | 'json' | 'excel', dataType: 'statistics' | 'by-shop' | 'by-sku' | 'all') => {
        exportMutation.mutate({ filters, format, dataType });
    };


    const { data, isLoading, isError } = breakageReport;

    const isSearching = Boolean(isLoading && data && debouncedSearch !== searchShop);

    // Error state
    if (isError) {
        return <div>Error loading breakage report</div>;
    }


    return (
        <div className="w-full h-full space-y-4 font-inter mt-4">
            <BreakageReportHeader
                searchShop={searchShop}
                setSearchShop={setSearchShop}
                isSearching={isSearching}
                selectedTimeRange={selectedTimeRange}
                setSelectedTimeRange={setSelectedTimeRange}
                handleExport={handleExport}
                exportMutation={exportMutation}
            />

            <BreakageStatisticsSummary
                data={data}
                selectedTimeRange={selectedTimeRange}
            />
            <BreakageChartsSection
                data={data}
                debouncedSearch={debouncedSearch}
                dateRange={dateRange}
                category={category}
            />
            {/* Alerts Section */}
            {breakageAlerts.hasAlerts && (
                <BreakageAlertsSection alerts={breakageAlerts.alerts} />
            )}

            {/* <BreakageInsightsSection
                data={data}
                debouncedSearch={debouncedSearch}
            /> */}

        </div>
    )
}




BreakageReportHeader.displayName = 'BreakageReportHeader';
BreakageReportControls.displayName = 'BreakageReportControls';
BreakageStatisticsSummary.displayName = 'BreakageStatisticsSummary';
BreakageChartsSection.displayName = 'BreakageChartsSection';
BreakageInsightsSection.displayName = 'BreakageInsightsSection';
