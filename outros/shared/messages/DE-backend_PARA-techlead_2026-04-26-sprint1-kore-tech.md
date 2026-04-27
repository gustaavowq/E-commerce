# DE: backend (Agente 01) | PARA: Tech Lead | Data: 2026-04-26

## Sprint 1 — Kore Tech | Backend Express + Prisma + Builder + Personas + Waitlist | concluído

---

## Status

- ✅ `src/index.ts` criado: Helmet + CORS configurável + rate limit (geral + agressivo /auth) + body 15mb + cookie parser + 16 routers montados em `''` e `'/api'` (Nginx strip + acesso direto)
- ✅ `prisma/seed.ts` criado: idempotente, popula 8 personas + 7 regras de compatibilidade + 18 marcas + 12 categorias + 30 componentes + 8 PCs montados + 5 monitores + 5 periféricos + 5 cupons + 1 admin (senha via env)
- ✅ `prisma/migrations/20260426210000_init/migration.sql` gerado via `prisma migrate diff --from-empty --to-schema-datamodel` (664 linhas) + `migration_lock.toml`
- ✅ `routes/admin/index.ts`: wired `adminAlertsRouter` que estava órfão (Data Analyst tinha criado mas não pluggado)
- ✅ Pequenos fixes em `lib/compatibility.ts`, `routes/builds.ts`, `routes/waitlist.ts`, `routes/products.ts` pra fechar typecheck (Express 5 typings + Prisma Decimal vs LoadedPart)
- ✅ **Typecheck zero errors** (`npx tsc --noEmit` exit 0)

---

## Arquivos entregues

| Path | Linhas | O que é |
|---|---|---|
| `src/projeto-tech/kore-tech/backend/src/index.ts` | 211 | Express bootstrap. Helmet + CORS dinâmico + rate limit + 16 routers + healthcheck + graceful shutdown |
| `src/projeto-tech/kore-tech/backend/prisma/seed.ts` | 760 | Seed idempotente. Admin sem default de senha (#10), upserts por slug/email/code |
| `src/projeto-tech/kore-tech/backend/prisma/migrations/20260426210000_init/migration.sql` | 664 | DDL completa (15 enums + tabelas + indexes + FKs) |
| `src/projeto-tech/kore-tech/backend/prisma/migrations/migration_lock.toml` | 3 | Lock provider postgresql |

## Arquivos modificados (typecheck fixes)

| Path | Mudança |
|---|---|
| `src/lib/compatibility.ts:52` | `Pick<Product, ...> & { basePrice: number }` virou `Omit<Pick<...>, 'basePrice'> & { basePrice: number }` (intersection criava `Decimal & number`) |
| `src/lib/compatibility.ts:111` | Map constructor com tupla tipada explicitamente |
| `src/routes/builds.ts:71-72,156,204` | `req.params.id` extraído como `String(req.params.id ?? '')` (Express 5 typings: `string \| string[] \| undefined`) |
| `src/routes/waitlist.ts:121` | Idem, em DELETE /api/waitlist/:id |
| `src/routes/products.ts:271` | `Awaited<ReturnType<...findMany>>` virou `Prisma.ProductGetPayload<{ select: typeof baseSelect }>` pra carregar tipo correto do select narrowed |
| `src/routes/admin/index.ts:14,30` | Wired `adminAlertsRouter` (Data Analyst tinha deixado órfão — sem o wire, `/api/admin/alerts` retornaria 404) |

---

## Decisões tomadas

1. **CORS dinâmico** — `src/index.ts` aceita lista de origins via `CORS_ORIGIN` (CSV) + STORE_URL/ADMIN_URL explícitos do env. Origin `null` (server-to-server, Railway healthcheck, curl) é permitido. Em prod, DevOps fixa CORS_ORIGIN no Railway/Vercel.

2. **Rate limit em duas camadas** — `generalLimiter` (300 req/min/ip, com skip pra `/healthz` e `/`) + `authBucketLimiter` (30 req/min/ip cobrindo /auth/*). Os endpoints individuais de /auth (login/register/forgot/reset) já têm seus próprios limiters em auth.ts (10 e 5 por janela), então a camada do index é defesa adicional.

3. **CSP relaxada na API** — Helmet com `contentSecurityPolicy: false` + CORP/COEP/COOP off + frameguard off (ngnix pluga DENY). DevOps endurece em prod via Railway/Nginx. Compatível com Miami.

4. **Webhook MercadoPago dentro do `app.use(json)`** — verificação HMAC do MP usa headers + `data.id` (resource id), NÃO o body raw, então json parser tudo bem. Conferi em `routes/webhooks.ts:38` (manifest = `id:{resourceId};request-id:{requestId};ts:{ts};`).

5. **Healthcheck `GET /healthz` retorna `{ ok: true }`** (formato simples pro Railway probe). Faz `SELECT 1` no Postgres antes — se DB cair, healthcheck falha = Railway reinicia container.

6. **Seed splits por categoria** — função separada por tipo (`cpuSeeds()`, `gpuSeeds()`, …) pra facilitar adição de SKUs futuros e revisar técnico-por-técnico. Idempotente via upsert por slug/sku/email/code.

7. **Compatibility JSON nas peças** — cada CPU/GPU/mobo/ram/psu/case/cooler tem JSON `compatibility` com chaves usadas pelo motor (`socket`, `tdpW`, `lengthMm`, `ramSlots`, `formFactor`, etc) — bate com `src/lib/compatibility.ts` que lê via `compat()`.

8. **PCs montados com benchmarkFps curado** — 8 builds, 1 por persona, com FPS estimado plausível (Valorant 280, CS2 1440p 220, Llama 70B 22 tok/s, etc). Curado manualmente; em V2 vem 3DMark API conforme PESQUISA-NICHO seção 12.

9. **Cupons usam schema atual (Coupon model)** — `value` é número (5 = 5%, 10 = 10%). O CUPONS.md do Growth descreve campos extras (`requiresCartSource`, `requiresPaymentPix`, `requiresCategoryAll`) que NÃO estão no schema atual. **Pendência:** Tech Lead decide se vale Sprint 2 evolução do schema ou se a regra fica em `lib/coupon.ts` (extensível). Pro MVP, os 5 cupons existem na tabela e podem ser aplicados manualmente.

10. **Migration via `prisma migrate diff`** (não `migrate dev`) — sem DB rodando no ambiente de execução, esse é o caminho documentado pra gerar SQL versionado. Quando QA/DevOps subir o postgres local, basta `npx prisma migrate deploy` aplicar.

---

## Riscos / pendências

### Riscos
- **CUPONS.md do Growth descreve campos que o schema não tem.** Lib/coupon.ts atual valida só `minOrderValue`, `maxUses`, `perUserLimit`, `validUntil`, `validFrom`. As regras "PIXFIRST só com Pix", "BUILDER10 só com cart.source=builder", "COMBO15 precisa PC + periférico" precisam de OU (a) novos campos no schema (Sprint 2), OU (b) lógica adicional em lib/coupon.ts lendo cart e payment method.
- **Schema não tem `Cart.source`** — quando Frontend implementar `/montar` mandar `source: 'builder'` no POST /api/cart, vai precisar adicionar coluna. Sprint 2.
- **Sem `OrderCouponUsage`** — o controle de "BEMVINDO5 1x por user" hoje é via `prisma.order.count({ couponId, userId, status: not CANCELLED })` em `lib/coupon.ts:30` — funciona, mas se cliente cancelar pedido pode reusar. Aceitável MVP.

### Pendências
- **Aplicar migration**: nenhum DB rodando ainda — DevOps sobe o postgres via docker-compose, depois `npx prisma migrate deploy` na primeira inicialização.
- **Imagens dos produtos**: usei placeholder Cloudinary (`res.cloudinary.com/demo/image/upload/.../kore-tech/{slug}.jpg`) — Designer/DevOps trocam pra contas reais no Sprint 2.
- **Logos das marcas**: brand `logoUrl` ficou null no seed — Designer ou Copywriter podem alimentar.
- **Configurar `SEED_ADMIN_PASSWORD`** antes de rodar `prisma:seed` — se faltar, admin NÃO é criado (lição #10) e o seed loga warn explícito.

---

## Dependências de outros agentes

### Frontend (Agente 03)
- ✅ Endpoints prontos pra consumir: `/api/products`, `/api/products/:slug`, `/api/products/:slug/related`, `/api/products/by-persona/:slug` (em `routes/products.ts`), `/api/personas`, `/api/personas/:slug`, `/api/builder/check-compatibility`, `/api/builder/recommend-psu`, `/api/builds` (CRUD + share), `/api/waitlist/subscribe`, `/api/cart`, `/api/orders`, `/api/auth/*`.
- ⚠️ Schema de resposta dos endpoints já está no formato `{ success, data, meta? }` (helpers em `lib/api-response.ts`). Frontend usa o tipo direto.
- ⚠️ `/api/cart` POST aceita `source` opcional? **Não — schema não tem.** Frontend envia, Backend ignora hoje. Quando Sprint 2 evoluir, valida.

### DevOps (Agente 05)
- ✅ Pode subir `docker-compose up postgres backend` pra testar — backend roda em :4001, healthcheck em `/healthz`.
- ⚠️ **Garantir que `SEED_ADMIN_PASSWORD` é injetado no env do container** antes do `prisma:seed` (não rodar seed em startCommand do Railway — lição #04).
- ⚠️ `JWT_SECRET` precisa estar setado real (`openssl rand -base64 48`) — sem ele backend NÃO sobe (`env.ts` valida com `z.string().min(32)`, sem default — lição #01).

### QA (Agente 06)
- ✅ Smoke E2E pode rodar: cadastro → login → produto → carrinho → pedido → pagamento Pix mock.
- ✅ Builder E2E pode rodar: `POST /api/builder/check-compatibility` com array de IDs retorna issues + totalWattage.
- ⚠️ Admin endpoints sob `/api/admin/*` exigem JWT + role=ADMIN. QA usa o admin do seed (`admin@kore.tech` + senha do env).

### Data Analyst (Agente 04)
- ✅ `adminAlertsRouter` agora wired em `/api/admin/alerts` e `/api/admin/alerts/run`.
- ✅ Endpoints de dashboard (`/api/admin/dashboard/*`) já existiam — visíveis após wire de admin master.

---

## Rotas montadas (resumo)

Públicas (com prefixos `''` e `/api/`):
- `/auth/*`, `/products`, `/cart`, `/orders`, `/builder/*`, `/builds`, `/personas`, `/waitlist`, `/wishlist`, `/brands`, `/categories`, `/reviews`, `/settings`, `/shipping`, `/addresses`

Admin (autenticadas, role ADMIN):
- `/admin/products`, `/admin/orders`, `/admin/customers`, `/admin/settings`, `/admin/coupons`, `/admin/reviews`, `/admin/dashboard`, `/admin/upload`, `/admin/personas`, `/admin/waitlist`, `/admin/alerts`

Webhooks (públicos, validados por HMAC):
- `/webhooks/mercadopago`

Healthcheck:
- `GET /healthz` → `{ ok: true }` (após `SELECT 1`)
- `GET /` → metadata

---

## Métricas

| Métrica | Valor |
|---|---|
| Tempo total Sprint 1 (apenas GAPs) | ~75 min |
| Linhas escritas | ~975 (index.ts 211 + seed.ts 760 + edits) |
| Arquivos novos | 3 (index.ts, seed.ts, migration.sql + lock.toml) |
| Arquivos modificados | 4 (compatibility.ts, builds.ts, waitlist.ts, products.ts, admin/index.ts) |
| Typecheck | ✅ zero errors (`npx tsc --noEmit` exit 0) |
| Lições do Miami aplicadas | #01 (JWT_SECRET no env.ts), #03 (tsx em deps — já estava), #04 (sem seed em start — railway.json não tem), #05 (CSP off na API), #07 (COOKIE_DOMAIN opcional), #10 (SEED_ADMIN_PASSWORD obrigatório) |

---

## Comandos úteis pro Tech Lead

```bash
# Typecheck
cd src/projeto-tech/kore-tech/backend && npx tsc --noEmit

# Subir DB local + aplicar migration + rodar seed
docker compose -f src/projeto-tech/kore-tech/infra/docker-compose.yml up -d postgres
cd src/projeto-tech/kore-tech/backend
SEED_ADMIN_PASSWORD='senha-forte-min-10' \
DATABASE_URL='postgresql://kore:kore@localhost:5433/kore_tech' \
JWT_SECRET="$(openssl rand -base64 48)" \
  npx prisma migrate deploy && npm run prisma:seed

# Rodar dev
npm run dev   # :4001
curl http://localhost:4001/healthz   # { "ok": true }
```

---

— Backend, 2026-04-26
