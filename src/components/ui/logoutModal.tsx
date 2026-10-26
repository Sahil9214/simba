'use client'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
export const LogoutModal = ({
  onClose,
  onLogout,
}: {
  onClose: () => void
  onLogout: () => void
}) => {
  const { user } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white text-gray-900 rounded-xl p-6 w-[90%] max-w-sm shadow-xl font-inter">
        <h2 className="text-lg font-semibold mb-2 text-center">Log out</h2>
        <p className="text-center mb-6 text-sm text-gray-600">
          Are you sure{" "}
          <strong>
            {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
          </strong>{" "}
          want to log out of your account?
        </p>

        <div className="flex gap-3">
          <button
            aria-label="Cancel"
            onClick={onClose}
            type="button"
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            aria-label="Logout"
            onClick={onLogout}
            type="button"
            className="flex-1 cursor-pointer bg-red-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
