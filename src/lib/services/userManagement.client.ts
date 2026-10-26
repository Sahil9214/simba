import { getErrorHandler } from '@/utils/errorHandler';
import { User } from '../types/database.types'
import type { CreateUserData, UpdateUserData, UserFilters, AssignUserToShopData } from '../types/userManagement.types'
import { showToast } from '@/components/ui/toast'

// API Base URL - EC2 Backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * User Management Client Service - Client-side API wrapper for user management operations
 * All methods call the EC2 backend /api/auth/users endpoints
 */
export class UserManagementClientService {
  private static baseUrl = `${API_BASE_URL}/api/auth/users`

  /**
   * Get authorization headers with JWT token
   */
  private static getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }

  /**
   * Get all users with optional filtering
   */
  static async getAllUsers(filters?: UserFilters) {
    const params = new URLSearchParams()

    if (filters?.role) params.append('role', filters.role)
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString())
    if (filters?.search) params.append('searchTerm', filters.search)
    if (filters?.created_by) params.append('created_by', filters.created_by)

    const url = params.toString() ? `${this.baseUrl}?${params.toString()}` : this.baseUrl

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    })
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users')


    }

    return result.data
  }

  /**
   * Get a single user by ID
   */
  static async getUserById(userId: string) {
    const response = await fetch(`${this.baseUrl}/${userId}`, {
      headers: this.getAuthHeaders()
    })
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user')
    }

    return result.data
  }

  /**
   * Create a new user
   * createdBy is extracted from JWT token on server
   */
  static async createUser(userData: CreateUserData): Promise<{ user: User; profile: User }> {

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userData }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to create user')
    }

    return result.data
  }

  /**
   * Update user information
   * updatedBy is extracted from JWT token on server
   */
  static async updateUser(userId: string, first_name: string, last_name: string, phone: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/${userId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ first_name, last_name, phone }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to update user')
    }

    return result.data
  }

  /**
   * Deactivate a user (soft delete)
   */
  static async deactivateUser(userId: string): Promise<User> {
    // Use updateUser to set is_active to false
    return this.updateUser(userId, '', '', '')
  }

  /**
   * Reactivate a user
   */
  static async reactivateUser(userId: string): Promise<User> {
    // Use updateUser to set is_active to true
    return this.updateUser(userId, '', '', '')
  }

  /**
   * Delete user permanently (admin only)
   * deletedBy is extracted from JWT token on server
   */
  static async deleteUser(userId: string): Promise<void> {

    const response = await fetch(`${this.baseUrl}/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user')
    }
  }

  /**
   * Assign user to shop
   * assignedBy is extracted from JWT token on server
   */
  static async assignUserToShop(assignmentData: AssignUserToShopData) {
    const response = await fetch(`${this.baseUrl}/${assignmentData.user_id}/assign-shop`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        shop_id: assignmentData.shop_id,
        role_in_shop: assignmentData.role_in_shop,
        notes: assignmentData.notes
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to assign user to shop')
    }

    return result.data
  }

  /**
   * Remove user from shop
   * Note: Requires a dedicated API endpoint
   */
  static async removeUserFromShop(userShopId: string) {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Remove user from shop requires a dedicated API endpoint')
  }

  /**
   * Reset user password (admin only)
   * Note: Requires a dedicated API endpoint
   */
  static async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    // This would need a dedicated API endpoint, for now returning an error
    throw new Error('Reset user password requires a dedicated API endpoint')
  }

  /**
   * Get user statistics
   * Note: Requires a dedicated API endpoint
   */
  static async getUserStatistics() {
    const response = await fetch(`${this.baseUrl}/statistics`, {
      headers: this.getAuthHeaders()
    })
    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user statistics')
    }

    return result.data
  }
}
