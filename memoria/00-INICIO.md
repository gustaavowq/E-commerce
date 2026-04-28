# 🧠 Memória Operacional — E-Commerce Multi-Agent

> Aprendizado consolidado dos projetos **Miami Store** (lições 1-10) +
> **Kore Tech** (lições 11-20) + framework reusável pra qualquer
> próximo e-commerce.
>
> Última atualização: 2026-04-28 (pós Kore Tech).

## Como usar essa memória

Quando o cliente disser "vamos criar e-commerce de **[nicho]**", o Tech Lead:

1. Abre [[10-PLAYBOOKS/kickoff-novo-ecommerce]]
2. Faz **só as perguntas listadas como obrigatórias** (lista nele)
3. Toma decisões automáticas das [[20-DECISOES/stack|decisões pré-aprovadas]]
4. Adapta variações pelo template de nicho ([[70-NICHOS/INDEX|veja lista]])
5. Orquestra as 9 skills (`.claude/skills/ecommerce-*`) — ver `.claude/skills/ecommerce-tech-lead/SKILL.md`

**Não perguntar nada que esteja em [[20-DECISOES|decisões pré-aprovadas]].** Se mudar, o cliente fala explicitamente.

## Mapa rápido

| Pasta | Quando consultar |
|---|---|
| [[10-PLAYBOOKS]] | Sequências de execução prontas (kickoff, deploy, security, bugbash) |
| [[20-DECISOES]] | Stack, padrões de auth, deploy, env vars, estrutura de pastas |
| [[30-LICOES]] | Bugs e armadilhas que já enfrentamos (NÃO repetir) |
| `.claude/skills/ecommerce-*` | 9 skills (1 por agente) — auto-invocáveis pelo Claude Code |
| [[50-PADROES]] | Snippets de código prontos pra reusar |
| [[60-DEPLOY]] | Railway + Vercel passo-a-passo testado |
| [[70-NICHOS]] | Variações por vertical (moda, eletrônicos, etc) |

## Top 10 lições que NÃO podem ser esquecidas

### Critical security / boot (Miami)

1. **JWT_SECRET placeholder = porta aberta** — sempre `openssl rand -base64 48` ANTES de qualquer deploy. Ver [[30-LICOES/01-jwt-secret-placeholder]].
2. **Cookie cross-domain Cloudflare é bloqueado pela PSL** — domínio próprio resolve, tunnel de demo não. Ver [[30-LICOES/02-cookie-cross-domain]].
3. **`tsx` precisa estar em `dependencies`** (não devDeps) pra seed funcionar em prod Docker. Ver [[30-LICOES/03-tsx-dependencies]].
4. **Seed no startCommand sobrescreve edições do admin** — só pra primeiro deploy. Ver [[30-LICOES/04-seed-startcommand]].
5. **CSP bloqueia API se host não tá em `connect-src`** — Railway/Vercel/Cloudflare tem que estar lá. Ver [[30-LICOES/05-csp-connect-src]].

### Design / arquitetura (Kore Tech)

6. **Validar shape do backend ANTES de tipar frontend** — type ≠ prova. Curl o endpoint, paste no comentário acima do type. Ver [[30-LICOES/20-validar-shape-backend]].
7. **Backend Prisma com `include` retorna OBJETO**, não string — JSX `{product.category}` crasha React. Ver [[30-LICOES/11-backend-relations-objeto]].
8. **Repo dedicado por projeto > monorepo subpath** — auto-deploy Vercel/Railway funciona trivialmente. Ver [[30-LICOES/19-repo-dedicado-por-projeto]].
9. **Zustand persist é assíncrono — flag `hydrated` é obrigatória** se houver redirect baseado no estado. Ver [[30-LICOES/14-zustand-persist-race]] + [[50-PADROES/zustand-persist-pattern]].
10. **MercadoPago Pix tem 3 pré-requisitos** — env name + token PRODUCTION + chave Pix cadastrada na conta. Sem os 3, QR não gera. Ver [[30-LICOES/15-mercadopago-pix-pre-requisitos]].
11. **Bug visual = validar com olho antes de declarar fechado** — `truncate` em `<span>` ignora ellipsis silenciosamente; CSS tem armadilhas que o código parece certo. Ver [[50-PADROES/validar-visual-antes-de-fechar]] + [[30-LICOES/21-truncate-precisa-block]].

### Padrões aprovados pelo cliente (Kore Tech)

- **Animações respondem a ação** — sem cursor glow seguindo viewport, sem scroll-jacking, sem parallax forçado. Ver [[50-PADROES/motion-policies]].
- **Login redirect inteligente** — toda ação que exige login passa por `/auth/login?redirect=<path>`. Ver [[50-PADROES/login-redirect-pattern]].
- **Seed upsert real** — não `if (!existing)` ignorando trocas. Atualiza imagem/variation se diverge. Ver [[50-PADROES/seed-imagens-upsert]].
- **Validar visual antes de fechar fix de UI** — bug de overflow/truncate/animação/posicionamento exige olho em devtools/preview antes do "tá pronto". Não confiar em "o código parece certo". Ver [[50-PADROES/validar-visual-antes-de-fechar]].
- **Painel admin = visual + funcionalidades** — polish puro não impressiona; precisa Cmd+K palette + Smart Insights + DataTable sortable + period comparison. Ver [[50-PADROES/painel-admin-tier-1]] (checklist completo de painel tier-1).

## Stack canônica (não muda sem pedido explícito)

- **Backend:** Node 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16
- **Frontend (loja):** Next.js 14 (App Router) + Tailwind + Zustand + TanStack Query
- **Painel admin:** Next.js 14 + Recharts
- **Infra dev:** Docker Compose + Nginx (subdomain routing) + Cloudflare Quick Tunnel
- **Deploy prod:** Railway (backend + Postgres) + Vercel (loja + painel)
- **Pagamento:** MercadoPago (Pix focus)
- **Auth:** JWT em cookie httpOnly + refresh token rotation com reuse detection
- **Upload imagens:** Cloudinary

Stack pode mudar **apenas** se o cliente pedir explicitamente. Razões válidas: requisito legal, integração obrigatória, restrição de orçamento.

## Equipe de 9 agentes

| # | Agente | Você precisa do user pra... |
|---|---|---|
| 00 | Tech Lead | Nicho, marca, paleta, integrações específicas |
| 01 | Backend | Variações específicas do produto, regras fiscais do nicho |
| 02 | Designer | Mood/referências visuais, logo (ou aceita mockup) |
| 03 | Frontend | Copy específico do brand voice |
| 04 | Data Analyst | KPIs específicos do nicho |
| 05 | DevOps | Conta Railway/Vercel/Cloudinary/MercadoPago do cliente |
| 06 | QA | Cenários edge específicos do nicho |
| 07 | Copywriter | Tom específico em emails, glossário do nicho |
| 08 | Growth | Pixel ID, GA4 ID, conta Resend, calendário de campanhas |

Detalhes em `.claude/skills/ecommerce-*/SKILL.md`.

## Princípio fundamental

> "Decida sozinho com base nesta memória. Pergunte ao user **só** o que é específico do nicho/marca dele."

O Miami Store demorou ~50 mensagens com perguntas/respostas. O Kore Tech
fez ~30 com mais features (builder, personas, FPS estimado, animações
Apple/Linear-tier, MP Pix real). Próximo deve fazer em ~15-20.

## Convenções aprovadas (não mexer sem pedido explícito)

- **Tom de voz**: vibrar com vitórias (correções de bug, deploys
  verdes), não só reportar status frio. Ver
  `~/.claude/projects/.../memory/feedback_tom_comemorar_vitorias.md`
- **Animações sem invasivas**: motion responde a ação clara do user.
  Cursor glow sweep do viewport está banido. Ver [[50-PADROES/motion-policies]]
- **Repo dedicado por projeto**: cada e-commerce do framework vira um
  repo Git próprio (`gustaavowq/E-commerce-[slug]`). Estrutura plana
  `backend/`, `frontend/`, `dashboard/`, `infra/`. Ver
  [[30-LICOES/19-repo-dedicado-por-projeto]]
- **Shape do backend é fonte da verdade**: types do frontend são
  derivados, não declarados a olho. Ver [[30-LICOES/20-validar-shape-backend]]
