"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { closing_node, sales_node } from "@/assets/icons";
import { DonutChartSkeleton, LineChartSkeleton } from "@/common/skeleton";
import {
  DashboardErrorBoundary,
  ChartErrorBoundary,
  DataErrorBoundary,
} from "@/common/error-boundaries";
import {
  salesByPackSizeColors,
  topPerformingProductsColors,
  topResellerColors,
} from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

// Dynamic imports for heavy components with loading states
const DailySalesReport = dynamic(
  () =>
    import("@/components/tables/daily-sales-report").then((mod) => ({
      default: mod.DailySalesReport,
    })),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-64" />
    ),
    ssr: false,
  }
);

const DemandAnalyticsTable = dynamic(
  () =>
    import("@/components/tables/demand-analytics-table").then((mod) => ({
      default: mod.DemandAnalyticsTable,
    })),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />
    ),
    ssr: false,
  }
);

const AnalyticsBanner = dynamic(
  () =>
    import("@/components/analyticsBanner").then((mod) => ({
      default: mod.AnalyticsBanner,
    })),
  {
    loading: () => (
      <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-32" />
    ),
    ssr: false,
  }
);

const StoreReportVsFieldChart = dynamic(
  () =>
    import("@/components/chart/StoreReportVsFieldChart").then((mod) => ({
      default: mod.StoreReportVsFieldChart,
    })),
  {
    loading: () => <LineChartSkeleton />,
    ssr: false,
  }
);

const DataDonutCard = dynamic(
  () =>
    import("@/components/chart").then((mod) => ({
      default: mod.DataDonutCard,
    })),
  {
    loading: () => <DonutChartSkeleton />,
    ssr: false,
  }
);

const LineChartSalesVsClosing = dynamic(
  () =>
    import("@/components/chart").then((mod) => ({
      default: mod.LineChartSalesVsClosing,
    })),
  {
    loading: () => <LineChartSkeleton />,
    ssr: false,
  }
);

const ShopStockHeatmap = dynamic(
  () =>
    import("@/components/heat-map/ShopStockHeatmap").then((mod) => ({
      default: mod.ShopStockHeatmap,
    })),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />
    ),
    ssr: false,
  }
);

const BreakageReport = dynamic(
  () =>
    import("@/components/breakage-report").then((mod) => ({
      default: mod.BreakageReport,
    })),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-64" />
    ),
    ssr: false,
  }
);

const HeaderData = dynamic(
  () =>
    import("@/components/header/header-data").then((mod) => ({
      default: mod.HeaderData,
    })),
  {
    loading: () => (
      <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />
    ),
    ssr: false,
  }
);

const LiveReports = () => {
  const [hideTopPerformingResellerShops, setHideTopPerformingResellerShops] =
    useState(false);
  const [hideDemandBySkuSalesByPackSize, setHideDemandBySkuSalesByPackSize] =
    useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [hideShopWiseSalesVsClosingStock, setHideShopWiseSalesVsClosingStock] =
    useState(false);
  const [hideSalesVsClosingTrends, setHideSalesVsClosingTrends] =
    useState(false);
  const [hideBreakageReport, setHideBreakageReport] = useState(false);

  const today = new Date();
  const [dateRange, setDateRange] = useState({
    start: today.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  });
  const extraInformation =
    "This table shows the demand requests raised by staff members for the shop.";
  const tableExtraInformation =
    "This table shows the demand requests raised by staff members for the shop.";

  return (
    <DashboardErrorBoundary>
      <div className="space-y-4">
        <section>
          <HeaderData
            heading="Daily Reports"
            showLocationDropdown={true}
            showShopDropdown={true}
            showSKUDropdown={true}
            showSalespersonDropdown={true}
            showExportReportsButton={true}
          />
        </section>
        <section>
          <AnalyticsBanner dateRange={dateRange} />
        </section>

        <section>
          <DailySalesReport
            extraInformation={extraInformation}
            showDateFilter={false}
            showTodayOnly={true}
          />
        </section>
        {/* <section className="py-4 bg-white shadow-sm rounded-2xl">
                    <Suspense fallback={<p>Loading....</p>}>
                        <StoreReportVsFieldChart
                            searchTerm={searchTerm}
                            selectedLocation={selectedLocation}
                            color1={"#BAE6FD"}
                            color2={"#0EA5E9"}
                            heading={"Report vs Field Data (Store-wise)"}
                            description={
                                "Compare weekly government report with salesperson’s field data to spot discrepancies by store"
                            }
                            feature={true}
                            imageNode1={dark_node}
                            imageNode2={light_node}
                            legend1="Gov"
                            legend2="Field"
                            dateRange={dateRange}
                        />
                    </Suspense>
                </section> */}
        {/* Two DataDonutCard side-by-side */}
        <section className="flex relative flex-col lg:flex-row gap-2 bg-white shadow-sm p-4 rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-1 cursor-pointer"
            onClick={() =>
              setHideTopPerformingResellerShops(!hideTopPerformingResellerShops)
            }
          >
            {hideTopPerformingResellerShops ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          {hideTopPerformingResellerShops ? (
            <div className="w-full flex justify-center items-center">
              <p className="font-inter font-bold text-sm text-gray-500">
                Top Performing Products & Top Resellers (Shops) is hidden
              </p>
            </div>
          ) : (
            <div className="mt-6 flex flex-col lg:flex-row gap-2 w-full">
              <div className="w-full relative lg:w-1/2">
                <DataDonutCard
                  title="Top Performing Products"
                  subtitle="This section showcases the performance of our best-selling products and their growth."
                  controls={{ sort: true, filter: false }}
                  filterOptions={[
                    {
                      id: "Products",
                      label: "Sort",
                      values: ["High to Low", "Low to High"],
                    },
                  ]}
                  colors={topPerformingProductsColors}
                  listShownButton={false}
                  centerLabel="Sales"
                  showCenterData={true}
                  searchTerm={searchTerm}
                  selectedLocation={selectedLocation}
                  dataSource="topPerformingProducts"
                  dateRange={dateRange}
                />
              </div>

              <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch"></div>

              <div className="w-full lg:w-1/2 flex-center">
                <DataDonutCard
                  title="Top Resellers (Shops)"
                  subtitle="This section highlights the performance of Simba's leading reseller shops based on units sold and their contribution to overall growth."
                  colors={topResellerColors}
                  controls={{ sort: true, filter: false }}
                  filterOptions={[
                    {
                      id: "Shops",
                      label: "Filter",
                      values: ["Vodka", "Beer", "Whisky"],
                    },
                  ]}
                  listShownButton={false}
                  centerLabel="Sales"
                  showCenterData={true}
                  searchTerm={searchTerm}
                  selectedLocation={selectedLocation}
                  dataSource="topResellersShops"
                  dateRange={dateRange}
                />
              </div>
            </div>
          )}
        </section>

        {/* Sales vs Closing Stock + Reporting Gaps */}
        <section className="flex relative mt-5 flex-col lg:flex-row gap-2 bg-white shadow-sm p-4  rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-1 cursor-pointer"
            onClick={() =>
              setHideSalesVsClosingTrends(!hideSalesVsClosingTrends)
            }
          >
            {hideSalesVsClosingTrends ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          {hideSalesVsClosingTrends ? (
            <div className="w-full  flex flex-col justify-center items-center ">
              <p className="font-inter font-bold text-sm text-gray-500">
                Sales vs Closing Trends is hidden
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-2 mt-2 w-full">
              <div className="w-full ">
                <ChartErrorBoundary
                  chartType="bar"
                  chartTitle="Sales vs Closing Stock"
                >
                  <StoreReportVsFieldChart
                    color2={"#6366F1"}
                    imageNode1={sales_node}
                    legend1="Sales"
                    imageNode2={closing_node}
                    legend2="Closing"
                    color1={"#C7D2FE"}
                    heading="Sales vs Closing Stock (Shop-wise)"
                    description="Compare weekly government report with salesperson's field data to spot discrepancies by store"
                    feature={false}
                    dateRange={dateRange}
                  />
                </ChartErrorBoundary>
              </div>

              <div className="hidden md:border-2 border-tertiary-color md:block ml-8" />

              {/* <div className="w-full lg:w-1/2">
                                <ChartErrorBoundary chartType="line" chartTitle="Sales vs Closing Trends">
                                    <LineChartSalesVsClosing />
                                </ChartErrorBoundary>
                            </div> */}
            </div>
          )}
        </section>

        <section className="flex relative flex-col lg:flex-row gap-2 bg-white shadow-sm py-4  rounded-2xl w-full">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-1 cursor-pointer"
            onClick={() =>
              setHideShopWiseSalesVsClosingStock(
                !hideShopWiseSalesVsClosingStock
              )
            }
          >
            {hideShopWiseSalesVsClosingStock ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          {hideShopWiseSalesVsClosingStock ? (
            <div className="w-full flex justify-center items-center">
              <p className="font-inter font-bold text-sm text-gray-500">
                Shop-wise Closing Stock Heatmap is hidden
              </p>
            </div>
          ) : (
            <ShopStockHeatmap />
          )}
        </section>

        <section className="flex relative flex-col lg:flex-row gap-2 bg-white shadow-sm p-4 rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-1 cursor-pointer"
            onClick={() =>
              setHideDemandBySkuSalesByPackSize(!hideDemandBySkuSalesByPackSize)
            }
          >
            {hideDemandBySkuSalesByPackSize ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          {hideDemandBySkuSalesByPackSize ? (
            <div className="w-full flex justify-center items-center">
              <p className="font-inter font-bold text-sm text-gray-500">
                Demand by SKU & Sales by Pack Size is hidden
              </p>
            </div>
          ) : (
            <div className="mt-6  w-full flex flex-col lg:flex-row gap-2 ">
              <div className="w-full lg:w-1/2">
                <DataDonutCard
                  title="Demand by SKU"
                  subtitle="Visualize demand concentration across top SKUs. Helps identify high-demand products that drive fulfillment planning and inventory allocation."
                  controls={{ sort: true }}
                  colors={topPerformingProductsColors}
                  listShownButton={false}
                  centerLabel="Demand"
                  showCenterData={true}
                  searchTerm={searchTerm}
                  selectedLocation={selectedLocation}
                  dataSource="demandBySku"
                  dateRange={dateRange}
                />
              </div>

              <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch"></div>

              <div className="w-full lg:w-1/2">
                <DataDonutCard
                  title="Sales by Pack Size"
                  subtitle="Breakdown of Simba sales by package size. Use the metric switch to view distribution by units or revenue."
                  colors={salesByPackSizeColors}
                  controls={{ sort: true, filter: false }}
                  filterOptions={[
                    {
                      id: "Shops",
                      label: "Filter",
                      values: ["Vodka", "Beer", "Whisky"],
                    },
                  ]}
                  serverSide={false}
                  listShownButton={false}
                  centerLabel="Sales"
                  showCenterData={true}
                  searchTerm={searchTerm}
                  selectedLocation={selectedLocation}
                  dataSource="salesByPackSize"
                  dateRange={dateRange}
                />
              </div>
            </div>
          )}
        </section>

        {/* Breakage Report */}
        <section className="relative flex mt-5 flex-col space-y-4 gap-2 bg-white shadow-sm p-4 rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-1 cursor-pointer"
            onClick={() => setHideBreakageReport(!hideBreakageReport)}
          >
            {hideBreakageReport ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          {hideBreakageReport ? (
            <div className="w-full flex justify-center items-center">
              <p className="font-inter font-bold text-sm text-gray-500">
                Breakage Report is hidden
              </p>
            </div>
          ) : (
            <BreakageReport dateRange={dateRange} />
          )}
        </section>

        {/* <section className="flex mt-5 flex-col lg:flex-row gap-2 bg-white shadow-sm p-4 rounded-2xl">
                    <InsightStream
                        searchTerm={searchTerm}
                        selectedLocation={selectedLocation} />
                </section> */}

        <section>
          <DataErrorBoundary
            apiEndpoint="/api/demand-analytics"
            queryKeys={[["demand-analytics", searchTerm, selectedLocation]]}
          >
            <DemandAnalyticsTable
              heading="Demand Analytics - Detailed View"
              searchTerm={searchTerm}
              extraInfomation={tableExtraInformation}
              selectedLocation={selectedLocation}
              dateRange={dateRange}
            />
          </DataErrorBoundary>
        </section>
      </div>
    </DashboardErrorBoundary>
  );
};

export default LiveReports;
