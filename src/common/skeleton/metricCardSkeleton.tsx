import clsx from "clsx";

export function MetricCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'detailed' }) {
  const cardClass = clsx(
    "animate-pulse bg-gray-50 rounded-xl border border-gray-100",
    {
      "p-4": variant === 'default',
      "p-3": variant === 'compact',
      "p-6": variant === 'detailed',
    }
  );

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx(
          "rounded-lg bg-gray-200",
          variant === 'compact' ? 'size-8' : 'size-10'
        )} />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-6 bg-gray-300 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}
