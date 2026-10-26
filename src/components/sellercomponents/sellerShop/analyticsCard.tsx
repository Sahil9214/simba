import React from 'react';

interface AnalyticsCardProps {
  inStock?: number;
  lowStock?: number;
  outOfStock?: number;
}

function AnalyticsCard({
  inStock,
  lowStock,
  outOfStock,
}: AnalyticsCardProps) {
  return (
    <div className="flex font-inter items-start p-0 gap-4 sm:gap-6 w-full h-auto ">
      <div className="flex flex-row items-start p-0 gap-2 sm:gap-3 w-full h-auto">
        <div className="flex flex-col items-center p-3 gap-2 w-full  bg-white rounded-lg">
          <div className="w-full  h-6 font-inter font-bold text-xl leading-[120%] text-green flex-none order-0 self-stretch flex-grow-0 text-center">
            {inStock}
          </div>
          <div className="w-full  font-inter font-medium text-xs leading-[120%] text-black flex-none order-1 self-stretch flex-grow-0 text-center">
            In Stock
          </div>
        </div>

        <div className="flex flex-col items-center p-3 gap-2 w-full  bg-white rounded-lg">
          <div className="w-full   font-inter font-bold text-xl leading-[120%] text-[#EAB308] flex-none order-0 self-stretch flex-grow-0 text-center">
            {lowStock}
          </div>
          <div className="w-full  font-inter font-medium text-xs leading-[120%] text-sidebar-foreground flex-none order-1 self-stretch flex-grow-0 text-center">
            Low Stock
          </div>
        </div>

        <div className="flex flex-col items-center p-3 gap-2 w-full  bg-white rounded-lg">
          <div className="w-full   font-inter font-bold text-xl leading-[120%] text-[#DC2626] flex-none order-0 self-stretch flex-grow-0 text-center">
            {outOfStock}
          </div>
          <div className="w-full  font-inter font-medium text-xs leading-[120%] text-sidebar-foreground flex-none order-1 self-stretch flex-grow-0 text-center">
            Out of Stock
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCard;
