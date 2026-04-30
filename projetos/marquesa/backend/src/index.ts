// =============================================================================
// Marquesa — Backend entrypoint
// Express + Prisma + JWT + MercadoPago. Roda na 8211 (faixa Ever Growth).
// =============================================================================

import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env, isDev } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { logger } from './lib/logger.js'
import { ok } from './lib/api-response.js'
import { extractUser } from './middlewares/auth.js'
import { errorHandler } from './middlewares/error.js'
import { globalLimiter } from './middlewares/rateLimit.js'
import { authRouter } from './routes/auth.js'
import { imoveisRouter } from './routes/imoveis.js'
import { reservasRouter } from './routes/reservas.js'
import { leadsRouter } from './routes/leads.js'
import { adminRouter } from './routes/admin/index.js'
import { mpWebhookRouter } from './webhooks/mercadoPago.js'
import { startReservaExpiryJob } from './services/reservaExpiry.js'

const app = express()

// Atrás do nginx — confia no proxy pra IP/proto (necessário pro rate-limit)
app.set('trust proxy', 1)

app.use(helmet({
  // Em dev, CSP atrapalha o Next. Em prod, DevOps liga via nginx.
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
  crossOriginEmbedderPolicy: false,
  // X-Frame-Options vai no nginx (DENY).
  frameguard: false,
}))

app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}))

app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(morgan(isDev ? 'dev' : 'combined'))

// Coloca req.user se houver token válido (não bloqueia)
app.use(extractUser)

// Rate limit global (100 req/min/IP)
app.use(globalLimiter)

// -----------------------------------------------------------------------------
// Healthcheck (usado pelo Docker/nginx)
// -----------------------------------------------------------------------------
app.get('/healthz', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return ok(res, {
      status:    'ok',
      service:   'marquesa-backend',
      version:   '0.1.0',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

app.get('/', (_req: Request, res: Response) => ok(res, {
  service: 'Marquesa Backend',
  message: 'API no ar. Veja /api/imoveis.',
}))

// -----------------------------------------------------------------------------
// Rotas — montadas com e sem o prefixo /api porque o nginx faz strip de /api.
// -----------------------------------------------------------------------------
function mountRoutes(prefix: string) {
  app.use(`${prefix}/auth`,     authRouter)
  app.use(`${prefix}/imoveis`,  imoveisRouter)
  app.use(`${prefix}/reservas`, reservasRouter)
  app.use(`${prefix}/leads`,    leadsRouter)
  app.use(`${prefix}/webhooks`, mpWebhookRouter)
  app.use(`${prefix}/admin`,    adminRouter)
}

mountRoutes('')      // quando vem strippado pelo nginx (location /api/)
mountRoutes('/api')  // quando bate direto na 8211

// -----------------------------------------------------------------------------
// 404 + error handler
// -----------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Rota não encontrada' },
  })
})

app.use(errorHandler)

// -----------------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------------
const server = app.listen(env.PORT, () => {
  logger.info(`Marquesa Backend rodando em :${env.PORT} (${env.NODE_ENV})`)
})

// Job de expiração de reservas (de hora em hora)
startReservaExpiryJob()

const shutdown = async (signal: string) => {
  logger.info(`recebido ${signal}, encerrando...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
