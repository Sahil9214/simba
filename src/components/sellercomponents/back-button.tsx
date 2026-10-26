"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon } from 'lucide-react';
interface BackButtonProps {
  onClick?: () => void;
  ariaLabel?: string;
  role?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const router = useRouter();
  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex items-center">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          aria-label="Back-button"
          className="inline-flex cursor-pointer items-center px-2 py-1.5 gap-1 bg-[#FFFCFC] shadow-sm rounded-full hover:bg-gray-50 hover:shadow-md transition-all duration-200 active:scale-95"
        >
          {/* Arrow Left Icon */}
          <div className="w-4 h-4 opacity-52 relative flex items-center justify-center">
            <ChevronLeftIcon className="w-4 h-4" strokeWidth={2} />
          </div>
          {/* Back Text */}
          <span className="font-inter font-medium text-sm flex items-center text-sidebar-foreground">
            Back
          </span>
        </button>

        {/* Circle Icon (hidden) */}
        <div className="hidden w-4 h-4 flex-none order-2 flex-grow-0" />
      </div>

      {/* Date and Day Section (hidden) */}
      <div className="flex flex-row justify-center items-center px-2 gap-1 max-w-[183px] opacity-0 rounded-[1000px] flex-none order-1 self-stretch flex-grow-0">
        <span className="font-inter font-medium text-xs text-center text-sidebar-foreground flex-none order-0 flex-grow-0">
          8th September 2025
        </span>

        <span className="font-inter font-medium text-xs text-center text-sidebar-foreground opacity-24 flex-none order-1 flex-grow-0">
          |
        </span>

        <span className="font-inter font-medium text-xs text-center text-[#EF4444] flex-none order-2 flex-grow-0">
          Monday
        </span>
      </div>
    </div>
  );
};
