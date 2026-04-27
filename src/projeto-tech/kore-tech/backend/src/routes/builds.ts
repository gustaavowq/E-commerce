// PC Builds salvos. Logged user pode salvar builds da ferramenta /montar
// pra acessar depois. shareSlug torna o build acessível via /api/builds/share/:slug
// (público, pra compartilhar com amigo).
import { Router } from 'express'
import crypto from 'node:crypto'
import { prisma } from '../lib/prisma.js'
import { ok, created, errors, noContent } from '../lib/api-response.js'
import { requireAuth, extractUser } from '../middleware/auth.js'
import { buildSaveSchema, buildUpdateSchema } from '../validators/builder.js'
import { checkBuildCompatibility } from '../lib/compatibility.js'

export const buildsRouter: Router = Router()

function makeShareSlug(): string {
  return crypto.randomBytes(6).toString('base64url').toLowerCase()
}

// =====================================================================
// GET /api/builds/share/:slug — público (qualquer um abre o link)
// =====================================================================
buildsRouter.get('/share/:slug', async (req, res, next) => {
  try {
    const build = await prisma.pCBuild.findUnique({
      where: { shareSlug: req.params.slug },
      select: {
        id: true, name: true, parts: true, totalPrice: true, totalWattage: true,
        compatibilityStatus: true, isPublic: true, shareSlug: true,
        createdAt: true,
        owner: { select: { name: true } },
      },
    })
    if (!build) throw errors.notFound('Build não encontrado')
    if (!build.isPublic) throw errors.forbidden('Build não é público')
    return ok(res, {
      ...build,
      totalPrice: Number(build.totalPrice),
      ownerName:  build.owner?.name ?? 'Anônimo',
    })
  } catch (err) { next(err) }
})

// =====================================================================
// GET /api/builds — lista builds do user logado
// =====================================================================
buildsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const builds = await prisma.pCBuild.findMany({
      where: { ownerId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    })
    return ok(res, builds.map(b => ({
      id:             b.id,
      name:           b.name,
      parts:          b.parts,
      totalPrice:     Number(b.totalPrice),
      totalWattage:   b.totalWattage,
      compatibilityStatus: b.compatibilityStatus,
      isPublic:       b.isPublic,
      shareSlug:      b.shareSlug,
      shareUrl:       b.shareSlug ? `/builds/share/${b.shareSlug}` : null,
      createdAt:      b.createdAt,
      updatedAt:      b.updatedAt,
    })))
  } catch (err) { next(err) }
})

// =====================================================================
// GET /api/builds/:id — detalhe de um build (próprio user ou se isPublic)
// =====================================================================
buildsRouter.get('/:id', extractUser, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const build = await prisma.pCBuild.findUnique({ where: { id } })
    if (!build) throw errors.notFound('Build não encontrado')

    const isOwner = req.user?.id && build.ownerId === req.user.id
    if (!isOwner && !build.isPublic) throw errors.forbidden()

    return ok(res, {
      id:             build.id,
      name:           build.name,
      parts:          build.parts,
      totalPrice:     Number(build.totalPrice),
      totalWattage:   build.totalWattage,
      compatibilityStatus: build.compatibilityStatus,
      isPublic:       build.isPublic,
      shareSlug:      build.shareSlug,
      shareUrl:       build.shareSlug ? `/builds/share/${build.shareSlug}` : null,
      createdAt:      build.createdAt,
      updatedAt:      build.updatedAt,
    })
  } catch (err) { next(err) }
})

// =====================================================================
// POST /api/builds — cria/salva build
// =====================================================================
buildsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const body = buildSaveSchema.parse(req.body)

    // Roda check de compatibilidade pra calcular totalPrice + status
    const result = await checkBuildCompatibility({
      cpuId:      body.parts.cpuId      ?? null,
      moboId:     body.parts.moboId     ?? null,
      ramIds:     body.parts.ramIds     ?? [],
      gpuId:      body.parts.gpuId      ?? null,
      psuId:      body.parts.psuId      ?? null,
      caseId:     body.parts.caseId     ?? null,
      coolerId:   body.parts.coolerId   ?? null,
      storageIds: body.parts.storageIds ?? [],
    })

    const totalPrice =
      (result.parts.cpu?.basePrice    ?? 0) +
      (result.parts.mobo?.basePrice   ?? 0) +
      (result.parts.gpu?.basePrice    ?? 0) +
      (result.parts.psu?.basePrice    ?? 0) +
      (result.parts.case_?.basePrice  ?? 0) +
      (result.parts.cooler?.basePrice ?? 0) +
      result.parts.rams.reduce((s, p) => s + p.basePrice, 0) +
      result.parts.storages.reduce((s, p) => s + p.basePrice, 0)

    const build = await prisma.pCBuild.create({
      data: {
        ownerId:    req.user!.id,
        name:       body.name ?? 'Meu PC',
        parts:      body.parts,
        totalPrice,
        totalWattage: result.totalWattage,
        compatibilityStatus: result.status,
        isPublic:   body.isPublic,
        shareSlug:  body.isPublic ? makeShareSlug() : null,
      },
    })

    return created(res, {
      id:             build.id,
      name:           build.name,
      parts:          build.parts,
      totalPrice:     Number(build.totalPrice),
      totalWattage:   build.totalWattage,
      compatibilityStatus: build.compatibilityStatus,
      isPublic:       build.isPublic,
      shareSlug:      build.shareSlug,
      shareUrl:       build.shareSlug ? `/builds/share/${build.shareSlug}` : null,
    })
  } catch (err) { next(err) }
})

// =====================================================================
// PATCH /api/builds/:id — atualiza
// =====================================================================
buildsRouter.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const body = buildUpdateSchema.parse(req.body)
    const id = String(req.params.id ?? '')
    const existing = await prisma.pCBuild.findUnique({ where: { id } })
    if (!existing || existing.ownerId !== req.user!.id) throw errors.notFound('Build não encontrado')

    const data: Parameters<typeof prisma.pCBuild.update>[0]['data'] = {}
    if (body.name !== undefined) data.name = body.name
    if (body.isPublic !== undefined) {
      data.isPublic = body.isPublic
      if (body.isPublic && !existing.shareSlug) data.shareSlug = makeShareSlug()
    }
    if (body.parts !== undefined) {
      const result = await checkBuildCompatibility({
        cpuId:      body.parts.cpuId      ?? null,
        moboId:     body.parts.moboId     ?? null,
        ramIds:     body.parts.ramIds     ?? [],
        gpuId:      body.parts.gpuId      ?? null,
        psuId:      body.parts.psuId      ?? null,
        caseId:     body.parts.caseId     ?? null,
        coolerId:   body.parts.coolerId   ?? null,
        storageIds: body.parts.storageIds ?? [],
      })
      data.parts = body.parts
      data.totalWattage = result.totalWattage
      data.compatibilityStatus = result.status
      data.totalPrice =
        (result.parts.cpu?.basePrice    ?? 0) +
        (result.parts.mobo?.basePrice   ?? 0) +
        (result.parts.gpu?.basePrice    ?? 0) +
        (result.parts.psu?.basePrice    ?? 0) +
        (result.parts.case_?.basePrice  ?? 0) +
        (result.parts.cooler?.basePrice ?? 0) +
        result.parts.rams.reduce((s, p) => s + p.basePrice, 0) +
        result.parts.storages.reduce((s, p) => s + p.basePrice, 0)
    }

    const updated = await prisma.pCBuild.update({ where: { id: existing.id }, data })
    return ok(res, {
      ...updated,
      totalPrice: Number(updated.totalPrice),
      shareUrl:   updated.shareSlug ? `/builds/share/${updated.shareSlug}` : null,
    })
  } catch (err) { next(err) }
})

// =====================================================================
// DELETE /api/builds/:id
// =====================================================================
buildsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id ?? '')
    const existing = await prisma.pCBuild.findUnique({ where: { id } })
    if (!existing || existing.ownerId !== req.user!.id) throw errors.notFound('Build não encontrado')
    await prisma.pCBuild.delete({ where: { id: existing.id } })
    return noContent(res)
  } catch (err) { next(err) }
})
