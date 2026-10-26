import {
  WeeklyCorporationData,
  WeeklyCorporationDataInsert,
  WeeklyCorporationDataUpdate
} from '../types/database.types'

/**
 * Filter options for weekly sales queries
 */
export interface WeeklySalesFilters {
  shop_id?: string;
  sku_id?: string;
  week_ending?: string;
  date_from?: string;
  date_to?: string;
  source_file?: string;
  min_confidence?: number;
}

/**
 * Aggregated weekly sales statistics
 */
export interface WeeklySalesAggregation {
  total_sales: number;
  total_closing_stock: number;
  week_count: number;
  avg_sales_per_week: number;
  avg_stock_per_week: number;
  shop_count: number;
  sku_count: number;
}

/**
 * Shop performance metrics for weekly sales
 */
export interface WeeklyShopPerformance {
  shop_id: string;
  shop_name: string;
  dp_code: string;
  location: string;
  total_sales: number;
  avg_weekly_sales: number;
  total_closing_stock: number;
  weeks_reported: number;
}

/**
 * Product performance metrics for weekly sales
 */
export interface WeeklyProductPerformance {
  sku_id: string;
  product_name: string;
  brand_name: string;
  category: string;
  size_ml: number;
  mrp: number;
  total_sales: number;
  avg_weekly_sales: number;
  total_closing_stock: number;
  weeks_available: number;
}

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

/**
 * Client-side Weekly Corporation Data Service
 * Makes HTTP requests to API routes instead of direct database access
 */
class WeeklyCorporationDataClientService {
  private baseUrl = `${API_BASE_URL}/api/reports/weekly`

  /**
   * Build query string from filters
   */
  private buildQueryString(filters: WeeklySalesFilters): string {
    const params = new URLSearchParams()

    if (filters.shop_id) params.append('shop_id', filters.shop_id)
    if (filters.sku_id) params.append('sku_id', filters.sku_id)
    if (filters.week_ending) params.append('week_ending', filters.week_ending)
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    if (filters.source_file) params.append('source_file', filters.source_file)
    if (filters.min_confidence !== undefined) {
      params.append('min_confidence', filters.min_confidence.toString())
    }

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Get weekly corporation data with optional filtering
   */
  async getWeeklyData(filters: WeeklySalesFilters = {}): Promise<WeeklyCorporationData[]> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch weekly corporation data' }))
      throw new Error(error.error || 'Failed to fetch weekly corporation data')
    }

    return response.json()
  }

  /**
   * Get weekly sales aggregation
   */
  async getWeeklySalesAggregation(filters: WeeklySalesFilters = {}): Promise<WeeklySalesAggregation> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}/aggregation${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch weekly sales aggregation' }))
      throw new Error(error.error || 'Failed to fetch weekly sales aggregation')
    }

    return response.json()
  }

  /**
   * Get weekly shop performance
   */
  async getWeeklyShopPerformance(filters: WeeklySalesFilters = {}): Promise<WeeklyShopPerformance[]> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}/shop-performance${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch weekly shop performance' }))
      throw new Error(error.error || 'Failed to fetch weekly shop performance')
    }

    return response.json()
  }

  /**
   * Get weekly product performance
   */
  async getWeeklyProductPerformance(filters: WeeklySalesFilters = {}): Promise<WeeklyProductPerformance[]> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}/product-performance${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch weekly product performance' }))
      throw new Error(error.error || 'Failed to fetch weekly product performance')
    }

    return response.json()
  }

  /**
   * Get sales trends over time
   */
  async getSalesTrends(filters: WeeklySalesFilters = {}): Promise<Array<{
    week_ending: string
    total_sales: number
    total_closing_stock: number
    shop_count: number
    sku_count: number
  }>> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}/trends${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch sales trends' }))
      throw new Error(error.error || 'Failed to fetch sales trends')
    }

    return response.json()
  }

  /**
   * Create new weekly corporation data record
   */
  async createWeeklyData(data: WeeklyCorporationDataInsert): Promise<WeeklyCorporationData> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create weekly corporation data' }))
      throw new Error(error.error || 'Failed to create weekly corporation data')
    }

    return response.json()
  }

  /**
   * Update weekly corporation data record
   */
  async updateWeeklyData(id: string, updates: WeeklyCorporationDataUpdate): Promise<WeeklyCorporationData> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update weekly corporation data' }))
      throw new Error(error.error || 'Failed to update weekly corporation data')
    }

    return response.json()
  }

  /**
   * Delete weekly corporation data record
   */
  async deleteWeeklyData(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete weekly corporation data' }))
      throw new Error(error.error || 'Failed to delete weekly corporation data')
    }
  }

  /**
   * Bulk create weekly corporation data records
   */
  async bulkCreateWeeklyData(data: WeeklyCorporationDataInsert[]): Promise<WeeklyCorporationData[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to bulk create weekly corporation data' }))
      throw new Error(error.error || 'Failed to bulk create weekly corporation data')
    }

    const result = await response.json()
    return result.data || []
  }
}

export const weeklyCorporationDataClientService = new WeeklyCorporationDataClientService()
