'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSellerProfile } from '@/hooks/api/useSellerProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedDashboardCardProps {
    userName?: string;
    userInitials?: string;
}

export function EnhancedDashboardCard({
    userName,
    userInitials
}: EnhancedDashboardCardProps) {
    const router = useRouter();
    const { data, isLoading, error, refetch }: any = useSellerProfile();
    const { user: authUser } = useAuth();

    // Get user name and initials from JWT auth context
    const displayUserName = userName || (authUser ? `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim() : 'User');
    const displayUserInitials = userInitials || (authUser ? 
        `${authUser.user_metadata?.first_name?.[0] || ''}${authUser.user_metadata?.last_name?.[0] || ''}`.toUpperCase() : 
        'U');

    const handleLogout = () => {
        // Add your logout logic here
        // For example: clear tokens, redirect to login, etc.
        console.log('Logging out...');
        router.push('/');
    };

    const handleRefresh = () => {
        refetch();
    };

    if (error) {
        return (
            <div className="max-w-md mx-auto lg:max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="font-inter text-lg lg:text-xl font-semibold leading-tight text-black flex-none">
                        Hi there, {displayUserName}
                    </h1>
                    <div className="px-3 py-1 rounded-xl bg-purple-100">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="border-0 hover:opacity-80 transition-opacity cursor-pointer font-medium text-purple-700">
                                    {displayUserInitials}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                sideOffset={4}
                                alignOffset={-8}
                                className="w-24 sm:w-28 min-w-fit border-0 shadow-lg mt-1"
                            >
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer justify-center !px-1 !py-1.5"
                                >
                                    <LogOut className="w-3 h-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="rounded-lg p-4 text-center bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm">Failed to load data. Please try again.</p>
                    <Button
                        onClick={handleRefresh}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto lg:max-w-2xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="font-inter text-lg lg:text-xl font-semibold leading-tight text-black flex-none">
                    Hi there, {displayUserName}
                </h1>
                <div className="px-3 py-1 rounded-xl bg-purple-100">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="border-0 hover:opacity-80 transition-opacity cursor-pointer font-medium text-purple-700">
                                {displayUserInitials}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            sideOffset={4}
                            alignOffset={-8}
                            className="w-24 sm:w-28 min-w-fit border-0 shadow-lg mt-1"
                        >
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer justify-center !px-1 !py-1.5"
                            >
                                <LogOut className="w-3 h-4 mr-2" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-4 text-left bg-white">
                    <p className="font-inter text-xs font-medium text-black leading-[14px] mb-2">
                        Today&apos;s Entries
                    </p>
                    {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                    ) : (
                        <p className="font-inter text-xl lg:text-2xl font-bold text-primary">
                            {parseInt(data?.headerCounts?.todays_skus) || 0} SKUs
                        </p>
                    )}
                </div>

                <div className="rounded-lg p-4 text-left bg-white">
                    <p className="font-inter text-xs font-medium text-black leading-[14px] mb-2">
                        This Week&apos;s Entries
                    </p>
                    {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                    ) : (
                        <p className="font-inter text-xl lg:text-2xl font-bold text-primary">
                            {parseInt(data?.headerCounts?.weekly_skus) || 0} SKUs
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
