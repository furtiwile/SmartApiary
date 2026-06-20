import axios from "axios";
import { CONFIG } from "./config";

const api = axios.create({
  baseURL: `${CONFIG.API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token.replace(/^"|"$/g, '')}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
