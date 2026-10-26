"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ExtraInformation } from "@/common/extraInformation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
} from "lucide-react";
import { ExportReportsButton } from "@/components/ui/export-reports-button";
import Image from "next/image";
import axios from "axios";

// Data types for Demand Analytics
export interface DemandAnalyticsRow {
  id: string;
  storeName: string;
  productTitle: string;
  size: string;
  demandQty: number;
  demandDate: string;
  uploadedBy: {
    name: string;
    avatar?: string;
  };
}

interface FilterOption {
  value: string;
  label: string;
}

interface DemandAnalyticsProps {
  itemsPerPage?: number;
  showPagination?: boolean;
  heading?: string;
  extraInfomation?: string;
  description?: string;
  searchTerm?: string;
  selectedLocation?: string;
  dateRange?: any;
  category?: string;
}
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

export const DemandAnalyticsTable: React.FC<DemandAnalyticsProps> = ({
  itemsPerPage = 5,
  showPagination = true,
  heading,
  extraInfomation,
  dateRange,
  category,
}) => {

  const [data, setData] = useState<DemandAnalyticsRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter options from API (ALL data, not just paginated)
  const [productOptions, setProductOptions] = useState<FilterOption[]>([
    { value: "all", label: "All Products" }
  ]);
  const [sizeOptions, setSizeOptions] = useState<FilterOption[]>([
    { value: "all", label: "By Size" }
  ]);
  const [uploadedByOptions, setUploadedByOptions] = useState<FilterOption[]>([
    { value: "all", label: "Uploaded By" }
  ]);

  // Pagination state (server-side)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Filter states
  const [searchValue, setSearchValue] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [uploadedByFilter, setUploadedByFilter] = useState("all");

  // UI states
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchValue.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);




  useEffect(() => {
    fetchFilterOptions();
  }, []);


  useEffect(() => {
    fetchData();
  }, [currentPage, debouncedSearch, productFilter, sizeFilter, uploadedByFilter, dateRange, category]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, productFilter, sizeFilter, uploadedByFilter]);

  /**
   * Fetch filter options - This gets ALL unique values from entire dataset
   * Not affected by pagination
   */
  const fetchFilterOptions = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/demand/table`);
      if (res.data.success) {
        setProductOptions(res.data.data.filters.products);
        setSizeOptions(res.data.data.filters.sizes);
        setUploadedByOptions(res.data.data.filters.uploadedBy);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  /**
   * Fetch paginated data with filters applied on server-side
   */
  const fetchData = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      // Add search term
      if (debouncedSearch.trim()) {
        params.append('searchTerm', debouncedSearch.trim());
      }

      // Add product filter
      if (productFilter !== 'all') {
        const selectedProduct = productOptions.find(opt => opt.value === productFilter);
        if (selectedProduct?.label && selectedProduct.label !== 'All Products') {
          params.append('productTitle', selectedProduct.label);
        }
      }

      // Add size filter
      if (sizeFilter !== 'all') {
        const selectedSize = sizeOptions.find(opt => opt.value === sizeFilter);
        if (selectedSize?.label && selectedSize.label !== 'By Size') {
          params.append('size', selectedSize.label);
        }
      }

      // Add uploaded by filter
      if (uploadedByFilter !== 'all') {
        const selectedUploadedBy = uploadedByOptions.find(opt => opt.value === uploadedByFilter);
        if (selectedUploadedBy?.label && selectedUploadedBy.label !== 'Uploaded By') {
          params.append('uploadedBy', selectedUploadedBy.label);
        }
      }

      // Add date range if provided
      if (dateRange?.start) {
        params.append('startDate', dateRange.start);
      }
      if (dateRange?.end) {
        params.append('endDate', dateRange.end);
      }
      if (category) params.append('category', category);

      const res = await axios.get(`${API_BASE_URL}/api/demand/table?${params.toString()}`);

      if (res.data.success) {
        // Map the response data to match component expectations
        setData(res.data.data.tableData);

        // Update pagination from your API response structure
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalRows(res.data.data.pagination.totalRows);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUploadedByAvatar = (uploadedBy: DemandAnalyticsRow['uploadedBy']) => {
    const initials = uploadedBy.name.split(' ').map(n => n[0]).join('').toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-tertiary-color rounded-full flex items-center justify-center overflow-hidden">
          {uploadedBy.avatar ? (
            <Image
              src={uploadedBy.avatar}
              alt={uploadedBy.name}
              width={24}
              height={24}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-xs font-medium text-sidebar-foreground">
              {initials}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-sidebar-foreground">{uploadedBy.name}</span>
      </div>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, rowId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== rowId));
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filterType: 'product' | 'size' | 'uploadedBy', value: string) => {
    switch (filterType) {
      case 'product':
        setProductFilter(value);
        break;
      case 'size':
        setSizeFilter(value);
        break;
      case 'uploadedBy':
        setUploadedByFilter(value);
        break;
    }
  };

  const removeFilter = (type: 'product' | 'size' | 'uploadedBy' | 'search') => {
    if (type === 'product') setProductFilter('all');
    if (type === 'size') setSizeFilter('all');
    if (type === 'uploadedBy') setUploadedByFilter('all');
    if (type === 'search') setSearchValue('');
  };

  const clearAllFilters = () => {
    setProductFilter('all');
    setSizeFilter('all');
    setUploadedByFilter('all');
    setSearchValue('');
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;

  // Get active filter badges
  const displayedFilterBadges = (() => {
    const badges: { label: string; type: 'product' | 'size' | 'uploadedBy' | 'search'; value: string }[] = [];

    // if (searchValue.trim() !== '') {
    //   badges.push({ label: `Search: "${searchValue}"`, type: 'search', value: searchValue });
    // }
    if (productFilter !== 'all') {
      const productLabel = productOptions.find(opt => opt.value === productFilter)?.label;
      if (productLabel && productLabel !== "All Products") {
        badges.push({ label: `Product: ${productLabel}`, type: 'product', value: productFilter });
      }
    }
    if (sizeFilter !== 'all') {
      const sizeLabel = sizeOptions.find(opt => opt.value === sizeFilter)?.label;
      if (sizeLabel && sizeLabel !== "By Size") {
        badges.push({ label: `Size: ${sizeLabel}`, type: 'size', value: sizeFilter });
      }
    }
    if (uploadedByFilter !== 'all') {
      const uploadedByLabel = uploadedByOptions.find(opt => opt.value === uploadedByFilter)?.label;
      if (uploadedByLabel && uploadedByLabel !== "Uploaded By") {
        badges.push({ label: `Uploaded By: ${uploadedByLabel}`, type: 'uploadedBy', value: uploadedByFilter });
      }
    }
    return badges;
  })();

  const hasActiveFilters = displayedFilterBadges.length > 0;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRows);

  const handleExport = async () => {
    try {
      // Build the same parameters as fetchData but with a large limit for export
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Large limit to get all data
      });

      // Add search term
      if (debouncedSearch.trim()) {
        params.append('searchTerm', debouncedSearch.trim());
      }

      // Add product filter
      if (productFilter !== 'all') {
        const selectedProduct = productOptions.find(opt => opt.value === productFilter);
        if (selectedProduct?.label && selectedProduct.label !== 'All Products') {
          params.append('productTitle', selectedProduct.label);
        }
      }

      // Add size filter
      if (sizeFilter !== 'all') {
        const selectedSize = sizeOptions.find(opt => opt.value === sizeFilter);
        if (selectedSize?.label && selectedSize.label !== 'By Size') {
          params.append('size', selectedSize.label);
        }
      }

      // Add uploaded by filter
      if (uploadedByFilter !== 'all') {
        const selectedUploadedBy = uploadedByOptions.find(opt => opt.value === uploadedByFilter);
        if (selectedUploadedBy?.label && selectedUploadedBy.label !== 'Uploaded By') {
          params.append('uploadedBy', selectedUploadedBy.label);
        }
      }

      // Add date range if provided
      if (dateRange?.start) {
        params.append('startDate', dateRange.start);
      }
      if (dateRange?.end) {
        params.append('endDate', dateRange.end);
      }

      // Fetch all data for export
      const res = await axios.get(`${API_BASE_URL}/api/demand/table?${params.toString()}`);

      if (res.data.success) {
        const exportData = res.data.data.tableData;

        // Create CSV headers as requested
        const csvHeaders = 'Product Name,Product Title,Size,Demand Quantity,Demand Date,Uploaded By\n';

        // Create CSV rows
        const csvRows = exportData.map((row: DemandAnalyticsRow) => {
          return [
            `"${row.storeName}"`, // Product Name (using storeName as requested)
            `"${row.productTitle}"`, // Product Title
            `"${row.size}"`, // Size
            row.demandQty, // Demand Quantity
            `"${row.demandDate}"`, // Demand Date
            `"${row.uploadedBy.name}"` // Uploaded By
          ].join(',');
        }).join('\n');

        const csvContent = csvHeaders + csvRows;

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `demand-analytics-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);


      } else {
        console.error('Failed to fetch data for export');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="font-inter w-full">
      <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-4">
        <div className="flex justify-between lg:flex-row flex-col items-center mb-4">
          {heading && (
            <h2 className="text-base font-semibold text-[#000000]">{heading}</h2>
          )}
          <div className="flex items-center gap-2">
            <ExportReportsButton
              onClick={() => handleExport()}
              size="md"
            />

            {extraInfomation && (
              <ExtraInformation
                extraInformation={extraInfomation}
                tooltipOpen={isTooltipOpen}
                setTooltipOpen={setIsTooltipOpen}
              />
            )}
          </div>
        </div>
        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-4 gap-2 sm:gap-4 lg:gap-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
              <Input
                placeholder="Search by shop or product..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => setSearchValue(searchValue.trimStart())}
                className="w-full sm:w-[239px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
              />
            </div>

            {/* Mobile/Tablet Filter Dropdown */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 px-3 border border-[#E5E5E5] rounded-lg shadow-sm">
                    <Ellipsis className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Product</label>
                      <Select value={productFilter} onValueChange={(value) => handleFilterChange('product', value)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="All Products" />
                        </SelectTrigger>
                        <SelectContent>
                          {productOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Size</label>
                      <Select value={sizeFilter} onValueChange={(value) => handleFilterChange('size', value)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="By Size" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Uploaded By</label>
                      <Select value={uploadedByFilter} onValueChange={(value) => handleFilterChange('uploadedBy', value)}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Uploaded By" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadedByOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Product Filter */}
              <Select value={productFilter} onValueChange={(value) => handleFilterChange('product', value)}>
                <SelectTrigger className="w-[185px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  {productOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Size Filter */}
              <Select value={sizeFilter} onValueChange={(value) => handleFilterChange('size', value)}>
                <SelectTrigger className="w-[101px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue placeholder="By Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Uploaded By Filter */}
              <Select value={uploadedByFilter} onValueChange={(value) => handleFilterChange('uploadedBy', value)}>
                <SelectTrigger className="w-[132px] h-10 border border-[#E5E5E5] rounded-lg shadow-sm">
                  <SelectValue placeholder="Uploaded By" />
                </SelectTrigger>
                <SelectContent>
                  {uploadedByOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters and Clear All */}
        {hasActiveFilters && (
          <div className="flex justify-between items-center mb-4">
            {/* Left side - Active Filter Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {displayedFilterBadges.map((badge) => (
                <Badge
                  key={`${badge.type}-${badge.value}`}
                  variant="outline"
                  className="px-2 py-1 whitespace-break-spaces lg:break-all text-xs bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] rounded-lg"
                >
                  {badge.label}
                  <button
                    onClick={() => removeFilter(badge.type)}
                    className="ml-1 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
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

        {/* Table Container */}
        <div className="border border-[#E5E5E5] relative rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px] sm:min-w-0">
              {/* Table Header */}
              <div className="bg-tertiary-color border-b border-[#E5E5E5]">
                <div className="flex">
                  {/* Checkbox Column */}


                  {/* Store Name Column - Fixed on mobile */}
                  <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Store Name</span>
                  </div>

                  {/* Product Title Column */}
                  <div className="flex-1 min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Product Title</span>
                  </div>

                  {/* Size Column */}
                  <div className="w-[85px] min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Size</span>
                  </div>

                  {/* Demand Qty Column */}
                  <div className="w-[107px] min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Demand Qty (Units)</span>
                  </div>

                  {/* Demand Date Column */}

                  <div className="w-[149px] min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Demand Date</span>
                  </div>

                  {/* Uploaded By Column */}
                  <div className="w-[184px] min-w-[85px] h-10 px-2 flex items-center">
                    <span className="text-sm font-medium text-placeholder-gray leading-none">Uploaded By</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="h-[280px] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                      <span className="text-sm text-gray-500">Loading data...</span>
                    </div>
                  </div>
                ) : data.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-3">
                      <Search className="h-12 w-12 text-gray-400" />
                      <div className="text-center">
                        <p className="text-base font-medium text-gray-700">No records found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  data.map((row, index) => (
                    <div
                      key={row.id}
                      className={`flex items-center border-b border-[#E5E5E5] h-12 ${index % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'
                        }`}
                    >
                      {/* Checkbox Column */}
                      {/* <div className="w-[38px] h-12 flex items-center justify-center pl-3">
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={(checked) => handleSelectRow(row.id, checked as boolean)}
                          className="w-4 h-4 border-[#E5E5E5] rounded shadow-sm"
                        />
                      </div> */}

                      {/* Store Name Column - Fixed on mobile */}
                      <div className="flex-1 min-w-[85px] h-12 px-2 flex items-center ">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">{row.storeName}</span>
                      </div>

                      {/* Product Title Column */}
                      <div className="flex-1 min-w-[85px] h-12 px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">{row.productTitle}</span>
                      </div>

                      {/* Size Column */}
                      <div className="w-[85px] min-w-[85px] h-12 px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">{row.size}</span>
                      </div>

                      {/* Demand Qty Column */}
                      <div className="w-[107px] min-w-[85px] h-12 px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">{row.demandQty}</span>
                      </div>

                      {/* Demand Date Column */}
                      <div className="w-[149px] min-w-[85px] h-12 px-2 flex items-center">
                        <span className="text-sm font-normal text-sidebar-foreground leading-none">{row.demandDate}</span>
                      </div>

                      {/* Uploaded By Column */}
                      <div className="w-[184px] min-w-[85px] h-12 px-2 flex items-center">
                        {getUploadedByAvatar(row.uploadedBy)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex flex-col lg:flex-row justify-between items-center mt-4 gap-4">
            <div className="text-sm sm:text-base font-normal text-black text-center lg:text-left">
              Showing {totalRows > 0 ? startIndex + 1 : 0} to {endIndex} of {totalRows} records
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
      </div>
    </div >
  );
};
