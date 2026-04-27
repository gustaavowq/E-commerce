// =============================================================================
// Kore Tech — Backend entrypoint
//
// Wires up: middlewares globais + rotas públicas + rotas admin + error handler.
// Kore Tech adiciona ao template Miami: Builder (compatibility/recommend-psu),
// Personas (CRUD admin + público by-slug), Builds (CRUD), Waitlist
// (subscribe público + notify admin) e admin Alerts (Data Analyst).
//
// Lições aplicadas:
//   #01 — JWT_SECRET sem default (em config/env.ts)
//   #03 — tsx em dependencies (em package.json)
//   #05 — CSP relaxada na API (DevOps endurece em prod via Nginx/Railway)
//   #07 — COOKIE_DOMAIN opcional, vazio em Railway
// =============================================================================

import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { env, isDev } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { ok } from './lib/api-response.js'
import { attachLogger } from './lib/logger.js'
import { extractUser } from './middleware/auth.js'
import { errorHandler } from './middleware/error-handler.js'

// Rotas públicas
import { authRouter } from './routes/auth.js'
import { brandsRouter } from './routes/brands.js'
import { categoriesRouter } from './routes/categories.js'
import { productsRouter } from './routes/products.js'
import { cartRouter } from './routes/cart.js'
import { addressesRouter } from './routes/addresses.js'
import { shippingRouter } from './routes/shipping.js'
import { ordersRouter } from './routes/orders.js'
import { webhooksRouter } from './routes/webhooks.js'
import { settingsRouter } from './routes/settings.js'
import { wishlistRouter } from './routes/wishlist.js'
import { reviewsRouter } from './routes/reviews.js'
import { contactRouter } from './routes/contact.js'
// Rotas Kore Tech (novas)
import { builderRouter } from './routes/builder.js'
import { buildsRouter } from './routes/builds.js'
import { personasRouter } from './routes/personas.js'
import { waitlistRouter } from './routes/waitlist.js'
// Admin master
import { adminRouter } from './routes/admin/index.js'

// -----------------------------------------------------------------------------
// App
// -----------------------------------------------------------------------------
const app = express()

// Atrás do Nginx — confia no proxy pra IP/proto.
// Importante pro express-rate-limit ler IP correto via X-Forwarded-For.
app.set('trust proxy', 1)

app.use(helmet({
  // Em dev, CSP atrapalha o frontend local. Em prod, DevOps liga via Nginx/Railway.
  contentSecurityPolicy: false,
  // CORP=same-origin do Helmet quebra fetch cross-origin do dashboard (3002 → 80).
  // Em prod, DevOps endurece com config específica.
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
  crossOriginEmbedderPolicy: false,
  // X-Frame-Options é setado pelo nginx (DENY). Tira do Helmet pra não duplicar.
  frameguard: false,
}))

// CORS configurável: comma-separated em CORS_ORIGIN, ou explicitamente
// FRONTEND_URL/DASHBOARD_URL/STORE_URL/ADMIN_URL.
const corsOriginEnv = (env.CORS_ORIGIN ?? '').split(',').map(s => s.trim()).filter(Boolean)
const explicitOrigins = [env.STORE_URL, env.ADMIN_URL].filter((x): x is string => !!x)
const allowedOrigins = Array.from(new Set([...corsOriginEnv, ...explicitOrigins]))

app.use(cors({
  origin: (origin, cb) => {
    // Sem origin (server-to-server, curl, healthcheck Railway) → permite.
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    return cb(new Error(`CORS: origem não permitida (${origin})`))
  },
  credentials: true,
}))

// 15mb pra aceitar imagem base64 (upload Cloudinary do painel admin).
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use(cookieParser())
app.use(morgan(isDev ? 'dev' : 'combined'))

// Sprint 2 — pino logger por request (req.log.info/debug/warn/error).
// Substitui console.log estruturado.
app.use(attachLogger)

// Coloca req.user se houver token válido (não bloqueia).
app.use(extractUser)

// -----------------------------------------------------------------------------
// Rate limiters (geral + agressivo em /auth)
// -----------------------------------------------------------------------------
const generalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,                  // 300 req/min/ip — generoso, MVP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas requisições, espere um pouco' } },
  // Healthcheck Railway/uptime probe não estoura limite
  skip: (req) => req.path === '/healthz' || req.path === '/',
})

// Limiter dedicado pro /auth/* — mais agressivo. As rotas individuais
// (login/register/forgot/reset) já têm limiter próprio em auth.ts; aqui é
// uma camada extra por IP cobrindo a área toda.
const authBucketLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espere um pouco' } },
})

app.use(generalLimiter)

// -----------------------------------------------------------------------------
// Healthcheck — Railway probe + uptime monitoring
// -----------------------------------------------------------------------------
app.get('/healthz', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

app.get('/', (_req: Request, res: Response) => ok(res, {
  service: 'Kore Tech Backend',
  version: '0.1.0',
  message: 'API no ar. Veja /api/products, /api/personas, /api/builder.',
}))

// -----------------------------------------------------------------------------
// Rotas — montadas com e sem o prefixo /api porque o Nginx faz strip de /api.
// Em dev expomos direto em :PORT/api/* também pra facilitar curl/postman.
// -----------------------------------------------------------------------------
function mountRoutes(prefix: string) {
  // Auth tem limiter agressivo extra
  app.use(`${prefix}/auth`, authBucketLimiter, authRouter)

  app.use(`${prefix}/products`,    productsRouter)
  app.use(`${prefix}/cart`,        cartRouter)
  app.use(`${prefix}/orders`,      ordersRouter)
  app.use(`${prefix}/builder`,     builderRouter)
  app.use(`${prefix}/builds`,      buildsRouter)
  app.use(`${prefix}/personas`,    personasRouter)
  app.use(`${prefix}/waitlist`,    waitlistRouter)
  app.use(`${prefix}/wishlist`,    wishlistRouter)
  app.use(`${prefix}/brands`,      brandsRouter)
  app.use(`${prefix}/categories`,  categoriesRouter)
  app.use(`${prefix}/reviews`,     reviewsRouter)
  app.use(`${prefix}/settings`,    settingsRouter)
  app.use(`${prefix}/shipping`,    shippingRouter)
  app.use(`${prefix}/addresses`,   addressesRouter)
  app.use(`${prefix}/contact`,     contactRouter)

  // Admin master — requireAuth + requireRole(ADMIN) aplicado dentro do router
  app.use(`${prefix}/admin`,       adminRouter)

  // Webhooks — externos (MercadoPago). Não passam por auth.
  app.use(`${prefix}/webhooks`,    webhooksRouter)
}

// Quando vem via Nginx (location /api/ proxy_pass http://backend/), o /api é strippado
mountRoutes('')
// Quando vem direto em :PORT/api/* (debug, dashboard local apontando direto)
mountRoutes('/api')

// -----------------------------------------------------------------------------
// 404
// -----------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Rota não encontrada' },
  })
})

// -----------------------------------------------------------------------------
// Error handler global (precisa ser o último middleware)
// -----------------------------------------------------------------------------
app.use(errorHandler)

// -----------------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------------
const server = app.listen(env.PORT, () => {
  console.log(`[boot] Kore Tech Backend rodando em :${env.PORT} (${env.NODE_ENV})`)
  if (allowedOrigins.length > 0) {
    console.log(`[boot] CORS origins: ${allowedOrigins.join(', ')}`)
  }
})

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`[shutdown] recebido ${signal}, encerrando...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
