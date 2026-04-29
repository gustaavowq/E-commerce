# De: Frontend (Agente 03)
# Para: Todos
# Data: 2026-04-26
# Assunto: ENTREGA — Loja Miami Store no ar (Sprint 1)
# Prioridade: Alta

## TL;DR
Loja Next.js 14 rodando em **http://localhost** consumindo o backend real. **5 páginas** funcionais, design system aplicado, mobile-first 375px, SSR + cookies httpOnly compatíveis. Carrinho cliente-side funcional (sem checkout — sprint 2 do Backend).

## URLs ativas
| Rota | O que tem | Status |
|---|---|---|
| `http://localhost/` | Home com hero, USP strip, marcas, 8 produtos em destaque, CTA comunidade | ✅ 200 |
| `http://localhost/products` | Listagem com filtros sidebar (marcas + categorias + sort) | ✅ 200 |
| `http://localhost/products/polo-lacoste-vermelha` | Detalhe com galeria, seletor cor+tamanho, badge Pix 5%, add to cart | ✅ 200 |
| `http://localhost/cart` | Carrinho com qty controls, frete fixo, total Pix | ✅ 200 |
| `http://localhost/auth/login` + `/auth/register` | Forms com Zod + redirect por role após login | ✅ 200 |

## Estrutura final

```
src/frontend/
├── Dockerfile.dev
├── next.config.mjs       (allow placehold.co + INTERNAL/PUBLIC API URL)
├── tailwind.config.ts    (tokens IMPORTADOS do design-system.md)
├── package.json          (lucide-react PINADO em 0.460.0)
└── src/
    ├── lib/
    │   ├── utils.ts       (cn helper — clsx + tailwind-merge)
    │   ├── format.ts      (formatBRL, discountPercent, pixPrice, installmentLabel)
    │   ├── api.ts         (fetch wrapper — RSC vs client URLs distintas)
    │   └── api-error.ts
    ├── services/
    │   ├── types.ts       (espelha docs/api-contracts.md)
    │   ├── products.ts, brands.ts, categories.ts, auth.ts
    ├── stores/
    │   ├── cart.ts        (Zustand + persist localStorage, hydration-safe)
    │   └── auth.ts        (estado da UI; cookie httpOnly é a fonte de verdade)
    ├── components/
    │   ├── ui/Button.tsx  (variantes + size + loading + touch-44)
    │   ├── Header.tsx, Footer.tsx, PromoStrip.tsx, WhatsAppButton.tsx
    │   ├── ProductCard.tsx (selo Original + hover sutil, sem hover-only)
    │   ├── BrandStrip.tsx, CartIndicator.tsx, AuthenticityBadge.tsx
    └── app/
        ├── layout.tsx, providers.tsx, globals.css
        ├── page.tsx                              (home)
        ├── products/page.tsx                     (listagem)
        ├── products/[slug]/page.tsx + ProductDetailView.tsx (RSC + Client split)
        ├── cart/page.tsx                         (client-side)
        └── auth/{login,register}/page.tsx + AuthForm.tsx
```

## Decisões importantes que tomei

### 1. URL split RSC vs Client
- **Server Components (SSR/RSC):** chamam `http://backend:3001` direto via rede do compose (`INTERNAL_API_URL`). Mais rápido, menos hop.
- **Client Components (browser):** chamam `/api/...` (relativo) que vai pro Nginx → backend. Cookie httpOnly automatically incluído.

### 2. Hydration-safe pra carrinho
O `useCart` usa `persist` do Zustand → localStorage. Render client-side só após mount via `useEffect(() => setMounted(true))` pra evitar hydration mismatch entre SSR (vazio) e client (com itens).

### 3. Mobile-first agressivo (regra do AGENT.md)
- Touch target 44px em todo botão/link
- Sem `:hover` exclusivo — `ProductCard` mostra "Comprar" SEMPRE em mobile
- Filtros viram drawer em <lg (sprint 2 — por enquanto só desktop sidebar)
- Sticky bottom-bar no checkout (próximo sprint)
- Lighthouse ainda não auditado — QA sprint 1

### 4. Design system fiel
Tokens copiados de `docs/design/design-system.md` pro `tailwind.config.ts`. Quando o Designer atualizar lá, atualize aqui também (sincronia manual por enquanto).

### 5. ProductCard e ProductDetail seguem o brief
- Selo "100% ORIGINAL" em destaque (combate o medo principal)
- Badge da marca no canto superior esquerdo
- Badge de desconto vermelho quando há `comparePrice`
- Card "Pix com 5% OFF" verde sempre visível
- "Últimas X peças!" amarelo se stock ≤ 3

### 6. WhatsApp flutuante
Componente fixo bottom-right, animação `pulse-soft`, número via `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Problemas que resolvemos durante o sprint (pra documentar)

### 🔥 Crise de disco — 62GB de Temp
O `%LOCALAPPDATA%\Temp` estava com 62GB de lixo de builds antigas. Disco C: tinha 0.1GB livre — Docker não conseguia subir nada. Limpamos: liberou 84GB. **Procedimento:** PowerShell → `Get-ChildItem $env:LOCALAPPDATA\Temp -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue`. Rodar uma vez por mês.

### 🔥 lucide-react v1.x typo-squat
O pacote `lucide-react` no npm tem **duas linhas paralelas**: `0.x` (oficial Lucide Icons, atualíssimo) e `1.x` (legado/fork esquecido sem ícones modernos). `npm install lucide-react` (sem versão) sorteia a maior — pega 1.11.0 e quebra. **Fix:** pinar `"lucide-react": "0.460.0"` no package.json (sem `^`).

## Pra cada agente

### → Backend (Agente 01) — sua vez
Sprint 2: implementar **carrinho server-side + checkout + Pix**. Endpoints esperados (já documentados em `docs/api-contracts.md > Planejados`):
- `POST /cart`, `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`
- `POST /orders` (gera order, baixa estoque atomicamente)
- `POST /payments/pix` (cria QR via MercadoPago, retorna `pixCopyPaste` + `pixQrCode`)
- `POST /webhooks/mercadopago` (idempotente via `webhookEventId`)
- `POST /shipping/calculate` (frete fixo R$15 + ViaCEP pra validar CEP)

Frontend tá esperando esses endpoints — quando subirem, plugamos o checkout.

### → Designer (Agente 02)
Tudo que fiz tá baseado nos tokens do `design-system.md`. Reveja se a aplicação real bateu com o que você imaginou:
- Verde Lacoste como CTA (botões)
- Banner promo preto com fonte serif chunky
- ProductCard com selo Original
- Wireframes de cart e produto
Se algo precisa ajuste, mensagem em `shared/messages/DE-designer_PARA-frontend_*.md`.

### → DevOps (Agente 05)
- Container `frontend` no compose **HABILITADO** com hot reload via volume mount + `WATCHPACK_POLLING=true`
- Nginx faz proxy `/` → frontend:3000 com WebSocket upgrade pra HMR
- `INTERNAL_API_URL` e `NEXT_PUBLIC_API_URL` configurados no compose
- Fica como bug conhecido: hot reload via volume mount no Windows + WSL2 às vezes demora 2-3s pra propagar mudanças. Aceito por enquanto (alternativa seria `Dockerfile.dev` com `npm run dev` rodando localmente, fora do container)

### → QA (Agente 06)
**Pode começar a testar.** Fluxo crítico mínimo:
1. Home carrega < 3s, todas imagens aparecem
2. Click em produto → vê detalhes, escolhe variação, adiciona ao carrinho
3. Carrinho mostra item, qty +/- funciona, total bate com (preço × qty + R$15 frete)
4. Login com `admin@miami.store` / `miami2026` → redireciona pra `/admin` (vai dar 404 — dashboard é sprint 3)
5. Cadastro → loga automaticamente → vai pra `/`

**Lighthouse:** rodar nos 4 fluxos críticos (`/`, `/products`, `/products/[slug]`, `/cart`). Score Mobile < 80 = bug. Score Mobile < 85 = warning.

### → Data Analyst (Agente 04)
Painel Admin é o sprint 3. Endpoints já existem (`/api/admin/dashboard/*`). Sua revisão dos KPIs antes de eu começar é bem-vinda.

## Bloqueios em aberto
1. **Sem checkout funcional** — depende do Backend Sprint 2
2. **Sem painel /admin** — sprint 3 (`src/dashboard/` ainda vazio)
3. **Sem busca real** — botão Search no header só vai pra `/products` (filtros no querystring)
4. **Imagens são placehold.co** — substituir quando tivermos as fotos reais via Backend (campo `ProductImage.url` aponta pra qualquer URL, hoje aponta pra placeholder)
5. **Sem testes E2E ainda** — QA sprint
6. **Sem PWA / service worker** — fase 2

## Próxima entrega esperada do Frontend (sprint 3)
- Painel admin em `src/dashboard/` (Next.js separado)
- Login admin redireciona pra `/admin` real (não mais 404)
- Dashboard com KPI cards + RevenueChart + TopProductsChart + RecentOrdersTable
- CRUD de produtos no admin
- Páginas de pedido (lista + detalhe)

Tô disponível em `shared/messages/`.
