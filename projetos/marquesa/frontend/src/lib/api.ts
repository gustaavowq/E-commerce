// Cliente HTTP Marquesa.
// - Server-side usa INTERNAL_API_URL (rede interna no compose) ou cai pro localhost dev
// - Client-side usa NEXT_PUBLIC_API_URL — string vazia significa caminho relativo,
//   onde o rewrite() do Next proxa pra `${INTERNAL_API_URL}/api/*`. Assim cookies
//   httpOnly persistem por same-origin (lição cloudflare-tunnel-same-origin-rewrites).
// - credentials: 'include' propaga cookies httpOnly do backend

import type { ApiResponse, ListResponse } from '@/types/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: INTERNAL_API_URL preferido. Cai pro NEXT_PUBLIC_API_URL só se for
    // string não-vazia (`||` está OK aqui porque '' não é URL absoluta válida no servidor),
    // senão localhost dev.
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8211'
    )
  }
  // Client-side: '?? ""' preserva string vazia. Vazio = path relativo + rewrite Next.
  return process.env.NEXT_PUBLIC_API_URL ?? ''
}

export type ApiOptions = Omit<RequestInit, 'body'> & {
  query?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
  withAuth?: boolean
}

function buildUrl(path: string, query?: ApiOptions['query']): string {
  const base = getBaseUrl().replace(/\/+$/, '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const qs = query
    ? '?' +
      Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
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
      ...(headers as Record<string, string>),
    },
    body:
      body == null
        ? undefined
        : body instanceof FormData || typeof body === 'string'
          ? (body as BodyInit)
          : JSON.stringify(body),
    credentials: withAuth ? 'include' : 'omit',
  }

  const url = buildUrl(path, query)
  const res = await fetch(url, init)

  let json: ApiResponse<T> | null = null
  try {
    json = (await res.json()) as ApiResponse<T>
  } catch {
    // não-JSON
  }

  if (!res.ok || !json || json.success === false) {
    const code = json && 'error' in json ? json.error.code : 'NETWORK_ERROR'
    const msg = json && 'error' in json ? json.error.message : `HTTP ${res.status}`
    const det = json && 'error' in json ? json.error.details : undefined
    throw new ApiError(res.status, code, msg, det)
  }

  return json.data
}

export async function apiList<T>(
  path: string,
  opts: ApiOptions = {},
): Promise<ListResponse<T>> {
  const { query, withAuth = true, headers, body, ...rest } = opts
  const init: RequestInit = {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    },
    body: body == null ? undefined : (body as BodyInit),
    credentials: withAuth ? 'include' : 'omit',
  }
  const res = await fetch(buildUrl(path, query), init)
  const json = (await res.json()) as ApiResponse<T[]>
  if (!res.ok || json.success === false) {
    const code = json && 'error' in json ? json.error.code : 'NETWORK_ERROR'
    const msg = json && 'error' in json ? json.error.message : `HTTP ${res.status}`
    throw new ApiError(res.status, code, msg)
  }
  return {
    data: json.data,
    meta: {
      page: json.meta?.page ?? 1,
      limit: json.meta?.limit ?? 12,
      total: json.meta?.total ?? json.data.length,
      totalPages: json.meta?.totalPages ?? 1,
    },
  }
}

export const get = <T>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'GET' })
export const post = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'POST', body })
export const put = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'PUT', body })
export const patch = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'PATCH', body })
export const del = <T>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: 'DELETE' })
