# DE: data-analyst | PARA: techlead | 2026-04-29 22:30

## Entregues

- `copy/dashboard-kpis.md` — 9 KPIs do painel em ordem de prioridade, com fórmula, periodicidade, visualização, endpoint sugerido e threshold de alerta.
- `copy/funil-imobiliaria.md` — diagrama das 12 etapas do funil boutique BR, perguntas-chave que cada etapa responde no painel, mapeamento etapa → KPI, eventos a instrumentar.
- `copy/sql-snippets.md` — snippets Prisma + `$queryRaw` prontos pra colar em `backend/src/routes/admin/dashboard.ts`, incluindo helper `windowFromDays` + `safeRatio` (guarda div/0) + bundle `/summary`.

## Decisões importantes

- **Receita "prevista" usa preço cheio do imóvel** (Reserva ATIVA + APROVADO), não o sinal. Sinal é arras, não receita da Marquesa. Comissão real (V2) precisa do campo `Imovel.comissaoPct`.
- **Match Lead↔Reserva** por `userId` com fallback `email` — comprador pode preencher form sem cadastro e voltar logado.
- **Score de engajamento:** `views*1 + leads*5 + reservas*20`. Pesos refletem custo do funil.
- **Fora do MVP (V2):** LTV por cliente, CAC por canal, heatmap de bairros, status de Lead (NOVO/QUALIFICADO/...), AgendaVisita. Etapas 5-7 do funil ficam offline no MVP — corretor anota em CRM externo.

## Recomendação pra Backend (campos extras no schema)

```prisma
model Imovel {
  viewCount         Int       @default(0)
  lastViewedAt      DateTime?
  lastInteractionAt DateTime?  // MAX(lead.createdAt OR reserva.createdAt)
  corretorId        String?    // V2

  @@index([status, lastInteractionAt])
  @@index([lastViewedAt])
}

model Reserva {
  precoSnapshot Decimal? @db.Decimal(15, 2)  // protege de mudança de preço posterior
}
```

E novo endpoint público `POST /api/imoveis/:slug/view` (Frontend chama 1x por session no PDP) — alimenta KPI 1, 3 e alerta de estagnação.

## Validação

- Receita prevista NÃO conta `valorSinal` (correto — sinal não é receita): SIM
- Funil usa `pagamentoStatus='APROVADO'` (não `PENDENTE`): SIM
- Toda taxa tem guarda `denom === 0 ? 0 : ...`: SIM
- Janelas em UTC, exibição BR no Frontend: SIM
- `Cache-Control: no-store` no router admin: documentado

Bora pro Backend implementar — só esperar Backend confirmar campos extras antes de eu validar com queries reais no Postgres.
