// Env validado via Zod — falha rápido no boot se faltar var crítica.
import { z } from 'zod'

const schema = z.object({
  NODE_ENV:               z.enum(['development', 'test', 'production']).default('development'),
  PORT:                   z.coerce.number().int().default(3001),

  DATABASE_URL:           z.string().min(1, 'DATABASE_URL obrigatória'),

  JWT_SECRET:             z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 chars').default(
                            'dev_only_jwt_secret_change_me_change_me_now_64chars_at_least'),
  JWT_EXPIRES_IN:         z.string().default('15m'),  // access token curto
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),  // refresh longo

  CORS_ORIGIN:            z.string().default('http://localhost'),

  // Cookie domain compartilhado entre subdomínios (ex: ".miami.test").
  // Se vazio, cookie só vale pro host exato da request (default do Express).
  COOKIE_DOMAIN:          z.string().optional(),

  // SameSite do cookie de auth. "lax" (default) pra dev e prod com mesmo
  // domínio. "none" pra cross-site (ex: loja em vercel.app + api em railway.app),
  // mas exige HTTPS (forçamos Secure=true junto).
  COOKIE_SAMESITE:        z.enum(['lax', 'none', 'strict']).default('lax'),

  // URL pública da API (usado em buildResetUrl quando Origin não veio).
  // Em prod aponta pro Railway; em dev fica vazio e cai no http://miami.test.
  PUBLIC_API_URL:         z.string().url().optional(),

  MERCADOPAGO_TOKEN:        z.string().optional(),
  MERCADOPAGO_PUBLIC_KEY:   z.string().optional(),
  // Secret pra validar HMAC do webhook (configurado em "Suas integrações" no
  // painel MP). Se vazio, webhook aceita sem verificação (dev). Em prod, sempre.
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),

  SHIPPING_ORIGIN_CEP:    z.string().default('01310-100'),
  SHIPPING_FLAT_RATE:     z.coerce.number().default(15.00),

  WHATSAPP_NUMBER:        z.string().optional(),

  // Seed (admin inicial). SEED_ADMIN_PASSWORD SEM default — se não vier,
  // o seed pula a criação do admin e loga warning. Default antigo
  // ('miami2026') vazou no pentest 2026-04-26.
  SEED_ADMIN_EMAIL:       z.string().email().default('admin@miami.store'),
  SEED_ADMIN_PASSWORD:    z.string().min(10).optional(),
  SEED_ADMIN_NAME:        z.string().default('Admin Miami Store'),
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
