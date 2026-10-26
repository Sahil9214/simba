/*
 * Example Implementation: Enhanced Loading States for Simba Beer Analytics Portal
 * This file demonstrates how to integrate the new skeleton components across dashboard pages
 */

"use client";

import React, { Suspense } from "react";
import {
  AnalyticsBannerSkeleton,
  ChartSkeleton,
  TableSkeleton,
  HeatMapSkeleton,
  UploadCentreSkeleton,
  LoadingStateProvider,
  useComponentLoading,
  ProgressiveLoader,
  StaggeredSkeleton
} from "./index";
import { RealTimeIndicator, LoadingProgress, AdaptiveLoader } from "./realtime-loading";

/* =====================================================
   1. ENHANCED SALES ANALYTICS PAGE IMPLEMENTATION
   ===================================================== */

export function EnhancedSalesAnalyticsPage() {
  return (
    <LoadingStateProvider>
      <div className="space-y-4">
        {/* Header with real-time indicator */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-bold">Sales Analytics</h1>
            <RealTimeIndicator
              isConnected={true}
              isLoading={false}
              lastUpdate={new Date()}
              connectionQuality="excellent"
              dataSource="Live API"
            />
          </div>
          <HeaderDataPlaceholder />
        </section>

        {/* Analytics Banner with Progressive Loading */}
        <section>
          <ProgressiveLoader
            loadingKey="analytics-banner"
            fetchFn={async () => {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 2000));
              return { metrics: "loaded" };
            }}
            renderSkeleton={(stage, progress) => (
              <AnalyticsBannerSkeleton
                showHeader={true}
                cardsCount={4}
                staggered={true}
              />
            )}
          >
            {(data) => <AnalyticsBannerActual data={data} />}
          </ProgressiveLoader>
        </section>

        {/* Charts with Staggered Loading */}
        <section className="flex mt-5 flex-col lg:flex-row gap-4 bg-white shadow-sm p-4 rounded-2xl">
          <div className="w-full lg:w-[66%]">
            <AdaptiveLoader
              isLoading={true}
              connectionSpeed="fast"
              fallback={
                <ChartSkeleton
                  type="cylindrical"
                  height={320}
                  showHeader={true}
                  showLegend={true}
                />
              }
            >
              <PeerComparisonChartActual />
            </AdaptiveLoader>
          </div>

          <div className="w-full lg:w-[34%]">
            <Suspense fallback={
              <ChartSkeleton
                type="donut"
                height={320}
                showHeader={true}
                showLegend={true}
              />
            }>
              <DonutChartActual />
            </Suspense>
          </div>
        </section>

        {/* Multiple Charts with Progressive Reveal */}
        <StaggeredSkeleton
          staggerDelay={200}
          animationType="fade"
          direction="up"
        >
          <section className="bg-white shadow-sm px-4 pt-4 pb-0 rounded-2xl">
            <ChartSkeleton
              type="mixed"
              height={280}
              showHeader={true}
              showControls={true}
            />
          </section>

          <section className="bg-white shadow-sm px-4 pt-4 pb-0 rounded-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartSkeleton type="donut" height={250} />
              <ChartSkeleton type="donut" height={250} />
            </div>
          </section>

          <section>
            <TableSkeleton
              rows={8}
              columns={5}
              showHeader={true}
              showPagination={true}
              title="Sales Analytics - Detailed View"
              subtitle="Comprehensive sales performance breakdown"
            />
          </section>
        </StaggeredSkeleton>
      </div>
    </LoadingStateProvider>
  );
}

/* =====================================================
   2. ENHANCED DAILY REPORTS PAGE IMPLEMENTATION
   ===================================================== */

export function EnhancedDailyReportsPage() {
  return (
    <LoadingStateProvider>
      <div className="space-y-4">
        {/* Progressive Loading with Stages */}
        <section>
          <LoadingProgress
            stages={[
              { name: "Loading Banner", status: "completed", message: "KPI metrics loaded" },
              { name: "Fetching Reports", status: "active", message: "Daily sales data" },
              { name: "Processing Charts", status: "pending" },
              { name: "Building Tables", status: "pending" }
            ]}
            currentStage={1}
            overallProgress={35}
            compact={false}
          />
        </section>

        <section>
          <AnalyticsBannerSkeleton cardsCount={4} variant="default" />
        </section>

        {/* Heat Map with Custom Loading */}
        <section>
          <HeatMapSkeleton
            showHeader={true}
            showLegend={true}
            showControls={true}
            regions={15}
            title="Regional Performance"
            subtitle="Sales distribution across territories"
          />
        </section>

        {/* Breakage Report Chart */}
        <section className="bg-white shadow-sm p-4 rounded-2xl">
          <ChartSkeleton
            type="bar"
            height={300}
            showHeader={true}
            showLegend={true}
            title="Breakage Analysis"
          />
        </section>
      </div>
    </LoadingStateProvider>
  );
}

/* =====================================================
   3. ENHANCED UPLOAD CENTRE IMPLEMENTATION
   ===================================================== */

export function EnhancedUploadCentrePage() {
  const { isLoading, startLoading, updateProgress, finishLoading } = useComponentLoading("upload-centre");

  const handleFileUpload = async (files: File[]) => {
    startLoading("Preparing upload...", "initializing");

    // Simulate upload stages
    const stages = [
      { name: "Validating files", duration: 1000 },
      { name: "OCR processing", duration: 3000 },
      { name: "AI matching", duration: 2000 },
      { name: "Routing decisions", duration: 1000 }
    ];

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const progress = ((i + 1) / stages.length) * 100;

      updateProgress(progress, stage.name, `stage_${i + 1}`);
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }

    finishLoading("Upload completed successfully");
  };

  return (
    <LoadingStateProvider>
      <div className="space-y-4">
        <section>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">AI Upload Centre</h1>
            <div className="text-sm text-gray-500">
              Powered by Advanced AI Processing
            </div>
          </div>
        </section>

        {/* Upload Centre with Different States */}
        {isLoading ? (
          <UploadCentreSkeleton
            variant="processing"
            showPipeline={true}
            showAnalytics={true}
            showQueue={true}
          />
        ) : (
          <UploadCentreActual onFileUpload={handleFileUpload} />
        )}
      </div>
    </LoadingStateProvider>
  );
}

/* =====================================================
   4. SKELETON COMPONENTS SHOWCASE
   ===================================================== */

export function SkeletonShowcase() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Skeleton Components Showcase</h1>

      {/* Analytics Banner Variations */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Analytics Banner Skeletons</h2>
        <div className="grid gap-4">
          <AnalyticsBannerSkeleton variant="default" cardsCount={4} />
          <AnalyticsBannerSkeleton variant="compact" cardsCount={3} />
        </div>
      </section>

      {/* Chart Skeletons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Chart Skeletons</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartSkeleton type="donut" height={250} />
          <ChartSkeleton type="bar" height={250} />
          <ChartSkeleton type="line" height={250} />
          <ChartSkeleton type="mixed" height={250} />
        </div>
      </section>

      {/* Table Skeletons */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Table Skeletons</h2>
        <TableSkeleton
          variant="default"
          rows={5}
          columns={6}
          title="Example Data Table"
          subtitle="Showing loading state with all features"
        />
      </section>

      {/* Heat Map Skeleton */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Heat Map Skeleton</h2>
        <HeatMapSkeleton
          showHeader={true}
          showLegend={true}
          regions={12}
          title="Geographic Distribution"
        />
      </section>

      {/* Upload Centre States */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Upload Centre States</h2>
        <div className="space-y-6">
          <UploadCentreSkeleton variant="upload" />
          <UploadCentreSkeleton variant="processing" />
          <UploadCentreSkeleton variant="complete" />
        </div>
      </section>
    </div>
  );
}

/* =====================================================
   5. PLACEHOLDER COMPONENTS (for demo purposes)
   ===================================================== */

function HeaderDataPlaceholder() {
  return (
    <div className="h-12 bg-gray-100 rounded-lg animate-pulse flex items-center px-4">
      <span className="text-gray-500">Header controls and dropdowns</span>
    </div>
  );
}

function AnalyticsBannerActual({ data }: { data: any }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <div className="text-lg font-semibold mb-4">Analytics Overview</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-gray-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(Math.random() * 1000)}K
            </div>
            <div className="text-sm text-gray-600">Metric {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PeerComparisonChartActual() {
  return (
    <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
      <span className="text-lg text-blue-600">Peer Comparison Chart</span>
    </div>
  );
}

function DonutChartActual() {
  return (
    <div className="h-80 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
      <span className="text-lg text-green-600">Donut Chart</span>
    </div>
  );
}

function UploadCentreActual({ onFileUpload }: { onFileUpload: (files: File[]) => void }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="text-lg font-semibold mb-4">Upload Centre</div>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-gray-500 mb-4">Drop files here or click to browse</div>
        <button
          onClick={() => onFileUpload([])}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Select Files
        </button>
      </div>
    </div>
  );
}

export default EnhancedSalesAnalyticsPage;