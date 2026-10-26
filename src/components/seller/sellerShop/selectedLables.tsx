'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSellerProductNameByInput } from '@/hooks/api/useSeller';

interface LabelItem {
  name?: string;
  isVisible?: boolean;
  skuId?: any;
  productName?: any;
  image: any;
}

interface SelectedLabelsProps {
  className?: string;
  firstRow?: LabelItem[];
  params?: {
    sellerShop: string;
    alllabel: string;
  };
  onProductSelect?: (productName: string) => void;
  selectedProduct?: string;
}

export const SelectedLabels: React.FC<SelectedLabelsProps> = ({
  className = '',
  firstRow,
  params,
  onProductSelect,
  selectedProduct
}) => {

  const [tab, setTab] = useState<string>(selectedProduct || firstRow?.[0]?.productName || '');

  const handleTabClick = (productName: string) => {
    setTab(productName);
    onProductSelect?.(productName);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Horizontal Tab Panel with Overflow */}
      <div className="overflow-x-auto overflow-y-hidden px-2 pb-2 scrollbar-custom">
        <div className="flex gap-3 min-w-max">
          {firstRow?.map((label, index) => (
            <LabelCard
              key={`product-${label.skuId || index}`}
              label={label}
              params={params as { sellerShop: string; alllabel: string; }}
              isActive={tab === label.productName}
              onClick={() => handleTabClick(label.productName)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function LabelCard({
  label,
  params,
  isActive,
  onClick
}: {
  label: LabelItem;
  params: { sellerShop: string; alllabel: string; };
  isActive?: boolean;
  onClick?: () => void;
}) {
  const { sellerShop, alllabel } = params;
  const encodedProductName = encodeURIComponent(label.productName);

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-4 ${isActive ? 'border-red-900' : 'border-gray-300'
        } active:scale-[0.98] flex-shrink-0 w-40 sm:w-48`}
      onClick={onClick}
    >
      {/* Compact Image Container */}
      <div className="w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4 ">
        <div className="relative w-12 min-h-16 ">
          <Image
            src={label.image as string}
            alt={label.productName}
            className="object-contain drop-shadow-sm"
            fill
            sizes="(max-width: 640px) 50px, 60px"
            priority={false}
          />
        </div>
      </div>

      {/* Compact Product Name */}
      <div className="px-3 py-3 bg-white border-t border-gray-100">
        <p className="font-medium text-xs sm:text-sm text-center text-gray-900 line-clamp-2 leading-tight">
          {label?.productName}
        </p>
      </div>
    </div>
  );
}