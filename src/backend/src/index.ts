// =============================================================================
// Miami Store — Backend entrypoint
// Wires up: middlewares globais + rotas públicas + rotas admin + error handler.
// =============================================================================

import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'

import { env, isDev } from './config/env.js'
import { prisma } from './lib/prisma.js'
import { ok } from './lib/api-response.js'
import { extractUser } from './middleware/auth.js'
import { errorHandler } from './middleware/error-handler.js'
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
import { adminRouter } from './routes/admin/index.js'

// -----------------------------------------------------------------------------
// App
// -----------------------------------------------------------------------------
const app = express()

// Atrás do Nginx — confia no proxy pra IP/proto
app.set('trust proxy', 1)

app.use(helmet({
  // Em dev, CSP atrapalha o frontend local. Em prod, DevOps liga.
  contentSecurityPolicy: false,
  // CORP=same-origin do Helmet quebra fetch cross-origin do dashboard (3002 → 80).
  // Em prod, DevOps endurece com config específica.
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy:   false,
  crossOriginEmbedderPolicy: false,
  // X-Frame-Options é setado pelo nginx (DENY). Tira do Helmet pra não duplicar.
  frameguard: false,
}))
app.use(cors({
  origin:      env.CORS_ORIGIN.split(',').map(s => s.trim()),
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(morgan(isDev ? 'dev' : 'combined'))

// Coloca req.user se houver token válido (não bloqueia)
app.use(extractUser)

// -----------------------------------------------------------------------------
// Healthcheck
// -----------------------------------------------------------------------------
app.get('/healthz', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return ok(res, {
      status:    'ok',
      service:   'miami-backend',
      version:   '0.1.0',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    next(err)
  }
})

app.get('/', (_req: Request, res: Response) => ok(res, {
  service: 'Miami Store Backend',
  message: 'API no ar. Veja /api/products, /api/brands, /api/categories.',
}))

// -----------------------------------------------------------------------------
// Rotas — montadas com e sem o prefixo /api porque o Nginx faz strip de /api.
// Em dev expomos direto na porta 3001 também (sem strip) pra facilitar curl.
// -----------------------------------------------------------------------------
function mountRoutes(prefix: string) {
  app.use(`${prefix}/auth`,        authRouter)
  app.use(`${prefix}/brands`,      brandsRouter)
  app.use(`${prefix}/categories`,  categoriesRouter)
  app.use(`${prefix}/products`,    productsRouter)
  app.use(`${prefix}/cart`,        cartRouter)
  app.use(`${prefix}/addresses`,   addressesRouter)
  app.use(`${prefix}/shipping`,    shippingRouter)
  app.use(`${prefix}/orders`,      ordersRouter)
  app.use(`${prefix}/webhooks`,    webhooksRouter)
  app.use(`${prefix}/settings`,    settingsRouter)
  app.use(`${prefix}/wishlist`,    wishlistRouter)
  app.use(`${prefix}/reviews`,     reviewsRouter)
  app.use(`${prefix}/admin`,       adminRouter)
}

// Quando vem via Nginx (location /api/ proxy_pass http://backend/), o /api é strippado
mountRoutes('')
// Quando vem direto em :3001/api/* (debug)
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
  console.log(`[boot] Miami Store Backend rodando em :${env.PORT} (${env.NODE_ENV})`)
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
