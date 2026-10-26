"use client"
import React, { useState } from "react";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import { useCanManageUsers, useUserStatistics, useCreateUser, useDeleteUser, useToggleUserStatus } from "@/hooks/api/useUserManagement";
import InsufficientPermission from "@/components/auth/InsufficentPermissions";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { getErrorByType } from "next/dist/next-devtools/dev-overlay/utils/get-error-by-type";
import { getErrorHandler } from "@/utils/errorHandler";

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
    const { profile } = useAuth()
    const permissions = useCanManageUsers()

    const { mutate: deleteUser } = useDeleteUser()
    const { mutate: toggleUser } = useToggleUserStatus();
    const { mutate: createUserMutation, isPending: isCreatingUser, isError: hasError, isSuccess: isSuccessful } = useCreateUser()
    const [invitedUserData, setInvitedUserData] = useState<{
        firstName: string
        lastName: string
        email: string
    } | null>(null)

    if (!permissions.canViewAllUsers) {
        return (
            <InsufficientPermission
                requiredRole=" Super Admin"
                currentRole={profile?.role}
                feature="User Management"
            />
        )
    }

    const handleAddSalesperson = async (data: {
        firstName: string
        lastName: string
        role: string
        email: string
        phoneNumber: string
    }) => {
        // Generate a temporary password (user should reset on first login)
        const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!1`

        return new Promise<void>((resolve, reject) => {
            createUserMutation({
                email: data.email,
                password: tempPassword,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phoneNumber,
                role: data.role as any
            }, {
                onSuccess: () => {
                    // Store user data for success modal
                    setInvitedUserData({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email
                    })
                    resolve()
                },
                onError: (err) => {

                    reject(err)
                }
            })
        })
    }

    const handleInviteSent = () => {
        // This is called when success modal should be shown
        // The success modal will be controlled by invitedUserData state
    }

    const onDelete = (user: any) => {
        deleteUser(user.id)
    };


    const toggleUserStatus = (user: any) => {
        const { id, is_active } = user;
        toggleUser({ userId: id, is_active: !is_active })
    }

    const onEdit = (user: any) => {
        console.log(user)
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
                <UserManagementTable
                    onDelete={onDelete}
                    toggleUserStatus={toggleUserStatus}
                    onEdit={onEdit}
                />
            </div>
        </main>
    )
}
