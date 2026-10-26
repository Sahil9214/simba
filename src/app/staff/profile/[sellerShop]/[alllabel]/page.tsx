'use client';

import { BackButton } from '@/components/sellercomponents/back-button';
import { LabelSelectionHeader } from '@/components/sellercomponents/labelSelection/header';
import { SelectedLabels } from '@/components/seller/sellerShop/selectedLables';
import { StockEntryForm } from '@/components/seller/sellerShop/StockEntryForm';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useSellerProductNameByInput,
    useSellerProductsList,
} from '@/hooks/api/useSeller';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/lib/rbac';

interface Product {
    id: string;
    name: string;
    brandName: string;
    productName: string;
    sizeMl: number;
    mrp: number;
    category: string;
    brandCode: string;
    stockQuantity: number;
    lastReportDate: string | null;
    displayName?: string;
    skuId?: string;
}

function SellerShopAllLabelPage() {
    const params = useParams();
    const sellerShop = params.sellerShop as string;
    const categorySlug = params.alllabel as string;

    const [selectedProductName, setSelectedProductName] = useState('');
    const contentScrollRef = useRef<HTMLDivElement>(null);

    /* -------------------- Products List -------------------- */
    const {
        data: productsResponse,
        isLoading,
        error: productsError,
    } = useSellerProductsList(categorySlug);

    const products = productsResponse?.success
        ? productsResponse.data.products
        : [];

    const shopInfo = productsResponse?.success
        ? productsResponse.data.shop
        : null;

    const categoryInfo = productsResponse?.success
        ? productsResponse.data.category
        : null;

    const error =
        productsResponse?.success === false
            ? productsResponse.error
            : productsError?.message;

    /* -------------------- Product Details -------------------- */
    const {
        data: productDetailsResponse,
        isLoading: isLoadingProductDetails,
    } = useSellerProductNameByInput(
        sellerShop,
        categorySlug,
        selectedProductName
    );

    /* -------------------- Auto Select First Product -------------------- */
    useEffect(() => {
        if (products.length > 0 && !selectedProductName) {
            setSelectedProductName(products[0].name);
        }
    }, [products, selectedProductName]);

    /* -------------------- Ensure initial scroll is at top -------------------- */
    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, []);

    /* -------------------- Handle Product Select (user) -------------------- */
    const handleProductSelect = (productName: string) => {
        // Just update selection; no auto-scroll
        setSelectedProductName(productName);
    };

    const productRows = products.map((product: any) => ({
        productName: product.name,
        image: '/svg/bottle-icon.svg',
        skuId: product.skuId,
    }));

    /* -------------------- Loading -------------------- */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F6F6F6]">
                <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                    <BackButton />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    /* -------------------- Error -------------------- */
    if (error) {
        return (
            <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-600 font-medium">Error loading products</p>
                    <p className="text-sm text-red-500">{error}</p>
                    <BackButton />
                </div>
            </div>
        );
    }

    /* -------------------- Empty -------------------- */
    if (products.length === 0) {
        return (
            <div className="min-h-screen bg-[#F6F6F6]">
                <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                    <BackButton />
                    <LabelSelectionHeader
                        title={shopInfo?.name || 'Shop'}
                        subtitle={categoryInfo?.displayName || 'Category'}
                        showChevron
                    />
                    <p className="text-center text-gray-500">No products found</p>
                </div>
            </div>
        );
    }

    const productDetails = productDetailsResponse?.success
        ? productDetailsResponse.data.product
        : [];

    /* ==================== MAIN UI ==================== */
    return (
        <ProtectedRoute requireAuth requiredRole={UserRole.STAFF}>
            <div className="h-dvh bg-[#F6F6F6] flex flex-col overflow-hidden">
                {/* ---------- Header ---------- */}
                <div className="bg-[#F6F6F6] border-b border-gray-100 shadow-sm sticky top-0 z-20">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-3 pb-3 space-y-3">
                        <BackButton />
                        <LabelSelectionHeader
                            title={shopInfo?.name || 'Shop'}
                            subtitle={categoryInfo?.displayName || 'Category'}
                            showChevron
                        />
                    </div>
                </div>

                {/* ---------- Content ---------- */}
                <div
                    ref={contentScrollRef}
                    className="max-w-2xl mx-auto w-full mt-4 flex-1 overflow-y-auto pb-10"
                >

                    <div className="px-2 sm:px-4">
                        <SelectedLabels
                            firstRow={productRows}
                            params={params as {
                                sellerShop: string;
                                alllabel: string;
                            }}
                            onProductSelect={handleProductSelect}
                            selectedProduct={selectedProductName}
                        />
                    </div>

                    {selectedProductName && (
                        <div className="px-2 sm:px-4 py-4 scroll-mt-28">
                            <h3 className="text-base sm:text-lg font-semibold mb-3">
                                Add Stock Data for {selectedProductName}
                            </h3>

                            <StockEntryForm
                                products={productDetails}
                                shopInfo={shopInfo || productDetailsResponse?.data?.shop}
                                categoryInfo={
                                    categoryInfo || productDetailsResponse?.data?.category
                                }
                                isLoading={isLoadingProductDetails}
                                shopName={sellerShop}
                                category={categorySlug}
                                productName={selectedProductName}
                            />
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default SellerShopAllLabelPage;