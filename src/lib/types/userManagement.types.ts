/**
 * User Management Type Definitions
 * Shared types for user management operations
 * Safe for both client and server imports
 */

export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'readonly';
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'super_admin' | 'admin' | 'manager' | 'staff' | 'readonly';
  is_active?: boolean;
}

export interface UserFilters {
  role?: string;
  is_active?: boolean | string;
  search?: string;
  created_by?: string;
}

export interface AssignUserToShopData {
  user_id: string;
  shop_id: string;
  role_in_shop: 'owner' | 'manager' | 'assistant' | 'staff';
  notes?: string;
}
