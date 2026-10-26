"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCanManageUsers } from '@/hooks/api/useUserManagement'
import { Lock, AlertTriangle } from 'lucide-react'

interface AdminProtectedRouteProps {
  children: React.ReactNode
  requireSuperAdmin?: boolean
  fallbackComponent?: React.ComponentType
}

const DefaultAccessDenied = ({ role, required }: { role?: string; required: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <Lock className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Restricted
        </h2>

        <p className="text-gray-600 mb-6">
          You need <span className="font-medium text-red-600">{required}</span> privileges to access this page.
          {role && (
            <span className="block text-sm text-gray-500 mt-2">
              Current role: <span className="font-medium">{role}</span>
            </span>
          )}
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Contact your system administrator to request the necessary permissions.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
)

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requireSuperAdmin = false,
  fallbackComponent: FallbackComponent = DefaultAccessDenied
}) => {
  const { profile, loading } = useAuth()
  const permissions = useCanManageUsers()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // No authenticated user
  if (!profile) {
    return <FallbackComponent role="Guest" required={requireSuperAdmin ? "Super Admin" : "Manager"} />
  }

  // Check if user has required permissions
  const hasAccess = requireSuperAdmin
    ? permissions.canCreateUsers // Only super_admin can create users
    : permissions.canViewAllUsers // Manager or super_admin can view users

  if (!hasAccess) {
    const roleDisplayNames: Record<string, string> = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'manager': 'Manager',
      'staff': 'Staff',
      'readonly': 'Read Only'
    }

    return (
      <FallbackComponent
        role={roleDisplayNames[profile.role] || profile.role}
        required={requireSuperAdmin ? "Super Admin" : "Manager"}
      />
    )
  }

  // User has access, render the protected content
  return <>{children}</>
}

// Higher-order component for wrapping pages
export const withAdminProtection = <P extends object>(
  Component: React.ComponentType<P>,
  requireSuperAdmin = false
) => {
  return (props: P) => (
    <AdminProtectedRoute requireSuperAdmin={requireSuperAdmin}>
      <Component {...props} />
    </AdminProtectedRoute>
  )
}

export default AdminProtectedRoute
