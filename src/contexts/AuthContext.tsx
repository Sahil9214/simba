"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthClientService, UserProfile } from '@/lib/services/auth.client.service'
import { UserRole, ROLE_HIERARCHY } from '@/lib/rbac-types'

// User from JWT session
export interface JWTUser {
  id: string
  email: string
  user_metadata: {
    role: UserRole
    first_name: string
    last_name: string
    phone?: string
    is_active: boolean
  }
}

// Session from JWT
export interface JWTSession {
  access_token: string
  token_type: string
  user: JWTUser
}

interface AuthContextType {
  // Auth state
  user: JWTUser | null
  profile: UserProfile | null
  session: JWTSession | null
  loading: boolean

  // Auth actions
  signIn: (credentials: { email: string; password: string }) => Promise<void>
  signUp: (credentials: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>

  // Profile actions
  refreshProfile: () => Promise<void>

  // Permission helpers
  isAdmin: () => Promise<boolean>
  hasRole: (role: UserRole) => Promise<boolean>
  hasRoleLevel: (role: UserRole) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Define public routes that don't require authentication (outside component)
const PUBLIC_ROUTES = ['/', '/staff', '/reset-password', '/forgot-password']

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<JWTUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<JWTSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from JWT token
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get session from JWT token
        const currentSession = await AuthClientService.getSession()

        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user || null)

          if (currentSession?.user) {
            await loadUserProfile()
          }
          // Note: Don't redirect here - let ProtectedRoute handle it
          // This allows public routes to render properly
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          // Note: Don't redirect here - let ProtectedRoute handle it
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes (JWT polling)
    const { data: { subscription } } = AuthClientService.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const wasLoggedIn = !!user // Check if user was previously logged in

      setSession(session)
      setUser(session?.user || null)

      if (session?.user) {
        await loadUserProfile()
      } else {
        setProfile(null)

        // Force logout when token expires or becomes invalid
        // Only redirect if user was previously logged in (not on initial load)
        if ((event === 'TOKEN_EXPIRED' || event === 'SIGNED_OUT') && wasLoggedIn) {

          if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
            window.location.href = '/'
          }
        }
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Load user profile from localStorage (set during login)
  const loadUserProfile = async () => {
    try {
      const userProfile = await AuthClientService.getCurrentUserProfile()
      setProfile(userProfile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      setProfile(null)
    }
  }

  // Auth actions
  const signIn = async (credentials: { email: string; password: string }) => {
    setLoading(true)
    try {
      const result = await AuthClientService.signIn(credentials.email, credentials.password)

      // Update state immediately
      const session = await AuthClientService.getSession()
      setSession(session)
      setUser(session?.user || null)
      // Profile will be loaded from session user data

      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (credentials: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone?: string
  }) => {
    setLoading(true)
    try {
      const result = await AuthClientService.signUp(credentials)

      // Update state immediately
      const session = await AuthClientService.getSession()
      setSession(session)
      setUser(session?.user || null)
      setProfile(result.user)

      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthClientService.signOut()

      // Clear state immediately
      setSession(null)
      setUser(null)
      setProfile(null)

      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    await AuthClientService.resetPassword({ email })
  }

  const refreshProfile = async () => {
    await loadUserProfile()
  }

  // Permission helpers
  const checkIsAdmin = async (): Promise<boolean> => {
    if (!user?.user_metadata?.role) return false
    // Manager now has admin authorities
    return user.user_metadata.role === UserRole.MANAGER || user.user_metadata.role === UserRole.SUPER_ADMIN
  }

  const checkHasRole = async (role: UserRole): Promise<boolean> => {
    if (!user?.user_metadata?.role) return false
    return user.user_metadata.role === role
  }

  const checkHasRoleLevel = async (role: UserRole): Promise<boolean> => {
    if (!user?.user_metadata?.role) return false
    const userLevel = ROLE_HIERARCHY[user.user_metadata.role] || 0
    const requiredLevel = ROLE_HIERARCHY[role] || 0
    return userLevel >= requiredLevel
  }

  const value: AuthContextType = {
    // State
    user,
    profile,
    session,
    loading,

    // Actions
    signIn,
    signUp,
    signOut,
    resetPassword,

    // Profile
    refreshProfile,

    // Permissions
    isAdmin: checkIsAdmin,
    hasRole: checkHasRole,
    hasRoleLevel: checkHasRoleLevel
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for components that require authentication
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => {
    const { user, loading } = useAuth()

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    if (!user) {
      return null // This will be handled by protected route logic
    }

    return <Component {...props} />
  }
}
