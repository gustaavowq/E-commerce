# SQL / Prisma snippets — KPIs Marquesa

> Snippets prontos pra colar em `projetos/marquesa/backend/src/routes/admin/dashboard.ts`. Onde o Prisma é limitado (agregação aninhada), uso `$queryRaw` com Postgres puro.
>
> Convenções:
> - Importa `prisma` de `../../lib/prisma`.
> - Helpers `windowFromDays(days)` retorna `{ from, to }` em UTC.
> - Toda função pública exporta tipo `XxxKpi` em `src/types/dashboard.ts`.
> - Guarda div/0 em todas as taxas.
> - `Cache-Control: no-store` no middleware do router admin.

---

## Helper de janela

```typescript
// src/lib/dashboard-window.ts
export function windowFromDays(days = 30) {
  const to = new Date()
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)
  return { from, to }
}

export function previousWindow(days = 30) {
  const { from } = windowFromDays(days)
  const prevTo = from
  const prevFrom = new Date(prevTo.getTime() - days * 24 * 60 * 60 * 1000)
  return { from: prevFrom, to: prevTo }
}

export function safeRatio(num: number, denom: number) {
  return denom === 0 ? 0 : num / denom
}
```

---

## KPI 1 — Funil completo

```typescript
// GET /api/admin/dashboard/funil?days=30
export async function getFunil(days = 30) {
  const { from, to } = windowFromDays(days)

  // Etapa 1 — Visitas (somente se Imovel.viewCount + ImovelView existirem)
  const visitas = await prisma.imovel.aggregate({
    _sum: { viewCount: true },
    where: { lastViewedAt: { gte: from, lte: to } },
  })

  // Etapa 2 — Leads
  const leads = await prisma.lead.count({
    where: { createdAt: { gte: from, lte: to } },
  })

  // Etapa 3 — Reservas pagas
  const reservasPagas = await prisma.reserva.count({
    where: {
      pagamentoStatus: 'APROVADO',
      paidAt: { gte: from, lte: to },
    },
  })

  // Etapa 4 — Fechamentos
  const fechamentos = await prisma.reserva.count({
    where: {
      status: 'CONVERTIDA',
      updatedAt: { gte: from, lte: to },
    },
  })

  const v = visitas._sum.viewCount ?? 0
  const etapas = [
    { label: 'Visitas',        valor: v,            convNext: safeRatio(leads, v) },
    { label: 'Leads',          valor: leads,        convNext: safeRatio(reservasPagas, leads) },
    { label: 'Reservas pagas', valor: reservasPagas,convNext: safeRatio(fechamentos, reservasPagas) },
    { label: 'Fechamentos',    valor: fechamentos,  convNext: null },
  ]

  // Detecta gargalo (menor convNext entre os 3 primeiros)
  const gargaloIdx = etapas.slice(0, 3).reduce((min, et, i, arr) =>
    (et.convNext ?? 1) < (arr[min].convNext ?? 1) ? i : min, 0)
  const gargalo = `${etapas[gargaloIdx].label} → ${etapas[gargaloIdx + 1].label}`

  return { window: { from, to }, etapas, gargalo }
}
```

---

## KPI 2 — Sinais pagos vs recusados

```typescript
// GET /api/admin/dashboard/sinais-status?days=30
export async function getSinaisStatus(days = 30) {
  const { from, to } = windowFromDays(days)

  const grouped = await prisma.reserva.groupBy({
    by: ['pagamentoStatus'],
    _count: { _all: true },
    where: { createdAt: { gte: from, lte: to } },
  })

  const total = grouped.reduce((s, g) => s + g._count._all, 0)
  const fatias = grouped.map(g => ({
    status: g.pagamentoStatus,
    count: g._count._all,
    pct: safeRatio(g._count._all, total),
  }))

  return { window: { from, to }, total, fatias }
}
```

---

## KPI 3 — Top imóveis por engajamento + estagnados

```typescript
// GET /api/admin/dashboard/imoveis-engajamento?topN=5&days=30
export async function getImoveisEngajamento(topN = 5, days = 30) {
  const { from, to } = windowFromDays(days)

  // Top engajamento — score = views*1 + leads*5 + reservas*20
  // Postgres puro pela agregação ranqueada
  const top = await prisma.$queryRaw<Array<{
    id: string
    slug: string
    titulo: string
    bairro: string
    preco: bigint
    views: number
    leads: number
    reservas: number
    score: number
  }>>`
    SELECT
      i.id, i.slug, i.titulo, i.bairro, i.preco,
      COALESCE(i."viewCount", 0)::int AS views,
      COUNT(DISTINCT l.id)::int       AS leads,
      COUNT(DISTINCT r.id)::int       AS reservas,
      (COALESCE(i."viewCount", 0)
       + COUNT(DISTINCT l.id) * 5
       + COUNT(DISTINCT r.id) * 20)::int AS score
    FROM "Imovel" i
    LEFT JOIN "Lead"    l ON l."imovelId" = i.id AND l."createdAt" BETWEEN ${from} AND ${to}
    LEFT JOIN "Reserva" r ON r."imovelId" = i.id AND r."createdAt" BETWEEN ${from} AND ${to}
    WHERE i.status = 'DISPONIVEL'
    GROUP BY i.id
    ORDER BY score DESC
    LIMIT ${topN};
  `

  // Estagnados — sem interação > 30d
  const estagnados = await prisma.imovel.findMany({
    where: {
      status: 'DISPONIVEL',
      lastInteractionAt: { lt: new Date(Date.now() - 30 * 86400_000) },
    },
    select: { id: true, slug: true, titulo: true, bairro: true, preco: true, lastInteractionAt: true, createdAt: true },
    orderBy: { lastInteractionAt: 'asc' },
    take: topN,
  })

  return { window: { from, to }, top, estagnados }
}
```

---

## KPI 4 — Ticket médio + delta vs período anterior

```typescript
// GET /api/admin/dashboard/ticket-medio?days=30
export async function getTicketMedio(days = 30) {
  const cur = windowFromDays(days)
  const prev = previousWindow(days)

  const calc = async ({ from, to }: { from: Date; to: Date }) => {
    const result = await prisma.$queryRaw<Array<{ avg: number | null }>>`
      SELECT AVG(i.preco)::float AS avg
      FROM "Reserva" r
      JOIN "Imovel" i ON i.id = r."imovelId"
      WHERE r."pagamentoStatus" = 'APROVADO'
        AND r."paidAt" BETWEEN ${from} AND ${to};
    `
    return result[0]?.avg ?? 0
  }

  const atual = await calc(cur)
  const anterior = await calc(prev)
  const delta = anterior === 0 ? null : (atual - anterior) / anterior

  return { window: cur, atual, anterior, delta }
}
```

---

## KPI 5 — DOM (tempo médio em catálogo)

```typescript
// GET /api/admin/dashboard/dom?days=180
export async function getDom(days = 180) {
  const { from, to } = windowFromDays(days)

  const result = await prisma.$queryRaw<Array<{ dom_medio: number | null }>>`
    SELECT AVG(EXTRACT(DAY FROM (primeira_reserva.first_paid - i."createdAt")))::float AS dom_medio
    FROM "Imovel" i
    JOIN (
      SELECT "imovelId", MIN("paidAt") AS first_paid
      FROM "Reserva"
      WHERE "pagamentoStatus" = 'APROVADO'
        AND "paidAt" IS NOT NULL
      GROUP BY "imovelId"
    ) primeira_reserva ON primeira_reserva."imovelId" = i.id
    WHERE i."createdAt" BETWEEN ${from} AND ${to};
  `

  return { window: { from, to }, domMedio: result[0]?.dom_medio ?? 0 }
}
```

---

## KPI 6 — Conversão lead → reserva paga

```typescript
// GET /api/admin/dashboard/conversao-lead?days=30
export async function getConversaoLead(days = 30) {
  const { from, to } = windowFromDays(days)

  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: from, lte: to } },
    select: { email: true, userId: true },
  })

  if (leads.length === 0) return { window: { from, to }, taxa: 0, leads: 0, reservas: 0 }

  const userIds = leads.map(l => l.userId).filter((id): id is string => !!id)
  const emails = leads.map(l => l.email)

  const reservas = await prisma.reserva.count({
    where: {
      pagamentoStatus: 'APROVADO',
      OR: [
        { userId: { in: userIds } },
        { user: { email: { in: emails } } },
      ],
    },
  })

  return {
    window: { from, to },
    taxa: safeRatio(reservas, leads.length),
    leads: leads.length,
    reservas,
  }
}
```

---

## KPI 7 — Reservas ativas vs expiradas

```typescript
// GET /api/admin/dashboard/reservas-status?days=30
export async function getReservasStatus(days = 30) {
  const { from, to } = windowFromDays(days)

  const grouped = await prisma.reserva.groupBy({
    by: ['status'],
    _count: { _all: true },
    where: { createdAt: { gte: from, lte: to } },
  })

  const colunas = grouped.map(g => ({
    status: g.status,
    count: g._count._all,
  }))

  return { window: { from, to }, colunas, total: colunas.reduce((s, c) => s + c.count, 0) }
}
```

---

## KPI 8 — Receita prevista + confirmada

```typescript
// GET /api/admin/dashboard/receita?days=30
export async function getReceita(days = 30) {
  const { from, to } = windowFromDays(days)

  // Prevista — Reserva ATIVA com sinal aprovado (qualquer data; fluxo aberto agora)
  const prevista = await prisma.$queryRaw<Array<{ total: bigint | null; count: bigint }>>`
    SELECT SUM(i.preco) AS total, COUNT(*)::bigint AS count
    FROM "Reserva" r
    JOIN "Imovel" i ON i.id = r."imovelId"
    WHERE r.status = 'ATIVA'
      AND r."pagamentoStatus" = 'APROVADO';
  `

  // Confirmada — Reserva CONVERTIDA na janela
  const confirmada = await prisma.$queryRaw<Array<{ total: bigint | null; count: bigint }>>`
    SELECT SUM(i.preco) AS total, COUNT(*)::bigint AS count
    FROM "Reserva" r
    JOIN "Imovel" i ON i.id = r."imovelId"
    WHERE r.status = 'CONVERTIDA'
      AND r."updatedAt" BETWEEN ${from} AND ${to};
  `

  return {
    window: { from, to },
    prevista: {
      total: Number(prevista[0]?.total ?? 0),
      count: Number(prevista[0]?.count ?? 0),
    },
    confirmada: {
      total: Number(confirmada[0]?.total ?? 0),
      count: Number(confirmada[0]?.count ?? 0),
    },
  }
}
```

---

## KPI 9 — Taxa de fechamento

```typescript
// GET /api/admin/dashboard/taxa-fechamento?days=90
export async function getTaxaFechamento(days = 90) {
  const { from, to } = windowFromDays(days)

  const pagas = await prisma.reserva.count({
    where: {
      pagamentoStatus: 'APROVADO',
      paidAt: { gte: from, lte: to },
    },
  })

  const convertidas = await prisma.reserva.count({
    where: {
      status: 'CONVERTIDA',
      paidAt: { gte: from, lte: to },
    },
  })

  return {
    window: { from, to },
    taxa: safeRatio(convertidas, pagas),
    pagas,
    convertidas,
  }
}
```

---

## Alertas (cards do topo)

```typescript
// GET /api/admin/dashboard/alertas
export async function getAlertas() {
  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 3600_000)
  const days7Ago = new Date(now.getTime() - 7 * 86400_000)
  const days90Ago = new Date(now.getTime() - 90 * 86400_000)

  const reservasExpirando48h = await prisma.reserva.count({
    where: {
      status: 'ATIVA',
      pagamentoStatus: 'APROVADO',
      expiraEm: { lte: in48h, gte: now },
    },
  })

  const imoveisSemFoto = await prisma.imovel.count({
    where: {
      status: 'DISPONIVEL',
      // V2: relação Imovel.imagens com _count
      // Para MVP: uma coluna `imagensCount` precomputada ou contagem da tabela ImovelImagem
    },
  })

  const estagnados = await prisma.imovel.count({
    where: {
      status: 'DISPONIVEL',
      lastInteractionAt: { lt: days90Ago },
    },
  })

  // Rejeição MP rolling 7d
  const last7 = await prisma.reserva.groupBy({
    by: ['pagamentoStatus'],
    _count: { _all: true },
    where: { createdAt: { gte: days7Ago } },
  })
  const total7 = last7.reduce((s, g) => s + g._count._all, 0)
  const rejeitados7 = last7
    .filter(g => ['REJEITADO', 'CANCELADO'].includes(g.pagamentoStatus))
    .reduce((s, g) => s + g._count._all, 0)
  const pctRejeicao = safeRatio(rejeitados7, total7)

  const alertas = [] as Array<{ id: string; severity: 'info' | 'warning' | 'critical'; title: string; count: number }>

  if (reservasExpirando48h > 0) alertas.push({ id: 'exp48', severity: 'warning', title: 'Reservas expirando em 48h', count: reservasExpirando48h })
  if (imoveisSemFoto > 0)        alertas.push({ id: 'sem-foto', severity: 'warning', title: 'Imóveis sem foto suficiente', count: imoveisSemFoto })
  if (estagnados > 0)            alertas.push({ id: 'estagnados', severity: 'info', title: 'Imóveis estagnados > 90d', count: estagnados })
  if (pctRejeicao > 0.30)        alertas.push({ id: 'mp-rej', severity: 'critical', title: '% rejeição MP acima de 30% (7d)', count: Math.round(pctRejeicao * 100) })

  return { alertas, generatedAt: now.toISOString() }
}
```

---

## Bundle endpoint

```typescript
// GET /api/admin/dashboard/summary
// Chama todos paralelamente — Frontend faz uma única request no carregamento
export async function getSummary() {
  const [funil, sinais, engajamento, ticket, dom, conversao, reservas, receita, fechamento, alertas] =
    await Promise.all([
      getFunil(30),
      getSinaisStatus(30),
      getImoveisEngajamento(5, 30),
      getTicketMedio(30),
      getDom(180),
      getConversaoLead(30),
      getReservasStatus(30),
      getReceita(30),
      getTaxaFechamento(90),
      getAlertas(),
    ])

  return { funil, sinais, engajamento, ticket, dom, conversao, reservas, receita, fechamento, alertas }
}
```

---

## Schema sugestões pra Backend (campos extras)

Adicionar ao `Imovel`:

```prisma
model Imovel {
  // ... campos atuais
  viewCount         Int       @default(0)
  lastViewedAt      DateTime?
  lastInteractionAt DateTime? // MAX(lead.createdAt OR reserva.createdAt) — atualizado via trigger ou no service
  corretorId        String?   // V2 — quem capta
  corretor          User?     @relation("ImovelCorretor", fields: [corretorId], references: [id])

  @@index([status, lastInteractionAt])
  @@index([lastViewedAt])
}
```

Adicionar ao `Reserva`:

```prisma
model Reserva {
  // ... campos atuais
  precoSnapshot Decimal? @db.Decimal(15, 2)  // preço do imóvel no momento da reserva — protege de mudança futura
}
```

Endpoint de instrumentação:

```typescript
// POST /api/imoveis/:slug/view
// Frontend chama 1x por session (sessionStorage flag) ao carregar PDP
router.post('/:slug/view', async (req, res) => {
  const { slug } = req.params
  await prisma.imovel.update({
    where: { slug },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
      lastInteractionAt: new Date(),
    },
  })
  res.status(204).end()
})
```

E no service de criar Lead/Reserva, atualizar `lastInteractionAt` do imóvel.

---

## Tipos compartilhados (frontend lê do backend)

```typescript
// src/types/dashboard.ts
export type FunilEtapa = { label: string; valor: number; convNext: number | null }
export type FunilKpi = {
  window: { from: Date; to: Date }
  etapas: FunilEtapa[]
  gargalo: string
}

export type SinaisKpi = {
  window: { from: Date; to: Date }
  total: number
  fatias: { status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO' | 'REEMBOLSADO'; count: number; pct: number }[]
}

export type TicketMedioKpi = {
  window: { from: Date; to: Date }
  atual: number
  anterior: number
  delta: number | null
}

// ... idem pra os outros 6 KPIs
```
