"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function BottlesSkeleton() {
  return (
    <div className="flex flex-row items-start p-0 w-full h-auto gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col items-start p-0 gap-3 w-full">
          <div
            className={`flex flex-col justify-center items-center p-3 gap-0 w-full h-[156px] bg-white rounded-lg border border-gray-100 shadow-sm flex-none order-0 self-stretch flex-grow-0 ${index === 0
              ? "sm:rounded-l-lg"
              : index === 2
                ? "sm:rounded-r-lg"
                : ""
              }`}
          >
            <div className="flex flex-row justify-center items-end p-0 w-full h-[110px]">
              <Skeleton className="w-[60px] h-[100px] rounded-md" />
            </div>
            <Skeleton className="h-3 w-[80px] mt-2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
