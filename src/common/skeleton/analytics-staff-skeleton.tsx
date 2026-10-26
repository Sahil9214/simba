"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCardSkeleton() {
  return (
    <div className="flex font-inter items-start p-0 gap-4 sm:gap-6 w-full h-auto">
      <div className="flex flex-row items-start p-0 gap-2 sm:gap-3 w-full h-auto">
        {/* In Stock Skeleton */}
        <div className="flex flex-col items-center p-3 gap-2 w-full bg-white rounded-lg shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>

        {/* Low Stock Skeleton */}
        <div className="flex flex-col items-center p-3 gap-2 w-full bg-white rounded-lg shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>

        {/* Out of Stock Skeleton */}
        <div className="flex flex-col items-center p-3 gap-2 w-full bg-white rounded-lg shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-10 rounded-md" />
          <Skeleton className="h-3 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
