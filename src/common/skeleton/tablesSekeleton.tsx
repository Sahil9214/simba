export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => {
  return (
    <div className="animate-pulse rounded-xl">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className={`flex items-center rounded-xl  border-b border-[#E5E5E5] h-[60px] ${index % 2 === 1 ? "bg-[#F8FAFC]" : "bg-white"
            }`}
        >
          <div className="w-[38px] h-[60px] flex items-center justify-center pl-3">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex-1 min-w-[120px] h-[60px] px-2 flex items-center">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="flex-1 min-w-[150px] h-[60px] px-2 flex items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="w-[149px] min-w-[120px] h-[60px] px-2 flex items-center">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
