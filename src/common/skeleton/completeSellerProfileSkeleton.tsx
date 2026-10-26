"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function CompleteSellerProfileSkeleton() {
  return (
    <div className="max-w-md mx-auto lg:max-w-2xl">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg p-4 text-left bg-white">
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="rounded-lg p-4 text-left bg-white">
          <Skeleton className="h-3 w-28 mb-2" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Recent Visits Header */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Shops List Skeleton */}
      <div className="max-h-[60vh] overflow-y-auto mt-4">
        <div className="py-2 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button (Optional placeholder for UX consistency) */}
      <div className="flex justify-center mt-6">
        <Button variant="outline" disabled className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
          <span>Loading data...</span>
        </Button>
      </div>
    </div>
  );
}
