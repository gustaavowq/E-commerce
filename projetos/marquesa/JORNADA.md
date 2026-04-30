# Jornada — Marquesa

Cronologia das decisões, marcos e aprendizados deste projeto.

## 2026-04-29

### 19:30 — Briefing original
Gustavo definiu o projeto em mensagem por voz transcrita pelo voice-tech-lead (Whisper-small):

- E-commerce real, fica no ar enquanto ele acompanha (sem SLA, é teste de capacidade)
- **Imobiliária** (não produto físico)
- 1 URL única, 3 zonas (cliente / ADM / analista) com role-based routing
- Conteúdo "falso mas coerente": fotos reais da web, descrições inventadas, endereço/contato fake
- Pesquisa profunda BR + EUA + Europa
- Estilo Apple/Linear + scroll-reveal Cisco
- **Funcionar em qualquer PC** (não repetir bug Kore Tech: auth+scroll quebraram fora do PC dele)
- Painel ADM adaptado pra imobiliária (status: vendido, em negociação, disponível)
- 2 emails: 1 ADM sério + 1 cliente (acesso entregue ao Gustavo)
- Tech-lead orquestra 8 skills em paralelo

### 19:55 — Decisões travadas
- **Nome:** Marquesa (sofisticado italiano, boutique)
- **Modelo:** sinal pra reservar imóvel à venda (5% default, ajustável 1-5% por imóvel; trava 10 dias)
- **Subdomínio:** `marquesa.gustavo.agenciaever.cloud`
- **Containers:** `gustavo-marquesa-{web,api,db}`
- **Portas:** web `127.0.0.1:8210` / api `127.0.0.1:8211`

### 20:00–00:30 — Onda 1-5: 7 Agents disparados em paralelo
Tech-lead orquestrou todas as fases com Agents independentes em background.

---

## Marcos

- [x] **Fase 0** — Pesquisa de nicho (BR/EUA/Europa, refs Compass+Lionard+Quintela+Bossa Nova, paleta+tipografia+animação dominantes, funil 12 etapas, sinal de reserva como QuintoAndar). Output: `PESQUISA-NICHO.md`
- [x] **Fase 1** — Estrutura base: `README.md` + `JORNADA.md` + `DECISOES-ESPECIFICAS.md` + brief inter-agent
- [x] **Fase 2** — Designer: `brand-brief.md` + `design/tokens.css` + `design/tailwind-extend.json`. Paleta monocromática + verde-musgo (#4A5D4F), Cormorant Garamond + Inter (free, upgrade Canela+Söhne troca 2 CSS vars), cantos vivos, animação sóbria
- [x] **Fase 3** — Backend: 7 models Prisma + 5 enums; 20+ endpoints; MP Preference API + webhook idempotente HMAC; job de expiração 1h; seed lendo `catalogo.json`; Dockerfile multi-stage USER non-root. Typecheck 0
- [x] **Fase 3b** — Backend Delta KPI: campos `Imovel.viewCount/lastViewedAt/lastInteractionAt`, `Reserva.precoSnapshot`; `POST /api/imoveis/:slug/view` com rate-limit; transações `$transaction` em leads/reservas
- [x] **Fase 4** — Frontend único: Next.js 14, 19 rotas iniciais; middleware role-based + RoleGate client; ScrollReveal IntersectionObserver run-once; ImovelWritePayload separado; cookie sem domain hardcoded. Build standalone OK
- [x] **Fase 5** — Copywriter: `catalogo.json` (20 imóveis: 6 cob/6 apto/4 casa/2 sobrado/2 terreno-comercial; R$ 1,75M-14,8M; fotos Unsplash; lat/lng em parques SP); `microcopy.json` (26 seções); páginas institucionais (arras CC 417-420, LGPD); 3 templates email. Sócio fundador Lorenzo Mancini. Zero travessões
- [x] **Fase 5b** — Data-Analyst: 9 KPIs + funil 12 etapas + 9 snippets Prisma/SQL
- [x] **Fase 7** — DevOps: `infra/docker-compose.yml` (dev só DB) + `docker-compose.prod.yml` (3 services VPS) + `infra/nginx/marquesa.conf` + `infra/scripts/setup-vps.sh` idempotente + `DEPLOY.md` passo-a-passo. COOKIE_DOMAIN vazio em prod
- [x] **Fase 7b** — Growth: `sitemap.ts` dinâmico + `robots.ts` + JSON-LD `RealEstateListing` por imóvel + `RealEstateAgent` na home + `generateMetadata` rico + GA4/Pixel gated por consent + cookie banner LGPD 3 cat + NewsletterCapture
- [x] **Fase 6** — QA bug-bash + security audit OWASP Top 10. Veredicto inicial **NO-GO** com 7 bloqueadores críticos. Reports em `qa/`
- [x] **Onda 6** — Fixes:
  - Backend: B2 (senha 8 chars), B3 (`/admin/leads`), B4 (`/admin/dashboard/summary` consolidado), B5 (defaults 5%/10d alinhados), bonus retrocompat payload `{action}`
  - Frontend: B1 (payload reservas correto), B6 (`/auth/reset` page), B7 (`/reservas/[id]` page). 22 rotas
  - **Todos 7 bloqueadores resolvidos**
- [x] **Fase 8** — Acumulação memória: `memoria/70-NICHOS/imobiliaria.md` template completo do nicho extraído deste projeto

---

## Aprendizados pra próximo projeto desse nicho

1. **Imobiliária ≠ e-commerce de produto** — adapta painel cedo, não copia template Miami
2. **5%/10d funciona melhor que 2%/7d** — mostra seriedade do cliente; cabe na lei BR (arras CC 417-420)
3. **`/admin/leads` e `/admin/dashboard/summary` consolidado** sempre são esquecidos no schema inicial — adicionar no template
4. **`/auth/reset?token=` page** sempre falta — incluir no scaffold inicial
5. **`/reservas/[id]` callback MP** sempre falta — incluir no scaffold inicial
6. **Validação de senha** sempre diverge frontend vs backend — padronizar 8 chars sem regex especial
7. **Disparar QA antes de declarar pronto** — pegou 7 bloqueadores críticos que parecia tudo certo

Tudo absorvido em `memoria/70-NICHOS/imobiliaria.md`.

---

## Status final

Pronto pro Gustavo executar `qa/smoke-checklist.md` localmente. Quando aprovar, deploy via `infra/scripts/setup-vps.sh` na VPS Jean.

Pendências do humano antes de prod real:
- Pedir DNS pro Jean: `marquesa.gustavo.agenciaever.cloud → 187.127.17.153`
- Configurar segredos em `backend/.env.production` (JWT, MP, DB)
- Configurar webhook MP no painel MP
- Registrar GA4 + Meta Pixel
- Substituir CRECI placeholder por número real
