'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { bottle_icon } from '@/assets/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { showToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaffMemberFillSKuInputListing } from '@/hooks/api/useSeller';

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

interface DailyStockData {
  openingStock?: number;
  closingStock: number;
  availability: string;
  demand: string;
  breakage: number;
  notes?: string;
}

interface StockEntryFormProps {
  products: Product[];
  shopInfo: any;
  categoryInfo: any;
  isLoading?: boolean;
  shopName?: string;
  category?: string;
  productName?: string;
}

export const StockEntryForm: React.FC<StockEntryFormProps> = ({
  products,
  shopInfo,
  categoryInfo,
  isLoading = false,
  shopName,
  category,
  productName
}) => {
  const [stockData, setStockData] = useState<Record<string, DailyStockData>>({});
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string>('');
  const [confirmingProductId, setConfirmingProductId] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [submittingById, setSubmittingById] = useState<Record<string, boolean>>({});
  const [submittedById, setSubmittedById] = useState<Record<string, boolean>>({});
  // Commented out focusedFields state - no longer needed for auto-scrolling behavior
  // const [focusedFields, setFocusedFields] = useState<Record<string, string>>({});
  const { mutate: fillSKuInputListing, isPending, isError } = useStaffMemberFillSKuInputListing();

  // Auto-populate opening stock when products change
  useEffect(() => {
    if (products && products.length > 0) {
      const initialStockData: Record<string, DailyStockData> = {};
      products.forEach(product => {
        initialStockData[product.id] = {
          closingStock: 0,
          availability: 'available',
          demand: '0',
          breakage: 0,
          notes: ''
        };
      });
      setStockData(initialStockData);
    }
  }, [products]);

  const handleInputChange = (productId: string, field: keyof DailyStockData, value: string | number) => {
    setStockData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const handleAddNote = (productId: string) => {
    if (isProductLocked(productId)) {
      showToast('error', 'Cannot edit note while submission is in progress.');
      return;
    }
    setCurrentProductId(productId);
    setNotesInput(stockData[productId]?.notes || '');
    setNotesDialogOpen(true);
  };

  const handleSaveNote = () => {
    if (currentProductId && !isProductLocked(currentProductId)) {
      handleInputChange(currentProductId, 'notes', notesInput);
      setNotesDialogOpen(false);
      setCurrentProductId('');
      setNotesInput('');
    } else if (isProductLocked(currentProductId)) {
      showToast('error', 'Cannot save note while submission is in progress.');
    }
  };

  /**
   * Helper function to check if fields should be disabled for a product
   * Fields are locked when:
   * 1. User clicks "Add Sales Stock" (confirmingProductId is set)
   * 2. Submission is in progress (submittingById is true)
   * 3. Submission is complete (submittedById is true)
   * This prevents users from modifying data during/after submission
   */
  const isProductLocked = (productId: string): boolean => {
    return !!(
      submittingById[productId] ||
      submittedById[productId] ||
      confirmingProductId === productId
    );
  };

  const handleConfirmSubmit = (skuId: string) => {
    setConfirmingProductId(skuId);
    setConfirmDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
    setConfirmingProductId('');
  };

  const handleSubmitOne = async (skuId: string) => {
    if (!skuId || !stockData[skuId] || submittingById[skuId]) return;

    // Close confirmation dialog
    setConfirmDialogOpen(false);
    setConfirmingProductId('');

    // Set submitting state immediately to lock fields
    setSubmittingById(prev => ({ ...prev, [skuId]: true }));

    // Prepare stock data with default values (0) for empty fields
    const productStockData = stockData[skuId];
    const closingStockValue = typeof productStockData.closingStock === 'string' && productStockData.closingStock === ''
      ? 0
      : (productStockData.closingStock === undefined || productStockData.closingStock === null || (typeof productStockData.closingStock === 'number' && isNaN(productStockData.closingStock))
        ? 0
        : Number(productStockData.closingStock) || 0);

    const demandValue = productStockData.demand === undefined || productStockData.demand === null || productStockData.demand === ''
      ? '0'
      : String(productStockData.demand);

    const breakageValue = typeof productStockData.breakage === 'string' && productStockData.breakage === ''
      ? 0
      : (productStockData.breakage === undefined || productStockData.breakage === null || (typeof productStockData.breakage === 'number' && isNaN(productStockData.breakage))
        ? 0
        : Number(productStockData.breakage) || 0);

    const sanitizedStockData = {
      ...stockData,
      [skuId]: {
        ...productStockData,
        closingStock: closingStockValue,
        demand: demandValue,
        breakage: breakageValue,
      }
    };

    // Call mutate with parameters
    fillSKuInputListing(
      {
        stockData: sanitizedStockData,
        skuId,
        shopInfo,
        shopName,
        category,
        productName
      },
      {
        onSuccess: (response: any) => {
          showToast("success", "data save")
          setSubmittedById(prev => ({ ...prev, [skuId]: true }));
          setSubmittingById(prev => ({ ...prev, [skuId]: false }));
        },
        onError: (error: any) => {
          const errorMessage = error?.message || 'Failed to save. Please try again.';
          showToast('error', errorMessage);
          setSubmittingById(prev => ({ ...prev, [skuId]: false }));
          setConfirmingProductId(''); // Reset confirming state on error
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="px-2 sm:px-3 space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="px-2 sm:px-3 py-6 text-center">
        <p className="text-gray-500 text-sm">No products available</p>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-3 pb-20">
      <div className="bg-white rounded-xl shadow-sm">
        {
          products.map((product: Product, index: number) => (
            <div
              key={product.id}
              className={`${index > 0 ? "border-t border-gray-100" : ""} ${isProductLocked(product.id) ? "opacity-95" : ""
                }`}
            >
              <div className={`p-3 sm:p-4 pb-3 border-b border-gray-100 bg-blizzard-blue rounded-t-xl ${submittedById[product.id] ? "bg-green-50 border-green-200" : ""
                }`}>
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm sm:text-base font-semibold font-inter text-primary leading-tight mb-1">
                        {product.brandName} {product.productName}
                      </h2>
                      {submittedById[product.id] && (
                        <span className="text-green-600 text-xs font-medium" aria-label="Submitted">
                          ✓
                        </span>
                      )}
                    </div>
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

              {/* Stock Information */}
              <div className="px-3 sm:px-4 py-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-placeholder-gray">Current Stock:</span>
                  <span className="text-sm font-semibold text-primary">{product.stockQuantity}</span>
                </div>
              </div>

              {/* Daily Stock Entry Form */}
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Locked State Indicator */}
                {isProductLocked(product.id) && (
                  <div className={`mb-2 p-2 rounded-lg border ${submittedById[product.id]
                    ? 'bg-green-50 border-green-200'
                    : submittingById[product.id]
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <div className="flex items-center gap-2">
                      {submittedById[product.id] ? (
                        <>
                          <span className="text-green-600 text-lg">✓</span>
                          <span className="text-xs font-medium text-green-700">
                            Stock entry submitted successfully
                          </span>
                        </>
                      ) : submittingById[product.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-medium text-blue-700">
                            Submitting stock entry...
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-yellow-600 text-xs">⏳</span>
                          <span className="text-xs font-medium text-yellow-700">
                            Please confirm your submission
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {/* Demand & Breakage Row */}
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                        Closing Stock
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter"
                        disabled={isProductLocked(product.id)}
                        // Simplified value handling - no more focusedFields complexity
                        // value={focusedFields[`${product.id}-closingStock`] !== undefined
                        //   ? focusedFields[`${product.id}-closingStock`]
                        //   : (stockData[product.id]?.closingStock === 0 ? '' : (stockData[product.id]?.closingStock || ''))}
                        value={stockData[product.id]?.closingStock || ''}
                        // Original auto-focus behavior commented out
                        // onFocus={(e) => {
                        //   if (isProductLocked(product.id)) {
                        //     e.target.blur();
                        //     return;
                        //   }
                        //   const fieldKey = `${product.id}-closingStock`;
                        //   const currentValue = stockData[product.id]?.closingStock;
                        //   setFocusedFields(prev => ({
                        //     ...prev,
                        //     [fieldKey]: currentValue === 0 ? '' : String(currentValue || '')
                        //   }));
                        // }}
                        onFocus={(e) => {
                          if (isProductLocked(product.id)) {
                            e.target.blur();
                            return;
                          }
                        }}
                        onChange={(e) => {
                          if (isProductLocked(product.id)) return;
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          // Simplified onChange - no more focusedFields complexity
                          // const fieldKey = `${product.id}-closingStock`;
                          // setFocusedFields(prev => ({
                          //   ...prev,
                          //   [fieldKey]: value
                          // }));
                          handleInputChange(product.id, 'closingStock', value === '' ? '' : parseInt(value) || 0);
                        }}
                        onKeyDown={(e) => {
                          if (isProductLocked(product.id)) {
                            e.preventDefault();
                            return;
                          }
                          // Prevent typing ".", ",", "e", "E", "+", or "-"
                          if ([".", ",", "e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e: any) => {
                          if (isProductLocked(product.id)) return;
                          // Simplified onBlur - no more focusedFields complexity
                          // const fieldKey = `${product.id}-closingStock`;
                          // setFocusedFields(prev => {
                          //   const newState = { ...prev };
                          //   delete newState[fieldKey];
                          //   return newState;
                          // });
                          if (e.target.value === '' || isNaN(e.target.value)) {
                            handleInputChange(product.id, 'closingStock', 0);
                          }
                        }}
                        className={`w-full px-3 py-3 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isProductLocked(product.id)
                          ? 'bg-gray-100 cursor-not-allowed opacity-60'
                          : 'bg-white'
                          }`}
                        aria-label="Closing Stock"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                        Demand
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter"
                        disabled={isProductLocked(product.id)}
                        // Simplified value handling - no more focusedFields complexity
                        // Show placeholder when demand is empty or '0' (same as Closing Stock / Breakage)
                        value={!stockData[product.id]?.demand || stockData[product.id]?.demand === '0' ? '' : stockData[product.id].demand}
                        // Original auto-focus behavior commented out
                        // onFocus={(e) => {
                        //   if (isProductLocked(product.id)) {
                        //     e.target.blur();
                        //     return;
                        //   }
                        //   const fieldKey = `${product.id}-demand`;
                        //   const currentValue = stockData[product.id]?.demand;
                        //   setFocusedFields(prev => ({
                        //     ...prev,
                        //     [fieldKey]: currentValue === '0' || currentValue === '' ? '' : String(currentValue || '')
                        //   }));
                        // }}
                        onFocus={(e) => {
                          if (isProductLocked(product.id)) {
                            e.target.blur();
                            return;
                          }
                        }}
                        onChange={(e) => {
                          if (isProductLocked(product.id)) return;
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          // Simplified onChange - no more focusedFields complexity
                          // const fieldKey = `${product.id}-demand`;
                          // setFocusedFields(prev => ({
                          //   ...prev,
                          //   [fieldKey]: value
                          // }));
                          handleInputChange(product.id, 'demand', value === '' ? '' : (parseInt(value) || 0).toString());
                        }}
                        onKeyDown={(e) => {
                          if (isProductLocked(product.id)) {
                            e.preventDefault();
                            return;
                          }
                          // Prevent typing ".", ",", "e", "E", "+", or "-"
                          if ([".", ",", "e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e: any) => {
                          if (isProductLocked(product.id)) return;
                          // Simplified onBlur - no more focusedFields complexity
                          // const fieldKey = `${product.id}-demand`;
                          // setFocusedFields(prev => {
                          //   const newState = { ...prev };
                          //   delete newState[fieldKey];
                          //   return newState;
                          // });
                          if (e.target.value === '' || isNaN(e.target.value)) {
                            handleInputChange(product.id, 'demand', '0');
                          }
                        }}
                        className={`w-full px-3 py-3 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isProductLocked(product.id)
                          ? 'bg-gray-100 cursor-not-allowed opacity-60'
                          : 'bg-white'
                          }`}
                        aria-label="Demand"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold font-inter text-gray-700 mb-1.5">
                        Breakage
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter"
                        disabled={isProductLocked(product.id)}
                        // Simplified value handling - no more focusedFields complexity
                        // value={focusedFields[`${product.id}-breakage`] !== undefined
                        //   ? focusedFields[`${product.id}-breakage`]
                        //   : (stockData[product.id]?.breakage === 0 ? '' : (stockData[product.id]?.breakage || ''))}
                        value={stockData[product.id]?.breakage || ''}
                        // Original auto-focus behavior commented out
                        // onFocus={(e) => {
                        //   if (isProductLocked(product.id)) {
                        //     e.target.blur();
                        //     return;
                        //   }
                        //   const fieldKey = `${product.id}-breakage`;
                        //   const currentValue = stockData[product.id]?.breakage;
                        //   setFocusedFields(prev => ({
                        //     ...prev,
                        //     [fieldKey]: currentValue === 0 ? '' : String(currentValue || '')
                        //   }));
                        // }}
                        onFocus={(e) => {
                          if (isProductLocked(product.id)) {
                            e.target.blur();
                            return;
                          }
                        }}
                        onChange={(e) => {
                          if (isProductLocked(product.id)) return;
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          // Simplified onChange - no more focusedFields complexity
                          // const fieldKey = `${product.id}-breakage`;
                          // setFocusedFields(prev => ({
                          //   ...prev,
                          //   [fieldKey]: value
                          // }));
                          handleInputChange(product.id, 'breakage', value === '' ? '' : parseInt(value) || 0);
                        }}
                        onKeyDown={(e) => {
                          if (isProductLocked(product.id)) {
                            e.preventDefault();
                            return;
                          }
                          if ([".", ",", "e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onBlur={(e: any) => {
                          if (isProductLocked(product.id)) return;
                          // Simplified onBlur - no more focusedFields complexity
                          // const fieldKey = `${product.id}-breakage`;
                          // setFocusedFields(prev => {
                          //   const newState = { ...prev };
                          //   delete newState[fieldKey];
                          //   return newState;
                          // });
                          if (e.target.value === '' || isNaN(e.target.value)) {
                            handleInputChange(product.id, 'breakage', 0);
                          }
                        }}
                        className={`w-full px-3 py-3 sm:py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${isProductLocked(product.id)
                          ? 'bg-gray-100 cursor-not-allowed opacity-60'
                          : 'bg-white'
                          }`}
                        aria-label="Breakage"
                      />

                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={isProductLocked(product.id)}
                        className={`flex flex-row w-[150px] items-center justify-center px-1 py-3 sm:py-2.5 text-sm font-medium text-primary bg-secondary border border-primary rounded-lg hover:bg-secondary/90 active:bg-secondary/95 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${isProductLocked(product.id)
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                          }`}
                        onClick={() => {
                          if (!isProductLocked(product.id)) {
                            handleAddNote(product.id);
                          }
                        }}
                        aria-label={stockData[product.id]?.notes ? 'Edit Note' : 'Add Note'}
                      >
                        {stockData[product.id]?.notes ? '✏️ Edit Note' : '+ Add Note'}
                      </button>
                    </div>
                  </div>

                  {/* Note Preview - Full Width */}
                  {stockData[product.id]?.notes && (
                    <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg w-full overflow-hidden">
                      <div className="flex items-start gap-2">
                        <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-xs font-medium text-gray-600 mb-1">Current Note:</p>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {stockData[product.id].notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Per-product Submit */}
                  <div className="gap-3">
                    <button
                      type="button"
                      onClick={() => handleConfirmSubmit(product.id)}
                      disabled={!!submittingById[product.id] || !!submittedById[product.id]}
                      className={`w-full px-3 py-3 sm:py-2.5 text-sm font-semibold text-white rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${submittedById[product.id]
                        ? 'bg-green-600 hover:bg-green-700 cursor-default'
                        : submittingById[product.id]
                          ? 'bg-primary/70 cursor-wait'
                          : 'bg-primary hover:bg-primary/90 cursor-pointer'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      aria-label={
                        submittedById[product.id]
                          ? 'Stock entry submitted'
                          : submittingById[product.id]
                            ? 'Submitting stock entry'
                            : 'Add sales stock'
                      }
                    >
                      {submittedById[product.id] ? (
                        <span className="flex items-center justify-center gap-2">
                          <span>✓</span>
                          <span>Added Successfully</span>
                        </span>
                      ) : submittingById[product.id] ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Adding...</span>
                        </span>
                      ) : (
                        'Add Sales Stock'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Extra padding at bottom */}
      <div className="h-4"></div>

      {/* Notes Dialog */}
      <Dialog
        open={notesDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isProductLocked(currentProductId)) {
            setNotesDialogOpen(false);
            setCurrentProductId('');
            setNotesInput('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-w-[80vw] overflow-hidden">
          <DialogHeader>
            <DialogTitle style={{ wordBreak: 'break-word' }}>{stockData[currentProductId]?.notes ? 'Edit Note' : 'Add Note'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-hidden px-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" style={{ wordBreak: 'break-word' }}>
                Notes <span className="text-xs text-gray-500">(Max 80 characters)</span>
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => {
                  const value = e.target.value;
                  const noSpacesCount = value.replace(/\s/g, "").length;

                  if (noSpacesCount <= 80) {
                    setNotesInput(value);
                  }
                }}
                disabled={isProductLocked(currentProductId)}
                className={`w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none ${isProductLocked(currentProductId)
                  ? 'bg-gray-100 cursor-not-allowed opacity-60'
                  : 'bg-white'
                  }`}
                rows={4}
                maxLength={80}
                // Commented out focusedFields state - no longer needed for auto-scrolling behavior
                // autoFocus={!isProductLocked(currentProductId)}
                autoFocus={false}
                placeholder="Enter your notes here..."
                aria-label="Notes"
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              />
              <p className="text-xs text-gray-500 mt-1" style={{ wordBreak: 'break-word' }}>
                {notesInput.replace(/\s/g, "").length}/80 characters (excluding spaces)
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setNotesDialogOpen(false);
                setCurrentProductId('');
                setNotesInput('');
              }}
              disabled={isProductLocked(currentProductId)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isProductLocked(currentProductId)}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Save Note
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          // Prevent closing dialog when submitting
          if (!open && !submittingById[confirmingProductId]) {
            handleCancelConfirm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-w-[90vw] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Confirm Stock Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to add this sales stock entry? This action cannot be undone.
            </p>
            {confirmingProductId && stockData[confirmingProductId] && (
              <div className="bg-gray-50 p-3 flex flex-col rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Closing Stock:</span>
                  <span className="font-semibold text-gray-800">{stockData[confirmingProductId].closingStock || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Demand:</span>
                  <span className="font-semibold text-gray-800">{stockData[confirmingProductId].demand || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Breakage:</span>
                  <span className="font-semibold text-gray-800">{stockData[confirmingProductId].breakage || 0}</span>
                </div>
                {stockData[confirmingProductId].notes && (
                  <div className="mt-2 pt-2 border-t border-gray-200 overflow-hidden">
                    <span className="text-xs text-gray-500">Note:</span>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                      {stockData[confirmingProductId].notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col justify-end gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCancelConfirm}
              disabled={!!submittingById[confirmingProductId]}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => confirmingProductId && handleSubmitOne(confirmingProductId)}
              disabled={!!submittingById[confirmingProductId] || !confirmingProductId}
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submittingById[confirmingProductId] ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                'Confirm & Add'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};