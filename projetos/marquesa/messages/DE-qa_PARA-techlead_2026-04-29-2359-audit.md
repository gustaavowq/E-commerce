# DE: qa | PARA: techlead | 2026-04-29 23:59

## VEREDITO: REPROVADO COM BLOQUEADORES (precisa nova rodada antes de deploy)

7 bloqueadores críticos identificados (5 funcionais, 2 de consistência decisão). Smoke pode ser executado mas vai parar em itens-chave (ações de reserva no painel, dashboard, leads, fluxo de senha no register, fluxo pós-pagamento).

## Smoke E2E (estático)
Fluxo público (home → catálogo → PDP → lead/reserva intent) parece funcional no código. Não rodei real (sem browser); checklist completo em `qa/smoke-checklist.md` pra Gustavo executar.

## Pentest (OWASP Top 10)
- Críticos: 0
- Altos: 1 (Next 14 npm audit, **DoS via Image Optimizer + HTTP smuggling em rewrites**) — fix força major upgrade pra 16.x. Aceitar como risco MVP, abrir issue.
- Médios: 3 (mercadopago/uuid bounds check moderate, postcss XSS, CORS_ORIGIN env precisa setado em `.env.production`)
- Auth tem implementação sólida: refresh rotation com detecção de reuso, anti-enumeração no forgot, rate limit no login com `skipSuccessfulRequests`, JWT_SECRET fail-fast em prod, bcrypt cost 10. Webhook MP idempotente (`webhookEventId` UNIQUE) com HMAC `timingSafeEqual`. **Não-trivial: testei a lógica de detecção de reuso e revogação em chain — está correta.**

## Bug bash UX
- Críticos (quebra fluxo): 7 (numerados em `qa/bug-bash-ux.md`)
- Médios: 9
- Pequenos: 11

## Pendências bloqueantes (precisam fix antes de deploy)

1. **Painel reservas — ações enviam payload `{action: "..."}` mas backend espera `{status, extenderDias}`** [`frontend/src/app/painel/reservas/page.tsx:25-27`]. Bloqueia gestão pós-venda. Fix: mapear `action` → payload correto.
2. **Senha mínima 8 (frontend) vs 10+especial (backend)** [`RegisterForm.tsx:19` vs `validators/auth.ts:14-20`]. Bloqueia novos cadastros via UI. Fix: alinhar pelo backend, atualizar microcopy `senha_curta`.
3. **`GET /api/admin/leads` não existe** [chamada em `painel/leads/page.tsx:15`]. Painel leads sempre vazio. Fix: criar rota admin (padrão `clientes.ts`).
4. **`GET /api/admin/dashboard/summary` não existe**, fallback `kpis` retorna shape errado [`painel/page.tsx:33`]. Dashboard nunca mostra dados reais. Fix: Data-Analyst implementa `summary` no shape do contrato `SummaryResponse`.
5. **DECISOES diz 5% sinal default + 10 dias reserva, código tem 2% + 7 dias, microcopy diz 5% + 10 dias hard-coded.** Cliente vê valor inconsistente entre PDP/checkout/MP. Fix: decidir 5%+10d (recomendado, alinha com prática BR) e propagar pra env, schema default, microcopy, hard-codes em `ImovelActions:34` e `ImovelForm:191`.
6. **`/auth/reset?token=...` page não existe no frontend.** Backend gera link, mas usuário click → 404. Fix: criar `/auth/reset/page.tsx` que consome `POST /api/auth/reset-password`.
7. **`/reservas/[id]` page não existe.** MP back_urls (`mercadoPago.ts:77-79`) e mockPreference (`:39`) redirecionam pra essa rota → 404 pós-pagamento. Fix: criar rota Next que mostra status da reserva.

## Riscos médios não-bloqueantes (vale fix antes da iteração #2)
- `.env.example` aponta DATABASE_URL porta 5432, compose dev expõe 5433 — onboarding falha no 1º run.
- NewsletterCapture cria Lead poluído atrelado a imóvel arbitrário (KPI conversão_lead infla).
- Sort `'recentes'` no frontend cai no default backend (espera `'recent'`).
- Falta endpoint PATCH `/api/admin/leads/:id` pra marcar `contatado=true` (campo existe no schema).
- ITBI não mencionado em PDP/footer (DECISOES exige por compliance Cofeci 1504/2023).
- Schema Imovel sem campo `matricula`/`registro` (Cofeci 1504/2023 exige).

## Pontos fortes (não-trivial)
- Refresh token com rotation + reuse-detection em chain — implementação madura.
- Transações Prisma corretas em todas operações compostas (lead+bump, reserva+bump, webhook+imovel, expiry+imovel, reset+revoke-all-refresh).
- Snapshot de preço (`precoSnapshot`) na Reserva — KPI Data-Analyst não distorce com reprecificação.
- ScrollReveal respeita `prefers-reduced-motion`. ScrollBehavior smooth global proibido (lição 27 capturada). Sem cursor glow / parallax / scroll-jacking.
- Hover scale do card só na imagem (lição 28 capturada).
- Helmet ligado, CSP no Next, X-Frame-Options DENY no nginx, rate-limit em camadas (Express + nginx).
- Cookie sem domain hardcoded (lição Kore Tech 02).
- Webhook MP HMAC com `timingSafeEqual` constant-time, idempotente, re-consulta MP.

## Aprovação pra deploy: NÃO

Recomendação: o tech-lead deve disparar uma rodada curta:
- `ecommerce-frontend` resolve itens 1, 2, 6, 7 (fixar payload do PATCH reservas, alinhar senha, criar `/auth/reset` e `/reservas/[id]`).
- `ecommerce-backend` resolve item 3 (`GET /api/admin/leads`).
- `ecommerce-data-analyst` resolve item 4 (`GET /api/admin/dashboard/summary` com shape correto).
- `ecommerce-tech-lead` decide item 5 (sinal 5% e 10 dias vs 2%+7d) e propaga.

Após esses fixes (~45-90min), QA roda smoke real de novo via `qa/smoke-checklist.md`. Bloqueador zero → GO.
