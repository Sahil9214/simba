"use client";

import React from "react";
import { clsx } from "clsx";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  showSearch?: boolean;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
  animate?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  hide?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 6,
  showHeader = true,
  showPagination = true,
  showFilters = true,
  showSearch = true,
  showActions = true,
  variant = "default",
  animate = true,
  className,
  title,
  subtitle,
  hide
}: TableSkeletonProps) {
  const containerClass = clsx(
    "w-full bg-white font-inter border border-gray-100 rounded-2xl p-4 space-y-4",
    animate && "animate-pulse",
    className
  );

  const rowHeight = {
    compact: "h-10",
    default: "h-14",
    detailed: "h-16"
  }[variant];

  return (
    <div className={containerClass} role="status" aria-label="Loading table data">
      {
        !hide &&
        (
          showHeader && (
            <TableHeaderSkeleton
              title={title}
              subtitle={subtitle}
              showSearch={showSearch}
              showFilters={showFilters}
            />
          )
        )
      }




      {/* Table Container */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        {/* Table Header Row */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="flex">
            {/* Checkbox column */}
            <div className="w-10 h-10 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-200 rounded bg-gray-100 animate-pulse" />
            </div>

            {/* Table columns */}
            {Array.from({ length: columns }, (_, i) => (
              <div key={i} className="flex-1 min-w-20 h-10 px-3 flex items-center">
                <div
                  className="h-3 bg-gray-200 rounded animate-pulse"
                  style={{
                    width: `${40 + Math.random() * 40}px`,
                    animationDelay: `${i * 50}ms`
                  }}
                />
              </div>
            ))}

            {/* Actions column */}
            {showActions && (
              <div className="w-16 h-10 flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="max-h-80 overflow-y-auto">
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className={clsx(
                "flex items-center border-b border-gray-100",
                rowHeight,
                rowIndex % 2 === 1 ? 'bg-gray-25' : 'bg-white'
              )}
              style={{ animationDelay: `${rowIndex * 100}ms` }}
            >
              {/* Checkbox */}
              <div className="w-10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-200 rounded bg-gray-100 animate-pulse" />
              </div>

              {/* Data columns */}
              {Array.from({ length: columns }, (_, colIndex) => (
                <div key={colIndex} className="flex-1 min-w-20 px-3 flex items-center">
                  {renderCellContent(colIndex, rowIndex, variant)}
                </div>
              ))}

              {/* Actions */}
              {showActions && (
                <div className="w-16 flex items-center justify-center">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {showPagination && <TablePaginationSkeleton />}

      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60 animate-shimmer -skew-x-12 overflow-hidden rounded-2xl" />
    </div>
  );
}

// Table header with filters and search
export function TableHeaderSkeleton({
  title,
  subtitle,
  showSearch,
  showFilters
}: {
  title?: string;
  subtitle?: string;
  showSearch: boolean;
  showFilters: boolean;
}) {
  return (
    <>
      {/* Title and subtitle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          {subtitle && <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />}
        </div>
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Filters and search */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Search input */}
            {showSearch && (
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-56 bg-gray-100 border border-gray-200 rounded-lg animate-pulse" />
              </div>
            )}

            {/* Filter dropdowns */}
            {showFilters && (
              <div className="hidden lg:flex items-center gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="h-10 w-28 bg-gray-100 border border-gray-200 rounded-lg animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Pagination skeleton
export function TablePaginationSkeleton() {
  return (
    <div className="flex justify-between items-center mt-4">
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <div className="h-9 w-20 bg-gray-100 rounded-lg animate-pulse" />

        {/* Page numbers */}
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}

        {/* Ellipsis */}
        <div className="w-9 h-9 flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Next button */}
        <div className="h-9 w-16 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

// Render different types of cell content based on column
function renderCellContent(colIndex: number, rowIndex: number, variant: string) {
  const baseHeight = variant === "compact" ? "h-3" : variant === "detailed" ? "h-4" : "h-3";
  const delay = `${(rowIndex * 100) + (colIndex * 50)}ms`;

  switch (colIndex) {
    case 0:
      // File/Name column - longer text
      return (
        <div
          className={clsx(baseHeight, "bg-gray-200 rounded animate-pulse w-32")}
          style={{ animationDelay: delay }}
        />
      );

    case 1:
      // Type/Category column - badge-like
      return (
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 bg-gray-200 rounded animate-pulse"
            style={{ animationDelay: delay }}
          />
          <div
            className={clsx(baseHeight, "bg-gray-200 rounded animate-pulse w-20")}
            style={{ animationDelay: `${delay}+50ms` }}
          />
        </div>
      );

    case 2:
      // User/Avatar column
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"
            style={{ animationDelay: delay }}
          />
          <div
            className={clsx(baseHeight, "bg-gray-200 rounded animate-pulse w-16")}
            style={{ animationDelay: `${delay}+100ms` }}
          />
        </div>
      );

    case 3:
      // Date column
      return (
        <div
          className={clsx(baseHeight, "bg-gray-200 rounded animate-pulse w-20")}
          style={{ animationDelay: delay }}
        />
      );

    case 4:
      // Status column - badge
      return (
        <div
          className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse"
          style={{ animationDelay: delay }}
        />
      );

    default:
      // Generic column
      return (
        <div
          className={clsx(baseHeight, "bg-gray-200 rounded animate-pulse")}
          style={{
            width: `${40 + Math.random() * 60}px`,
            animationDelay: delay
          }}
        />
      );
  }
}

// Specific table skeletons for different use cases
export function UploadTableSkeleton(props: Partial<TableSkeletonProps>) {
  return (
    <TableSkeleton
      {...props}
      columns={6}
      title="Upload Centre"
      subtitle="AI-processed files with confidence scores"
      showActions={true}
    />
  );
}

export function SalesTableSkeleton(props: Partial<TableSkeletonProps>) {
  return (
    <TableSkeleton
      {...props}
      columns={5}
      title="Sales Analytics"
      subtitle="Detailed sales performance data"
      showActions={false}
    />
  );
}

export function DemandTableSkeleton(props: Partial<TableSkeletonProps>) {
  return (
    <TableSkeleton
      {...props}
      columns={6}
      title="Demand Analytics"
      subtitle="Product demand and inventory insights"
      showActions={true}
    />
  );
}

export default TableSkeleton;
