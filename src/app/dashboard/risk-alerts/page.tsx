"use client"
import React from 'react'
import CriticalDashboard from '@/components/critical-dashboard'
import { UploadCentreTable } from '@/components/tables'
import { HeaderData } from '@/components/header/header-data'
import { DashboardErrorBoundary, DataErrorBoundary } from '@/common/error-boundaries'
// import { useRiskAndAlert } from '@/hooks/api/useRiskAndAlert'


const RiskAlerts = () => {

    return (
        <DashboardErrorBoundary
            dashboardType="main"
            onDataRefresh={() => window.location.reload()}
        >
            <div className='space-y-4'>
                <section>
                    <HeaderData
                        heading="Risk and alerts"
                        showLocationDropdown={false}
                        showShopDropdown={true}
                        showSKUDropdown={true}
                        showSalespersonDropdown={false}
                        showExportReportsButton={false}
                        searchIsWorking={false}
                    />
                </section>
                <section>
                    <DataErrorBoundary
                        apiEndpoint="/api/dashboard/critical-metrics"
                        queryKeys={[['critical-metrics']]}
                        enableOfflineMode={false}
                    >
                        <CriticalDashboard />
                    </DataErrorBoundary>
                </section>
                {/* <section>
                    <DataErrorBoundary
                        apiEndpoint="/api/sales-velocity"
                        queryKeys={[['sales-velocity']]}
                    >
                        <UploadCentreTable heading="Sales Velocity Report" col1="Seller Name" col2="Product Name" col3="Size" col4="Qty Sold" col5="Status" />
                    </DataErrorBoundary>
                </section> */}
            </div>
        </DashboardErrorBoundary>
    )
}

export default RiskAlerts
