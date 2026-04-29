# Decisão: Stack tecnológica

> **Não perguntar ao user.** Mudar só se ele pedir explicitamente com motivo claro.

## Camada por camada

### Backend (`projetos/miami-store/backend/`)

| Item | Versão | Por quê |
|---|---|---|
| Node.js | 20 (LTS) | Versão LTS atual, suporte longo |
| TypeScript | 5.x | Type safety obrigatório, vale o overhead |
| Express | 4.x | Mais maduro que Fastify pra equipe nova; Hono é overkill |
| Prisma | 5.22+ | Schema-first, migrations automáticas, client tipado |
| PostgreSQL | 16 alpine | Padrão do Railway, suporte a JSON e arrays |
| bcryptjs | 2.4 | Funciona em qualquer container (vs `bcrypt` que precisa build C++) |
| jsonwebtoken | 9.x | Padrão da indústria |
| zod | 3.x | Validação runtime + types compartilhados |
| express-rate-limit | 7.x | Anti brute-force |
| helmet | 8.x | Headers segurança out-of-the-box |
| cookie-parser | 1.x | httpOnly cookies |
| pino + pino-pretty | 9.x | Log estruturado, leve |

### Frontend loja (`projetos/miami-store/frontend/`) e Painel (`projetos/miami-store/dashboard/`)

| Item | Versão | Por quê |
|---|---|---|
| Next.js | 14.2.x | App Router maduro, ISR, RSC. **NÃO subir pra 15** sem teste — breaking changes em headers/CSP |
| React | 18.x | (vem com Next 14) |
| Tailwind CSS | 3.4 | Design system rápido, responsivo |
| Zustand | 4.x | State client simples (auth, cart, wishlist) com persist |
| TanStack Query | 5.x | Server state com cache, retry, refetch |
| react-hook-form + zod | 7.x | Forms tipados, validação compartilhada com backend |
| lucide-react | latest | Ícones SVG inline, tree-shakeable |
| Recharts | 2.x | Charts no painel (LineChart, BarChart, PieChart) |

### Infra dev

| Item | Por quê |
|---|---|
| Docker Compose | 1 comando sobe tudo (postgres + backend + frontend + dashboard + nginx) |
| Nginx alpine | Roteamento por subdomínio (api.loja.test, admin.loja.test, loja.test) |
| Cloudflare Quick Tunnel | URL pública grátis pra demo (sem domínio próprio) |

### Deploy prod

| Componente | Onde | Por quê |
|---|---|---|
| Backend + Postgres | Railway | Free tier US$5/mês crédito, deploy Docker direto, Postgres incluso |
| Loja + Painel | Vercel | Free tier infinito pra projetos pessoais, edge global, build Next otimizado |
| Imagens | Cloudinary | Free tier 25k uploads/mês, otimização automática auto-format/quality |
| Email transacional | Resend | Free 3k emails/mês, integração simples |
| Pagamento | MercadoPago | Pix nativo, webhook estável, mercado BR |

## Stack que NUNCA usar (sem motivo forte)

- **Sequelize/TypeORM** em vez de Prisma → Prisma é mais ergonômico hoje
- **MongoDB** → produto e-commerce tem relações fortes, SQL ganha
- **AWS S3 puro** pra imagem → Cloudinary já dá CDN+otimização
- **Nginx custom em prod** → Vercel/Railway já fazem TLS+CDN
- **Webpack manual** → `next dev` resolve tudo
- **Redux** → Zustand cobre 99% dos casos com 1/10 do boilerplate

## Estrutura de pastas (ver também [[estrutura-pastas]])

```
projeto/
├── CLAUDE.md
├── README.md
├── DEPLOY.md
├── .env.example
├── .gitignore
│
├── .claude/skills/         ← 9 skills do Claude Code (ecommerce-tech-lead, ecommerce-backend, ...)
│
├── memoria/                ← essa memória
│
├── projetos/               ← docs por cliente (miami-store é o 1º)
│
├── projetos/[slug]/messages/ ← canal de comunicação entre agentes
│
└── src/
    ├── backend/             ← Express + Prisma
    ├── frontend/            ← Next.js loja
    ├── dashboard/           ← Next.js painel admin
    └── infra/               ← docker-compose + nginx config
```
