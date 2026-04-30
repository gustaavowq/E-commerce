// Rate limiters reutilizáveis. Memória: precisa app.set('trust proxy', 1).
import rateLimit from 'express-rate-limit'

// Rate limit global (100 req/min/IP)
export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Muitas requisições, tenta de novo daqui um instante' },
  },
})

// Rate limit auth (5/min/IP no login — anti brute-force)
export const authLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Muitas tentativas de login, espera 1 minuto' },
  },
})

// Rate limit forgot-password (5/h/IP)
export const forgotLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Muitas tentativas, espera uma hora' },
  },
})
