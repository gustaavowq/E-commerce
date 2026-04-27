// Cliente HTTP unico do Kore Tech. Cookies httpOnly via withCredentials.
//
// Por que axios em vez do fetch wrapper do Miami?
// O brief pediu axios explicitamente. Mantemos contrato compativel com o do Miami:
// retorna sempre o `data` desempacotado e lanca ApiError em caso de falha.
//
// SSR usa INTERNAL_API_URL (rede interna do compose). Client usa NEXT_PUBLIC_API_URL.

import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { ApiError } from '@/lib/api-error'

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.INTERNAL_API_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://backend:3001'
    )
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001'
}

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ success?: boolean; error?: { code?: string; message?: string; details?: unknown } }>) => {
    const status = err.response?.status ?? 0
    const body = err.response?.data
    const code = body?.error?.code ?? (status === 0 ? 'NETWORK_ERROR' : 'HTTP_ERROR')
    const message = body?.error?.message ?? err.message ?? `HTTP ${status}`
    const details = body?.error?.details
    return Promise.reject(new ApiError(status, code, message, details))
  },
)

// Envelope canonico do backend (Miami): { success: true, data: ... }
type Envelope<T> = { success: true; data: T; meta?: { page?: number; limit?: number; total?: number; totalPages?: number } }

function unwrap<T>(envelope: unknown): T {
  if (envelope && typeof envelope === 'object' && 'data' in (envelope as Record<string, unknown>)) {
    return (envelope as Envelope<T>).data
  }
  // Backend pode retornar payload direto em alguns endpoints — tolera.
  return envelope as T
}

export async function apiGet<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<Envelope<T> | T>(path, config)
  return unwrap<T>(res.data)
}

export async function apiPost<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<Envelope<T> | T>(path, body, config)
  return unwrap<T>(res.data)
}

export async function apiPut<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<Envelope<T> | T>(path, body, config)
  return unwrap<T>(res.data)
}

export async function apiPatch<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<Envelope<T> | T>(path, body, config)
  return unwrap<T>(res.data)
}

export async function apiDelete<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<Envelope<T> | T>(path, config)
  return unwrap<T>(res.data)
}

// Variante pra listas paginadas onde precisamos de meta junto com data.
export async function apiList<T>(path: string, config?: AxiosRequestConfig) {
  const res = await apiClient.get<Envelope<T>>(path, config)
  return { data: res.data?.data as T, meta: res.data?.meta }
}
