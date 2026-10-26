// Export all client-side services for easy importing
// Backend services have been moved to a separate Node.js + Express project

// Client services (make API calls to backend)
export { dashboardClientService } from './dashboard.client';
export { AuthClientService } from './auth.client.service';

// Client service exports
export { heatMapClientService as heatmapClient } from './heatmap.client';
export { breakageReportService as breakageReportClient } from './breakageReport.client';
export { salesAnalyticsService as salesAnalyticsClient } from './salesAnalytics.client';
export { AIIntegratedUploadClientService as aiIntegratedUploadClient } from './aiIntegratedUpload.client';
export { dailyReportsClientService as dailyReportsClient } from './dailyReports.client';
export * from './dailyStocks.client';
export * from './fileUpload.client';
export * from './criticalIssues.client';
export * from './fuzzyMatching.client';
export * from './ocr.client';
export * from './shops.client';
export { shopDetailClientService as shopDetailClient } from './shopDetail.client';
export { shopDetailPageClientService as shopDetailPageClient } from './shopDetailPage.client';
export * from './skus.client';
export { sellerProfileClientService as sellerClient } from './seller.client';
export * from './userManagement.client';
export { weeklyCorporationDataClientService as weeklyCorporationDataClient } from './weeklyCorporationData.client';
export { aiWorkflowIntegrationClient as aiWorkflowIntegrationClient } from './aiWorkflowIntegration.client';
export { aiAnalyticsClientService as aiAnalyticsClient } from './aiAnalytics.client';

// Convenience object for accessing all client services
import { dashboardClientService } from './dashboard.client';
import { AuthClientService } from './auth.client.service';

export const clientServices = {
  dashboard: dashboardClientService,
  auth: new AuthClientService(),
} as const;
