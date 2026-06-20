import axios from "axios";
import { CONFIG } from "./config";
import { LocalStorage } from "../features/users/helpers/localStorageHelper";

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
});

// This should fix 401 (Unauthorized) errors when calling backend APIs
api.interceptors.request.use(
  (config) => {
    const token = LocalStorage.get("authToken");; 
    if (token)
      config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
