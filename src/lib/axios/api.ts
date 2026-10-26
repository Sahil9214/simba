// libs/axios/api.ts
import axios from "axios";
import { AuthClientService } from "@/lib/services/auth.client.service";

// NOTE: avoid importing next/headers at top-level (server-only).
// We'll lazily read cookies when running on server.

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to get token depending on environment
async function getAuthToken(): Promise<string | null> {
  // server environment (Node) — try to import next/headers lazily
  if (typeof window === "undefined") {
    try {
      const { cookies } = require("next/headers");
      const token = cookies().get("token")?.value ?? null;
      return token;
    } catch {
      return null;
    }
  } else {
    // Client side: Try localStorage first (Primary source)
    const localToken = localStorage.getItem("auth_token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return null;
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();

    // If no token and we're on client side, check if we should force logout
    if (!token && typeof window !== "undefined") {
      // Allow requests to auth endpoints without token
      const isAuthEndpoint = config.url?.includes('/') ||
        config.url?.includes('/auth/signup') ||
        config.url?.includes('/auth/forgot-password');

      if (!isAuthEndpoint && window.location.pathname !== '/' && window.location.pathname !== '/login') {
        // console.log("🔒 No token available for request - Forcing logout");
        AuthClientService.clearSession();
        window.location.href = "/";
        return Promise.reject(new Error("No authentication token available"));
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        console.log("🔒 401 Unauthorized - Forcing logout");
        // Clear session and redirect to login on client side
        AuthClientService.clearSession();

        // Force redirect to login page
        window.location.href = "/";
      }
    }

    // Handle network errors or missing token
    if (!error.response && typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.log("🔒 No token found - Forcing logout");
        AuthClientService.clearSession();
        window.location.href = "/";
      }
    }

    // global error handling (optional)
    return Promise.reject(error);
  }
);


