import { AuthClientService } from './services/auth.client.service'

// User roles enum
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  READONLY = 'readonly'
}

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.READONLY]: 0,
  [UserRole.STAFF]: 1,
  [UserRole.MANAGER]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SUPER_ADMIN]: 4
}

/**
 * Get current authenticated user with role information from JWT
 */
export async function getCurrentUserWithRole(): Promise<{
  user: any | null
  role: UserRole
  isAuthenticated: boolean
}> {
  try {
    const user = await AuthClientService.getCurrentUserProfile()

    if (!user) {
      return { user: null, role: UserRole.READONLY, isAuthenticated: false }
    }

    const role = (user.role as UserRole) || UserRole.STAFF

    return { user, role, isAuthenticated: true }
  } catch (error) {
    console.error('Error getting current user with role:', error)
    return { user: null, role: UserRole.READONLY, isAuthenticated: false }
  }
}

/**
 * Check if current user has at least the specified role level
 */
export async function hasRoleLevel(requiredRole: UserRole): Promise<boolean> {
  const { role, isAuthenticated } = await getCurrentUserWithRole()

  if (!isAuthenticated) return false

  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Check if current user has specific role
 */
export async function hasRole(targetRole: UserRole): Promise<boolean> {
  const { role, isAuthenticated } = await getCurrentUserWithRole()
  return isAuthenticated && role === targetRole
}

/**
 * Check if current user is admin (manager or super_admin)
 * Manager now has admin authorities
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRoleLevel(UserRole.MANAGER)
}

/**
 * Check if current user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return await hasRole(UserRole.SUPER_ADMIN)
}

/**
 * Get user profile information from JWT user object
 */
export function getUserProfile(user: any) {
  return {
    id: user.id,
    email: user.email,
    role: (user.role as UserRole) || UserRole.STAFF,
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    phone: user.phone || '',
    emailVerified: user.emailVerified || user.email_verified || false,
    lastSignIn: user.lastLoginAt || user.last_login_at || user.last_sign_in_at || null,
    createdAt: user.createdAt || user.created_at || new Date().toISOString()
  }
}

/**
 * Update user role (admin only)
 * This is a client-side wrapper - actual implementation uses API endpoint
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  // Check if current user is admin
  if (!(await isAdmin())) {
    throw new Error('Insufficient permissions to update user roles')
  }

  // Get current user for audit trail
  const { user } = await getCurrentUserWithRole()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Call API endpoint to update role (calls EC2 backend)
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
  const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify({ role: newRole })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update user role')
  }
}

/**
 * Create RLS policy helper for SQL (for PostgreSQL RDS)
 * Note: With JWT-based auth, RBAC is enforced at application layer via middleware
 * This function is kept for reference but not used in production
 */
export function createRoleBasedPolicy(tableName: string, operation: string, allowedRoles: UserRole[]): string {
  const rolesList = allowedRoles.map(role => `'${role}'`).join(', ')

  // In JWT-based auth, RLS policies are not used - RBAC is enforced via API middleware
  // This generates a permissive policy for reference only
  return `
    -- NOTE: This policy is not used with JWT auth - RBAC is enforced at application layer
    CREATE POLICY "${operation}_${tableName}_by_role" ON ${tableName}
      FOR ${operation.toUpperCase()}
      USING (TRUE)
      WITH CHECK (TRUE);
  `
}

/**
 * React hook for RBAC
 */
export function useRBAC() {
  return {
    getCurrentUserWithRole,
    hasRoleLevel,
    hasRole,
    isAdmin,
    isSuperAdmin,
    getUserProfile
  }
}
