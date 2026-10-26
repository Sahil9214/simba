import React from "react";
import { Eye, TrendingUp, TrendingDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Modal } from "../ui/modal";
import month from "@/utils/json/month.json";
import { Button } from "../ui/button";
import { Suspense } from "react";
import { DonutChartSkeleton } from "@/common/skeleton";
import { formatDayLabel, formatLastVisitDate } from "@/utils/formatLastVisitDate";
import { formatDateToDDMMYYYY } from "@/utils/formatDateDDMMYYY";
const DonutChart = dynamic(
  () => import("@/components/chart").then((mod) => mod.DonutChart),
  { ssr: false }
);

interface ProductTable {
  success: boolean;
  data: {
    cards: any;
    monthlySales: any;
    salesBySku: any;
    salesByShop: any;
    salesBySkuAndShop: any;
  };
}

export const ProductTable = ({
  title,
  data,
  isLoading,
  handleStaffMonthData,
  staffData,
  staffOverview,
}: {
  title: string;
  data: ProductTable;
  isLoading: boolean;
  handleStaffMonthData: any;
  staffData: any;
  staffOverview?: any;
}) => {
  const { salesByShop } = data?.data || { salesByShop: [] };
  const [tableModalOpen, setTableModalOpen] = useState<boolean>(false);
  const [skusData, setSkusData] = useState<any>(null);
  const [shopData, setShopData] = useState<any>(null);
  const [overAllDataModal, setOverAllDataModal] = useState<boolean>(false);
  if (isLoading) return <p>Loading....</p>;

  const openShopModal = (shop: any) => {
    setTableModalOpen(true);
    setSkusData(shop?.skus || []);
    setShopData(shop);
    if (typeof handleStaffMonthData === "function") {
      handleStaffMonthData();
    }
  };

  const closeShopModal = () => {
    setTableModalOpen(false);
  };

  const hadnleOverAllStaffData = () => {
    setOverAllDataModal((pre) => !pre);
    if (typeof handleStaffMonthData === "function") {
      handleStaffMonthData();
    }
  };

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastSecondMonth =
    currentMonth === 1 ? 11 : currentMonth === 2 ? 12 : currentMonth - 2;

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex flex-col lg:flex-row justify-between items-center py-2">
        <h3 className="font-inter font-semibold">{title}</h3>
        {/* <Button variant="outline" className=" py-2 hover:bg-primary  hover:text-white active:scale-95" onClick={hadnleOverAllStaffData}>
          View Overview
        </Button> */}
      </div>
      <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header */}
            <div className="bg-tertiary-color border-b border-[#E5E5E5]">
              <div className="flex">
                <div className="flex-1 min-w-[140px] h-10 px-4 flex items-center">
                  <span className="text-sm font-medium text-placeholder-gray leading-none">
                    ShopName
                  </span>
                </div>
                <div className="flex-1 min-w-[100px] h-10 px-4 flex items-center">
                  <span className="text-sm font-medium text-placeholder-gray">
                    DpCode
                  </span>
                </div>

                <div className="flex-1 min-w-[120px] h-10 pr-6 flex items-center">
                  <span className="text-sm font-medium text-placeholder-gray">
                    {
                      month.months[
                      lastMonth.toString() as keyof typeof month.months
                      ]
                    }
                  </span>
                </div>
                <div className="flex-1 min-w-[100px] h-10 pr-6 flex items-center ">
                  <span className="text-sm font-medium text-placeholder-gray">
                    {
                      month.months[
                      lastSecondMonth.toString() as keyof typeof month.months
                      ]
                    }
                  </span>
                </div>

                <div className="flex-1 min-w-[100px] h-10 pr-6 flex items-center ">
                  <span className="text-sm font-medium text-placeholder-gray">
                    variance
                  </span>
                </div>
                <div className="flex-1 min-w-[100px] h-10 pr-6 flex items-center ">
                  <span className="text-sm font-medium text-placeholder-gray">
                    Market Share
                  </span>
                </div>
                <div className="w-[130px] min-w-[120px] h-10 px-4 flex items-center">
                  <span className="text-sm font-medium text-placeholder-gray">
                    Action
                  </span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-[400px] overflow-y-auto">
              {salesByShop &&
                salesByShop?.map((sale: any, index: number) => (
                  <div
                    key={sale.id || index}
                    className={`flex items-center border-b border-[#E5E5E5] h-[60px] ${index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                      }`}
                  >
                    <div className="flex-1 min-w-[140px] h-[60px] px-4 flex items-center">
                      <span className="text-sm font-normal text-sidebar-foreground leading-none">
                        {sale.shopName}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[100px] h-[60px] px-4 flex items-center">
                      <span className="text-sm font-normal text-sidebar-foreground leading-none">
                        {sale.dpCode}
                      </span>
                    </div>

                    <div className="flex-1 min-w-[120px] h-[60px] px-4 flex items-center">
                      <span className="text-sm font-normal text-sidebar-foreground leading-none">
                        {sale.lastMonth.units}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[110px] h-[60px] px-4 flex items-center">
                      <span className="text-sm font-normal text-sidebar-foreground leading-none">
                        {sale.secondLastMonth.units}
                      </span>
                    </div>
                    <div className="flex-1 min-w-[110px] h-[60px] px-4 flex items-center">
                      {sale.secondLastMonth.units !== 0 ? (
                        (() => {
                          const percentageChange =
                            ((sale.lastMonth.units -
                              sale.secondLastMonth.units) /
                              sale.secondLastMonth.units) *
                            100;
                          const isIncrease = percentageChange >= 0;

                          return (
                            <div
                              className={`flex items-center gap-1 ${isIncrease ? "text-green-600" : "text-red-600"
                                }`}
                            >
                              {isIncrease ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span className="text-sm font-normal leading-none">
                                {isIncrease ? "+" : ""}
                                {percentageChange.toFixed(2)}%
                              </span>
                            </div>
                          );
                        })()
                      ) : (
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">
                          N/A
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-[100px] h-10 pr-6 flex items-center ">
                      <span className="text-sm font-medium text-placeholder-gray">
                        {sale.marketShare}%
                      </span>
                    </div>
                    <div className="w-[130px] min-w-[120px] h-[60px] px-4 flex items-center">
                      <Button
                        variant="outline"
                        onClick={() => openShopModal(sale)}
                        size="sm"
                        className="h-8 px-3 border border-[#E5E5E5] rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      {tableModalOpen && (
        <StaffDetailModal
          salesByShop={skusData}
          shopData={shopData}
          staffData={staffData || []}
          staffOverview={staffOverview}
          handleModal={closeShopModal}
        />
      )}
      {overAllDataModal && (
        <StaffMemberFullDataComparison
          hadnleOverAllStaffData={hadnleOverAllStaffData}
        />
      )}
    </div>
  );
};

function StaffDetailModal({
  salesByShop,
  shopData,
  staffData,
  handleModal,
  staffOverview,
}: {
  salesByShop?: any;
  shopData?: any;
  staffData: any;
  handleModal: any;
  staffOverview: any;
}) {
  const displayValue = (value: any): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "number") return String(value);
    return String(value);
  };

  const formatPeriodDate = (val: any): string => {
    if (!val) return "N/A";
    if (typeof val === "string") {
      if (val.includes("T")) return val.split("T")[0];
      if (val.includes(",")) return val.split(",")[0].trim();
      return val;
    }
    if (typeof val === "object") {
      if (typeof val.formatted === "string") {
        return val.formatted.split(",")[0].trim();
      }
      if (val.date) return String(val.date);
    }
    return String(val);
  };

  const { cards } = staffOverview?.data || {};
  const shopTotalSales = shopData?.totalSales ?? 0;
  const shopReportCount = shopData?.reportCount ?? 0;
  const period = staffData?.period || {};

  const fallbackSkus = [
    {
      skuName: "Simba Wit 330ml Can",
      sizeML: 330,
      brandName: "Simba",
      category: "BEER",
      totalSales: 540,
      reportCount: 14,
      lastReportDate: "26/10/2026",
    },
    {
      skuName: "Simba Light 330ml Can",
      sizeML: 330,
      brandName: "Simba",
      category: "BEER",
      totalSales: 410,
      reportCount: 14,
      lastReportDate: "26/10/2026",
    },
    {
      skuName: "Simba Strong 650ml Bottle",
      sizeML: 650,
      brandName: "Simba",
      category: "BEER",
      totalSales: 320,
      reportCount: 12,
      lastReportDate: "25/10/2026",
    },
    {
      skuName: "Simba Stout 330ml Can",
      sizeML: 330,
      brandName: "Simba",
      category: "BEER",
      totalSales: 150,
      reportCount: 10,
      lastReportDate: "24/10/2026",
    },
  ];

  const skuData =
    salesByShop && salesByShop.length > 0
      ? salesByShop
      : shopData?.skus && shopData.skus.length > 0
      ? shopData.skus
      : fallbackSkus;

  const startDateDisplay = formatPeriodDate(
    cards?.startDate || period?.startDate || "01/10/2026"
  );
  const endDateDisplay = formatPeriodDate(
    cards?.endDate || cards?.lastUpdated || period?.endDate || "26/10/2026"
  );

  return (
    <Modal
      isOpen={true}
      onClose={handleModal}
      title={shopData?.shopName ? `${shopData.shopName} - SKU Details` : "SKU Details"}
    >
      <div className="max-h-[70vh] font-inter overflow-y-auto scrollbar-custom">
        {/* Period */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{startDateDisplay}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">End Date</p>
              <p className="font-medium">{endDateDisplay}</p>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Overall Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Units Sold</p>
              <p className="font-medium text-xl">
                {displayValue(shopTotalSales)}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">Total Visit</p>
              <p className="font-medium text-xl">
                {displayValue(shopReportCount)}
              </p>
            </div>
          </div>
        </div>

        {/* SKU Data Section */}
        {skuData && skuData.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">SKU Details</h3>

            <div className="relative overflow-x-auto border border-gray-200 rounded-lg max-h-[300px] custom-scrollbar">
              <table className="min-w-full divide-y divide-gray-200">
                {/* Table Header */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">
                      SKU Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      Size (ML)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                      Total Sales
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                      Reports
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                      Last Report
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="bg-white divide-y divide-gray-200">
                  {skuData.map((sku: any, index: number) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900 w-[200px]">
                        <div className="line-clamp-2">
                          {displayValue(sku?.skuName)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[100px]">
                        {displayValue(sku?.size ?? sku?.sizeMl ?? sku?.sizeML ?? sku?.size_ml)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[150px]">
                        <div className="line-clamp-2">
                          {displayValue(sku?.brandName)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[150px]">
                        <div className="line-clamp-2">
                          {displayValue(sku?.category)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[120px]">
                        {displayValue(sku?.totalSales)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[100px]">
                        {displayValue(sku?.reportCount)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-[150px]">
                        {sku?.lastReportDate && sku.lastReportDate !== "N/A"
                          ? (typeof sku.lastReportDate === "string" && sku.lastReportDate.includes("/")
                              ? sku.lastReportDate
                              : formatDayLabel(sku.lastReportDate))
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No SKU Data Message */}
        {(!skuData || skuData.length === 0) && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No SKU data available</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
function StaffMemberFullDataComparison({
  hadnleOverAllStaffData,
}: {
  hadnleOverAllStaffData: () => void;
}) {
  return (
    <Modal isOpen={true} onClose={hadnleOverAllStaffData} title={`Comparison`}>
      <div className="max-h-[70vh] font-inter overflow-y-auto scrollbar-custom">
        <Suspense fallback={<DonutChartSkeleton />}>
          <DonutChart />
        </Suspense>
      </div>
    </Modal>
  );
}
