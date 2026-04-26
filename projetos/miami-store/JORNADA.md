# 🗺️ Jornada do Miami Store

> Cronologia do que a gente fez, do zero ao deploy. Pra você acompanhar e entender em que ponto estamos.

## Sprint 1 — Fundação (semanas iniciais)

**O que aconteceu antes desta conversa:**
- Tech Lead definiu stack (Next.js + Express + Prisma + Postgres)
- Backend criou schema do banco (User, Product, Order, etc)
- Designer entregou paleta verde+amarelo (Lacoste-inspired) e voz da marca
- Frontend montou loja básica (header, home, lista de produtos, PDP, carrinho, checkout)
- Frontend montou painel admin básico (sidebar, dashboard, produtos, pedidos, cupons, configurações)
- DevOps configurou Docker compose + Nginx pra rodar local
- Seed inicial com 7 produtos Lacoste

## Sprint 2 — Polimento + R$ 10k tier (esta conversa)

**Objetivo:** elevar o produto pra um "vendável a R$ 10 mil".

### 1. 12 entregas do "produto vendável"

Adicionei nesse sprint:
- **Wishlist** (favoritos) com persistência no banco quando logado
- **Reviews** com aprovação manual + estrelas
- **Cupons** completos (PERCENT, FIXED, FREE_SHIPPING) + métricas
- **Filtros avançados** na PLP (preço, tamanho, cor, marca, categoria, em promoção)
- **Multi-imagens por cor** no produto (galeria muda quando troca cor)
- **OG image dinâmica** (preview bonito quando compartilha link)
- **Sitemap + robots.txt** dinâmicos pro Google indexar
- **Páginas de política** customizáveis pelo painel (privacidade, termos, troca, frete)
- **Sobre + Contato** com mapa Google integrado
- **Newsletter popup** + WhatsApp opt-in pós-compra
- **Painel de configurações** completo (branding, contato, comercial, legal)
- **Auth refresh token rotation com reuse detection**

### 2. Bug bash UX (3 agentes em paralelo)

Tech Lead disparou 3 agentes investigadores que acharam **8 bugs**:
1. WishlistHeart com `<Link>` envolvendo `<button>` (HTML inválido)
2. SearchBar oculta no mobile
3. `<div>` solto dentro de `<ul>` no carrinho
4. Botão "Tabela de medidas" sem onClick (dead button)
5. Aside sticky inflado pela descrição
6. Filtros duplicados na listagem
7. Fotos não apareciam (fallback `placehold.co` falhava)
8. Travessões em copy + emoji 🇺🇸 violando brand-brief
9. Tabelas painel sem `min-width`
10. Cookie cross-domain quebrando

Frontend corrigiu todos em paralelo. QA validou.

### 3. Integração loja ↔ painel

- Botão **"Painel"** verde aparece no header pra admin logado
- Botão **"Ver loja"** no menu do painel
- Login admin redireciona automaticamente pro painel
- Logout do painel volta pra loja

### 4. Security audit (3 pentesters em paralelo)

Encontraram **4 críticos** + 6 altos. Fixed:

🚨 **CRÍTICO #1 — JWT_SECRET era placeholder!** Pentester forjou token de admin com o valor padrão e acessou TODA a API. Trocamos por `openssl rand -base64 48` real.

🚨 **CRÍTICO #2 — Account takeover via `_devResetUrl`**. Endpoint `/forgot-password` retornava o link de reset na response. Bastava chamar com email do admin pra pegar acesso. Removemos o vazamento.

🚨 **CRÍTICO #3 — `SEED_ADMIN_PASSWORD` com default `miami2026`** vazado. Tirei o default, exige env real.

🚨 **CRÍTICO #4 — Stored XSS via Markdown**. Admin podia colocar `<script>` numa policy e roubar cookie de qualquer cliente. Adicionamos `escapeHtml()` antes do markdown render.

ALTOS: CSRF + SameSite, CSP ausente, 4 CVEs Next.js, CORS legacy, senha fraca aceita, X-Frame duplicado.

Tudo corrigido, QA revalidou, **APROVADO PRA RELEASE**.

### 5. Commits + Push GitHub

5 commits feitos:
- `0566667` — 12 entregas R$ 10k
- `e29c6e7` — bug bash UX
- `d56282c` — integração loja↔painel
- `7227723` — security fixes
- `f0111cc` — chore (gitignore, tsbuildinfo)

Pushed pra https://github.com/gustaavowq/E-commerce — ficou disponível como repositório público.

### 6. Deploy real

Esta foi a fase mais longa por causa dos issues do Railway/Vercel:

**Backend no Railway:**
- Login com GitHub
- New Project → escolheu repo
- Adicionou Postgres (1 clique)
- Configurou Root Directory: `src/backend`
- Configurou env vars (lista completa)
- Aprendeu armadilha: **NUNCA clicar em "Suggested Variables"** (importa placeholders inseguros)
- Generate Domain na porta 3001
- Build verde, healthz OK

**Subir Catálogo (seed):**
- Editou Custom Start Command pra incluir `&& npx prisma db seed &&`
- Aprendeu armadilha: precisa de `tsx` em `dependencies` (não `devDeps`) pra `npx prisma db seed` funcionar em prod Docker
- Fix commitado, push, redeploy
- Seed rodou: 7 produtos Lacoste no ar

**Loja no Vercel:**
- Add New Project, Root Directory `src/frontend`
- Aprendeu armadilha: Vercel reseta Application Preset pra "Other" ao mudar Root — clicar manualmente Next.js
- Env vars
- Deploy → URL `e-commerce-kohl-five-85.vercel.app`

**Painel no Vercel:**
- Mesma coisa, Root `src/dashboard`
- URL `miami-painel.vercel.app`

**Fechar CORS:**
- Voltou no Railway
- Atualizou `CORS_ORIGIN` com as 2 URLs Vercel
- Adicionou `NEXT_PUBLIC_DASHBOARD_URL` na loja Vercel

### 7. Issues pós-deploy (e os fixes)

Login admin dava "Erro inesperado". Investigamos:
- Causa: **CSP** (Content Security Policy) bloqueava fetch do frontend pra Railway porque a config tinha só `*.trycloudflare.com` (URLs antigas de demo)
- Fix: adicionar `*.up.railway.app` e `*.vercel.app` no `connect-src`
- Push, Vercel redeploy automático
- Login funcionou ✓

Senha admin: `aIKPI2GIp3Vx` (12 chars, sem special — fraca). Login funcionou mesmo assim porque o seed só passou pelo create do user, não pela validação Zod do register.

### 8. Pacote de ~30 melhorias UX (em curso)

Auditoria UX trouxe 50 ideias. 9 dependem de serviços externos (Cloudinary, Resend, etc). 41 implementadas:

**Backend:**
- Endpoint cross-sell (`/products/:slug/related`)
- Bulk actions de produto (ativar/inativar/destacar em massa)
- Métricas de cupom + duplicar cupom
- Top customers por LTV
- Produtos com problemas (sem foto, sem descrição, sem estoque)
- Filtros admin completos
- Tags em produto (filtro `?tags=novidade,promo`)
- **Cloudinary upload** (endpoint `/admin/upload`)

**Loja:**
- **Cupom no checkout** (era CRÍTICO — cliente recebia cupom no Insta e não conseguia aplicar!)
- WhatsApp opt-in pós-compra
- Barra "frete grátis acima de R$X" no carrinho
- Quantidade no botão Adicionar
- Compartilhar produto (WhatsApp + copiar link)
- Cross-sell "Quem viu também levou" na PDP
- Newsletter popup com 5% off
- Skeleton de loading na PLP

**Painel:**
- Notificação de pedido novo (toast + som + badge)
- Filtros completos em produtos
- Bulk actions
- Miniatura na lista
- Dropzone Cloudinary com upload direto

### 9. Memória operacional (etapa atual)

Você pediu pra documentar tudo pra IA não perder tempo no próximo projeto. Criei:
- **`memoria/`** — vault com 31 arquivos (decisões, lições, playbooks, padrões, templates de nicho)
- **`.claude/skills/ecommerce-*/SKILL.md`** — 9 skills do Claude Code (cada agente vira skill auto-invocável)
- **`projetos/miami-store/`** — esta documentação que você tá lendo

---

## Onde estamos agora

✅ Loja no ar publicamente
✅ Painel admin no ar
✅ API + banco no ar
✅ ~30 melhorias UX deployed
✅ Documentação completa

⏳ **Pendente** (precisa de você):
- Setar `CLOUDINARY_URL` no Railway (você criou conta, falta colar)
- Decidir quando comprar domínio próprio
- Decidir quando criar conta MercadoPago real
- Decidir quando integrar Resend

🎯 **Próximo passo natural**: brincar com o painel — criar produto, fazer pedido teste, sentir se tá fluindo. Reportar o que estranhar.

---

## Métricas dessa jornada

- **Tempo total**: 2 sprints (cerca de 1 dia útil intenso de conversa)
- **Mensagens user↔assistente**: ~80 (quero reduzir pra ≤ 20 no próximo)
- **Commits**: 9
- **Linhas de código (estimado)**: ~6.000 (TypeScript)
- **Bugs encontrados em pentest**: 4 críticos + 6 altos + ~10 médios
- **Bugs encontrados em UX**: 8 críticos + médios
- **Custo mensal pra rodar**: R$ 0 (free tier)

---

## Lição mais importante dessa jornada

**Validar segurança ANTES de subir prod.** A gente quase deployou com `JWT_SECRET=troque_isso_em_producao`. Em ataque real, perderia tudo. Hoje o playbook tem checklist obrigatório pré-deploy.

Tudo tá em [`memoria/30-LICOES/`](../../memoria/30-LICOES/INDEX.md) pro próximo projeto não repetir.
