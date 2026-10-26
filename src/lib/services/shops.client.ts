import { Shop, ShopInsert, ShopUpdate } from '@/lib/types/database.types'

/**
 * Shops Client Service - Client-side API wrapper for shop operations
 * All methods call the EC2 backend API endpoints
 */
export class ShopsClientService {
  private static readonly API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000'
  private static baseUrl = `${ShopsClientService.API_BASE_URL}/api/shops`

  /**
   * Get all shops with optional filtering
   */
  static async getShops(filters?: {
    state?: string
    district?: string
    is_active?: boolean
    search?: string
  }): Promise<Shop[]> {
    const params = new URLSearchParams()

    if (filters?.state) params.append('state', filters.state)
    if (filters?.district) params.append('district', filters.district)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('search', filters.search)

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl

    const response = await fetch(url)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch shops')
    }

    return result.data
  }

  /**
   * Get a single shop by ID
   */
  static async getShopById(shopId: string): Promise<Shop> {
    const response = await fetch(`${this.baseUrl}/${shopId}`)
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch shop')
    }

    return result.data
  }

  /**
   * Create a new shop
   */
  static async createShop(shop: ShopInsert): Promise<Shop> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shop),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to create shop')
    }

    return result.data
  }

  /**
   * Update an existing shop
   */
  static async updateShop(shopId: string, updates: ShopUpdate): Promise<Shop> {
    const response = await fetch(`${this.baseUrl}/${shopId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update shop')
    }

    return result.data
  }

  /**
   * Deactivate a shop (soft delete)
   */
  static async deactivateShop(shopId: string): Promise<Shop> {
    const response = await fetch(`${this.baseUrl}/${shopId}`, {
      method: 'DELETE',
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to deactivate shop')
    }

    return result.data
  }

  /**
   * Reactivate a shop
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async reactivateShop(shopId: string): Promise<Shop> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Reactivate shop requires a dedicated API endpoint')
  }

  /**
   * Get shop by DP code
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getShopByDpCode(dpCode: string): Promise<Shop | null> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get shop by DP code requires a dedicated API endpoint')
  }

  /**
   * Get shops by location
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getShopsByLocation(state: string, district?: string): Promise<Shop[]> {
    // Use the main getShops method with location filters
    return this.getShops({ state, district, is_active: true })
  }

  /**
   * Get unique states from shops
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getStates(): Promise<string[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get states requires a dedicated API endpoint')
  }

  /**
   * Get unique districts for a state
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getDistrictsByState(state: string): Promise<string[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get districts by state requires a dedicated API endpoint')
  }

  /**
   * Search shops by name or DP code
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async searchShops(searchTerm: string, limit: number = 10): Promise<Shop[]> {
    // Use the main getShops method with search filter
    return this.getShops({ search: searchTerm })
  }

  /**
   * Get shops with user count
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async getShopsWithUserCount(): Promise<(Shop & { user_count: number })[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Get shops with user count requires a dedicated API endpoint')
  }

  /**
   * Bulk import shops
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async bulkImportShops(shops: ShopInsert[]): Promise<Shop[]> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Bulk import shops requires a dedicated API endpoint')
  }

  /**
   * Upload shop master data from Excel
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static async uploadShopMasterData(
    file: File | string,
    options?: {
      skipValidation?: boolean
      updateExisting?: boolean
      batchSize?: number
    }
  ): Promise<{
    success: boolean
    totalRecords: number
    successCount: number
    errorCount: number
    errors: Array<{ row: number; error: string; data?: any }>
    insertedShops: Shop[]
  }> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Upload shop master data requires a dedicated API endpoint')
  }

  /**
   * Generate shop master template Excel file
   * Note: Uses the server service directly since there's no dedicated API endpoint
   */
  static generateShopMasterTemplate(): Buffer {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Generate shop master template requires a dedicated API endpoint')
  }
}
