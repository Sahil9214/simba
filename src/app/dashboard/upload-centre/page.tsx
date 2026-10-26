"use client"
import React from 'react'
import UploadCentreComponent from './upload-centre'
import InsufficientPermission from '@/components/auth/InsufficentPermissions'
import { HeaderData } from '@/components/header/header-data'
import { useCanManageUsers } from '@/hooks/api/useUserManagement'
const UploadCentre = () => {

    const permissions = useCanManageUsers()
    if (!permissions.canViewAllUsers) {
        return <InsufficientPermission />
    }

    return (
        <div className='space-y-4'>
            {/* <div className="flex items-center justify-between">
                <h1 className="text-lg sm:text-xl font-bold leading-6 sm:leading-8 text-charcoal-black flex-1 text-center md:text-left">
                    Upload Centre
                </h1>
            </div> */}
            <HeaderData
                heading="Upload Centre"
                showLocationDropdown={false}
                showProductTypeDropdown={false}
                showSalespersonDropdown={false}
                showExportReportsButton={false}
                searchIsWorking={false}
            />

            <UploadCentreComponent />
        </div>
    )
}

export default UploadCentre
