# 🐊 Miami Store — Plataforma de E-Commerce

Plataforma de e-commerce da **Miami Store** — loja revendedora de produtos originais (Lacoste, Nike, Adidas, Tommy etc.) construída por um time de **7 agentes Claude Senior**.

> 📚 Documentos importantes pra ler antes de mexer:
> - **[CLAUDE.md](./CLAUDE.md)** — entry point dos agentes
> - **[docs/project-structure.md](./docs/project-structure.md)** — REGRA DE OURO da organização de pastas (não viole)
> - **[docs/brand-brief.md](./docs/brand-brief.md)** — identidade da marca Miami Store
> - **[docs/architecture.md](./docs/architecture.md)** — decisões técnicas
> - **[docs/design/design-system.md](./docs/design/design-system.md)** — tokens visuais
> - **[shared/messages/](./shared/messages/)** — comunicação entre agentes (kickoff, bugs, sinais)

---

## ⚡ Quick Start (Docker)

### Pré-requisitos
- **Docker Desktop** rodando (Windows/Mac/Linux)
- **Git**
- 4 GB de RAM livre
- Porta `80`, `3001` e `5432` livres

### 1. Clone e configure
```bash
git clone <url-do-repo> miami-store
cd miami-store
cp .env.example .env
# (opcional) edite o .env com seus valores
```

### 2. Suba o ambiente
```bash
cd src/infra
docker compose up -d
```

A primeira vez demora ~3 min (baixa imagens, builda backend, instala deps).

### 3. Verifique
```bash
# Healthcheck do backend (via Nginx, porta 80)
curl http://localhost/healthz

# Resposta esperada:
# {"success":true,"data":{"status":"ok","service":"miami-backend",...}}
```

### 4. Acessar diretamente o banco
```bash
# Via psql dentro do container
docker exec -it miami-postgres psql -U postgres -d miami_store

# Ou via Prisma Studio (interface web)
docker exec -it miami-backend npx prisma studio
# Abre em http://localhost:5555
```

---

## 🛠️ Comandos úteis

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Sobe tudo em background |
| `docker compose down` | Para tudo (mantém dados do banco) |
| `docker compose down -v` | Para tudo **e apaga o banco** ⚠️ |
| `docker compose logs -f backend` | Acompanha logs do backend |
| `docker compose restart backend` | Reinicia só o backend |
| `docker exec -it miami-backend sh` | Shell dentro do container do backend |
| `docker exec -it miami-backend npx prisma migrate dev` | Cria nova migration |
| `docker exec -it miami-backend npx prisma db seed` | Popula com seed (admin + marcas) |
| `docker exec -it miami-backend npm test` | Roda testes do backend |

Todos os comandos `docker compose` precisam ser rodados **de dentro de `src/infra/`**.

---

## 📁 Estrutura de pastas

Veja **[CLAUDE.md](./CLAUDE.md)** pra mapa completo. Resumo:

```
ecommerce-agents/
├── .claude/skills/   9 skills do Claude Code (1 por agente: ecommerce-tech-lead, ecommerce-backend, ...)
├── memoria/          knowledge base (decisões, lições, playbooks, padrões, nichos)
├── projetos/         documentação por cliente (miami-store é o 1º)
├── outros/           shared/messages (canal entre agentes), docs técnicas, scripts
└── src/              código que vai pra produção
    ├── backend/      Express + Prisma + JWT
    ├── frontend/     Next.js loja
    ├── dashboard/    Next.js painel admin
    └── infra/        Docker compose + Nginx
```

---

## 🌍 Endpoints expostos em dev

Com `docker compose up`, o Nginx expõe na porta `80`:

| Rota | Backend | Status no Sprint 1 |
|---|---|---|
| `http://localhost/` | mensagem placeholder | ✅ ativo |
| `http://localhost/healthz` | `backend:3001/healthz` | ✅ ativo |
| `http://localhost/api/*` | `backend:3001/*` | ✅ ativo (rotas serão criadas pelo Backend) |
| `http://localhost/admin/*` | `dashboard:3002` | 🚧 desabilitado (próximo sprint) |
| Assets / loja `/` | `frontend:3000` | 🚧 desabilitado (próximo sprint) |

Backend também é exposto direto em `http://localhost:3001` (apenas dev, pra debug).

---

## 🔐 Variáveis de ambiente

Veja `.env.example` pra lista completa. As mais críticas:

| Var | Para quê |
|---|---|
| `DATABASE_URL` | Conexão Prisma → Postgres |
| `JWT_SECRET` | Assinatura dos tokens (use `openssl rand -base64 48`) |
| `MERCADOPAGO_TOKEN` | Token de acesso (TEST-* em dev) |
| `MERCADOPAGO_PUBLIC_KEY` | Chave pública (frontend) |
| `CORS_ORIGIN` | Origins permitidos no CORS (separados por vírgula) |
| `WHATSAPP_NUMBER` | Número usado no botão flutuante da loja |
| `SHIPPING_ORIGIN_CEP` | CEP de origem pra cálculo de frete |

---

## 🧪 Testes

```bash
# Backend (Vitest)
docker exec -it miami-backend npm test

# E2E (Playwright — quando o frontend existir)
cd src/e2e && npx playwright test
```

---

## 🆘 Problemas comuns

**"port 80 is already allocated"** → Outro app (IIS, Skype antigo) tá segurando a porta. Pare-o ou mude no `docker-compose.yml`.

**Backend reiniciando em loop** → Olhe `docker compose logs backend`. Geralmente é `DATABASE_URL` errada ou Postgres ainda subindo (espera 30s e reverifica).

**Prisma migration falhou** → `docker exec -it miami-backend npx prisma migrate reset` (apaga o banco e recria do zero).

**Mudei o `schema.prisma` e nada muda** → Roda `docker exec -it miami-backend npx prisma migrate dev --name minha_mudanca`.
