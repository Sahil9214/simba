import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AuthClientService } from '@/lib/services/auth.client.service'
import { showToast } from '@/components/ui/toast'

// Auth mutation hooks using TanStack Query for proper state management

/**
 * Hook for user sign in
 * @returns Mutation object for signing in
 *
 * @example
 * ```tsx
 * const signInMutation = useSignIn()
 *
 * const handleLogin = (credentials: { email: string; password: string }) => {
 *   signInMutation.mutate(credentials, {
 *     onSuccess: () => {
 *       toast.success('Logged in successfully')
 *       router.push('/dashboard')
 *     }
 *   })
 * }
 * ```
 */
export const useSignIn = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      AuthClientService.signIn(credentials),
    onSuccess: (data) => {
      // Clear any cached data from previous sessions
      queryClient.invalidateQueries()
      showToast("success", "Signed in successfully")

      // Get user role from the response
      const userRole = data.user?.user_metadata?.role

      // Redirect based on role
      if (userRole === 'staff') {
        router.push('/staff/profile')  // Redirect staff to seller dashboard
      } else {
        router.push('/dashboard')  // Redirect others to main dashboard
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to sign in'
      showToast("error", message)
    }
  })
}

/**
 * Hook for user sign up
 * @returns Mutation object for signing up
 *
 * @example
 * ```tsx
 * const signUpMutation = useSignUp()
 *
 * const handleSignUp = (credentials: SignUpCredentials) => {
 *   signUpMutation.mutate(credentials, {
 *     onSuccess: () => {
 *       showToast("success", "Account created! Please check your email.")
 *     }
 *   })
 * }
 * ```
 */
export const useSignUp = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: AuthClientService.signUp,
    onSuccess: () => {
      queryClient.invalidateQueries()
      showToast("success", "Account created! Please check your email to verify.")
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create account'
      showToast("error", message)
    }
  })
}

/**
 * Hook for user sign out
 * @returns Mutation object for signing out
 *
 * @example
 * ```tsx
 * const signOutMutation = useSignOut()
 *
 * const handleLogout = () => {
 *   signOutMutation.mutate()
 * }
 * ```
 */
export const useSignOut = () => {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: AuthClientService.signOut,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear()
      showToast("success", "Signed out successfully")
      router.push('/')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to sign out'
      showToast("error", message)
    }
  })
}

/**
 * Hook for password reset request
 * @returns Mutation object for requesting password reset
 *
 * @example
 * ```tsx
 * const resetPasswordMutation = useResetPassword()
 *
 * const handleResetPassword = (email: string) => {
 *   resetPasswordMutation.mutate({ email }, {
 *     onSuccess: () => {
 *       showToast("success", "Password reset email sent!")
 *     }
 *   })
 * }
 * ```
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (credentials: { email: string }) =>
      AuthClientService.resetPassword(credentials),
    onSuccess: () => {
      showToast("success", "Password reset email sent! Check your inbox.")
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to send reset email'
      showToast("error", message)
    }
  })
}

/**
 * Hook for updating user password
 * @returns Mutation object for updating password
 *
 * @example
 * ```tsx
 * const updatePasswordMutation = useUpdatePassword()
 *
 * const handleUpdatePassword = (credentials: UpdatePasswordCredentials) => {
 *   updatePasswordMutation.mutate(credentials, {
 *     onSuccess: () => {
 *       showToast("success", "Password updated successfully!")
 *       router.push('/dashboard')
 *     }
 *   })
 * }
 * ```
 */
export const useUpdatePassword = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: AuthClientService.updatePassword,
    onSuccess: () => {
      showToast("success", "Password updated successfully!")
      router.push('/dashboard')
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update password'
      showToast("error", message)
    }
  })
}

/**
 * Hook for updating user profile
 * @returns Mutation object for updating profile
 *
 * @example
 * ```tsx
 * const updateProfileMutation = useUpdateProfile()
 *
 * const handleUpdateProfile = (updates: UserUpdate) => {
 *   updateProfileMutation.mutate(updates, {
 *     onSuccess: () => {
 *       toast.success('Profile updated successfully!')
 *     }
 *   })
 * }
 * ```
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: AuthClientService.updateProfile,
    onSuccess: () => {
      // Invalidate user profile queries
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      showToast("success", "Profile updated successfully!")
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update profile'
      showToast("error", message)
    }
  })
}
