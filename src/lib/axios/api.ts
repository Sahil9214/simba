// libs/axios/api.ts
import axios from "axios";
import { AuthClientService } from "@/lib/services/auth.client.service";
import { handleMockRequest } from "@/lib/mock/mockRouter";
import { DUMMY_AUTH_TOKEN } from "@/lib/constants/dummyData";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure Axios custom adapter to intercept all API requests and return mock data
axiosInstance.defaults.adapter = async (config) => {
  // Simulate small network delay for smooth UI feel
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

// Helper to get token depending on environment
async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = require("next/headers");
      const token = cookies().get("token")?.value ?? null;
      return token || DUMMY_AUTH_TOKEN;
    } catch {
      return DUMMY_AUTH_TOKEN;
    }
  } else {
    const localToken = localStorage.getItem("auth_token");
    if (localToken) return localToken;
    const match = document.cookie.match(/(?:^|; )token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return DUMMY_AUTH_TOKEN;
  }
}

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = (await getAuthToken()) || DUMMY_AUTH_TOKEN;

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
    // Graceful error handling for dummy mode - never force logout on client
    console.warn("Axios request intercepted with mock fallback:", error?.message);
    return Promise.resolve({
      data: { success: true, data: [] },
      status: 200,
      statusText: "OK",
      headers: {},
      config: error.config,
    });
  }
);
