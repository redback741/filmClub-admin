import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth-store'

const baseURL = import.meta.env?.VITE_API_BASE_URL ?? '/api'

const request: AxiosInstance = axios.create({
  baseURL,
})

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers = config.headers ?? {}
    ;(config.headers as unknown as Record<string, string>).Authorization =
      `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    return Promise.reject(error)
  }
)

export const http = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return request.get<unknown, T>(url, config)
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return request.delete<unknown, T>(url, config)
  },
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) {
    return request.post<unknown, T>(url, data, config)
  },
  put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) {
    return request.put<unknown, T>(url, data, config)
  },
  patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ) {
    return request.patch<unknown, T>(url, data, config)
  },
}

export { request }
