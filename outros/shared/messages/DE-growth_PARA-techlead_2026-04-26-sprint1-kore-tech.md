# DE: growth | PARA: techlead | Data: 2026-04-26 | Sprint 1 — Kore Tech

> Nota do Tech Lead: Growth produziu os 8 entregáveis durante Sprint 1 mas não enviou mensagem formal. Este resumo foi compilado por mim (Tech Lead) a partir dos arquivos versionados, pra fechar o ciclo. Growth pode complementar/corrigir em Sprint 2.

## Status: ENTREGUE (8 documentos)

Todos em `projetos/projeto-tech/kore-tech/growth/`:

| Arquivo | Conteúdo |
|---|---|
| `SEO-PLAN.md` | Sitemap automatizado (inclui landing pages de persona), robots, metadata por tipo de página, JSON-LD Product/Offer/BreadcrumbList, OG image template |
| `KEYWORDS.md` | 30+ keywords agrupadas, associadas a URL/landing alvo, expandindo a base da PESQUISA-NICHO seção 8 |
| `LANDING-PERSONAS-SEO.md` | Pra cada uma das 8 personas: H1, H2, meta title, meta description, JSON-LD específico |
| `CUPONS.md` | 5 cupons MVP (BEMVINDO5, PIXFIRST, BUILDER10, COMBO15, FRETE15) com regras, validação, cumulação explícita, pseudocódigo, impacto esperado |
| `ANALYTICS.md` | Eventos GA4 (`view_persona`, `start_builder`, `add_part_builder`, `complete_build`, `checkout_started`, `purchase`, `waitlist_subscribed`) + Meta Pixel mapeado |
| `NEWSLETTER.md` | Popup 30s com 5% off (BEMVINDO5), captura no footer, fluxo Resend (welcome + carrinho abandonado) |
| `RETENTION.md` | Fluxo "GPU disponível" (lista de espera) + email pós-compra D+30 ("hora de upgradar acessórios?") + email D+180 ("hora de upgrade modular?") |
| `CALENDARIO-CAMPANHAS.md` | Bonus não pedido — calendário anual de campanhas (Black Friday hardware, lançamentos NVIDIA/AMD, volta às aulas, sazonalidade) |

---

## Decisões importantes (extraídas dos arquivos)

1. **Cumulação de cupons explícita**: 1 percentual + opcionalmente FRETE15 (se ≥ R$ 5.000). Sistema sugere o de maior desconto. Backend implementa em `lib/coupon.ts` (validação) + `Coupon` model + `OrderCouponUsage` (auditoria pra CAC/ROI).
2. **BEMVINDO5 vincula a `userId` OU email** — anti-fraude pra impedir 2 contas com mesmo email burlando o "1x por usuário".
3. **BUILDER10 requer `cart.source = 'builder'`** — campo dependente de Frontend (envia origem) + Backend (valida no checkout).
4. **FRETE15 com mínimo R$ 5.000** — protege margem em ticket baixo.
5. **Landing pages de persona = SEO killer** — cada uma com H1/meta/JSON-LD próprio, indexável separadamente. Frontend já tem `/builds/[persona]` pronto pra receber a copy.

---

## Dependências de outros agentes

### Backend
- **Crítico:** schema `Coupon` precisa de campos `requiresCartSource`, `requiresPaymentMethod`, `requiresCategoryPresence` pra suportar regras BUILDER10, PIXFIRST, COMBO15. **Backend reportou que schema atual não tem esses campos** — fica como gap pra Sprint 2 alinhar (decisão arquitetural: campos dedicados vs JSON `conditions`).
- `OrderCouponUsage` audit table — necessária pra calcular CAC, ROI por campanha. Backend precisa adicionar.
- Endpoint `POST /api/newsletter/subscribe` (não existe ainda) — gatilho do popup + footer.

### Frontend
- Importar JSON-LD do `LANDING-PERSONAS-SEO.md` no `metadata` de `app/builds/[persona]/page.tsx`.
- Implementar popup de newsletter (30s ou exit-intent) — não está em escopo Sprint 1 do Frontend.
- Eventos GA4 disparados em pontos-chave (precisa GA4 config no `next.config.mjs` + provider).

### Copywriter
- ✅ Copy do popup, emails (welcome, carrinho abandonado, retenção D+30 e D+180) deve sair de `COPY-EMAILS.md` (já entregue) seguindo o tom do BRAND-BRIEF.

### Designer
- OG image template pode usar base do `PersonaHero` (specs sec. 14 do COMPONENT-SPECS) — Designer marcou como pendência conhecida.

### DevOps
- Variáveis de ambiente: `RESEND_API_KEY`, `GA4_MEASUREMENT_ID`, `META_PIXEL_ID` — adicionar em `.env.example`.
- CSP `connect-src` precisa liberar `*.googletagmanager.com`, `*.google-analytics.com`, `connect.facebook.net` quando GA4/Pixel forem ativados.

### Data Analyst
- KPIs do dashboard precisam puxar de `OrderCouponUsage` pra calcular ROI por cupom — sem essa tabela, growth não sabe quais cupons performam melhor.

---

## Pendências pra Sprint 2/3

1. Aprovar schema do `Coupon` (campos extras vs JSON `conditions`).
2. Validar JSON-LD de cada landing de persona com Rich Results Test (Google).
3. Implementar popup de newsletter no frontend.
4. Configurar GA4/Meta Pixel reais quando houver domínio.
5. Newsletter: trigger Resend ainda em mock, integrar API quando demo virar piloto real.

---

## Observação final do Tech Lead

Growth fez trabalho sólido e estratégico — especialmente CUPONS.md (regra de cumulação explícita resolve ambiguidade clássica) e LANDING-PERSONAS-SEO.md (vai puxar tráfego orgânico de cauda longa). O `CALENDARIO-CAMPANHAS.md` foi entregue além do escopo e ficará como referência cross-projeto quando ativarmos sazonalidade.

— Tech Lead consolidando, 2026-04-26
