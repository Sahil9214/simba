"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, CircleUserRound, Download, Menu, X, Calendar, Search, ArrowLeftCircle, FilterX, MapPin, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { showToast } from '@/components/ui/toast';
import { DUMMY_SALES_STAFF_LIST, DUMMY_MARKET_SHARE_COMPREHENSIVE_RESPONSE } from '@/lib/constants/dummyData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { getCurrentDateISO, formatDateForAPI } from '@/lib/utils';
import { ShopSummaryTable } from './shopSummaryTable';
import { ChartMarketShare } from './chartMarketShare';
import { MarketShareHeaderData } from './market-share-header-data';

// Dynamic imports for optimization
const HeaderData = dynamic(
  () => import('@/components/header/header-data').then(mod => ({ default: mod.HeaderData })),
  {
    loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />,
    ssr: false
  }
);

const MarketSharePieChart = dynamic(
  () => import('@/components/chart').then(mod => ({ default: mod.MarketSharePieChart })),
  {
    loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
    ssr: false
  }
);

// Shop Summary Table Component
interface BrandLevel {
  brandName: string;
  totalUnits: number;
  marketShare: number;
}

interface Benchmark {
  industryMonthlyUnits: number;
  industryDailyBenchmark: number;
  currentMonthUnits: number;
  currentDailyAverage: number;
  benchmarkVariance: number;
  benchmarkVariancePercent: number;
  status: string; // "behind" | "ahead" | other
}

interface SkuLevel {
  skuId: string;
  productName: string;
  sizeMl: string;
  brandName: string;
  totalUnits: number;
  marketShare: number;
  mappingStatus: string;
  benchmark: Benchmark;
}

interface ShopSummary {
  shopId: string;
  shopName: string;
  vendorCode: string;
  reportType: string;
  brandLevel?: BrandLevel[];
  skuLevel?: SkuLevel[];
  totalShopUnits: number;
  totalMarketUnits: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalShops: number;
  shopsPerPage: number;
}

export interface ShopSummaryTableProps {
  shopSummary: ShopSummary[];
  isLoading: boolean;
  isError: boolean;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
}

//helper function
// Get current month minus 2 months in YYYY-MM format as default
const getDefaultMonth = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1); // Subtract 2 months from current month
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};





const SalesManagerPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [staffId, setStaffId] = useState<string>("All");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(searchParams.get('month') || 'all');
  const [selectedDpCode, setSelectedDpCode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1'));

  const [selectedMonth, setSelectedMonth] = useState<string>(searchParams.get('marketMonth') || getDefaultMonth());
  const updateURLParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== 'all' && value.trim() !== "") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  // Update URL when filters change (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURLParams('search', searchTerm);
      updateURLParams('category', category);
      updateURLParams('marketMonth', selectedMonth);
      updateURLParams('page', currentPage.toString());
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, updateURLParams, category, selectedMonth, currentPage]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate date ranges based on selected filter
  const dateRange = useMemo(() => {
    const endDate = getCurrentDateISO(); // YYYY-MM-DD format

    if (selectedMonthFilter === 'all') {
      return { startDate: undefined, endDate: undefined };
    }

    const monthsToSubtract = parseInt(selectedMonthFilter);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsToSubtract);

    return {
      startDate: formatDateForAPI(startDate),
      endDate: endDate
    };
  }, [selectedMonthFilter]);

  const data = useMemo(() => ({ data: [{ id: "All", name: "All" }, ...DUMMY_SALES_STAFF_LIST] }), []);
  const marketShareData = useMemo(() => DUMMY_MARKET_SHARE_COMPREHENSIVE_RESPONSE, []);
  const isMarketShareLoading = false;
  const isMarketShareError = false;
  // console.log("🤷‍♂️🤷‍♂️🤷‍♂️🤷‍♂️", marketShareData)
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
    setCategory("all");
    setSelectedMonth(getDefaultMonth());
    setSelectedEmployee("All");
    setStaffId("All");
    setCurrentPage(1);
    router.replace(window.location.pathname, { scroll: false });
    showToast('success', 'Filters reset successfully');
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || selectedDpCode !== 'all' || selectedMonthFilter !== 'all' || category !== 'all' || selectedMonth !== getDefaultMonth();
  }, [searchTerm, selectedDpCode, selectedMonthFilter, category, selectedMonth]);

  const handleEmployeeSelect = (employeeId: string) => {
    if (employeeId === "All") {
      setSelectedEmployee("All");
      setStaffId("All");
    } else {
      const selectedStaff = data?.data?.find((staff: { name: string, id: string }) => staff.id === employeeId);
      if (selectedStaff) {
        setSelectedEmployee(selectedStaff.name);
        setStaffId(selectedStaff.id);
      }
    }
    setCurrentPage(1); // Reset to page 1 when changing employee
    setIsDropdownOpen(false);
  };

  // Handler for page changes
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDpCode, category, searchTerm, selectedMonth, staffId]);

  // Extract pagination info from API response
  const paginationInfo = useMemo(() => {
    if (!marketShareData?.data?.comprehensive?.pagination) return undefined;

    const paginationData = marketShareData.data.comprehensive.pagination;
    return {
      currentPage: paginationData.currentPage || currentPage,
      totalPages: paginationData.totalPages || 1,
      totalShops: paginationData.totalShops || 0,
      shopsPerPage: paginationData.limit || 5,
    };
  }, [marketShareData, currentPage]);

  // Frontend search and filtering logic
  const filteredShopSummary = useMemo(() => {
    const rawShopSummary = marketShareData?.data?.comprehensive?.shopSummary || [];

    if (!searchTerm.trim()) {
      return rawShopSummary;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    // Filter shops: only show matching shops
    return rawShopSummary.filter((shop: ShopSummary) => {
      const shopNameMatch = shop.shopName?.toLowerCase().includes(searchLower);
      const vendorCodeMatch = shop.vendorCode?.toLowerCase().includes(searchLower);
      const reportTypeMatch = shop.reportType?.toLowerCase().includes(searchLower);

      return shopNameMatch || vendorCodeMatch || reportTypeMatch;
    });
  }, [marketShareData?.data?.comprehensive?.shopSummary, searchTerm]);

  const handleExport = () => {
    if (!marketShareData?.data) {
      showToast('error', 'No data available to export');
      return;
    }

    try {
      const { comprehensive, overview } = marketShareData.data;
      const { summary, shopSummary } = comprehensive


      // Create CSV content
      let csvContent = '';

      // Header Section
      csvContent += 'MARKET SHARE REPORT\n';
      csvContent += `Month: ${selectedMonth}\n`;
      csvContent += `Sales Person: ${selectedEmployee}\n`;
      csvContent += `Generated: ${new Date().toLocaleString()}\n`;
      csvContent += '\n';

      // Summary Section
      csvContent += 'SUMMARY\n';
      csvContent += 'Metric,Value\n';
      csvContent += `Total Shops,${summary?.totalShops || 0}\n`;
      csvContent += `Total BEER Shops,${summary?.totalBEERShops || 0}\n`;
      csvContent += `Total IMFL Shops,${summary?.totalIMFLShops || 0}\n`;
      csvContent += `Total Combined Shops,${summary?.totalCombinedShops || 0}\n`;
      csvContent += `Total Market Units,${summary?.totalMarketUnits || 0}\n`;
      csvContent += `Total BEER Units,${summary?.totalBEERUnits || 0}\n`;
      csvContent += `Total IMFL Units,${summary?.totalIMFLUnits || 0}\n`;
      csvContent += `Target Brand Share,${summary?.targetBrandShare || 0}%\n`;
      csvContent += '\n\n';

      // Shop-wise Details Section
      csvContent += 'SHOP-WISE BRAND DETAILS\n';
      csvContent += 'Shop Name,Vendor Code,Report Type,Brand Name,Total Units,Market Share (%),Shop Total Units,Market Total Units\n';

      if (shopSummary && shopSummary.length > 0) {
        shopSummary.forEach((shop: any) => {
          if (shop.brandLevel && shop.brandLevel.length > 0) {
            shop.brandLevel.forEach((brand: any, index: number) => {
              // For first brand row, show shop details. For subsequent brands, show empty cells
              const shopName = index === 0 ? `"${shop.shopName}"` : '';
              const vendorCode = index === 0 ? shop.vendorCode : '';
              const reportType = index === 0 ? shop.reportType : '';
              const shopTotalUnits = index === 0 ? shop.totalShopUnits : '';
              const marketTotalUnits = index === 0 ? shop.totalMarketUnits : '';

              csvContent += `${shopName},${vendorCode},${reportType},"${brand.brandName}",${brand.totalUnits},${brand.marketShare.toFixed(2)},${shopTotalUnits},${marketTotalUnits}\n`;
            });
            // Add empty line after each shop
            csvContent += '\n';
          }
        });
      }

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');

      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Market_Share_Report_${selectedEmployee}_${selectedMonth}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast('success', 'Report exported successfully');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('error', 'Failed to export report');
    }
  };

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
            className='shadow-xl bg-white rounded-full p-2 cursor-pointer' onClick={() => router.back()}>
            <ArrowLeftCircle className='w-6 h-6' />
          </div>
          <div className="flex items-left gap-2 flex-col">
            <span className="text-lg font-bold text-[#171717]">Market Share</span>
            <p className="font-inter font-normal text-sm leading-5 text-[#737373]">Here all the data directly coming from IMFL</p>
          </div>
        </div>
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
      {isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 p-4 space-y-3">
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
                  <div
                    className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                    onClick={() => handleEmployeeSelect("All")}
                  >
                    <span className="text-sm font-medium text-sidebar-foreground">
                      All
                    </span>
                  </div>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div>

          {/* DP Code Filter */}
          <div className="w-full">
            <Select
              value={selectedDpCode}
              onValueChange={(value) => {
                setSelectedDpCode(value);
                setCurrentPage(1);
              }}
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

          {/* Month Filter */}
          {/* <div className="w-full">
            <Select
              value={selectedMonthFilter}
              onValueChange={setSelectedMonthFilter}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-3 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full">
                <Calendar className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="2">Last 2 Months</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div> */}

          {/* Product Category Filter */}
          <div className="w-full">
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-3 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-full">
                <Package className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Product Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="BEER">Beer</SelectItem>
                <SelectItem value="VODKA">Vodka</SelectItem>
                <SelectItem value="WHISKY">WHISKY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Market Share Month Filter */}
          {/* <div className="relative w-full bg-white rounded-lg">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div> */}


          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex flex-row justify-center items-center w-full px-4 py-3 gap-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
            >
              <FilterX className="w-4 h-4 text-sidebar-foreground" />
              <span className="text-sm font-normal text-sidebar-foreground">Reset Filters</span>
            </button>
          )}

          {/* Export Reports Button */}
          {/* <button
            onClick={handleExport}
            className="flex flex-row justify-center items-center w-full px-4 py-3 gap-2 bg-linear-to-b from-[#FF4250] to-[#D73742] rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            <Download className="w-4 h-4 text-[#FAFAFA]" />
            <span className="text-sm font-normal text-[#FAFAFA]">Export Reports</span>
          </button> */}
        </div>
      )}

      {/* Desktop Controls */}
      <div className="hidden xl:flex flex-row items-center justify-between p-0 gap-6 w-full relative z-10">
        <div className="flex flex-row items-center p-0 gap-2 shrink-0">
          <div className="relative flex-1 sm:flex-none bg-white rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray " />
            <Input
              placeholder="Search by shop, location or DP code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[200px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div>
          {/* Employee Select */}
          <div className="w-auto">
            <Select
              value={staffId}
              onValueChange={(value) => {
                if (value === "All") {
                  setSelectedEmployee("All");
                  setStaffId("All");
                  return;
                }

                const selectedStaff = data?.data?.find(
                  (staff: { name: string; id: string }) => staff.id === value
                );

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

              <SelectContent className="h-40">
                <SelectItem value="All">All</SelectItem>
                {data?.data?.map((staff: { id: string; name: string }) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          {/* DpCode */}
          <div className='w-auto'>
            <Select
              value={selectedDpCode}
              onValueChange={(value) => {
                setSelectedDpCode(value);
                setCurrentPage(1);
              }}
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
          {/* Month Filter Desktop */}
          {/* <div className="w-auto">
            <Select
              value={selectedMonthFilter}
              onValueChange={setSelectedMonthFilter}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <Calendar className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="2">Last 2 Months</SelectItem>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          {/* Products filter */}
          <div className="w-auto">
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="flex flex-row items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors w-auto">
                <Package className="w-4 h-4 text-sidebar-forground" />
                <SelectValue placeholder="Select Product Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="BEER">Beer</SelectItem>
                <SelectItem value="VODKA">Vodka</SelectItem>
                <SelectItem value="WHISKY">WHISKY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Market Share Month Selector */}
          {/* <div className="relative bg-white rounded-lg w-auto min-w-[180px]">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray pointer-events-none z-10" />
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-sidebar-foreground focus:ring-0 focus:border-[#E5E5E5]"
            />
          </div> */}
        </div>

        <div className="flex flex-row items-center p-0 gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors shrink-0"
              style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
              title="Reset all filters"
            >
              <FilterX className="w-4 h-4 text-sidebar-foreground" />
              <span className="text-sm font-normal text-sidebar-foreground">
                Reset Filters
              </span>
            </button>
          )}
          {/* <button
            onClick={handleExport}
            className="flex flex-row justify-center items-center px-4 py-2 gap-2 h-10 bg-linear-to-b from-[#FF4250] to-[#D73742] rounded-lg shadow-sm hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            style={{ boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)' }}
          >
            <Download className="w-4 h-4 text-[#FAFAFA]" />
            <span className="text-sm font-normal text-[#FAFAFA]">
              Export Reports
            </span>
          </button> */}
        </div>
      </div>

      {/* Summary Cards Section */}
      <section className="mt-3">
        {isMarketShareLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isMarketShareError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">Failed to load market share data</p>
          </div>
        ) : (
          <MarketShareHeaderData marketShareData={marketShareData} />
        )}
      </section>
      <section className='flex justify-center items-center'>
        <ChartMarketShare buckets={marketShareData?.data?.overview?.buckets} />
      </section>

      {/* Shop Summary Table Section */}
      <section className="mt-6 w-full">
        <ShopSummaryTable
          shopSummary={filteredShopSummary}
          isLoading={isMarketShareLoading}
          isError={isMarketShareError}
          pagination={paginationInfo}
          onPageChange={handlePageChange}

        />
      </section>
    </div>
  );
};


export default SalesManagerPage;


