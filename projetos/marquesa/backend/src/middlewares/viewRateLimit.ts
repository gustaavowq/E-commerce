// Rate limit pro endpoint POST /api/imoveis/:slug/view.
// In-memory (Map) — suficiente pra 1 instância. Janela: 30min por IP+slug.
//
// Pré-requisito: app.set('trust proxy', 1) já é setado em src/index.ts (req.ip
// reflete o IP real do cliente atrás do nginx/Vercel/Railway).
//
// Comportamento: se o mesmo IP+slug já contou view nos últimos 30min, devolve
// 204 silenciosamente sem chamar o handler (não incrementa nem reporta erro).
//
// Cleanup: quando o cache passa de 10k entradas, limpa as expiradas em batch.
// Aceitável pro volume previsto (1 view/session).
//
// Limitações conhecidas:
//  - reset ao reiniciar o backend (intencional — perda mínima)
//  - não compartilha estado entre instâncias horizontais. Quando a Marquesa for
//    pra Railway com replicas, trocar pelo Redis (mantém mesma assinatura).

import type { Request, Response, NextFunction } from 'express'
import { noContent } from '../lib/api-response.js'

const cache = new Map<string, number>()  // key: `${ip}:${slug}`, value: epoch ms da última view contada
const TTL_MS = 30 * 60 * 1000             // 30min
const MAX_ENTRIES = 10_000

export function viewRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const slug = String(req.params.slug ?? '').trim()
  const ip   = req.ip ?? 'unknown'
  if (!slug) return next()

  const key  = `${ip}:${slug}`
  const now  = Date.now()
  const last = cache.get(key)

  if (last !== undefined && now - last < TTL_MS) {
    // Throttled — front não precisa saber, devolve 204 igual quando incrementa.
    noContent(res)
    return
  }

  cache.set(key, now)

  // Cleanup oportunista pra não vazar memória em servidores de longa vida.
  if (cache.size > MAX_ENTRIES) {
    for (const [k, v] of cache) {
      if (now - v > TTL_MS) cache.delete(k)
    }
  }

  next()
}
