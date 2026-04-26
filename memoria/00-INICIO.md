# 🧠 Memória Operacional — E-Commerce Multi-Agent

> Aprendizado consolidado do projeto **Miami Store** + framework reusável pra qualquer próximo e-commerce.

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

## Top 5 lições que NÃO podem ser esquecidas

1. **JWT_SECRET placeholder = porta aberta** — sempre `openssl rand -base64 48` ANTES de qualquer deploy. Ver [[30-LICOES/01-jwt-secret-placeholder]].
2. **Cookie cross-domain Cloudflare é bloqueado pela PSL** — domínio próprio resolve, tunnel de demo não. Ver [[30-LICOES/02-cookie-cross-domain]].
3. **`tsx` precisa estar em `dependencies`** (não devDeps) pra seed funcionar em prod Docker. Ver [[30-LICOES/03-tsx-dependencies]].
4. **Seed no startCommand sobrescreve edições do admin** — só pra primeiro deploy. Ver [[30-LICOES/04-seed-startcommand]].
5. **CSP bloqueia API se host não tá em `connect-src`** — Railway/Vercel/Cloudflare tem que estar lá. Ver [[30-LICOES/05-csp-connect-src]].

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

O Miami Store demorou ~50 mensagens com perguntas/respostas. O próximo deve fazer em ~15.
