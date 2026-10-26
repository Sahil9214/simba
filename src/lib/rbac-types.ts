/**
 * RBAC Type Definitions
 * Safe to import in client components - no server dependencies
 */

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
  [UserRole.READONLY]: 1,
  [UserRole.STAFF]: 2,
  [UserRole.MANAGER]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5
}

// Permission check helpers (client-safe, work with user object)
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0
  return userLevel >= requiredLevel
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.MANAGER || userRole === UserRole.SUPER_ADMIN
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN
}
