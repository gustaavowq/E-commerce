// CRUD de imóveis (admin). ANALYST tem só leitura — bloqueamos write abaixo.
import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma.js'
import { ok, created, noContent, errors } from '../../lib/api-response.js'
import { requireRole } from '../../middlewares/auth.js'
import {
  imovelWriteSchema, imovelPatchSchema, listImoveisQuerySchema,
} from '../../validators/imovel.js'
import { env } from '../../config/env.js'

export const adminImoveisRouter: Router = Router()

// GET /api/admin/imoveis — lista TODOS os imóveis (incl. INATIVO/VENDIDO)
adminImoveisRouter.get('/', async (req, res, next) => {
  try {
    const q = listImoveisQuerySchema.parse(req.query)

    const where: Prisma.ImovelWhereInput = {
      ...(q.tipo ? { tipo: q.tipo } : {}),
      ...(q.status ? { status: q.status } : {}),
      ...(q.bairro ? { bairro: { contains: q.bairro, mode: 'insensitive' } } : {}),
      ...(q.cidade ? { cidade: { contains: q.cidade, mode: 'insensitive' } } : {}),
      ...(q.search
        ? {
            OR: [
              { titulo:   { contains: q.search, mode: 'insensitive' } },
              { slug:     { contains: q.search, mode: 'insensitive' } },
              { bairro:   { contains: q.search, mode: 'insensitive' } },
              { cidade:   { contains: q.search, mode: 'insensitive' } },
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
        include: {
          _count: { select: { reservas: true, leads: true } },
        },
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

// GET /api/admin/imoveis/:id
adminImoveisRouter.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        reservas: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        leads: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!imovel) throw errors.notFound('Imóvel não encontrado')
    return ok(res, imovel)
  } catch (err) {
    next(err)
  }
})

// POST /api/admin/imoveis — criar (ADMIN-only)
adminImoveisRouter.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const body = imovelWriteSchema.parse(req.body)

    const precoSinal = body.precoSinal ?? Number((body.preco * env.SINAL_DEFAULT_PERCENT / 100).toFixed(2))

    const imovel = await prisma.imovel.create({
      data: {
        slug:       body.slug,
        titulo:     body.titulo,
        descricao:  body.descricao,
        tipo:       body.tipo,
        status:     body.status ?? 'DISPONIVEL',
        preco:      body.preco,
        precoSinal,
        area:       body.area,
        areaTotal:  body.areaTotal,
        quartos:    body.quartos,
        suites:     body.suites,
        banheiros:  body.banheiros,
        vagas:      body.vagas,
        endereco:   body.endereco,
        bairro:     body.bairro,
        cidade:     body.cidade,
        estado:     body.estado.toUpperCase(),
        cep:        body.cep,
        latitude:   body.latitude,
        longitude:  body.longitude,
        fotos:      body.fotos,
        videoUrl:   body.videoUrl,
        tourUrl:    body.tourUrl,
        destaque:   body.destaque,
        novidade:   body.novidade,
        iptuAnual:  body.iptuAnual,
        condominio: body.condominio,
        amenidades: body.amenidades,
      },
    })
    return created(res, imovel)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/admin/imoveis/:id — editar (ADMIN-only)
adminImoveisRouter.patch('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const body = imovelPatchSchema.parse(req.body)

    // Se preço mudou e precoSinal não foi enviado, recalcula
    let precoSinal = body.precoSinal
    if (body.preco !== undefined && precoSinal === undefined) {
      precoSinal = Number((body.preco * env.SINAL_DEFAULT_PERCENT / 100).toFixed(2))
    }

    const imovel = await prisma.imovel.update({
      where: { id },
      data: {
        ...body,
        ...(body.estado ? { estado: body.estado.toUpperCase() } : {}),
        ...(precoSinal !== undefined ? { precoSinal } : {}),
      },
    })
    return ok(res, imovel)
  } catch (err) {
    next(err)
  }
})

// DELETE /api/admin/imoveis/:id — soft delete (ADMIN-only) → INATIVO
adminImoveisRouter.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')

    // Não pode "deletar" um imóvel com reserva ATIVA — liberar antes
    const ativa = await prisma.reserva.findFirst({
      where: { imovelId: id, status: 'ATIVA' },
    })
    if (ativa) throw errors.conflict('Imóvel tem reserva ATIVA. Cancele a reserva antes.')

    await prisma.imovel.update({
      where: { id },
      data:  { status: 'INATIVO' },
    })
    return noContent(res)
  } catch (err) {
    next(err)
  }
})
