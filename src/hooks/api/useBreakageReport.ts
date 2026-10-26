import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  breakageReportService,
  BreakageStatistics,
  BreakageByShop,
  BreakageBySKU,
  BreakageTrend,
  BreakageAnalysis,
  BreakageFilters,
} from "../../lib/services/breakageReport.client";

// Query keys for breakage report data
export const BREAKAGE_QUERY_KEYS = {
  all: ["breakage"] as const,
  statistics: (filters: BreakageFilters) =>
    ["breakage", "statistics", filters] as const,
  byShop: (filters: BreakageFilters) =>
    ["breakage", "by-shop", filters] as const,
  bySKU: (filters: BreakageFilters) => ["breakage", "by-sku", filters] as const,
  trends: (filters: BreakageFilters) =>
    ["breakage", "trends", filters] as const,
  analysis: (filters: BreakageFilters) =>
    ["breakage", "analysis", filters] as const,
} as const;

/**
 * Hook for fetching breakage statistics
 */
export function useBreakageStatistics(
  filters: BreakageFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: BREAKAGE_QUERY_KEYS.statistics(filters),
    queryFn: () => breakageReportService.getBreakageStatistics(filters),
    enabled,
    staleTime: 0, // Always fresh for instant updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Rely on invalidation instead of polling
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching breakage data by shop
 */
export function useBreakageByShop(
  filters: BreakageFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: BREAKAGE_QUERY_KEYS.byShop(filters),
    queryFn: () => breakageReportService.getBreakageByShop(filters),
    enabled,
    staleTime: 0, // Always fresh for instant updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Rely on invalidation instead of polling
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}

/**
 * Hook for fetching breakage data by SKU
 */
export function useBreakageBySKU(
  filters: BreakageFilters,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["brekage-by-skus", filters],
    queryFn: () => breakageReportService.getBreakageBySKU(filters),
    enabled,
    staleTime: 0, // Always fresh for instant updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Rely on invalidation instead of polling
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 3,
  });
}

/**
 * Hook for fetching breakage trends
 */
export function useBreakageTrends(
  filters: BreakageFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: BREAKAGE_QUERY_KEYS.trends(filters),
    queryFn: () => breakageReportService.getBreakageTrends(filters),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: enabled ? 20 * 60 * 1000 : false, // Refetch every 20 minutes only if enabled
    retry: 3,
  });
}

/**
 * Hook for fetching breakage analysis
 */
export function useBreakageAnalysis(
  filters: BreakageFilters = {},
  enabled: boolean = true
) {
  return useQuery({
    queryKey: BREAKAGE_QUERY_KEYS.analysis(filters),
    queryFn: () => breakageReportService.getBreakageAnalysis(filters),
    enabled,
    staleTime: 20 * 60 * 1000, // 20 minutes
    gcTime: 40 * 60 * 1000, // 40 minutes
    refetchInterval: enabled ? 30 * 60 * 1000 : false, // Refetch every 30 minutes only if enabled
    retry: 3,
  });
}

/**
 * Hook for comprehensive breakage report data
 */
export function useBreakageReport(
  filters: BreakageFilters = {},
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled !== undefined ? options.enabled : true;

  const statisticsQuery = useBreakageStatistics(filters, enabled);
  const byShopQuery = useBreakageByShop(filters, enabled);
  const bySKUQuery = useBreakageBySKU(filters, enabled);
  const trendsQuery = useBreakageTrends(filters, enabled);
  const analysisQuery = useBreakageAnalysis(filters, enabled);

  // Process data for enhanced insights
  const processedData = useMemo(() => {
    if (!statisticsQuery.data || !byShopQuery.data || !bySKUQuery.data) {
      return null;
    }

    const { data: statistics } = statisticsQuery;
    const { data: byShop } = byShopQuery;
    const { data: bySKU } = bySKUQuery;
    const { data: trends } = trendsQuery;
    const { data: analysis } = analysisQuery;

    // Calculate additional insights
    const riskFactors = {
      highRiskShops: byShop.filter(
        (shop: BreakageByShop) => shop.breakagePercentage > 10
      ).length,
      highRiskSKUs: bySKU.filter((sku: BreakageBySKU) => sku.breakageRate > 15)
        .length,
      criticalValue: bySKU
        .filter((sku: BreakageBySKU) => sku.breakageValue > 1000)
        .reduce(
          (sum: number, sku: BreakageBySKU) => sum + sku.breakageValue,
          0
        ),
    };

    // Top risk categories
    const skusByCategory = new Map<
      string,
      {
        breakageCount: number;
        breakageValue: number;
        skuCount: number;
      }
    >();

    bySKU.forEach((sku: BreakageBySKU) => {
      const category = sku.category;
      const current = skusByCategory.get(category) || {
        breakageCount: 0,
        breakageValue: 0,
        skuCount: 0,
      };

      current.breakageCount += sku.breakageCount;
      current.breakageValue += sku.breakageValue;
      current.skuCount += 1;

      skusByCategory.set(category, current);
    });

    const categoryRisks = Array.from(skusByCategory.entries())
      .map(([category, data]) => ({
        category,
        ...data,
        averageBreakagePerSKU:
          data.skuCount > 0 ? data.breakageCount / data.skuCount : 0,
        riskScore: data.breakageCount * 0.3 + data.breakageValue * 0.7,
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    // Performance metrics
    const performance = {
      avgBreakagePerShop:
        byShop.length > 0
          ? byShop.reduce(
              (sum: number, shop: BreakageByShop) => sum + shop.breakageCount,
              0
            ) / byShop.length
          : 0,
      avgBreakagePerSKU:
        bySKU.length > 0
          ? bySKU.reduce(
              (sum: number, sku: BreakageBySKU) => sum + sku.breakageCount,
              0
            ) / bySKU.length
          : 0,
      totalAffectedShops: byShop.filter(
        (shop: BreakageByShop) => shop.breakageCount > 0
      ).length,
      totalAffectedSKUs: bySKU.filter(
        (sku: BreakageBySKU) => sku.breakageCount > 0
      ).length,
    };

    return {
      statistics,
      byShop,
      bySKU,
      trends: trends || [],
      analysis: analysis || { causes: [], patterns: [], recommendations: [] },
      insights: {
        riskFactors,
        categoryRisks,
        performance,
      },
    };
  }, [
    statisticsQuery.data,
    byShopQuery.data,
    bySKUQuery.data,
    trendsQuery.data,
    analysisQuery.data,
  ]);

  const isLoading =
    statisticsQuery.isLoading ||
    byShopQuery.isLoading ||
    bySKUQuery.isLoading ||
    trendsQuery.isLoading ||
    analysisQuery.isLoading;

  const isError =
    statisticsQuery.isError ||
    byShopQuery.isError ||
    bySKUQuery.isError ||
    trendsQuery.isError ||
    analysisQuery.isError;

  const error =
    statisticsQuery.error ||
    byShopQuery.error ||
    bySKUQuery.error ||
    trendsQuery.error ||
    analysisQuery.error;

  return {
    data: processedData,
    rawData: {
      statistics: statisticsQuery.data,
      byShop: byShopQuery.data,
      bySKU: bySKUQuery.data,
      trends: trendsQuery.data,
      analysis: analysisQuery.data,
    },
    isLoading,
    isError,
    error,
    refetch: useCallback(() => {
      return Promise.all([
        statisticsQuery.refetch(),
        byShopQuery.refetch(),
        bySKUQuery.refetch(),
        trendsQuery.refetch(),
        analysisQuery.refetch(),
      ]);
    }, [
      statisticsQuery.refetch,
      byShopQuery.refetch,
      bySKUQuery.refetch,
      trendsQuery.refetch,
      analysisQuery.refetch,
    ]),
  };
}

/**
 * Hook for breakage alerts and notifications
 */
export function useBreakageAlerts(
  filters: BreakageFilters = {},
  thresholds = {
    breakagePercentage: 5,
    dailyBreakageValue: 1000,
    shopBreakageCount: 10,
  }
) {
  const breakageData = useBreakageReport(filters);

  const alerts = useMemo(() => {
    if (!breakageData.data) return [];

    const { statistics, byShop, bySKU, trends } = breakageData.data;
    const alertList = [];

    // Overall breakage percentage alert
    if (statistics.breakagePercentage > thresholds.breakagePercentage) {
      alertList.push({
        type: "critical" as const,
        title: "High Overall Breakage Rate",
        message: `Breakage rate of ${statistics.breakagePercentage.toFixed(
          1
        )}% exceeds threshold of ${thresholds.breakagePercentage}%`,
        value: statistics.breakagePercentage,
        threshold: thresholds.breakagePercentage,
      });
    }

    // Shop-specific alerts
    byShop.forEach((shop: BreakageByShop) => {
      if (shop.breakageCount > thresholds.shopBreakageCount) {
        alertList.push({
          type: "warning" as const,
          title: "High Shop Breakage",
          message: `${shop.shopName} has ${shop.breakageCount} breakages, exceeding threshold of ${thresholds.shopBreakageCount}`,
          value: shop.breakageCount,
          threshold: thresholds.shopBreakageCount,
          shopId: shop.shopId,
        });
      }
    });

    // Daily value alerts
    if (trends.length > 0) {
      const latestTrend = trends[trends.length - 1];
      if (latestTrend.breakageValue > thresholds.dailyBreakageValue) {
        alertList.push({
          type: "warning" as const,
          title: "High Daily Breakage Value",
          message: `Daily breakage value of ₹${latestTrend.breakageValue.toFixed(
            0
          )} exceeds threshold of ₹${thresholds.dailyBreakageValue}`,
          value: latestTrend.breakageValue,
          threshold: thresholds.dailyBreakageValue,
        });
      }
    }

    return alertList.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1 };
      return priority[b.type] - priority[a.type];
    });
  }, [breakageData.data, thresholds]);

  return {
    alerts,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter((alert) => alert.type === "critical").length,
    warningAlerts: alerts.filter((alert) => alert.type === "warning").length,
    isLoading: breakageData.isLoading,
    error: breakageData.error,
  };
}

/**
 * Hook for breakage prevention insights
 */
export function useBreakagePrevention(filters: BreakageFilters = {}) {
  const analysisQuery = useBreakageAnalysis(filters);
  const bySKUQuery = useBreakageBySKU(filters);
  const byShopQuery = useBreakageByShop(filters);

  const preventionInsights = useMemo(() => {
    if (!analysisQuery.data || !bySKUQuery.data || !byShopQuery.data) {
      return null;
    }

    const { recommendations, causes } = analysisQuery.data;
    const skuData = bySKUQuery.data;
    const shopData = byShopQuery.data;

    // Prioritize recommendations based on potential impact
    const prioritizedRecommendations = recommendations
      .map((rec: any) => ({
        ...rec,
        impactScore:
          rec.priority === "high" ? 3 : rec.priority === "medium" ? 2 : 1,
      }))
      .sort((a: any, b: any) => b.impactScore - a.impactScore);

    // Identify preventable breakage value
    const preventableValue = causes.reduce((sum: number, cause: any) => {
      // Assume 70% of transportation and handling breakages are preventable
      const preventablePercentage =
        cause.cause.includes("Transportation") ||
        cause.cause.includes("handling")
          ? 0.7
          : 0.3;
      return sum + cause.frequency * cause.averageValue * preventablePercentage;
    }, 0);

    // Target areas for improvement
    const improvementAreas = [
      {
        area: "High-Risk Products",
        items: skuData.filter((sku: any) => sku.breakageRate > 10).length,
        potentialSavings: skuData
          .filter((sku: any) => sku.breakageRate > 10)
          .reduce((sum: number, sku: any) => sum + sku.breakageValue * 0.5, 0), // Assume 50% reduction possible
      },
      {
        area: "High-Risk Locations",
        items: shopData.filter((shop: any) => shop.breakagePercentage > 7)
          .length,
        potentialSavings: shopData
          .filter((shop: any) => shop.breakagePercentage > 7)
          .reduce(
            (sum: number, shop: any) => sum + shop.breakageValue * 0.3,
            0
          ), // Assume 30% reduction possible
      },
    ];

    return {
      prioritizedRecommendations,
      preventableValue,
      improvementAreas,
      totalPotentialSavings: improvementAreas.reduce(
        (sum, area) => sum + area.potentialSavings,
        0
      ),
    };
  }, [analysisQuery.data, bySKUQuery.data, byShopQuery.data]);

  return {
    data: preventionInsights,
    isLoading:
      analysisQuery.isLoading || bySKUQuery.isLoading || byShopQuery.isLoading,
    isError: analysisQuery.isError || bySKUQuery.isError || byShopQuery.isError,
    error: analysisQuery.error || bySKUQuery.error || byShopQuery.error,
  };
}

/**
 * Hook for breakage cache management
 */
export function useBreakageCache() {
  const queryClient = useQueryClient();

  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: BREAKAGE_QUERY_KEYS.all });
    breakageReportService.clearCache();
  }, [queryClient]);

  const invalidateCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: BREAKAGE_QUERY_KEYS.all });
  }, [queryClient]);

  const prefetchBreakageData = useCallback(
    (filters: BreakageFilters = {}) => {
      return Promise.all([
        queryClient.prefetchQuery({
          queryKey: BREAKAGE_QUERY_KEYS.statistics(filters),
          queryFn: () => breakageReportService.getBreakageStatistics(filters),
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: BREAKAGE_QUERY_KEYS.byShop(filters),
          queryFn: () => breakageReportService.getBreakageByShop(filters),
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: BREAKAGE_QUERY_KEYS.bySKU(filters),
          queryFn: () => breakageReportService.getBreakageBySKU(filters),
          staleTime: 10 * 60 * 1000,
        }),
      ]);
    },
    [queryClient]
  );

  return {
    clearCache,
    invalidateCache,
    prefetchBreakageData,
  };
}

/**
 * Hook for breakage data export
 */
export function useBreakageExport() {
  const mutation = useMutation({
    mutationFn: async ({
      filters,
      format,
      dataType,
    }: {
      filters: BreakageFilters;
      format: "csv" | "json" | "excel";
      dataType: "statistics" | "by-shop" | "by-sku" | "trends" | "all";
    }) => {
      let data;

      switch (dataType) {
        case "statistics":
          data = await breakageReportService.getBreakageStatistics(filters);
          break;
        case "by-shop":
          data = await breakageReportService.getBreakageByShop(filters);
          break;
        case "by-sku":
          data = await breakageReportService.getBreakageBySKU(filters);
          break;
        case "trends":
          data = await breakageReportService.getBreakageTrends(filters);
          break;
        case "all":
          data = {
            statistics: await breakageReportService.getBreakageStatistics(
              filters
            ),
            byShop: await breakageReportService.getBreakageByShop(filters),
            bySKU: await breakageReportService.getBreakageBySKU(filters),
            trends: await breakageReportService.getBreakageTrends(filters),
          };
          break;
        default:
          throw new Error("Invalid data type");
      }

      return { data, format, dataType };
    },
    onSuccess: ({ data, format, dataType }) => {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === "csv") {
        content = formatAsCSV(data, dataType);
        mimeType = "text/csv;charset=utf-8;";
        extension = "csv";
      } else if (format === "excel") {
        content = formatAsExcel(data, dataType);
        mimeType = "application/vnd.ms-excel";
        extension = "xls";
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = "application/json";
        extension = "json";
      }

      // Create blob and download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `breakage-report-${dataType}-${
        new Date().toISOString().split("T")[0]
      }.${extension}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    onError: (error) => {
      console.error("Breakage export failed:", error);
    },
  });

  return mutation;
}

// Helper function for CSV formatting
function formatAsCSV(data: any, dataType: string): string {
  switch (dataType) {
    case "by-shop": {
      const headers = "Shop Name,DP Code,Location,Breakage Count\n";
      const rows = (data as BreakageByShop[])
        .map(
          (shop) =>
            `"${shop.shopName}","${shop.dpCode}","${shop.location}",${shop.breakageCount}`
        )
        .join("\n");
      return headers + rows;
    }
    case "by-sku": {
      const headers = "SKU,Product Name,Category,Breakage Count,sizeML\n";
      const rows = (data as any[])
        .map(
          (item) =>
            `"${item.sku || ""}","${item.productName || ""}","${
              item.category || ""
            }",${item.breakageCount || 0},${item.sizeML || 0}`
        )
        .join("\n");
      return headers + rows;
    }
    case "statistics": {
      const stats = data as any;
      return (
        `Metric,Value\n` +
        `Total Breakage Count,${stats.totalBreakageCount || 0}\n`
      );
    }
    case "trends": {
      const headers = "Date,Breakage Count,\n";
      const rows = (data as any[])
        .map((trend) => `"${trend.date || ""}",${trend.breakageCount || 0}`)
        .join("\n");
      return headers + rows;
    }
    case "all": {
      let csv = "=== BY SHOP ===\n";
      csv += formatAsCSV(data.byShop, "by-shop") + "\n\n";
      csv += "=== BY SKU ===\n";
      csv += formatAsCSV(data.bySKU, "by-sku") + "\n\n";
      csv += "=== TRENDS ===\n";
      csv += formatAsCSV(data.trends, "trends");
      return csv;
    }
    default:
      return "";
  }
}

// Helper function for Excel formatting (HTML table format that Excel can open)
function formatAsExcel(data: any, dataType: string): string {
  const createTable = (headers: string[], rows: string[][]): string => {
    let html = '<table border="1"><thead><tr>';
    headers.forEach(
      (h) =>
        (html += `<th style="background-color: #4472C4; color: white; font-weight: bold; padding: 8px;">${h}</th>`)
    );
    html += "</tr></thead><tbody>";
    rows.forEach((row, idx) => {
      html += `<tr style="background-color: ${
        idx % 2 === 0 ? "#ffffff" : "#f2f2f2"
      };">`;
      row.forEach((cell) => (html += `<td style="padding: 6px;">${cell}</td>`));
      html += "</tr>";
    });
    html += "</tbody></table>";
    return html;
  };

  let htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; text-align: left; }
      </style>
    </head>
    <body>
  `;

  switch (dataType) {
    case "by-shop": {
      const headers = [
        "Shop Name",
        "DP Code",
        "Location",
        "Breakage Count",
        "Breakage %",
        "Total Sales",
      ];
      const rows = (data as BreakageByShop[]).map((shop) => [
        shop.shopName || "",
        shop.dpCode || "",
        shop.location || "",
        (shop.breakageCount || 0).toString(),
        (shop.breakagePercentage || 0).toFixed(2),
        ((shop as any).totalSales || 0).toString(),
      ]);
      htmlContent += "<h2>Breakage Report - By Shop</h2>";
      htmlContent += createTable(headers, rows);
      break;
    }
    case "by-sku": {
      const headers = [
        "SKU",
        "Product Name",
        "Category",
        "Breakage Count",
        "Breakage %",
      ];
      const rows = (data as any[]).map((item) => [
        item.sku || "",
        item.productName || "",
        item.category || "",
        (item.breakageCount || 0).toString(),
        (item.breakagePercentage || 0).toFixed(2),
      ]);
      htmlContent += "<h2>Breakage Report - By SKU</h2>";
      htmlContent += createTable(headers, rows);
      break;
    }
    case "statistics": {
      const stats = data as any;
      const headers = ["Metric", "Value"];
      const rows = [
        ["Total Breakage Count", (stats.totalBreakageCount || 0).toString()],
        ["Total Breakage Value", (stats.totalBreakageValue || 0).toString()],
        [
          "Average Breakage %",
          (stats.averageBreakagePercentage || 0).toFixed(2),
        ],
      ];
      htmlContent += "<h2>Breakage Report - Statistics</h2>";
      htmlContent += createTable(headers, rows);
      break;
    }
    case "trends": {
      const headers = ["Date", "Breakage Count"];
      const rows = (data as any[]).map((trend) => [
        trend.date || "",
        (trend.breakageCount || 0).toString(),
        (trend.breakagePercentage || 0).toFixed(2),
      ]);
      htmlContent += "<h2>Breakage Report - Trends</h2>";
      htmlContent += createTable(headers, rows);
      break;
    }
    case "all": {
      htmlContent += "<h2>Statistics</h2>";
      htmlContent += formatAsExcel(data.statistics, "statistics");
      htmlContent += "<br/><h2>By Shop</h2>";
      htmlContent += formatAsExcel(data.byShop, "by-shop");
      htmlContent += "<br/><h2>By SKU</h2>";
      htmlContent += formatAsExcel(data.bySKU, "by-sku");
      htmlContent += "<br/><h2>Trends</h2>";
      htmlContent += formatAsExcel(data.trends, "trends");
      break;
    }
  }

  htmlContent += "</body></html>";
  return htmlContent;
}

// Export types for external use
export type {
  BreakageStatistics,
  BreakageByShop,
  BreakageBySKU,
  BreakageTrend,
  BreakageAnalysis,
  BreakageFilters,
};
