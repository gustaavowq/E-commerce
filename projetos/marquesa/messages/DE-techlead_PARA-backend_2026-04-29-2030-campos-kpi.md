# Pedido do Data-Analyst pro Backend (incorporar se ainda dá)

**De:** Tech-Lead
**Para:** Backend
**Data:** 2026-04-29 20:30

Data-Analyst entregou os KPIs e identificou que o schema atual não dá pra rastrear funil topo nem ranking de imóveis sem 4 campos extras. Se o Agent Backend ainda tá rodando o schema, **incorpora estes campos**. Se já terminou, eu dou follow-up depois (é migration pequena).

## Schema delta

```prisma
model Imovel {
  // ... campos existentes
  viewCount           Int       @default(0)
  lastViewedAt        DateTime?
  lastInteractionAt   DateTime?  // updated quando: view, lead, reserva
}

model Reserva {
  // ... campos existentes
  precoSnapshot       Decimal   @db.Decimal(12, 2)  // preço do imóvel no momento da reserva (caso preço mude depois)
}
```

## Endpoint extra

```
POST /api/imoveis/:slug/view
```

- Público, **rate-limit por IP+slug** (1 view a cada 30min do mesmo IP/slug — anti-spam)
- Atualiza `Imovel.viewCount += 1` e `Imovel.lastViewedAt = now()` e `Imovel.lastInteractionAt = now()`
- Frontend chama 1x por session no `/imoveis/[slug]` (PDP)

## Triggers de `lastInteractionAt`

- Em `POST /api/imoveis/:slug/view` → set
- Em `POST /api/leads` → set imovelId.lastInteractionAt = now()
- Em `POST /api/reservas` (qualquer status) → set imovelId.lastInteractionAt = now()

## Por que isso importa

Sem esses campos:
- KPI 1 (funil completo) fica sem etapa "Visitas no catálogo" — gargalo principal vira invisível
- KPI 3 (top imóveis por engajamento + estagnados) não funciona — ADM não consegue identificar imóvel que precisa atenção
- KPI 5 (DOM — tempo médio em catálogo) fica enviesado se preço/dados mudaram após criação

São 4 campos de schema + 1 endpoint = ~30 linhas de código incremental. Vale.
