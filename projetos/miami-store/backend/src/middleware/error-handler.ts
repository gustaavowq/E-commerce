// Centraliza tratamento de erros: ApiError vira resposta padronizada;
// ZodError vira 422; Prisma vira 4xx específicos; resto vira 500.
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { ApiError, type ApiErrorBody } from '../lib/api-response.js'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  // Erros que JÁ são ApiError
  if (err instanceof ApiError) {
    const body: ApiErrorBody = {
      success: false,
      error: { code: err.code, message: err.message, details: err.details },
    }
    return res.status(err.status).json(body)
  }

  // Validação Zod
  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: err.flatten().fieldErrors,
      },
    }
    return res.status(422).json(body)
  }

  // Prisma — known errors
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

  // Tudo o que não foi tratado: log + 500 genérico
  const message = err instanceof Error ? err.message : 'Erro desconhecido'
  console.error('[error]', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    message,
    stack: err instanceof Error ? err.stack : undefined,
  })

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL',
      message: process.env.NODE_ENV === 'development' ? message : 'Erro interno do servidor',
    },
  } satisfies ApiErrorBody)
}
