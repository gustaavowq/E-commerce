// Cliente HTTP tipado pra Backend Miami Store.
// - Cookies httpOnly funcionam automaticamente via { credentials: 'include' }
// - Server components rodam dentro do Docker e usam URL interna do compose
// - Client components rodam no browser e usam URL pública (Nginx)

import { ApiError } from './api-error'

// Helper que decide a base URL conforme contexto:
//   - Server-side: INTERNAL_API_URL (rede interna em dev / API pública em prod Vercel)
//   - Client-side: NEXT_PUBLIC_API_URL (browser do usuário)
//   - Fallbacks pra dev local sem env: http://backend:3001 (SSR) / /api (browser)
function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL
        ?? process.env.NEXT_PUBLIC_API_URL  // fallback pra Vercel (não tem rede interna)
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
  // Se true (default), envia cookies httpOnly. Desligue só se explicitamente cross-origin sem auth.
  withAuth?: boolean
  // Em RSC, evita cache estale durante dev
  cache?: RequestCache
  next?: NextFetchRequestConfig
}

function buildUrl(path: string, query?: ApiOptions['query']): string {
  // Concatena direto pra preservar o pathname do base (ex: "/api"). new URL()
  // com path absoluto SUBSTITUIRIA o pathname do base — bug clássico.
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
      Accept:         'application/json',
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body instanceof FormData || typeof body === 'string' || body == null
      ? body as BodyInit | null | undefined
      : JSON.stringify(body),
    credentials: withAuth ? 'include' : 'omit',
  }

  const url = buildUrl(path, query)
  const res = await fetch(url, init)

  let json: ApiResponse<T> | null = null
  try {
    json = await res.json() as ApiResponse<T>
  } catch {
    // não é JSON — provavelmente erro de infra
  }

  if (!res.ok || !json || json.success === false) {
    const code = json && 'error' in json ? json.error.code   : 'NETWORK_ERROR'
    const msg  = json && 'error' in json ? json.error.message : `HTTP ${res.status}`
    const det  = json && 'error' in json ? json.error.details : undefined
    throw new ApiError(res.status, code, msg, det)
  }

  return json.data
}

// Variantes ajudam tipagem nos services
export const get  = <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'GET' })
export const post = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'POST', body: body as BodyInit })
export const put  = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'PUT', body: body as BodyInit })
export const del  = <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'DELETE' })

// Pra retornar tudo (data + meta) em listas paginadas
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
