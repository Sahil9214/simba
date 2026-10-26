import React, { useState } from "react";
import { ShopSummaryTableProps } from "./page";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import { ExtraInformation } from "@/common/extraInformation";

export const ShopSummaryTable: React.FC<ShopSummaryTableProps> = ({
  shopSummary,
  isLoading,
  isError,
  pagination,
  onPageChange,
}) => {
  // Change from Set to single string | null for accordion behavior
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const toggleShop = (shopId: string) => {
    // If clicking the same shop, close it. Otherwise, open the new one (closing any previously open one)
    setExpandedShopId((prev) => (prev === shopId ? null : shopId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-800">Failed to load shop data</p>
      </div>
    );
  }

  if (!shopSummary || shopSummary.length === 0) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm text-center">
        <p className="text-gray-500">No shop data available</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
      {/* Table Header */}
      <div className="bg-primary p-4">
        <h2 className="text-white font-semibold text-lg">Shop Summary</h2>
        <p className="text-white/80 text-sm mt-1">
          Click on any shop to view SKU details
        </p>
      </div>

      {/* Table Content */}
      <div className="divide-y divide-gray-200">
        {shopSummary.map((shop, index) => (
          <div
            key={shop.shopId || index}
            className="transition-all duration-200 custom-scrollbar"
          >
            {/* Shop Row */}
            <div
              onClick={() => toggleShop(shop.shopId)}
              className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 cursor-pointer hover:bg-secondary transition-colors"
            >
              <div className="flex items-start md:items-center gap-3 flex-1">
                <div className="shrink-0">
                  {expandedShopId === shop.shopId ? (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sidebar-foreground truncate">
                    {shop.shopName}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
                    <span>Code: {shop.vendorCode}</span>
                    <span className="px-2 py-0.5 bg-secondary text-primary rounded-full font-medium">
                      {shop.reportType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right shrink-0 md:ml-4">
                <div className="font-semibold text-sidebar-foreground whitespace-nowrap">
                  {shop.totalShopUnits?.toLocaleString() || 0} units
                </div>
                <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                  Market: {shop.totalMarketUnits?.toLocaleString() || 0}
                </div>
              </div>
            </div>

            {/* Expanded SKU Level Table */}
            {expandedShopId === shop.shopId && (
              <div className="bg-secondary/50 px-4 pb-4 ">
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto mt-2 scrollbar-hide">
                  <div className="w-full">
                    {/* SKU Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-3 bg-gray-50 p-3 font-semibold text-sm text-sidebar-foreground border-b border-gray-200 min-w-[1100px]">
                      <div className="col-span-1 text-center min-w-[40px] shrink-0">
                        S.No
                      </div>
                      <div className="col-span-2 min-w-[180px]">
                        Product Name
                      </div>
                      <div className="col-span-1 text-right min-w-[100px] shrink-0">
                        Market Share
                      </div>
                      <div className="col-span-1 text-center min-w-[80px] shrink-0">
                        Status
                      </div>
                      <div className="col-span-2 text-right min-w-[130px]">
                        Industry Monthly
                      </div>
                      <div className="col-span-2 text-right min-w-[130px]">
                        Daily Benchmark
                      </div>
                      <div className="col-span-2 text-right min-w-[130px]">
                        Current Month
                      </div>
                      <div className="col-span-1 text-right min-w-[80px] shrink-0">
                        Variance %
                      </div>
                    </div>
                    <div className="md:hidden bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      SKU Details
                    </div>

                    {/* SKU Table Rows */}
                    <div className="divide-y divide-gray-100">
                      {shop.skuLevel && shop.skuLevel.length > 0 ? (
                        shop.skuLevel
                          .filter(
                            (sku) => sku.skuId != null && sku.skuId !== ""
                          )
                          .map((sku, skuIndex) => {
                            // Determine benchmark status color
                            const getBenchmarkStatusColor = (
                              status: string
                            ) => {
                              if (status === "behind") {
                                return "bg-red-100 text-red-800";
                              } else if (status === "ahead") {
                                return "bg-green-100 text-green-800";
                              } else {
                                return "bg-yellow-100 text-yellow-800";
                              }
                            };

                            return (
                              <div
                                key={sku.skuId || skuIndex}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <div className="hidden md:grid grid-cols-12 gap-3 p-3 text-sm items-center min-w-[1200px]">
                                  <div className="col-span-1 text-center text-gray-500 font-medium min-w-[40px] shrink-0">
                                    {skuIndex + 1}
                                  </div>
                                  <div className="col-span-2 text-sidebar-foreground min-w-[180px]">
                                    <div className="font-medium truncate">
                                      {sku.productName}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {sku.sizeMl}ml
                                    </div>
                                  </div>

                                  <div className="col-span-1 text-right min-w-[100px] shrink-0">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        sku.marketShare >= 10
                                          ? "bg-green-100 text-green-800"
                                          : sku.marketShare >= 5
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {sku.marketShare?.toFixed(2) || 0}%
                                    </span>
                                  </div>
                                  <div className="col-span-1 text-center min-w-[80px] shrink-0">
                                    {sku.benchmark && (
                                      <span
                                        className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold ${getBenchmarkStatusColor(
                                          sku.benchmark.status
                                        )}`}
                                      >
                                        {sku.benchmark.status === "behind"
                                          ? "↓"
                                          : sku.benchmark.status === "ahead"
                                          ? "↑"
                                          : "—"}
                                      </span>
                                    )}
                                  </div>
                                  <div className="col-span-2 text-right text-xs text-gray-600 min-w-[130px] whitespace-nowrap">
                                    {sku.benchmark?.industryMonthlyUnits?.toLocaleString() ||
                                      "—"}
                                  </div>
                                  <div className="col-span-2 text-right text-xs text-gray-600 min-w-[130px] whitespace-nowrap">
                                    {sku.benchmark?.industryDailyBenchmark?.toLocaleString() ||
                                      "—"}
                                  </div>
                                  <div className="col-span-2 text-right text-xs text-gray-600 min-w-[130px] whitespace-nowrap">
                                    {sku.benchmark?.currentMonthUnits?.toLocaleString() ||
                                      "—"}
                                  </div>
                                  <div className="col-span-1 text-right text-xs min-w-[80px] shrink-0 whitespace-nowrap">
                                    {sku.benchmark ? (
                                      <span
                                        className={`font-semibold ${
                                          sku.benchmark
                                            .benchmarkVariancePercent >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {sku.benchmark.benchmarkVariancePercent?.toFixed(
                                          2
                                        ) || 0}
                                        %
                                      </span>
                                    ) : (
                                      "—"
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-3 p-4 text-sm md:hidden">
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="font-medium text-gray-600">
                                      Rank #{skuIndex + 1}
                                    </span>
                                    {sku.benchmark && (
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getBenchmarkStatusColor(
                                          sku.benchmark.status
                                        )}`}
                                      >
                                        {sku.benchmark.status === "behind"
                                          ? "Behind"
                                          : sku.benchmark.status === "ahead"
                                          ? "Ahead"
                                          : sku.benchmark.status}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Product
                                    </p>
                                    <p className="font-semibold text-sidebar-foreground">
                                      {sku.productName}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {sku.sizeMl}ml
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Brand
                                    </p>
                                    <p className="font-semibold text-sidebar-foreground">
                                      {sku.brandName === "Unknown"
                                        ? "Peers"
                                        : sku.brandName}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Total Units
                                    </p>
                                    <p className="font-semibold text-sidebar-foreground">
                                      {sku.totalUnits?.toLocaleString() || 0}
                                    </p>
                                  </div>
                                  <div className="pt-1 lg:border-t border-dashed border-gray-200">
                                    <p className="text-xs text-gray-500">
                                      Market Share
                                    </p>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        sku.marketShare >= 10
                                          ? "bg-green-100 text-green-800"
                                          : sku.marketShare >= 5
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {sku.marketShare?.toFixed(2) || 0}%
                                    </span>
                                  </div>
                                  {sku.benchmark && (
                                    <div className="pt-1 lg:border-t border-dashed border-gray-200 space-y-2">
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Benchmark Status
                                        </p>
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getBenchmarkStatusColor(
                                            sku.benchmark.status
                                          )}`}
                                        >
                                          {sku.benchmark.status === "behind"
                                            ? "Behind"
                                            : sku.benchmark.status === "ahead"
                                            ? "Ahead"
                                            : sku.benchmark.status}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Industry Monthly Units
                                        </p>
                                        <p className="text-xs font-semibold text-sidebar-foreground mt-0.5">
                                          {sku.benchmark.industryMonthlyUnits?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Industry Daily Benchmark
                                        </p>
                                        <p className="text-xs font-semibold text-sidebar-foreground mt-0.5">
                                          {sku.benchmark.industryDailyBenchmark?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Current Month Units
                                        </p>
                                        <p className="text-xs font-semibold text-sidebar-foreground mt-0.5">
                                          {sku.benchmark.currentMonthUnits?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Current Daily Average
                                        </p>
                                        <p className="text-xs font-semibold text-sidebar-foreground mt-0.5">
                                          {sku.benchmark.currentDailyAverage?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Benchmark Variance
                                        </p>
                                        <p className="text-xs font-semibold text-sidebar-foreground mt-0.5">
                                          {sku.benchmark.benchmarkVariance?.toLocaleString() ||
                                            0}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Benchmark Variance %
                                        </p>
                                        <p
                                          className={`text-xs font-semibold mt-0.5  pr-4 ${
                                            sku.benchmark
                                              .benchmarkVariancePercent >= 0
                                              ? "text-green-600"
                                              : "text-red-600"
                                          }`}
                                        >
                                          {sku.benchmark.benchmarkVariancePercent?.toFixed(
                                            2
                                          ) || 0}
                                          %
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No SKU data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table Footer with Pagination */}
      {(pagination || shopSummary.length > 0) && (
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              {pagination ? (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {(pagination.currentPage - 1) * pagination.shopsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold">
                    {Math.min(
                      pagination.currentPage * pagination.shopsPerPage,
                      pagination.totalShops
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">{pagination.totalShops}</span>{" "}
                  shops
                </>
              ) : (
                <div className="flex flex-row gap-4">
                  Total Shops:{" "}
                  <span className="font-semibold">{shopSummary.length}</span>
                  <ExtraInformation
                    extraInformation="Total number of shops in the market share report"
                    tooltipOpen={isTooltipOpen}
                    setTooltipOpen={setIsTooltipOpen}
                    uploadCentreTable={true}
                  />
                </div>
              )}
            </p>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && onPageChange && (
              <div
                className="flex items-center gap-2"
                role="navigation"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | string)[] = [];
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.currentPage;

                    // Calculate which pages to show
                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Always show first page
                      pages.push(1);

                      // Determine pages to show around current page
                      let startPage = Math.max(2, currentPage - 1);
                      let endPage = Math.min(totalPages - 1, currentPage + 1);

                      // Adjust if we're near the start
                      if (currentPage <= 3) {
                        startPage = 2;
                        endPage = Math.min(4, totalPages - 1);
                      }

                      // Adjust if we're near the end
                      if (currentPage >= totalPages - 2) {
                        startPage = Math.max(2, totalPages - 3);
                        endPage = totalPages - 1;
                      }

                      // Show ellipsis before middle pages if needed
                      if (startPage > 2) {
                        pages.push("ellipsis-start");
                      }

                      // Add middle pages
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(i);
                      }

                      // Show ellipsis after middle pages if needed
                      if (endPage < totalPages - 1) {
                        pages.push("ellipsis-end");
                      }

                      // Always show last page
                      pages.push(totalPages);
                    }

                    return pages.map((page, index) => {
                      if (
                        page === "ellipsis-start" ||
                        page === "ellipsis-end"
                      ) {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-400"
                            aria-hidden="true"
                          >
                            ...
                          </span>
                        );
                      }

                      const pageNumber = page as number;
                      return (
                        <Button
                          key={pageNumber}
                          variant={
                            pageNumber === currentPage ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => onPageChange(pageNumber)}
                          className={`h-8 min-w-8 px-2 ${
                            pageNumber === currentPage
                              ? "bg-primary text-white"
                              : ""
                          }`}
                          aria-label={`Go to page ${pageNumber}`}
                          aria-current={
                            pageNumber === currentPage ? "page" : undefined
                          }
                        >
                          {pageNumber}
                        </Button>
                      );
                    });
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="h-8 w-8 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Go to next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
