"use client";

import React, { useState, useEffect, useMemo, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from "@/utils/formatDateDDMMYYY";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Filter,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { ExtraInformation } from "@/common/extraInformation";
import { Eye } from "lucide-react";
import { X, AlertCircle } from "lucide-react";
import { showToast } from "../ui/toast";
import {
  useFetchDailyReportTableData,
  fetchExportDailyReportTableData,
} from "@/hooks/api/useDailySalesTable";
import { ExportReportsButton } from "@/components/ui/export-reports-button";

// Data types
export interface SalesReportRow {
  id: string;
  shopId?: string;
  storeName: string;
  uploadedBy: { name: string; avatar?: string };
  uploadDate: string;
}

interface SalesReportRowWithDetails extends SalesReportRow {
  detailedData?: {
    rows?: Array<{
      skuId: string;
      segment: string;
      category: string;
      size: string;
      sales: number;
      closing: number;
      availability: boolean;
      breakage: number;
      demand: number;
      notes?: string;
    }>;
  };
}

interface DetailedReportData {
  id: string;
  storeName: string;
  uploadedBy: { name: string; avatar?: string };
  uploadDate: string;
  data?: {
    sales?: {
      totalSales: number;
      transactionCount: number;
      averageTransaction: number;
      topProducts: Array<{
        skuId: string;
        name: string;
        quantity: number;
        revenue: number;
      }>;
    };
    stock?: {
      totalItems: number;
      lowStockCount: number;
      overstockCount: number;
      stockValue: number;
      turnoverRate: number;
    };
    performance?: {
      efficiency: number;
      customerSatisfaction: number;
      staffProductivity: number;
      complianceScore: number;
    };
    meta?: {
      shopId: string;
      reportDate: string;
      lastUpdatedAt: string;
      totalItems: number;
    };
    rows?: Array<{
      skuId: string;
      segment: string;
      category: string;
      size: string;
      sales: number;
      closing: number;
      availability: boolean;
      breakage: number;
      demand: number;
      notes?: string;
    }>;
  };
  insights: string[];
  alerts: string[];
}

interface DailySalesReportProps {
  heading?: string;
  data?: SalesReportRow[];
  onView?: (row: SalesReportRow) => void;
  onDownload?: (row: SalesReportRow) => void;
  onShare?: (row: SalesReportRow) => void;
  itemsPerPage?: number;
  showPagination?: boolean;
  searchTerm?: string;
  selectedLocation?: string;
  extraInformation?: string;
  showDateFilter?: boolean;
  showTodayOnly?: boolean;
}

interface DailySalesReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportData: SalesReportRow;
}

function DailySalesReportModal({
  isOpen,
  onClose,
  reportId,
  reportData,
}: DailySalesReportModalProps) {
  const [detailedData, setDetailedData] = useState<DetailedReportData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fetch detailed report data when modal opens
  useEffect(() => {
    if (isOpen && reportId) {
      fetchDetailedReport();
    }
  }, [isOpen, reportId]);

  const fetchDetailedReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://3.91.17.245:4000";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;

      // Convert AWS format (MM/dd/yyyy) to required format (dd/MM/yyyy)
      // When on local, comment this block out
      let dateForAPI = reportData.uploadDate;
      const dateMatch = reportData.uploadDate.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );
      if (dateMatch) {
        const [, first, second, year] = dateMatch;
        // Swap month and day: MM/dd/yyyy -> dd/MM/yyyy
        dateForAPI = `${second}/${first}/${year}`;
      }
      const date = dateForAPI;
      const response = await fetch(
        `${API_BASE_URL}/api/seller/report/daily?shopId=${reportData?.shopId}&reportDate=${date}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch detailed report");
      }

      const data = await response.json();
      setDetailedData(data);
    } catch (err) {
      console.error("Error fetching detailed report:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch detailed report"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="font-inter text-xl font-semibold text-gray-900">
              Daily Sales Report Details
            </h2>
            <p className="font-inter text-sm text-gray-600 mt-1">
              Store: {reportData.storeName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading report details...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-red-600">{error}</span>
            </div>
          )}

          {detailedData && detailedData.data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-600">
                    Total Items
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {detailedData.data.meta?.totalItems || 0}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-600">
                    Total Sales
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {detailedData.data.rows?.reduce(
                      (sum, item) => sum + (item.sales || 0),
                      0
                    ) || 0}
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-orange-600">
                    Total Breakage
                  </div>
                  <div className="text-2xl font-bold text-orange-900">
                    {detailedData.data.rows?.reduce(
                      (sum, item) => sum + (item.breakage || 0),
                      0
                    ) || 0}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-600">
                    Total Demand
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {detailedData.data.rows?.reduce(
                      (sum, item) => sum + (item.demand || 0),
                      0
                    ) || 0}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Product Details
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Closing Stock
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Breakage
                        </th>
                        <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Demand
                        </th>
                        <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] max-w-[200px]">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white relative divide-y divide-gray-200">
                      {detailedData.data.rows?.map((item, index) => {
                        const notes = item.notes || "";
                        const truncatedNotes =
                          notes.length > 100
                            ? notes.substring(0, 100) + "..."
                            : notes;
                        const hasLongNotes = notes.length > 100;

                        return (
                          <tr
                            key={item.skuId}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-4 md:px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 break-words">
                                {item.segment}
                              </div>
                              <div className="text-xs text-gray-500 break-words">
                                SKU: {item.skuId.slice(0, 8)}...
                              </div>
                            </td>
                            <td className="px-4 md:px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 break-words">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-900 break-words">
                              {item.size}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              <span
                                className={`font-medium ${item.sales > 0
                                  ? "text-green-600"
                                  : "text-gray-500"
                                  }`}
                              >
                                {item.sales || 0}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              <span
                                className={`font-medium ${item.closing > 0
                                  ? "text-blue-600"
                                  : "text-gray-500"
                                  }`}
                              >
                                {item.closing || 0}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              <span
                                className={`font-medium ${item.breakage > 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                                  }`}
                              >
                                {item.breakage || 0}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              <span
                                className={`font-medium ${item.demand > 0
                                  ? "text-purple-600"
                                  : "text-gray-500"
                                  }`}
                              >
                                {item.demand || 0}
                              </span>
                            </td>
                            <td className="px-4 md:px-6 py-4 text-sm text-gray-900 text-left">
                              {notes ? (
                                <div className="group relative">
                                  <div className="whitespace-normal text-xs font-medium text-gray-700 line-clamp-2 max-w-[360px] break-words">
                                    {truncatedNotes}
                                  </div>
                                  {hasLongNotes && (
                                    <div className="absolute left-0 top-full mt-1 z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[300px] break-words">
                                      <div className="whitespace-normal">
                                        {notes}
                                      </div>
                                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Meta Information */}
              {detailedData.data.meta && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Report Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">
                        Uploaded By:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {reportData?.uploadedBy?.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Report Date:
                      </span>
                      <span className="ml-2 text-gray-900">
                        {detailedData.data.meta.reportDate}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const DailySalesReport: React.FC<DailySalesReportProps> = ({
  heading,
  itemsPerPage = 5,
  showPagination = true,
  selectedLocation,
  extraInformation,
  showDateFilter = true,
  showTodayOnly = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [salespersonFilter, setSalespersonFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [apiData, setApiData] = useState<SalesReportRow[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SalesReportRow | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);

  const [salespersonOptions, setSalespersonOptions] = useState<
    { value: string; label: string }[]
  >([]);

  // Add debounced search value
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Reset to page 1 when filters change (but not when currentPage changes)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, salespersonFilter, dateFilter]);

  // Calculate query parameters
  const queryParams = useMemo(() => {
    const limit = itemsPerPage;
    const offset = (currentPage - 1) * itemsPerPage;

    const params: any = {
      limit,
      offset,
    };

    // Use debouncedSearch instead of searchValue
    if (debouncedSearch) params.searchTerm = debouncedSearch;
    if (salespersonFilter && salespersonFilter !== "all")
      params.reported_by = salespersonFilter;

    // Calculate startDate and endDate based on filter
    const endDate = new Date();
    const startDate = new Date();

    if (showTodayOnly) {
      // When showTodayOnly is true, set both startDate and endDate to today
      startDate.setDate(endDate.getDate());
      endDate.setDate(endDate.getDate());
      params.startDate = formatDateToDDMMYYYY(startDate);
      params.endDate = formatDateToDDMMYYYY(endDate);
    } else if (!showDateFilter) {
      // When showDateFilter is false, pass today as startDate and tomorrow as endDate
      startDate.setDate(endDate.getDate());
      endDate.setDate(endDate.getDate() + 1); // Tomorrow (kal)
      params.startDate = formatDateToDDMMYYYY(startDate);
      params.endDate = formatDateToDDMMYYYY(endDate);
    } else {
      // When showDateFilter is true, use the dateFilter dropdown
      if (dateFilter && dateFilter !== "all") {
        switch (dateFilter) {
          case "today":
            startDate.setDate(endDate.getDate());
            break;
          case "week":
            startDate.setDate(endDate.getDate() - 7);
            break;
          case "2weeks":
            startDate.setDate(endDate.getDate() - 14);
            break;
          case "3weeks":
            startDate.setDate(endDate.getDate() - 21);
            break;
          case "month":
            startDate.setDate(endDate.getDate() - 30);
            break;
          case "2months":
            startDate.setDate(endDate.getDate() - 60);
            break;
        }
        params.startDate = formatDateToDDMMYYYY(startDate);
        params.endDate = formatDateToDDMMYYYY(endDate);
      }
    }

    return params;
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearch,
    salespersonFilter,
    dateFilter,
    showDateFilter,
    showTodayOnly,
  ]);

  // Fetch data using custom hook
  const { data, isLoading, error } = useFetchDailyReportTableData(queryParams);

  // Update state when data changes
  useEffect(() => {
    if (data) {
      const reportedBy = Array.isArray(data?.reported_by)
        ? [
          { value: "all", label: "All Sellers" },
          ...data.reported_by.map((u: any) => ({
            value: u.id,
            label: u.name,
          })),
        ]
        : [{ value: "all", label: "All Sellers" }];
      setSalespersonOptions(reportedBy);
      setApiData(data?.reports || []);
      if (typeof data?.total === "number") setServerTotal(data.total);
      if (data?.pagination?.totalPages)
        setServerTotalPages(data.pagination.totalPages);
      // DO NOT set currentPage from API response - keep it controlled by user clicks
    }
  }, [data]);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Helper function to get name from various possible fields
      const getName = (report: any): string => {
        if (!report) return "Unknown";
        return (
          report.first_name ||
          report.fullName ||
          report.full_name ||
          report.full_Name ||
          report.name ||
          "Unknown"
        );
      };

      // Helper function to escape CSV values and handle special characters
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return "";
        const str = String(value);
        // Escape double quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() - 1);

      const startDate = formatDateToYYYYMMDD(today);
      const endDate = formatDateToYYYYMMDD(tomorrow);

      const response = showTodayOnly
        ? await fetchExportDailyReportTableData(startDate, startDate)
        : await fetchExportDailyReportTableData();
      // const response = await fetchExportDailyReportTableData()

      let dataToExport: any[] = [];
      if (Array.isArray(response)) {
        dataToExport = response;
      } else if (response?.data && Array.isArray(response.data)) {
        dataToExport = response.data;
      } else if (response?.reports && Array.isArray(response.reports)) {
        dataToExport = response.reports;
      } else if (response) {
        // Try to find any array in the response
        const keys = Object.keys(response);
        for (const key of keys) {
          if (Array.isArray(response[key])) {
            dataToExport = response[key];
            break;
          }
        }
      }

      if (dataToExport.length === 0) {
        showToast("error", "No data to export.");
        return;
      }

      // Show progress message for large datasets
      if (dataToExport.length > 10000) {
        showToast(
          "info",
          `Processing ${dataToExport.length} records... Please wait.`
        );
      }

      // Create CSV content with the new response structure
      const csvHeaders = [
        "Name",
        "Shop Name",
        "Product Name",
        "Size (ML)",
        "Report Date",
        "Closing Stock",
        "Breakage",
        "Sales Stock",
        "Demand",
      ];

      // Optimize for large datasets: use array join instead of string concatenation
      const csvParts: string[] = [];

      // Add header row
      csvParts.push(csvHeaders.join(","));

      // Process data in chunks to avoid blocking the main thread
      const CHUNK_SIZE = 5000;
      const totalChunks = Math.ceil(dataToExport.length / CHUNK_SIZE);

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, dataToExport.length);
        const chunk = dataToExport.slice(start, end);

        // Process chunk with safety checks
        const chunkRows = chunk
          .map((report: any) => {
            if (!report) return "";
            return [
              escapeCSV(getName(report)),
              escapeCSV(report?.shop_name),
              escapeCSV(report?.product_name),
              escapeCSV(report?.size_ml),
              escapeCSV(report?.report_date),
              escapeCSV(report?.closing_stock),
              escapeCSV(report?.breakage),
              escapeCSV(report?.sales_stock),
              escapeCSV(report?.demand),
            ].join(",");
          })
          .filter((row) => row !== ""); // Remove empty rows

        csvParts.push(...chunkRows);

        // Allow UI to update between chunks for very large datasets
        if (chunkIndex > 0 && chunkIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      // Create and download CSV file
      const csvContent = csvParts.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

      // Clean up memory for large datasets
      csvParts.length = 0;

      const link = document.createElement("a");

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);

        // Generate filename with current date and date range
        const exportDate = new Date().toISOString().split("T")[0];
        const dateRange =
          queryParams?.startDate && queryParams?.endDate
            ? `${queryParams.startDate}_to_${queryParams.endDate}`
            : "all_data";
        const filename = `daily_sales_report_${dateRange}_${exportDate}.csv`;

        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Revoke object URL to free memory
        setTimeout(() => URL.revokeObjectURL(url), 100);

        // Show success message
        showToast(
          "success",
          `Export completed! Downloaded ${dataToExport.length.toLocaleString()} reports.`
        );
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast(
        "error",
        `Error exporting data: ${errorMessage}. Please try again.`
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Server-side filtered & paginated data
  const filteredData = apiData;
  const totalPages = serverTotalPages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + Math.min(itemsPerPage, apiData.length);
  const currentData = apiData;

  const getUploadedByAvatar = (uploadedBy: SalesReportRow["uploadedBy"]) => {
    if (!uploadedBy || !uploadedBy.name) {
      return (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-tertiary-color rounded-full flex items-center justify-center overflow-hidden">
            <span className="text-sm font-medium text-sidebar-foreground">
              ?
            </span>
          </div>
          <span className="text-sm font-medium text-sidebar-foreground">
            Unknown
          </span>
        </div>
      );
    }

    const initials = uploadedBy.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-tertiary-color rounded-full flex items-center justify-center overflow-hidden">
          {uploadedBy.avatar ? (
            <Image
              src={uploadedBy.avatar}
              alt={uploadedBy.name}
              width={32}
              height={32}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-sm font-medium text-sidebar-foreground">
              {initials}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-sidebar-foreground">
          {uploadedBy.name}
        </span>
      </div>
    );
  };

  const handlePageChange = (page: number) =>
    page >= 1 && page <= totalPages && setCurrentPage(page);

  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);

    switch (filterType) {
      case "shop":
        setShopFilter(value);
        break;
      case "salesperson":
        setSalespersonFilter(value);
        break;
      case "date":
        setDateFilter(value);
        break;
    }

    if (value === "all") {
      setActiveFilters((prev) =>
        prev.filter((f) => {
          if (filterType === "salesperson") {
            return !salespersonOptions.some(
              (opt) => opt.label === f && opt.value !== "all"
            );
          }
          if (filterType === "date") {
            return (
              f !== "Today" &&
              f !== "1 Week" &&
              f !== "2 Weeks" &&
              f !== "3 Weeks" &&
              f !== "This Month" &&
              f !== "Last 2 Months"
            );
          }
          return true;
        })
      );
    } else {
      let filterLabel = value;

      if (filterType === "salesperson") {
        const option = salespersonOptions.find((opt) => opt.value === value);
        if (option) filterLabel = option.label;
      } else if (filterType === "date") {
        if (value === "today") filterLabel = "Today";
        else if (value === "week") filterLabel = "1 Week";
        else if (value === "2weeks") filterLabel = "2 Weeks";
        else if (value === "3weeks") filterLabel = "3 Weeks";
        else if (value === "month") filterLabel = "This Month";
        else if (value === "2months") filterLabel = "Last 2 Months";
      }

      setActiveFilters((prev) => {
        const filtered = prev.filter((f) => {
          if (filterType === "salesperson") {
            return !salespersonOptions.some(
              (opt) => opt.label === f && opt.value !== "all"
            );
          }
          if (filterType === "date") {
            return (
              f !== "Today" &&
              f !== "1 Week" &&
              f !== "2 Weeks" &&
              f !== "3 Weeks" &&
              f !== "This Month" &&
              f !== "Last 2 Months"
            );
          }
          return true;
        });

        return [...filtered, filterLabel];
      });
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter));

    const isSalespersonFilter = salespersonOptions.some(
      (opt) => opt.label === filter && opt.value !== "all"
    );
    const isDateFilter =
      filter === "Today" ||
      filter === "1 Week" ||
      filter === "2 Weeks" ||
      filter === "3 Weeks" ||
      filter === "This Month" ||
      filter === "Last 2 Months";

    if (isSalespersonFilter) setSalespersonFilter("all");
    if (isDateFilter) setDateFilter("all");
  };

  const clearAllFilters: any = () => {
    setActiveFilters([]);
    setShopFilter("all");
    setSalespersonFilter("all");
    setDateFilter("all");
    setSearchValue("");
  };

  const hasActiveFilters =
    shopFilter !== "all" ||
    salespersonFilter !== "all" ||
    dateFilter !== "all" ||
    searchValue;

  const viewUserReport = (row: SalesReportRow) => {
    setSelectedReport(row);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="font-inter bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-4">
        {/* Header */}
        <div className="flex justify-between lg:flex-row flex-col items-start">
          <h2 className="text-base text-left font-semibold text-[#000000]">
            {heading || "Daily Sales Report"}
          </h2>
          <div className="flex justify-between mt-2  w-full md:w-auto lg:items-center gap-2">
            <ExportReportsButton
              onClick={() => handleExport()}
              isLoading={isExporting}
              disabled={isExporting}
              size="md"
            />
            {extraInformation && (
              <ExtraInformation
                extraInformation={extraInformation}
                tooltipOpen={isTooltipOpen}
                setTooltipOpen={setIsTooltipOpen}
              />
            )}
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col gap-2 mt-4 lg:mb-4">
          <div className="flex justify-start items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
              <Input
                placeholder="Search by shop or product..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => setSearchValue(searchValue.trimStart())}
                className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              <Select
                value={salespersonFilter}
                onValueChange={(value) =>
                  handleFilterChange("salesperson", value)
                }
              >
                <SelectTrigger className="min-w-[109px] min-h h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {salespersonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {showDateFilter && (
                <Select
                  value={dateFilter}
                  onValueChange={(value) => handleFilterChange("date", value)}
                >
                  <SelectTrigger className="min-w-[100px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="today">1 Day</SelectItem>
                    <SelectItem value="week">1 Week</SelectItem>
                    <SelectItem value="2weeks">2 Weeks</SelectItem>
                    <SelectItem value="3weeks">3 Weeks</SelectItem>
                    <SelectItem value="month">1 Month</SelectItem>
                    <SelectItem value="2months">2 Months</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 border border-[#E5E5E5] rounded-lg shadow-sm"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {activeFilters.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <div className="p-2 space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Seller
                      </label>
                      <Select
                        value={salespersonFilter}
                        onValueChange={(value) =>
                          handleFilterChange("salesperson", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 border border-[#E5E5E5] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {salespersonOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium mb-1 block">
                        Date
                      </label>
                      <Select
                        value={dateFilter}
                        onValueChange={(value) =>
                          handleFilterChange("date", value)
                        }
                      >
                        <SelectTrigger className="w-full h-9 border border-[#E5E5E5] rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="today">1 Day</SelectItem>
                          <SelectItem value="week">1 Week</SelectItem>
                          <SelectItem value="2weeks">2 Weeks</SelectItem>
                          <SelectItem value="3weeks">3 Weeks</SelectItem>
                          <SelectItem value="month">1 Month</SelectItem>
                          <SelectItem value="2months">2 Months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    className="bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {filter}
                    <button
                      onClick={() => removeFilter(filter)}
                      className="ml-1 hover:text-red-700 cursor-pointer"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="h-8 px-3 bg-tertiary-color text-sidebar-foreground border border-[#E5E5E5] rounded-lg shadow-sm hover:bg-gray-50 flex-shrink-0 cursor"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="border border-[#E5E5E5] rounded-lg overflow-hidden mt-4 lg:mt-0">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="bg-tertiary-color border-b border-[#E5E5E5]">
                <div className="flex">
                  {/* <div className="w-[38px] h-10 flex items-center justify-center pl-3">
                    <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className="w-4 h-4 border-[#E5E5E5] rounded shadow-sm" />
                  </div> */}
                  <div className="flex-1 min-w-[120px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">
                      Store Name
                    </span>
                  </div>
                  <div className="flex-1 min-w-[150px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray">
                      Uploaded By
                    </span>
                  </div>
                  <div className="w-[149px] min-w-[120px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray">
                      Upload Date
                    </span>
                  </div>
                  <div className="w-[149px] min-w-[120px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray">
                      Action
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="h-[300px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm text-gray-500">
                        Loading data...
                      </span>
                    </div>
                  </div>
                ) : currentData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                      <div className="text-center">
                        <p className="text-base font-medium text-gray-700">
                          No data available
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Try adjusting your filters or check back later
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentData.map((row, index) => (
                    <div
                      key={row.id}
                      className={`flex items-center border-b border-[#E5E5E5] h-[60px] ${index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                        }`}
                    >
                      {/* <div className="w-[38px] h-[60px] flex items-center justify-center pl-3">
                          <Checkbox
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                            className="w-4 h-4 border-[#E5E5E5] rounded shadow-sm"
                          />
                        </div> */}
                      <div className="flex-1 min-w-[120px] h-[60px] px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none break-words">
                          {row.storeName}
                        </span>
                      </div>
                      <div className="flex-1 min-w-[150px] h-[60px] px-2 flex items-center">
                        {getUploadedByAvatar(row.uploadedBy)}
                      </div>
                      <div className="w-[149px] min-w-[120px] h-[60px] px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">
                          {row.uploadDate}
                        </span>
                      </div>
                      <div className="w-[149px] min-w-[120px] h-[60px] px-2 flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewUserReport(row)}
                          className="h-8 px-3 border border-[#E5E5E5] rounded-lg shadow-sm hover:bg-gray-50 shrink-0 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {showPagination && serverTotal > 0 && currentData.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-between items-center mt-2 gap-4">
            <div className="text-sm sm:text-base font-normal text-black text-center lg:text-left">
              Displaying {startIndex + 1} to {Math.min(endIndex, serverTotal)}{" "}
              of {serverTotal} records
            </div>

            {/* Mobile Pagination - Only Previous, Current Page, Next */}
            <div className="lg:hidden flex items-center gap-2 w-full justify-center">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sidebar-foreground hover:text-sidebar-foreground border border-[#E5E5E5]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Current Page Display */}
              <div className="min-w-[40px] h-9 flex items-center justify-center rounded-lg bg-white text-sidebar-foreground border border-[#E5E5E5] shadow-sm px-3">
                <span className="text-sm font-medium">{currentPage}</span>
              </div>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-4 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sidebar-foreground hover:text-sidebar-foreground border border-[#E5E5E5]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Desktop Pagination - Max 5 page buttons with Prev/Next */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Previous Button - Fixed Position */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sidebar-foreground hover:text-sidebar-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              {/* Page Numbers - Max 5 buttons */}
              {(() => {
                const MAX_PAGE_BUTTONS = 5;
                const pages: number[] = [];

                if (totalPages <= MAX_PAGE_BUTTONS) {
                  // Show all pages if total pages is 5 or less
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Calculate the range of pages to show (max 5 pages)
                  let startPage: number;
                  let endPage: number;

                  if (currentPage <= 3) {
                    // Near the beginning: show pages 1-5
                    startPage = 1;
                    endPage = MAX_PAGE_BUTTONS;
                  } else if (currentPage >= totalPages - 2) {
                    // Near the end: show last 5 pages
                    startPage = totalPages - MAX_PAGE_BUTTONS + 1;
                    endPage = totalPages;
                  } else {
                    // In the middle: show 2 pages before and 2 pages after current
                    startPage = currentPage - 2;
                    endPage = currentPage + 2;
                  }

                  // Generate page numbers
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(i);
                  }
                }

                return pages.map((page) => {
                  const isCurrentPage = page === currentPage;
                  return (
                    <Button
                      key={page}
                      variant={isCurrentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-lg ${isCurrentPage
                        ? "bg-white text-sidebar-foreground border border-[#E5E5E5] shadow-sm"
                        : "hover:bg-gray-50 text-sidebar-foreground"
                        }`}
                    >
                      {page}
                    </Button>
                  );
                });
              })()}

              {/* Next Button - Fixed Position */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 px-4 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-sidebar-foreground hover:text-sidebar-foreground"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Note */}
        {/* <div className="mt-6 bg-[#FEFCE8] border border-[#FEF08A] rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-[#CA8A04] flex-shrink-0 mt-0.5" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-sm sm:text-base font-semibold text-[#CA8A04] flex-shrink-0">Note:</span>
              <span className="text-xs sm:text-sm font-normal text-[#CA8A04] leading-relaxed">
                The data displayed in this dashboard reflects user uploads completed yesterday, up to 2:00 AM.
              </span>
            </div>
          </div>
        </div> */}
      </div>
      {/* Daily Sales Report Modal */}
      <DailySalesReportModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
        reportId={selectedReport?.id || ""}
        reportData={selectedReport || ({} as SalesReportRow)}
      />
    </div>
  );
};
