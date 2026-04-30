# DE: backend-fix → PARA: tech-lead

**Data:** 2026-04-30 00:00
**Assunto:** Fix dos 4 bloqueadores QA no backend Marquesa

## Status

`tsc --noEmit` ok. `prisma validate` ok. `prisma generate` ok.

## Bloqueadores fechados

### B2 — Senha mínima 8 chars (sem requisito de char especial)

- `src/validators/auth.ts` — `strongPassword` agora exige só `min(8)` + blocklist anti senhas comuns; tirei regex de letra/número/especial. Mensagem alinhada com o frontend.
- `src/config/env.ts` — `SEED_*_PASSWORD` agora aceita `>= 8` (era 10).
- `prisma/seed.ts` — comentário atualizado.

### B3 — `GET /api/admin/leads` criado

- `src/routes/admin/leads.ts` (novo) — paginação `page/limit`, busca por nome/email, include `imovel{slug,titulo,bairro}` + `user{name,email}`, ordem `createdAt desc`.
- `src/routes/admin/index.ts` — registrado em `/admin/leads`. Já herda `requireAuth + requireRole(['ADMIN','ANALYST'])` do master router.

### B4 — `GET /api/admin/dashboard/summary` criado

- `src/routes/admin/dashboard.ts` — endpoint `/summary` retornando exatamente o shape pedido:
  - `funil` (4 etapas: Visitas → Leads → Sinais pagos → Vendidos)
  - `topImoveis` (top 5 por engagement = `viewCount + leads*5 + reservas*20`, via `$queryRaw` com nomes de coluna snake_case do schema)
  - `kpis` (9 campos: ticketMedio, conversao%, taxaFechamento%, receitaPrevista, receitaSinaisAtivos, reservasAtivasCount, totalImoveis, imoveisDisponiveis, imoveisVendidos)
  - `reservasAtivasResumo` (count + somaSinais + somaPrecoCheio)
- `/kpis` antigo mantido pra retrocompat.

### B5 — Defaults 5%/10d alinhados

- `src/config/env.ts` — `SINAL_DEFAULT_PERCENT=5`, `RESERVA_DURACAO_DIAS=10`.
- `.env`, `.env.example`, `.env.production.example` — todos atualizados.
- `prisma/schema.prisma` — `SiteSettings.sinalDefaultPercent @default(5)`, `reservaDuracaoDias @default(10)`. Comentários do schema (Reserva.expiraEm, ImovelStatus, ReservaStatus, header) atualizados pra "10d".
- `prisma/seed.ts` — fallbacks `?? 5` e `?? 10`.

### B1 (frontend) — backend agora aceita ambos os payloads em `PATCH /admin/reservas/:id`

- `src/validators/reserva.ts` — `adminPatchReservaSchema` aceita campo opcional `action: 'cancelar' | 'converter' | 'extender'`.
- `src/routes/admin/reservas.ts` — handler mapeia `action` → `status`/`extenderDias` antes de processar. `extender` sem dias usa `env.RESERVA_DURACAO_DIAS` (10). Backwards compatible: front pode mandar `{status,extenderDias}` direto OU `{action}`.

## Decisões tomadas

- **Schema default 5%/10d** ao invés de só env: cliente novo que não setar env já cai no padrão certo. Migration precisará ser gerada se DB já tem `SiteSettings` com defaults antigos (TODO devops).
- **Blocklist de senha enxuta**: removi entradas que ficavam abaixo de 8 chars (`qwerty`, `welcome`, `monkey`, `dragon`, `12345678`) — agora só barra senhas comuns >=8 que passariam pelo `min(8)`. Mantive marquesa-específicas e variações de admin/password/qwerty123.
- **`extender` sem `extenderDias`** = usa env (10d), que é o pedido pelo painel quando o admin clica "estender prazo padrão".

## Atenção / TODO

- **Migration Prisma**: o `@default(5)` e `@default(10)` em `SiteSettings` muda o schema. DBs existentes precisam de `prisma migrate dev --name align-sinal-reserva-defaults` (não rodei pra não tocar DB). DevOps precisa rodar antes do deploy.
- **Registro existente em `SiteSettings`**: o seed tem `update: {}` (não sobrescreve edições do painel). Se já tinha registro com `2/7`, continua `2/7` — Tech Lead decide se quer força-bruta via SQL ou `update: { sinalDefaultPercent: 5, reservaDuracaoDias: 10 }` no seed (não fiz pra respeitar lição "seed não sobrescreve edições do admin").
- **Nada tocado em frontend/dashboard**: outro agent fixa o `painel/reservas/page.tsx`. Backend já aceita o formato antigo dele de qualquer forma.

## Arquivos tocados

```
src/validators/auth.ts
src/validators/reserva.ts
src/config/env.ts
src/routes/admin/index.ts
src/routes/admin/dashboard.ts
src/routes/admin/leads.ts          (novo)
src/routes/admin/reservas.ts
src/routes/reservas.ts             (só comentário)
prisma/schema.prisma
prisma/seed.ts
.env
.env.example
.env.production.example
```
