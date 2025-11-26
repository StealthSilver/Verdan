import axios from "axios";

// Determine the correct base URL based on environment
const getBaseURL = () => {
  // uncomment when deploying backend
  // First check for environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For production, use the deployed backend
  if (import.meta.env.PROD) {
    return "https://verdan-1-iwlt.onrender.com/";
  }

  // For development, use localhost
  return "http://localhost:8000/";
};

const baseURL = getBaseURL();

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Enable credentials for CORS
  timeout: 10000, // 10 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log(
      `🌐 Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );
    console.log(`🔑 Token present: ${!!token}`);

    if (token && config.headers) {
      // Use `set` to mutate AxiosHeaders safely
      if ("set" in config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
API.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Response received from ${response.config.url}:`,
      response.status
    );
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error);

    if (error.code === "ERR_NETWORK") {
      console.error("❌ Network Error - possibly CORS or server down");
    }

    if (error.response?.status === 401) {
      console.warn("🔐 Unauthorized - clearing token");
      localStorage.removeItem("token");
      // Optionally redirect to login
      // window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);

export default API;
