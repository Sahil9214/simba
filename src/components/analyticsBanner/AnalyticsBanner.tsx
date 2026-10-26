import { TrendingUp, CupSoda, Store, AlertTriangle, RefreshCw, MapPin } from "lucide-react";
import { useDashboardMetrics } from "../../hooks/api";
import { useEffect, useState } from "react";
import { MetricCardSkeleton } from "@/common/skeleton/metricCardSkeleton";
import { formatNumber } from "@/utils/convertNumber";

export function AnalyticsBanner({
  searchTerm,
  selectedLocation,
  dateRange,
  category
}: {
  searchTerm?: string;
  selectedLocation?: string;
  dateRange?: { start: string; end: string };
  category?: string;
}) {
  const { data: metrics, isLoading, isError, refetch } = useDashboardMetrics({
    searchTerm: searchTerm || undefined,
    selectedLocation: selectedLocation || undefined,
    dateRange: dateRange || undefined,
    category: category || undefined,
  });
  const [checkRouteName, setCheckRouteName] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    if (metrics) {
      setIsRefreshing(false);
    }
    if (!isLoading) {
      setCheckRouteName(window.location.pathname === "/dashboard/daily-reports" ? "Today" : "");
    }

  }, [metrics]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
  };

  if (isLoading) {
    return (
      <section className="bg-white shadow-sm p-4 rounded-2xl">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-1 min-w-0 sm:min-w-[200px] md:min-w-[250极] lg:min-w-[223.5px]">
              <MetricCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isError || !metrics) {
    return (
      <section className="font-inter bg-white shadow-sm p-4 rounded-2xl">
        <div className="flex items-center justify-center h-32 bg-red-50 rounded-lg border border-red-200">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="font-inter text-red-600 text-sm mb-3 font-medium">Failed to load analytics data</p>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-极 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  const formatValue = (value: number | string, unit?: string) => {
    // Use the new formatNumber utility for better readability
    const formattedNum = formatNumber(value);
    return unit ? `${formattedNum} ${unit}` : formattedNum;
  };

  return (
    <section className="bg-white font-inter shadow-sm rounded-2xl filter drop-shadow-[0px_1px_4px_rgba(12,12,13,0.05)]">
      <div className="flex flex-col sm:flex-row flex-wrap justify-center items-start gap-4 lg:gap-0 py-2">
        {/* 1: Total Sales Overall */}
        <div className="flex-1 sm:min-w-[200px] md:min-w-[250px] lg:min-w-[223.5px] lg:h-40 p-4 border border-white rounded-xl ">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="size-10 rounded-lg bg-pink-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-500" />
              </div>
            </div>

            <div className="space-y-1 ">
              <p className="font-geist font-semibold text-sm text-custom-gray leading-5">
                Total Sales Overall
              </p>

              <div className="flex items-baseline gap-2">
                <p className="font-geist font-bold text-base text-black">
                  {formatValue(metrics.totalStock.value)}
                </p>
                <p className="font-inter text-sm text-[#4B5563]">
                  {metrics.totalStock.unit}
                </p>
              </div>
              {
                checkRouteName && <div className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] rounded-full">
                  <span className="text-xs font-inter text-[#16A34A]">
                    {checkRouteName}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[2px] bg-tertiary-color h-40 self-stretch"></div>

        {/* 2: Top SKU / Product */}
        <div className="flex-1  sm:min-w-[200px] md:min-w-[250px] lg:极-w-[223.5px] lg:h-40 p-4 border border-white rounded-xl ">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="size-10 rounded-lg bg-[#ECFEFF] flex items-center justify-center">
                <CupSoda className="w-5 h-5 text-[#0EA5E9]" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-inter font-semibold text-sm text-custom-gray leading-5">
                Top SKU / Product
              </p>

              <p className="font-inter font-bold text-base text-[#111827] truncate max-w-[191.5px]">
                {metrics.topSku.name}
              </p>

              <div className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] rounded-full">
                <span className="text-xs font-inter text-[#16A34A]">
                  {formatValue(metrics.topSku.totalStock)} Overall Sales
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[2px极 bg-tertiary-color h-40 self-stretch"></div>

        {/* 3: Top Seller (Shop) */}
        <div className="flex-1 min-w-0 sm:min-w-[200px] md:min-w-[250px] lg:min-w-[223.5px] lg:h-40 p-4 border border-white rounded-xl ">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="size-10 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                <Store className="w-5 h-5 text-[#6366F1]" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-inter font-semibold text-sm text-custom-gray leading-5">
                Top Seller (Shop)
              </p>

              <p className="font-inter font-bold text-base text-[#111827] truncate max-w-[191.5px]">
                {metrics.topShop.name}
              </p>

              <div className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] rounded-full">
                <span className="text-xs font-inter text-[#16A34A]">
                  {formatNumber(metrics.topShop.stockUnits)} Units, {formatNumber(metrics.topShop.stockLeft)} Left
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-[2px] bg-tertiary-color h-40 self-stretch"></div>

        {/* 4: Active Resellers */}
        <div className="flex-1 min-w-0 sm:min-w-[200px] md:min-w-[250px] lg:min-w-[223.5px] lg:h-40 p-4 border border-white rounded-xl ">
          <div className="flex flex-col gap-4">
            <div className="flex">
              <div className="size-10 rounded-lg bg-[#FFF7ED] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#F97316]" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-inter font-semibold text-sm text-custom-gray leading-5">
                Active Resellers
              </p>

              <p className="font-inter font-bold text-base text-[#111827]">
                {formatNumber(metrics.topLocation.shopCount)}
              </p>

              <div className="inline-flex items-center px-2 py-0.5 bg-[#FEF2F2] rounded-full">
                <span className="text-xs font-inter text-[#EF4444]">
                  {metrics.topLocation.name || "25 Inactive Stores"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
