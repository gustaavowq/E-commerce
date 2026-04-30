# Brief inicial — Marquesa (kickoff)

**De:** Tech-Lead
**Para:** Backend, Frontend, Designer, Copywriter, Data-Analyst, DevOps, QA, Growth
**Data:** 2026-04-29 20:00

## Contexto

Imobiliária boutique de venda de imóveis com sistema de **sinal pra reservar** (cliente paga 1-5% via MercadoPago pra travar o imóvel por 7 dias). Projeto-teste de capacidade do framework. Deploy real na VPS Jean (`marquesa.gustavo.agenciaever.cloud`). Fica no ar enquanto Gustavo acompanha.

Leiam **`projetos/marquesa/`** completo antes de começar:
- `README.md` — visão geral + stack
- `JORNADA.md` — cronologia
- `DECISOES-ESPECIFICAS.md` — decisões já travadas (NÃO retoque)
- `PESQUISA-NICHO.md` — quando ficar pronta (Fase 0 rodando), traz refs BR/EUA/Europa, mood, KPIs

## Diferenças críticas vs e-commerce comum

1. **NÃO é produto físico** — é imóvel. Catálogo é mais visual, descrição mais editorial, foco em fotos grandes
2. **Checkout é "sinal"** não compra final. Webhook MP só muda status pra `RESERVADO` por 7 dias
3. **Painel adaptado:** status (DISPONIVEL/RESERVADO/EM_NEGOCIACAO/VENDIDO/INATIVO), 5 estados, não é "carrinho/pedido"
4. **3 roles** (USER, ADMIN, ANALYST), 1 URL única, role-based redirect

## Sua função

### Backend (`ecommerce-backend`)
Schema Prisma: `Imovel`, `Reserva`, `User` (roles enum), `Lead`. Endpoints REST `/api/imoveis`, `/api/reservas`, `/api/auth/*`, `/api/admin/*`. MP webhook que cria/expira reservas. Job pra reservas expirarem em 7 dias. Seed com 20 imóveis (rodar script que importa do `assets/catalogo.json` que o copywriter vai criar).

### Designer (`ecommerce-designer`)
Brand-brief Marquesa boutique italiano. Paleta sofisticada (provavelmente bege/cream + verde escuro + dourado discreto, mas confirma com pesquisa quando vier). Tipografia serifada hero + sans UI. Tokens Tailwind. Anti-padrões: NÃO usar Shopify-style, NÃO usar paleta saturada, NÃO usar animação invasiva.

### Frontend (`ecommerce-frontend`)
Next.js 14 App Router único pra loja+painel. Routing:
- `/` home com hero scroll-reveal
- `/imoveis` catálogo com filtros (tipo, faixa preço, quartos, bairro)
- `/imoveis/[slug]` PDP com galeria, Google Maps embed, botão "Reservar com sinal"
- `/auth/login` universal
- `/painel/*` admin/analista (middleware de role)
Stack: Tailwind + Zustand (auth, cart removido — não tem cart, só reserva pontual) + TanStack Query.

### Copywriter (`ecommerce-copywriter`)
Curadoria de 20-30 imóveis: pesquisa fotos reais (Unsplash, Pexels), inventa descrição coerente (não disonante com a foto). Cria `assets/catalogo.json` no formato pra seed. Microcopy UI (CTAs: "Quero reservar", empty states, política de sinal). Páginas institucionais (sobre, contato, política de reserva, LGPD).

### Data-Analyst (`ecommerce-data-analyst`)
KPIs do painel imobiliária:
- Visitas no catálogo (total, por imóvel)
- Leads (form de interesse preenchido)
- Sinais pagos (count, total R$)
- Ticket médio (preço médio dos imóveis com sinal pago)
- Conversão (sinais pagos / leads)
- Tempo médio em catálogo (dias até primeiro sinal)
- Reservas ativas vs expiradas
- Taxa de fechamento (vendido / sinal pago)

Endpoints `/api/admin/dashboard/*` retornando esses KPIs.

### DevOps (`ecommerce-devops`)
Docker Compose pra VPS Jean:
- `gustavo-marquesa-web` (Next 14 build, porta `127.0.0.1:8210`)
- `gustavo-marquesa-api` (Express+Prisma, porta `127.0.0.1:8211`)
- `gustavo-marquesa-db` (Postgres 16, sem porta exposta, volume nomeado)

Nginx site-available com `proxy_pass` pra cada porta + path. Certbot pra subdomínio. Cada container com `mem_limit: 512m`, `cpus: 1.0`, `USER app` (não-root), restart `unless-stopped`. `.env` no `.gitignore`.

### QA (`ecommerce-qa`)
Smoke E2E — login admin → CRUD imóvel; login cliente → catálogo → PDP → sinal MP. Pentest OWASP Top 10. Bug-bash UX em **2 browsers** (Chrome + Firefox) e **2 viewports** (mobile + desktop). **Validação especial:** auth e scroll funcionarem em PC diferente do dev (não repetir bug Kore Tech).

### Growth (`ecommerce-growth`)
SEO técnico (sitemap, robots, JSON-LD `RealEstateListing` schema, OG images dinâmicas), GA4 + Meta Pixel placeholder. Coupons N/A neste projeto (sinal não desconta). Newsletter capture no footer com promessa de "primeiro a saber dos novos imóveis".

## Cronograma

- **Fase 0** (rodando): pesquisa de nicho — terminem antes de começar visual e copy
- **Fase 1** (concluída): estrutura base
- **Fase 2-7** dispatch em paralelo após Fase 0 retornar
- **Fase 8** acumulação de aprendizado em `memoria/70-NICHOS/imobiliaria.md`

## Não fragmentar

Gustavo pediu explicitamente: **sem perguntinhas a cada arquivo**. Cada agente entrega seu bloco completo, dispara mensagem `DE-{seu-agente}_PARA-techlead_*.md` ao terminar. Tech-lead consolida.

## Bug-bash zero

NÃO esquecer: botão sem onClick, hover sobrepondo, X de fechar quebrado, scroll travando, animação invasiva, link dead. Memória `feedback_animacoes_invasivas_proibidas.md` é lei.

Bora.
