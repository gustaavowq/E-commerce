# 🔬 Fase 6 — Audits 3 vetores

> Antes do deploy: pentest segurança + audit mobile 27-pt + bug-bash UX.
> QA agent só REPORTA, não fixa. Main thread (ou backend/frontend skill) ataca em batch.

Skill responsável: **`ecommerce-qa`**.
Tempo esperado: **30 min**.
Gate de saída: [[GATES#Gate 6 — Audits 3 vetores]].

## Vetores

### Audit 1 — Security pentest OWASP

**Despachar 3 pentesters paralelos** (Task tool subagent_type) com escopos disjuntos:

#### Pentest backend
- Escopo: `/api/auth/*`, `/api/admin/*`, validators Zod, middleware auth
- Validar:
  - JWT_SECRET é random ≥ 32 bytes (não placeholder)
  - `/auth/register` ignora `role: 'ADMIN'` no body (`.strict()` ativo)
  - `/auth/login` mensagem idêntica pra "user inexistente" e "senha errada" (anti-enumeration)
  - `/auth/forgot-password` NÃO retorna URL na response
  - `/auth/reset-password` invalida refresh tokens do user (`updateMany revokedAt`)
  - Refresh token com **reuse detection** (segunda chamada do mesmo token = invalida todos)
  - Bcrypt cost ≥ 10
  - `requireRole('ADMIN')` em todas rotas `/api/admin/*`
  - Rate limit em `/auth/*` (10 req/min)

#### Pentest frontend
- Escopo: cookies, CSP, XSS, exposição de dados sensíveis
- Validar:
  - Cookie `access_token`, `refresh_token` com `httpOnly`, `secure` (prod), `sameSite`
  - CSP em `next.config.mjs` com `connect-src` correto (Railway, Vercel, MP)
  - Sem `dangerouslySetInnerHTML` sem sanitize
  - Sem token em localStorage
  - Sem stack trace exposto em error pages prod
  - Console limpo (sem `console.log` de dados sensíveis)
  - Reset password URL não logada em prod

#### Pentest infra
- Escopo: env vars, Docker, Nginx, secrets, CI
- Validar:
  - `.env.example` sem secrets reais
  - `.env` no `.gitignore`
  - JWT_SECRET, MP_ACCESS_TOKEN, DATABASE_URL não em logs
  - HTTPS + HSTS em prod
  - CORS_ORIGIN explícito (não `*`)
  - Nginx `proxy_pass` com timeout adequado
  - Railway env vars verde (sem placeholders sugeridos do Railway, lição 10)

#### Critérios (gate 6.1)
- [ ] **0 críticos**
- [ ] **0 altos**
- [ ] Médios documentados em `30-LICOES/` ou aceitos com justificativa
- [ ] Relatório consolidado em `projetos/[slug]/messages/DE-qa_PARA-techlead_AAAA-MM-DD-pentest.md`

### Audit 2 — Mobile 27-pt

Reuso direto de [[../50-PADROES/MOBILE-FIRST]]. QA agent roda audit estático em **375px** + valida em mobile real ou DevTools.

#### Prompt template pro QA agent

```
Audita responsividade mobile em viewport 375px do projeto X.

Arquivos a inspecionar:
- frontend/src/app/page.tsx
- frontend/src/app/produtos/page.tsx
- frontend/src/app/produtos/[slug]/page.tsx
- frontend/src/app/carrinho/page.tsx
- frontend/src/app/checkout/page.tsx
- frontend/src/components/Header.tsx
- frontend/src/components/Footer.tsx
- (todos componentes de Page do App Router)

Pra cada arquivo, validar 27 pontos do MOBILE-FIRST:
- Layout: sidebar empilhada, botões empilhados, asides no fim mobile, modal sem swipe-close
- Tipografia: text > 2.5rem hero, sem break-words, inputs < 16px
- Interação: ícones sem label, hover-only sem touch fallback, cursor effects sem pointer:fine, 3D pesado mobile
- Tabelas: sem scroll horizontal, overflow sem indicador
- Formulários: sem padding bottom, validação silenciosa
- Animação: cursor effects, blur 110px low-end, sem prefers-reduced-motion

Reporta TODOS os bugs em formato:
- Severidade: Crítico / Alto / Médio / Baixo
- Arquivo + linhas exatas
- Descrição (1-2 linhas)
- Fix sugerido (1-2 linhas)

NÃO escreve código. Só reporta.
```

#### Critérios (gate 6.2)
- [ ] Audit rodado, output em `projetos/[slug]/messages/DE-qa_PARA-techlead_AAAA-MM-DD-mobile-27pt.md`
- [ ] **0 críticos**
- [ ] Top 5 altos atacados antes de deploy
- [ ] Validação visual em mobile real OU DevTools "Toggle device toolbar" 375px
- [ ] Print das telas críticas em mobile real

### Audit 3 — Bug-bash UX

Reuso de [[../10-PLAYBOOKS/bug-bash-ux]]. Smoke completo em loja + painel.

#### Checklist
- [ ] **HTML validity** (W3C validator OU Next.js dev console sem warnings)
- [ ] **Dead buttons** — botão sem `onClick`/`onSubmit`/`href` mapeados
- [ ] **Edge cases:**
  - Cart vazio
  - Loja sem produtos (catálogo)
  - User sem pedidos (`/account/pedidos`)
  - Lista de filtros vazia
  - Erro 404 (página inexistente)
  - Erro 500 (backend down — testar com Railway pausado)
- [ ] **Smoke test write em CADA CRUD admin:**
  - Produtos: criar, editar, deletar (com ConfirmDialog)
  - Pedidos: cancelar, marcar enviado
  - Cupons: criar, ativar/desativar
  - Categorias: criar, renomear
  - Usuários admin: convidar, remover
  - Pra cada: clicar salvar → ver toast verde → recarregar → confirmar persistência
- [ ] **Forms multi-tab** com erro em tab não-aberta → pula pra tab certa + banner topo
- [ ] **Delete sem ConfirmDialog** = bug
- [ ] **Mutation sem `onError`** = bug
- [ ] **Toast genérico "Dados inválidos"** sem detalhe = bug

#### Critérios (gate 6.3)
- [ ] Relatório em `projetos/[slug]/messages/DE-qa_PARA-techlead_AAAA-MM-DD-bug-bash.md`
- [ ] **0 críticos**
- [ ] Altos atacados ou aceitos com justificativa documentada

## ✅ Checklist consolidado de saída (Gate 6)

Reuso de [[GATES#Gate 6 — Audits 3 vetores]].

- [ ] Pentest 3 vetores verde
- [ ] Mobile 27-pt verde
- [ ] Bug-bash UX verde
- [ ] 3 relatórios em `projetos/[slug]/messages/`
- [ ] Tech-lead consolidou e marcou débitos pendentes

## 🤖 Como despachar audits em paralelo

```ts
// Tech-lead despacha 3 agents simultâneos via Task tool
Agent({ description: "Pentest backend",   subagent_type: "general-purpose", prompt: "..." })
Agent({ description: "Pentest frontend",  subagent_type: "general-purpose", prompt: "..." })
Agent({ description: "Pentest infra",     subagent_type: "general-purpose", prompt: "..." })

// E em outro batch:
Agent({ description: "Mobile 27-pt audit",   subagent_type: "general-purpose", prompt: "..." })
Agent({ description: "Bug-bash UX audit",    subagent_type: "general-purpose", prompt: "..." })
```

Cada agent retorna relatório. Tech-lead consolida. Fixers (backend/frontend skills) atacam top 5 críticos antes do deploy.

## 🚫 Anti-padrões (audit)

1. **QA tentando fixar** — QA reporta. Fixar é skill específica. Sem isso, QA acumula contexto e fica lerdo.
2. **Audit pulado pra "ganhar tempo"** — bug em prod custa 5x mais que bug no audit. Não vale.
3. **Audit sem print** — relatório em texto puro vira hand-wave. Print + linhas exatas = ataque rápido.
4. **Aceitar críticos com "depois conserto"** — débito técnico que vira incidente cliente. Atacar antes de deploy.

## Padrões reusáveis
- [[../10-PLAYBOOKS/security-audit]] — pentest OWASP detalhado
- [[../10-PLAYBOOKS/bug-bash-ux]] — bug-bash detalhado
- [[../50-PADROES/MOBILE-FIRST]] — 27 pontos
