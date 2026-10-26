import { memo, Suspense } from "react";
import { BreakageByShopHorizontal } from "@/components/chart";
import { RefreshCw } from "lucide-react";
import { DataDonutCard } from "@/components/chart";
import { breakageBySKUColors } from "@/lib/colors";
export const BreakageChartsSection = memo(({
  data,
  debouncedSearch,
  dateRange,
  category,
}: {
  data: any;
  debouncedSearch: string;
  dateRange?: { start: string; end: string };
  category?: string;
}) => (
  <section className="flex flex-col lg:flex-row gap-2 bg-white p-4 rounded-2xl">
    <div className="w-full lg:w-1/2 ">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Loading shop data...</span>
          </div>
        </div>
      }>
        <BreakageByShopHorizontal
          data={data?.byShop?.map((shop: any) => ({
            name: shop.shopName,
            value: shop.breakageCount,
            breakdown: [{
              product: shop.mostBrokenSKU,
              count: shop.breakageCount,
              color: "bg-red-500"
            }]
          }))}
          searchTerm={debouncedSearch}
        />
      </Suspense>
    </div>

    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch" />

    <div className="w-full lg:w-1/2 ">
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm text-gray-600">Loading SKU data...</span>
          </div>
        </div>
      }>
        <DataDonutCard
          title="Breakage by SKU"
          subtitle='Displays SKU-wise contribution to total breakage. Useful for identifying fragile SKUs or packaging problems that need supplier discussions.'
          colors={breakageBySKUColors}
          controls={{ sort: true, filter: false }}
          listShownButton={false}
          centerLabel="Units"
          showCenterData={true}
          dataSource="breakageShop"
          dateRange={dateRange}
          category={category}
        />
      </Suspense>
    </div>
  </section>
));
