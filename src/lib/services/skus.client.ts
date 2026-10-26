import { SKU, SKUInsert, SKUUpdate } from '@/lib/types/database.types'

/**
 * SKUs Client Service - Client-side API wrapper for SKU operations
 * All methods call the EC2 backend API endpoints
 */
export class SKUsClientService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000'
  private static baseUrl = `${SKUsClientService.API_BASE_URL}/api/skus`

  /**
   * Get all SKUs with optional filtering
   */
  static async getSKUs(filters?: {
    brand_name?: string
    category?: string
    size_ml?: number
    is_active?: boolean
    search?: string
    min_mrp?: number
    max_mrp?: number
  }): Promise<SKU[]> {
    const params = new URLSearchParams()

    if (filters?.brand_name) params.append('brand_name', filters.brand_name)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.size_ml) params.append('size_ml', filters.size_ml.toString())
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('search', filters.search)
    if (filters?.min_mrp !== undefined) params.append('min_mrp', filters.min_mrp.toString())
    if (filters?.max_mrp !== undefined) params.append('max_mrp', filters.max_mrp.toString())

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl

    const response = await fetch(url)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch SKUs')
    }

    return result.data
  }

  /**
   * Get a single SKU by ID
   */
  static async getSKUById(skuId: string): Promise<SKU> {
    const response = await fetch(`${this.baseUrl}/${skuId}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch SKU')
    }

    return result.data
  }

  /**
   * Create a new SKU
   */
  static async createSKU(sku: SKUInsert): Promise<SKU> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sku),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to create SKU')
    }

    return result.data
  }

  /**
   * Update an existing SKU
   */
  static async updateSKU(skuId: string, updates: SKUUpdate): Promise<SKU> {
    const response = await fetch(`${this.baseUrl}/${skuId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update SKU')
    }

    return result.data
  }

  /**
   * Deactivate a SKU (soft delete)
   */
  static async deactivateSKU(skuId: string): Promise<SKU> {
    const response = await fetch(`${this.baseUrl}/${skuId}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to deactivate SKU')
    }

    return result.data
  }

  /**
   * Reactivate a SKU
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async reactivateSKU(skuId: string): Promise<SKU> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Reactivate SKU requires a dedicated API endpoint')
  }

  /**
   * Get SKU by brand code
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSKUByBrandCode(brandCode: string): Promise<SKU | null> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get SKU by brand code requires a dedicated API endpoint')
  }

  /**
   * Get unique brands from SKUs
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getBrands(): Promise<string[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get brands requires a dedicated API endpoint')
  }

  /**
   * Get unique categories from SKUs
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getCategories(): Promise<string[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get categories requires a dedicated API endpoint')
  }

  /**
   * Get unique sizes from SKUs
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSizes(): Promise<number[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get sizes requires a dedicated API endpoint')
  }

  /**
   * Get SKUs by brand
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSKUsByBrand(brandName: string): Promise<SKU[]> {
    // Use the main getSKUs method with brand filter
    return this.getSKUs({ brand_name: brandName, is_active: true })
  }

  /**
   * Get SKUs by category
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSKUsByCategory(category: string): Promise<SKU[]> {
    // Use the main getSKUs method with category filter
    return this.getSKUs({ category, is_active: true })
  }

  /**
   * Get SKUs by size
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSKUsBySize(sizeML: number): Promise<SKU[]> {
    // Use the main getSKUs method with size filter
    return this.getSKUs({ size_ml: sizeML, is_active: true })
  }

  /**
   * Search SKUs by name, brand, or brand code
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async searchSKUs(searchTerm: string, limit: number = 10): Promise<SKU[]> {
    // Use the main getSKUs method with search filter
    return this.getSKUs({ search: searchTerm })
  }

  /**
   * Get SKUs with stock levels
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getSKUsWithStock(filters?: {
    shop_id?: string
    date?: string
  }): Promise<(SKU & { total_stock: number; last_updated: string })[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get SKUs with stock requires a dedicated API endpoint')
  }

  /**
   * Get price range for SKUs
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getPriceRange(filters?: {
    brand_name?: string
    category?: string
  }): Promise<{ min_price: number; max_price: number }> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get price range requires a dedicated API endpoint')
  }

  /**
   * Bulk import SKUs
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async bulkImportSKUs(skus: SKUInsert[]): Promise<SKU[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Bulk import SKUs requires a dedicated API endpoint')
  }

  /**
   * Get top-selling SKUs based on daily stocks data
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getTopSellingSKUs(
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string
  ): Promise<(SKU & { total_sales: number })[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get top-selling SKUs requires a dedicated API endpoint')
  }
}
