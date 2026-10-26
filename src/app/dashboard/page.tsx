"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import {
  DonutChartSkeleton,
  LineChartSkeleton,
  PeerComparisonChartSkeleton,
} from "@/common/skeleton";
import { closing_node, sales_node } from "@/assets/icons";
import {
  salesByPackSizeColors,
  topPerformingProductsColors,
  topResellerColors,
  dpCodesColors,
} from "@/lib/colors";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreChartSkeleton } from "@/common/skeleton/StoreReportVsFieldChartSkeleton";

const StoreReportVsFieldChart = dynamic(
  () =>
    import("@/components/chart/StoreReportVsFieldChart").then((mod) => ({
      default: mod.StoreReportVsFieldChart,
    })),
  {
    loading: () => <StoreChartSkeleton />,
    ssr: false,
  }
);

const ReportingGapsCard = dynamic(
  () =>
    import("@/components/reporting").then((mod) => ({
      default: mod.ReportingGapsCard,
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

const InsightStream = dynamic(
  () =>
    import("@/components/InsightStream").then((mod) => ({
      default: mod.InsightStream,
    })),
  {
    loading: () => (
      <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-48" />
    ),
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

const AnalyticsErrorBoundary = dynamic(
  () =>
    import("@/components/analyticsBanner/AnalyticsErrorBoundary").then(
      (mod) => ({ default: mod.AnalyticsErrorBoundary })
    ),
  {
    loading: () => (
      <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-32" />
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

const DpCodePieChart = dynamic(
  () =>
    import("@/components/chart/dp-code-pie-chart").then((mod) => ({
      default: mod.DpCodePieChart,
    })),
  {
    loading: () => <DonutChartSkeleton />,
    ssr: false,
  }
);

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

const PeerComparisonChart = dynamic(
  () => import("@/components/chart").then((mod) => mod.PeerComparisonChart),
  {
    loading: () => <PeerComparisonChartSkeleton />,
    ssr: false,
  }
);

const DonutChart = dynamic(
  () => import("@/components/chart").then((mod) => mod.DonutChart),
  {
    loading: () => <DonutChartSkeleton />,
    ssr: false,
  }
);

const LineChartSalesVsClosing = dynamic(
  () => import("@/components/chart").then((mod) => mod.LineChartSalesVsClosing),
  {
    loading: () => <LineChartSkeleton />,
    ssr: false,
  }
);

export default function Dashboard() {
  const [hideSalesVsClosing, setHideSalesVsClosing] = useState(false);
  const [hidePeerComparison, setHidePeerComparison] = useState(false);
  const [hideTopPerformingResellerShops, setHideTopPerformingResellerShops] =
    useState(false);
  const [hideDemandBySkuSalesByPackSize, setHideDemandBySkuSalesByPackSize] =
    useState(false);
  const [hideBreakageReport, setHideBreakageReport] = useState(false);
  const [hideShopWiseSalesVsClosingStock, setHideShopWiseSalesVsClosingStock] =
    useState(false);

  //filter addition
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedProductType, setSelectedProductType] = useState("");

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };
  const handleProductTypeChange = (productType: string) => {
    setSelectedProductType(productType);
  };

  const today = new Date();
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const [dateRange, setDateRange] = useState({
    start: oneWeekAgo.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0],
  });

  return (
    <div className="space-y-4 font-inter overflow-x-hidden">
      <section>
        <HeaderData
          heading="Dashboard"
          showLocationDropdown={true}
          showProductTypeDropdown={true}
          showSalespersonDropdown={true}
          onSearchChange={handleSearchChange}
          onLocationChange={handleLocationChange}
          onProductTypeChange={handleProductTypeChange}
        />
      </section>

      <section>
        <AnalyticsErrorBoundary>
          <AnalyticsBanner
            searchTerm={searchTerm}
            selectedLocation={selectedLocation}
            category={selectedProductType}
          />
        </AnalyticsErrorBoundary>
      </section>

      <section>
        <DailySalesReport
          heading="Seller Reports Dashboard Summary"
          extraInformation="This section shows demand raised by staff members for the shop"
        />
      </section>

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
                category={selectedProductType}
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
                category={selectedProductType}
              />
            </div>
          </div>
        )}
      </section>

      {/* Shop-wise Closing Stock Heatmap Table */}
      <section className="flex relative flex-col lg:flex-row gap-2 bg-white shadow-sm py-4  rounded-2xl w-full">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-0 right-1 cursor-pointer"
          onClick={() =>
            setHideShopWiseSalesVsClosingStock(!hideShopWiseSalesVsClosingStock)
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
          <ShopStockHeatmap category={selectedProductType} />
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
          <div className="mt-6 flex flex-col lg:flex-row gap-2 w-full">
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
                category={selectedProductType}
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
                category={selectedProductType}
              />
            </div>
          </div>
        )}
      </section>

      {/* Breakage Report */}
      <section className="flex relative flex-col space-y-4 gap-2 bg-white shadow-sm p-4 rounded-2xl">
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
          <BreakageReport category={selectedProductType} />
        )}
      </section>

      {/* Sales vs Closing Stock + Reporting Gaps */}
      <section className="flex relative flex-col lg:flex-row gap-2 justify-between bg-white shadow-sm p-4 rounded-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 cursor-pointer"
          onClick={() => setHideSalesVsClosing(!hideSalesVsClosing)}
        >
          {hideSalesVsClosing ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>

        {hideSalesVsClosing ? (
          <div className="w-full flex justify-center items-center">
            <p className="font-inter font-bold text-sm text-gray-500">
              Sales vs Closing Stock is hidden
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-2 mt-2 w-full">
            <div className="w-full ">
              <StoreReportVsFieldChart
                color2={"#6366F1"}
                imageNode1={sales_node}
                legend1="Sales"
                imageNode2={closing_node}
                legend2="Closing "
                color1={"#C7D2FE"}
                heading="Sales vs Closing Stock (Shop-wise)"
                description="Compare weekly government report with salesperson's field data to spot discrepancies by store"
                feature={false}
                className="py-2"
                searchTerm={searchTerm}
                selectedLocation={selectedLocation}
                category={selectedProductType}
              />
            </div>
          </div>
        )}
      </section>

      <section>
        <DemandAnalyticsTable
          heading="Demand Analytics - Detailed View "
          searchTerm={searchTerm}
          selectedLocation={selectedLocation}
          extraInfomation="This section shows demand raised by staff members for the shop."
          category={selectedProductType}
        />
      </section>
    </div>
  );
}
