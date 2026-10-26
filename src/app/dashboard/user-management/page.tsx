"use client"
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const UserManagementTable = dynamic(
    () => import("@/components/tables/user-management-table").then((mod) => ({ default: mod.UserManagementTable })),
    {
        loading: () => <div className="bg-white p-6 rounded-2xl shadow-sm animate-pulse h-96" />,
        ssr: false
    }
);

const HeaderData = dynamic(
    () => import("@/components/header/header-data").then((mod) => ({ default: mod.HeaderData })),
    {
        loading: () => <div className="bg-white p-4 rounded-2xl shadow-sm animate-pulse h-20" />,
        ssr: false
    }
);

export default function UserManagementPage() {
    const [invitedUserData, setInvitedUserData] = useState<{
        firstName: string
        lastName: string
        email: string
    } | null>(null)
    const [isCreatingUser, setIsCreatingUser] = useState(false)

    const handleAddSalesperson = async (data: {
        firstName: string
        lastName: string
        role: string
        email: string
        phoneNumber: string
    }) => {
        setIsCreatingUser(true)
        // Simulate creation delay
        await new Promise((resolve) => setTimeout(resolve, 300))
        setIsCreatingUser(false)
        setInvitedUserData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email
        })
        toast.success(`User ${data.firstName} ${data.lastName} created successfully!`)
    }

    const handleInviteSent = () => {
        // Controlled by invitedUserData
    }

    return (
        <main className="min-h-screen">
            <div className="w-full space-y-4 sm:space-y-6 py-4 sm:py-1">
                <HeaderData
                    heading="User Management"
                    showLocationDropdown={true}
                    showShopDropdown={false}
                    showSKUDropdown={false}
                    showSalespersonDropdown={false}
                    showExportReportsButton={true}
                    onAddSalesperson={handleAddSalesperson}
                    onInviteSent={handleInviteSent}
                    searchIsWorking={false}
                    invitedUserData={invitedUserData}
                    onSuccessModalClose={() => setInvitedUserData(null)}
                    isCreatingUser={isCreatingUser}
                />
                {/* User Management Table */}
                <UserManagementTable />
            </div>
        </main>
    )
}

