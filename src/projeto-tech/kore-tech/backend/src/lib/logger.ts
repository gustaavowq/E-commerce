// =============================================================================
// Pino logger + middleware que injeta `req.log` em cada request.
//
// Por que não pino-http? Pra MVP não precisamos da request lifecycle completa
// (já temos morgan pra access log) — só do logger estruturado por request pra
// não vazar dado em console.log direto.
//
// Uso:
//   req.log.info({ contact }, 'contact form received')
//   req.log.debug({ resetUrl, email }, 'password reset url generated (dev only)')
// =============================================================================
import pino from 'pino'
import type { Request, Response, NextFunction } from 'express'
import { env, isDev } from '../config/env.js'

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : (isDev ? 'debug' : 'info'),
  // Em dev, pino-pretty transforma JSON em linhas legíveis. Em prod, deixa
  // JSON puro pra ingestão em sistema central (Datadog/Logtail/etc).
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
  redact: {
    paths: [
      'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
      'authorization', 'cookie',
      '*.password', '*.passwordHash', '*.token',
    ],
    censor: '[REDACTED]',
  },
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      log: pino.Logger
    }
  }
}

export function attachLogger(req: Request, _res: Response, next: NextFunction): void {
  // Logger filho com contexto do request (path + ip). Suficiente pra correlação
  // local — em prod-distribuído trocaremos por trace-id propagado pelo gateway.
  req.log = logger.child({ path: req.path, method: req.method, ip: req.ip })
  next()
}
