import React from 'react';

export const HeatMapSkeleton: React.FC = () => {
  return (
    <div className='mt-5 p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4 animate-pulse'>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-80 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-96"></div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>

        {/* Controls Skeleton */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
          <div className="h-10 bg-gray-200 rounded w-16"></div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-20"></div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Area Skeleton */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-12"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>

            {/* Legend Skeleton */}
            <div className="flex items-center justify-center gap-4 mt-4">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel Skeleton */}
        <div className="space-y-4">
          {/* Location Details Skeleton */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="space-y-3">
              {[...Array(4)].map((_, idx) => (
                <div key={idx}>
                  <div className="h-4 bg-gray-100 rounded w-16 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Skeleton */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-28 mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Status Skeleton */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-32 mt-1"></div>
          </div>
        </div>
      </section>

      {/* Insights Skeleton */}
      <section>
        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-md border border-gray-200 bg-gray-50 w-full">
          <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0 mt-0.5"></div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
