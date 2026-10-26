import { CriticalIssue, CriticalIssuesFilters, CriticalIssuesResponse } from './criticalIssues.service';

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-side service for Critical Issues API
 * All methods make fetch calls to EC2 backend API endpoints
 */
export class CriticalIssuesClientService {
  /**
   * Fetch critical issues with filters
   */
  static async getCriticalIssues(filters: CriticalIssuesFilters = {}): Promise<CriticalIssuesResponse> {
    const searchParams = new URLSearchParams();

    if (filters.searchTerm) searchParams.set('searchTerm', filters.searchTerm);
    if (filters.selectedLocation) searchParams.set('selectedLocation', filters.selectedLocation);
    if (filters.riskLevel) searchParams.set('riskLevel', filters.riskLevel);
    if (filters.severity) searchParams.set('severity', filters.severity);
    if (filters.category) searchParams.set('category', filters.category);
    if (filters.dateRange) {
      searchParams.set('startDate', filters.dateRange.start);
      searchParams.set('endDate', filters.dateRange.end);
    }
    if (filters.shopIds) searchParams.set('shopIds', filters.shopIds.join(','));
    if (filters.skuIds) searchParams.set('skuIds', filters.skuIds.join(','));
    if (filters.limit) searchParams.set('limit', filters.limit.toString());
    if (filters.offset) searchParams.set('offset', filters.offset.toString());
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch critical issues: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch critical issues');
    }

    return result.data;
  }

  /**
   * Fetch a specific critical issue by ID
   */
  static async getCriticalIssueById(id: string): Promise<CriticalIssue> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch critical issue: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch critical issue');
    }

    return result.data;
  }

  /**
   * Fetch critical issues statistics
   */
  static async getCriticalIssuesStats(): Promise<{
    totalIssues: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    averageDaysStuck: number;
    categories: Record<string, number>;
  }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch critical issues stats: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch critical issues stats');
    }

    return result.data;
  }

  /**
   * Update a critical issue
   */
  static async updateCriticalIssue(id: string, updates: Partial<CriticalIssue>): Promise<CriticalIssue> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update critical issue: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update critical issue');
    }

    return result.data;
  }

  /**
   * Create a new critical issue
   */
  static async createCriticalIssue(issue: Omit<CriticalIssue, 'id' | 'createdAt' | 'updatedAt'>): Promise<CriticalIssue> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(issue),
    });

    if (!response.ok) {
      throw new Error(`Failed to create critical issue: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create critical issue');
    }

    return result.data;
  }

  /**
   * Delete a critical issue
   */
  static async deleteCriticalIssue(id: string): Promise<void> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const response = await fetch(`${API_BASE_URL}/api/issues/critical/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete critical issue: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete critical issue');
    }
  }
}
