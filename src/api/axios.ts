import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/";

// -------------------------------------------------------
// Convert DRF serializer errors → readable string
// -------------------------------------------------------
function extractDjangoError(data: any): string {
  if (!data) return "Unknown error";

  // If DRF returned {"detail": "..."}
  if (data.detail) return String(data.detail);

  // If DRF returned {"non_field_errors": [...]}
  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join(", ");
  }

  // Field-level errors:  { field: ["msg1", "msg2"], field2: ["msg"] }
  if (typeof data === "object") {
    try {
      const parts: string[] = [];

      for (const key of Object.keys(data)) {
        const val = data[key];

        if (Array.isArray(val)) {
          parts.push(`${key}: ${val.join(", ")}`);
        } else if (typeof val === "string") {
          parts.push(`${key}: ${val}`);
        }
      }

      if (parts.length > 0) {
        return parts.join(" | ");
      }
    } catch (e) {}
  }

  return "Validation failed";
}

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
function createAxiosInstance(): TypedAxios {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
  });

  // Add token to every request
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // RESPONSE HANDLER
  instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,

    async (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data;

      // -------------------------
      // 401 → logout behavior intact
      // -------------------------
      if (status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/";
        (error as any).serverMessage = "Unauthorized";
        return Promise.reject(error);
      }

      // -------------------------
      // 400 → extract serializer errors EXACTLY as DRF gives
      // -------------------------
      if (status === 400) {
        (error as any).serverMessage = extractDjangoError(data);
        return Promise.reject(error);
      }

      // Other errors fallback
      (error as any).serverMessage =
        extractDjangoError(data) ||
        error.message ||
        "Unknown API error";

      return Promise.reject(error);
    }
  );

  return instance as unknown as TypedAxios;
}

// Export clients
export const globalApi = createAxiosInstance();
export const customerApi = createAxiosInstance();
