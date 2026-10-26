'use client';
import { BackButton } from '@/components/sellercomponents/back-button';
import { LabelSelectionHeader } from '@/components/sellercomponents/labelSelection/header';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { bottle_icon } from '@/assets/icons';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';
import { showToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Product {
    id: string;
    brandName: string;
    productName: string;
    sizeMl: number;
    mrp: number;
    category: string;
    brandCode: string;
    stockQuantity: number;
    lastReportDate: string | null;
    displayName: string;
}

interface ProductResponse {
    success: boolean;
    data: {
        shop: {
            id: string;
            name: string;
            dp_code: string;
        };
        category: {
            slug: string;
            displayName: string;
            databaseCategory: string;
        };
        product: Product[];
    };
    message: string;
}

interface DailyStockData {
    openingStock: number;
    closingStock: number;
    availability: string;
    demand: string;
    breakage: number;
    notes?: string;
}

function ProductDetailPage() {
    const params = useParams();
    const sellerShop = params.sellerShop as string;
    const categorySlug = params.alllabel as string;
    const productId = params.productId as string;
    const router = useRouter();
    const [product, setProduct] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shopInfo, setShopInfo] = useState<any>(null);
    const [categoryInfo, setCategoryInfo] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stockData, setStockData] = useState<Record<string, DailyStockData>>({});
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [shopName, setShopName] = useState<string>('');
    // New state for notes dialog
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);
    const [currentProductId, setCurrentProductId] = useState<string>('');
    const [notesInput, setNotesInput] = useState<string>('');
    // Per-product submit states
    const [submittingById, setSubmittingById] = useState<Record<string, boolean>>({});
    const [submittedById, setSubmittedById] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';


                const decodedProductId = decodeURIComponent(productId);

                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
                const response = await fetch(`${API_BASE_URL}/api/seller/product/${sellerShop}/${categorySlug}/product/${decodedProductId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result: ProductResponse = await response.json();

                if (result.success) {
                    setProduct(result.data.product);
                    setShopInfo(result.data.shop);
                    setCategoryInfo(result.data.category);
                    setShopName(result?.data?.shop?.name || '');
                    // Auto-populate opening stock for all products
                    const initialStockData: Record<string, DailyStockData> = {};
                    result.data.product.forEach(product => {
                        initialStockData[product.id] = {
                            openingStock: product.stockQuantity,
                            closingStock: 0,
                            availability: 'available',
                            demand: 'normal',
                            breakage: 0,
                            notes: ''
                        };
                    });
                    setStockData(initialStockData);
                } else {
                    throw new Error(result.message || 'Failed to fetch product');
                }
            } catch (err) {
                console.error('❌ Error fetching product:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch product');
            } finally {
                setIsLoading(false);
            }
        };

        if (sellerShop && categorySlug && productId) {
            fetchProduct();
        }
    }, [sellerShop, categorySlug, productId]);

    const handleInputChange = (productId: string, field: keyof DailyStockData, value: string | number) => {
        setStockData(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    // New function to handle notes dialog
    const handleAddNote = (productId: string) => {
        setCurrentProductId(productId);
        setNotesInput(stockData[productId]?.notes || '');
        setNotesDialogOpen(true);
    };

    const handleSaveNote = () => {
        if (currentProductId) {
            handleInputChange(currentProductId, 'notes', notesInput);
        }
        setNotesDialogOpen(false);
        setCurrentProductId('');
        setNotesInput('');
    };

    const handleSubmitOne = async (skuId: string) => {
        if (!skuId || !stockData[skuId]) return;
        try {
            setSubmittingById(prev => ({ ...prev, [skuId]: true }));
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
            const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
            const productStockData = stockData[skuId];

            const response = await fetch(`${API_BASE_URL}/api/seller/daily-stocks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shopId: shopInfo?.id,
                    skuId,
                    reportDate: new Date().toISOString().split('T')[0],
                    openingStock: productStockData.openingStock,
                    closingStock: productStockData.closingStock,
                    breakage: productStockData.breakage,
                    notes: productStockData.notes,
                    availability: productStockData.availability,
                    demand: parseInt(productStockData.demand as any) || 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            showToast('success', 'Daily stock saved');
            setSubmittedById(prev => ({ ...prev, [skuId]: true }));
        } catch (err) {
            console.error('❌ Error saving daily stock data:', err);
            showToast('error', 'Failed to save. Please try again.');
        } finally {
            setSubmittingById(prev => ({ ...prev, [skuId]: false }));
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="h-screen bg-[#F6F6F6] flex flex-col">
                <div className="max-w-md mx-auto lg:max-w-2xl px-3 py-3 space-y-3">
                    <BackButton />
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || product.length === 0) {
        return (
            <div className="h-screen bg-[#F6F6F6] flex flex-col">
                <div className="max-w-md mx-auto lg:max-w-2xl px-3 py-3 space-y-3">
                    <BackButton />
                    <div className="text-center text-red-500 py-6">
                        <p className="text-sm font-medium">Error loading product: {error || 'Product not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#F6F6F6]">
            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full overflow-hidden">

                <div className="shrink-0 px-2 sm:px-3 pt-3 pb-2 bg-[#F6F6F6]">
                    <BackButton />
                    <h3 className="text-base mt-2 sm:text-lg font-semibold font-inter text-primary leading-tight mb-1">Add Shop Stock Data</h3>
                    <div className="mt-3">
                        <LabelSelectionHeader
                            title={shopName || shopInfo?.name}
                            subtitle={categoryInfo?.displayName || categoryInfo?.databaseCategory}
                            showChevron={true}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-2 sm:px-3 max-h-[75vh]">
                    <div className="bg-white rounded-xl shadow-sm">
                        {product.map((product: Product, index: number) => (
                            <div key={product.id} className={index > 0 ? "border-t border-gray-100" : ""}>

                                <div className="p-3 sm:p-4 pb-3 border-b border-gray-100">
                                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-sm sm:text-base font-semibold font-inter text-primary leading-tight mb-1">
                                                {product.brandName} {product.productName}
                                            </h2>
                                            <p className="text-xs font-medium text-placeholder-gray">
                                                {product.sizeMl}ml
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                                            <Image
                                                src={bottle_icon as string}
                                                alt="Bottle Icon"
                                                className="w-6 h-6 sm:w-8 sm:h-8 object-contain text-primary"
                                                width={30}
                                                height={30}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3 sm:px-4 py-3 bg-gray-50/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-placeholder-gray">Current Stock:</span>
                                        <span className="text-sm font-semibold text-primary">{product.stockQuantity}</span>
                                    </div>
                                </div>


                                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                                    <div className="space-y-3">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                                                    Opening Stock
                                                </label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={stockData[product.id]?.openingStock?.toString() || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            handleInputChange(product.id, 'openingStock', value === '' ? 0 : parseInt(value) || 0);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-3 sm:py-2.5 text-sm"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                                                    Closing Stock
                                                </label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={stockData[product.id]?.closingStock?.toString() || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            handleInputChange(product.id, 'closingStock', value === '' ? 0 : parseInt(value) || 0);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-3 sm:py-2.5 text-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>


                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">


                                            <div>
                                                <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                                                    Demand
                                                </label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={stockData[product.id]?.demand || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            handleInputChange(product.id, 'demand', value === '' ? '0' : value);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-3 sm:py-2.5 text-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Breakage
                                                </label>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    value={stockData[product.id]?.breakage?.toString() || ''}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            handleInputChange(product.id, 'breakage', value === '' ? 0 : parseInt(value) || 0);
                                                        }
                                                    }}
                                                    className="w-full px-3 py-3 sm:py-2.5 text-sm"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Notes
                                                </label>
                                                <button
                                                    type="button"
                                                    className="w-full px-3 py-3 sm:py-2.5 text-sm font-medium text-white bg-primary border border-primary rounded-lg hover:bg-primary/90 active:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                                    onClick={() => handleAddNote(product.id)}
                                                >
                                                    {stockData[product.id]?.notes ? '✏️ Edit Note' : '+ Add Note'}
                                                </button>


                                                {stockData[product.id]?.notes && (
                                                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-gray-600 mb-1">Current Note:</p>
                                                                <p className="text-sm text-gray-800 leading-relaxed wrap-break-words">
                                                                    {stockData[product.id].notes}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSubmitOne(product.id)}
                                                disabled={!!submittingById[product.id] || !!submittedById[product.id]}
                                                className="w-full px-3 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary/90 curosr-pointer"
                                            >
                                                {submittedById[product.id]
                                                    ? 'Added'
                                                    : (submittingById[product.id] ? 'Adding...' : 'Add Sales Stock')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-4"></div>
                </div>

            </div>


            <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={notesInput}
                                onChange={(e) => setNotesInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                rows={4}
                                placeholder="Enter your notes here..."
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setNotesDialogOpen(false)}
                            className="px-4 cursor-pointer py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveNote}
                            className="px-4 cursor-pointer py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                        >
                            Save Note
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


        </div>
    );
}

export default ProductDetailPage;
