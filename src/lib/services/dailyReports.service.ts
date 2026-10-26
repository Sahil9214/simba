/**
 * Daily Reports Service Types
 * Defines the data structures for daily reports management
 */

/**
 * Daily Report
 */
export interface DailyReport {
  id: string;
  reportDate: string;
  reportType: 'sales' | 'stock' | 'breakage' | 'compliance' | 'general';
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  shopId: string;
  shopName: string;
  location: string;
  dpCode?: string;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  data: Record<string, any>;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Daily Report Filters
 */
export interface DailyReportFilters {
  searchTerm?: string;
  selectedLocation?: string;
  reportType?: 'sales' | 'stock' | 'breakage' | 'compliance' | 'general';
  status?: 'pending' | 'completed' | 'approved' | 'rejected';
  dateRange?: {
    start: string;
    end: string;
  };
  shopIds?: string[];
  skuIds?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Daily Reports Response (paginated)
 */
export interface DailyReportsResponse {
  reports: DailyReport[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  };
}

/**
 * Daily Reports Summary
 */
export interface DailyReportsSummary {
  totalReports: number;
  byStatus: {
    pending: number;
    completed: number;
    approved: number;
    rejected: number;
  };
  byType: {
    sales: number;
    stock: number;
    breakage: number;
    compliance: number;
    general: number;
  };
  recentReports: DailyReport[];
  trends: {
    dailyAverage: number;
    weeklyTotal: number;
    monthlyTotal: number;
  };
  completionRate: number;
  averageProcessingTime: number;
}

/**
 * Daily Report Stats
 */
export interface DailyReportStats {
  date: string;
  totalReports: number;
  completedReports: number;
  pendingReports: number;
  completionRate: number;
}

/**
 * Daily Report Creation Payload
 */
export interface CreateDailyReportPayload {
  reportDate: string;
  reportType: 'sales' | 'stock' | 'breakage' | 'compliance' | 'general';
  shopId: string;
  submittedBy: string;
  notes?: string;
  data: Record<string, any>;
  attachments?: string[];
}

/**
 * Daily Report Update Payload
 */
export interface UpdateDailyReportPayload {
  status?: 'pending' | 'completed' | 'approved' | 'rejected';
  notes?: string;
  data?: Record<string, any>;
  approvedBy?: string;
  attachments?: string[];
}

















