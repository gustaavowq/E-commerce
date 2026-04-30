// Centraliza tratamento de erros: ApiError padronizado, ZodError 422,
// PrismaClientKnownRequestError com códigos relevantes.
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError, type ApiErrorBody } from '../lib/api-response.js'
import { logger } from '../lib/logger.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (err instanceof ApiError) {
    const body: ApiErrorBody = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    }
    return res.status(err.status).json(body)
  }

  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        // fieldErrors + formErrors — não dropar (memória 30-LICOES/26).
        details: { fieldErrors: err.flatten().fieldErrors, formErrors: err.flatten().formErrors },
      },
    }
    return res.status(422).json(body)
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[] | undefined)?.[0] ?? 'campo'
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `${field} já está em uso` },
      } satisfies ApiErrorBody)
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Recurso não encontrado' },
      } satisfies ApiErrorBody)
    }
  }

  const message = err instanceof Error ? err.message : 'Erro desconhecido'
  logger.error({
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    err: message,
    stack: err instanceof Error ? err.stack : undefined,
  }, 'unhandled error')

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL',
      message: process.env.NODE_ENV === 'development' ? message : 'Erro interno do servidor',
    },
  } satisfies ApiErrorBody)
}
