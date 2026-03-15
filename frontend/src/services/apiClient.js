import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Always send cookies
});
