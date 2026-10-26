'use client';

import { ShopCard } from "@/components/sellercomponents/profile/shopCard";
import { useSellerProfile } from '@/hooks/api/useSellerProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EnhancedRecentVisitsSection() {
    const { data, isLoading, error, refetch } = useSellerProfile();

    if (error) {
        return (
            <div className="mt-6 max-w-md mx-auto lg:max-w-2xl">
                <h2 className="font-inter text-lg font-semibold text-black">Recent Visits</h2>
                <div className="rounded-lg p-4 text-center bg-red-50 border border-red-200 mt-4">
                    <p className="text-red-600 text-sm">Failed to load recent visits. Please try again.</p>
                    <Button
                        onClick={() => refetch()}
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
        <div className="mt-6 max-w-md mx-auto lg:max-w-2xl">
            <h2 className="font-inter text-lg font-semibold text-black">Recent Visits</h2>

            {isLoading ? (
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-hide">
                    <div className="py-2 flex flex-col gap-4 scrollbar-hide">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg p-4">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto mt-4 scrollbar-hide">
                    <div className="py-2 flex flex-col gap-4 scrollbar-hide cursor-pointer">
                        {data?.recentVisit && data.recentVisit.length > 0 ? (
                            data.recentVisit.map((visit: any) => (
                                <ShopCard
                                    key={visit.id}
                                    shop={{
                                        id: visit.id,
                                        name: visit.shop_name,
                                        slug: visit.dp_code.toLowerCase().replace(/\s+/g, '-'),
                                        address: visit.address || `${visit.district}, ${visit.state}`,
                                        time: formatLastVisitDate(visit.last_visit_date),
                                        inventory: {
                                            green: Math.max(1, Math.floor(parseInt(visit.visit_count) * 0.6)),
                                            yellow: Math.max(1, Math.floor(parseInt(visit.visit_count) * 0.3)),
                                            red: Math.max(1, Math.floor(parseInt(visit.visit_count) * 0.1))
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No recent visits found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/**
 * Format the last visit date to a human-readable format
 */
function formatLastVisitDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }
}
