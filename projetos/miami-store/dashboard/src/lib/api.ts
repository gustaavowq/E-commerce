// HTTP client. Mesmas regras do frontend:
//  - Server-side: hit em http://backend:3001 (rede docker interna)
//  - Client-side: hit em /api (Nginx faz proxy)
import { ApiError } from './api-error'

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL
        ?? process.env.NEXT_PUBLIC_API_URL  // fallback pra Vercel (sem rede interna)
        ?? 'http://backend:3001'
  }
  return process.env.NEXT_PUBLIC_API_URL ?? '/api'
}

export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number }
}
export type ApiErrorBody = {
  success: false
  error: { code: string; message: string; details?: unknown }
}
type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody

export type ApiOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined | null>
  withAuth?: boolean
}

function buildUrl(path: string, query?: ApiOptions['query']): string {
  // Concatena direto pra preservar o pathname do base (ex: "/api").
  // new URL() com path absoluto SUBSTITUIRIA o pathname do base — bug clássico.
  const base = getBaseUrl().replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const qs = query
    ? '?' + Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  return `${base}${cleanPath}${qs && qs !== '?' ? qs : ''}`
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { query, withAuth = true, headers, body, ...rest } = opts

  const init: RequestInit = {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body instanceof FormData || typeof body === 'string' || body == null
      ? body as BodyInit | null | undefined
      : JSON.stringify(body),
    credentials: withAuth ? 'include' : 'omit',
  }

  const res = await fetch(buildUrl(path, query), init)
  let json: ApiResponse<T> | null = null
  try { json = await res.json() as ApiResponse<T> } catch {}

  if (!res.ok || !json || json.success === false) {
    const code = json && 'error' in json ? json.error.code : 'NETWORK_ERROR'
    const msg  = json && 'error' in json ? json.error.message : `HTTP ${res.status}`
    throw new ApiError(res.status, code, msg, json && 'error' in json ? json.error.details : undefined)
  }
  return json.data
}

export const get  = <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'GET' })
export const post = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'POST', body: body as BodyInit })
export const patch = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'PATCH', body: body as BodyInit })
export const del  = <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'DELETE' })

// Variante que devolve {data, meta} pra listas paginadas
export async function apiList<T>(path: string, opts: ApiOptions = {}): Promise<{ data: T; meta: ApiSuccess<T>['meta'] }> {
  const { query, withAuth = true, headers, ...rest } = opts
  const init: RequestInit = {
    ...rest,
    headers: { Accept: 'application/json', ...headers },
    credentials: withAuth ? 'include' : 'omit',
  }
  const res = await fetch(buildUrl(path, query), init)
  const json = await res.json() as ApiResponse<T>
  if (!res.ok || json.success === false) {
    const code = json && 'error' in json ? json.error.code : 'NETWORK_ERROR'
    const msg  = json && 'error' in json ? json.error.message : `HTTP ${res.status}`
    throw new ApiError(res.status, code, msg)
  }
  return { data: json.data, meta: json.meta }
}
