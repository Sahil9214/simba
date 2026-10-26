"use client";
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { FileRow } from "@/lib/types/legacy";
import { Status } from "@/lib/types/legacy/table";
import { FILES_CONSTANT } from "@/lib/constants";
import {
  Eye,
  Trash2,
  FileText,
  FileSpreadsheet,
  FileImage,
  Search,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  CheckCircle2,
  XCircle,
  Sun,
} from "lucide-react";
import { ChartHeadings } from "@/common/chartHeadings";
import { ExtraInformation } from "@/common/extraInformation";

interface UploadCentreTableProps {
  data?: FileRow[];
  onView?: (file: FileRow) => void;
  onDownload?: (file: FileRow) => void;
  onDelete?: (file: FileRow) => void;
  itemsPerPage?: number;
  showPagination?: boolean;
  placeholder?: string;
  extraInfomation?: string;
  col1?: string;
  col2?: string;
  col3?: string;
  col4?: string;
  col5?: string;
  col6?: string;
  searchTerm?: string;
  selectedLocation?: string;
  heading?: string | undefined;
  switchForTheTablesProductName?: boolean;
  onDateRangeChange?: (
    startDate: string | null,
    endDate: string | null
  ) => void;
}

type SortField = "name" | "type" | "role" | "date" | "status";
type SortDirection = "asc" | "desc";

export const UploadCentreTable: React.FC<UploadCentreTableProps> = ({
  data = FILES_CONSTANT,
  onView,
  onDownload,
  onDelete,
  itemsPerPage = 5,
  showPagination = true,
  placeholder = "Search by seller,product...",
  extraInfomation,
  col1,
  col2,
  col3,
  col4,
  col5,
  col6,
  heading,
  onDateRangeChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setsearchValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [fileTypeFilter, setFileTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // REMOVE isPaginating state - it's not needed

  // Define filter options for proper display
  const fileTypeOptions = [
    { value: "all", label: "File Types" },
    { value: "xlsx", label: "Excel" },
    { value: "pdf", label: "PDF" },
  ];

  const statusOptions = [
    { value: "all", label: "By Status" },
    { value: "processed", label: "Processed" },
    { value: "processing", label: "Processing" },
    // { value: "cancelled", label: "cancelled" },
  ];

  const dateRangeOptions = [
    { value: "all", label: "Date Range" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
  ];

  // Track previous filter values to detect actual changes
  const prevFiltersRef = useRef({
    searchValue: "",
    fileTypeFilter: "all",
    statusFilter: "all",
    dateRangeFilter: "all",
    sortField: null as SortField | null,
    sortDirection: "asc" as SortDirection,
  });

  // Reset current page to 1 ONLY when filters change (not when page changes)
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasFilterChanged =
      prev.searchValue !== searchValue ||
      prev.fileTypeFilter !== fileTypeFilter ||
      prev.statusFilter !== statusFilter ||
      prev.dateRangeFilter !== dateRangeFilter ||
      prev.sortField !== sortField ||
      prev.sortDirection !== sortDirection;

    if (hasFilterChanged && currentPage !== 1) {
      setCurrentPage(1);
    }

    // Update previous values
    prevFiltersRef.current = {
      searchValue,
      fileTypeFilter,
      statusFilter,
      dateRangeFilter,
      sortField,
      sortDirection,
    };
  }, [
    searchValue,
    fileTypeFilter,
    statusFilter,
    dateRangeFilter,
    sortField,
    sortDirection,
  ]);

  // Notify parent component of date range changes for backend filtering
  useEffect(() => {
    if (!onDateRangeChange) return;

    if (dateRangeFilter === "all") {
      onDateRangeChange(null, null);
      return;
    }

    const now = new Date();
    const endDate = now.toISOString().split("T")[0]; // Today in YYYY-MM-DD format
    let startDate: string;

    switch (dateRangeFilter) {
      case "today":
        startDate = endDate; // Same as end date
        break;
      case "week":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split("T")[0];
        break;
      default:
        onDateRangeChange(null, null);
        return;
    }

    onDateRangeChange(startDate, endDate);
  }, [dateRangeFilter, onDateRangeChange]);

  // Efficient filtering and sorting using useMemo
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.role.toLowerCase().includes(searchLower) ||
          file.country.toLowerCase().includes(searchLower) ||
          file.type.toLowerCase().includes(searchLower)
      );
    }

    // Apply file type filter
    if (fileTypeFilter !== "all") {
      const typeMap: { [key: string]: string } = {
        xlsx: "Excel File",
        word: "Word Document",
        pdf: "PDF File",
      };
      const extensionMap: { [key: string]: string[] } = {
        xlsx: [".xlsx", ".xls"],
        word: [".doc", ".docx"],
        pdf: [".pdf"],
      };
      const expectedType = typeMap[fileTypeFilter];
      const expectedExtensions = extensionMap[fileTypeFilter] || [];

      filtered = filtered.filter((file) => {
        // Check if file.type matches
        if (file.type === expectedType) {
          return true;
        }
        // Also check file extension in filename as fallback
        const fileName = file.name.toLowerCase();
        return expectedExtensions.some((ext) =>
          fileName.endsWith(ext.toLowerCase())
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const statusMap: { [key: string]: Status } = {
        processed: "Processed",
        processing: "Processing",
        cancelled: "cancelled",
      };
      filtered = filtered.filter(
        (file) => file.status === statusMap[statusFilter]
      );
    }

    // Apply date range filter
    if (dateRangeFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((file) => {
        const fileDate = new Date(file.date.split("/").reverse().join("-"));

        switch (dateRangeFilter) {
          case "today":
            return fileDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return fileDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return fileDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortField];
        let bValue: any = b[sortField];

        // Handle date sorting
        if (sortField === "date") {
          aValue = new Date(a.date.split("/").reverse().join("-"));
          bValue = new Date(b.date.split("/").reverse().join("-"));
        }

        // Handle string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    data,
    searchValue,
    fileTypeFilter,
    statusFilter,
    dateRangeFilter,
    sortField,
    sortDirection,
  ]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "Processed":
        return (
          <Badge className="bg-[#22C55E] text-white hover:bg-[#22C55E] px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </Badge>
        );
      case "Processing":
        return (
          <Badge className="bg-[#EAB308] text-white hover:bg-[#EAB308] px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <Sun className="w-3 h-3" />
            {status}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-[#EF4444] text-white hover:bg-[#EF4444] px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            {status}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="px-2 py-1 rounded-lg text-xs font-semibold"
          >
            {status}
          </Badge>
        );
    }
  };

  const getFileTypeBadge = (type: string) => {
    switch (type) {
      case "Excel File":
        return (
          <Badge className="bg-tertiary-color text-charcoal-black hover:bg-tertiary-color px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-[#EA580C]" />
            {type}
          </Badge>
        );
      case "Word Document":
        return (
          <Badge className="bg-tertiary-color text-charcoal-black hover:bg-tertiary-color px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <FileText className="w-3 h-3 text-[#2B579A]" />
            {type}
          </Badge>
        );
      case "PDF File":
        return (
          <Badge className="bg-tertiary-color text-charcoal-black hover:bg-tertiary-color px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <FileImage className="w-3 h-3 text-[#DC2626]" />
            {type}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-tertiary-color text-charcoal-black hover:bg-tertiary-color px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <FileText className="w-3 h-3 text-[#6B7280]" />
            {type}
          </Badge>
        );
    }
  };

  const getUploadedByAvatar = (country: string, role: string) => {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-tertiary-color rounded-full flex items-center justify-center">
          <span className="text-sm font-normal text-sidebar-foreground">
            {country}
          </span>
        </div>
        <span className="text-sm font-medium text-sidebar-foreground">
          {role}
        </span>
      </div>
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // const handleFilterChange = (
  //   filterType: "fileType" | "status" | "dateRange",
  //   value: string
  // ) => {
  //   switch (filterType) {
  //     case "fileType":
  //       setFileTypeFilter(value);
  //       break;
  //     case "status":
  //       setStatusFilter(value);
  //       break;
  //     case "dateRange":
  //       setDateRangeFilter(value);
  //       break;
  //   }
  // };

  const removeFilter = (
    type: "fileType" | "status" | "dateRange" | "search"
  ) => {
    if (type === "fileType") setFileTypeFilter("all");
    if (type === "status") setStatusFilter("all");
    if (type === "dateRange") setDateRangeFilter("all");
    if (type === "search") setsearchValue("");
  };

  const clearAllFilters = () => {
    setFileTypeFilter("all");
    setStatusFilter("all");
    setDateRangeFilter("all");
    setsearchValue("");
    setSortField(null);
    setSortDirection("asc");
  };

  // Handler for date range filter change to prevent page refresh
  const handleDateRangeChange = useCallback((value: string) => {
    setDateRangeFilter(value);
  }, []);

  // Handler to prevent form submission when clicking on Select
  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Derive active filter badges for display (excluding search as requested)
  const displayedFilterBadges = useMemo(() => {
    const badges: {
      label: string;
      type: "fileType" | "status" | "dateRange";
      value: string;
    }[] = [];

    if (fileTypeFilter !== "all") {
      const fileTypeLabel = fileTypeOptions.find(
        (opt) => opt.value === fileTypeFilter
      )?.label;
      if (fileTypeLabel && fileTypeLabel !== "File Types") {
        badges.push({
          label: `Type: ${fileTypeLabel}`,
          type: "fileType",
          value: fileTypeFilter,
        });
      }
    }
    if (statusFilter !== "all") {
      const statusLabel = statusOptions.find(
        (opt) => opt.value === statusFilter
      )?.label;
      if (statusLabel && statusLabel !== "By Status") {
        badges.push({
          label: `Status: ${statusLabel}`,
          type: "status",
          value: statusFilter,
        });
      }
    }
    if (dateRangeFilter !== "all") {
      const dateLabel = dateRangeOptions.find(
        (opt) => opt.value === dateRangeFilter
      )?.label;
      if (dateLabel && dateLabel !== "Date Range") {
        badges.push({
          label: `Date: ${dateLabel}`,
          type: "dateRange",
          value: dateRangeFilter,
        });
      }
    }
    return badges;
  }, [fileTypeFilter, statusFilter, dateRangeFilter]);

  const hasActiveFilters =
    displayedFilterBadges.length > 0 || sortField !== null;

  return (
    <div className="w-full bg-white font-inter border border-[rgba(0,0,0,0.1)] rounded-[12.75px] p-4 space-y-4">
      <ChartHeadings heading={heading || ""} />
      {/* Filters: responsive with mobile dropdown */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => setsearchValue(e.target.value)}
              onBlur={() => setsearchValue(searchValue.trimStart())}
              className="font-inter font-normal h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5] w-full sm:w-[220px]"
            />
          </div>

          {/* Mobile/Tablet Filter Dropdown */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 border border-[#E5E5E5] rounded-lg shadow-sm"
                >
                  <Ellipsis className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      File Type
                    </label>
                    <Select
                      value={fileTypeFilter}
                      onValueChange={setFileTypeFilter}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">File Types</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Status
                    </label>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">By Status</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        {/* <SelectItem value="cancelled">cancelled</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">
                      Date Range
                    </label>
                    <Select
                      value={dateRangeFilter}
                      onValueChange={handleDateRangeChange}
                    >
                      <SelectTrigger className="w-full h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Date Range</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex items-center gap-2">
            {/* File Type Filter */}
            <div className="w-[124px]">
              <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                <SelectTrigger className="w-full font-inter font-medium h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">File Types</SelectItem>
                  <SelectItem value="xlsx">Excel</SelectItem>
                  <SelectItem value="word">Word</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-[124px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full font-inter font-medium h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">By Status</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  {/* <SelectItem value="cancelled">cancelled</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="w-[144px]">
              <Select
                value={dateRangeFilter}
                onValueChange={handleDateRangeChange}
              >
                <SelectTrigger className="w-full font-inter font-medium h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Date Range</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {extraInfomation && (
          <ExtraInformation
            extraInformation={extraInfomation}
            tooltipOpen={isTooltipOpen}
            setTooltipOpen={setIsTooltipOpen}
            // uploadCentreTable={true}
          />
        )}

        {/* <div className="w-full sm:w-auto flex items-center justify-end">
            <Button className="h-9 px-2 sm:px-4 bg-gradient-to-b from-[#FF4250] to-[#D73742] text-white rounded-lg shadow-sm hover:opacity-90 w-full sm:w-auto">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div> */}
      </div>

      {/* Active Filters and Clear All */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          {/* Left side - Active Filter Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {displayedFilterBadges.map((badge) => (
              <Badge
                key={`${badge.type}-${badge.value}`}
                variant="outline"
                className="px-2 py-1 text-xs bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] rounded-lg"
              >
                {badge.label}
                <button
                  onClick={() => removeFilter(badge.type)}
                  aria-label={`Remove ${badge.label} filter`}
                  title={`Remove ${badge.label} filter`}
                  className="ml-1 hover:text-red-700 cursor-pointer"
                >
                  ×
                </button>
              </Badge>
            ))}
            {sortField && (
              <Badge
                variant="outline"
                className="px-2 py-1 text-xs bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] rounded-lg"
              >
                Sort: {sortField} ({sortDirection})
                <button
                  onClick={() => {
                    setSortField(null);
                    setSortDirection("asc");
                  }}
                  className="ml-1 hover:text-red-700"
                  aria-label="close"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>

          {/* Right side - Clear All Button */}
          <div>
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="h-8 px-3 bg-tertiary-color text-sidebar-foreground border border-[#E5E5E5] rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Table Container - Fix the height issue */}
      <div className="border border-[#E5E5E5] rounded-lg overflow-hidden">
        {/* Single horizontal scroll wrapper for both header and body */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px] sm:min-w-0">
            {/* Table Header */}
            <div className="bg-tertiary-color border-b border-[#E5E5E5]">
              <div className="flex">
                {/* Checkbox Column */}
                {/* <div className="w-[38px] h-10 flex items-center justify-center border-[#E5E5E5]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="w-4 h-4 border-[#E5E5E5] rounded shadow-sm"
                  />
                </div> */}

                {/* File Name Column */}
                <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center border-[#E5E5E5]">
                  <span className="text-sm font-medium text-placeholder-gray">
                    {col1}
                  </span>
                </div>

                {/* Type Column */}
                <div className="flex-1 truncate min-w-[85px] h-10 px-2 flex items-center border-[#E5E5E5]">
                  <span className="text-sm font-medium text-placeholder-gray truncate max-w-[100px]">
                    {col2}
                  </span>
                </div>

                {/* Uploaded By Column */}
                <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center border-[#E5E5E5]">
                  <span className="text-sm font-medium text-placeholder-gray">
                    {col3}
                  </span>
                </div>

                {/* Date Column */}
                <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center border-[#E5E5E5]">
                  <span className="text-sm font-medium text-placeholder-gray">
                    {col4}
                  </span>
                </div>

                {col5 && (
                  <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center border-[#E5E5E5]">
                    <span className="text-sm font-medium text-placeholder-gray">
                      {col5}
                    </span>
                  </div>
                )}

                {col6 && (
                  <div className="w-[85px] h-10 flex items-center justify-center">
                    <span className="text-sm font-medium text-placeholder-gray">
                      {col6}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Table Body - Use fixed height here */}
            <div className="h-[300px] overflow-y-auto">
              {currentData.map((file, index) => (
                <div
                  key={file.id}
                  className={`flex items-center border-b border-[#E5E5E5] h-14 ${
                    index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
                  }`}
                >
                  {/* Row — match the header min-w for consistent scroll */}
                  {/* <div className="w-[38px] h-14 flex items-center justify-center border-[#E5E5E5]">
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={(checked) =>
                        handleSelectFile(file.id, checked as boolean)
                      }
                      className="w-4 h-4 border-[#E5E5E5] rounded shadow-sm"
                    />
                  </div> */}

                  {/* File Name with optimized tooltip */}
                  <div className="flex-1 relative min-w-[85px] h-14 px-2 flex items-center border-[#E5E5E5] group">
                    {/* Use CSS hover instead of JS state for tooltip */}
                    <div className="absolute top-6 left-0 bg-secondary text-primary text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {file.name}
                    </div>
                    <span className="text-sm font-normal text-sidebar-foreground truncate leading-none">
                      {file.name}
                    </span>
                  </div>

                  <div className="flex-1 truncate max-w-[240px] min-w-[85px] h-14 px-2 flex items-center border-[#E5E5E5]">
                    {getFileTypeBadge(file.type)}
                  </div>

                  <div className="flex-1 min-w-[85px] h-14 px-2 flex items-center border-[#E5E5E5]">
                    {getUploadedByAvatar(file.country, file.role)}
                  </div>

                  <div className="flex-1 min-w-[85px] h-14 px-2 flex items-center border-[#E5E5E5]">
                    <span className="text-sm font-normal text-sidebar-foreground leading-none">
                      {file.date}
                    </span>
                  </div>

                  {col5 && (
                    <div className="flex-1 min-w-[85px] h-14 px-2 flex items-center border-[#E5E5E5]">
                      {getStatusBadge(file.status)}
                    </div>
                  )}

                  {col6 && (
                    <div className="w-[85px] h-14 flex items-center justify-center pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-gray-50"
                          >
                            <Ellipsis className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[140px] sm:min-w-[160px] w-auto -mr-8"
                        >
                          <DropdownMenuItem
                            aria-label={`View ${file.name}`}
                            onClick={() => onView?.(file)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDelete?.(file)}
                            className="text-red-600 "
                            aria-label={`Delete ${file.name}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm sm:text-base font-normal text-black text-center lg:text-left">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredAndSortedData.length)} of{" "}
            {filteredAndSortedData.length} files
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
                    className={`w-9 h-9 rounded-lg ${
                      isCurrentPage
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
    </div>
  );
};
