"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function IndividualShopsSkeleton() {
  return (
    <div className="relative box-border flex flex-col items-start py-2 w-full bg-white border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg">

      <div className="relative flex flex-col justify-center items-start p-4 gap-2 w-full h-[76px] z-[1]">

        <div className="absolute inset-0 bg-gray-100 opacity-40 rounded-lg"></div>


        <div className="flex flex-row justify-between items-center gap-2 w-full h-[22px]">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>


        <div className="flex flex-row items-start gap-2 w-full mt-1">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>


      <div className="absolute left-0 bottom-0 w-full h-px bg-gray-200 opacity-40 z-[2]" />
    </div>
  );
}
