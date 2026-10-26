"use client";
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Shop } from '@/lib/types/legacy';
import { CompleteSellerProfileSkeleton } from "@/common/skeleton/completeSellerProfileSkeleton";
import { useAllShops } from '@/hooks/api/useAllShops';
import { formatLastVisitDate } from '@/utils/formatLastVisitDate';
import { useDebounced } from "@/hooks/useDebounce";
import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/rbac';

const CompleteSellerProfile = dynamic(() =>
    import("@/components/sellercomponents/profile/completeSellerProfile").then(mod => ({
        default: mod.CompleteSellerProfile
    })),
    {
        loading: () => <CompleteSellerProfileSkeleton />,
        ssr: false
    }
);

const ShopSelectionModal = dynamic(
    () =>
        import("@/components/sellercomponents/profile/shopSelectionModal").then(
            (mod) => ({ default: mod.ShopSelectionModal })
        ),
    {
        loading: () => <p>Loading...</p>,
        ssr: false,
    }
);



const Profile = () => {
    const [isModalOpen, setIsModalOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem("addnewEntriesModal") === 'true';
        }
        return false;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounced(searchQuery, 300);

    const { data: allShopsData, refetch: refetchShops } = useAllShops(debouncedSearch);
    const allShops: Shop[] = (allShopsData as any)?.data?.map((shop: any) => ({
        id: shop.id,
        name: shop.shop_name,
        slug: shop.dp_code,
        address: shop.address || `${shop.district}, ${shop.state}`,
        time: shop.
            last_daily_stock_report_date
            || shop.
                last_daily_stock_updated_at,
        dpCode: shop.original_dp_code || shop.dp_code,
        vendorCode: shop.vendor_code,
    })) || [];

    const filteredShops = allShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleModalOpen = () => {
        setIsModalOpen(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem("addnewEntriesModal", "true");
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        if (typeof window !== 'undefined') {
            localStorage.setItem("addnewEntriesModal", "false");
        }
    };

    return (
        <ProtectedRoute requireAuth={true} requiredRole={UserRole.STAFF}>
            <div className="space-y-4 p-4 relative">
                <div className={`transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
                    <div className="max-w-7xl mx-auto pb-24 ">
                        <CompleteSellerProfile />
                    </div>
                </div>
                {/* Fixed Update Shop Sales Button */}
                <div className="absolute top-[80vh] lg:top-[80vh] left-0 right-0 p-4 z-30">
                    <div className="mx-auto max-w-[200px]">
                        <button
                            style={{
                                background: '#FFFCFC',
                                border: '1px solid rgba(239, 68, 68, 0.24)',
                                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)',
                            }}
                            onClick={handleModalOpen}
                            className="w-full font-inter p-3 text-sm border-2 border-primary text-primary rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer "
                        >
                            <PlusCircle className="w-4 h-4 opacity-50" /> {/* Changed opacity-52 to opacity-50 */}
                            Add New Entries
                        </button>
                    </div>
                </div>
            </div >
            <ShopSelectionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                shops={filteredShops}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}

            />
        </ProtectedRoute>
    );
};

export default Profile;
