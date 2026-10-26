'use client';

import { useEffect, useCallback } from 'react';
import { AuthClientService } from '@/lib/services/auth.client.service';
import { useRouter } from 'next/navigation';






// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/staff', '/reset-password', '/forgot-password', '/login'];

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
};

/**
 * Hook to validate token and force logout if invalid
 * This hook runs on component mount and periodically checks token validity
 */
export function useTokenValidation(options?: {
  checkInterval?: number; // in milliseconds
  enabled?: boolean;
}) {
  const router = useRouter();
  const { checkInterval = 10000, enabled = true } = options || {};

  const validateToken = useCallback(async () => {
    try {
      const session = await AuthClientService.getSession();

      if (!session) {
        console.log('🔒 useTokenValidation: No valid session - Forcing logout');

        // Clear session
        AuthClientService.clearSession();

        // Redirect to login only if not on public route
        if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
          // Check user role from localStorage to determine correct login page
          const userData = localStorage.getItem("auth_user");
          let loginPath = '/'; // Default to admin login

          if (userData) {
            try {
              const user = JSON.parse(userData);
              const role = user?.user_metadata?.role;
              if (role === 'staff') {
                loginPath = '/staff';
              }
            } catch (error) {
              console.warn('Failed to parse user data from localStorage:', error);
              // Fall back to admin login
            }
          }

          window.location.href = loginPath;
        }

        return false;
      }

      return true;
    } catch (error) {
      console.error('🔒 useTokenValidation: Error validating token:', error);

      // Clear session on error
      AuthClientService.clearSession();

      // Redirect to login only if not on public route
      if (typeof window !== 'undefined' && !isPublicRoute(window.location.pathname)) {
        // Check user role from localStorage to determine correct login page
        // window.location.href='/' original one 
        const userData = localStorage.getItem("auth_user");
        let loginPath = '/'; // Default to admin login

        if (userData) {
          try {
            const user = JSON.parse(userData);
            const role = user?.user_metadata?.role;
            if (role === 'staff') {
              loginPath = '/staff';
            }
          } catch (error) {
            console.warn('Failed to parse user data from localStorage:', error);
            // Fall back to admin login
          }
        }

        window.location.href = loginPath;
      }

      return false;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial validation
    validateToken();

    // Set up periodic validation
    const intervalId = setInterval(() => {
      validateToken();
    }, checkInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, checkInterval, validateToken]);

  return { validateToken };
}

/**
 * Hook to force logout
 * Provides a function to manually force logout
 */
export function useForceLogout() {
  const forceLogout = useCallback(() => {
    console.log('🔒 Force logout triggered');

    // Clear session
    AuthClientService.clearSession();

    // Redirect to login
    if (typeof window !== 'undefined') {
      // Check user role from localStorage to determine correct login page
      const userData = localStorage.getItem("auth_user");
      let loginPath = '/'; // Default to admin login

      if (userData) {
        try {
          const user = JSON.parse(userData);
          const role = user?.user_metadata?.role;
          if (role === 'staff') {
            loginPath = '/staff';
          }
        } catch (error) {
          console.warn('Failed to parse user data from localStorage:', error);
          // Fall back to admin login
        }
      }

      window.location.href = loginPath;
    }
  }, []);

  return { forceLogout };
}

