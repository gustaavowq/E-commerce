// Formato padrão de resposta da API. Consistente entre todos endpoints.
import type { Response } from 'express'

export type ApiSuccess<T> = {
  success: true
  data: T
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export type ApiErrorBody = {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export const errors = {
  badRequest:    (msg = 'Requisição inválida', details?: unknown) =>
    new ApiError(400, 'BAD_REQUEST', msg, details),
  unauthorized:  (msg = 'Autenticação necessária') =>
    new ApiError(401, 'UNAUTHORIZED', msg),
  forbidden:     (msg = 'Acesso negado') =>
    new ApiError(403, 'FORBIDDEN', msg),
  notFound:      (msg = 'Recurso não encontrado') =>
    new ApiError(404, 'NOT_FOUND', msg),
  conflict:      (msg = 'Conflito de estado', details?: unknown) =>
    new ApiError(409, 'CONFLICT', msg, details),
  unprocessable: (msg = 'Dados inválidos', details?: unknown) =>
    new ApiError(422, 'UNPROCESSABLE_ENTITY', msg, details),
  internal:      (msg = 'Erro interno do servidor') =>
    new ApiError(500, 'INTERNAL', msg),
  serviceUnavailable: (msg = 'Serviço indisponível') =>
    new ApiError(503, 'SERVICE_UNAVAILABLE', msg),
}

export function ok<T>(res: Response, data: T, meta?: ApiSuccess<T>['meta']): Response {
  const body: ApiSuccess<T> = { success: true, data }
  if (meta) body.meta = meta
  return res.json(body)
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json({ success: true, data } satisfies ApiSuccess<T>)
}

export function noContent(res: Response): Response {
  return res.status(204).send()
}
