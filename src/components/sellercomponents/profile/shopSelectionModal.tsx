'use client';
import { Shop } from "@/lib/types/legacy";
import { Search, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { ShopCard } from "@/components/sellercomponents/profile/shopCard";
import { useRouter } from "next/navigation";


interface ShopSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    shops: Shop[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function ShopSelectionModal({
    isOpen,
    onClose,
    shops,
    searchQuery,
    setSearchQuery,

}: ShopSelectionModalProps) {
    const router = useRouter();
    const [displayedShops, setDisplayedShops] = useState<Shop[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const itemsPerPage = 8;
     
    console.log("%%%%%",shops)

    useEffect(() => {
        if (isOpen && shops.length > 0) {
            const initialShops = shops.slice(0, itemsPerPage);
            setDisplayedShops(initialShops);
        }
    }, [isOpen, shops, itemsPerPage]);

    useEffect(() => {
        if (shops.length > 0) {
            const initialShops = shops.slice(0, itemsPerPage);
            setDisplayedShops(initialShops);
        }
    }, [searchQuery, shops, itemsPerPage]);

    const loadMoreShops = useCallback(() => {

        if (isLoadingMore) return;
        setIsLoadingMore(true);

        setTimeout(() => {
            const currentLength = displayedShops.length;
            const nextBatch = shops.slice(currentLength, currentLength + itemsPerPage);

            if (nextBatch.length > 0) {
                setDisplayedShops(prev => [...prev, ...nextBatch]);
            }
            setIsLoadingMore(false);
        }, 300);
    }, [shops, displayedShops.length, itemsPerPage, isLoadingMore]);

    const hasMoreShops = displayedShops.length < shops.length;
    if (!isOpen) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40 animate-modal-backdrop" />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 lg:inset-0 lg:flex lg:items-center lg:justify-center z-50 ">
                <div className="bg-white rounded-t-2xl lg:rounded-2xl w-full lg:max-w-2xl lg:mx-auto max-h-[80vh] lg:max-h-[700px] flex flex-col animate-modal-slide-up lg:animate-modal-scale-in shadow-2xl modal-content">

                    {/* Modal Header */}
                    <div className="p-4 lg:p-6 shrink-0 ">
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
                            >
                                <X className="w-5 h-5 text-black rounded-full border-2 border-black opacity-50 p-[2px]" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-inter text-lg lg:text-xl font-semibold text-black">List of Shops</h3>
                            {displayedShops.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    Showing {displayedShops.length} of {shops.length}
                                </span>
                            )}
                        </div>


                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by shop name or address"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm lg:text-base transition-all duration-200 placeholder:font-inter placeholder:text-sm lg:placeholder:text-base placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    {/* Shop List */}
                    <div
                        className="flex flex-col gap-4 overflow-y-auto p-4 lg:p-6 scrollbar-hide flex-1"
                        onScroll={(e) => {
                            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                            if (scrollHeight - scrollTop <= clientHeight + 100 && hasMoreShops && !isLoadingMore) {
                                loadMoreShops();
                            }
                        }}
                    >
                        {displayedShops.length > 0 && (

                            displayedShops.map((shop: Shop, index: number) => (
                                <div
                                    key={shop.id || index}
                                    onClick={() => router.push(`/staff/profile/${shop.slug}`)}
                                    className="transform hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
                                    style={{
                                        animationName: 'modalScaleIn',
                                        animationDuration: '0.3s',
                                        animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                                        animationFillMode: 'forwards',
                                        animationDelay: `${index * 0.05}s`

                                    }}>
                                    <ShopCard shop={shop} />
                                </div>

                            ))
                        )}
                        {displayedShops.length === 0 && (
                            <div className="text-center py-12 text-gray-500 animate-modal-fade-in">
                                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-lg font-medium">No shops found</p>
                                <p className="text-sm">Try searching with different keywords</p>
                            </div>
                        )}

                        {/* Loading more indicator */}
                        {isLoadingMore && (
                            <div className="flex justify-center py-4">
                                <div className="flex items-center space-x-2 text-gray-500">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                    <span className="text-sm">Loading more shops...</span>
                                </div>
                            </div>
                        )}

                        {/* Load more button (fallback) */}
                        {hasMoreShops && !isLoadingMore && (
                            <div className="flex justify-center py-4">
                                <Button
                                    variant="outline"
                                    onClick={loadMoreShops}
                                    className="flex items-center space-x-2 cursor-pointer"
                                >
                                    <span>Load More Shops</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!hasMoreShops && displayedShops.length > 0 && (
                            <div className="text-center py-4 text-gray-400 text-sm">
                                <p>You&apos;ve reached the end of the list</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </>
    );
}
