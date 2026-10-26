"use client"
import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { CylindericalChartSkeleton, LineChartSkeleton } from '@/common/skeleton'
import { StoreChartSkeleton } from '@/common/skeleton/StoreReportVsFieldChartSkeleton'
import { dark_node, light_node } from '@/assets/icons'
import { DashboardErrorBoundary, ChartErrorBoundary } from '@/common/error-boundaries'
import { salesByPackSizeColors, topPerformingProductsColors, topResellerColors, breakageBySKUColors, dpCodesColors } from '@/lib/colors'

// Dynamic imports for heavy components with loading states
const AnalyticsBanner = dynamic(
    () => import('@/components/analyticsBanner').then(mod => ({ default: mod.AnalyticsBanner })),
    {
        loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-32" />,
        ssr: false
    }
)

const DataDonutCard = dynamic(
    () => import('@/components/chart').then(mod => ({ default: mod.DataDonutCard })),
    {
        loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
        ssr: false
    }
)

const DonutChart = dynamic(
    () => import('@/components/chart').then(mod => ({ default: mod.DonutChart })),
    {
        loading: () => <LineChartSkeleton />,
        ssr: false
    }
)

const PeerComparisonChart = dynamic(
    () => import('@/components/chart').then(mod => ({ default: mod.PeerComparisonChart })),
    {
        loading: () => <CylindericalChartSkeleton />,
        ssr: false
    }
)

const StoreReportVsFieldChart = dynamic(
    () => import('@/components/chart').then(mod => ({ default: mod.StoreReportVsFieldChart })),
    {
        loading: () => <StoreChartSkeleton />,
        ssr: false
    }
)

const ReportingGapsCard = dynamic(
    () => import('@/components/reporting').then(mod => ({ default: mod.ReportingGapsCard })),
    {
        loading: () => <LineChartSkeleton />,
        ssr: false
    }
)

const InsightStream = dynamic(
    () => import('@/components/InsightStream').then(mod => ({ default: mod.InsightStream })),
    {
        loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-48" />,
        ssr: false
    }
)

const UploadCentreTable = dynamic(
    () => import('@/components/tables').then(mod => ({ default: mod.UploadCentreTable })),
    {
        loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
        ssr: false
    }
)

const HeaderData = dynamic(
    () => import('@/components/header/header-data').then(mod => ({ default: mod.HeaderData })),
    {
        loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />,
        ssr: false
    }
)

const DpCodePieChart = dynamic(
    () => import('@/components/chart/dp-code-pie-chart').then(mod => ({ default: mod.DpCodePieChart })),
    {
        loading: () => <LineChartSkeleton />,
        ssr: false
    }
)

const SalesAnalytics = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('All');

    return (
        <DashboardErrorBoundary
            dashboardType="analytics"
            onDataRefresh={() => window.location.reload()}
        >
            <div className='space-y-4'>
                <section>
                    <HeaderData
                        heading="Sales Analytics"
                        showLocationDropdown={true}
                        showShopDropdown={true}
                        showSKUDropdown={true}
                        showSalespersonDropdown={true}
                        showExportReportsButton={true}
                    />
                </section>

                <section>
                    <AnalyticsBanner searchTerm={searchTerm} selectedLocation={selectedLocation} />
                </section>

                {/* Two DataDonutCard side-by-side */}
                <section className="flex mt-5 flex-col lg:flex-row gap-2 bg-white shadow-sm px-4 pt-4 pb-0 rounded-2xl">
                    <div className="w-full lg:w-1/2">
                        <ChartErrorBoundary chartType="donut" chartTitle="Top Performing Products">
                            <DataDonutCard
                                title="Top Performing Products"
                                subtitle="This section showcases the performance of our best-selling products and their growth."
                                dataSource="topPerformingProducts"
                                transform={(raw) =>
                                    raw.data?.items?.map((i: any) => ({
                                        key: String(i.id),
                                        label: i.name,
                                        value: Number(i.units),
                                    })) || []
                                }
                                controls={{ sort: false }}
                                colors={topPerformingProductsColors}
                                showCenterData={true}
                                listShownButton={false}
                                searchTerm={searchTerm}
                                selectedLocation={selectedLocation}
                            />
                        </ChartErrorBoundary>
                    </div>

                    <div className="hidden md:border-2 border-tertiary-color md:block mx-4" />

                    <div className="w-full lg:w-1/2">
                        <ChartErrorBoundary chartType="donut" chartTitle="Top Resellers">
                            <DataDonutCard
                                title="Top Resellers (Shops)"
                                subtitle="This section highlights the performance of Simba's leading reseller shops based on units sold and their contribution to overall growth."
                                transform={(raw) =>
                                    raw.data?.map((s: any) => ({
                                        key: s.shopId,
                                        label: s.shopName,
                                        value: s.totalStock,
                                    })) || []
                                }
                                colors={topResellerColors}
                                controls={{ sort: true, filter: false }}
                                dataSource="topResellersShops"
                                listShownButton={false}
                                searchTerm={searchTerm}
                                selectedLocation={selectedLocation}
                            />
                        </ChartErrorBoundary>
                    </div>
                </section>

                <section className="flex mt-5 flex-col lg:flex-row gap-2 bg-white shadow-sm px-4 pt-4 pb-0 rounded-2xl">
                    <div className="w-full lg:w-1/2">
                        <ChartErrorBoundary chartType="donut" chartTitle="Demand by SKU">
                            <DataDonutCard
                                title="Demand by SKU"
                                subtitle="Visualize demand concentration across top SKUs. Helps identify high-demand products that drive fulfillment planning and inventory allocation."
                                dataSource="demandBySku"
                                controls={{ sort: true }}
                                colors={breakageBySKUColors}
                                listShownButton={false}
                                searchTerm={searchTerm}
                                selectedLocation={selectedLocation}
                            />
                        </ChartErrorBoundary>
                    </div>

                    <div className="hidden md:border-2 border-tertiary-color md:block mx-4" />

                    <div className="w-full lg:w-1/2">
                        <ChartErrorBoundary chartType="donut" chartTitle="Sales by Pack Size">
                            <DataDonutCard
                                title="Sales by Pack Size"
                                subtitle="Breakdown of Simba sales by package size. Use the metric switch to view distribution by units or revenue."
                                colors={salesByPackSizeColors}
                                controls={{ sort: true, filter: false }}
                                filterOptions={[
                                    { id: "Shops", label: "Filter", values: ["Small", "Medium", "Large"] },
                                ]}
                                dataSource="salesByPackSize"
                                listShownButton={false}
                                searchTerm={searchTerm}
                                selectedLocation={selectedLocation}
                            />
                        </ChartErrorBoundary>
                    </div>
                </section>

                {/* ============================================================
                    COMMENTED CODE - FUTURE FEATURES
                    Uncomment below sections when needed
                ============================================================ */}

                {/* Peer Comparison Chart + Overall Sales Split */}
                {/* <section className="flex mt-5 flex-col lg:flex-row gap-4 bg-white shadow-sm p-4 rounded-2xl">
                    <div className="w-full lg:w-[66%]">
                        <ChartErrorBoundary chartType="bar" chartTitle="Peer Comparison">
                            <PeerComparisonChart searchTerm={searchTerm} selectedLocation={selectedLocation} height={320} />
                        </ChartErrorBoundary>
                    </div>

                    <div className="hidden md:border-2 border-tertiary-color md:block ml-8" />

                    <div className="w-full lg:w-[34%] flex flex-col justify-center items-center">
                        <div className="flex items-start justify-between mb-4 w-full">
                            <div>
                                <div className="font-inter text-base leading-normal font-bold flex items-center text-gray-950 h-6">Overall Sales Split
                                </div>
                                <div className="font-inter text-sm" style={{ color: "#737373" }}>Simba vs Peer sales (all shops)</div>
                            </div>
                        </div>

                        <ChartErrorBoundary chartType="donut" chartTitle="Sales Split">
                            <DonutChart
                                apiUrl="/api/dashboard/overall-sales-split"
                                legendPosition="bottom"
                                searchTerm={searchTerm}
                                selectedLocation={selectedLocation}
                                queryKey={['overall-sales-split', searchTerm, selectedLocation]}
                                enabled={true}
                            />
                        </ChartErrorBoundary>
                    </div>
                </section> */}

                {/* Report vs Field chart + Reporting gaps */}
                {/* <section className="flex  flex-col lg:flex-row gap-2 bg-white shadow-sm p-4 rounded-2xl">
                    <div className="w-full lg:w-[34%]">
                        <ReportingGapsCard />
                    </div>

                    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch"></div>

                    <div className="w-full lg:w-[66%]">
                        <StoreReportVsFieldChart
                            color1={"#BAE6FD"}
                            color2={"#0EA5E9"}
                            heading={"Report vs Field Data (Store-wise)"}
                            description={
                                "Compare weekly government report with salesperson's field data to spot discrepancies by store"
                            }
                            feature={true}
                            imageNode1={dark_node}
                            imageNode2={light_node}
                            legend1="Gov"
                            legend2="Field"
                            searchTerm={searchTerm}
                            selectedLocation={selectedLocation}
                        />
                    </div>
                </section> */}

                {/* Reporting Gaps + DP Code Pie Chart */}
                {/* <section className="flex flex-col  lg:flex-row gap-2 bg-white shadow-sm p-4 rounded-2xl">
                    <div className="w-full lg:w-1/2 b">
                        <ReportingGapsCard />
                    </div>
                    <div className="w-[2px] bg-tertiary-color lg:block hidden self-stretch"></div>
                    <div className="w-full lg:w-1/2">
                        <DpCodePieChart
                            colors={dpCodesColors}
                            searchTerm={searchTerm}
                            selectedLocation={selectedLocation}
                        />
                    </div>
                </section> */}

                {/* Insight Stream */}
                {/* <section className="flex mt-5 flex-col lg:flex-row gap-2 bg-white shadow-sm p-4   rounded-2xl">
                    <InsightStream searchTerm={searchTerm} selectedLocation={selectedLocation} />
                </section> */}

                {/* Upload Centre Table - Detailed View */}
                {/* <section>
                    <UploadCentreTable
                        heading="Sales Analytics - Detailed View"
                        extraInfomation='Showing 1 to 10 of 100 files'
                        col1="Seller Name"
                        col2="Product Name"
                        col3="Size"
                        col4="Qty Sold"
                        col5="Status"
                        searchTerm={searchTerm}
                        selectedLocation={selectedLocation}
                        switchForTheTablesProductName={true}
                    />
                </section> */}

            </div>
        </DashboardErrorBoundary>
    )
}

export default SalesAnalytics
