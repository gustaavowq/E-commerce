# Varredura UX — Loja + Painel
DE: 03-frontend + 06-qa  · PARA: 00-techlead  · DATA: 2026-04-26

Loja respondendo 200 em todas as 10 URLs. Painel redireciona 307 corretamente sem cookie e responde 200 em `/login`. Bugs confirmados abaixo.

## Críticos (quebra função / impacto direto na compra)

1. **src/frontend/src/components/ProductCard.tsx:22-49** — `<Link>` envolve um `<button>` (WishlistHeart). HTML inválido, gera warning de hydration, e em iOS o tap no coração pode disparar navegação além de favoritar. **Fix:** trocar `<Link>` por `<div role="link" onClick>` ou tirar a heart pra fora do Link e posicionar absolutamente sobre ele.
2. **src/frontend/src/components/SearchBar.tsx:105-112** — Botão de busca é `hidden ... sm:flex`, ou seja, **sumido em mobile** (375px). Usuário mobile não tem como buscar. **Fix:** trocar `hidden ... sm:flex` por `flex` (ou expor um ícone-lupa no Header mobile).
3. **src/frontend/src/app/cart/page.tsx:86-88** — `<div>` solto dentro de `<ul>` (botão "Esvaziar carrinho"). HTML inválido, alguns leitores de tela ignoram. **Fix:** mover o botão pra fora do `<ul>` (ex: abaixo da lista, dentro do mesmo grid column).
4. **src/frontend/src/app/products/[slug]/ProductDetailView.tsx:173-175** — Botão "Tabela de medidas" não tem `onClick` nem `href`, não faz nada ao clicar. Cliente lendo a tabela antes de comprar trava aqui. **Fix:** adicionar modal com tabela ou linkar pra `/policies/sizes` (criar a policy).

## Médios (atrapalha mas funciona)

5. **src/frontend/src/components/ProductCard.tsx:53-62** — No card mobile (≈150px de largura em grid 2-col), o badge "-X%" (canto inferior esquerdo) e o selo `AuthenticityBadge` "100% Original" (canto inferior direito) colidem visualmente. Em produtos com desconto fica empilhado. **Fix:** esconder AuthenticityBadge em mobile (`hidden sm:inline-flex`) ou trocar por um ícone só.
6. **src/frontend/src/components/Footer.tsx:16** — Copy do brand block tem emoji `🇺🇸`. Memory do brand-brief diz pra evitar emoji em copy de UI/marketing. **Fix:** remover o emoji, deixar texto puro.
7. **Travessões em copy de marketing** (memory do brand-brief proíbe travessão em UI):
   - `src/frontend/src/app/page.tsx:132,137,141,193`
   - `src/frontend/src/app/sobre/page.tsx:71,162`
   - `src/frontend/src/app/contato/page.tsx:21,137,138`
   **Fix:** trocar `—` por `,` ou ponto-final, reescrevendo a frase.
8. **src/frontend/src/components/WhatsAppButton.tsx:9 + Footer.tsx:28 + page.tsx:204 etc.** — Número fallback `5511999999999` aparece como link real se `StoreSettings.whatsappNumber` falhar. Hoje a Settings está OK, mas em qualquer queda da API o cliente clica e cai num número inexistente. **Fix:** se settings falhar, esconder o botão WA / link em vez de usar placeholder.
9. **src/frontend/src/app/contato/page.tsx:54-102** — Section dos cards de contato tem `-mt-8 sm:-mt-10`, sobrepondo o hero verde. Em viewport entre 640-720px o card sobe acima do `<h1>`. **Fix:** usar `relative z-10 -mt-8` e dar `pb-16` extra no hero pra não comer o título.
10. **src/frontend/src/app/auth/AuthForm.tsx:104-110** — Input de senha não tem botão "mostrar senha" (eye toggle). Em mobile, digitar senha forte (regex letra+número, mín 8) sem ver é fonte de erro. **Fix:** adicionar toggle eye/eye-off no `<Field>` da senha.
11. **src/frontend/src/components/WhatsAppButton.tsx:31** — Botão flutuante `fixed bottom-4 right-4 z-[150]` cobre o canto inferior direito do `/cart` em mobile, sobrepondo o link "Esvaziar carrinho" (`text-right` no fim da lista). **Fix:** dar `bottom-20` em telas com sticky bottom-bar ou aumentar `pb` da página `/cart`.

## Pequenos (polimento)

12. **src/frontend/src/app/not-found.tsx:8-9** — Página 404 não tem `<h1>`, só `<p>` grandões. Ruim pra SEO e leitor de tela. **Fix:** trocar o "Perdido?" por `<h1>` e dar `aria-hidden` no "404" decorativo.
13. **src/frontend/src/components/Header.tsx:97-114** — Dropdown "Loja" desktop abre com `onMouseEnter` + `onClick`. Sem alternativa keyboard explícita (não responde a Enter sem foco programático). **Fix:** adicionar `onFocus`/`onBlur` ou só usar click.
14. **src/frontend/src/app/products/Filters.tsx:213-223** — Botão "Filtros" mobile não fica sticky no topo da listagem; ao rolar o usuário precisa subir tudo pra trocar filtro. **Fix:** wrappear num `<div className="sticky top-14 z-20 bg-surface-alt py-2 -mx-4 px-4 lg:hidden">`.
15. **src/frontend/src/components/PromoStrip.tsx:7** — `whitespace-nowrap overflow-hidden` corta o terceiro item ("Original, com caixa e nota") em telas estreitas (375px) sem indicar que tem mais. **Fix:** ou marquee animation, ou esconder progressivamente itens com `hidden` em vez de cortar.
16. **src/dashboard/src/app/(admin)/page.tsx:300-313** — Tabela "Top 5 produtos" não tem `min-w-[640px]` explícito; em mobile com `overflow-x-auto` mostra colunas espremidas em vez de scroll horizontal. **Fix:** dar `min-w-[640px]` no `<table>`.
17. **src/frontend/src/app/policies/[slug]/page.tsx:147** — `MarkdownLite` usa `dangerouslySetInnerHTML` direto no conteúdo do CMS (`StoreSettings.privacyPolicy` etc). Se admin colar HTML malicioso, abre XSS. Hoje só admin edita, mas vale notar. **Fix:** sanitizar com DOMPurify ou escapar `<`/`>` antes do `inline()`.

## OK (varrido, sem bugs visíveis)

- Painel `/login` (redirect 307 nas rotas protegidas funciona, login UI limpo).
- `/auth/login`, `/sobre`, `/policies/privacy`, `/favoritos` (estado vazio bonito).
- Aria-labels: nenhum duplicado, todos ícones-botão têm label.
- Imagens: nenhuma página renderizou o fallback `from-surface-2` nas URLs testadas (todas as `primaryImage.url` populadas).
- H1: 1 por página em todas as 10 testadas.
- Marketing assets `/marketing/hero-banner.jpg` e `/marketing/comunidade.jpg` existem em `public/`.

## Resumo executivo
- **4 críticos** (1 quebra HTML em todos os cards, 1 deixa mobile sem busca, 1 lista inválida no carrinho, 1 botão morto na página de produto).
- **7 médios** (sobreposições visuais reais nos cards mobile + violações do brand-brief de copy).
- **6 pequenos** de polimento.

Itens 1, 2 e 4 são os que o cliente provavelmente está vendo como "errinhos de UX". Bug 5 (badges colidindo no card) é o "coisas sobrepondo".
