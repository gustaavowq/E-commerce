# DE: 03-frontend  PARA: 00-tech-lead
**Data:** 2026-04-26
**Assunto:** 8 fixes UX do QA aplicados

## Bugs corrigidos

1. **WishlistHeart.tsx (CRÍTICO)** — `onClick` já tinha `preventDefault + stopPropagation`. Adicionei `onMouseDown` e `onTouchStart` com `stopPropagation` pra blindar Safari iOS, que dispara o `<Link>` pai antes do click.

2. **SearchBar.tsx:109 (CRÍTICO)** — botão da lupa estava `hidden ... sm:flex`. Trocado por `flex` puro: visível em todos os breakpoints, mobile agora tem o ícone clickável.

3. **cart/page.tsx (CRÍTICO)** — botão "Esvaziar carrinho" era um `<div>` solto dentro do `<ul>`. Envelopei a `<ul>` num `<div>` wrapper e movi o botão pra fora da lista. HTML válido.

4. **products/[slug]/ProductDetailView.tsx:173 (CRÍTICO)** — botão "Tabela de medidas" estava sem `onClick`. Adicionei state `showSizeChart` e modal com overlay, fechamento por click fora e botão X. Renderiza `product.measureTable` (entries do JSON) numa tabela; fallback "Em breve" se vazio. Importei `X` do lucide.

5. **ProductCard.tsx (MÉDIO)** — `AuthenticityBadge` no canto inferior direito ganhou `hidden sm:block` pra não colidir com o badge `-29%` em telas ≤ 640px. Mantém o desconto visível, que é o gatilho de conversão.

6. **Travessões em copy (MÉDIO)** — substituídos em strings JSX:
   - `app/page.tsx`: 4 ocorrências (sobre teaser, USP list, CTA contato).
   - `app/sobre/page.tsx`: 2 (missão, "como funciona").
   - `app/contato/page.tsx`: address default + horários ("9h às 19h"/"9h às 14h").
   Não toquei em comments, globals.css, sitemap nem strings de log.

7. **Footer.tsx** — removido emoji bandeira. Texto agora: "Roupa de marca, original, com preço que entra no bolso. Tudo aqui é original."

8. **Dashboard tables (MÉDIO)** — `(admin)/orders/page.tsx` e `(admin)/products/page.tsx`: trocado `min-w-full` por `min-w-[768px] w-full` no `<table>` dentro do wrapper `overflow-x-auto`. Garante scroll horizontal funcional em mobile sem espremer colunas.

## Typecheck

- **Frontend** (`npx tsc --noEmit` em `src/frontend`): **OK** (exit 0)
- **Dashboard** (`docker exec miami-dashboard npx tsc --noEmit`): **OK** (exit 0)

## Não consegui

- Nenhum bloqueio. Todos os 8 fixes aplicados e validados.

## Observação

Não toquei nos arquivos sob cuidado do Tech Lead: `dashboard middleware.ts`, `frontend AuthForm.tsx`, `dashboard (admin)/layout.tsx`.
