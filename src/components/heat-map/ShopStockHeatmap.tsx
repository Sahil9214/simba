"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2, Search, Copy, Printer, X, PlusCircle, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { cn } from '@/lib/utils'
import { useShopBrandStock, type StockLevel as ApiStockLevel } from '@/hooks/useShopBrandStock'
import { useDebounced } from '@/hooks/useDebounce';
import { Input } from '../ui/input'
import { ChartHeadings } from '@/common/chartHeadings'
import { ExportReportsButton } from '@/components/ui/export-reports-button'

interface StockLevel {
  value: number
  bgColor: string
  textColor: string
  hoverColor: string
}

interface ShopBrandData {
  shop: string
  dpCode: string | null
  brands: {
    [brandName: string]: StockLevel
  }
  brandCode?: string
  companyCode?: string
}

interface ShopStockHeatmapProps {
  searchTerm?: string
  selectedLocation?: string,
  limit?: number,
  category?: string
}

// Simplified stock level - only zero vs actual values
const getStockLevel = (stock: number): StockLevel => {
  if (stock === 0) {
    return {
      value: stock,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
      hoverColor: 'hover:bg-gray-200'
    }
  } else {
    return {
      value: stock,
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      hoverColor: 'hover:bg-green-300'
    }
  }
}

export const ShopStockHeatmap: React.FC<ShopStockHeatmapProps> = ({ category, limit }) => {
  const [searchShop, setSearchShop] = useState<string>("");
  const debouncedSearchShop = useDebounced(searchShop, 500);
  const [isLetterOpen, setIsLetterOpen] = useState<boolean>(false);
  const [letterHtml, setLetterHtml] = useState<string>("");
  const [selectedShopName, setSelectedShopName] = useState<string>("");
  const editableRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Pagination state
  const ITEMS_PER_PAGE = 10;
  const [currentOffset, setCurrentOffset] = useState<number>(0);
  const [accumulatedData, setAccumulatedData] = useState<any[]>([]);
  const scrollThrottleRef = useRef<NodeJS.Timeout | null>(null);
  const hasMoreDataRef = useRef<boolean>(true);
  const isLoadingMoreRef = useRef<boolean>(false);
  const isInitialLoadRef = useRef<boolean>(true);

  // Trim and normalize search term - only pass if not empty
  const normalizedSearchTerm = useMemo(() => {
    return debouncedSearchShop.trim() || undefined;
  }, [debouncedSearchShop]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentOffset(0);
    setAccumulatedData([]);
    hasMoreDataRef.current = true;
    isLoadingMoreRef.current = false;
    isInitialLoadRef.current = true;
    // Reset scroll position when search changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [normalizedSearchTerm, category]);

  const { data: apiData, isLoading, error, isFetching } = useShopBrandStock({
    searchTerm: normalizedSearchTerm,
    category: category,
    limit: ITEMS_PER_PAGE,
    offset: currentOffset,
  });

  // Accumulate data when new data arrives
  useEffect(() => {
    if (apiData && !isLoading) {

      if (currentOffset === 0) {
        // First load or reset - replace all data
        setAccumulatedData(apiData.data);
        isInitialLoadRef.current = false;
      } else {
        // Subsequent loads - append new data
        setAccumulatedData(prev => {
          // Avoid duplicates by checking shopName
          const existingShopNames = new Set(prev.map((shop: ShopBrandData) => shop.shop));
          const newShops = apiData.data.filter((shop: any) => !existingShopNames.has(shop.shopName));
          return [...prev, ...newShops];
        });
      }

      // Check if we have more data
      if (apiData.data.length < ITEMS_PER_PAGE) {
        hasMoreDataRef.current = false;
      } else {
        hasMoreDataRef.current = true;
      }

      isLoadingMoreRef.current = false;
    }
  }, [apiData, isLoading, currentOffset]);

  // Reset loading flag on error to allow retry
  useEffect(() => {
    if (error) {
      isLoadingMoreRef.current = false;
    }
  }, [error]);

  // Transform accumulated data to component format
  const transformedData: ShopBrandData[] = useMemo(() => {
    if (!accumulatedData || accumulatedData.length === 0) return [];

    return accumulatedData.map(shop => ({
      shop: shop.shopName,
      dpCode: shop.dpCode,
      brands: Object.entries(shop.brands).reduce((acc, [brandName, stockData]) => {
        const stock = stockData as ApiStockLevel;
        acc[brandName] = getStockLevel(stock.closingStock);
        return acc;

      }, {} as { [brandName: string]: StockLevel })
    }));
  }, [accumulatedData])

  // Calculate summary stats - simplified to zero vs in-stock
  const summaryStats = useMemo(() => {
    let zeroStockCount = 0
    let inStockCount = 0

    transformedData.forEach((shop: ShopBrandData) => {
      Object.values(shop.brands).forEach((brand: StockLevel) => {
        if (brand.value === 0) {
          zeroStockCount++
        } else {
          inStockCount++
        }
      })
    })

    return {
      zeroStock: zeroStockCount,
      inStock: inStockCount
    }
  }, [transformedData])


  const handleExport = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

      const response = await fetch(`${API_BASE_URL}/api/stocks/shop-brand-stock?daysBack=30&isExport=true`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch export data');
      }

      const result = await response.json();

      if (!result.success || !result.data || result.data.length === 0) {
        console.warn('No data available for export');
        return;
      }

      const exportData = result.data;

      // Get all unique brand names from the data
      const allBrands = new Set<string>();
      exportData.forEach((shop: any) => {
        Object.keys(shop.brands).forEach((brand: string) => allBrands.add(brand));
      });
      const brandNames = Array.from(allBrands).sort();

      // Create CSV headers
      const headers = ['Shop Name', ...brandNames];

      // Create CSV rows
      const rows = exportData.map((shop: any) => {
        const row = [shop.shopName];
        brandNames.forEach((brandName: string) => {
          const brandData = shop.brands[brandName];
          if (brandData) {
            row.push(brandData.closingStock.toString());
          } else {
            row.push('0');
          }
        });
        return row;
      });

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map((field: string) => `"${field}"`).join(','))
        .join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `shop-stock-heatmap-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };



  // Get unique brand names
  const brandNames = useMemo(() => {
    if (transformedData.length === 0) return []
    // Get all unique brand names across all shops
    const allBrands = new Set<string>()
    transformedData.forEach((shop: ShopBrandData) => {
      Object.keys(shop.brands).forEach((brand: string) => allBrands.add(brand))
    })
    return Array.from(allBrands).sort()
  }, [transformedData]);

  //Generate and download pdf

  const generateLetterHtml = (
    shopName: string,
    dpCode: string,
    brandNamesForRows: string[],
    brandCode: string,
    companyCode: string
  ) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-GB");

    const ensureAtLeast = Math.max(1, brandNamesForRows.length);

    const rows = Array.from({ length: ensureAtLeast })
      .map((_, idx) => {
        const raw = brandNamesForRows[idx] ?? "";
        const m = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        const brandBase = (m ? m[1] : raw).trim();
        const size = m ? m[2] : "";

        return `
          <tr>
            <td class="cell cell-center">${idx + 1}</td>
            <td class="cell cell-left">${brandBase}</td>
            <td class="cell cell-left">${size}</td>
            <td class="cell cell-left">${dpCode || ""}</td>
            <td class="cell cell-left">${brandCode || ""}</td>
            <td class="cell cell-left">${companyCode || ""}</td>
          </tr>
        `;
      })
      .join("");

    return `
      <div class="letter-container">
        <style>
          /* ===== GLOBAL TEXT SIZE ===== */
          .letter-container {
            font-family: Inter, Greist, sans-serif;
            color: #111;
            max-width: 900px;
            margin: 0 auto;
            padding: 12px;
            font-size: 14px; /* 🔥 SINGLE SOURCE OF TRUTH */
          }

          .letter-title {
            text-align: center;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-size:20px
          }

          .letter-meta {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }

          .letter-subject,
          .letter-p {
            margin: 8px 0;
          }

          .table-wrapper {
            width: 100%;
            overflow-x: auto;
            margin: 16px 0;
          }

          table.letter-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 500px;
          }

          .letter-table thead tr {
            background: #f4f4f5;
          }

          .letter-table th,
          .letter-table td {
            border: 1px solid #222;
            padding: 6px;
          }

          .cell-center {
            text-align: center;
          }

          .cell-left {
            text-align: left;
          }

          .footer-address {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            margin-top: 32px;
            flex-wrap: wrap;
          }

          .footer-address > div {
            flex: 1 1 260px;
          }

          /* ===== RESPONSIVE (NO FONT SIZE CHANGE) ===== */
          @media (max-width: 640px) {
            .letter-container {
              padding: 8px;
            }

            .letter-meta {
              flex-direction: column;
              align-items: flex-start;
            }

            .letter-table th,
            .letter-table td {
              padding: 4px;
            }
          }

          /* ===== PRINT ===== */
          @media print {
            .letter-container {
              max-width: none;
              padding: 0;
            }

            .table-wrapper {
              overflow: visible;
            }
          }
        </style>

        <div class="letter-title">Raipur Bottling Private Limited</div>

        <div class="letter-meta">
          <div>
            TO,<br />
            The Manager (IMFL),<br />
            DCCWS LTD.<br />
            MOTI NAGAR,<br />
            NEW DELHI
          </div>
          <div><strong>Dated:</strong> ${dateStr}</div>
        </div>

        <div class="letter-subject">
          <strong>Subject:</strong> Request for Zero factor shop Vodka Order
        </div>

        <p class="letter-p">Dear Sir,</p>

        <p class="letter-p">
          I would like to request your approval to release the order for zero factor shop
          of our Vodka orders as per attached. Please find below the company detail with
          the brand name, MRP, Brand Code orders as per attached Outlet wise allocation for
          <strong>${shopName}</strong>.
        </p>

        <div class="table-wrapper">
          <table class="letter-table">
            <thead>
              <tr>
                <th>S.NO</th>
                <th class="cell-left">BRAND NAME</th>
                <th class="cell-left">SIZE</th>
                <th class="cell-left">Area Code</th>
                <th class="cell-left">Brand Code</th>
                <th class="cell-left">Company Code</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <p class="letter-p">Kindly do the needful and oblige.</p>

        <p class="letter-p" style="margin: 16px 0 24px;">
          Thanking you,<br />
          Yours Faithfully,
        </p>

        <div style="font-weight: 700; margin-bottom: 40px;">
          For RAIPUR BOTTLING PVT LTD.
        </div>

        <div class="footer-address">
          <div>
            <strong>Bond Add:</strong> ${shopName}<br />
            New Delhi-110064.
          </div>

          <div style="text-align: right;">
            <strong>Reg. Address:</strong> Raipur Bottling PVT Limited<br />
            Vill, Bahankadi, Mandir Hasaud, Raipur,<br />
            Chhattisgarh - 492101<br />
            Phone Number: 77720-32721<br />
            CIN: U15400CT2020PT009970
          </div>
        </div>
      </div>
    `;
  };


  // Add this function in ShopStockHeatmap component
  const handleZeroStockClick = async (shop: any) => {

    const shopName: string = shop?.shop ?? "";
    setSelectedShopName(shopName);
    const dpCode = shop?.dpCode ?? "";
    const brandCode = shop?.brandCode ?? "";
    const companyCode = shop?.companyCode ?? "";

    const allBrandNames = Object.keys(shop?.brands ?? {});
    setLetterHtml(generateLetterHtml(shopName, dpCode, allBrandNames, brandCode, companyCode));
    setIsLetterOpen(true);
  };

  // Load initial HTML into the editor only when opening or when template regenerates
  useEffect(() => {
    if (isLetterOpen && editableRef.current) {
      editableRef.current.innerHTML = letterHtml;
    }
  }, [isLetterOpen, letterHtml]);

  const copyLetterToClipboard = async () => {
    const container = editableRef.current;
    if (!container) return;
    const html = container.innerHTML;
    const plain = container.innerText;
    try {
      if (navigator.clipboard && (window as any).ClipboardItem) {
        const data = new (window as any).ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' })
        });
        await (navigator.clipboard as any).write([data]);
      } else {
        const range = document.createRange();
        range.selectNodeContents(container);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        document.execCommand('copy');
        sel?.removeAllRanges();
      }
      // optional toast could be placed here
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const printLetter = () => {
    const container = editableRef.current;
    if (!container) return;
    const printWindow = window.open('', 'PRINT', 'height=700,width=900');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>${selectedShopName} - Zero Stock Letter</title>
      <style>
        body{font-family:Inter, Arial, sans-serif;color:#111;padding:24px}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #222;padding:6px}
        thead tr{background:#f4f4f5}
      </style>
    </head><body>${container.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const addRowToTable = () => {
    const container = editableRef.current;
    if (!container) return;
    const tbody = container.querySelector('table tbody');
    if (!tbody) return;
    const currentCount = tbody.querySelectorAll('tr').length;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="border:1px solid #222;padding:6px;text-align:center;">${currentCount + 1}</td>
      <td style="border:1px solid #222;padding:6px;"></td>
      <td style="border:1px solid #222;padding:6px;"></td>
      <td style="border:1px solid #222;padding:6px;"></td>`;
    tbody.appendChild(tr);
  };

  const resetTemplate = () => {
    setLetterHtml(generateLetterHtml(selectedShopName, '', [], '', ''));
  };

  // Scroll handler for pagination - Instagram-like smooth infinite scroll
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      // Clear existing throttle
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }

      // Throttle scroll events - check every 150ms for smoother experience
      scrollThrottleRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;

        // Safety check: avoid division by zero
        if (scrollHeight === 0 || clientHeight === 0) {
          scrollThrottleRef.current = null;
          return;
        }

        const scrollBottom = scrollTop + clientHeight;
        const distanceFromBottom = scrollHeight - scrollBottom;
        const threshold = 300; // Load when 300px from bottom (instead of percentage)

        // Load more when user is near the bottom
        // Only load if:
        // 1. We have more data available
        // 2. We're not currently loading more
        // 3. We're not fetching (React Query)
        // 4. We have existing data to show
        // 5. No error state
        if (
          distanceFromBottom <= threshold &&
          hasMoreDataRef.current &&
          !isLoadingMoreRef.current &&
          !isFetching &&
          !isLoading &&
          !error &&
          accumulatedData.length > 0
        ) {
          isLoadingMoreRef.current = true;
          setCurrentOffset(prev => {
            // Double-check we're not already at this offset (race condition protection)
            const newOffset = prev + ITEMS_PER_PAGE;
            return newOffset;
          });
        }

        scrollThrottleRef.current = null;
      }, 150);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    // Also check immediately in case user is already at bottom
    handleScroll();

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollThrottleRef.current) {
        clearTimeout(scrollThrottleRef.current);
      }
    };
  }, [isLoading, isFetching, accumulatedData.length, error]);




  return (
    <Card className="font-inter  bg-white  w-full">
      <CardHeader className="px-4 py-0">
        <div className="flex flex-col lg:flex-row justify-between items-start sm:items-center gap-3 w-full">
          {/* Title */}
          <ChartHeadings heading="Shop-wise Closing Stock Heatmap" description="This dashboard visualizes shop-level closing stock by brand. Shows actual stock values with color coding for zero vs in-stock items." />
          <div className="flex flex-col lg:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder-gray" />
              <Input
                placeholder="Search by shop"
                value={searchShop}

                onChange={(e) => setSearchShop(e.target.value)}
                className="w-full h-10 pl-10 pr-3 border border-[#E5E5E5] rounded-lg text-sm text-placeholder-gray focus:ring-0 focus:border-[#E5E5E5]"
              />
            </div>

            {/* Export Button */}
            <ExportReportsButton
              onClick={() => handleExport()}
              size="md"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        {/* Description */}
        <CardDescription className="font-inter mt-2 text-sm text-gray-500 leading-5">

        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Initial Loading State - only show when no data exists */}
        {isLoading && isInitialLoadRef.current && accumulatedData.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600">Loading shop stock data...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-red-900 font-inter text-sm">Failed to load data</p>
                  <p className="text-red-800 font-inter text-sm">
                    {error instanceof Error ? error.message : 'An error occurred while fetching stock data'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && transformedData.length === 0 && accumulatedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-semibold mb-2">No data available</p>
            <p className="text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}

        {/* Data Content */}
        {transformedData.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200 bg-green-100">
                <CardContent className="py-4 px-4 flex items-center justify-between">
                  <div className="text-sm text-green-700 font-inter mb-1">In Stock</div>
                  <div className="text-sm font-bold text-green-600">{apiData?.total_instock ?? 0}</div>
                </CardContent>
              </Card>
              <Card className="border-gray-200 bg-muted">
                <CardContent className="py-4 px-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 font-inter mb-1">Zero Stock</div>
                  <div className="text-sm font-bold text-gray-600">{apiData?.total_outstock ?? 0}</div>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            <div className="flex lg:flex-row flex-col items-center justify-between gap-6 text-sm font-inter ">
              <div className="flex flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-green-100 border border-blue-200"></div>
                  <span className="text-gray-700 text-sm">In Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md bg-gray-100 border border-gray-200"></div>
                  <span className="text-gray-700 text-sm">Zero Stock</span>
                </div>
              </div>
              {/* <div className="ml-auto font-inter text-sm text-gray-600">
                {summaryStats.zeroStock} zero stock • {summaryStats.inStock} in stock
              </div> */}
            </div>

            {/* Heatmap Grid with proper gaps */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto relative font-inter overflow-y-auto max-h-[400px] scrollbar-custom"
            >
              <div className="inline-block mx-auto">
                {/* Header Row */}
                <div className="grid gap-3 sticky top-0 bg-white mb-3 z-10" style={{ gridTemplateColumns: `minmax(150px, 200px) repeat(${brandNames.length}, minmax(180px, 1fr))` }}>
                  <div className="bg-muted rounded-lg py-4 px-4 text-sm font-semibold text-foreground font-inter flex items-center sticky left-0 z-20">
                    Shop / Brand
                  </div>
                  {brandNames.reverse().slice(0, limit || brandNames.length).map((brand) => (
                    <div
                      key={brand}
                      className="bg-muted rounded-lg py-4 px-4 text-sm font-semibold text-foreground font-inter flex items-center justify-center z-0"
                    >
                      {brand}
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                <div className="space-y-3">
                  {transformedData.map((shop: ShopBrandData, shopIndex: number) => (
                    <div
                      key={shopIndex}
                      className="grid gap-3 "
                      style={{ gridTemplateColumns: `minmax(150px, 200px) repeat(${brandNames.length}, minmax(180px, 1fr))` }}
                    >
                      {/* Shop Name */}
                      <div className="bg-muted rounded-lg py-3 px-4 text-sm font-medium text-foreground font-inter flex items-center sticky left-0 z-0 border-r border-gray-200">
                        {shop.shop}
                      </div>

                      {/* Brand Stock Cells */}
                      {brandNames.map((brandName) => {
                        const stock = shop.brands[brandName]

                        if (!stock) {
                          return (
                            <div
                              key={brandName}
                              onClick={() => handleZeroStockClick(shop)}
                              className="rounded-lg py-4 px-4 flex items-center justify-center bg-gray-100 text-gray-500 text-sm font-bold"
                            >
                              Zero Stock
                            </div>
                          )
                        }

                        return (
                          <div
                            key={brandName}
                            className={cn(
                              "rounded-lg py-4 px-4 flex items-center justify-center transition-all duration-200 cursor-pointer",
                              "border border-transparent hover:border-gray-300 hover:shadow-md",
                              stock.bgColor,
                              stock.textColor,
                              stock.hoverColor
                            )}
                            onClick={() => {
                              if (stock.value === 0) {
                                handleZeroStockClick(shop);
                              }
                            }}
                          >
                            <div className="text-sm font-bold">{stock.value > 0 ? "In Stock" : "Zero Stock"}</div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
              {/* Loading More Indicator - only show when loading more data (not initial) */}
              {isLoading && transformedData.length > 0 && !isInitialLoadRef.current && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-gray-600">Loading more shops...</span>
                </div>
              )}
              {/* End of data indicator */}
              {!isLoading && !hasMoreDataRef.current && transformedData.length > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-sm text-gray-500">All shops loaded ({transformedData.length} total)</span>
                </div>
              )}
            </div>

            {/* Key Insight */}
            {summaryStats.zeroStock > 0 && (
              <Card className="border border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-900 font-inter text-sm">Key Insight:</p>
                      <p className="text-amber-800 font-inter text-sm">
                        {apiData?.total_outstock ?? 0} item{apiData?.total_outstock ?? 4 > 1 ? 's have' : ' has'} zero stock - requires immediate attention for stock replenishment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
      {/* Letter Modal */}
      {isLetterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsLetterOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[min(900px,90vw)] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold text-sm">Zero Stock Letter — {selectedShopName}</div>
              <button className="p-1 hover:bg-muted rounded cursor-pointer" onClick={() => setIsLetterOpen(false)} aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap lg:flex-row items-center gap-2 px-4 py-2 border-b">
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-900 text-white rounded cursor-pointer transition-all active:scale-95 active:translate-y-[1px]"
                onClick={copyLetterToClipboard}
              >
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded border cursor-pointer transition-all active:scale-95 active:translate-y-[1px]"
                onClick={printLetter}
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded border cursor-pointer transition-all active:scale-95 active:translate-y-[1px]"
                onClick={addRowToTable}
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Row
              </button>
              <button
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded border cursor-pointer transition-all active:scale-95 active:translate-y-[1px]"
                onClick={resetTemplate}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <span className="text-[11px] text-gray-500 ml-auto">Tip: Paste directly in your email composer (tables preserved)</span>
            </div>
            <div className="p-4 overflow-auto" style={{ maxHeight: '65vh' }}>
              <div
                ref={editableRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
