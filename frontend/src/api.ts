import axios, { type InternalAxiosRequestConfig } from "axios";

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & {
  __retryCount?: number;
  __didRefreshRetry?: boolean;
};

// Determine the correct base URL based on environment
const getBaseURL = () => {
  // uncomment when deploying backend
  // First check for environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For production, use the deployed backend
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || "/api";
  }

  // For development, use localhost
  return "http://localhost:8000/";
};

const baseURL = getBaseURL();

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Enable credentials for CORS
  timeout: 20000, // 20 second timeout to reduce spurious timeouts
  headers: {
    "Content-Type": "application/json",
  },
});

async function refreshAccessToken(): Promise<string> {
  const res = await API.post<{ access: string }>("/auth/refresh");
  const nextAccess = res.data.access;
  localStorage.setItem("token", nextAccess);
  return nextAccess;
}

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && config.headers) {
      // Use `set` to mutate AxiosHeaders safely
      if ("set" in config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Simple retry for transient network/timeout errors
    const config = error.config as RetryableAxiosRequestConfig | undefined;
    if (!config) {
      return Promise.reject(error);
    }
    const requestUrl = String(config.url || "");
    const isAuthRequest =
      requestUrl.includes("/auth/signin") ||
      requestUrl.includes("/auth/signup") ||
      requestUrl.includes("/auth/signup-request") ||
      requestUrl.includes("/auth/refresh");
    const isTransient =
      error.code === "ERR_NETWORK" || error.code === "ECONNABORTED";
    if (isTransient) {
      config.__retryCount = config.__retryCount || 0;
      const maxRetries = 2;
      if (config.__retryCount < maxRetries) {
        config.__retryCount += 1;
        const delay = 500 * Math.pow(2, config.__retryCount - 1); // 500ms, 1000ms
        return new Promise((resolve) => setTimeout(resolve, delay)).then(() =>
          API.request(config),
        );
      }
    }

    if (error.response?.status === 401) {
      // Never redirect or refresh-token-retry for auth endpoints.
      // These errors should be handled by the calling page (e.g. invalid credentials).
      if (isAuthRequest) {
        return Promise.reject(error);
      }

      // If the user was deleted, do not attempt refresh.
      if (error.response?.data?.code === "USER_NOT_FOUND") {
        localStorage.removeItem("token");
        localStorage.removeItem("name");
        localStorage.removeItem("role");
        localStorage.setItem(
          "deletionMessage",
          "Your account has been removed due to site deletion or administrative action. Please contact your administrator for assistance.",
        );
        window.location.href = "/";
        return Promise.reject(error);
      }

      // Attempt a single silent refresh + retry.
      if (!config.__didRefreshRetry && !requestUrl.includes("/auth/refresh")) {
        config.__didRefreshRetry = true;
        try {
          const nextAccess = await refreshAccessToken();
          if (config.headers) {
            if ("set" in config.headers && typeof config.headers.set === "function") {
              config.headers.set("Authorization", `Bearer ${nextAccess}`);
            } else {
              config.headers["Authorization"] = `Bearer ${nextAccess}`;
            }
          }
          return API.request(config);
        } catch (refreshErr) {
          localStorage.removeItem("token");
          localStorage.removeItem("name");
          localStorage.removeItem("role");
          localStorage.setItem(
            "sessionExpired",
            "Your session has expired. Please sign in again.",
          );
          window.location.href = "/";
          return Promise.reject(refreshErr);
        }
      }

      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("role");

      // For token expiration or invalid token
      localStorage.setItem(
        "sessionExpired",
        "Your session has expired. Please sign in again.",
      );

      // Force redirect to login for all 401 errors
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default API;
