import { DailyStock, DailyStockInsert, DailyStockUpdate } from '@/lib/types/database.types'
import { getDateDaysAgo } from '@/lib/utils'

/**
 * Client-side Daily Stocks Service
 * Makes HTTP requests to EC2 backend API endpoints
 */
export class DailyStocksClientService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000'
  private static baseUrl = `${DailyStocksClientService.API_BASE_URL}/api/stocks/daily`

  /**
   * Build query string from filters
   */
  private static buildQueryString(filters?: {
    shop_id?: string
    sku_id?: string
    report_date?: string
    date_from?: string
    date_to?: string
    reported_by?: string
    has_breakage?: boolean
  }): string {
    if (!filters) return ''

    const params = new URLSearchParams()

    if (filters.shop_id) params.append('shop_id', filters.shop_id)
    if (filters.sku_id) params.append('sku_id', filters.sku_id)
    if (filters.report_date) params.append('report_date', filters.report_date)
    if (filters.date_from) params.append('date_from', filters.date_from)
    if (filters.date_to) params.append('date_to', filters.date_to)
    if (filters.reported_by) params.append('reported_by', filters.reported_by)
    if (filters.has_breakage !== undefined) params.append('has_breakage', String(filters.has_breakage))

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ''
  }

  /**
   * Get daily stocks with optional filtering
   */
  static async getDailyStocks(filters?: {
    shop_id?: string
    sku_id?: string
    report_date?: string
    date_from?: string
    date_to?: string
    reported_by?: string
    has_breakage?: boolean
  }): Promise<DailyStock[]> {
    const queryString = this.buildQueryString(filters)
    const response = await fetch(`${this.baseUrl}${queryString}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch stocks' }))
      throw new Error(error.error || 'Failed to fetch daily stocks')
    }

    return response.json()
  }

  /**
   * Get a single daily stock record by ID
   */
  static async getDailyStockById(stockId: string): Promise<DailyStock> {
    const response = await fetch(`${this.baseUrl}/${stockId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch stock' }))
      throw new Error(error.error || 'Failed to fetch daily stock')
    }

    return response.json()
  }

  /**
   * Get latest stock for a specific shop and SKU
   */
  static async getLatestStock(shopId: string, skuId: string): Promise<DailyStock | null> {
    const stocks = await this.getDailyStocks({
      shop_id: shopId,
      sku_id: skuId,
    })

    // Return the first result (most recent due to ORDER BY report_date DESC)
    return stocks.length > 0 ? stocks[0] : null
  }

  /**
   * Get daily stocks for a specific date
   */
  static async getStocksByDate(date: string, shopId?: string): Promise<DailyStock[]> {
    return this.getDailyStocks({
      report_date: date,
      shop_id: shopId,
    })
  }

  /**
   * Get stocks by shop for a date range
   */
  static async getStocksByShop(
    shopId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<DailyStock[]> {
    return this.getDailyStocks({
      shop_id: shopId,
      date_from: dateFrom,
      date_to: dateTo,
    })
  }

  /**
   * Get stocks by SKU across all shops
   */
  static async getStocksBySKU(
    skuId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<DailyStock[]> {
    return this.getDailyStocks({
      sku_id: skuId,
      date_from: dateFrom,
      date_to: dateTo,
    })
  }

  /**
   * Create a new daily stock record
   */
  static async createDailyStock(stock: DailyStockInsert): Promise<DailyStock> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stock),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create stock' }))
      throw new Error(error.error || 'Failed to create daily stock')
    }

    return response.json()
  }

  /**
   * Update an existing daily stock record
   */
  static async updateDailyStock(stockId: string, updates: DailyStockUpdate): Promise<DailyStock> {
    const response = await fetch(`${this.baseUrl}/${stockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update stock' }))
      throw new Error(error.error || 'Failed to update daily stock')
    }

    return response.json()
  }

  /**
   * Delete a daily stock record
   */
  static async deleteDailyStock(stockId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${stockId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete stock' }))
      throw new Error(error.error || 'Failed to delete daily stock')
    }
  }

  /**
   * Get stock summary for a date range
   */
  static async getStockSummary(filters?: {
    date_from?: string
    date_to?: string
    shop_id?: string
    sku_id?: string
  }): Promise<{
    total_stock: number
    total_breakage: number
    unique_shops: number
    unique_skus: number
    records_count: number
  }> {
    const params = new URLSearchParams()
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.shop_id) params.append('shop_id', filters.shop_id)
    if (filters?.sku_id) params.append('sku_id', filters.sku_id)

    const queryString = params.toString()
    const response = await fetch(`${this.baseUrl}/summary${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch summary' }))
      throw new Error(error.error || 'Failed to fetch stock summary')
    }

    return response.json()
  }

  /**
   * Get breakage analysis
   */
  static async getBreakageAnalysis(filters?: {
    date_from?: string
    date_to?: string
    shop_id?: string
    min_breakage?: number
  }): Promise<DailyStock[]> {
    return this.getDailyStocks({
      ...filters,
      has_breakage: true,
    })
  }

  /**
   * Get stock trends for a shop/SKU combination
   */
  static async getStockTrends(
    shopId: string,
    skuId: string,
    days: number = 30
  ): Promise<DailyStock[]> {
    const dateFromStr = getDateDaysAgo(days)

    return this.getDailyStocks({
      shop_id: shopId,
      sku_id: skuId,
      date_from: dateFromStr,
    })
  }

  /**
   * Bulk insert daily stocks
   */
  static async bulkCreateDailyStocks(stocks: DailyStockInsert[]): Promise<DailyStock[]> {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stocks),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to bulk create' }))
      throw new Error(error.error || 'Failed to bulk create daily stocks')
    }

    const result = await response.json()
    return result.stocks || []
  }

  /**
   * Get missing reports (not implemented in API yet)
   */
  static async getMissingReports(
    date: string,
    expectedShopIds: string[],
    expectedSKUIds: string[]
  ): Promise<Array<{
    shop_id: string
    sku_id: string
    shop_name: string
    sku_name: string
  }>> {
    // This would require a dedicated API endpoint
    console.warn('getMissingReports not yet implemented in client service')
    return []
  }

  /**
   * Get reporting compliance (not implemented in API yet)
   */
  static async getReportingCompliance(
    dateFrom: string,
    dateTo: string
  ): Promise<Array<{
    shop_id: string
    shop_name: string
    total_expected: number
    total_reported: number
    compliance_rate: number
  }>> {
    // This would require a dedicated API endpoint
    console.warn('getReportingCompliance not yet implemented in client service')
    return []
  }
}
