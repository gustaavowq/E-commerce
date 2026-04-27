// =============================================================================
// PC Builder — motor de compatibilidade
//
// Recebe um conjunto de partes (IDs) e retorna lista de issues + sugestões.
// Cada regra implementada tem um ruleType correspondente em CompatibilityRule
// (ver seed). Manter sincronizado: regras nasceram da PESQUISA-NICHO seção 4
// e dos pains do comprador (seção 11).
//
// Filosofia:
//   - 'error':   bloqueia compra (socket errado, fonte fraca de verdade)
//   - 'warning': aceita compra mas alerta (bottleneck previsto, sem upgrade
//                de PCIe matching, RAM em só 1 stick = perde dual-channel)
// =============================================================================
import type { Product } from '@prisma/client'
import { prisma } from './prisma.js'

// -----------------------------------------------------------------------------
// Tipos
// -----------------------------------------------------------------------------
export type BuildParts = {
  cpuId?:        string | null
  moboId?:       string | null
  ramIds?:       string[]
  gpuId?:        string | null
  psuId?:        string | null
  caseId?:       string | null
  coolerId?:     string | null
  storageIds?:   string[]
}

export type CompatibilityIssue = {
  severity: 'error' | 'warning' | 'info'
  code:     string                   // 'SOCKET_MISMATCH', 'PSU_INSUFFICIENT', etc
  message:  string
  affectedParts?: string[]           // IDs das peças envolvidas
  suggestion?: {
    type:        string              // 'upgrade_psu', 'change_cooler', 'add_ram_stick'
    minWattage?: number
    minMhz?:     number
    notes?:      string
  } | null
}

export type CompatibilityResult = {
  status:                'ok' | 'warning' | 'error'
  issues:                CompatibilityIssue[]
  totalWattage:          number      // soma dos TDPs do que tem fonte (CPU+GPU principalmente)
  recommendedPsuWattage: number      // wattagem da fonte recomendada (com headroom)
  parts:                 BuildPartsLoaded
}

export type LoadedPart = Omit<Pick<Product, 'id' | 'slug' | 'name' | 'basePrice' | 'compatibility' | 'specs' | 'hardwareCategory'>, 'basePrice'> & {
  basePrice: number
}

export type BuildPartsLoaded = {
  cpu?:     LoadedPart
  mobo?:    LoadedPart
  rams:     LoadedPart[]
  gpu?:     LoadedPart
  psu?:     LoadedPart
  case_?:   LoadedPart
  cooler?:  LoadedPart
  storages: LoadedPart[]
}

// -----------------------------------------------------------------------------
// Helpers de leitura segura do JSON `compatibility`
// -----------------------------------------------------------------------------
function compat(p: LoadedPart | undefined): Record<string, unknown> {
  if (!p) return {}
  if (typeof p.compatibility === 'object' && p.compatibility !== null && !Array.isArray(p.compatibility)) {
    return p.compatibility as Record<string, unknown>
  }
  return {}
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}
function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}
function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
}

// -----------------------------------------------------------------------------
// Carrega peças do banco (uma única query SELECT IN)
// -----------------------------------------------------------------------------
export async function loadParts(input: BuildParts): Promise<BuildPartsLoaded> {
  const ids = [
    input.cpuId, input.moboId, input.gpuId, input.psuId, input.caseId, input.coolerId,
    ...(input.ramIds ?? []),
    ...(input.storageIds ?? []),
  ].filter((x): x is string => typeof x === 'string' && x.length > 0)

  if (ids.length === 0) {
    return { rams: [], storages: [] }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: Array.from(new Set(ids)) }, isActive: true },
    select: {
      id: true, slug: true, name: true,
      basePrice: true, compatibility: true, specs: true,
      hardwareCategory: true,
    },
  })

  const byId = new Map<string, LoadedPart>(
    products.map((p): [string, LoadedPart] => [
      p.id,
      { ...p, basePrice: Number(p.basePrice) },
    ]),
  )

  return {
    cpu:    input.cpuId    ? byId.get(input.cpuId)    : undefined,
    mobo:   input.moboId   ? byId.get(input.moboId)   : undefined,
    gpu:    input.gpuId    ? byId.get(input.gpuId)    : undefined,
    psu:    input.psuId    ? byId.get(input.psuId)    : undefined,
    case_:  input.caseId   ? byId.get(input.caseId)   : undefined,
    cooler: input.coolerId ? byId.get(input.coolerId) : undefined,
    rams:     (input.ramIds     ?? []).map(id => byId.get(id)).filter((p): p is LoadedPart => !!p),
    storages: (input.storageIds ?? []).map(id => byId.get(id)).filter((p): p is LoadedPart => !!p),
  }
}

// -----------------------------------------------------------------------------
// Cálculo de wattagem total
//   Soma TDP de CPU + TDP de GPU + ~50W base (mobo/storage/fans) por peça avulsa.
//   PSU recomendada = totalWattage * 1.30 arredondado pra próximo step (550, 650,
//   750, 850, 1000, 1200, 1500). Headroom 30% = típico de fabricantes pra
//   eficiência ideal e suportar picos transientes (RTX 50 vai a 600W spike).
// -----------------------------------------------------------------------------
const PSU_STEPS = [450, 550, 650, 750, 850, 1000, 1200, 1500, 1600] as const

export function computeWattage(parts: BuildPartsLoaded): { total: number; recommended: number } {
  let total = 0

  total += asNumber(compat(parts.cpu).tdpW) ?? 0
  total += asNumber(compat(parts.gpu).tdpW) ?? 0
  // Base de mobo + RAM + storage + fans + ventilação (~50W folga combinada)
  total += 60
  total += parts.rams.length * 5
  total += parts.storages.length * 8
  // Cooler AIO (water) consome um pouco mais que air. Heurística conservadora.
  if (asNumber(compat(parts.cooler).heightMm) === undefined && parts.cooler) {
    total += 10
  }

  // 30% headroom + arredonda pro step real comercializado
  const withHeadroom = Math.ceil(total * 1.30)
  const recommended = PSU_STEPS.find(s => s >= withHeadroom) ?? PSU_STEPS[PSU_STEPS.length - 1]!

  return { total, recommended }
}

// -----------------------------------------------------------------------------
// Regras de compatibilidade
// Cada regra retorna 0+ issues. Ordem importa pra ux (erro de socket vem antes
// de warning de bottleneck).
// -----------------------------------------------------------------------------

function ruleSocketMatch(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.cpu || !parts.mobo) return []
  const cpuSocket  = asString(compat(parts.cpu).socket)
  const moboSocket = asString(compat(parts.mobo).socket)
  if (!cpuSocket || !moboSocket) return []
  if (cpuSocket !== moboSocket) {
    return [{
      severity: 'error',
      code:     'SOCKET_MISMATCH',
      message:  `O socket da CPU (${cpuSocket}) não bate com o da placa-mãe (${moboSocket}). Troque um dos dois.`,
      affectedParts: [parts.cpu.id, parts.mobo.id],
      suggestion: { type: 'change_mobo', notes: `Procure mobo com socket ${cpuSocket}` },
    }]
  }
  return []
}

function ruleRamCompatMobo(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (parts.rams.length === 0 || !parts.mobo) return []
  const moboType = asString(compat(parts.mobo).ramType)
  const moboMaxMhz = asNumber(compat(parts.mobo).maxRamMhz)
  const moboSlots  = asNumber(compat(parts.mobo).ramSlots) ?? 4

  const issues: CompatibilityIssue[] = []

  // Tipo (DDR4/DDR5)
  for (const ram of parts.rams) {
    const ramType = asString(compat(ram).type)
    if (moboType && ramType && moboType !== ramType) {
      issues.push({
        severity: 'error',
        code:     'RAM_TYPE_MISMATCH',
        message:  `A RAM ${ram.name} é ${ramType}, mas a placa-mãe aceita ${moboType}.`,
        affectedParts: [ram.id, parts.mobo.id],
        suggestion: { type: 'change_ram', notes: `Procure RAM ${moboType}` },
      })
    }
  }

  // Slots disponíveis
  const sticks = parts.rams.reduce((s, r) => s + (asNumber(compat(r).sticks) ?? 1), 0)
  if (sticks > moboSlots) {
    issues.push({
      severity: 'error',
      code:     'RAM_SLOTS_EXCEEDED',
      message:  `A placa-mãe tem ${moboSlots} slots, mas você selecionou ${sticks} pentes de RAM.`,
      affectedParts: [parts.mobo.id, ...parts.rams.map(r => r.id)],
      suggestion: { type: 'reduce_ram_sticks', notes: `Reduza pra ${moboSlots} pentes ou troque a mobo` },
    })
  }

  // Velocidade — warning se RAM mais rápida que mobo aguenta (vai cair pro max suportado)
  for (const ram of parts.rams) {
    const ramMhz = asNumber(compat(ram).mhz)
    if (moboMaxMhz && ramMhz && ramMhz > moboMaxMhz) {
      issues.push({
        severity: 'warning',
        code:     'RAM_SPEED_LIMITED',
        message:  `A RAM ${ram.name} roda em ${ramMhz} MHz, mas a placa-mãe limita em ${moboMaxMhz} MHz. Vai funcionar, mas perdendo performance.`,
        affectedParts: [ram.id, parts.mobo.id],
        suggestion: { type: 'upgrade_mobo', minMhz: ramMhz },
      })
    }
  }

  // Single channel: avisa se só 1 stick em mobo de 2+ slots (perde performance dual-channel)
  if (sticks === 1 && moboSlots >= 2) {
    issues.push({
      severity: 'warning',
      code:     'RAM_SINGLE_CHANNEL',
      message:  'Você tá com 1 pente só. Adicione mais 1 igual pra ativar dual-channel (ganho ~10-15% em jogos).',
      affectedParts: [parts.mobo.id, ...parts.rams.map(r => r.id)],
      suggestion: { type: 'add_ram_stick', notes: 'Adicione 1 pente igual ou kit 2x' },
    })
  }

  return issues
}

function rulePsuWattage(parts: BuildPartsLoaded, totalWattage: number, recommended: number): CompatibilityIssue[] {
  if (!parts.psu) return []
  const psuWattage = asNumber(compat(parts.psu).wattage)
  if (!psuWattage) return []

  // Crítico: fonte abaixo do consumo total + 10% (perigo real de desligamento)
  if (psuWattage < totalWattage * 1.10) {
    return [{
      severity: 'error',
      code:     'PSU_INSUFFICIENT',
      message:  `Sua fonte (${psuWattage}W) é insuficiente pro consumo previsto (${totalWattage}W). Troque por uma de no mínimo ${recommended}W.`,
      affectedParts: [parts.psu.id],
      suggestion: { type: 'upgrade_psu', minWattage: recommended },
    }]
  }
  // Warning: dentro do limite mas sem o headroom recomendado de 30%
  if (psuWattage < recommended) {
    return [{
      severity: 'warning',
      code:     'PSU_TIGHT',
      message:  `Sua fonte (${psuWattage}W) tá no limite. O recomendado é ${recommended}W pra ter folga e não estressar a fonte.`,
      affectedParts: [parts.psu.id],
      suggestion: { type: 'upgrade_psu', minWattage: recommended },
    }]
  }
  return []
}

function ruleGpuPowerConnectors(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.gpu || !parts.psu) return []
  const gpuConnectors = asStringArray(compat(parts.gpu).powerConnectors)
  if (gpuConnectors.length === 0) return []

  const psuConnectors = compat(parts.psu).connectors
  if (typeof psuConnectors !== 'object' || psuConnectors === null) return []
  const psuConn = psuConnectors as Record<string, unknown>

  const need8pin = gpuConnectors.filter(c => c === '8pin' || c === '8-pin' || c === '6+2pin').length
  const need12vhpwr = gpuConnectors.filter(c => c === '12vhpwr' || c === '16pin').length

  const have8pin     = asNumber(psuConn.gpu_8pin)     ?? 0
  const have12vhpwr  = asNumber(psuConn.gpu_12vhpwr)  ?? 0

  const issues: CompatibilityIssue[] = []
  if (need8pin > have8pin) {
    issues.push({
      severity: 'error',
      code:     'PSU_MISSING_8PIN',
      message:  `A GPU pede ${need8pin} conector 8-pin PCIe, sua fonte tem ${have8pin}. Use adaptador ou troque a fonte.`,
      affectedParts: [parts.gpu.id, parts.psu.id],
      suggestion: { type: 'upgrade_psu', notes: `Procure fonte com pelo menos ${need8pin} conector 8-pin PCIe` },
    })
  }
  if (need12vhpwr > have12vhpwr) {
    issues.push({
      severity: 'error',
      code:     'PSU_MISSING_12VHPWR',
      message:  `A GPU pede conector 12VHPWR (16-pin) novo padrão. Sua fonte não tem. Compre fonte ATX 3.0 com 12VHPWR.`,
      affectedParts: [parts.gpu.id, parts.psu.id],
      suggestion: { type: 'upgrade_psu', notes: 'Procure fonte ATX 3.0 com 12VHPWR' },
    })
  }
  return issues
}

function ruleGpuFitsCase(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.gpu || !parts.case_) return []
  const gpuLength = asNumber(compat(parts.gpu).lengthMm)
  const caseMax   = asNumber(compat(parts.case_).maxGpuLengthMm)
  if (!gpuLength || !caseMax) return []
  if (gpuLength > caseMax) {
    return [{
      severity: 'error',
      code:     'GPU_TOO_LONG',
      message:  `A GPU tem ${gpuLength}mm de comprimento, mas o gabinete só comporta até ${caseMax}mm. Não vai entrar.`,
      affectedParts: [parts.gpu.id, parts.case_.id],
      suggestion: { type: 'change_case', notes: `Procure gabinete com max GPU ${gpuLength}mm+` },
    }]
  }
  return []
}

function ruleCoolerFitsCase(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.cooler || !parts.case_) return []
  const coolerHeight = asNumber(compat(parts.cooler).heightMm)
  const caseMax      = asNumber(compat(parts.case_).maxCoolerHeightMm)
  if (!coolerHeight || !caseMax) return []
  if (coolerHeight > caseMax) {
    return [{
      severity: 'error',
      code:     'COOLER_TOO_TALL',
      message:  `O cooler tem ${coolerHeight}mm de altura, mas o gabinete comporta até ${caseMax}mm. A tampa lateral não fecha.`,
      affectedParts: [parts.cooler.id, parts.case_.id],
      suggestion: { type: 'change_cooler', notes: `Procure cooler de até ${caseMax}mm OU gabinete maior` },
    }]
  }
  return []
}

function ruleCoolerSupportsCpu(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.cooler || !parts.cpu) return []
  const coolerSockets = asStringArray(compat(parts.cooler).sockets)
  const cpuSocket = asString(compat(parts.cpu).socket)
  const cpuTdp    = asNumber(compat(parts.cpu).tdpW)
  const coolerTdp = asNumber(compat(parts.cooler).supportsTdpW)

  const issues: CompatibilityIssue[] = []
  if (cpuSocket && coolerSockets.length > 0 && !coolerSockets.includes(cpuSocket)) {
    issues.push({
      severity: 'error',
      code:     'COOLER_SOCKET_MISMATCH',
      message:  `O cooler não suporta o socket ${cpuSocket} da sua CPU.`,
      affectedParts: [parts.cooler.id, parts.cpu.id],
      suggestion: { type: 'change_cooler', notes: `Procure cooler com kit pra ${cpuSocket}` },
    })
  }
  if (cpuTdp && coolerTdp && coolerTdp < cpuTdp) {
    issues.push({
      severity: 'warning',
      code:     'COOLER_UNDERSPEC',
      message:  `O cooler aguenta ${coolerTdp}W, mas a CPU tem ${cpuTdp}W de TDP. Vai esquentar e fazer thermal throttling em carga pesada.`,
      affectedParts: [parts.cooler.id, parts.cpu.id],
      suggestion: { type: 'change_cooler', notes: `Procure cooler que aguente ${cpuTdp}W+` },
    })
  }
  return issues
}

function ruleMoboFormFactor(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (!parts.mobo || !parts.case_) return []
  const moboFf = asString(compat(parts.mobo).formFactor)
  const caseFf = asString(compat(parts.case_).formFactor)
  if (!moboFf || !caseFf) return []

  // Compatibilidade hierárquica: case ATX aceita ATX/mATX/ITX. mATX aceita
  // mATX/ITX. ITX só ITX. E-ATX só E-ATX (ou case full-tower).
  const order = ['ITX', 'mATX', 'ATX', 'E-ATX']
  const moboIdx = order.indexOf(moboFf)
  const caseIdx = order.indexOf(caseFf)
  if (moboIdx === -1 || caseIdx === -1) return []
  if (moboIdx > caseIdx) {
    return [{
      severity: 'error',
      code:     'MOBO_TOO_LARGE',
      message:  `A placa-mãe é ${moboFf}, mas o gabinete só comporta ${caseFf}. Troque um dos dois.`,
      affectedParts: [parts.mobo.id, parts.case_.id],
      suggestion: { type: 'change_case', notes: `Procure gabinete ${moboFf} ou maior` },
    }]
  }
  return []
}

function ruleStorageM2Slots(parts: BuildPartsLoaded): CompatibilityIssue[] {
  if (parts.storages.length === 0 || !parts.mobo) return []
  const m2Slots = asNumber(compat(parts.mobo).m2Slots)
  if (!m2Slots) return []
  const m2Storages = parts.storages.filter(s => {
    const interfaceType = asString(compat(s).interface)
    return interfaceType?.toLowerCase().includes('nvme') || interfaceType?.toLowerCase().includes('m.2')
  })
  if (m2Storages.length > m2Slots) {
    return [{
      severity: 'error',
      code:     'M2_SLOTS_EXCEEDED',
      message:  `A placa-mãe tem ${m2Slots} slot(s) M.2, mas você selecionou ${m2Storages.length} SSD(s) NVMe.`,
      affectedParts: [parts.mobo.id, ...m2Storages.map(s => s.id)],
      suggestion: { type: 'reduce_storage', notes: `Reduza pra ${m2Slots} SSDs M.2 ou use SSD SATA` },
    }]
  }
  return []
}

// -----------------------------------------------------------------------------
// Função principal — checa tudo
// -----------------------------------------------------------------------------
export async function checkBuildCompatibility(input: BuildParts): Promise<CompatibilityResult> {
  const parts = await loadParts(input)
  const wattage = computeWattage(parts)

  const issues: CompatibilityIssue[] = [
    ...ruleSocketMatch(parts),
    ...ruleRamCompatMobo(parts),
    ...rulePsuWattage(parts, wattage.total, wattage.recommended),
    ...ruleGpuPowerConnectors(parts),
    ...ruleGpuFitsCase(parts),
    ...ruleCoolerFitsCase(parts),
    ...ruleCoolerSupportsCpu(parts),
    ...ruleMoboFormFactor(parts),
    ...ruleStorageM2Slots(parts),
  ]

  // Ordena: errors primeiro, warnings depois, infos por último
  const order = { error: 0, warning: 1, info: 2 } as const
  issues.sort((a, b) => order[a.severity] - order[b.severity])

  const status: CompatibilityResult['status'] =
    issues.some(i => i.severity === 'error')   ? 'error' :
    issues.some(i => i.severity === 'warning') ? 'warning' : 'ok'

  return {
    status,
    issues,
    totalWattage:          wattage.total,
    recommendedPsuWattage: wattage.recommended,
    parts,
  }
}

// -----------------------------------------------------------------------------
// Recomenda PSUs disponíveis no catálogo que atendem a wattagem mínima.
// Retorna até 3 opções (mais barata, intermediária, melhor cert).
// -----------------------------------------------------------------------------
export async function recommendPsus(input: BuildParts, opts: { limit?: number } = {}) {
  const parts = await loadParts(input)
  const wattage = computeWattage(parts)
  const limit = opts.limit ?? 3

  // Busca PSUs ativas com wattagem >= recomendada. Filtra em código (JSON).
  const candidates = await prisma.product.findMany({
    where: {
      isActive: true,
      hardwareCategory: 'psu',
    },
    select: {
      id: true, slug: true, name: true,
      basePrice: true, compatibility: true,
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  })

  const filtered = candidates
    .map(p => ({
      ...p,
      basePrice: Number(p.basePrice),
      wattage:   asNumber((p.compatibility as Record<string, unknown> | null)?.wattage) ?? 0,
      certification: asString((p.compatibility as Record<string, unknown> | null)?.certification) ?? '',
    }))
    .filter(p => p.wattage >= wattage.recommended)
    .sort((a, b) => a.basePrice - b.basePrice)
    .slice(0, limit)

  return {
    totalWattage:          wattage.total,
    recommendedWattage:    wattage.recommended,
    suggestions: filtered.map(p => ({
      productId:     p.id,
      slug:          p.slug,
      name:          p.name,
      wattage:       p.wattage,
      certification: p.certification,
      price:         p.basePrice,
      thumbnail:     p.images[0]?.url ?? null,
    })),
  }
}
