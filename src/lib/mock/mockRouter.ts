/**
 * Central Mock Router
 * Matches incoming API URLs and returns corresponding dummy data.
 */

import {
  DUMMY_USER,
  DUMMY_AUTH_TOKEN,
  DUMMY_USERS_LIST,
  DUMMY_USER_STATISTICS,
  DUMMY_DASHBOARD_METRICS,
  DUMMY_PEER_COMPARISON,
  DUMMY_REPORTING_GAPS,
  DUMMY_SALES_VS_CLOSING,
  DUMMY_TOP_PRODUCTS,
  DUMMY_TOP_SHOPS,
  DUMMY_DEMAND_BY_SKU,
  DUMMY_SALES_BY_PACK_SIZE,
  DUMMY_DP_CODES_PIE_CHART,
  DUMMY_OVERALL_SALES_SPLIT,
  DUMMY_SHOP_SALES_VS_CLOSING,
  DUMMY_DAILY_SALES_REPORTS,
  DUMMY_DETAILED_DAILY_REPORT,
  DUMMY_SALES_METRICS,
  DUMMY_SALES_BY_PERIOD,
  DUMMY_SALES_BY_CATEGORY,
  DUMMY_STAFF_PERSONS,
  DUMMY_STAFF_OVERVIEW,
  DUMMY_MARKET_SHARE,
  DUMMY_HEATMAP_DATA,
  DUMMY_LOCATION_SUMMARY,
  DUMMY_LOCATION_TRENDS,
  DUMMY_BREAKAGE_STATISTICS,
  DUMMY_BREAKAGE_BY_SHOP,
  DUMMY_BREAKAGE_BY_SKU,
  DUMMY_BREAKAGE_TRENDS,
  DUMMY_CRITICAL_ISSUES,
  DUMMY_CRITICAL_METRICS,
  DUMMY_AI_DASHBOARD,
  DUMMY_UPLOAD_ANALYTICS,
  DUMMY_UPLOAD_SESSIONS,
  DUMMY_OCR_REVIEW_DATA,
  getDummyReviewData,
  DUMMY_SHOPS,
  DUMMY_SKUS,
  DUMMY_SELLER_PROFILE,
  DUMMY_SHOP_DETAIL,
  DUMMY_PRODUCT_PAGE_DATA,
  DUMMY_SHOP_BRAND_STOCK_RESPONSE,
  DUMMY_DEMAND_TABLE_DATA,
} from "../constants/dummyData";

export interface MockResponse {
  status: number;
  data: any;
}

export function handleMockRequest(rawUrl: string, method: string = "GET", _body?: any): MockResponse {
  const normMethod = (method || "GET").toUpperCase();

  // Strip host and protocol if present
  let cleanUrl = rawUrl.replace(/^https?:\/\/[^\/]+/, "");
  if (!cleanUrl.startsWith("/")) {
    cleanUrl = "/" + cleanUrl;
  }
  const [path] = cleanUrl.split("?");

  // 1. Auth Endpoints
  if (path.includes("/api/auth/login")) {
    return {
      status: 200,
      data: {
        success: true,
        token: DUMMY_AUTH_TOKEN,
        user: DUMMY_USER,
        message: "Signed in successfully",
      },
    };
  }

  if (path.includes("/api/auth/me")) {
    return {
      status: 200,
      data: {
        success: true,
        user: DUMMY_USER,
      },
    };
  }

  if (path.includes("/api/auth/logout")) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Logged out successfully",
      },
    };
  }

  if (path.includes("/api/auth/signup")) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Account created successfully",
        user: DUMMY_USER,
      },
    };
  }

  if (path.includes("/api/auth/forgot-password") || path.includes("/api/auth/reset-password")) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Password reset request processed",
      },
    };
  }

  if (path.includes("/api/auth/users/stats")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_USER_STATISTICS,
      },
    };
  }

  if (path.startsWith("/api/auth/users")) {
    if (normMethod === "POST") {
      return {
        status: 200,
        data: {
          success: true,
          data: DUMMY_USERS_LIST[0],
          message: "User created successfully",
        },
      };
    }
    if (normMethod === "PATCH" || normMethod === "PUT" || normMethod === "DELETE") {
      return {
        status: 200,
        data: {
          success: true,
          message: "User updated successfully",
        },
      };
    }
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_USERS_LIST,
      },
    };
  }

  // 2. Dashboard Endpoints
  if (path.includes("/api/dashboard/metrics")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_DASHBOARD_METRICS,
      },
    };
  }

  if (path.includes("/api/dashboard/peer-comparison")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_PEER_COMPARISON,
      },
    };
  }

  if (path.includes("/api/dashboard/reporting-gaps")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_REPORTING_GAPS,
      },
    };
  }

  if (path.includes("/api/dashboard/sales-vs-closing")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SALES_VS_CLOSING,
      },
    };
  }

  if (path.includes("/api/dashboard/top-products-service")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_TOP_PRODUCTS,
      },
    };
  }

  if (path.includes("/api/dashboard/top-shops-service")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_TOP_SHOPS,
      },
    };
  }

  if (path.includes("/api/dashboard/overall-sales-split")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_OVERALL_SALES_SPLIT,
      },
    };
  }

  if (path.includes("/api/dashboard/shop-sales-vs-closing")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SHOP_SALES_VS_CLOSING,
      },
    };
  }

  if (path.includes("/api/dashboard/dp-codes-pie-chart")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_DP_CODES_PIE_CHART,
      },
    };
  }

  if (path.includes("/api/dashboard/critical-metrics")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_CRITICAL_METRICS,
      },
    };
  }

  // 3. Demand & Pack Size
  if (path.includes("/api/demand/by-sku-date-range")) {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          items: DUMMY_DEMAND_BY_SKU,
        },
      },
    };
  }

  if (path.includes("/api/demand/sales-pack-size-date-range")) {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          items: DUMMY_SALES_BY_PACK_SIZE,
        },
      },
    };
  }

  if (path.includes("/api/demand/table")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_DEMAND_TABLE_DATA,
      },
    };
  }

  // 4. Daily Reports & Export
  if (path.includes("/api/reports/daily/sales")) {
    return {
      status: 200,
      data: {
        success: true,
        reports: DUMMY_DAILY_SALES_REPORTS,
        total: DUMMY_DAILY_SALES_REPORTS.length,
        pagination: { totalPages: 1 },
        reported_by: DUMMY_STAFF_PERSONS.map((p) => ({ id: p.id, name: p.name })),
      },
    };
  }

  if (path.includes("/api/reports/daily/export")) {
    return {
      status: 200,
      data: DUMMY_DAILY_SALES_REPORTS,
    };
  }

  if (path.includes("/api/reports/daily")) {
    return {
      status: 200,
      data: {
        success: true,
        items: DUMMY_DAILY_SALES_REPORTS,
        total: DUMMY_DAILY_SALES_REPORTS.length,
        pagination: { totalPages: 1 },
      },
    };
  }

  if (path.includes("/api/reports/weekly")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SALES_VS_CLOSING,
      },
    };
  }

  // 5. Seller & Staff Endpoints
  if (path.includes("/api/seller/report/daily")) {
    return {
      status: 200,
      data: DUMMY_DETAILED_DAILY_REPORT,
    };
  }

  if (path.includes("/api/seller/profile")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SELLER_PROFILE,
        message: "Seller profile retrieved",
      },
    };
  }

  if (path.includes("/api/seller/shop-detail") || path.includes("/api/seller/shop/")) {
    if (path.includes("/upload")) {
      return {
        status: 200,
        data: {
          success: true,
          data: { dp_code: "DCCWS", images: [] },
          message: "Uploaded",
        },
      };
    }
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SHOP_DETAIL,
        message: "Shop details retrieved",
      },
    };
  }

  if (path.includes("/api/seller/product/")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_PRODUCT_PAGE_DATA,
        message: "Product retrieved",
      },
    };
  }

  if (path.includes("/api/seller/shop")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SHOPS,
      },
    };
  }

  if (path.includes("/api/seller/daily-stocks")) {
    return {
      status: 200,
      data: {
        success: true,
        message: "Daily stocks updated successfully",
      },
    };
  }

  // Staff P&L and Market Share
  if (path.includes("/api/staff-pl/staff")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_STAFF_PERSONS,
      },
    };
  }

  if (path.includes("/api/staff-pl/") && path.includes("/overview")) {
    return {
      status: 200,
      data: DUMMY_STAFF_OVERVIEW,
    };
  }

  if (path.includes("/api/staff-pl/")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SALES_VS_CLOSING,
      },
    };
  }

  if (path.includes("/api/market-share/comprehensive")) {
    return {
      status: 200,
      data: DUMMY_MARKET_SHARE,
    };
  }

  // 6. Sales Analytics
  if (path.includes("/api/analytics/sales/metrics")) {
    return {
      status: 200,
      data: DUMMY_SALES_METRICS,
    };
  }

  if (path.includes("/api/analytics/sales/by-period")) {
    return {
      status: 200,
      data: DUMMY_SALES_BY_PERIOD,
    };
  }

  if (path.includes("/api/analytics/sales/by-category")) {
    return {
      status: 200,
      data: DUMMY_SALES_BY_CATEGORY,
    };
  }

  if (path.includes("/api/analytics/sales")) {
    return {
      status: 200,
      data: DUMMY_SALES_METRICS,
    };
  }

  // 7. Heatmap
  if (path.includes("/api/analytics/heatmap/summary") || path.includes("/api/heatmap/summary")) {
    return {
      status: 200,
      data: DUMMY_LOCATION_SUMMARY,
    };
  }

  if (path.includes("/api/analytics/heatmap/trends") || path.includes("/api/heatmap/trends")) {
    return {
      status: 200,
      data: DUMMY_LOCATION_TRENDS,
    };
  }

  if (path.includes("/api/analytics/heatmap") || path.includes("/api/heatmap")) {
    return {
      status: 200,
      data: DUMMY_HEATMAP_DATA,
    };
  }

  if (path.includes("/stocks/shop-brand-stock")) {
    return {
      status: 200,
      data: DUMMY_SHOP_BRAND_STOCK_RESPONSE,
    };
  }

  // 8. Breakage Report
  if (path.includes("/breakage/statistics") || path.includes("/breakage/summary")) {
    return {
      status: 200,
      data: DUMMY_BREAKAGE_STATISTICS,
    };
  }

  if (path.includes("/breakage/by-shop")) {
    return {
      status: 200,
      data: DUMMY_BREAKAGE_BY_SHOP,
    };
  }

  if (path.includes("/breakage/by-sku")) {
    return {
      status: 200,
      data: DUMMY_BREAKAGE_BY_SKU,
    };
  }

  if (path.includes("/breakage/trends")) {
    return {
      status: 200,
      data: DUMMY_BREAKAGE_TRENDS,
    };
  }

  if (path.includes("/breakage/analysis")) {
    return {
      status: 200,
      data: {
        summary: {
          totalBreakages: 116,
          totalValue: 24360,
          affectedShops: 6,
          affectedSKUs: 5,
          breakageRate: 0.68,
        },
        causes: [
          { cause: "Handling Transit", count: 54, percentage: 46.5, value: 11340 },
          { cause: "Storage Damage", count: 38, percentage: 32.8, value: 7980 },
          { cause: "Display Mishap", count: 24, percentage: 20.7, value: 5040 },
        ],
        patterns: [],
        recommendations: [
          "Improve cushioning on transit crates for 650ml bottles",
          "Maintain maximum stack height of 4 layers in retail shops",
        ],
      },
    };
  }

  if (path.includes("/breakage")) {
    return {
      status: 200,
      data: DUMMY_BREAKAGE_STATISTICS,
    };
  }

  // 9. Critical Issues / Risk Alerts
  if (path.includes("/api/critical-issues") || path.includes("/api/issues/critical")) {
    if (path.includes("/stats")) {
      return {
        status: 200,
        data: {
          success: true,
          data: {
            totalIssues: DUMMY_CRITICAL_ISSUES.length,
            highRiskCount: 1,
            mediumRiskCount: 2,
            lowRiskCount: 1,
            averageDaysStuck: 1.5,
            categories: { stock: 1, compliance: 2, performance: 1 },
          },
        },
      };
    }
    const criticalResponseData = {
      items: DUMMY_CRITICAL_ISSUES,
      pagination: {
        total: DUMMY_CRITICAL_ISSUES.length,
        limit: 10,
        offset: 0,
        totalPages: 1,
      },
    };
    return {
      status: 200,
      data: {
        success: true,
        data: criticalResponseData,
        items: DUMMY_CRITICAL_ISSUES,
        pagination: criticalResponseData.pagination,
      },
    };
  }

  // 10. AI Analytics & OCR
  if (path.includes("/api/ai/analytics/dashboard")) {
    return {
      status: 200,
      data: DUMMY_AI_DASHBOARD,
    };
  }

  if (path.includes("/api/ai/analytics/alerts")) {
    return {
      status: 200,
      data: [
        { type: "info", severity: "low", message: "AI pipeline processing with 96.8% accuracy" },
        { type: "info", severity: "low", message: "All model endpoints healthy" },
      ],
    };
  }

  if (path.includes("/api/ai/upload/analytics") || path.includes("/api/upload/analytics")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_UPLOAD_ANALYTICS,
        ...DUMMY_UPLOAD_ANALYTICS,
      },
    };
  }

  if (path.includes("/review") || (path.includes("/api/upload-sessions/") && path.includes("/review"))) {
    const sessionMatch = path.match(/\/upload-sessions\/([^\/]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : undefined;
    const reviewData = getDummyReviewData(sessionId);
    return {
      status: 200,
      data: {
        success: true,
        data: reviewData,
        ...reviewData,
      },
    };
  }

  if (
    path.includes("/api/ai/upload/queue") ||
    path.includes("/api/upload/history") ||
    path.includes("/api/ai/upload/sessions")
  ) {
    return {
      status: 200,
      data: {
        success: true,
        sessions: DUMMY_UPLOAD_SESSIONS,
        data: DUMMY_UPLOAD_SESSIONS,
      },
    };
  }

  if (normMethod === "DELETE" && (path.includes("/api/upload/") || path.includes("/api/ai/upload/"))) {
    return {
      status: 200,
      data: {
        success: true,
        message: "File deleted successfully",
      },
    };
  }

  if (path.includes("/api/upload/file") || path.includes("/api/ai/upload") || path.includes("/api/upload")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_UPLOAD_SESSIONS[0],
        message: "File uploaded successfully",
      },
    };
  }

  // 11. Shops & SKUs Master Data
  if (path.includes("/api/shops")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SHOPS,
      },
    };
  }

  if (path.includes("/api/skus")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SKUS,
      },
    };
  }

  if (path.includes("/api/inventory/by-shop")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_SKUS,
      },
    };
  }

  if (path.includes("/api/stocks/daily")) {
    return {
      status: 200,
      data: DUMMY_SALES_VS_CLOSING,
    };
  }

  if (path.includes("/api/admin/staff-shop-manage/users")) {
    return {
      status: 200,
      data: {
        success: true,
        data: DUMMY_STAFF_PERSONS,
      },
    };
  }

  // Default fallback for any unhandled /api/* endpoint
  return {
    status: 200,
    data: {
      success: true,
      data: [],
      items: [],
      message: "Operation successful (Dummy Mock Data)",
    },
  };
}
