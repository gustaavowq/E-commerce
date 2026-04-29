# Microcopy library do painel — entregue

**De:** ecommerce-copywriter
**Pra:** Tech Lead
**Data:** 2026-04-28
**Path:** `dashboard/src/lib/admin-copy.ts`

## O que entreguei

Library tipada `ADMIN_COPY` (`as const` + export type) com toda microcopy do painel admin redesignado. Frontend consome via:

```ts
import { ADMIN_COPY } from '@/lib/admin-copy'
<EmptyState {...ADMIN_COPY.empty.orders} />
```

## Voice principles aplicados

- Português BR claro, curto, preciso
- ZERO travessão (nem "—" nem "–"). Vírgula ou parênteses
- ZERO emoji em UI (rejeitado pelo Gustavo)
- ZERO tom IA ("vamos lá", "incrível", "ops")
- Verbo no início de comandos ("Deletar", "Salvar", "Cancelar")
- Confidence sem arrogância — frases assertivas mas não pedantes
- Empty states com personalidade profissional, nunca tristes ou apologéticos

## Cobertura por seção

**Empty states (20+):** orders (4 variações: vazio/today/filtered/pending), products (3 variações), customers (2), waitlist, coupons (2), reviews (2), personas, builds, alerts, search, activity, notifications. Cada um tem `title`, `subtitle` e quando faz sentido, `cta`.

**Confirm dialogs (15):** deleteProduct, bulkDeleteProducts, bulkDisableProducts, bulkEnableProducts, deletePersona, deleteBuild, deleteCoupon, deactivateCoupon, cancelOrder, refundOrder, deleteCustomer, rejectReview, runAlerts, logout, discardChanges. Helpers retornam objeto `{ title, body, confirmLabel, cancelLabel }`.

**Toasts (40+):** divididos em success / error / info. Curtos, sem ponto final na maioria.

**Tooltips (25+):** KPIs (aov, conversion, revenue, repeatRate, margem, cac, ltv), Kore Tech específico (builderFunnel, personaConv, bto, doa, waitlist), ações de UI (bulkSelect, sortColumn, exportCsv).

**Section headers, page headers, status labels, command palette (14 ações), sidebar nav, CTAs (40+), bulk actions, loading, auth, generic helpers.**

## Casos especiais resolvidos

- **Confirmações destrutivas** sempre dizem "Não dá pra desfazer" quando aplica de verdade. Quando é reversível ("Desativar produto"), uso "Dá pra reativar depois" pra reduzir ansiedade.
- **Empty state de período vazio** sugere aumentar a janela ("Aumenta a janela ou confere se o filtro tá restrito demais") em vez de só dizer que está vazio.
- **Pedidos PAID** = "Aguardando ação" no kicker da home, porque PAID significa "loja precisa preparar e enviar".
- **Pedidos hoje vazios de manhã** tem subtitle empático ("Manhã ainda. Os pedidos costumam vir da tarde pra noite.") sem soar carente.
- **Status labels** padronizados em PT-BR consistente entre order/product/coupon/review.
- **Command palette** organizada em seções (navigate/create/view/settings) com atalhos sugeridos.

## O que NÃO fiz (fora de escopo)

- Componentes React (frontend importa).
- Tradução pra outras línguas (apenas BR).
- Copy de email transacional (era escopo separado, posso fazer se pedido).

## Riscos / dúvidas

- Atalhos do command palette podem colidir com atalhos de browser. Frontend valida.
- Algumas mensagens (ex: confirmações de bulk) usam template literal `(count: number) =>`; frontend precisa importar como função, não string. Tipos `as const` deixa isso explícito.

## Próximas dependências

- Frontend pode importar imediatamente em empty states, dialogs, toasts.
- Se aparecer texto novo durante implementação, frontend posta diff aqui que eu adiciono.
