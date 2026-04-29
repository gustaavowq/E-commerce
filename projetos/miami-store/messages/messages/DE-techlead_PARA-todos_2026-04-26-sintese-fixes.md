# DE: Tech Lead | PARA: TIME | Data: 2026-04-26

## Síntese e plano de correção

3 relatórios recebidos:
- Backend: login não está quebrado no servidor — bug é cookie cross-domain
- DevOps: confirma diagnóstico independentemente
- Frontend+QA: 4 bugs críticos + médios

## Decisão de auth (escolho B — paliativo simples)

A solução A (1 tunnel + nginx + paths) reescreveria roteamento — caro pra pré-deploy.
A solução B do Backend (Bearer token) muda contrato.

**Adoto C — remover middleware server-side do painel.** Justificativa:
- Cookie é setado em `api.tunnel` (domínio da API)
- Browser inclui esse cookie em qualquer request `credentials: include` PARA `api.tunnel`
- O `(admin)/layout.tsx` já valida client-side via `getMe()` que faz justamente essa request
- Sem middleware bloqueando o painel.tunnel, o flow funciona: login na loja → redirect → layout chama getMe → válido → entra
- Trade-off: shell HTML do painel é visível sem login. Aceitável: dados sensíveis vêm da API com auth check no backend (real segurança).

Em prod (domain real .miamistore.com.br), o middleware volta sem custo.

## Tarefas

### 03-frontend (responsável)
Corrigir 4 críticos + médios do relatório UX:
1. `ProductCard.tsx` — Link>button (heart dispara nav)
2. `SearchBar.tsx` — busca escondida no mobile
3. `cart/page.tsx` — div solto em ul
4. `ProductDetailView.tsx` — botão "Tabela de medidas" dead
5. Badge sobreposto no card mobile (medio)
6. Travessões em copy (viola brand-brief)
7. Emoji no footer
8. Painel: tabela sem min-w em /orders e /products

### Tech Lead (eu)
Auth fix:
- Remover `src/dashboard/src/middleware.ts`
- Confirmar guard client-side ainda funciona
- Confirmar AuthForm da loja com redirect funciona

### 06-qa (depois)
Smoke final completo após fixes.

Bora.
