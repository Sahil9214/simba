import React from 'react'

export const MarketShareHeaderData = ({ marketShareData }: { marketShareData: any }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-primary">
          {marketShareData?.data?.comprehensive.summary?.totalShops || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          Total Shops
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#4ADE80]">
          {marketShareData?.data?.comprehensive
            .summary?.totalBEERShops || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          Beer Shops
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#955EFF]">
          {marketShareData?.data?.comprehensive?.summary?.totalIMFLShops || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          IMFL Shops
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#FACC15]">
          {marketShareData?.data?.comprehensive?.summary?.totalMarketUnits?.toLocaleString() || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          Total Market Units
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#44AA65]">
          {marketShareData?.data?.comprehensive?.summary?.totalBEERUnits?.toLocaleString() || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-center text-sidebar-foreground">
          Beer Units
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#955EFF]">
          {marketShareData?.data?.comprehensive?.summary?.totalIMFLUnits?.toLocaleString() || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          IMFL Units
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-[#EC4899]">
          {marketShareData?.data?.comprehensive?.summary?.totalCombinedShops || 0}
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          Combined Shops
        </div>
      </div>

      <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="font-inter font-bold text-2xl leading-[120%] text-primary">
          {marketShareData?.data?.comprehensive?.summary?.targetBrandShare || 0}%
        </div>
        <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
          Brand Share
        </div>
      </div>
      {marketShareData?.data?.comprehensive?.summary?.benchmark && (
        <>
          {/* Current Month */}
          {/* {marketShareData.data.comprehensive.summary.benchmark.currentMonth && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-primary">
                {marketShareData.data.comprehensive.summary.benchmark.currentMonth}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Current Month
              </div>
            </div>
          )} */}

          {/* Days in Industry Month */}
          {/* {marketShareData.data.comprehensive.summary.benchmark.daysInIndustryMonth !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#3B82F6]">
                {marketShareData.data.comprehensive.summary.benchmark.daysInIndustryMonth}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Days in Industry Month
              </div>
            </div>
          )} */}

          {/* Days Elapsed Current Month */}
          {/* {marketShareData.data.comprehensive.summary.benchmark.daysElapsedCurrentMonth !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#10B981]">
                {marketShareData.data.comprehensive.summary.benchmark.daysElapsedCurrentMonth}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Days Elapsed
              </div>
            </div>
          )} */}

          {/* Overall Benchmark Variance */}
          {marketShareData.data.comprehensive.summary.benchmark.overallBenchmarkVariancePercent !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`font-inter font-bold text-2xl leading-[120%] ${marketShareData.data.comprehensive.summary.benchmark.overallBenchmarkVariancePercent >= 0
                ? 'text-green-600'
                : 'text-red-600'
                }`}>
                {marketShareData.data.comprehensive.summary.benchmark.overallBenchmarkVariancePercent > 0 ? '+' : ''}
                {marketShareData.data.comprehensive.summary.benchmark.overallBenchmarkVariancePercent}%
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Benchmark Variance
              </div>
            </div>
          )}

          {/* Shops Ahead */}
          {marketShareData.data.comprehensive.summary.benchmark.shopsAhead !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#10B981]">
                {marketShareData.data.comprehensive.summary.benchmark.shopsAhead}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Shops Ahead
              </div>
            </div>
          )}

          {/* Shops Behind */}
          {marketShareData.data.comprehensive.summary.benchmark.shopsBehind !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#EF4444]">
                {marketShareData.data.comprehensive.summary.benchmark.shopsBehind}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Shops Behind
              </div>
            </div>
          )}

          {/* Shops On Track */}
          {marketShareData.data.comprehensive.summary.benchmark.shopsOnTrack !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#F59E0B]">
                {marketShareData.data.comprehensive.summary.benchmark.shopsOnTrack}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Shops On Track
              </div>
            </div>
          )}

          {/* Total Mapped SKUs */}
          {/* {marketShareData.data.comprehensive.summary.benchmark.totalMappedSKUs !== undefined && (
            <div className="flex flex-col items-center p-4 gap-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="font-inter font-bold text-2xl leading-[120%] text-[#8B5CF6]">
                {marketShareData.data.comprehensive.summary.benchmark.totalMappedSKUs.toLocaleString()}
              </div>
              <div className="font-inter font-medium text-xs leading-[120%] text-sidebar-foreground text-center">
                Total Mapped SKUs
              </div>
            </div>
          )} */}
        </>
      )}
    </div>    
  )
}
