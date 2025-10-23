import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { toast } from 'sonner'
import type { ApiResponse } from '~/types/api'

const baseURL = import.meta.env.VITE_BACKEND_URL

const instance = axios.create({
  baseURL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
})

let navigate: ((path: string) => void) | null = null
export const setNavigate = (navigateFunction: (path: string) => void) => {
  navigate = navigateFunction
}

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  (error) => Promise.reject(error)
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (navigate && window.location.pathname !== '/login') {
        navigate('/login')
        toast.error('Session expired. Please log in again!')
      } else if (!navigate && window.location.pathname !== '/login') {
        window.location.href = '/login'
        toast.error('Session expired. Please log in again!')
      }
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  async get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const { data, status }: AxiosResponse<ApiResponse<T>> = await instance.get(url, { params })
      return { ...data, status } // giữ nguyên succeeded, message, data từ server
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      return {
        succeeded: false,
        message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        status: axiosError.response?.status || 500
      }
    }
  },

  async post<T = unknown>(url: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const { data, status }: AxiosResponse<ApiResponse<T>> = await instance.post(url, body)
      return { ...data, status }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      return {
        succeeded: false,
        message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        status: axiosError.response?.status || 500
      }
    }
  },

  async put<T = unknown>(url: string, body?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const { data, status }: AxiosResponse<ApiResponse<T>> = await instance.put(url, body)
      return { ...data, status }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      return {
        succeeded: false,
        message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        status: axiosError.response?.status || 500
      }
    }
  },

  async delete<T = unknown>(url: string): Promise<ApiResponse<T>> {
    try {
      const { data, status }: AxiosResponse<ApiResponse<T>> = await instance.delete(url)
      return { ...data, status }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      return {
        succeeded: false,
        message: axiosError.response?.data?.message || axiosError.message || 'Unknown error',
        status: axiosError.response?.status || 500
      }
    }
  }
}

export default instance
