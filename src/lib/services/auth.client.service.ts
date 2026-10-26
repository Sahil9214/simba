/**
 * Client-side Auth Service
 * Safe to import in client components - no server-side dependencies
 */

import { UserRole } from "../rbac";
import { deleteCookie, setCookie } from "cookies-next";
import type { SerializeOptions } from "cookie";

/**
 * Simple JWT decoder for client-side use (no verification, just decoding)
 * Replaces jsonwebtoken library which is backend-only
 */
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  emailVerified: boolean;
  lastSignIn: string | null;
  createdAt: string;
}

export interface JWTUser {
  id: string;
  email: string;
  user_metadata: {
    role: UserRole;
    first_name: string;
    last_name: string;
    phone?: string;
    is_active: boolean;
  };
}

export interface JWTSession {
  access_token: string;
  token_type: string;
  user: JWTUser;
}

/**
 * Client-side AuthService
 * Only includes methods safe for client-side use (localStorage, JWT parsing)
 */
export class AuthClientService {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "auth_user";
  private static authStateListeners: Array<
    (event: string, session: JWTSession | null) => void
  > = [];
  private static readonly COOKIE_BASE_OPTIONS: SerializeOptions = {
    path: "/",
    sameSite: "lax",
  };

  // Public routes that don't require authentication
  private static readonly PUBLIC_ROUTES = ['/', '/staff', '/reset-password', '/forgot-password', '/login'];

  private static isPublicRoute(pathname: string): boolean {
    return AuthClientService.PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
  }

  /**
   * Get current session from localStorage
   */
  static async getSession(): Promise<JWTSession | null> {
    if (typeof window === "undefined") return null;

    try {
      const token = localStorage.getItem(AuthClientService.TOKEN_KEY);
      const userJson = localStorage.getItem(AuthClientService.USER_KEY);

      if (!token || !userJson) {
        // console.log("🔒 No token or user data found in localStorage");
        // Don't redirect from public routes - let ProtectedRoute handle it
        // This allows public routes to render properly
        return null;
      }

      // Check if cookies exist - if localStorage has token but cookies don't,
      // it means browser was closed and cookies expired (session cookies)
      const cookieToken = AuthClientService.getCookieValue(AuthClientService.TOKEN_KEY);
      if (!cookieToken) {
        // Cookies missing but localStorage has token - clear everything
        // console.log("🔒 Cookie missing but localStorage has token - clearing session");
        AuthClientService.clearSession();
        // Don't redirect from public routes - let ProtectedRoute handle it
        return null;
      }

      // Decode token without verifying (client-side can't securely verify anyway)
      // Just check if it's expired
      try {
        const decoded = decodeJWT(token);

        if (!decoded || !decoded.exp) {
          // Invalid token format
          // console.log("🔒 Invalid token format - clearing session");
          AuthClientService.clearSession();
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/';
          }
          return null;
        }

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTime) {
          // Token expired
          // console.log("🔒 Token expired - clearing session");
          AuthClientService.clearSession();
          if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/';
          }
          return null;
        }

        const user: JWTUser = JSON.parse(userJson);

        return {
          access_token: token,
          token_type: "Bearer",
          user,
        };
      } catch (decodeError) {
        // Token invalid, clear storage
        // console.log("🔒 Token decode failed:", decodeError);
        AuthClientService.clearSession();
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/';
        }
        return null;
      }
    } catch (error) {
      console.error("🔒 Error getting session:", error);
      AuthClientService.clearSession();
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/';
      }
      return null;
    }
  }

  /**
   * Helper to get cookie value by name
   */
  private static getCookieValue(name: string): string | null {
    if (typeof window === "undefined") return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  /**
   * Set session in localStorage
   */
  static setSession(token: string, user: JWTUser): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(AuthClientService.TOKEN_KEY, token);
    localStorage.setItem(AuthClientService.USER_KEY, JSON.stringify(user));

    // Set cookies with proper options
    const cookieOptions = AuthClientService.buildCookieOptions(token);
    setCookie(AuthClientService.TOKEN_KEY, token, cookieOptions);
    setCookie(AuthClientService.USER_KEY, JSON.stringify(user), cookieOptions);

    // Notify listeners
    AuthClientService.notifyAuthStateChange("SIGNED_IN", {
      access_token: token,
      token_type: "Bearer",
      user,
    });
  }

  private static buildCookieOptions(token: string): SerializeOptions {
    const options: SerializeOptions = {
      ...AuthClientService.COOKIE_BASE_OPTIONS,
    };

    const decoded = decodeJWT(token);
    if (decoded?.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      const maxAge = decoded.exp - currentTime;
      if (maxAge > 0) {
        options.maxAge = maxAge;
      }
    }

    return options;
  }

  /**
   * Clear session from localStorage
   */
  static clearSession(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(AuthClientService.TOKEN_KEY);
    localStorage.removeItem(AuthClientService.USER_KEY);
    deleteCookie(
      AuthClientService.TOKEN_KEY,
      AuthClientService.COOKIE_BASE_OPTIONS
    );
    deleteCookie(
      AuthClientService.USER_KEY,
      AuthClientService.COOKIE_BASE_OPTIONS
    );

    // Notify listeners
    AuthClientService.notifyAuthStateChange("SIGNED_OUT", null);
  }

  /**
   * Listen for auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: JWTSession | null) => void
  ): { data: { subscription: { unsubscribe: () => void } } } {
    AuthClientService.authStateListeners.push(callback);

    // Start polling for token expiration
    const pollInterval = setInterval(async () => {
      const session = await AuthClientService.getSession();
      if (!session) {
        callback("TOKEN_EXPIRED", null);
      }
    }, 5000); // Check every 5 seconds

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            clearInterval(pollInterval);
            const index =
              AuthClientService.authStateListeners.indexOf(callback);
            if (index > -1) {
              AuthClientService.authStateListeners.splice(index, 1);
            }
          },
        },
      },
    };
  }

  /**
   * Notify all listeners of auth state change
   */
  private static notifyAuthStateChange(
    event: string,
    session: JWTSession | null
  ): void {
    AuthClientService.authStateListeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (error) {
        console.error("Error in auth state listener:", error);
      }
    });
  }

  /**
   * Sign in via API route (calls EC2 backend)
   */
  static async signIn(
    credentials: { email: string; password: string } | string,
    password?: string
  ): Promise<JWTSession> {
    try {
      const email =
        typeof credentials === "string" ? credentials : credentials.email;
      const pwd =
        typeof credentials === "string" ? password! : credentials.password;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      if (!response.ok) {
        let errorMessage = "Sign in failed";
        try {
          const errorText = await response.text();
          if (errorText) {
            const error = JSON.parse(errorText);
            errorMessage = error.error || errorMessage;
          }
        } catch (parseError) {
          // If response is not JSON, use status text or default message
          errorMessage =
            response.statusText || `HTTP ${response.status}: Sign in failed`;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      // console.log('🔍 Login API Response:', responseText);
      const data = JSON.parse(responseText);
      // console.log('🔍 Parsed data:', data);

      // Get token from cookie or response
      // EC2 backend returns: {success, token, user}
      const token =
        data.token ||
        data?.data?.token ||
        response.headers
          .get("set-cookie")
          ?.split("auth-token=")[1]
          ?.split(";")[0];

      // console.log('🔍 Extracted token:', token ? 'Present' : 'Missing');

      if (!token) {
        throw new Error("No authentication token received");
      }

      // Transform API response to JWTUser format
      // EC2 backend returns: {success, token, user: {id, email, firstName, lastName, role, phone}}
      const userData = data.user || data?.data?.user;
      // console.log('🔍 User data:', userData);

      if (!userData) {
        console.error('❌ Full response data:', JSON.stringify(data, null, 2));
        throw new Error("No user data received from server");
      }

      const jwtUser: JWTUser = {
        id: userData.id,
        email: userData.email,
        user_metadata: {
          role: userData.role,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || "",
          is_active: userData.is_active !== undefined ? userData.is_active : true,
        },
      };

      AuthClientService.setSession(token, jwtUser);

      return {
        access_token: token,
        token_type: "Bearer",
        user: jwtUser,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  /**
   * Sign out via API route (calls EC2 backend)
   */
  static async signOut(): Promise<void> {
    try {
      const session = await AuthClientService.getSession();
      if (session) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      }
    } finally {
      AuthClientService.clearSession();
    }
  }

  /**
   * Get current user profile from API
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const session = await AuthClientService.getSession();
    if (!session) return null;

    return AuthClientService.getUserProfile(session.user.id);
  }

  /**
   * Get user profile from API (calls EC2 backend)
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const session = await AuthClientService.getSession();
    if (!session) return null;

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

    const response = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return response.json();
  }

  /**
   * Sign up via API route (calls EC2 backend)
   */
  static async signUp(credentials: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }): Promise<{ user: UserProfile }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign up failed");
    }

    const data = await response.json();
    AuthClientService.setSession(
      data.token || data.data.token,
      data.user || data.data.user
    );

    return {
      user: {
        id: data.user.id || data.data.user.id,
        email: data.user.email || data.data.user.email,
        role: data.user.user_metadata.role || data.data.user.user_metadata.role,
        firstName:
          data.user.user_metadata.first_name ||
          data.data.user.user_metadata.first_name,
        lastName:
          data.user.user_metadata.last_name ||
          data.data.user.user_metadata.last_name,
        phone:
          data.user.user_metadata.phone ||
          data.data.user.user_metadata.phone ||
          "",
        emailVerified:
          data.user.email_verified || data.data.user.email_verified || false,
        lastSignIn:
          data.user.last_sign_in || data.data.user.last_sign_in || null,
        createdAt:
          data.user.created_at ||
          data.data.user.created_at ||
          new Date().toISOString(),
      },
    };
  }

  /**
   * Reset password via API route (calls EC2 backend)
   */
  static async resetPassword(credentials: { email: string }): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Password reset failed");
    }
  }

  /**
   * Update password via API route (calls EC2 backend)
   */
  static async updatePassword(credentials: {
    email: string;
    password: string;
  }): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

    const response = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Password update failed");
    }
  }

  /**
   * Update profile via API route (calls EC2 backend)
   */
  static async updateProfile(credentials: {
    email: string;
    password: string;
  }): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://3.91.17.245:4000';

    const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Profile update failed");
    }
  }
}
