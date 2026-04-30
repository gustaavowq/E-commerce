// Rotas públicas de imóveis (catálogo + detalhe).
// Filtros: tipo, status, preco, quartos, bairro, cidade, search.
import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { ok, errors, noContent } from '../lib/api-response.js'
import { listImoveisQuerySchema } from '../validators/imovel.js'
import { viewRateLimiter } from '../middlewares/viewRateLimit.js'

export const imoveisRouter: Router = Router()

// GET /api/imoveis — listagem pública com filtros + paginação
imoveisRouter.get('/', async (req, res, next) => {
  try {
    const q = listImoveisQuerySchema.parse(req.query)

    const where: Prisma.ImovelWhereInput = {
      // Por default, só DISPONIVEL e RESERVADO. INATIVO/VENDIDO ficam ocultos.
      // Se filtro de status veio explícito, respeita.
      status: q.status
        ? q.status
        : { in: ['DISPONIVEL', 'RESERVADO', 'EM_NEGOCIACAO'] },
      ...(q.tipo ? { tipo: q.tipo } : {}),
      ...(q.bairro ? { bairro: { contains: q.bairro, mode: 'insensitive' } } : {}),
      ...(q.cidade ? { cidade: { contains: q.cidade, mode: 'insensitive' } } : {}),
      ...(q.estado ? { estado: q.estado.toUpperCase() } : {}),
      ...(q.quartosMin !== undefined ? { quartos: { gte: q.quartosMin } } : {}),
      ...(q.destaque !== undefined ? { destaque: q.destaque } : {}),
      ...((q.precoMin !== undefined || q.precoMax !== undefined)
        ? { preco: {
            ...(q.precoMin !== undefined ? { gte: q.precoMin } : {}),
            ...(q.precoMax !== undefined ? { lte: q.precoMax } : {}),
          } }
        : {}),
      ...(q.search
        ? {
            OR: [
              { titulo:    { contains: q.search, mode: 'insensitive' } },
              { descricao: { contains: q.search, mode: 'insensitive' } },
              { bairro:    { contains: q.search, mode: 'insensitive' } },
              { cidade:    { contains: q.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const orderBy: Prisma.ImovelOrderByWithRelationInput =
        q.sort === 'precoAsc'  ? { preco: 'asc' }
      : q.sort === 'precoDesc' ? { preco: 'desc' }
      : q.sort === 'areaDesc'  ? { area: 'desc' }
      : { createdAt: 'desc' }

    const [total, items] = await Promise.all([
      prisma.imovel.count({ where }),
      prisma.imovel.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select: imovelListSelect,
      }),
    ])

    return ok(res, items, {
      page:       q.page,
      limit:      q.limit,
      total,
      totalPages: Math.ceil(total / q.limit) || 1,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/imoveis/:slug — detalhe público
imoveisRouter.get('/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug ?? '').trim()
    if (!slug) throw errors.badRequest('slug obrigatório')

    const imovel = await prisma.imovel.findUnique({
      where: { slug },
      select: imovelDetailSelect,
    })
    if (!imovel) throw errors.notFound('Imóvel não encontrado')
    if (imovel.status === 'INATIVO') throw errors.notFound('Imóvel não encontrado')

    return ok(res, imovel)
  } catch (err) {
    next(err)
  }
})

// =====================================================================
// POST /api/imoveis/:slug/view — pingback público de visualização (PDP).
// Usado pelo Data-Analyst pra calcular funil topo (visitas → leads → reservas)
// e ranking de engajamento. Frontend chama 1x por session (debounced no cliente).
// Rate limit: 1 view contada por IP+slug a cada 30min.
// =====================================================================
imoveisRouter.post('/:slug/view', viewRateLimiter, async (req, res, next) => {
  try {
    const slug = String(req.params.slug ?? '').trim()
    if (!slug) throw errors.badRequest('slug obrigatório')

    const imovel = await prisma.imovel.findUnique({
      where: { slug },
      select: { id: true, status: true },
    })
    if (!imovel) throw errors.notFound('Imóvel não encontrado')
    // INATIVO não conta — produto invisível pro front, ping aqui é abuso/scraping.
    if (imovel.status === 'INATIVO') throw errors.notFound('Imóvel não encontrado')

    const now = new Date()
    await prisma.imovel.update({
      where: { id: imovel.id },
      data: {
        viewCount:         { increment: 1 },
        lastViewedAt:      now,
        lastInteractionAt: now,
      },
    })

    return noContent(res)
  } catch (err) {
    next(err)
  }
})

// ----- Selects compartilhados -----
const imovelListSelect = {
  id: true, slug: true, titulo: true, tipo: true, status: true,
  preco: true, precoSinal: true,
  area: true, quartos: true, suites: true, banheiros: true, vagas: true,
  endereco: true, bairro: true, cidade: true, estado: true,
  fotos: true, destaque: true, novidade: true,
  createdAt: true,
} satisfies Prisma.ImovelSelect

const imovelDetailSelect = {
  ...imovelListSelect,
  descricao: true, areaTotal: true, cep: true,
  latitude: true, longitude: true,
  videoUrl: true, tourUrl: true,
  iptuAnual: true, condominio: true,
  amenidades: true, updatedAt: true,
} satisfies Prisma.ImovelSelect
