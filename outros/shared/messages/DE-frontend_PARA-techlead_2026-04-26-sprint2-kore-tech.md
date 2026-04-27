# DE: frontend | PARA: techlead | 2026-04-26 (Sprint 2 — Kore Tech, loja)

Sprint 2 fechado pra loja (`src/projeto-tech/kore-tech/frontend/`). Dashboard nao foi tocado.

## FIX 1 — Wishlist real (sync com API)

Servidor virou fonte da verdade pos-login. localStorage continua como cache offline.

- `src/services/wishlist.ts`: tipos corrigidos pra bater com o backend (POST devolve `{ added, total }`, DELETE 204 `void`).
- `src/stores/wishlist.ts`: `toggle` agora e async, otimista (UI atualiza antes do response, reverte em erro). Adicionado `syncedFromServer`. `clear()` zera o flag. `partialize` so persiste `ids` (nao salva `hydrated/syncedFromServer`).
- `src/stores/useWishlistSync.ts` (novo): hook que faz `GET /wishlist` via TanStack Query quando ha sessao, espelha `ids` no Zustand, e limpa quando o usuario desloga (compara `lastUserIdRef` vs current).
- `src/app/providers.tsx`: registra `useWishlistSync` num componente filho `<SyncBridges />` dentro do QueryClientProvider, pra hook ter acesso ao client.
- `src/app/account/AccountClient.tsx`: substitui `useWishlist.getState().ids.length` (nao reativo) por hook `useWishlist((s) => s.ids)`. Card de favoritos agora atualiza ao vivo. Logout ja chamava `clearWishlist()` mas o hook tambem reage a `user === null`.
- `src/app/favoritos/FavoritosClient.tsx`: branch logado consome `listWishlist()` direto e mapeia pra `ProductListItem` (helper `mapWishlistToCard`). Branch visitante mantem comportamento antigo (filtra `listProducts({ limit: 60 })` pelos ids locais).
- `src/components/WishlistHeart.tsx`: agora envolve o `toggle` em `void` pra deixar claro que e fire-and-forget (store ja faz revert).

Decisao: nao bloqueamos a UI esperando a resposta do servidor. Otimismo + revert e melhor UX em rede ruim e o impacto de divergir e baixo (e a wishlist ressincroniza no proximo login/refetch).

## FIX 2 — Cart.source = "builder"

- `src/stores/cart.ts`: novo campo `source: 'standard' | 'builder'` no estado. `addManyItems` aceita `opts?: { source }`. Regra: se entrar `'builder'` ou ja era `'builder'`, mantem `'builder'`. So volta pra `'standard'` quando `clear()` zera o carrinho. Garante que adicionar um headset solto depois nao invalida BUILDER10.
- `src/services/cart.ts`: novo helper `addCartItemsBatch(items, source = 'builder')` que envia `source` no body de cada `POST /cart/items`. Chamadas por item porque o backend ainda nao tem `/cart/items/batch`. Quando abrir o endpoint batch, troca pra uma request so.
- `src/app/montar/BuilderClient.tsx`: `handleAddAllToCart` chama `addManyItems(items, { source: 'builder' })` (passa pelo store local). O servidor ainda nao consome `source` no `POST /cart/items`, mas quando o backend implementar, basta plugar o `addCartItemsBatch` aqui.

Pendencia pro backend (gap residual): adicionar coluna `source` em `Cart` e aceitar no `cartItemAddSchema`. Sem isso, o cupom BUILDER10 valida hoje so via subtotal (>=5000), nao por origem.

## FIX 3 — Toast danger no fail do viacep

- `src/app/checkout/CheckoutClient.tsx` (`lookupZip` linha 112): try/catch refatorado. Lanca erro em status nao-OK do fetch, e `data.erro === true` cai no toast danger uniforme: "CEP nao encontrado. Verifique e tente de novo." O catch externo usa a mesma copy (sem distinguir 404 de fail de rede, pra nao confundir o cliente).

## FIX 4 — Tooltips didaticos no builder

- `src/components/ui/Tooltip.tsx` (novo): componente sem deps externas, react state hover/focus, `role="tooltip"`, `aria-describedby`, ESC fecha, `animate-fade-up`. Aceita `side: 'top' | 'right' | 'bottom' | 'left'`.
- `src/components/builder/BuilderCategoryPicker.tsx`: reestruturado pra ter um botao `<Info>` ao lado de cada categoria, dentro de `<Tooltip content={TOOLTIPS[slot]} side="right">`. Microcopy de cada tooltip alinhada com o `BUILDER-VISUAL-SPECS.md` secao 6 (CPU, mobo, ram, gpu, storage, psu, case, cooler — todas escritas direto, sem travessao).

Decisao: tooltip **alem** do botao da categoria, nao no botao em si. Motivo: o botao da categoria precisa de label-only pra screen reader nao ficar repetindo a explicacao. O `<Info>` separado da quem quer aprender; quem ja sabe ignora.

## Anti-padroes que evitei

- Sem travessao nos arquivos novos (verificado por grep).
- Sem palavra proibida do BRAND-BRIEF.md.
- Sem hex literal — uso so `bg-surface`, `text-primary`, `border-border-strong` (preset).
- `WishlistHeart` continua com `stopPropagation` (Sprint 1 ja tinha).
- Tooltip e fire-and-forget na tecla ESC (event listener removido no useEffect cleanup).
- Toggle de wishlist nao bloqueia UI; reverte se rede falhar.

## Typecheck: OK

`npx tsc --noEmit` em `src/projeto-tech/kore-tech/frontend/` retorna exit 0, zero erros.

## Bloqueios pra Backend

1. **`POST /cart/items` precisa aceitar `source: 'builder' | 'standard'`** no body (zod schema `cartItemAddSchema`) e gravar em `Cart.source` (coluna nova). Hoje frontend manda mas backend ignora.
2. **Cupom BUILDER10**: valida `cart.source === 'builder'` no `validate-coupon`. Sem isso, BUILDER10 funciona em qualquer compra >= R$ 5.000.
3. (sem bloqueio direto, mas relacionado) Quando o `addCartItemsBatch` virar `POST /cart/items/batch`, frontend troca pra uma chamada so.

## Bloqueios pra DevOps

1. CSP `connect-src` precisa cobrir `https://viacep.com.br` (gap 3 do Sprint 1, ainda pendente). Sem isso o lookupZip cai sempre no toast danger.

## Arquivos modificados / criados

Modificados:
- `src/services/wishlist.ts`
- `src/services/cart.ts`
- `src/stores/wishlist.ts`
- `src/stores/cart.ts`
- `src/app/providers.tsx`
- `src/app/account/AccountClient.tsx`
- `src/app/favoritos/FavoritosClient.tsx`
- `src/app/checkout/CheckoutClient.tsx`
- `src/app/montar/BuilderClient.tsx`
- `src/components/WishlistHeart.tsx`
- `src/components/builder/BuilderCategoryPicker.tsx`

Criados:
- `src/stores/useWishlistSync.ts`
- `src/components/ui/Tooltip.tsx`

Sem commit (regra do brief). Pronto pra QA rodar SMOKE-E2E + BUILDER-E2E + BUGBASH-UX.

— Frontend, 2026-04-26
