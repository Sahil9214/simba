"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, CircleUserRound, Menu, X, Calendar, Search, ArrowLeftCircle, FilterX, MapPin, Package } from "lucide-react";
import { showToast } from '@/components/ui/toast';
import { ExportReportsButton } from '@/components/ui/export-reports-button';
import { DUMMY_SALES_STAFF_LIST, DUMMY_STAFF_OVERALL_DATA, DUMMY_STAFF_DATA_BY_ID } from '@/lib/constants/dummyData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { formatDateToDDMMYYYY } from '@/utils/formatDateDDMMYYY';

// Dynamic imports for optimization
const HeaderData = dynamic(
  () => import('@/components/header/header-data').then(mod => ({ default: mod.HeaderData })),
  {
    loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />,
    ssr: false
  }
);

const AnalyticsCard = dynamic(
  () => import('@/components/sellercomponents/analyticsCardSeller/analyticsCared').then(mod => ({ default: mod.AnalyticsCard })),
  {
    loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-32" /><div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-32" /><div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-32" /><div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-32" /></div>,
    ssr: false
  }
);

const ProductTable = dynamic(
  () => import('@/components/sellercomponents/productTable').then(mod => ({ default: mod.ProductTable })),
  {
    loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
    ssr: false
  }
);

const SalesManagerPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [staffId, setStaffId] = useState<string>('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(searchParams.get('month') || 'all');
  const [selectedDpCode, setSelectedDpCode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get("category") || "All")


  const updateURLParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all' && value.trim() !== "") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Update URL when searchTerm changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURLParams('search', searchTerm.trim());
      updateURLParams('category', category);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateURLParams, category]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const productTableRef = useRef<{ exportToCSV: () => void }>(null);

  // Calculate date ranges based on selected filter
  const dateRange = useMemo(() => {
    const endDate = formatDateToDDMMYYYY(new Date()); // DD/MM/YYYY format

    if (selectedMonthFilter === 'all') {
      return { startDate: undefined, endDate: undefined };
    }

    const monthsToSubtract = parseInt(selectedMonthFilter);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);

    return {
      startDate: formatDateToDDMMYYYY(startDate),
      endDate: endDate
    };
  }, [selectedMonthFilter]);

  // Dummy data instead of API calls
  const data = useMemo(() => ({ data: DUMMY_SALES_STAFF_LIST }), []);
  const staffData = useMemo(() => DUMMY_STAFF_DATA_BY_ID, []);
  const staffOverview = useMemo(() => DUMMY_STAFF_OVERALL_DATA, []);
  const isLoading = false;
  const isError = false;




  // Frontend filtering logic for search and DP code
  const filteredStaffOverview = useMemo(() => {
    if (!staffOverview?.data?.salesByShop) return staffOverview;

    let filteredSalesByShop = [...staffOverview.data.salesByShop];

    // Filter by search term (shop name, location, or DP code)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filteredSalesByShop = filteredSalesByShop.filter((sale: any) => {
        const shopName = sale.shopName?.toLowerCase() || '';
        const location = sale.location?.toLowerCase() || '';
        const dpCode = sale.dpCode?.toLowerCase() || '';
        return shopName.includes(searchLower) ||
          location.includes(searchLower) ||
          dpCode.includes(searchLower);
      });
    }

    // Filter by DP code
    if (selectedDpCode !== 'all') {
      filteredSalesByShop = filteredSalesByShop.filter((sale: any) =>
        sale.dpCode === selectedDpCode
      );
    }

    // Filter by Category
    if (category && category.toLowerCase() !== 'all') {
      const catLower = category.toLowerCase();
      filteredSalesByShop = filteredSalesByShop.filter((sale: any) => {
        if (!sale.skus || !Array.isArray(sale.skus)) return true;
        return sale.skus.some((sku: any) => sku.category?.toLowerCase() === catLower);
      });
    }

    return {
      ...staffOverview,
      data: {
        ...staffOverview.data,
        salesByShop: filteredSalesByShop
      }
    };
  }, [staffOverview, searchTerm, selectedDpCode, category]);

  // Set first staff member as default
  useEffect(() => {
    if (data?.data && data.data.length > 0 && !selectedEmployee) {
      setSelectedEmployee(data.data[0].name);
      setStaffId(data.data[0].id);
    }
  }, [data, selectedEmployee]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedDpCode('all');
    setSelectedMonthFilter('all');
    setCategory("all")
    router.replace(window.location.pathname, { scroll: false });
    showToast('success', 'Filters reset successfully');
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || selectedDpCode !== 'all' || selectedMonthFilter !== 'all';
  }, [searchTerm, selectedDpCode, selectedMonthFilter]);

  // Get filtered results count
  const filteredResultsCount = useMemo(() => {
    return filteredStaffOverview?.data?.salesByShop?.length || 0;
  }, [filteredStaffOverview]);

  // Get total results count
  const totalResultsCount = useMemo(() => {
    return staffOverview?.data?.salesByShop?.length || 0;
  }, [staffOverview]);

  const handleEmployeeSelect = (employeeId: string) => {
    const selectedStaff = data?.data?.find((staff: { name: string, id: string }) => staff.id === employeeId);
    if (selectedStaff) {
      setSelectedEmployee(selectedStaff.name);
      setStaffId(selectedStaff.id);
    }
    setIsDropdownOpen(false);
  };

  const handleExportReport = async () => {
    try {
      const salesByShop = filteredStaffOverview?.data?.salesByShop || staffOverview?.data?.salesByShop || [];

      // Convert data to CSV
      const csvRows: string[] = [];

      // CSV Headers
      const headers = [
        'Shop Name',
        'DP Code',
        'Location',
        'SKU Name',
        "Size (ML)",
        'Brand Name',
        'Category',
        'Total Sales (Units)',

        'Report Count',
        'Last Report Date'
      ];
      csvRows.push(headers.join(','));

      // Process salesByShop data
      if (salesByShop && Array.isArray(salesByShop)) {
        salesByShop.forEach((shop: any) => {
          const shopName = escapeCSV(shop.shopName || '');
          const dpCode = escapeCSV(shop.dpCode || '');
          const location = escapeCSV(shop.location || '');

          if (shop.skus && Array.isArray(shop.skus) && shop.skus.length > 0) {
            // One row per SKU
            shop.skus.forEach((sku: any) => {
              const row = [
                shopName,
                dpCode,
                location,
                escapeCSV(sku.skuName || ''),
                escapeCSV(sku.sizeML || sku.size || ''),
                escapeCSV(sku.brandName || ''),
                escapeCSV(sku.category || ''),
                sku.totalSales || 0,

                sku.reportCount || 0,
                escapeCSV(sku.lastReportDate || 'N/A')
              ];
              csvRows.push(row.join(','));
            });
          } else {
            // If no SKUs, still add a row with shop info
            const row = [
              shopName,
              dpCode,
              location,
              '',
              '',
              '',
              '',
              shop.totalSales || 0,

              shop.reportCount || 0,
              ''
            ];
            csvRows.push(row.join(','));
          }
        });
      }

      // Create CSV content
      const csvContent = csvRows.join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const blobUrl = URL.createObjectURL(blob);
      link.setAttribute('href', blobUrl);
      link.setAttribute('download', `sales-employee-report-${selectedEmployee || 'report'}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showToast('success', 'Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Failed to export report');
    }
  }

  // Helper function to escape CSV values
  const escapeCSV = (value: string): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // If value contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  }

  const handleStaffMonthData = () => {
    // dummy handler
  }

  return (
    <div className="w-full space-y-4">
      <HeaderData
        heading=" "
        showLocationDropdown={false}
        showProductTypeDropdown={false}
        showSalespersonDropdown={false}
        showExportReportsButton={false}
        searchIsWorking={false}
      />

      {/* Mobile Header */}
      <div className="flex flex-col md:flex-row font-inter justify-between items-center pb-4  border-b border-gray-200">
        <div className='flex gap-4 justify-center items-center'>
          <div aria-label='arrow-left '
            role='button'
            className='shadow-xl cursor-pointer bg-white rounded-full p-2' onClick={() => router.back()}>
            <ArrowLeftCircle className='w-6 h-6' />
          </div>
          <div className="flex items-left gap-2 flex-col">
            <span className="text-lg font-bold text-[#171717]">Salesperson  Report</span>
            <p className="font-inter font-normal text-sm leading-5 text-[#737373]">Track sales, breakages, and shop-level market share for each SKU</p>
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden shadow-xl bg-white rounded-full p-2 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-[#171717]" />
          ) : (
            <Menu className="w-6 h-6 text-[#171717]" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 p-4 space-y-3">
          {/* Employee Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex flex-row justify-between items-center w-full px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <div className="flex items-center gap-3">
                <CircleUserRound className="w-4 h-4 text-sidebar-foreground" />
                <span className="text-sm font-medium text-sidebar-foreground">
                  {selectedEmployee || "Select Employee"}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-sidebar-foreground" />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2 space-y-1">
                  {data?.data?.map((staff: { id: string, name: string }) => (
                    <div
                      key={staff.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                      onClick={() => handleEmployeeSelect(staff.id)}
                    >
                      <span className="text-sm font-medium text-sidebar-foreground">
                        {staff.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full bg-white rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
            <Input
              placeholder="Search by shop, location or DP code..."
              value={searchTerm}
              maxLength={20}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div>

          {/* DP Code Filter */}
          <div className="w-full">
            <Select
              value={selectedDpCode}
              onValueChange={setSelectedDpCode}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-3 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full">
                <MapPin className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select DP Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DP Codes</SelectItem>
                <SelectItem value="DCCWS">DCCWS</SelectItem>
                <SelectItem value="DSCSC">DSCSC</SelectItem>
                <SelectItem value="DSIIDC">DSIIDC</SelectItem>
                <SelectItem value="DTTDC">DTTDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-auto">
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <Package className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Products</SelectItem>
                <SelectItem value="BEER">Beer</SelectItem>
                <SelectItem value="VODKA">Vodka</SelectItem>
                <SelectItem value="WHISKY">Whisky</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Month Filter */}


          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex flex-row justify-center items-center w-full px-4 py-3 gap-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <FilterX className="w-4 h-4 text-sidebar-foreground" />
              <span className="text-sm font-normal text-sidebar-foreground">Reset Filters</span>
            </button>
          )}

          {/* Export Reports Button */}
          <ExportReportsButton
            onClick={handleExportReport}
            fullWidth
            size="md"
          />
        </div>
      )}

      {/* Desktop Controls */}
      <div className="hidden xl:flex flex-row items-center justify-between p-0 gap-6 w-full relative z-10">
        <div className="flex flex-row items-center p-0 gap-2 shrink-0">
          {/* Employee Select */}
          <div className="w-auto ">
            <Select
              value={staffId}
              onValueChange={(value) => {
                const selectedStaff = data?.data?.find((staff: { name: string, id: string }) => staff.id === value);
                if (selectedStaff) {
                  setSelectedEmployee(selectedStaff.name);
                  setStaffId(selectedStaff.id);
                }
              }}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <CircleUserRound className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Employee">
                  {selectedEmployee || "Select Employee"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className='h-40'>
                {data?.data?.map((staff: { id: string, name: string }) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 sm:flex-none bg-white rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray " />
            <Input
              placeholder="Search by shop, location or DP code..."
              value={searchTerm}
              maxLength={20}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[200px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div>
          {/* DpCode */}
          <div className='w-auto'>
            <Select
              value={selectedDpCode}
              onValueChange={setSelectedDpCode}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <MapPin className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select DP Code" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All DP Codes</SelectItem>
                <SelectItem value="DCCWS">DCCWS</SelectItem>
                <SelectItem value="DSCSC">DSCSC</SelectItem>
                <SelectItem value="DSIIDC">DSIIDC</SelectItem>
                <SelectItem value="DTTDC">DTTDC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products filter */}
          <div className="w-auto">
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <Package className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Products</SelectItem>
                <SelectItem value="BEER">Beer</SelectItem>
                <SelectItem value="VODKA">Vodka</SelectItem>
                <SelectItem value="WHISKY">Whisky</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row items-center p-0 gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0 cursor-pointer"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
              title="Reset all filters"
            >
              <FilterX className="w-4 h-4 text-sidebar-foreground" />
              <span className="text-sm font-normal text-sidebar-foreground">
                Reset Filters
              </span>
            </button>
          )}
          <ExportReportsButton
            onClick={handleExportReport}
            size="md"
          />
        </div>
      </div>

      {/* Analytics Cards Section */}
      <section className="mt-3">
        <AnalyticsCard cardsData={staffOverview?.data?.cards} isError={isError} isLoading={isLoading} show4={false} />
      </section>

      {/* Product Table Section */}
      <section className="mt-3 w-full">
        {/* Filter Results Indicator */}
        {(searchTerm.trim() !== '' || selectedDpCode !== 'all') && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              Showing {filteredResultsCount} of {totalResultsCount} shops
              {searchTerm.trim() && ` matching "${searchTerm}"`}
              {selectedDpCode !== 'all' && ` with DP Code: ${selectedDpCode}`}
            </p>
          </div>
        )}

        <ProductTable
          title={`${selectedEmployee} - Sales Employee Overview`}
          data={filteredStaffOverview || []}
          isLoading={isLoading}
          handleStaffMonthData={handleStaffMonthData}
          staffData={staffData}
          staffOverview={staffOverview}
        />
      </section>
    </div>
  );
};

export default SalesManagerPage;
