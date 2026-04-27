# Kore Tech — E-commerce de hardware/PC

> Demo fictícia funcional do framework. Backend (Express + Prisma) + Frontend (Next.js loja) + Dashboard (Next.js admin) + Nginx + Postgres, tudo em Docker Compose.

## Stack

- **Backend:** Node 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16
- **Frontend / Dashboard:** Next.js 14 App Router + Tailwind + Zustand + TanStack Query
- **Infra dev:** Docker Compose + Nginx (subdomínio `.test`)
- **Pagamento:** MercadoPago (Pix focus) — placeholder na demo
- **Imagens:** Cloudinary — placeholder na demo
- **Email:** Resend — placeholder na demo

## Pré-requisitos no host

- **Docker Desktop** (Windows / macOS / Linux) com WSL2 habilitado no Windows
- **Node 20+** (só pra rodar `npx prisma`/scripts fora do container, opcional)
- **OpenSSL** (Git Bash já vem com) — pra gerar `JWT_SECRET`
- **PowerShell admin** (Windows) ou `sudo` (macOS/Linux) — pra editar hosts file uma vez

## Setup em 8 passos (qualquer PC novo)

### 1. Clonar o repo (se ainda não)
```bash
git clone <repo-url>
cd ecommerce-agents/src/projeto-tech/kore-tech
```

### 2. Copiar o `.env`
```bash
cp .env.example .env
```

### 3. Editar valores reais
Abre `.env` e troca pelo menos:

```env
JWT_SECRET=<resultado_de_openssl_rand_-base64_48>
SEED_ADMIN_PASSWORD=<senha_forte_de_pelo_menos_10_chars_com_simbolo>
```

Comando pra gerar JWT:
```bash
openssl rand -base64 48
```

> ⚠️ **Lição #01 do Miami:** placeholder de JWT = qualquer um forja token de admin. Trocar SEMPRE.
> ⚠️ **Lição #06 do Miami:** **NÃO** crie `infra/.env`. O `.env` mora **só na raiz do projeto** (este diretório). Se aparecer um `.env` em `infra/`, apaga.

### 4. (Opcional) Editar hosts file pra subdomínios `.test`

**Windows** (PowerShell admin):
```powershell
Add-Content -Path "$env:WINDIR\System32\drivers\etc\hosts" -Value "127.0.0.1 loja.kore.test admin.kore.test api.kore.test"
```

**macOS/Linux:**
```bash
echo "127.0.0.1 loja.kore.test admin.kore.test api.kore.test" | sudo tee -a /etc/hosts
```

Ou usa o script automatizado (Windows): `outros/scripts/setup-kore-tech.ps1` (auto-eleva).

> Sem editar hosts file, ainda dá pra usar a loja em `http://localhost:3001`, mas roteamento por subdomínio só funciona com hosts ajustado.

### 5. Subir os containers
```bash
cd infra
docker compose up -d
```

Primeira vez demora ~3-5 min (build das imagens + npm install + prisma generate).

Acompanhar:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f dashboard
```

### 6. Aplicar migrations e popular o banco
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

> ⚠️ **Lição #04 do Miami:** o seed roda **manualmente uma única vez** (não no boot). Roda de novo só se quiser re-popular do zero — apaga edições do admin.

### 7. Acessar

Com hosts file editado:
- Loja:    http://loja.kore.test:8081
- Admin:   http://admin.kore.test:8081
- API:     http://api.kore.test:8081

Sem hosts file (debug direto):
- Loja:    http://localhost:3001
- Admin:   http://localhost:3002
- API:     http://localhost:4001

### 8. Login admin
- Email:  o que estiver em `SEED_ADMIN_EMAIL` (default `admin@kore.tech`)
- Senha:  o que estiver em `SEED_ADMIN_PASSWORD`

## Portas reservadas (NÃO conflita com Miami)

| Serviço    | Porta host | Porta container | Por quê |
|---|---|---|---|
| postgres   | 5433       | 5432            | Miami já usa 5432 |
| backend    | 4001       | 4001            | API Express |
| frontend   | 3001       | 3001            | Loja Next.js (`next dev -p 3001`) |
| dashboard  | 3002       | 3002            | Painel Next.js (`next dev -p 3002`) |
| nginx      | 8081       | 80              | Reverse proxy (subdomínios `.test`) |

Pra rodar Miami e Kore Tech ao mesmo tempo: dois `docker compose` independentes em pastas diferentes, networks separadas (`miami-net` vs `kore-tech-net`).

## Comandos comuns

```bash
cd src/projeto-tech/kore-tech/infra

# Subir / parar
docker compose up -d
docker compose down                 # mantém volume postgres
docker compose down -v              # APAGA o banco (cuidado)

# Logs
docker compose logs -f              # tudo
docker compose logs -f backend      # só um service

# Restart
docker compose restart backend
docker compose up -d --force-recreate backend  # rebuild env vars

# Shell
docker compose exec backend bash
docker compose exec postgres psql -U kore -d kore_tech

# Prisma
docker compose exec backend npx prisma studio    # UI no localhost:5555
docker compose exec backend npx prisma migrate dev --name <nome>
docker compose exec backend npx prisma db seed
```

## Estrutura de pastas

```
src/projeto-tech/kore-tech/
├── README.md                  ← este arquivo
├── .env.example               ← template (commitado)
├── .env                       ← real (gitignored)
├── .gitignore
│
├── backend/                   ← Express + Prisma
│   ├── Dockerfile             ← prod (multi-stage)
│   ├── Dockerfile.dev         ← dev (hot reload via tsx watch)
│   ├── railway.json           ← config Railway (placeholder)
│   ├── package.json
│   └── ...
│
├── frontend/                  ← Next.js loja
│   ├── Dockerfile.dev
│   ├── vercel.json            ← placeholder
│   └── ...
│
├── dashboard/                 ← Next.js painel admin
│   ├── Dockerfile.dev
│   ├── vercel.json            ← placeholder
│   └── ...
│
└── infra/
    ├── docker-compose.yml
    └── nginx/conf.d/default.conf
```

## Deploy real

Demo fictícia: **não tem deploy ativo**. Configs prontas em:

- `backend/railway.json` — Railway builder DOCKERFILE, healthcheck `/healthz`, sem seed em start (lição #04)
- `frontend/vercel.json` e `dashboard/vercel.json` — placeholders Vercel

Quando for deploy real:
1. Backend: ler `memoria/60-DEPLOY/railway-passo-a-passo.md`
2. Frontends: ler `memoria/60-DEPLOY/vercel-passo-a-passo.md`
3. Variáveis de ambiente reais (não placeholders): `JWT_SECRET`, `MP_ACCESS_TOKEN`, `CLOUDINARY_URL`, `RESEND_API_KEY`, `CORS_ORIGIN` com hosts reais, `COOKIE_DOMAIN=.kore.tech`
4. **NÃO clicar "Suggested Variables" no Railway** (lição #10).

## Troubleshooting

**`port already in use 5433` (ou 4001/3001/3002/8081)** — tem outro processo na porta. Para o Miami se estiver rodando (`cd src/infra && docker compose down`), ou troca a porta no `.env` (`DB_PORT=5434` etc).

**`prisma migrate deploy` falhando com "database does not exist"** — postgres ainda não terminou de subir. Aguarda `docker compose ps` mostrar healthy, ou `docker compose logs postgres` até "ready to accept connections".

**Hot reload não funciona** — confirma `WATCHPACK_POLLING=true` no compose (já está). Em Windows/WSL, polling resolve. Em Linux nativo, opcional.

**Backend crasha em loop** — geralmente é variável faltando. `docker compose exec backend env | grep JWT` deve mostrar valor real (não vazio). Se vazio, há um `.env` perdido em `infra/` sobrescrevendo (lição #06) — apaga.

**Login retorna 401 com credencial certa** — provável cookie domain errado. Em dev, `COOKIE_DOMAIN` deve ficar **vazio** no `.env`.

**CSP bloqueando chamada à API** — atualizar `connect-src` em `frontend/next.config.mjs` e `dashboard/next.config.mjs` (lição #05).

## Ver também

- Brief deste sprint: `outros/shared/messages/DE-techlead_PARA-todos_2026-04-26-brief-kore-tech.md`
- Pesquisa do nicho: `projetos/projeto-tech/kore-tech/PESQUISA-NICHO.md`
- Lições aprendidas: `memoria/30-LICOES/INDEX.md`
- Decisões pré-aprovadas: `memoria/20-DECISOES/`
