// PC Builder — endpoints de checagem de compatibilidade e recomendação de PSU.
//
// POST /api/builder/check-compatibility
//   body: { parts: { cpuId, moboId, ramIds[], gpuId, psuId, caseId, coolerId, storageIds[] } }
//   returns: { status, issues[], totalWattage, recommendedPsuWattage, parts }
//
// POST /api/builder/recommend-psu
//   body: { parts: {...}, limit?: number }
//   returns: { totalWattage, recommendedWattage, suggestions: [{...}] }
//
// Endpoints públicos. Cliente novato deve poder testar build sem conta —
// só precisa logar pra SALVAR o build (rota /api/builds).
import { Router } from 'express'
import { ok, errors } from '../lib/api-response.js'
import { checkBuildCompatibility, recommendPsus } from '../lib/compatibility.js'
import { checkCompatibilitySchema, recommendPsuSchema } from '../validators/builder.js'

export const builderRouter: Router = Router()

builderRouter.post('/check-compatibility', async (req, res, next) => {
  try {
    const body = checkCompatibilitySchema.parse(req.body)
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

    // Resposta enxuta — não devolve `parts` completo (peso de banda) só os IDs validados
    return ok(res, {
      status:                result.status,
      isValid:               result.status !== 'error',
      issues:                result.issues,
      totalWattage:          result.totalWattage,
      recommendedPsuWattage: result.recommendedPsuWattage,
      partsLoaded: {
        cpu:    result.parts.cpu?.id    ?? null,
        mobo:   result.parts.mobo?.id   ?? null,
        gpu:    result.parts.gpu?.id    ?? null,
        psu:    result.parts.psu?.id    ?? null,
        case_:  result.parts.case_?.id  ?? null,
        cooler: result.parts.cooler?.id ?? null,
        rams:     result.parts.rams.map(r => r.id),
        storages: result.parts.storages.map(s => s.id),
      },
    })
  } catch (err) { next(err) }
})

builderRouter.post('/recommend-psu', async (req, res, next) => {
  try {
    const body = recommendPsuSchema.parse(req.body)
    const result = await recommendPsus({
      cpuId:      body.parts.cpuId      ?? null,
      moboId:     body.parts.moboId     ?? null,
      ramIds:     body.parts.ramIds     ?? [],
      gpuId:      body.parts.gpuId      ?? null,
      caseId:     body.parts.caseId     ?? null,
      coolerId:   body.parts.coolerId   ?? null,
      storageIds: body.parts.storageIds ?? [],
    }, { limit: body.limit })

    if (result.suggestions.length === 0) {
      throw errors.notFound(`Nenhuma fonte de pelo menos ${result.recommendedWattage}W disponível no catálogo`)
    }
    return ok(res, result)
  } catch (err) { next(err) }
})

// GET /api/builder/parts/:category — atalho pra listar peças de uma categoria
// já filtradas por compatibilidade com peças JÁ selecionadas. Ex: cliente
// escolheu Ryzen 9 7950X (AM5) → pede mobos compatíveis → backend retorna só
// mobos AM5 em estoque.
builderRouter.get('/parts/:category', async (req, res, next) => {
  try {
    const { prisma } = await import('../lib/prisma.js')
    const category = String(req.params.category)
    const validCategories = ['cpu', 'mobo', 'ram', 'gpu', 'psu', 'case', 'cooler', 'storage']
    if (!validCategories.includes(category)) {
      throw errors.badRequest(`Categoria inválida. Use: ${validCategories.join(', ')}`)
    }

    // Filtros opcionais via query (string keys do JSON compatibility)
    // Ex: GET /api/builder/parts/mobo?socket=AM5
    // Não cobrimos todas as combinações — front pode filtrar client-side.
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        hardwareCategory: category,
        variations: { some: { stock: { gt: 0 } } },
      },
      orderBy: { basePrice: 'asc' },
      select: {
        id: true, slug: true, name: true,
        basePrice: true, comparePrice: true,
        compatibility: true, specs: true,
        brand:    { select: { id: true, slug: true, name: true } },
        images: { where: { isPrimary: true }, take: 1, select: { url: true, alt: true } },
        variations: { where: { isActive: true }, select: { stock: true } },
      },
    })

    return ok(res, products.map(p => ({
      id:           p.id,
      slug:         p.slug,
      name:         p.name,
      basePrice:    Number(p.basePrice),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      compatibility: p.compatibility ?? null,
      specs:        p.specs ?? null,
      brand:        p.brand,
      primaryImage: p.images[0] ?? null,
      totalStock:   p.variations.reduce((acc, v) => acc + v.stock, 0),
    })))
  } catch (err) { next(err) }
})
