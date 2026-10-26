// MetricCardSkeleton.tsx - Enhanced loading skeleton for metric cards
export function MetricCardSkeleton() {
  return (
    <div className="relative animate-pulse">
      <div className="flex flex-col gap-4">
        {/* Icon skeleton */}
        <div className="flex">
          <div className="size-10 rounded-lg bg-gray-200 flex items-center justify-center">
            <div className="w-5 h-5 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Content skeleton */}
        <div className="min-w-0 space-y-2">
          {/* Context text skeleton */}
          <div className="h-4 bg-gray-200 rounded w-24"></div>

          {/* Value skeleton */}
          <div className="flex items-baseline gap-2">
            <div className="h-6 bg-gray-300 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>

          {/* Delta skeleton */}
          <div className="h-6 bg-gray-100 rounded w-32"></div>
        </div>
      </div>

      {/* Separator line for larger screens */}
      <div className="hidden lg:block absolute top-0 right-0 w-[2px] h-full bg-gray-100 mr-4" />

      {/* Animated shimmer effect */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60 animate-shimmer overflow-hidden"></div>
    </div>
  );
}