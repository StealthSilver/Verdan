import axios from "axios";

// Determine the correct base URL based on environment
const getBaseURL = () => {
  // First check for environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For production, use the deployed backend
  if (import.meta.env.PROD) {
    return "https://verdan-787l.vercel.app/";
  }

  // For development, use localhost
  return "http://localhost:8000/";
};

const baseURL = getBaseURL();
console.log("🔗 API Base URL:", baseURL);
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("🏭 Production?", import.meta.env.PROD);
console.log("📋 VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && config.headers) {
    // Use `set` to mutate AxiosHeaders safely
    if ("set" in config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
  }

  return config;
});

export default API;
