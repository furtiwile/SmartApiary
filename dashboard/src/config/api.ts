import axios from "axios";
import { CONFIG } from "./config";
import { LocalStorage } from "../features/users/helpers/localStorageHelper";

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
});

api.interceptors.request.use((requestConfig) => {
  const token = LocalStorage.get("authToken");

  if (token) {
    requestConfig.headers = requestConfig.headers ?? {};
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }

  return requestConfig;
});

export default api;
