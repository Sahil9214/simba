// src/components/auth/InsufficientPermission.tsx
"use client"

import React from 'react'
import { Lock, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface InsufficientPermissionProps {
  requiredRole?: string
  currentRole?: string
  feature?: string
  showBackButton?: boolean
}

export const InsufficientPermission: React.FC<InsufficientPermissionProps> = ({
  requiredRole = "Manager or Super Admin",
  currentRole,
  feature = "this feature",
  showBackButton = true
}) => {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Insufficient Permissions
          </h2>

          <p className="text-gray-600 mb-6">
            You need <span className="font-medium text-red-600">{requiredRole}</span> privileges to access {feature}.
            {currentRole && (
              <span className="block text-sm text-gray-500 mt-2">
                Current role: <span className="font-medium">{currentRole}</span>
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

          <div className="flex gap-3">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </button>
            )}
            <button
              onClick={handleGoToDashboard}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InsufficientPermission
