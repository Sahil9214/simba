// Re-export types for client use
export type {
  DailyReport,
  DailyReportFilters,
  DailyReportsResponse,
  DailyReportsSummary
} from './dailyReports.service'

// Import types for use in this file
import type {
  DailyReport,
  DailyReportFilters,
  DailyReportsResponse,
  DailyReportsSummary
} from './dailyReports.service'

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-side Daily Reports Service
 * Makes HTTP requests to API routes instead of direct database access
 */
class DailyReportsClientService {
  private baseUrl = `${API_BASE_URL}/api/reports/daily`

  /**
   * Build query string from filters
   */
  private buildQueryString(filters: DailyReportFilters): string {
    const params = new URLSearchParams()

    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
    if (filters.selectedLocation) params.append('selectedLocation', filters.selectedLocation)
    if (filters.reportType) params.append('reportType', filters.reportType)
    if (filters.status) params.append('status', filters.status)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    if (filters.dateRange) {
      params.append('dateRange.start', filters.dateRange.start)
      params.append('dateRange.end', filters.dateRange.end)
    }

    if (filters.shopIds && filters.shopIds.length > 0) {
      params.append('shopIds', filters.shopIds.join(','))
    }

    if (filters.skuIds && filters.skuIds.length > 0) {
      params.append('skuIds', filters.skuIds.join(','))
    }

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Get daily reports with filtering
   */
  async getDailyReports(filters: DailyReportFilters = {}): Promise<DailyReportsResponse> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch daily reports' }))
      throw new Error(error.error || 'Failed to fetch daily reports')
    }

    return response.json()
  }

  /**
   * Get daily reports summary
   */
  async getDailyReportsSummary(
    filters: { dateRange?: { start: string; end: string }; shopIds?: string[] } = {}
  ): Promise<DailyReportsSummary> {
    const params = new URLSearchParams()

    if (filters.dateRange) {
      params.append('dateRange.start', filters.dateRange.start)
      params.append('dateRange.end', filters.dateRange.end)
    }

    if (filters.shopIds && filters.shopIds.length > 0) {
      params.append('shopIds', filters.shopIds.join(','))
    }

    const queryString = params.toString()
    const url = `${this.baseUrl}/summary${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch summary' }))
      throw new Error(error.error || 'Failed to fetch daily reports summary')
    }

    return response.json()
  }

  /**
   * Get a specific daily report by ID
   */
  async getDailyReportById(id: string): Promise<DailyReport | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) return null
      const error = await response.json().catch(() => ({ error: 'Failed to fetch report' }))
      throw new Error(error.error || 'Failed to fetch daily report')
    }

    return response.json()
  }

  /**
   * Create a daily report
   * Note: Not implemented as reports are generated from daily_stocks
   */
  async createDailyReport(
    report: Omit<DailyReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<DailyReport | null> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create report' }))
      throw new Error(error.error || 'Failed to create daily report')
    }

    return response.json()
  }

  /**
   * Update a daily report
   * Note: Not implemented as reports are generated from daily_stocks
   */
  async updateDailyReport(
    id: string,
    updates: Partial<DailyReport>
  ): Promise<DailyReport | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update report' }))
      throw new Error(error.error || 'Failed to update daily report')
    }

    return response.json()
  }

  /**
   * Delete a daily report
   * Note: Not implemented as reports are generated from daily_stocks
   */
  async deleteDailyReport(id: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete report' }))
      throw new Error(error.error || 'Failed to delete daily report')
    }

    const result = await response.json()
    return result.success || false
  }
}

export const dailyReportsClientService = new DailyReportsClientService()
