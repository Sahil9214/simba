"use client";
import React, { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, ChevronRight, ArrowLeftCircle, Search } from "lucide-react";
import { DUMMY_INVENTORY_RESPONSE } from '@/lib/constants/dummyData';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

// Dynamic imports for optimization
const HeaderData = dynamic(
  () => import('@/components/header/header-data').then(mod => ({ default: mod.HeaderData })),
  {
    loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />,
    ssr: false
  }
);

// Shop with Inventory Table Component
interface SKU {
  sku_id: string;
  brand_name: string;
  product_name: string;
  size_ml: number;
  category: string;
  stock: string;
  shop_id?: string;
  original_dp_code?: string;
}

interface Shop {
  id?: string;
  shop_name: string;
  original_dp_code: string;
  dp_code?: string;
  state: string;
  district: string;
  address?: string;
}

interface ShopWithSkus extends Shop {
  skus: SKU[];
}

interface ShopInventoryTableProps {
  shops: ShopWithSkus[];
  isLoading: boolean;
  isError: boolean;
  product: string
}

// Individual Shop Row Component to handle inventory fetching per shop
const ShopRow: React.FC<{
  shop: Shop;
  index: number,
  product: string,
  skus: SKU[],
  isExpanded: boolean,
  onToggle: () => void
}> = ({ shop, index, product, skus, isExpanded, onToggle }) => {

  // SKUs are already shop-specific, passed from parent
  const shopSkus = useMemo(() => {
    return skus || [];
  }, [skus]);

  return (
    <div className="transition-all duration-200">
      {/* Shop Row */}
      <div
        onClick={onToggle}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 cursor-pointer hover:bg-secondary transition-colors"
      >
        <div className="flex items-start md:items-center gap-3 flex-1">
          <div className="shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-primary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sidebar-foreground">{shop.shop_name}</h3>
            <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs text-gray-500">
              <span>Code: {shop.original_dp_code}</span>
              <span className="px-2 py-0.5 bg-secondary text-primary rounded-full font-medium">
                {shop.state}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs text-gray-500">
            {shop.district}
          </div>
        </div>
      </div>

      {/* Expanded Inventory Table */}
      {isExpanded && (
        <div className="bg-secondary/50 px-4 pb-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-2">
            {/* Inventory Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 p-3 font-semibold text-sm text-sidebar-foreground border-b border-gray-200">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Brand Name</div>
              <div className="col-span-3">Product Name</div>
              <div className="col-span-2 text-center">Size (ml)</div>
              <div className="col-span-2 text-center">Category</div>
              <div className="col-span-1 text-right">Stock</div>
            </div>
            <div className="md:hidden bg-gray-50 px-4 py-2 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Inventory Details
            </div>

            {/* Inventory Table Rows */}
            <div className="divide-y divide-gray-100">
              {shopSkus && shopSkus.length > 0 ? (
                shopSkus.map((item: SKU, itemIndex: number) => (
                  <div key={item.sku_id || itemIndex} className="hover:bg-gray-50 transition-colors">
                    <div className="hidden md:grid grid-cols-12 gap-4 p-3 text-sm">
                      <div className="col-span-1 text-center text-gray-500 font-medium">
                        {itemIndex + 1}
                      </div>
                      <div className="col-span-3 text-sidebar-foreground font-medium">
                        {item.brand_name || 'N/A'}
                      </div>
                      <div className="col-span-3 text-sidebar-foreground">
                        {item.product_name || 'N/A'}
                      </div>
                      <div className="col-span-2 text-center text-sidebar-foreground">
                        {item.size_ml || 'N/A'}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${item.category === 'BEER'
                          ? 'bg-green-100 text-green-800'
                          : item.category === 'VODKA'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {item.category || 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-1 text-right font-semibold text-sidebar-foreground">
                        {item.stock || '0'}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 p-4 text-sm md:hidden">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium text-gray-600">Item #{itemIndex + 1}</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Brand</p>
                        <p className="font-semibold text-sidebar-foreground">{item.brand_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Product Name</p>
                        <p className="font-medium text-sidebar-foreground">{item.product_name || 'N/A'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Size (ml)</p>
                          <p className="font-medium text-sidebar-foreground">{item.size_ml || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Stock</p>
                          <p className="font-semibold text-sidebar-foreground">{item.stock || '0'}</p>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-dashed border-gray-200">
                        <p className="text-xs text-gray-500">Category</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${item.category === 'BEER'
                          ? 'bg-green-100 text-green-800'
                          : item.category === 'VODKA'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {item.category || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No inventory data available for this shop
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopInventoryTable: React.FC<ShopInventoryTableProps> = ({ shops, isLoading, isError, product }) => {
  const [expandedShopId, setExpandedShopId] = useState<string | null>(null);

  const handleToggle = (shopId: string) => {
    setExpandedShopId(prev => prev === shopId ? null : shopId);
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

  if (!shops || shops.length === 0) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm text-center">
        <p className="text-gray-500">No shop data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-primary p-4">
        <h2 className="text-white font-semibold text-lg">Shop Inventory</h2>
        <p className="text-white/80 text-sm mt-1">Click on any shop to view inventory details</p>
      </div>

      {/* Table Content */}
      <div className="divide-y divide-gray-200">
        {shops.map((shop, index) => (
          <ShopRow
            key={shop.id || index}
            shop={shop}
            index={index}
            product={product}
            skus={shop.skus}
            isExpanded={expandedShopId === shop.id}
            onToggle={() => handleToggle(shop.id || '')}
          />
        ))}
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total Shops: <span className="font-semibold">{shops.length}</span>
        </p>
      </div>
    </div>
  );
};

const InventoryPage = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [product, setProduct] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchFocus = useRef<HTMLInputElement | null>(null)
  const wasFocusedRef = useRef<boolean>(false);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = searchInput.trim();
      // Only update searchTerm if it actually changed
      if (trimmedSearch !== searchTerm) {
        setSearchTerm(trimmedSearch);
        // Reset to first page only when search term actually changes
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]); // Only depend on searchInput, not searchTerm or currentPage

  // Reset page when product changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [product]);

  // Auto-focus search input when user starts typing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only focus if user is typing a printable character and not already in an input/textarea
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        searchFocus.current
      ) {
        // Check if input is visible (not hidden on mobile)
        const inputElement = searchFocus.current;
        const isVisible = window.getComputedStyle(inputElement).display !== 'none';

        if (isVisible) {
          // Prevent default to avoid typing in wrong place
          e.preventDefault();

          // Focus the input first
          inputElement.focus();

          // Get current value and append the new character
          const currentValue = searchInput;
          const newValue = currentValue + e.key;

          // Update state
          setSearchInput(newValue);

          // Position cursor at the end - use requestAnimationFrame for better timing
          requestAnimationFrame(() => {
            if (inputElement) {
              const length = newValue.length;
              inputElement.setSelectionRange(length, length);
              // Ensure input stays focused and cursor is visible
              inputElement.focus();
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchInput]);

  const filteredInventory = useMemo(() => {
    let shops = DUMMY_INVENTORY_RESPONSE.data;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      shops = shops.filter(item =>
        item.shops.shop_name.toLowerCase().includes(q) ||
        item.shops.original_dp_code.toLowerCase().includes(q) ||
        item.shops.district.toLowerCase().includes(q) ||
        item.skus.some(s => s.product_name.toLowerCase().includes(q) || s.brand_name.toLowerCase().includes(q))
      );
    }
    if (product && product.toLowerCase() !== "all" && product.toLowerCase() !== "all products") {
      const p = product.toLowerCase();
      shops = shops.map(item => ({
        ...item,
        skus: item.skus.filter(s => s.category.toLowerCase() === p || s.product_name.toLowerCase().includes(p))
      })).filter(item => item.skus.length > 0);
    }
    return shops;
  }, [searchTerm, product]);

  const fetchAllShop = filteredInventory;
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalShops: filteredInventory.length,
  };
  const isPending = false;
  const isError = false;

  // Extract shops with their respective SKUs from the API response
  // fetchAllShop is an array where each item has: { shop_id, shops: {...}, skus: [...] }
  const shopsWithSkus = useMemo(() => {
    if (!fetchAllShop || !Array.isArray(fetchAllShop)) {
      return [];
    }

    // Map each item to include shop data with its own SKUs
    const processedShops = fetchAllShop.map((item: any) => {
      const shop = item.shops;
      const shopSkus = Array.isArray(item.skus) ? item.skus : [];

      return {
        ...shop,
        shop_id: item.shop_id,
        id: item.shop_id,
        skus: shopSkus // Each shop has its own SKUs array
      };
    }).filter((shop: any) => shop !== null && shop !== undefined);

    return processedShops;
  }, [fetchAllShop]);

  // No frontend filtering - backend handles search via API

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!shopsWithSkus || shopsWithSkus.length === 0) return { totalShops: 0, totalStates: 0, totalDistricts: 0 };

    const uniqueStates = new Set(shopsWithSkus.map((shop: ShopWithSkus) => shop.state));
    const uniqueDistricts = new Set(shopsWithSkus.map((shop: ShopWithSkus) => shop.district));

    return {
      totalShops: shopsWithSkus.length,
      totalStates: uniqueStates.size,
      totalDistricts: uniqueDistricts.size
    };
  }, [shopsWithSkus]);

  const handleProductTypeChange = (productType: string) => {
    setProduct(productType)
    setCurrentPage(1) // Reset to first page when product changes
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
      // Scroll to top of the page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div className="w-full space-y-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row font-inter justify-between items-start md:items-center pb-4 border-b border-gray-200 gap-4">
        <div className='flex gap-4 justify-center items-center'>
          <div
            aria-label='arrow-left'
            className='shadow-xl bg-white rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors'
            onClick={() => router.back()}
          >
            <ArrowLeftCircle className='w-6 h-6' />
          </div>
          <div className="flex items-left gap-2 flex-col">
            <span className="text-lg font-bold text-[#171717]">Inventory Management</span>
            <p className="font-inter font-normal text-sm leading-5 text-[#737373]">
              View and manage shop inventory across all locations
            </p>
          </div>
        </div>
        <div className='flex flex-col lg:flex-row gap-2 items-center justify-center '>
          <HeaderData
            heading=" "
            showLocationDropdown={false}
            showProductTypeDropdown={true}
            showSalespersonDropdown={false}
            showExportReportsButton={false}
            searchIsWorking={false}
            onProductTypeChange={handleProductTypeChange}
            onSearchChange={setSearchInput}
          />
          {/* Search Bar */}
          <div className="relative hidden  lg:flex w-full md:w-auto bg-white rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
            <Input
              ref={searchFocus}
              placeholder="Search by shop name, code, location..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => {
                wasFocusedRef.current = true;
              }}
              onBlur={() => {
                // Only clear the flag if user explicitly blurred (not due to re-render)
                if (document.activeElement !== searchFocus.current) {
                  wasFocusedRef.current = false;
                }
              }}
              maxLength={15}
              className="w-full md:w-[300px] h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5] caret-gray-900"
              style={{ caretColor: '#171717' }}
            />
            {isPending && searchInput && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Summary Cards Section */}
      <section className="mt-3">
        {isPending ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-gray-200">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-600">Loading inventory data...</p>
          </div>
        ) : isError ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Failed to load inventory data</h3>
                <p className="text-sm text-red-700 mt-1">Please check your connection and try again.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-primary">
                {summaryStats.totalShops}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Total Shops
              </div>
            </div>

            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#4ADE80]">
                {summaryStats.totalStates}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                States Covered
              </div>
            </div>

            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#955EFF]">
                {summaryStats.totalDistricts}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Districts Covered
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Shop Inventory Table Section */}
      <section className="mt-6 w-full">
        {!isPending && !isError && shopsWithSkus.length === 0 && searchInput ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-gray-100 p-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-sm text-gray-600">
                  No shops match your search . Try adjusting your search terms.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ShopInventoryTable
            shops={shopsWithSkus}
            isLoading={isPending}
            isError={isError}
            product={product}
          />
        )}
      </section>

      {/* Pagination Controls - Keep visible during loading */}
      {!isError && pagination && pagination.totalPages > 1 && (
        <section className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Loading...</span>
              </div>
            ) : (
              <>
                Showing page <span className="font-semibold">{pagination.currentPage}</span> of{' '}
                <span className="font-semibold">{pagination.totalPages}</span>
                {pagination.totalItems && (
                  <span className="ml-2">
                    ({pagination.totalItems} total items)
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* First Page Button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isPending}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              First
            </button>

            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isPending}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isPending}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>

            {/* Last Page Button */}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages || isPending}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Last
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default InventoryPage;
