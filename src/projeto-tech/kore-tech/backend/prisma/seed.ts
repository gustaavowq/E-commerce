/**
 * Kore Tech — Seed inicial.
 *
 * Cria, idempotentemente:
 *   - 1 ADMIN (credenciais via env SEED_ADMIN_*)
 *   - 8 personas (Valorant 240fps, Fortnite competitivo, CS2 high-tier,
 *                 Edição vídeo 4K, Streaming, IA local Llama, Workstation 3D,
 *                 Entry gamer)
 *   - Marcas: AMD, Intel, NVIDIA, ASUS, MSI, Corsair, Kingston, Samsung,
 *             Cooler Master, NZXT, EVGA, Logitech, Razer, LG, BenQ, Kore
 *   - Categorias técnicas (cpu, gpu, mobo, ram, psu, case, cooler, storage,
 *     pc_full, monitor, mouse, teclado, headset)
 *   - ~30 componentes reais com `compatibility` JSON correto:
 *       * 5 CPUs (mix AM5 + LGA1700)
 *       * 5 GPUs (RTX 4060 → 5080)
 *       * 5 Mobos (B650, X670E, Z790, B760)
 *       * 5 RAMs DDR5 (várias velocidades)
 *       * 4 PSUs (550 → 1000W)
 *       * 4 Gabinetes (mATX/ATX/E-ATX)
 *       * 2 Coolers (air + AIO)
 *   - 8 PCs montados (1 por persona) com benchmarkFps curado
 *   - 5 monitores
 *   - 5 periféricos
 *   - 5 cupons MVP (BEMVINDO5, PIXFIRST, BUILDER10, COMBO15, FRETE15)
 *   - 7 regras de compatibilidade (CompatibilityRule)
 *
 * Idempotente: rodar várias vezes não duplica (upsert por slug/email/code).
 *
 * Como rodar (dentro do container):
 *   docker exec -it kore-tech-backend npm run prisma:seed
 *
 * Como rodar local:
 *   SEED_ADMIN_PASSWORD='senha-forte-min-10' npm run prisma:seed
 */

import { Prisma, PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// =============================================================================
// 1) ADMIN — senha SEMPRE via env (lição #10 — sem placeholder default)
// =============================================================================
async function seedAdmin() {
  const email    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@kore.tech'
  const password = process.env.SEED_ADMIN_PASSWORD
  const name     = process.env.SEED_ADMIN_NAME     ?? 'Admin Kore Tech'

  if (!password || password.length < 10) {
    console.warn('⚠ SEED_ADMIN_PASSWORD ausente ou < 10 chars — admin NÃO criado.')
    console.warn('  Defina SEED_ADMIN_PASSWORD no .env e rode `npm run prisma:seed` de novo.')
    return null
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where:  { email },
    create: { email, name, passwordHash, role: 'ADMIN' },
    update: { name, role: 'ADMIN' },
  })

  console.log(`✔ Admin: ${admin.email} (id=${admin.id})`)
  console.log(`  Senha: definida via SEED_ADMIN_PASSWORD (não logada).`)
  return admin
}

// =============================================================================
// 2) STORE SETTINGS — singleton id="default"
// =============================================================================
async function seedStoreSettings() {
  const settings = await prisma.storeSettings.upsert({
    where:  { id: 'default' },
    create: {
      id: 'default',
      storeName: 'Kore Tech',
      storeTagline: 'Monte certo. Jogue alto.',
      whatsappNumber: '5511999999999',
      whatsappMessage: 'Oi! Vi um produto no site da Kore Tech e queria tirar uma dúvida.',
      pixDiscountPercent: 5,
      shippingFlatRate: new Prisma.Decimal(45.00),
      freeShippingMinValue: new Prisma.Decimal(5000.00),
    },
    update: {},
  })
  console.log(`✔ Store settings: ${settings.storeName}`)
  return settings
}

// =============================================================================
// 3) BRANDS
// =============================================================================
async function seedBrands() {
  const data = [
    { slug: 'amd',           name: 'AMD',                 sortOrder: 1 },
    { slug: 'intel',         name: 'Intel',               sortOrder: 2 },
    { slug: 'nvidia',        name: 'NVIDIA',              sortOrder: 3 },
    { slug: 'asus',          name: 'ASUS',                sortOrder: 4 },
    { slug: 'msi',           name: 'MSI',                 sortOrder: 5 },
    { slug: 'gigabyte',      name: 'Gigabyte',            sortOrder: 6 },
    { slug: 'corsair',       name: 'Corsair',             sortOrder: 7 },
    { slug: 'kingston',      name: 'Kingston',            sortOrder: 8 },
    { slug: 'samsung',       name: 'Samsung',             sortOrder: 9 },
    { slug: 'cooler-master', name: 'Cooler Master',       sortOrder: 10 },
    { slug: 'nzxt',          name: 'NZXT',                sortOrder: 11 },
    { slug: 'evga',          name: 'EVGA',                sortOrder: 12 },
    { slug: 'lian-li',       name: 'Lian Li',             sortOrder: 13 },
    { slug: 'logitech',      name: 'Logitech',            sortOrder: 14 },
    { slug: 'razer',         name: 'Razer',               sortOrder: 15 },
    { slug: 'lg',            name: 'LG',                  sortOrder: 16 },
    { slug: 'benq',          name: 'BenQ',                sortOrder: 17 },
    { slug: 'kore',          name: 'Kore Tech',           sortOrder: 99 },
  ]
  const brands = await Promise.all(
    data.map(b => prisma.brand.upsert({
      where:  { slug: b.slug },
      create: b,
      update: { name: b.name, sortOrder: b.sortOrder, isActive: true },
    })),
  )
  console.log(`✔ Marcas: ${brands.length}`)
  return Object.fromEntries(brands.map(b => [b.slug, b]))
}

// =============================================================================
// 4) CATEGORIES (humanas/navegáveis)
// =============================================================================
async function seedCategories() {
  const data = [
    { slug: 'pc-gamer',          name: 'PCs Gamer',                 sortOrder: 1 },
    { slug: 'pc-workstation',    name: 'Workstations / IA',         sortOrder: 2 },
    { slug: 'processadores',     name: 'Processadores',             sortOrder: 3 },
    { slug: 'placas-de-video',   name: 'Placas de Vídeo',           sortOrder: 4 },
    { slug: 'placas-mae',        name: 'Placas-Mãe',                sortOrder: 5 },
    { slug: 'memoria-ram',       name: 'Memória RAM',               sortOrder: 6 },
    { slug: 'fontes',            name: 'Fontes',                    sortOrder: 7 },
    { slug: 'gabinetes',         name: 'Gabinetes',                 sortOrder: 8 },
    { slug: 'coolers',           name: 'Coolers',                   sortOrder: 9 },
    { slug: 'armazenamento',     name: 'Armazenamento (SSD/HD)',    sortOrder: 10 },
    { slug: 'monitores',         name: 'Monitores',                 sortOrder: 11 },
    { slug: 'perifericos',       name: 'Periféricos',               sortOrder: 12 },
  ]
  const cats = await Promise.all(
    data.map(c => prisma.category.upsert({
      where:  { slug: c.slug },
      create: c,
      update: { name: c.name, sortOrder: c.sortOrder, isActive: true },
    })),
  )
  console.log(`✔ Categorias: ${cats.length}`)
  return Object.fromEntries(cats.map(c => [c.slug, c]))
}

// =============================================================================
// 5) PERSONAS — 8 personas SEO landing
// =============================================================================
async function seedPersonas() {
  const data = [
    {
      slug: 'valorant-240fps',
      name: 'Valorant 240fps',
      headline: 'Builds pra travar 240 FPS no Valorant',
      subheadline: 'Mira firme, monitor 240Hz aproveitado de verdade.',
      description: 'Valorant pede mais CPU que GPU pra puxar 240 FPS estáveis. Foco em Ryzen 7 ou Core i5/i7 atual + RAM DDR5 6000 baixa latência. GPU mid-range já dá conta — invista no monitor 240Hz.',
      targetGames: ['Valorant', 'CS2', 'Apex Legends'],
      targetFps: { 'valorant_1080p_high': 240, 'cs2_1080p_high': 220 },
      iconEmoji: '🎯',
      sortOrder: 1,
      metaTitle: 'PC pra Valorant 240fps — builds prontos | Kore Tech',
      metaDesc:  'Builds testados pra travar 240 FPS no Valorant em 1080p high. CPU + RAM rápida + monitor 240Hz. Frete e parcelamento.',
    },
    {
      slug: 'fortnite-competitivo',
      name: 'Fortnite competitivo',
      headline: 'Builds pra Fortnite com FPS estável',
      subheadline: 'Build modes liso e edits sem stutter.',
      description: 'Fortnite competitivo escala bem com CPU + RAM. Roxo/épico em 1440p pede GPU mais forte (RTX 4070+). Performance-mode pede CPU e SSD rápidos.',
      targetGames: ['Fortnite', 'Apex Legends', 'Warzone'],
      targetFps: { 'fortnite_1440p_epic': 165, 'fortnite_1080p_perf': 360 },
      iconEmoji: '🏗️',
      sortOrder: 2,
      metaTitle: 'PC pra Fortnite competitivo — builds 1440p | Kore Tech',
      metaDesc:  'Builds curados pra Fortnite competitivo: 165 FPS em épico 1440p, 360 FPS em performance 1080p.',
    },
    {
      slug: 'cs2-high-tier',
      name: 'CS2 high-tier',
      headline: 'Builds pra CS2 alto nível',
      subheadline: 'Tickrate, pico baixo e refresh rate alto.',
      description: 'CS2 ganhou em fidelidade e perdeu em FPS bruto vs CSGO. Builds pra travar 200+ FPS em 1440p high pedem CPU forte (X3D ajuda muito) + GPU mid/high.',
      targetGames: ['CS2', 'Valorant', 'Rainbow Six Siege'],
      targetFps: { 'cs2_1440p_high': 220, 'cs2_1080p_high': 320 },
      iconEmoji: '🔫',
      sortOrder: 3,
      metaTitle: 'PC pra CS2 — builds com 220 FPS em 1440p | Kore Tech',
      metaDesc:  'Builds com Ryzen 7800X3D e RTX 4070+ pra rodar CS2 em 1440p high a 220 FPS estáveis.',
    },
    {
      slug: 'edicao-4k',
      name: 'Edição vídeo 4K',
      headline: 'Workstations pra editar vídeo 4K',
      subheadline: 'Premiere, DaVinci e After Effects sem travar.',
      description: 'Edição 4K pede CPU multicore (12+ núcleos), 64GB+ RAM, GPU com VRAM (12GB+) e SSD NVMe Gen4 pra cache. Foco em Ryzen 9 / Core i9 + RTX 4070 Ti+ + 64GB DDR5.',
      targetGames: [],
      targetFps: { 'davinci_4k_timeline': 60, 'premiere_4k_playback': 30 },
      iconEmoji: '🎬',
      sortOrder: 4,
      metaTitle: 'PC pra editar vídeo 4K — workstation | Kore Tech',
      metaDesc:  'Workstations curadas pra Premiere, DaVinci e AfterEffects em 4K. Ryzen 9 + 64GB DDR5 + GPU 12GB+.',
    },
    {
      slug: 'streaming',
      name: 'Streaming',
      headline: 'Builds pra streamar sem dropar frame',
      subheadline: 'Encode em GPU + CPU sobrando pro jogo.',
      description: 'Streamar pede 2 fluxos: jogo rodando alto + encode H.264/AV1. NVENC moderno (RTX 4060+) tira encode da CPU. Recomendamos CPU 8+ núcleos + GPU com NVENC novo + 32GB RAM.',
      targetGames: ['Valorant', 'GTA V', 'Apex Legends'],
      targetFps: { 'valorant_1080p_high_stream': 200, 'apex_1440p_high_stream': 120 },
      iconEmoji: '🎙️',
      sortOrder: 5,
      metaTitle: 'PC pra streamar jogos — encode NVENC | Kore Tech',
      metaDesc:  'Builds pra streamers: jogo + OBS rodando juntos sem dropar frame. NVENC dedicado e 32GB RAM.',
    },
    {
      slug: 'ia-local-llama',
      name: 'IA local Llama',
      headline: 'Workstations pra IA local (Llama 7B/70B)',
      subheadline: 'VRAM grande e RAM rápida pra rodar modelos offline.',
      description: 'Rodar Llama 7B pede 12GB+ VRAM, 70B pede 48GB+ VRAM (ou 64GB RAM com offload CPU). Foco em RTX 4090 / 5080 / 5090 + 64-128GB DDR5 + NVMe Gen5 pra weights.',
      targetGames: [],
      targetFps: { 'llama_7b_tokens_per_sec': 80, 'llama_70b_tokens_per_sec': 18 },
      iconEmoji: '🧠',
      sortOrder: 6,
      metaTitle: 'PC pra rodar Llama local — IA offline | Kore Tech',
      metaDesc:  'Workstations pra rodar LLM local (Llama 7B até 70B) com VRAM grande e RAM rápida. Configs do MVP ao top.',
    },
    {
      slug: 'workstation-3d',
      name: 'Workstation 3D',
      headline: 'Workstations pra Blender, Unreal e CAD',
      subheadline: 'Render rápido, viewport leve, RAM gigante.',
      description: 'Render 3D ama CPU multicore + GPU CUDA/OptiX. Blender e Unreal escalonam quase linear com núcleos. Build alvo: Ryzen 9 / Core i9 + RTX 4080+ + 64GB DDR5.',
      targetGames: [],
      targetFps: { 'blender_classroom_render_s': 20, 'unreal_lumen_viewport': 60 },
      iconEmoji: '🧊',
      sortOrder: 7,
      metaTitle: 'PC pra Blender / Unreal / CAD — workstation | Kore Tech',
      metaDesc:  'Workstations 3D curadas: render rápido, viewport leve. Ryzen 9 + RTX 4080+ + 64GB DDR5.',
    },
    {
      slug: 'entry-gamer',
      name: 'Entry gamer',
      headline: 'Primeiro PC gamer custo-benefício',
      subheadline: 'Roda os jogos atuais em 1080p sem travar.',
      description: 'Entry gamer 2026: Ryzen 5 ou Core i5 + RTX 4060 + 16GB DDR5 + SSD 1TB. Roda Fortnite, Valorant, Apex em 1080p high a 100+ FPS sem comprometer o orçamento.',
      targetGames: ['Fortnite', 'Valorant', 'Apex Legends', 'GTA V'],
      targetFps: { 'fortnite_1080p_high': 144, 'valorant_1080p_high': 220 },
      iconEmoji: '🎮',
      sortOrder: 8,
      metaTitle: 'Primeiro PC gamer custo-benefício 2026 | Kore Tech',
      metaDesc:  'Builds entry gamer: 1080p high a 100+ FPS nos jogos atuais. Custo-benefício honesto.',
    },
  ]
  const personas = await Promise.all(
    data.map(p => prisma.persona.upsert({
      where:  { slug: p.slug },
      create: { ...p, targetGames: p.targetGames as Prisma.InputJsonValue, targetFps: p.targetFps as Prisma.InputJsonValue },
      update: { ...p, targetGames: p.targetGames as Prisma.InputJsonValue, targetFps: p.targetFps as Prisma.InputJsonValue },
    })),
  )
  console.log(`✔ Personas: ${personas.length}`)
  return Object.fromEntries(personas.map(p => [p.slug, p]))
}

// =============================================================================
// 6) COMPATIBILITY RULES — 7 regras (não-hardcoded, admin pode editar)
// =============================================================================
async function seedCompatibilityRules() {
  const rules = [
    {
      id: 'rule-socket-match',
      ruleType: 'socket_match',
      severity: 'error',
      message: 'CPU socket {cpuSocket} não compatível com a placa-mãe ({moboSocket}).',
      description: 'Verifica se o socket da CPU bate com o da placa-mãe. AM5 ↔ AM5, LGA1700 ↔ LGA1700, etc.',
      suggestion: { type: 'change_part', partType: 'mobo' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-psu-min-wattage',
      ruleType: 'psu_min_wattage',
      severity: 'error',
      message: 'Fonte de {psuW}W insuficiente. Recomendado mínimo {recommendedW}W.',
      description: 'Soma TDP de CPU + GPU + 150W headroom (placa, drives, fans). Compara com wattagem da fonte.',
      suggestion: { type: 'upgrade_psu' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-gpu-fits-case',
      ruleType: 'gpu_fits_case',
      severity: 'error',
      message: 'GPU de {gpuLengthMm}mm não cabe no gabinete (max {caseMaxGpuMm}mm).',
      description: 'Compara comprimento da GPU vs maxGpuLengthMm do gabinete.',
      suggestion: { type: 'change_part', partType: 'case' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-cooler-height-fits',
      ruleType: 'cooler_height_fits',
      severity: 'error',
      message: 'Cooler de {coolerHeightMm}mm não cabe no gabinete (max {caseMaxCoolerMm}mm).',
      description: 'Compara altura do cooler air vs maxCoolerHeightMm do gabinete (não vale pra AIO).',
      suggestion: { type: 'change_part', partType: 'cooler' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-ram-speed-supported',
      ruleType: 'ram_speed_supported',
      severity: 'warning',
      message: 'RAM {ramMhz}MHz acima do oficial da placa-mãe ({moboMaxMhz}MHz). Pode rodar em XMP/EXPO.',
      description: 'Mobo lista frequência máxima oficial; RAM acima disso roda só com XMP/EXPO ligado.',
      suggestion: { type: 'enable_xmp' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-ram-slots-count',
      ruleType: 'ram_slots_count',
      severity: 'error',
      message: 'Mais módulos de RAM ({ramSticks}) do que slots da placa ({moboSlots}).',
      description: 'Compara qtd de módulos vs slots disponíveis na mobo.',
      suggestion: { type: 'change_part', partType: 'ram' } as Prisma.InputJsonValue,
    },
    {
      id: 'rule-mobo-form-factor-fits',
      ruleType: 'mobo_form_factor_fits',
      severity: 'error',
      message: 'Placa-mãe {moboFF} não cabe em gabinete {caseFF}.',
      description: 'ATX só cabe em ATX/E-ATX. mATX cabe em mATX/ATX/E-ATX. ITX cabe em qualquer um.',
      suggestion: { type: 'change_part', partType: 'case' } as Prisma.InputJsonValue,
    },
  ]

  const created = await Promise.all(
    rules.map(r => prisma.compatibilityRule.upsert({
      where:  { id: r.id },
      create: r,
      update: { ...r },
    })),
  )
  console.log(`✔ Regras de compatibilidade: ${created.length}`)
  return created
}

// =============================================================================
// 7) PRODUCTS — 30 componentes + 8 PCs montados + 5 monitores + 5 periféricos
// =============================================================================
type SeedRefs = {
  brands:     Record<string, { id: string }>
  categories: Record<string, { id: string }>
  personas:   Record<string, { id: string; slug: string }>
}

type ProductSeedInput = {
  slug:             string
  name:             string
  description:      string
  basePrice:        number
  comparePrice?:    number | null
  brandSlug:        string
  categorySlug:     string
  buildType:        'componente' | 'pc_pronto' | 'monitor' | 'periferico'
  hardwareCategory: string
  personaSlug?:     string | null
  specs:            Record<string, unknown>
  compatibility:    Record<string, unknown>
  benchmarkFps?:    Record<string, number> | null
  weightGrams?:     number | null
  dimensionsMm?:    Record<string, number> | null
  warrantyMonths?:  number
  isFeatured?:      boolean
  tags?:            string[]
  // ProductVariation: pelo menos uma — uniqueKey de stock fica nela
  variations: Array<{
    sku:           string
    size:          string
    color?:        string
    colorHex?:     string | null
    stock:         number
    priceOverride?: number | null
  }>
  // Imagens (placeholder Cloudinary)
  imageUrl?: string
}

function buildPlaceholderImage(slug: string): string {
  // Placeholder Cloudinary — DevOps troca por upload real depois.
  // Mantemos previsível pelo slug pra testes.
  return `https://res.cloudinary.com/demo/image/upload/c_fill,w_1200,h_1200,q_auto,f_auto/v1/kore-tech/${slug}.jpg`
}

async function upsertProduct(input: ProductSeedInput, refs: SeedRefs) {
  const brand    = refs.brands[input.brandSlug]
  const category = refs.categories[input.categorySlug]
  if (!brand || !category) {
    throw new Error(`[seed] brand/category não encontrados pra ${input.slug}`)
  }

  const data = {
    slug:        input.slug,
    name:        input.name,
    description: input.description,
    basePrice:   new Prisma.Decimal(input.basePrice),
    comparePrice: input.comparePrice ? new Prisma.Decimal(input.comparePrice) : null,
    brandId:     brand.id,
    categoryId:  category.id,
    isActive:    true,
    isFeatured:  input.isFeatured ?? false,
    tags:        input.tags ?? [],
    buildType:   input.buildType,
    hardwareCategory: input.hardwareCategory,
    personaSlug: input.personaSlug ?? null,
    specs:         input.specs as Prisma.InputJsonValue,
    compatibility: input.compatibility as Prisma.InputJsonValue,
    benchmarkFps:  input.benchmarkFps ? (input.benchmarkFps as Prisma.InputJsonValue) : Prisma.JsonNull,
    weightGrams:   input.weightGrams ?? null,
    dimensionsMm:  input.dimensionsMm ? (input.dimensionsMm as Prisma.InputJsonValue) : Prisma.JsonNull,
    warrantyMonths: input.warrantyMonths ?? 12,
    metaTitle:     `${input.name} — Kore Tech`,
    metaDesc:      input.description.slice(0, 155),
  }

  const product = await prisma.product.upsert({
    where:  { slug: input.slug },
    create: data,
    update: data,
  })

  // Variações (idempotente por sku)
  for (const v of input.variations) {
    await prisma.productVariation.upsert({
      where:  { sku: v.sku },
      create: {
        productId: product.id,
        sku:       v.sku,
        size:      v.size,
        color:     v.color ?? '',
        colorHex:  v.colorHex ?? null,
        stock:     v.stock,
        priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
        isActive:  true,
      },
      update: {
        size:      v.size,
        color:     v.color ?? '',
        colorHex:  v.colorHex ?? null,
        stock:     v.stock,
        priceOverride: v.priceOverride ? new Prisma.Decimal(v.priceOverride) : null,
        isActive:  true,
      },
    })
  }

  // Imagem primária. Idempotente: se já existe, atualiza URL/alt (pra refletir trocas de
  // imageUrl em re-runs do seed — caso contrário URLs novas seriam ignoradas).
  const imageUrl = input.imageUrl ?? buildPlaceholderImage(input.slug)
  const existingImage = await prisma.productImage.findFirst({
    where: { productId: product.id, isPrimary: true },
  })
  if (existingImage) {
    if (existingImage.url !== imageUrl || existingImage.alt !== input.name) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data:  { url: imageUrl, alt: input.name },
      })
    }
  } else {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url:       imageUrl,
        alt:       input.name,
        isPrimary: true,
        sortOrder: 0,
      },
    })
  }

  return product
}

// -----------------------------------------------------------------------------
// 7.1) CPUs (5) — mix AM5 + LGA1700
// -----------------------------------------------------------------------------
function cpuSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'amd-ryzen-5-7600x',
      name: 'AMD Ryzen 5 7600X',
      description: 'Ryzen 5 de 6 núcleos / 12 threads, socket AM5, ideal pra entry gamer e mid-tier.',
      basePrice: 1599.00, comparePrice: 1799.00,
      brandSlug: 'amd', categorySlug: 'processadores',
      buildType: 'componente', hardwareCategory: 'cpu',
      specs: { cores: 6, threads: 12, baseClockGhz: 4.7, boostClockGhz: 5.3, tdpW: 105, socket: 'AM5', cache: '32MB L3' },
      compatibility: { socket: 'AM5', tdpW: 105, ramType: 'DDR5', maxRamMhz: 5200 },
      tags: ['amd', 'am5', 'ryzen', 'entry'], isFeatured: true,
      warrantyMonths: 36,
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cpu-7600x-default', size: 'Padrão', stock: 25 }],
    },
    {
      slug: 'amd-ryzen-7-7800x3d',
      name: 'AMD Ryzen 7 7800X3D',
      description: 'Top em jogos. 8 núcleos com 96MB de cache 3D — performance pra Valorant 240fps e CS2.',
      basePrice: 3499.00, comparePrice: 3799.00,
      brandSlug: 'amd', categorySlug: 'processadores',
      buildType: 'componente', hardwareCategory: 'cpu',
      specs: { cores: 8, threads: 16, baseClockGhz: 4.2, boostClockGhz: 5.0, tdpW: 120, socket: 'AM5', cache: '96MB L3 3D' },
      compatibility: { socket: 'AM5', tdpW: 120, ramType: 'DDR5', maxRamMhz: 5200 },
      tags: ['amd', 'am5', 'ryzen', 'x3d', 'gaming'], isFeatured: true,
      warrantyMonths: 36,
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cpu-7800x3d-default', size: 'Padrão', stock: 14 }],
    },
    {
      slug: 'amd-ryzen-9-7950x',
      name: 'AMD Ryzen 9 7950X',
      description: '16 núcleos / 32 threads. Multitarefa pesada, render 3D, edição 4K.',
      basePrice: 4299.00, comparePrice: 4799.00,
      brandSlug: 'amd', categorySlug: 'processadores',
      buildType: 'componente', hardwareCategory: 'cpu',
      specs: { cores: 16, threads: 32, baseClockGhz: 4.5, boostClockGhz: 5.7, tdpW: 170, socket: 'AM5', cache: '64MB L3' },
      compatibility: { socket: 'AM5', tdpW: 170, ramType: 'DDR5', maxRamMhz: 5200 },
      tags: ['amd', 'am5', 'workstation', 'render'],
      warrantyMonths: 36,
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cpu-7950x-default', size: 'Padrão', stock: 8 }],
    },
    {
      slug: 'intel-core-i5-14600k',
      name: 'Intel Core i5-14600K',
      description: '14 núcleos híbridos (6P + 8E), socket LGA1700. Equilíbrio jogos + multitarefa.',
      basePrice: 1899.00, comparePrice: 2099.00,
      brandSlug: 'intel', categorySlug: 'processadores',
      buildType: 'componente', hardwareCategory: 'cpu',
      specs: { cores: 14, threads: 20, baseClockGhz: 3.5, boostClockGhz: 5.3, tdpW: 125, socket: 'LGA1700', cache: '24MB L3' },
      compatibility: { socket: 'LGA1700', tdpW: 125, ramType: 'DDR5', maxRamMhz: 5600 },
      tags: ['intel', 'lga1700', 'core', 'gaming'],
      warrantyMonths: 36,
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cpu-14600k-default', size: 'Padrão', stock: 18 }],
    },
    {
      slug: 'intel-core-i9-14900k',
      name: 'Intel Core i9-14900K',
      description: '24 núcleos híbridos (8P + 16E), 5.8GHz boost. Top de linha LGA1700.',
      basePrice: 4799.00,
      brandSlug: 'intel', categorySlug: 'processadores',
      buildType: 'componente', hardwareCategory: 'cpu',
      specs: { cores: 24, threads: 32, baseClockGhz: 3.2, boostClockGhz: 5.8, tdpW: 125, socket: 'LGA1700', cache: '36MB L3' },
      compatibility: { socket: 'LGA1700', tdpW: 253, ramType: 'DDR5', maxRamMhz: 5600 },
      tags: ['intel', 'lga1700', 'core', 'i9', 'workstation'],
      warrantyMonths: 36,
      imageUrl: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cpu-14900k-default', size: 'Padrão', stock: 6 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.2) GPUs (5)
// -----------------------------------------------------------------------------
function gpuSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'nvidia-rtx-4060',
      name: 'NVIDIA GeForce RTX 4060 8GB',
      description: 'Entry gamer 1080p high. DLSS 3, NVENC moderno pra streaming.',
      basePrice: 2199.00, comparePrice: 2499.00,
      brandSlug: 'nvidia', categorySlug: 'placas-de-video',
      buildType: 'componente', hardwareCategory: 'gpu',
      specs: { vramGb: 8, vramType: 'GDDR6', cudaCores: 3072, baseClockMhz: 1830, boostClockMhz: 2460, tdpW: 115 },
      compatibility: { lengthMm: 245, slots: 2, tdpW: 115, powerConnectors: ['8pin'], minPsuW: 550 },
      weightGrams: 750, dimensionsMm: { length: 245, width: 126, height: 41 },
      tags: ['nvidia', 'rtx', '4060', 'entry'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'gpu-rtx4060-default', size: 'Padrão', stock: 22 }],
    },
    {
      slug: 'nvidia-rtx-4070-super',
      name: 'NVIDIA GeForce RTX 4070 SUPER 12GB',
      description: '1440p high com folga. DLSS 3 + frame generation. Sweet spot 2026.',
      basePrice: 4199.00, comparePrice: 4699.00,
      brandSlug: 'nvidia', categorySlug: 'placas-de-video',
      buildType: 'componente', hardwareCategory: 'gpu',
      specs: { vramGb: 12, vramType: 'GDDR6X', cudaCores: 7168, baseClockMhz: 1980, boostClockMhz: 2475, tdpW: 220 },
      compatibility: { lengthMm: 285, slots: 2, tdpW: 220, powerConnectors: ['12vhpwr'], minPsuW: 650 },
      weightGrams: 1100, dimensionsMm: { length: 285, width: 130, height: 50 },
      tags: ['nvidia', 'rtx', '4070', 'super', 'gaming'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'gpu-rtx4070s-default', size: 'Padrão', stock: 12 }],
    },
    {
      slug: 'nvidia-rtx-4080-super',
      name: 'NVIDIA GeForce RTX 4080 SUPER 16GB',
      description: '4K high a 60+ FPS na maioria dos jogos. VRAM grande pra render e IA.',
      basePrice: 8999.00, comparePrice: 9799.00,
      brandSlug: 'nvidia', categorySlug: 'placas-de-video',
      buildType: 'componente', hardwareCategory: 'gpu',
      specs: { vramGb: 16, vramType: 'GDDR6X', cudaCores: 10240, baseClockMhz: 2295, boostClockMhz: 2550, tdpW: 320 },
      compatibility: { lengthMm: 320, slots: 3, tdpW: 320, powerConnectors: ['12vhpwr'], minPsuW: 750 },
      weightGrams: 1600, dimensionsMm: { length: 320, width: 140, height: 60 },
      tags: ['nvidia', 'rtx', '4080', 'super', '4k'],
      imageUrl: 'https://images.unsplash.com/photo-1635224909468-de91c812bc35?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'gpu-rtx4080s-default', size: 'Padrão', stock: 5 }],
    },
    {
      slug: 'nvidia-rtx-5070-ti',
      name: 'NVIDIA GeForce RTX 5070 Ti 16GB',
      description: 'Geração Blackwell, DLSS 4 com multi-frame generation. 1440p ultra com folga.',
      basePrice: 6499.00,
      brandSlug: 'nvidia', categorySlug: 'placas-de-video',
      buildType: 'componente', hardwareCategory: 'gpu',
      specs: { vramGb: 16, vramType: 'GDDR7', cudaCores: 8960, baseClockMhz: 2300, boostClockMhz: 2700, tdpW: 285 },
      compatibility: { lengthMm: 305, slots: 3, tdpW: 285, powerConnectors: ['12vhpwr'], minPsuW: 750 },
      weightGrams: 1500, dimensionsMm: { length: 305, width: 135, height: 55 },
      tags: ['nvidia', 'rtx', '5070', 'blackwell'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'gpu-rtx5070ti-default', size: 'Padrão', stock: 7 }],
    },
    {
      slug: 'nvidia-rtx-5080',
      name: 'NVIDIA GeForce RTX 5080 16GB',
      description: 'Top de linha pra gaming 4K e workloads de IA. DLSS 4 + tensor cores Blackwell.',
      basePrice: 12999.00,
      brandSlug: 'nvidia', categorySlug: 'placas-de-video',
      buildType: 'componente', hardwareCategory: 'gpu',
      specs: { vramGb: 16, vramType: 'GDDR7', cudaCores: 10752, baseClockMhz: 2300, boostClockMhz: 2800, tdpW: 360 },
      compatibility: { lengthMm: 340, slots: 3, tdpW: 360, powerConnectors: ['12vhpwr'], minPsuW: 850 },
      weightGrams: 1800, dimensionsMm: { length: 340, width: 145, height: 65 },
      tags: ['nvidia', 'rtx', '5080', 'blackwell', '4k', 'ia'],
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'gpu-rtx5080-default', size: 'Padrão', stock: 4 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.3) MOBOS (5)
// -----------------------------------------------------------------------------
function moboSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'asus-tuf-b650-plus',
      name: 'ASUS TUF Gaming B650-Plus WiFi',
      description: 'B650 ATX socket AM5. WiFi 6, 4 slots DDR5, 2 NVMe Gen4.',
      basePrice: 1599.00, comparePrice: 1799.00,
      brandSlug: 'asus', categorySlug: 'placas-mae',
      buildType: 'componente', hardwareCategory: 'mobo',
      specs: { socket: 'AM5', chipset: 'B650', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6400, m2Slots: 2, pcieGen: 4 },
      compatibility: { socket: 'AM5', chipset: 'B650', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6400, formFactor: 'ATX', m2Slots: 2 },
      tags: ['asus', 'am5', 'b650', 'atx'],
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mobo-tuf-b650-default', size: 'Padrão', stock: 16 }],
    },
    {
      slug: 'msi-mag-x670e-tomahawk',
      name: 'MSI MAG X670E Tomahawk WiFi',
      description: 'X670E ATX, PCIe 5.0 GPU + SSD, 4x DDR5 até 6600. Pra Ryzen top.',
      basePrice: 2599.00,
      brandSlug: 'msi', categorySlug: 'placas-mae',
      buildType: 'componente', hardwareCategory: 'mobo',
      specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6600, m2Slots: 4, pcieGen: 5 },
      compatibility: { socket: 'AM5', chipset: 'X670E', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6600, formFactor: 'ATX', m2Slots: 4 },
      tags: ['msi', 'am5', 'x670e', 'atx'],
      imageUrl: 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mobo-x670e-tomahawk-default', size: 'Padrão', stock: 9 }],
    },
    {
      slug: 'asus-rog-strix-z790-e',
      name: 'ASUS ROG Strix Z790-E Gaming WiFi',
      description: 'Z790 ATX socket LGA1700. Premium, PCIe 5.0, 5 NVMe.',
      basePrice: 3499.00, comparePrice: 3799.00,
      brandSlug: 'asus', categorySlug: 'placas-mae',
      buildType: 'componente', hardwareCategory: 'mobo',
      specs: { socket: 'LGA1700', chipset: 'Z790', formFactor: 'ATX', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 7800, m2Slots: 5, pcieGen: 5 },
      compatibility: { socket: 'LGA1700', chipset: 'Z790', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 7800, formFactor: 'ATX', m2Slots: 5 },
      tags: ['asus', 'lga1700', 'z790', 'rog'],
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mobo-z790-e-default', size: 'Padrão', stock: 7 }],
    },
    {
      slug: 'gigabyte-b760m-aorus-elite',
      name: 'Gigabyte B760M Aorus Elite AX',
      description: 'B760 mATX socket LGA1700. WiFi, 2x DDR5, custo-benefício.',
      basePrice: 1199.00,
      brandSlug: 'gigabyte', categorySlug: 'placas-mae',
      buildType: 'componente', hardwareCategory: 'mobo',
      specs: { socket: 'LGA1700', chipset: 'B760', formFactor: 'mATX', ramSlots: 2, ramType: 'DDR5', maxRamMhz: 5600, m2Slots: 2, pcieGen: 4 },
      compatibility: { socket: 'LGA1700', chipset: 'B760', ramSlots: 2, ramType: 'DDR5', maxRamMhz: 5600, formFactor: 'mATX', m2Slots: 2 },
      tags: ['gigabyte', 'lga1700', 'b760', 'matx', 'budget'],
      imageUrl: 'https://images.unsplash.com/photo-1601737487795-dab272f52420?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mobo-b760m-aorus-default', size: 'Padrão', stock: 14 }],
    },
    {
      slug: 'asus-rog-crosshair-x670e-extreme',
      name: 'ASUS ROG Crosshair X670E Extreme',
      description: 'E-ATX premium, X670E, 24+2 fases, dual 12VHPWR, IA workstation.',
      basePrice: 6999.00,
      brandSlug: 'asus', categorySlug: 'placas-mae',
      buildType: 'componente', hardwareCategory: 'mobo',
      specs: { socket: 'AM5', chipset: 'X670E', formFactor: 'E-ATX', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6800, m2Slots: 5, pcieGen: 5 },
      compatibility: { socket: 'AM5', chipset: 'X670E', ramSlots: 4, ramType: 'DDR5', maxRamMhz: 6800, formFactor: 'E-ATX', m2Slots: 5 },
      tags: ['asus', 'rog', 'am5', 'x670e', 'e-atx', 'workstation'],
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mobo-crosshair-x670e-default', size: 'Padrão', stock: 3 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.4) RAMs (5) — DDR5
// -----------------------------------------------------------------------------
function ramSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'corsair-vengeance-ddr5-32gb-6000',
      name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL30',
      description: 'Kit dual-channel 32GB DDR5 6000 CL30. Sweet spot pra AM5 e LGA1700.',
      basePrice: 949.00, comparePrice: 1099.00,
      brandSlug: 'corsair', categorySlug: 'memoria-ram',
      buildType: 'componente', hardwareCategory: 'ram',
      specs: { capacityGb: 32, sticks: 2, type: 'DDR5', mhz: 6000, cl: 30, voltage: 1.35 },
      compatibility: { type: 'DDR5', mhz: 6000, gb: 32, sticks: 2 },
      tags: ['corsair', 'ddr5', '32gb', 'dual-channel'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'ram-vengeance-32gb-6000-default', size: '32GB (2x16)', stock: 28 }],
    },
    {
      slug: 'kingston-fury-beast-ddr5-32gb-5600',
      name: 'Kingston Fury Beast DDR5 32GB (2x16GB) 5600MHz CL36',
      description: 'Kit dual-channel mid-range com excelente compatibilidade AM5/LGA1700.',
      basePrice: 799.00,
      brandSlug: 'kingston', categorySlug: 'memoria-ram',
      buildType: 'componente', hardwareCategory: 'ram',
      specs: { capacityGb: 32, sticks: 2, type: 'DDR5', mhz: 5600, cl: 36, voltage: 1.25 },
      compatibility: { type: 'DDR5', mhz: 5600, gb: 32, sticks: 2 },
      tags: ['kingston', 'ddr5', '32gb'],
      imageUrl: 'https://images.unsplash.com/photo-1591489630450-26c2f5f8a86d?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'ram-fury-32gb-5600-default', size: '32GB (2x16)', stock: 22 }],
    },
    {
      slug: 'corsair-vengeance-ddr5-64gb-6000',
      name: 'Corsair Vengeance DDR5 64GB (2x32GB) 6000MHz CL30',
      description: 'Kit 64GB pra workstation, edição 4K e LLM local.',
      basePrice: 1899.00,
      brandSlug: 'corsair', categorySlug: 'memoria-ram',
      buildType: 'componente', hardwareCategory: 'ram',
      specs: { capacityGb: 64, sticks: 2, type: 'DDR5', mhz: 6000, cl: 30, voltage: 1.35 },
      compatibility: { type: 'DDR5', mhz: 6000, gb: 64, sticks: 2 },
      tags: ['corsair', 'ddr5', '64gb', 'workstation'],
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'ram-vengeance-64gb-6000-default', size: '64GB (2x32)', stock: 9 }],
    },
    {
      slug: 'corsair-dominator-ddr5-128gb-5600',
      name: 'Corsair Dominator Titanium DDR5 128GB (4x32GB) 5600MHz CL40',
      description: 'Kit 128GB pra IA local Llama 70B, render 3D pesado, virtualização.',
      basePrice: 4499.00,
      brandSlug: 'corsair', categorySlug: 'memoria-ram',
      buildType: 'componente', hardwareCategory: 'ram',
      specs: { capacityGb: 128, sticks: 4, type: 'DDR5', mhz: 5600, cl: 40, voltage: 1.25 },
      compatibility: { type: 'DDR5', mhz: 5600, gb: 128, sticks: 4 },
      tags: ['corsair', 'ddr5', '128gb', 'workstation', 'ia'],
      imageUrl: 'https://images.unsplash.com/photo-1591489630450-26c2f5f8a86d?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'ram-dominator-128gb-default', size: '128GB (4x32)', stock: 3 }],
    },
    {
      slug: 'kingston-fury-renegade-ddr5-32gb-7200',
      name: 'Kingston Fury Renegade DDR5 32GB (2x16GB) 7200MHz CL38',
      description: 'Kit alta velocidade pra Z790 (Intel suporta DDR5 mais alto que AM5).',
      basePrice: 1199.00,
      brandSlug: 'kingston', categorySlug: 'memoria-ram',
      buildType: 'componente', hardwareCategory: 'ram',
      specs: { capacityGb: 32, sticks: 2, type: 'DDR5', mhz: 7200, cl: 38, voltage: 1.45 },
      compatibility: { type: 'DDR5', mhz: 7200, gb: 32, sticks: 2 },
      tags: ['kingston', 'ddr5', '32gb', 'high-speed'],
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'ram-renegade-32gb-7200-default', size: '32GB (2x16)', stock: 6 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.5) PSUs (4)
// -----------------------------------------------------------------------------
function psuSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'corsair-rm550x',
      name: 'Corsair RM550x 80+ Gold',
      description: 'Fonte 550W modular full, 80+ Gold. Pra entry gamer (RTX 4060 + Ryzen 5).',
      basePrice: 599.00,
      brandSlug: 'corsair', categorySlug: 'fontes',
      buildType: 'componente', hardwareCategory: 'psu',
      specs: { wattage: 550, certification: '80+ Gold', modular: 'full' },
      compatibility: { wattage: 550, certification: '80+ Gold', modular: 'full', connectors: { gpu_8pin: 2, gpu_12vhpwr: 0 } },
      tags: ['corsair', 'psu', '550w', 'gold'],
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'psu-rm550x-default', size: 'Padrão', stock: 19 }],
    },
    {
      slug: 'corsair-rm750x',
      name: 'Corsair RM750x 80+ Gold',
      description: 'Fonte 750W modular full. Sweet spot pra builds 4070/4070-Ti.',
      basePrice: 799.00,
      brandSlug: 'corsair', categorySlug: 'fontes',
      buildType: 'componente', hardwareCategory: 'psu',
      specs: { wattage: 750, certification: '80+ Gold', modular: 'full' },
      compatibility: { wattage: 750, certification: '80+ Gold', modular: 'full', connectors: { gpu_8pin: 4, gpu_12vhpwr: 1 } },
      tags: ['corsair', 'psu', '750w', 'gold'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1635224909468-de91c812bc35?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'psu-rm750x-default', size: 'Padrão', stock: 14 }],
    },
    {
      slug: 'evga-supernova-850-g6',
      name: 'EVGA SuperNOVA 850 G6 80+ Gold',
      description: 'Fonte 850W modular, ideal pra RTX 4080 / 5080.',
      basePrice: 999.00,
      brandSlug: 'evga', categorySlug: 'fontes',
      buildType: 'componente', hardwareCategory: 'psu',
      specs: { wattage: 850, certification: '80+ Gold', modular: 'full' },
      compatibility: { wattage: 850, certification: '80+ Gold', modular: 'full', connectors: { gpu_8pin: 4, gpu_12vhpwr: 1 } },
      tags: ['evga', 'psu', '850w', 'gold'],
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'psu-evga-850g6-default', size: 'Padrão', stock: 8 }],
    },
    {
      slug: 'corsair-hx1000i',
      name: 'Corsair HX1000i 80+ Platinum',
      description: 'Fonte 1000W Platinum, pra workstation com RTX 5080 + Threadripper-class.',
      basePrice: 1799.00,
      brandSlug: 'corsair', categorySlug: 'fontes',
      buildType: 'componente', hardwareCategory: 'psu',
      specs: { wattage: 1000, certification: '80+ Platinum', modular: 'full' },
      compatibility: { wattage: 1000, certification: '80+ Platinum', modular: 'full', connectors: { gpu_8pin: 6, gpu_12vhpwr: 2 } },
      tags: ['corsair', 'psu', '1000w', 'platinum', 'workstation'],
      imageUrl: 'https://images.unsplash.com/photo-1635224909468-de91c812bc35?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'psu-hx1000i-default', size: 'Padrão', stock: 5 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.6) GABINETES (4)
// -----------------------------------------------------------------------------
function caseSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'cooler-master-nr200p',
      name: 'Cooler Master NR200P',
      description: 'Gabinete ITX/mATX compacto. Aceita GPU até 330mm e cooler air até 153mm.',
      basePrice: 599.00,
      brandSlug: 'cooler-master', categorySlug: 'gabinetes',
      buildType: 'componente', hardwareCategory: 'case',
      specs: { formFactor: 'mATX/ITX', maxGpuLengthMm: 330, maxCoolerHeightMm: 153, fanSlots: 4 },
      compatibility: { formFactor: 'mATX', maxGpuLengthMm: 330, maxCoolerHeightMm: 153, fanSlots: 4 },
      tags: ['cooler-master', 'case', 'compact', 'matx'],
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'case-nr200p-default', size: 'Padrão', color: 'Preto', stock: 11 }],
    },
    {
      slug: 'lian-li-lancool-216',
      name: 'Lian Li Lancool 216',
      description: 'Gabinete ATX com fluxo de ar excepcional. Acomoda GPU até 392mm e cooler até 180mm.',
      basePrice: 699.00,
      brandSlug: 'lian-li', categorySlug: 'gabinetes',
      buildType: 'componente', hardwareCategory: 'case',
      specs: { formFactor: 'ATX', maxGpuLengthMm: 392, maxCoolerHeightMm: 180, fanSlots: 7 },
      compatibility: { formFactor: 'ATX', maxGpuLengthMm: 392, maxCoolerHeightMm: 180, fanSlots: 7 },
      tags: ['lian-li', 'case', 'atx', 'airflow'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'case-lancool-216-default', size: 'Padrão', color: 'Preto', stock: 9 }],
    },
    {
      slug: 'nzxt-h7-flow',
      name: 'NZXT H7 Flow',
      description: 'Gabinete ATX premium. Visual limpo, mesh frontal pra fluxo de ar.',
      basePrice: 899.00,
      brandSlug: 'nzxt', categorySlug: 'gabinetes',
      buildType: 'componente', hardwareCategory: 'case',
      specs: { formFactor: 'ATX', maxGpuLengthMm: 365, maxCoolerHeightMm: 185, fanSlots: 7 },
      compatibility: { formFactor: 'ATX', maxGpuLengthMm: 365, maxCoolerHeightMm: 185, fanSlots: 7 },
      tags: ['nzxt', 'case', 'atx', 'premium'],
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'case-nzxt-h7-default', size: 'Padrão', color: 'Branco', stock: 6 }],
    },
    {
      slug: 'lian-li-o11-evo-xl',
      name: 'Lian Li O11 Dynamic Evo XL',
      description: 'E-ATX premium com vidro temperado. Suporta E-ATX e múltiplos AIOs 360mm.',
      basePrice: 1499.00,
      brandSlug: 'lian-li', categorySlug: 'gabinetes',
      buildType: 'componente', hardwareCategory: 'case',
      specs: { formFactor: 'E-ATX', maxGpuLengthMm: 460, maxCoolerHeightMm: 167, fanSlots: 10 },
      compatibility: { formFactor: 'E-ATX', maxGpuLengthMm: 460, maxCoolerHeightMm: 167, fanSlots: 10 },
      tags: ['lian-li', 'case', 'e-atx', 'workstation', 'premium'],
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'case-o11-evo-xl-default', size: 'Padrão', color: 'Preto', stock: 4 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.7) COOLERS (2)
// -----------------------------------------------------------------------------
function coolerSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'cooler-master-hyper-212-black',
      name: 'Cooler Master Hyper 212 Black Edition',
      description: 'Cooler air clássico, 158mm de altura. Suporta TDP até 150W. Compatível AM5/LGA1700.',
      basePrice: 249.00,
      brandSlug: 'cooler-master', categorySlug: 'coolers',
      buildType: 'componente', hardwareCategory: 'cooler',
      specs: { type: 'air', heightMm: 158, supportsTdpW: 150, sockets: ['AM5', 'AM4', 'LGA1700'] },
      compatibility: { sockets: ['AM5', 'AM4', 'LGA1700'], heightMm: 158, supportsTdpW: 150, type: 'air' },
      tags: ['cooler-master', 'cooler', 'air', 'budget'],
      imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cooler-hyper212-default', size: 'Padrão', stock: 20 }],
    },
    {
      slug: 'nzxt-kraken-elite-360',
      name: 'NZXT Kraken Elite 360 RGB',
      description: 'AIO 360mm com display LCD e RGB. Suporta CPUs até 280W TDP.',
      basePrice: 1899.00,
      brandSlug: 'nzxt', categorySlug: 'coolers',
      buildType: 'componente', hardwareCategory: 'cooler',
      specs: { type: 'aio', radiatorMm: 360, supportsTdpW: 280, sockets: ['AM5', 'AM4', 'LGA1700'] },
      compatibility: { sockets: ['AM5', 'AM4', 'LGA1700'], heightMm: 30, supportsTdpW: 280, type: 'aio', radiatorMm: 360 },
      tags: ['nzxt', 'cooler', 'aio', '360', 'rgb'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1635224909468-de91c812bc35?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'cooler-kraken-elite-360-default', size: '360mm', color: 'Preto', stock: 7 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.8) MONITORES (5)
// -----------------------------------------------------------------------------
function monitorSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'lg-ultragear-27-240hz',
      name: 'LG UltraGear 27" IPS 240Hz QHD',
      description: 'Monitor 27 polegadas IPS, 1440p, 240Hz. Pra esports competitivo (Valorant/CS2).',
      basePrice: 2899.00, comparePrice: 3199.00,
      brandSlug: 'lg', categorySlug: 'monitores',
      buildType: 'monitor', hardwareCategory: 'monitor',
      specs: { sizeInches: 27, panel: 'IPS', resolution: '2560x1440', refreshHz: 240, responseMs: 1, hdrLevel: 'HDR400' },
      compatibility: {},
      tags: ['lg', 'monitor', '27', '240hz', '1440p'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mon-lg-27-240hz-default', size: '27"', color: 'Preto', stock: 8 }],
    },
    {
      slug: 'benq-zowie-xl2566k-360hz',
      name: 'BenQ Zowie XL2566K 24.5" 360Hz TN',
      description: 'Monitor TN 360Hz, 1080p. Esports puro — usado por pros de Valorant/CS2.',
      basePrice: 4599.00,
      brandSlug: 'benq', categorySlug: 'monitores',
      buildType: 'monitor', hardwareCategory: 'monitor',
      specs: { sizeInches: 24.5, panel: 'TN', resolution: '1920x1080', refreshHz: 360, responseMs: 0.5 },
      compatibility: {},
      tags: ['benq', 'monitor', '24', '360hz', '1080p', 'esports'],
      imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mon-benq-xl2566k-default', size: '24.5"', color: 'Preto', stock: 5 }],
    },
    {
      slug: 'lg-ultragear-32-4k-144hz',
      name: 'LG UltraGear 32" 4K 144Hz IPS',
      description: 'Monitor 32" IPS, 4K, 144Hz. Pra edição 4K, gaming AAA, workstation.',
      basePrice: 5499.00,
      brandSlug: 'lg', categorySlug: 'monitores',
      buildType: 'monitor', hardwareCategory: 'monitor',
      specs: { sizeInches: 32, panel: 'IPS', resolution: '3840x2160', refreshHz: 144, responseMs: 1, hdrLevel: 'HDR600' },
      compatibility: {},
      tags: ['lg', 'monitor', '32', '4k', '144hz'],
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mon-lg-32-4k-default', size: '32"', color: 'Preto', stock: 6 }],
    },
    {
      slug: 'lg-ultragear-34-ultrawide-165hz',
      name: 'LG UltraGear 34" Ultrawide 165Hz QHD',
      description: 'Ultrawide 34", 3440x1440, 165Hz. Imersão pra simuladores e MMO.',
      basePrice: 4299.00,
      brandSlug: 'lg', categorySlug: 'monitores',
      buildType: 'monitor', hardwareCategory: 'monitor',
      specs: { sizeInches: 34, panel: 'IPS', resolution: '3440x1440', refreshHz: 165, responseMs: 1, hdrLevel: 'HDR400' },
      compatibility: {},
      tags: ['lg', 'monitor', '34', 'ultrawide', '165hz'],
      imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mon-lg-34-uw-default', size: '34" Ultrawide', color: 'Preto', stock: 4 }],
    },
    {
      slug: 'asus-rog-swift-pg27aqdm-oled',
      name: 'ASUS ROG Swift PG27AQDM 27" OLED 240Hz',
      description: 'OLED 27" QHD 240Hz. Resposta instantânea + pretos absolutos.',
      basePrice: 7499.00,
      brandSlug: 'asus', categorySlug: 'monitores',
      buildType: 'monitor', hardwareCategory: 'monitor',
      specs: { sizeInches: 27, panel: 'OLED', resolution: '2560x1440', refreshHz: 240, responseMs: 0.03, hdrLevel: 'HDR True Black 400' },
      compatibility: {},
      tags: ['asus', 'rog', 'monitor', '27', 'oled', '240hz'],
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mon-asus-pg27aqdm-default', size: '27" OLED', color: 'Preto', stock: 3 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.9) PERIFÉRICOS (5)
// -----------------------------------------------------------------------------
function peripheralSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'logitech-g-pro-x-superlight-2',
      name: 'Logitech G Pro X Superlight 2',
      description: 'Mouse wireless 60g, sensor HERO 2 32K DPI. Padrão pro Valorant/CS2.',
      basePrice: 999.00,
      brandSlug: 'logitech', categorySlug: 'perifericos',
      buildType: 'periferico', hardwareCategory: 'mouse',
      specs: { dpi: 32000, weightGrams: 60, wireless: true, batteryHours: 95 },
      compatibility: {},
      tags: ['logitech', 'mouse', 'wireless', 'esports'], isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mouse-superlight2-default', size: 'Padrão', color: 'Preto', stock: 18 }],
    },
    {
      slug: 'razer-deathadder-v3-pro',
      name: 'Razer DeathAdder V3 Pro',
      description: 'Mouse ergo wireless 63g, sensor Focus Pro 30K. Confortável e preciso.',
      basePrice: 899.00,
      brandSlug: 'razer', categorySlug: 'perifericos',
      buildType: 'periferico', hardwareCategory: 'mouse',
      specs: { dpi: 30000, weightGrams: 63, wireless: true, batteryHours: 90 },
      compatibility: {},
      tags: ['razer', 'mouse', 'wireless', 'ergonomic'],
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mouse-deathadder-v3-default', size: 'Padrão', color: 'Preto', stock: 14 }],
    },
    {
      slug: 'logitech-g-pro-x-tkl',
      name: 'Logitech G Pro X TKL Lightspeed',
      description: 'Teclado mecânico TKL wireless. GX Brown tactile, RGB Lightsync.',
      basePrice: 1399.00,
      brandSlug: 'logitech', categorySlug: 'perifericos',
      buildType: 'periferico', hardwareCategory: 'teclado',
      specs: { layout: 'TKL', switchType: 'GX Brown', wireless: true, rgb: true },
      compatibility: {},
      tags: ['logitech', 'teclado', 'mecanico', 'tkl'],
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'kbd-g-pro-x-tkl-default', size: 'TKL', color: 'Preto', stock: 9 }],
    },
    {
      slug: 'razer-blackshark-v2-pro',
      name: 'Razer Blackshark V2 Pro',
      description: 'Headset wireless 7.1, drivers TriForce 50mm. Microfone HyperClear.',
      basePrice: 1599.00,
      brandSlug: 'razer', categorySlug: 'perifericos',
      buildType: 'periferico', hardwareCategory: 'headset',
      specs: { wireless: true, surround: '7.1', driverMm: 50, batteryHours: 70 },
      compatibility: {},
      tags: ['razer', 'headset', 'wireless', '7.1'],
      imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'hs-blackshark-v2-pro-default', size: 'Padrão', color: 'Preto', stock: 7 }],
    },
    {
      slug: 'logitech-g502-x-plus',
      name: 'Logitech G502 X Plus Lightspeed',
      description: 'Mouse wireless com 13 botões customizáveis e RGB Lightsync.',
      basePrice: 999.00,
      brandSlug: 'logitech', categorySlug: 'perifericos',
      buildType: 'periferico', hardwareCategory: 'mouse',
      specs: { dpi: 25600, weightGrams: 106, wireless: true, batteryHours: 130, buttons: 13 },
      compatibility: {},
      tags: ['logitech', 'mouse', 'wireless', 'mmo'],
      imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=1200&q=80',
      variations: [{ sku: 'mouse-g502-x-plus-default', size: 'Padrão', color: 'Preto', stock: 11 }],
    },
  ]
}

// -----------------------------------------------------------------------------
// 7.10) PCs MONTADOS (8) — 1 por persona, com benchmarkFps curado
// -----------------------------------------------------------------------------
function pcSeeds(): ProductSeedInput[] {
  return [
    {
      slug: 'pc-kore-valorant-pro',
      name: 'Kore Tech Valorant Pro',
      description: 'PC montado pra travar 240 FPS no Valorant em 1080p high. Ryzen 7 7800X3D + RTX 4070 SUPER + 32GB DDR5 6000 + SSD 1TB Gen4.',
      basePrice: 9499.00, comparePrice: 9999.00,
      brandSlug: 'kore', categorySlug: 'pc-gamer',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'valorant-240fps',
      specs: {
        cpu: 'AMD Ryzen 7 7800X3D',
        gpu: 'NVIDIA RTX 4070 SUPER 12GB',
        ram: '32GB DDR5 6000MHz CL30',
        mobo: 'ASUS TUF B650-Plus WiFi',
        storage: '1TB NVMe Gen4',
        psu: 'Corsair RM750x 80+ Gold',
        case: 'Lian Li Lancool 216',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'valorant_1080p_high': 280, 'cs2_1080p_high': 300, 'fortnite_1080p_perf': 320, 'apex_1080p_high': 240 },
      tags: ['pc-pronto', 'valorant', 'esports', 'amd'], isFeatured: true,
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-valorant-pro-bronze',  size: 'Bronze (config base)',                                stock: 5 },
        { sku: 'pc-valorant-pro-prata',   size: 'Prata (RAM 64GB)',         priceOverride: 10299.00,    stock: 3 },
        { sku: 'pc-valorant-pro-ouro',    size: 'Ouro (RAM 64GB + 2TB SSD)', priceOverride: 11199.00,    stock: 2 },
      ],
    },
    {
      slug: 'pc-kore-fortnite-edge',
      name: 'Kore Tech Fortnite Edge',
      description: 'PC montado pra Fortnite competitivo em 1440p épico ou 1080p performance. Ryzen 5 7600X + RTX 4070 SUPER + 32GB DDR5.',
      basePrice: 8499.00,
      brandSlug: 'kore', categorySlug: 'pc-gamer',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'fortnite-competitivo',
      specs: {
        cpu: 'AMD Ryzen 5 7600X',
        gpu: 'NVIDIA RTX 4070 SUPER 12GB',
        ram: '32GB DDR5 6000MHz CL30',
        mobo: 'ASUS TUF B650-Plus WiFi',
        storage: '1TB NVMe Gen4',
        psu: 'Corsair RM750x',
        case: 'NZXT H7 Flow',
        cooler: 'Cooler Master Hyper 212 Black',
      },
      compatibility: {},
      benchmarkFps: { 'fortnite_1440p_epic': 165, 'fortnite_1080p_perf': 360, 'apex_1440p_high': 165 },
      tags: ['pc-pronto', 'fortnite', 'amd'], isFeatured: true,
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-fortnite-edge-bronze', size: 'Bronze',                                stock: 4 },
        { sku: 'pc-fortnite-edge-prata',  size: 'Prata (RAM 64GB)', priceOverride: 9199.00,  stock: 3 },
      ],
    },
    {
      slug: 'pc-kore-cs2-tactical',
      name: 'Kore Tech CS2 Tactical',
      description: 'PC pra CS2 high-tier: 220 FPS estáveis em 1440p high. Ryzen 7 7800X3D + RTX 4070 SUPER.',
      basePrice: 9799.00,
      brandSlug: 'kore', categorySlug: 'pc-gamer',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'cs2-high-tier',
      specs: {
        cpu: 'AMD Ryzen 7 7800X3D',
        gpu: 'NVIDIA RTX 4070 SUPER 12GB',
        ram: '32GB DDR5 6000MHz CL30',
        mobo: 'MSI MAG X670E Tomahawk',
        storage: '1TB NVMe Gen4',
        psu: 'Corsair RM750x',
        case: 'Lian Li Lancool 216',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'cs2_1440p_high': 220, 'cs2_1080p_high': 320, 'valorant_1440p_high': 240 },
      tags: ['pc-pronto', 'cs2', 'esports', 'amd'],
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-cs2-tactical-bronze', size: 'Bronze',                                stock: 3 },
        { sku: 'pc-cs2-tactical-prata',  size: 'Prata (RAM 64GB + 2TB)', priceOverride: 11199.00, stock: 2 },
      ],
    },
    {
      slug: 'pc-kore-creator-4k',
      name: 'Kore Tech Creator 4K',
      description: 'Workstation pra editar vídeo 4K. Ryzen 9 7950X + RTX 4080 SUPER + 64GB DDR5 + 2TB NVMe.',
      basePrice: 18999.00, comparePrice: 19999.00,
      brandSlug: 'kore', categorySlug: 'pc-workstation',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'edicao-4k',
      specs: {
        cpu: 'AMD Ryzen 9 7950X',
        gpu: 'NVIDIA RTX 4080 SUPER 16GB',
        ram: '64GB DDR5 6000MHz CL30',
        mobo: 'MSI MAG X670E Tomahawk',
        storage: '2TB NVMe Gen4 + 4TB HDD',
        psu: 'EVGA SuperNOVA 850 G6',
        case: 'Lian Li O11 Dynamic Evo XL',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'davinci_4k_timeline': 60, 'premiere_4k_playback': 30, 'blender_classroom_render_s': 45 },
      tags: ['pc-pronto', 'workstation', 'edicao', '4k'], isFeatured: true,
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-creator-4k-bronze', size: 'Bronze',                                  stock: 2 },
        { sku: 'pc-creator-4k-ouro',   size: 'Ouro (RAM 128GB)', priceOverride: 22999.00, stock: 1 },
      ],
    },
    {
      slug: 'pc-kore-streamer-arena',
      name: 'Kore Tech Streamer Arena',
      description: 'PC pra streamar sem dropar frame. Core i7-14700K + RTX 4070 SUPER + 32GB DDR5 + NVENC dedicado.',
      basePrice: 11499.00,
      brandSlug: 'kore', categorySlug: 'pc-gamer',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'streaming',
      specs: {
        cpu: 'Intel Core i5-14600K',
        gpu: 'NVIDIA RTX 4070 SUPER 12GB',
        ram: '32GB DDR5 6000MHz CL30',
        mobo: 'ASUS ROG Strix Z790-E',
        storage: '1TB NVMe Gen4 + 2TB HDD',
        psu: 'Corsair RM750x',
        case: 'NZXT H7 Flow',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'valorant_1080p_high_stream': 240, 'apex_1440p_high_stream': 130, 'gta5_1440p_high_stream': 100 },
      tags: ['pc-pronto', 'streaming', 'intel'],
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-streamer-arena-bronze', size: 'Bronze',                                stock: 3 },
      ],
    },
    {
      slug: 'pc-kore-llama-forge',
      name: 'Kore Tech Llama Forge',
      description: 'Workstation IA local. Ryzen 9 7950X + RTX 5080 + 64GB DDR5 + 2TB NVMe Gen5. Roda Llama 70B com offload eficiente.',
      basePrice: 28499.00,
      brandSlug: 'kore', categorySlug: 'pc-workstation',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'ia-local-llama',
      specs: {
        cpu: 'AMD Ryzen 9 7950X',
        gpu: 'NVIDIA RTX 5080 16GB',
        ram: '64GB DDR5 6000MHz CL30',
        mobo: 'ASUS ROG Crosshair X670E Extreme',
        storage: '2TB NVMe Gen5',
        psu: 'Corsair HX1000i Platinum',
        case: 'Lian Li O11 Dynamic Evo XL',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'llama_7b_tokens_per_sec': 110, 'llama_70b_tokens_per_sec': 22, 'sdxl_1024_steps_per_sec': 6.5 },
      tags: ['pc-pronto', 'workstation', 'ia', 'llama'], isFeatured: true,
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-llama-forge-prata', size: 'Prata',                                   stock: 1 },
        { sku: 'pc-llama-forge-ouro',  size: 'Ouro (RAM 128GB + 4TB)', priceOverride: 33999.00, stock: 1 },
      ],
    },
    {
      slug: 'pc-kore-blender-rig',
      name: 'Kore Tech Blender Rig',
      description: 'Workstation 3D. Ryzen 9 7950X + RTX 4080 SUPER + 64GB DDR5. Render OptiX rapidíssimo.',
      basePrice: 17999.00,
      brandSlug: 'kore', categorySlug: 'pc-workstation',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'workstation-3d',
      specs: {
        cpu: 'AMD Ryzen 9 7950X',
        gpu: 'NVIDIA RTX 4080 SUPER 16GB',
        ram: '64GB DDR5 6000MHz CL30',
        mobo: 'MSI MAG X670E Tomahawk',
        storage: '2TB NVMe Gen4',
        psu: 'EVGA SuperNOVA 850 G6',
        case: 'Lian Li O11 Dynamic Evo XL',
        cooler: 'NZXT Kraken Elite 360',
      },
      compatibility: {},
      benchmarkFps: { 'blender_classroom_render_s': 20, 'unreal_lumen_viewport': 60, 'cinebench_r24_multi': 1850 },
      tags: ['pc-pronto', 'workstation', '3d', 'blender'],
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-blender-rig-bronze', size: 'Bronze', stock: 2 },
      ],
    },
    {
      slug: 'pc-kore-starter-gamer',
      name: 'Kore Tech Starter Gamer',
      description: 'Primeiro PC gamer. Ryzen 5 7600X + RTX 4060 + 32GB DDR5 + 1TB NVMe. Roda os jogos atuais em 1080p high.',
      basePrice: 5499.00, comparePrice: 5999.00,
      brandSlug: 'kore', categorySlug: 'pc-gamer',
      buildType: 'pc_pronto', hardwareCategory: 'pc_full',
      personaSlug: 'entry-gamer',
      specs: {
        cpu: 'AMD Ryzen 5 7600X',
        gpu: 'NVIDIA RTX 4060 8GB',
        ram: '32GB DDR5 5600MHz CL36',
        mobo: 'ASUS TUF B650-Plus WiFi',
        storage: '1TB NVMe Gen4',
        psu: 'Corsair RM550x',
        case: 'Cooler Master NR200P',
        cooler: 'Cooler Master Hyper 212 Black',
      },
      compatibility: {},
      benchmarkFps: { 'valorant_1080p_high': 220, 'fortnite_1080p_high': 144, 'apex_1080p_high': 150, 'cs2_1080p_high': 200 },
      tags: ['pc-pronto', 'entry', 'amd', 'custo-beneficio'], isFeatured: true,
      warrantyMonths: 12,
      imageUrl: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1200&q=80',
      variations: [
        { sku: 'pc-starter-bronze', size: 'Bronze',                              stock: 6 },
        { sku: 'pc-starter-prata',  size: 'Prata (RAM 64GB)', priceOverride: 6299.00, stock: 4 },
      ],
    },
  ]
}

async function seedProducts(refs: SeedRefs) {
  const all = [
    ...cpuSeeds(),
    ...gpuSeeds(),
    ...moboSeeds(),
    ...ramSeeds(),
    ...psuSeeds(),
    ...caseSeeds(),
    ...coolerSeeds(),
    ...monitorSeeds(),
    ...peripheralSeeds(),
    ...pcSeeds(),
  ]

  let created = 0
  for (const p of all) {
    await upsertProduct(p, refs)
    created++
  }
  console.log(`✔ Produtos: ${created} (componentes + PCs + monitores + periféricos)`)
}

// =============================================================================
// 8) COUPONS — 5 cupons MVP
// =============================================================================
async function seedCoupons() {
  // Schema atual usa CouponType enum (PERCENT|FIXED|FREE_SHIPPING) e value
  // como número (5 = 5%). Regras adicionais (requiresCartSource, etc) ainda
  // não estão no schema — aqui criamos a base que o lib/coupon.ts entende.
  const data = [
    {
      code: 'BEMVINDO5',
      type: 'PERCENT' as const,
      value: new Prisma.Decimal(5),
      perUserLimit: 1,
      isActive: true,
    },
    {
      code: 'PIXFIRST',
      type: 'PERCENT' as const,
      value: new Prisma.Decimal(5),
      perUserLimit: 999,
      isActive: true,
    },
    {
      code: 'BUILDER10',
      type: 'PERCENT' as const,
      value: new Prisma.Decimal(10),
      perUserLimit: 999,
      isActive: true,
    },
    {
      code: 'COMBO15',
      type: 'PERCENT' as const,
      value: new Prisma.Decimal(15),
      perUserLimit: 999,
      isActive: true,
    },
    {
      code: 'FRETE15',
      type: 'FREE_SHIPPING' as const,
      value: null,
      minOrderValue: new Prisma.Decimal(5000),
      perUserLimit: 999,
      // 60 dias a partir de agora
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]
  const created = await Promise.all(
    data.map(c => prisma.coupon.upsert({
      where:  { code: c.code },
      create: c,
      update: c,
    })),
  )
  console.log(`✔ Cupons: ${created.length}`)
  return created
}

// =============================================================================
// MAIN
// =============================================================================
async function main() {
  console.log('🌱 Kore Tech — seed iniciando... [build 2026-04-27 v2 unsplash]\n')

  await seedAdmin()
  await seedStoreSettings()
  const brands     = await seedBrands()
  const categories = await seedCategories()
  const personas   = await seedPersonas()
  await seedCompatibilityRules()

  await seedProducts({ brands, categories, personas })

  await seedCoupons()

  console.log('\n✅ Seed concluído.')
}

main()
  .catch((e) => {
    console.error('[seed] erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
