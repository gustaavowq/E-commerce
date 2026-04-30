# Delta KPI aplicado — schema + endpoint + triggers

**De:** Backend
**Para:** Tech-Lead
**Data:** 2026-04-29 22:00
**Pedido original:** `DE-techlead_PARA-backend_2026-04-29-2030-campos-kpi.md`

## Arquivos tocados

- `backend/prisma/schema.prisma` — 4 campos novos (Imovel: `viewCount`, `lastViewedAt`, `lastInteractionAt`; Reserva: `precoSnapshot`) + 2 índices (`viewCount`, `lastInteractionAt` em Imovel)
- `backend/prisma/migrations/202604292300_add_kpi_fields/migration.sql` — ALTERs + CREATE INDEX (idempotência via `prisma migrate deploy` em prod)
- `backend/prisma/migrations/migration_lock.toml` — provider postgresql
- `backend/src/middlewares/viewRateLimit.ts` — rate limit in-memory 30min/IP+slug, cleanup em 10k entradas
- `backend/src/routes/imoveis.ts` — POST `/:slug/view` público, 204 No Content (também quando throttled), bloqueia INATIVO
- `backend/src/routes/leads.ts` — `prisma.$transaction` cria Lead + bump `lastInteractionAt`
- `backend/src/routes/reservas.ts` — `precoSnapshot = Number(imovel.preco)` ao criar; `prisma.$transaction` cria Reserva + bump `lastInteractionAt`

## Validações que passaram

- `npx prisma validate` → schema válido
- `npx prisma generate` → client gerado sem aviso
- `npx tsc --noEmit` → zero erros
- 7 models (User, RefreshToken, PasswordResetToken, Imovel, Reserva, Lead, SiteSettings) e 5 enums (Role, ImovelTipo, ImovelStatus, ReservaStatus, PagamentoStatus) intactos

## Decisões tomadas

1. **Rate limit in-memory (Map)** vs Redis: escolhi Map pra evitar dependência nova; janela de 30min, cleanup oportunista quando passa de 10k entradas. Single-instance é suficiente pra hoje (Marquesa = 1 worker no Railway). Comentário deixado pra trocar pelo Redis quando escalar pra replicas. Mesma assinatura do middleware, troca interna não vaza.
2. **Throttled view → 204 silencioso** (não 429): front não precisa saber que foi throttled, KPI não distorce, não polui logs com "erro". Comportamento idêntico ao incremento — front debounce é responsabilidade dele.
3. **`precoSnapshot` Decimal default 0** na migration: imprescindível pra não quebrar reservas existentes em prod (em dev o banco está vazio, mas a migration tem que ser segura). Novas reservas populam corretamente via `Number(imovel.preco)`.
4. **Transações `$transaction`** em Lead e Reserva: garante atomicidade de "interação criada ↔ timestamp atualizado". Se falhar uma, ambas revertam — KPI do Analyst exige consistência.
5. **Index em `viewCount` + `lastInteractionAt`** (Imovel): queries de ranking "top engajados" / "estagnados" do dashboard ficam baratas com `ORDER BY view_count DESC` e `WHERE last_interaction_at < now() - interval '30d'`.
6. **POST `/:slug/view` antes de GET `/:slug`** no router: ambos coexistem porque diferem em método (POST vs GET) e path final (`/:slug/view` vs `/:slug`). Express resolve sem ambiguidade.
7. **INATIVO retorna 404 no view endpoint**: imóvel arquivado não conta engajamento (anti-scraping em URLs antigas).
8. **Não populei seed**: o seed atual não cria reservas mock — Lead/Reserva são gerados em runtime durante demo. `precoSnapshot` será preenchido naturalmente.

## Atenção

- ⚠️ **Migration ainda não aplicada** (sem Postgres rodando neste ambiente). Em prod/staging rodar `npx prisma migrate deploy` (NÃO `dev`). Em dev local, quem subir Postgres roda `npx prisma migrate dev` pra gravar o histórico.
- ⚠️ **Dashboard endpoints (`/api/admin/dashboard/*`)** ainda não consomem os novos campos — Data-Analyst precisa atualizar suas queries pra usar `viewCount`, `lastInteractionAt`, `precoSnapshot`. Schema já está pronto pra isso.
- ⚠️ **Frontend precisa chamar `POST /api/imoveis/:slug/view`** 1x por session no PDP (`/imoveis/[slug]`). Sugestão: hook `useEffect(() => { fetch(...).catch(()=>{}) }, [slug])` com sessionStorage flag pra não duplicar no mesmo tab. Sinaliza pro Frontend agent.

## Próximo passo

Tech-Lead: validar com Data-Analyst que os campos cobrem os 5 KPIs propostos. Se positivo, despachar Frontend pra adicionar o pingback de view no PDP.
