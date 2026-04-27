// Env validado via Zod — falha rápido no boot se faltar var crítica.
//
// Lições críticas aplicadas:
//   #01 — JWT_SECRET sem default. Sem env, backend NÃO sobe (fail-fast).
//   #06 — .env só na raiz, sincronizar entre dev/prod.
//   #07 — COOKIE_DOMAIN opcional; em Railway vazio, em dev local pode setar.
//   #10 — Sem placeholders inseguros sugeridos automaticamente.
import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT:     z.coerce.number().int().default(4001),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL obrigatória'),

  // CRÍTICO — sem default. openssl rand -base64 48 (ver lição #01).
  JWT_SECRET:             z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 chars'),
  JWT_EXPIRES_IN:         z.string().default('15m'),  // access token curto
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),  // refresh longo

  CORS_ORIGIN: z.string().default('http://localhost,http://loja.kore.test,http://admin.kore.test'),

  // Cookie domain compartilhado entre subdomínios (ex: ".kore.test").
  // Em Railway: VAZIO. Em dev local com hosts file: ".kore.test".
  COOKIE_DOMAIN: z.string().optional(),

  // SameSite. "lax" pra mesmo domínio. "none" pra cross-site (Vercel + Railway).
  COOKIE_SAMESITE: z.enum(['lax', 'none', 'strict']).default('lax'),

  PUBLIC_API_URL: z.string().url().optional(),

  MERCADOPAGO_TOKEN:          z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY:     z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  SHIPPING_ORIGIN_CEP: z.string().default('01310-100'),
  SHIPPING_FLAT_RATE:  z.coerce.number().default(45.00),  // hardware pesa mais

  WHATSAPP_NUMBER: z.string().optional(),

  STORE_URL:    z.string().url().optional(),
  ADMIN_URL:    z.string().url().optional(),

  // Seed admin — sem default de senha (lição #10).
  SEED_ADMIN_EMAIL:    z.string().email().default('admin@kore.tech'),
  SEED_ADMIN_PASSWORD: z.string().min(10).optional(),
  SEED_ADMIN_NAME:     z.string().default('Admin Kore Tech'),

  // Rate limit do waitlist (anti-spam de email)
  WAITLIST_RATE_LIMIT_PER_HOUR: z.coerce.number().int().default(10),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('[env] Variáveis de ambiente inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
export const isDev  = env.NODE_ENV === 'development'
