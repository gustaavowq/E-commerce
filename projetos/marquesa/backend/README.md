# Marquesa — Backend

API Express + Prisma + JWT pra a imobiliária boutique Marquesa. Sinal de reserva via MercadoPago, 7 dias de bloqueio do imóvel após pagamento aprovado.

## Stack

- Node 20 + Express 4 + TypeScript 5
- Prisma 5 + PostgreSQL 16
- bcryptjs (cost 10) + jsonwebtoken
- zod (validação) + helmet + cors + cookie-parser + express-rate-limit
- pino (log estruturado)
- mercadopago SDK Node

## Setup local

### 1) Instalar dependências

```powershell
cd projetos/marquesa/backend
npm install
```

### 2) Postgres rodando

Opção A — Docker:
```powershell
docker run -d --name marquesa-pg -p 5432:5432 -e POSTGRES_USER=marquesa -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=marquesa postgres:16-alpine
```

Opção B — Postgres nativo: criar database `marquesa` com user `marquesa`/`senha` (ou ajustar `DATABASE_URL`).

### 3) Configurar `.env`

```powershell
Copy-Item .env.example .env
```

Editar `.env` (mínimo: `DATABASE_URL` apontando pro seu Postgres).

### 4) Migrar schema + seed

```powershell
npx prisma migrate dev --name init
npm run prisma:seed
```

O seed cria:
- 1 admin (`admin@marquesa.dev`) — senha gerada randomicamente, printada no console
- 1 cliente (`cliente@marquesa.dev`) — idem
- Imóveis: lê `projetos/marquesa/assets/catalogo.json` (criado pelo Copywriter). Se não existir, popula 3 placeholders.

Pra reusar a mesma senha entre re-seeds, definir `SEED_ADMIN_PASSWORD` e `SEED_CLIENTE_PASSWORD` no `.env` (mín. 10 chars).

### 5) Subir o servidor

```powershell
npm run dev
```

Servidor em `http://localhost:8211`. Endpoint público pra teste:

```powershell
curl http://localhost:8211/api/imoveis
```

## Endpoints

### Público
| Método | Path | Descrição |
|---|---|---|
| GET | `/healthz` | Healthcheck (testa DB) |
| GET | `/api/imoveis` | Listagem paginada com filtros |
| GET | `/api/imoveis/:slug` | Detalhe |
| POST | `/api/leads` | Form de interesse |

### Auth
| Método | Path | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro (sempre cria USER) |
| POST | `/api/auth/login` | Login (retorna user.role pra frontend redirect) |
| POST | `/api/auth/logout` | Revoga refresh + limpa cookies |
| POST | `/api/auth/refresh` | Rotaciona refresh, devolve novo access |
| POST | `/api/auth/forgot-password` | Solicita reset (anti-enumeração) |
| POST | `/api/auth/reset-password` | Aplica nova senha via token |
| GET | `/api/auth/me` | User atual |

### Cliente autenticado
| Método | Path | Descrição |
|---|---|---|
| POST | `/api/reservas` | `{ imovelId }` → cria Reserva PENDENTE + Preference MP, devolve `mpInitPoint` |
| GET | `/api/reservas/me` | Lista as reservas do user |
| GET | `/api/reservas/:id` | Detalhe (dono ou staff) |

### Admin (requer ADMIN ou ANALYST)
| Método | Path | Descrição |
|---|---|---|
| GET | `/api/admin/imoveis` | Lista todos (sem filtro de status default) |
| GET | `/api/admin/imoveis/:id` | Detalhe + reservas + leads |
| POST | `/api/admin/imoveis` | Criar (ADMIN) |
| PATCH | `/api/admin/imoveis/:id` | Editar (ADMIN) |
| DELETE | `/api/admin/imoveis/:id` | Soft delete → INATIVO (ADMIN) |
| GET | `/api/admin/reservas` | Lista (com filtros) |
| GET | `/api/admin/reservas/:id` | Detalhe |
| PATCH | `/api/admin/reservas/:id` | Cancelar / converter / estender prazo (ADMIN) |
| GET | `/api/admin/clientes` | Lista clientes (USER) |
| GET | `/api/admin/clientes/:id` | Detalhe + reservas + leads |
| GET | `/api/admin/dashboard/kpis` | KPIs gerais |
| GET | `/api/admin/dashboard/series?metric=reservas&days=30` | Série temporal |

### Webhook
| Método | Path | Descrição |
|---|---|---|
| POST | `/api/webhooks/mercadopago` | Notificação de pagamento (idempotente, valida HMAC) |

## Regras de negócio

1. **Reserva só vira ATIVA + imóvel só vira RESERVADO depois do webhook MP confirmar `APROVADO`**.
2. **Apenas 1 reserva ATIVA por imóvel.** Tentativa em imóvel reservado retorna 409.
3. **`expiraEm` = `paidAt` + `RESERVA_DURACAO_DIAS` (default 7)**. Job interno (`setInterval` de 1h) marca expiradas e libera o imóvel se não houver outra ativa.
4. **Sinal default = `SINAL_DEFAULT_PERCENT`% do preço** (configurável via `precoSinal` por imóvel).
5. **Webhook idempotente** via `webhookEventId` UNIQUE.
6. **Senha bcrypt cost 10.**
7. **JWT 15min access + 7d refresh.** Cookies `httpOnly`, `secure` em prod, `sameSite: lax` por padrão.
8. **CORS strict:** lê `CORS_ORIGIN` (vírgulas separam várias origens).
9. **Rate limit:** 100 req/min global + 5/min em `/api/auth/login` e `/api/auth/register`.

## Schema Prisma — entidades

- **User** (id, email, passwordHash, name, phone, role: `USER|ADMIN|ANALYST`)
- **Imovel** (slug, titulo, descricao, tipo, status: `DISPONIVEL|RESERVADO|EM_NEGOCIACAO|VENDIDO|INATIVO`, preco, precoSinal, área, quartos, etc, fotos[], amenidades[])
- **Reserva** (status: `ATIVA|EXPIRADA|CANCELADA|CONVERTIDA`, pagamentoStatus: `PENDENTE|APROVADO|REJEITADO|CANCELADO|REEMBOLSADO`, mpPaymentId, valorSinal, paidAt, expiraEm)
- **Lead** (formulário de interesse, opcionalmente vinculado a userId)
- **RefreshToken / PasswordResetToken** (rotação de sessão + reset)
- **SiteSettings** (singleton id="default")

## Variáveis de ambiente (mínimas)

| Var | Default | Obrigatório? |
|---|---|---|
| `DATABASE_URL` | — | sim |
| `PORT` | 8211 | não |
| `NODE_ENV` | development | não |
| `JWT_SECRET` | dev_only_... | sim em prod (32+ chars, NÃO o default) |
| `JWT_REFRESH_SECRET` | dev_only_... | sim em prod (idem) |
| `CORS_ORIGIN` | http://localhost:3000 | sim em prod |
| `MERCADOPAGO_ACCESS_TOKEN` | vazio | só pra MP real (vazio = mock em dev) |
| `MERCADOPAGO_WEBHOOK_SECRET` | vazio | só pra prod (valida HMAC) |
| `SINAL_DEFAULT_PERCENT` | 2 | não |
| `RESERVA_DURACAO_DIAS` | 7 | não |
| `SEED_ADMIN_PASSWORD` | gerada se vazio | não |
| `SEED_CLIENTE_PASSWORD` | gerada se vazio | não |

Veja `.env.example` pra lista completa.

## Modo mock do MercadoPago

Em dev, sem `MERCADOPAGO_ACCESS_TOKEN`, o serviço retorna preferência fake apontando pra `${PUBLIC_WEB_URL}/reservas/:id/pagar?mock=1` — facilita testar fluxo sem token real. Em prod, valida e dá erro fatal se ausente.

## Dockerfile

Multi-stage, USER non-root, expõe 8211. DevOps usa pra montar `gustavo-marquesa-api`.

## Scripts

```
npm run dev               # tsx watch
npm run build             # tsc → dist/
npm run start             # node dist/index.js (prod)
npm run typecheck         # tsc --noEmit
npm run prisma:migrate:dev    # migrate dev
npm run prisma:migrate:deploy # migrate em prod
npm run prisma:seed       # seed
npm run prisma:studio     # GUI do schema
```

## Próximos passos

- [ ] Frontend consome `/api/imoveis` + auth + cria reserva via initPoint MP
- [ ] DevOps configura `gustavo-marquesa-api` no compose VPS
- [ ] QA: smoke E2E (login → catálogo → PDP → POST /reservas → mock MP)
- [ ] Integrar serviço de email (Resend) pro `/auth/forgot-password` (TODO marcado no código)
