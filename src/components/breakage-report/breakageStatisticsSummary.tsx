import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const BreakageStatisticsSummary = memo(({ data, selectedTimeRange }: {
  data: any;
  selectedTimeRange: '7d' | '30d';
}) => (
  <section
    className="box-border flex justify-between gap-2 w-full bg-white rounded-2xl p-0 lg:flex-row flex-col
        border-container-card min-h-[80px]
        "
    aria-label="Breakage summary"
  >
    {/* Card 1 */}
    <div className="flex justify-start flex-col gap-1 p-4 rounded-xl flex-1">
      <div className="font-inter font-semibold text-sm leading-[20px] text-placeholder-gray">
        Total Breakages ({selectedTimeRange})
      </div>

      <div className="font-inter font-bold text-sm leading-[20px] text-sidebar-foreground flex items-center gap-2">
        {data?.statistics?.totalBreakages?.toLocaleString()}
        {data?.statistics?.trend?.changeType === 'increase' ? (
          <TrendingUp className="h-4 w-4 text-red-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-500" />
        )}
        <span className={`text-xs ${data?.statistics?.trend?.changeType === 'increase' ? 'text-red-500' : 'text-green-500'
          }`}>
          {data?.statistics?.trend?.changePercentage?.toFixed(1)}%
        </span>
      </div>
    </div>

    {/* Separator */}
    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch" />

    {/* Card 2 */}
    <div className="flex justify-start flex-col gap-1 p-4 rounded-xl flex-1">
      <div className="font-inter font-semibold text-sm leading-[20px] text-grayish-blue">
        Top Shop with breakage
      </div>

      <div className="font-inter font-bold text-sm leading-[20px] text-sidebar-foreground flex flex-col sm:flex-row sm:items-center sm:gap-2 break-words">
        <span className="truncate max-w-[120px] sm:max-w-[90px]" title={data?.statistics?.topShopWithBreakage?.shopName || ''}>
          {data?.statistics?.topShopWithBreakage?.shopName}
        </span>
        <span className="shrink-0 hidden sm:inline">·</span>
        <span className="truncate " title={data?.statistics?.topShopWithBreakage?.dpCode || ''}>
          {data?.statistics?.topShopWithBreakage?.dpCode}
        </span>
        <span className="shrink-0 hidden sm:inline">·</span>
        <span className="truncate max-w-[70px] sm:max-w-[56px]">
          {data?.statistics?.topShopWithBreakage?.breakageCount}
        </span>
      </div>
    </div>

    {/* Separator */}
    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch" />

    {/* Card 3 */}
    <div className="flex justify-start flex-col gap-1 p-4 rounded-xl flex-1">
      <div className="font-inter font-semibold text-sm leading-[20px] text-grayish-blue">
        Top SKU breakage
      </div>

      <div className="font-inter font-bold text-sm leading-[20px] text-slate-900">
        {data?.statistics?.topSKUBreakage?.productName} · {data?.statistics?.topSKUBreakage?.sizeML} · {data?.statistics?.topSKUBreakage?.breakageCount}
      </div>

    </div>

    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch" />

    {/* Card 4 */}
    <div className="flex justify-start flex-col gap-1 p-4 rounded-xl flex-1">
      <div className="font-inter font-semibold text-sm leading-[20px] text-grayish-blue">
        Breakage % vs Sales
      </div>

      <div className="font-inter font-bold text-sm leading-[20px] text-slate-900">
        {data?.statistics?.breakagePercentage?.toFixed(2)}%
      </div>

    </div>

  </section>
));
BreakageStatisticsSummary.displayName = 'BreakageStatisticsSummary';
