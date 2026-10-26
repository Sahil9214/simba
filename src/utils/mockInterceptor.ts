"use client";

/**
 * Client-side Mock Interceptor
 * Intercepts global fetch and global axios calls, initializing mock session in the browser.
 */

import axios from "axios";
import { handleMockRequest } from "@/lib/mock/mockRouter";
import { DUMMY_AUTH_TOKEN, DUMMY_USER } from "@/lib/constants/dummyData";

if (typeof window !== "undefined") {
  // Ensure default mock auth session is initialized if none exists
  try {
    const existingToken = localStorage.getItem("auth_token");
    if (!existingToken) {
      localStorage.setItem("auth_token", DUMMY_AUTH_TOKEN);
      localStorage.setItem("auth_user", JSON.stringify(DUMMY_USER));
      document.cookie = `auth_token=${DUMMY_AUTH_TOKEN}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `token=${DUMMY_AUTH_TOKEN}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch (err) {
    console.warn("Could not initialize dummy session in localStorage/cookie:", err);
  }

  // Intercept global axios defaults
  try {
    axios.defaults.adapter = async (config) => {
      await new Promise((resolve) => setTimeout(resolve, 60));
      const url = config.url || "";
      const method = config.method || "GET";
      const mockResult = handleMockRequest(url, method, config.data);

      return {
        data: mockResult.data,
        status: mockResult.status,
        statusText: "OK",
        headers: config.headers as any,
        config,
        request: {},
      };
    };
  } catch (err) {
    console.warn("Could not attach mock adapter to default axios:", err);
  }

  // Intercept window.fetch
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    const isApiRequest =
      url.includes("/api/") ||
      url.includes("simbabeer.com") ||
      url.includes("3.91.17.245") ||
      url.startsWith("/api");

    if (isApiRequest) {
      // Simulate slight realistic network delay for smooth UI feel
      await new Promise((resolve) => setTimeout(resolve, 60));

      const method = init?.method || "GET";
      const body = init?.body;
      const mockResult = handleMockRequest(url, method, body);

      // If login request, also persist the mock token & user into localStorage & cookies
      if (url.includes("/api/auth/login")) {
        try {
          localStorage.setItem("auth_token", DUMMY_AUTH_TOKEN);
          localStorage.setItem("auth_user", JSON.stringify(DUMMY_USER));
          document.cookie = `auth_token=${DUMMY_AUTH_TOKEN}; path=/; max-age=31536000; SameSite=Lax`;
          document.cookie = `token=${DUMMY_AUTH_TOKEN}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {
          // Ignore storage issues
        }
      }

      // If logout request, clear
      if (url.includes("/api/auth/logout")) {
        try {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        } catch {
          // Ignore storage issues
        }
      }

      const jsonString = JSON.stringify(mockResult.data);
      return new Response(jsonString, {
        status: mockResult.status,
        statusText: "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          "x-mock-data": "true",
        }),
      });
    }

    return originalFetch.apply(this, [input, init]);
  };
}

