import React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserManagementClientService } from '@/lib/services/userManagement.client'
import { CreateUserData, UpdateUserData, UserFilters, AssignUserToShopData } from '@/lib/types/userManagement.types'
import { useAuth } from '@/contexts/AuthContext'
import { showToast } from '@/components/ui/toast';
import { axiosInstance } from '@/lib/axios'
import { apiEndPoints } from '@/lib/axios/axios.endpoint'




//! create  by utkarsh
async function deleteUser(userId: string) {
  const response = await axiosInstance.delete(apiEndPoints.userMapping.deleteUser(userId));
  return response.data
}


export function useDeleteUser() {
  const queryClient = useQueryClient()
  return (
    useMutation({
      mutationKey: ["delete-user"],
      mutationFn: (userId: string) => deleteUser(userId),
      onSuccess: () => {
        // Invalidate user lists to reflect changes
        queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
        queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })

        showToast("success", "User deleted successfully")
      },
      onError: (error: any) => {
        console.error('Error deleting user:', error)
        showToast("error", `Failed to delete user: ${error?.response?.data?.error || error.message || error.response.data.message}`)
      },
    })
  )
}
//!toggle user status

async function toggleUserStatus(userId: string, is_active: boolean) {
  const response = await axiosInstance.patch(
    apiEndPoints.userMapping.updateUserToggleStatus(userId),
    { is_active }
  );
  return response.data
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient()
  return (
    useMutation({
      mutationKey: ["toggle-user-status"],
      mutationFn: ({ userId, is_active }: { userId: string, is_active: boolean }) => toggleUserStatus(userId, is_active),
      onSuccess: () => {
        // Invalidate user lists to reflect changes
        queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
        queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })

        // showToast("success", "")
      },
      onError: (error) => {
        console.error('Error deleting user:', error)
        showToast("error", `Failed to delete user: ${error.message}`)
      },
    })
  )
}

//! patch request of full data of user

export const useUpdateData = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-user-data'],
    mutationFn: ({ userId, first_name, last_name, phone }: { userId: string; first_name: string; last_name: string; phone: string }) => {
      return UserManagementClientService.updateUser(userId, first_name, last_name, phone)
    },
    onSuccess: (data, variables) => {
      showToast("success", `User updated successfully`);
      // Invalidate both detail and lists to ensure UI updates immediately
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.detail(variables.userId) })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })
    },
    onError: (error) => {
      console.error('Error updating user:', error)
      showToast("error", `Failed to update user: ${error.message}`)
    },
  })
}


//yaha pe mene bana liya hai


// Query Keys
export const USER_MANAGEMENT_KEYS = {
  all: ['user-management'] as const,
  lists: () => [...USER_MANAGEMENT_KEYS.all, 'list'] as const,
  list: (filters: UserFilters) => [...USER_MANAGEMENT_KEYS.lists(), filters] as const,
  details: () => [...USER_MANAGEMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_MANAGEMENT_KEYS.details(), id] as const,
  statistics: () => [...USER_MANAGEMENT_KEYS.all, 'statistics'] as const,
}

// ===== QUERY HOOKS =====

/**
 * Hook to fetch all users with optional filtering
 */
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: USER_MANAGEMENT_KEYS.list(filters || {}),
    queryFn: () => UserManagementClientService.getAllUsers(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: USER_MANAGEMENT_KEYS.detail(userId),
    queryFn: () => UserManagementClientService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch user statistics
 */
export function useUserStatistics() {
  return useQuery({
    queryKey: USER_MANAGEMENT_KEYS.statistics(),
    queryFn: () => UserManagementClientService.getUserStatistics(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// ===== MUTATION HOOKS =====

/**
 * Hook to create a new user (superadmin only)
 * createdBy is extracted from JWT token on server
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: CreateUserData) => {
      return UserManagementClientService.createUser(userData)
    },
    onSuccess: (data) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })


    },
    onError: (error) => {
      console.error('Error creating user:', error)
      showToast("error", `Failed to create user: ${error.message}`)
    },
  })
}

/**
 * Hook to update user information (superadmin/admin only)
 * updatedBy is extracted from JWT token on server
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['update-user-data'],
    mutationFn: ({ userId, first_name, last_name, phone }: { userId: string; first_name: string; last_name: string; phone: string }) => {
      return UserManagementClientService.updateUser(userId, first_name, last_name, phone)
    },
    onSuccess: () => {
      showToast("success", `User updated successfully`)
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })
    },
    onError: (error) => {
      console.error('Error updating user:', error)
      showToast("error", `Failed to update user: ${error.message}`)
    },
  })
}

/**
 * Hook to deactivate a user (soft delete)
 */
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => {
      return UserManagementClientService.deactivateUser(userId)
    },
    onSuccess: (data) => {
      // Update the specific user in the cache
      queryClient.setQueryData(USER_MANAGEMENT_KEYS.detail(data.id), data)

      // Invalidate user lists to reflect changes
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })

      showToast("success", `User "${data.first_name} ${data.last_name}" has been deactivated`)
    },
    onError: (error) => {
      console.error('Error deactivating user:', error)
      showToast("error", `Failed to deactivate user: ${error.message}`)
    },
  })
}

/**
 * Hook to reactivate a user
 */
export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => {
      return UserManagementClientService.reactivateUser(userId)
    },
    onSuccess: (data) => {
      // Update the specific user in the cache
      queryClient.setQueryData(USER_MANAGEMENT_KEYS.detail(data.id), data)

      // Invalidate user lists to reflect changes
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.statistics() })

      showToast("success", `User "${data.first_name} ${data.last_name}" has been reactivated`)
    },
    onError: (error) => {
      console.error('Error reactivating user:', error)
      showToast("error", `Failed to reactivate user: ${error.message}`)
    },
  })
}

/**
 * Hook to permanently delete a user (superadmin only)
 */


/**
 * Hook to assign a user to a shop
 */
export function useAssignUserToShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (assignmentData: AssignUserToShopData) => {
      return UserManagementClientService.assignUserToShop(assignmentData)
    },
    onSuccess: (data) => {
      // Invalidate user lists to show updated shop assignments
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })

      // Also invalidate the specific user to show new shop assignment
      if (data && typeof data === 'object' && 'user_id' in data) {
        const userData = data as any;
        if (userData.user_id) {
          queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.detail(userData.user_id) })
        }
      }

      showToast("success", `User assigned to shop successfully`)
    },
    onError: (error) => {
      console.error('Error assigning user to shop:', error)
      showToast("error", `Failed to assign user to shop: ${error.message}`)
    },
  })
}

/**
 * Hook to remove a user from a shop
 */
export function useRemoveUserFromShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userShopId: string) => {
      return UserManagementClientService.removeUserFromShop(userShopId)
    },
    onSuccess: () => {
      // Invalidate user lists to show updated shop assignments
      queryClient.invalidateQueries({ queryKey: USER_MANAGEMENT_KEYS.lists() })

      showToast("success", `User removed from shop successfully`)
    },
    onError: (error) => {
      console.error('Error removing user from shop:', error)
      showToast("error", `Failed to remove user from shop: ${error.message}`)
    },
  })
}

/**
 * Hook to reset a user's password (admin only)
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ userId, newPassword, userEmail }: {
      userId: string;
      newPassword: string;
      userEmail: string;
    }) => {
      return UserManagementClientService.resetUserPassword(userId, newPassword).then(() => userEmail)
    },
    onSuccess: (userEmail) => {
      showToast("success", `Password reset successfully for ${userEmail}`)
    },
    onError: (error) => {
      console.error('Error resetting password:', error)
      showToast("error", `Failed to reset password: ${error.message}`)
    },
  })
}

// ===== UTILITY HOOKS =====

/**
 * Hook to check if current user can perform admin actions
 * Manager now has admin authorities
 */
export function useCanManageUsers() {
  const { user } = useAuth();

  const isManagerRole = user?.user_metadata.role === 'manager' || user?.user_metadata.role === 'super_admin'
  return {
    canCreateUsers: user?.user_metadata.role === 'super_admin',
    canUpdateUsers: isManagerRole,
    canDeleteUsers: user?.user_metadata.role === 'super_admin',
    canAssignToShops: isManagerRole,
    canResetPasswords: isManagerRole,
    canViewAllUsers: isManagerRole,
  }
}

/**
 * Hook to filter users based on current user's permissions
 */
export function useFilteredUsers(filters?: UserFilters) {
  const { profile } = useAuth()
  const permissions = useCanManageUsers()

  // Modify filters based on permissions
  const effectiveFilters = React.useMemo(() => {
    if (!permissions.canViewAllUsers) {
      // Non-admin users can only see users they created
      return {
        ...filters,
        created_by: profile?.id
      }
    }
    return filters
  }, [filters, permissions.canViewAllUsers, profile?.id])

  return useUsers(effectiveFilters)
}

const userManagementHooks = {
  useUsers,
  useUser,
  useUserStatistics,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
  useReactivateUser,
  useDeleteUser,
  useAssignUserToShop,
  useRemoveUserFromShop,
  useResetUserPassword,
  useCanManageUsers,
  useFilteredUsers,
}

export default userManagementHooks

//add comment here