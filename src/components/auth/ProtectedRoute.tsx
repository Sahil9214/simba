"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/rbac'
import { useTokenValidation } from '@/hooks/auth/useTokenValidation'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: UserRole
  redirectTo?: string
  blockRoles?: UserRole[] // Roles that should be blocked from accessing this route
}

/**
 * ProtectedRoute component for authentication and authorization guards
 *
 * @param children - Child components to render if authorized
 * @param requireAuth - Whether authentication is required (default: true)
 * @param requiredRole - Specific role required for access
 * @param redirectTo - Where to redirect if not authorized (default: '/')
 *
 * @example
 * ```tsx
 * // Protect dashboard routes
 * <ProtectedRoute requireAuth={true}>
 *   <DashboardContent />
 * </ProtectedRoute>
 *
 * // Admin only route
 * <ProtectedRoute requiredRole="admin" redirectTo="/dashboard">
 *   <AdminPanel />
 * </ProtectedRoute>
 *
 * // Public route that redirects authenticated users
 * <ProtectedRoute requireAuth={false} redirectTo="/dashboard">
 *   <LoginForm />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/',
  blockRoles = [] // Default to empty array
}) => {
  const { user, profile, loading, hasRoleLevel } = useAuth()
  const router = useRouter()
  const [roleChecking, setRoleChecking] = useState(false)
  const [hasAccess, setHasAccess] = useState(true)

  // Add token validation to ensure user is logged out if token becomes invalid
  useTokenValidation({
    checkInterval: 10000, // Check every 10 seconds
    enabled: requireAuth // Only validate if auth is required
  })

  useEffect(() => {
    if (loading) return // Wait for auth state to load

    const checkAccess = async () => {
      // Handle authentication requirement
      if (requireAuth && !user) {
        router.push(redirectTo)
        return
      }

      // Check if user role is blocked
      if (user && blockRoles.length > 0) {
        const userRole = user?.user_metadata?.role
        if (userRole && blockRoles.includes(userRole as UserRole)) {
          setHasAccess(false)
          // Redirect staff to their own dashboard
          if (userRole === 'staff') {
            router.push('/staff/profile')
          } else {
            router.push(redirectTo)
          }
          return
        }
      }

      // Handle reverse auth (e.g., login page should redirect if already authenticated)
      if (!requireAuth && user) {
        // Get user role and redirect to appropriate dashboard
        const userRole = user?.user_metadata?.role
        let destination = '/dashboard' // Default for admin, manager, etc.
        if (userRole === 'staff') {
          destination = '/staff/profile' // Staff users go to staff dashboard
        }

        router.push(redirectTo === '/' ? destination : redirectTo)
        return
      }

      // Handle role-based access
      if (requiredRole && profile) {
        setRoleChecking(true)
        try {
          const hasRequiredAccess = await hasRoleLevel(requiredRole);
          // console.log('hasRequiredAccess', hasRequiredAccess);
          // console.log('requiredRole', requiredRole);
          // console.log('profile', profile);
          if (!hasRequiredAccess) {
            setHasAccess(false)

            // Redirect based on user role
            const userRole = user?.user_metadata?.role
            if (userRole === 'staff') {
              router.push('/staff/profile') // Staff users go to their own dashboard
            } else {
              router.push('/dashboard') // Others go to main dashboard
            }
            return
          }
        } catch (error) {
          console.error('Error checking role access:', error)
          setHasAccess(false)

          // Redirect based on user role on error
          const userRole = user?.user_metadata?.role
          if (userRole === 'staff') {
            router.push('/staff/profile')
          } else {
            router.push('/dashboard')
          }
          return
        } finally {
          setRoleChecking(false)
        }
      }

      setHasAccess(true)
    }

    checkAccess()
  }, [user, profile, loading, requireAuth, requiredRole, redirectTo, router, hasRoleLevel, blockRoles])

  // Show loading spinner while checking authentication or roles
  if (loading || roleChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tertiary-color">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4250]"></div>
          <p className="text-sm text-gray-600 font-inter">
            {loading ? 'Loading...' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (requireAuth && !user) return null
  if (!requireAuth && user) return null
  if (!hasAccess) return null

  return <>{children}</>
}

/**
 * Higher-order component version of ProtectedRoute
 *
 * @example
 * ```tsx
 * const ProtectedDashboard = withProtectedRoute(Dashboard, {
 *   requireAuth: true
 * })
 *
 * const AdminOnlyComponent = withProtectedRoute(AdminPanel, {
 *   requiredRole: 'admin'
 * })
 * ```
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  )
}

/**
 * Loading component for authentication states
 */
export const AuthLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-tertiary-color">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4250]"></div>
      <p className="text-sm text-gray-600 font-inter">Authenticating...</p>
    </div>
  </div>
)
