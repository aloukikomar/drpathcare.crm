import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";

// -------------------------------------------------------
// TYPED AXIOS INSTANCE
// -------------------------------------------------------
interface TypedAxios {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// -------------------------------------------------------
// CREATE INSTANCE WITH COMMON LOGIC
// -------------------------------------------------------
function createAxiosInstance(): TypedAxios {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { "Content-Type": "application/json" },
  });

  // ----------------------------
  // REQUEST INTERCEPTOR — Add token
  // ----------------------------
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // ----------------------------
  // RESPONSE INTERCEPTOR — unwrap + handle 401
  // ----------------------------
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // ALWAYS unwrap -> return response.data
      return response.data as any;
    },

    async (error: AxiosError) => {
      const status = error.response?.status;

      // 🔥 FULL 401 LOGOUT (from old CRM) — restored
      if (status === 401) {
        console.warn("401 Unauthorized — clearing session…");

        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        window.location.href = "/"; // force redirect

        return Promise.reject(new Error("Unauthorized"));
      }

      const serverMessage =
        (error.response?.data as any)?.detail ||
        (error.response?.data as any)?.message;

      const message =
        serverMessage ||
        error.response?.statusText ||
        error.message ||
        "Unknown API error";

      return Promise.reject(new Error(message));
    }
  );

  return instance as unknown as TypedAxios;
}

// -------------------------------------------------------
// EXPORT API CLIENTS
// -------------------------------------------------------
export const globalApi = createAxiosInstance();
export const customerApi = createAxiosInstance();
