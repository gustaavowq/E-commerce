// Env validado via Zod — falha rápido no boot se faltar var crítica.
// Memória 30-LICOES/01: JWT_SECRET tem default só em dev/test, mas validamos
// que não vaze pra prod via check explícito no boot.
import { z } from 'zod'

const schema = z.object({
  NODE_ENV:               z.enum(['development', 'test', 'production']).default('development'),
  PORT:                   z.coerce.number().int().default(8211),
  LOG_LEVEL:              z.enum(['fatal','error','warn','info','debug','trace']).default('info'),

  DATABASE_URL:           z.string().min(1, 'DATABASE_URL obrigatória'),

  // Mínimo 32 chars cada. Default só pra dev — checamos em prod abaixo.
  JWT_SECRET:             z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 chars').default(
                            'dev_only_jwt_secret_change_me_change_me_now_64chars_at_least_okay'),
  JWT_REFRESH_SECRET:     z.string().min(32, 'JWT_REFRESH_SECRET deve ter pelo menos 32 chars').default(
                            'dev_only_jwt_refresh_secret_change_me_change_me_now_64chars_okay'),
  JWT_EXPIRES_IN:         z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGIN:            z.string().default('http://localhost:3000'),

  // Cookie. Em prod (single-domain marquesa.gustavo.agenciaever.cloud), deixar vazio
  // pra usar host exato. NÃO setar a menos que precise compartilhar entre subdomínios.
  COOKIE_DOMAIN:          z.string().optional().transform(v => v?.trim() ? v.trim() : undefined),
  COOKIE_SAMESITE:        z.enum(['lax', 'none', 'strict']).default('lax'),
  COOKIE_SECURE:          z.coerce.boolean().default(false),

  PUBLIC_API_URL:         z.string().optional()
                            .transform(v => v?.trim() ? v.trim() : undefined),
  PUBLIC_WEB_URL:         z.string().url().default('http://localhost:3000'),

  // MercadoPago — Pix preferencial pro sinal de reserva.
  // String vazia em .env vira undefined (cai no mock em dev).
  MERCADOPAGO_ACCESS_TOKEN:   z.string().optional()
                                .transform(v => v?.trim() ? v.trim() : undefined),
  MERCADOPAGO_PUBLIC_KEY:     z.string().optional()
                                .transform(v => v?.trim() ? v.trim() : undefined),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional()
                                .transform(v => v?.trim() ? v.trim() : undefined),

  // Configurações de negócio (alinhado com pesquisa de nicho + microcopy)
  SINAL_DEFAULT_PERCENT:  z.coerce.number().int().min(1).max(20).default(5),
  RESERVA_DURACAO_DIAS:   z.coerce.number().int().min(1).max(60).default(10),

  // Seed. Strings vazias são tratadas como ausentes (string vazia em .env é normal).
  SEED_ADMIN_EMAIL:       z.string().email().default('admin@marquesa.dev'),
  SEED_ADMIN_PASSWORD:    z.string().optional()
                            .transform(v => (v && v.length >= 8) ? v : undefined),
  SEED_ADMIN_NAME:        z.string().default('Admin Marquesa'),

  SEED_CLIENTE_EMAIL:     z.string().email().default('cliente@marquesa.dev'),
  SEED_CLIENTE_PASSWORD:  z.string().optional()
                            .transform(v => (v && v.length >= 8) ? v : undefined),
  SEED_CLIENTE_NAME:      z.string().default('Cliente Demo'),

  WHATSAPP_NUMBER:        z.string().optional()
                            .transform(v => v?.trim() ? v.trim() : undefined),
  CONTACT_EMAIL:          z.string().optional()
                            .transform(v => v?.trim() ? v.trim() : undefined),
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

// Anti-vazamento: nunca rodar prod com secret default
if (isProd) {
  if (env.JWT_SECRET.startsWith('dev_only_')) {
    console.error('[env] JWT_SECRET ainda é o default de dev — TROCA antes de subir prod')
    process.exit(1)
  }
  if (env.JWT_REFRESH_SECRET.startsWith('dev_only_')) {
    console.error('[env] JWT_REFRESH_SECRET ainda é o default de dev — TROCA antes de subir prod')
    process.exit(1)
  }
}
