/**
 * Critical Issues Service Types
 * Defines the data structures for critical issues management
 */

export interface CriticalIssue {
  id: string;
  title: string;
  risk: string;
  description: string;
  time: string;
  level: 1 | 2 | 3; // Risk level: 1 = high, 2 = medium, 3 = low
  shopId: string;
  skuId: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
  category: 'stock' | 'performance' | 'compliance' | string;
  daysStuck: number;
  closingStock: number;
  salesLast30Days: number;
  createdAt: string;
  updatedAt: string;
}

export interface CriticalIssuesFilters {
  searchTerm?: string;
  selectedLocation?: string;
  riskLevel?: string;
  severity?: 'high' | 'medium' | 'low';
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  shopIds?: string[];
  skuIds?: string[];
  limit?: number;
  offset?: number;
}

export interface CriticalIssuesResponse {
  items: CriticalIssue[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    totalPages: number;
  };
}

















