import axios from "axios";

// Debug: Log the API base URL being used
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/";
console.log("🔗 API Base URL:", baseURL);
console.log("🌍 Environment:", import.meta.env.MODE);
console.log("📋 All env vars:", import.meta.env);

const API = axios.create({
  baseURL: baseURL,
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
