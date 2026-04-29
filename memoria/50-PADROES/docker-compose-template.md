# Template `docker-compose.yml` (dev)

> Padrão extraído do Miami Store em produção. Quem usa: **05-devops** no Sprint 1, fase de setup.

## Princípios

- **5 serviços:** `postgres`, `backend`, `nginx`, `frontend`, `dashboard`
- **Hot reload** em todos os Node services (volume mount + `node_modules` anônimo)
- **`.env` único na raiz** importado por todos os serviços (`env_file: ../../.env`) — ver [06-env-files-multiplos](../30-LICOES/06-env-files-multiplos.md)
- **Network bridge interna** (`{slug}-net`) — serviços se chamam pelo nome (`backend`, `postgres`)
- **Healthcheck no postgres** — backend só sobe quando DB tá pronto
- **Subdomínios `.test`** via Nginx (RFC 6761) — não conflita com nada real

## Antes de copiar

1. Substituir `{{slug}}` (kebab-case do nome da marca, ex: `miami-store`)
2. Substituir `{{slug_db}}` (snake_case pro nome do DB, ex: `miami_store`)
3. Caminho do `.env` é relativo a `projetos/miami-store/infra/` (onde fica o compose) — `../../.env`

## Template

```yaml
# =============================================================================
# {{slug}} — Ambiente de Desenvolvimento
# Mantido pelo DevOps (Agente 05).
#
# Como rodar:
#   1. Na raiz do repo, copie .env.example -> .env e ajuste valores
#   2. cd projetos/miami-store/infra
#   3. docker compose up
#
# Subdomínios .test (precisa editar hosts file uma vez):
#   127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test
# =============================================================================

name: {{slug}}

x-env: &env-default
  env_file:
    - ../../.env

services:
  # ---------------------------------------------------------------------------
  # PostgreSQL 16
  # ---------------------------------------------------------------------------
  postgres:
    <<: *env-default
    image: postgres:16-alpine
    container_name: {{slug}}-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-{{slug_db}}}
      LANG: pt_BR.UTF-8
      TZ: America/Sao_Paulo
    ports:
      - "${DB_PORT:-5432}:5432"   # exposto SÓ em dev (DBeaver/TablePlus)
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-{{slug_db}}}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - {{slug}}-net

  # ---------------------------------------------------------------------------
  # Backend (Express + Prisma)
  # ---------------------------------------------------------------------------
  backend:
    <<: *env-default
    build:
      context: ../backend
      dockerfile: Dockerfile.dev
    container_name: {{slug}}-backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: "postgresql://${DB_USER:-postgres}:${DB_PASSWORD:-postgres}@postgres:5432/${DB_NAME:-{{slug_db}}}?schema=public"
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
      MERCADOPAGO_TOKEN: ${MERCADOPAGO_TOKEN}
      MERCADOPAGO_PUBLIC_KEY: ${MERCADOPAGO_PUBLIC_KEY}
      TZ: America/Sao_Paulo
    volumes:
      - ../backend:/app
      - /app/node_modules     # volume anônimo: protege node_modules do container
    expose:
      - "3001"
    ports:
      - "${BACKEND_PORT:-3001}:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - {{slug}}-net

  # ---------------------------------------------------------------------------
  # Nginx (reverse proxy — subdomínios)
  # ---------------------------------------------------------------------------
  nginx:
    image: nginx:1.27-alpine
    container_name: {{slug}}-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - backend
    networks:
      - {{slug}}-net

  # ---------------------------------------------------------------------------
  # Frontend (Next.js — loja)
  # ---------------------------------------------------------------------------
  frontend:
    <<: *env-default
    build:
      context: ../frontend
      dockerfile: Dockerfile.dev
    container_name: {{slug}}-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      INTERNAL_API_URL: http://backend:3001        # SSR/RSC: rede interna
      NEXT_PUBLIC_API_URL: http://api.{{slug}}.test # browser: via nginx
      NEXT_PUBLIC_DASHBOARD_URL: http://admin.{{slug}}.test
      NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: ${MERCADOPAGO_PUBLIC_KEY}
      NEXT_PUBLIC_WHATSAPP_NUMBER: ${WHATSAPP_NUMBER:-5511999999999}
      WATCHPACK_POLLING: 'true'                    # hot reload em Windows/WSL
    volumes:
      - ../frontend:/app
      - /app/node_modules
      - /app/.next
    expose:
      - "3000"
    ports:
      - "${FRONTEND_PORT:-3000}:3000"
    depends_on:
      - backend
    networks:
      - {{slug}}-net

  # ---------------------------------------------------------------------------
  # Dashboard (Next.js — painel admin)
  # ---------------------------------------------------------------------------
  dashboard:
    <<: *env-default
    build:
      context: ../dashboard
      dockerfile: Dockerfile.dev
    container_name: {{slug}}-dashboard
    restart: unless-stopped
    environment:
      NODE_ENV: development
      INTERNAL_API_URL: http://backend:3001
      NEXT_PUBLIC_API_URL: http://api.{{slug}}.test
      NEXT_PUBLIC_STORE_URL: http://{{slug}}.test
      WATCHPACK_POLLING: 'true'
    volumes:
      - ../dashboard:/app
      - /app/node_modules
      - /app/.next
    expose:
      - "3002"
    ports:
      - "${DASHBOARD_PORT:-3002}:3002"
    depends_on:
      - backend
    networks:
      - {{slug}}-net

volumes:
  postgres_data:
    driver: local

networks:
  {{slug}}-net:
    driver: bridge
```

## Decisões importantes (não mudar sem motivo)

### Por que `env_file` na raiz, não em `projetos/miami-store/infra/`?

`.env` único na raiz pra evitar duplicação entre dev/prod e entre services. Caminho relativo `../../.env` funciona porque compose roda de `projetos/miami-store/infra/`. Se rodar de outro lugar, **quebra** — sempre `cd projetos/miami-store/infra && docker compose up`.

Detalhes da armadilha em [06-env-files-multiplos](../30-LICOES/06-env-files-multiplos.md).

### Por que volume anônimo `/app/node_modules`?

Sem isso, o volume `../backend:/app` sobrescreve `/app/node_modules` do container. Volume anônimo "protege" — é criado vazio na primeira run e o container popula com `npm install` do build.

Resultado: `node_modules` do host (talvez de outro OS) **não vaza** pro container.

### Por que `WATCHPACK_POLLING=true`?

Inotify do Linux não funciona dentro de container Windows/WSL pra detectar mudança de arquivo via volume mount. Polling resolve, custo de CPU mínimo em dev.

### Por que `condition: service_healthy` no backend?

Backend abre conexão Prisma no boot. Se Postgres ainda não terminou de subir, backend crasha em loop. Healthcheck garante ordem.

### Por que cada service expõe sua porta no host?

- Acesso primário: via Nginx em `http://{{slug}}.test`
- Porta direta (3000, 3001, 3002): pra debug — `prisma studio`, curl, devtools

Em **prod nada disso é exposto** — Nginx (ou Cloudflare/Vercel/Railway) é a única porta de entrada.

## Pré-requisitos no host

### Hosts file (uma vez)

**Windows** (PowerShell admin):
```powershell
Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test"
```

**Linux/macOS:**
```bash
echo "127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test" | sudo tee -a /etc/hosts
```

Script automatizado em `outros/scripts/setup-hosts.ps1` (Miami Store).

### `.env` na raiz

Copia `.env.example` → `.env` → preenche valores. **Crítico:** `JWT_SECRET` gerado com `openssl rand -base64 48`, nunca placeholder.

## Comandos comuns

```bash
cd projetos/miami-store/infra

docker compose up                 # foreground (Ctrl+C pra parar)
docker compose up -d              # daemon (background)
docker compose logs -f backend    # tail logs de um service
docker compose down               # para tudo (preserva volume postgres_data)
docker compose down -v            # para tudo + APAGA o banco (cuidado)
docker compose restart backend    # reinicia 1 service
docker compose exec backend bash  # shell dentro do container backend
docker compose exec postgres psql -U postgres -d {{slug_db}}  # psql direto
```

## Quando NÃO usar este template

- **Prod:** este template é dev-only. Prod usa Railway (backend) + Vercel (Next.js) — ver [railway-passo-a-passo](../60-DEPLOY/railway-passo-a-passo.md) e [vercel-passo-a-passo](../60-DEPLOY/vercel-passo-a-passo.md).
- **CI:** GitHub Actions roda direto, sem compose. Compose é pra dev local.

## Ver também

- [nginx-config](nginx-config.md) — config do Nginx que entra em `projetos/miami-store/infra/nginx/conf.d/default.conf`
- [estrutura-pastas](../20-DECISOES/estrutura-pastas.md) — onde cada arquivo mora
- [06-env-files-multiplos](../30-LICOES/06-env-files-multiplos.md) — armadilha do `.env`
