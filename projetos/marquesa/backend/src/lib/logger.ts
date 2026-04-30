// Logger pino estruturado. Em dev, pretty-print; em prod, JSON pra agregação.
import pino from 'pino'
import { env, isDev } from '../config/env.js'

export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isDev
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
})
