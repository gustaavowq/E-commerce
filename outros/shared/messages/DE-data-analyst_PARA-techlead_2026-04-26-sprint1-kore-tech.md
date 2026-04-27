# DE: data-analyst (frontend painel) | PARA: techlead | 2026-04-26

## Sprint 1 — Kore Tech | CRUD/listagem do painel admin | concluído

> Nota de roteamento: esse pacote completa o painel admin (escopo "data-analyst gerencia dashboards"). As páginas faltantes do CRUD ficaram a meu encargo. A loja (`frontend/`) não foi tocada — outro agente cuida.

---

## 1. Páginas entregues

Todas em `src/projeto-tech/kore-tech/dashboard/src/app/(admin)/`.

| Rota                    | Arquivo                          | O que faz |
|-------------------------|----------------------------------|-----------|
| `/products`             | `products/page.tsx`              | Lista paginada com filtros (busca debounced, status, buildType, category, brand, stock) em URL state, bulk actions (Ativar/Desativar/Destacar/Excluir) com confirmação. |
| `/products/new`         | `products/new/page.tsx`          | Form completo via `<ProductForm>`. Cria e redireciona pra `/products/[id]` pra subir imagens. |
| `/products/[id]`        | `products/[id]/page.tsx`         | Edita com mesmo `<ProductForm>` + `<ImagesManager>` no slot. Botão excluir com confirmação. |
| `/orders`               | `orders/page.tsx`                | Lista com filtros (status, busca, range de data), polling 30s (pedidos são prioridade). |
| `/orders/[id]`          | `orders/[id]/page.tsx`           | Itens, totais, pagamentos, cliente, endereço, timeline. Mudar status, marcar pago, marcar enviado (com tracking), cancelar (com motivo), notas internas. |
| `/coupons`              | `coupons/page.tsx`               | DataTable + modal CRUD. BUILDER10 destacado com badge `Builder` cyan e nota `requiresBuilderOrigin`. Duplicar / remover inline. |
| `/personas`             | `personas/page.tsx`              | Cards CRUD com slug, name, description, targetGames (chips), targetFps (key-value), heroImage (Cloudinary). |
| `/customers`            | `customers/page.tsx`             | Lista paginada com busca debounced. Mostra orderCount, totalSpent, verificação de email. |
| `/customers/[id]`       | `customers/[id]/page.tsx`        | Header com total gasto, lista de pedidos com link, endereços salvos. |
| `/waitlist`             | `waitlist/page.tsx`              | Agrupado por produto, expandable pra ver inscrições, botão "Notificar" com confirmação (dispara `notifyAll`). Notifica entries individuais. |
| `/reviews`              | `reviews/page.tsx`               | Filtro de status (Pendentes default), aprovar/rejeitar/remover inline. Stars visuais. |
| `/settings`             | `settings/page.tsx`              | Tabs (Loja / Contato / Frete & Pix / Políticas) com TODOS campos do `StoreSettings`. |

## 2. Componente novo

`src/projeto-tech/kore-tech/dashboard/src/components/ProductForm.tsx`
- Form unificado pra `new` e `[id]` (DRY).
- react-hook-form + zod, tabs (Identidade / Hardware / Specs / FPS / SEO).
- Auto-slug a partir do nome enquanto não tem `initial.slug`.
- Reusa `<SpecsEditor>`, `<CompatibilityEditor>`, `<BenchmarkFpsEditor>` já existentes.
- Persona desabilitada quando `buildType !== 'pc_pronto'`.
- FPS editor visível só pra PC pronto.
- Compatibility editor visível só pra componente.
- `imagesSlot` opcional (só aparece em editar — produto novo precisa do id pra ter imagens).
- Sticky submit bar no rodapé.

## 3. Reuso

Componentes existentes consumidos sem modificação: `DataTable` + `BulkActionBar`, `Pagination`, `KpiCard`, `Skeleton` + `EmptyState`, `StatusBadge`, `ConfirmDialog`, `Toast` + `useToast`, `ImagesManager`, `SpecsEditor`, `CompatibilityEditor`, `BenchmarkFpsEditor`, `Button`/`Input`/`Select`/`Textarea`/`Label`. Hooks `useDebounce`. `services/admin.ts` e `services/types.ts` consumidos sem alteração.

## 4. Decisões de UX

- **URL state em filtros e busca** (memoria/30-LICOES) — listas de produtos e pedidos preservam filtros em refresh/share.
- **Polling 30s em /orders** — pedidos são prioridade, igual `useNewOrderNotification`.
- **Bulk actions com confirmação** — `delete` é destrutivo, demais usam tom neutro.
- **Sem travessão em UI** — todas as strings revisadas; os `—` que aparecem são placeholders de campo vazio (símbolo de "não informado"), não copy.
- **Sem emoji** em copy.
- **Touch targets ≥ 44px** via componentes UI (Button md = h-10).
- **Empty states amigáveis** com ícone + descrição + CTA.
- **TabBar pattern** (form de produto + settings) pra evitar overload visual em formulários gigantes.
- **Voz Kore Tech respeitada** — nada de "tecnologia de ponta", "revolucionário", "experiência única".

## 5. Restrições respeitadas

- ❌ Não toquei em `src/backend/`, `src/frontend/`, `src/dashboard/` (Miami).
- ❌ Não toquei em `src/projeto-tech/kore-tech/frontend/` (loja).
- ✅ Cores 100% via tokens semânticos do preset (zero literal hex no JSX).
- ✅ Lucide-only pra ícones.
- ✅ `next/image` com `unoptimized` quando usado.

## 6. Typecheck

```
cd src/projeto-tech/kore-tech/dashboard && npx tsc --noEmit
```

**Resultado:** 0 erros nos meus arquivos.

Há **1 erro pré-existente** fora do meu domínio — `projetos/projeto-tech/kore-tech/design/tailwind.config.preset.ts` não acha types do `tailwindcss`. Isso é da pasta do designer e existia antes do meu trabalho (verificado com `git stash` + tsc). Recomendo Designer ou DevOps adicionar `@types/tailwindcss` na pasta de design ou um `tsconfig.json` mínimo lá pra excluir do typecheck do dashboard.

## 7. Gaps / Pendências pra Backend confirmar

- `adminProducts.create`/`update` recebe `brand: { id, name, slug }` no body (formato do tipo `AdminProductDetail`). Preencho só o `id` quando o cliente seleciona uma marca; backend deve aceitar `{ brand: { id } }` ou `{ brandId }` — confirmar formato real.
- `adminCoupons.update` recebe `Partial<CouponInput>` — no form mando o body completo, backend precisa fazer merge ou ignorar campos vazios.
- `/api/admin/waitlist/by-product` precisa retornar `inStock: boolean` pro botão "Notificar" só ficar habilitado quando voltou estoque (já está no `WaitlistByProduct`).
- `/api/admin/orders/{id}/ship` recebe `{ trackingCode }` — frontend assume isso.
- `/api/admin/personas` o seed do backend deve criar as 8 personas iniciais pra UI já popular cards.

Nenhum bloqueio — se backend divergir em algum contrato, ajusto rápido.

## 8. Bloqueios

Nenhum bloqueio pra outros agentes.

— Frontend admin (cobrindo gap data-analyst), 2026-04-27
