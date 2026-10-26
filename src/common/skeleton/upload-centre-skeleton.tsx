"use client";

import React from "react";
import { clsx } from "clsx";

interface UploadCentreSkeletonProps {
  showPipeline?: boolean;
  showAnalytics?: boolean;
  showQueue?: boolean;
  showTabs?: boolean;
  variant?: "upload" | "processing" | "complete";
  animate?: boolean;
  className?: string;
}

export function UploadCentreSkeleton({
  showPipeline = true,
  showAnalytics = true,
  showQueue = true,
  showTabs = true,
  variant = "upload",
  animate = true,
  className
}: UploadCentreSkeletonProps) {
  const containerClass = clsx(
    "space-y-6",
    animate && "animate-pulse",
    className
  );

  return (
    <div className={containerClass} role="status" aria-label="Loading upload centre">
      {/* AI Processing Pipeline */}
      {showPipeline && (
        <AIProcessingPipelineSkeleton variant={variant} />
      )}

      {/* Upload Area */}
      <UploadAreaSkeleton variant={variant} />

      {/* Tabs Container */}
      {showTabs && (
        <TabsSkeleton showAnalytics={showAnalytics} showQueue={showQueue} />
      )}
    </div>
  );
}

// AI Processing Pipeline skeleton
function AIProcessingPipelineSkeleton({ variant }: { variant: string }) {
  const stages = [
    { name: "Upload", active: true },
    { name: "OCR Processing", active: variant === "processing" },
    { name: "AI Matching", active: variant === "processing" },
    { name: "Decision Routing", active: variant === "processing" },
    { name: "Completed", active: variant === "complete" }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />

      {/* Pipeline stages */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center">
              {/* Stage circle */}
              <div className={clsx(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                stage.active
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              )}>
                <div className={clsx(
                  "w-5 h-5 rounded animate-pulse",
                  stage.active ? "bg-blue-200" : "bg-gray-200"
                )} />
              </div>

              {/* Connecting line */}
              {index < stages.length - 1 && (
                <div className={clsx(
                  "w-12 h-0.5 mx-2",
                  stage.active ? "bg-blue-200" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar and message */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Upload area skeleton
function UploadAreaSkeleton({ variant }: { variant: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />

      {/* Upload dropzone */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>
      </div>

      {/* Upload progress (if processing) */}
      {variant === "processing" && (
        <UploadProgressSkeleton />
      )}
    </div>
  );
}

// Upload progress indicator
function UploadProgressSkeleton() {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-blue-25">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 bg-blue-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-blue-200 rounded-full animate-pulse" />
        <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Tabs skeleton
function TabsSkeleton({ showAnalytics, showQueue }: { showAnalytics: boolean; showQueue: boolean }) {
  const tabs = [
    { name: "Files", active: true },
    ...(showAnalytics ? [{ name: "Analytics", active: false }] : []),
    ...(showQueue ? [{ name: "Queue", active: false }] : []),
    { name: "Settings", active: false }
  ];

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab, index) => (
            <div key={tab.name} className="flex items-center gap-2 pb-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div
                className={clsx(
                  "h-4 bg-gray-200 rounded animate-pulse",
                  tab.active ? "w-12" : "w-16"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-6">
        {/* Files table */}
        <FilesTableSkeleton />

        {/* Analytics cards (if analytics tab active) */}
        {showAnalytics && <AnalyticsCardsSkeleton />}

        {/* Queue list (if queue tab active) */}
        {showQueue && <QueueListSkeleton />}
      </div>
    </div>
  );
}

// Files table skeleton
function FilesTableSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <div className="space-y-4">
        {/* Table header */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics cards skeleton
function AnalyticsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-xl p-6 space-y-4"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-16 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Queue list skeleton
function QueueListSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-4 w-56 bg-gray-200 rounded animate-pulse" />

      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-2 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Specific upload centre variants
export function UploadingStateSkeleton() {
  return <UploadCentreSkeleton variant="processing" />;
}

export function ProcessingStateSkeleton() {
  return <UploadCentreSkeleton variant="processing" showPipeline={true} />;
}

export function CompletedStateSkeleton() {
  return <UploadCentreSkeleton variant="complete" showAnalytics={true} />;
}

export default UploadCentreSkeleton;