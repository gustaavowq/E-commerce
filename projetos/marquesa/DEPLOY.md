# Deploy Marquesa — VPS Ever Growth

> Imobiliária boutique. Rodando em `marquesa.gustavo.agenciaever.cloud` na VPS do Jean (`/opt/gustavo/marquesa/`).

## Pré-requisitos

1. **DNS A** criado pelo Jean: `marquesa.gustavo.agenciaever.cloud` → `187.127.17.153` (TTL 300s).
   Pedir: _"Jean, cria DNS A `marquesa.gustavo.agenciaever.cloud` → 187.127.17.153"_.
2. **Conta MercadoPago** com chave Pix cadastrada e token de **PRODUCTION** em mãos.
3. Acesso SSH à VPS: `ssh gustavo@187.127.17.153`.

## Setup local (dev)

Para rodar tudo localmente (Postgres em container + API/web local com hot reload):

```bash
cd projetos/marquesa/infra
docker compose up -d                      # sobe Postgres em localhost:5433

cd ../backend
cp .env.example .env                       # ajusta DATABASE_URL pra ...localhost:5433...
npm install
npx prisma migrate dev --name init         # 1ª vez
npx prisma db seed                         # popula 20+ imóveis
npm run dev                                # API em :8211

# em outro terminal:
cd ../frontend
cp .env.example .env.local
npm install
npm run dev                                # site em :3000
```

Acessar `http://localhost:3000`. Login admin: ver console do `db seed` (senha gerada na 1ª execução).

## Deploy produção (VPS)

### 1. Preparar arquivos locais

```bash
# Na sua máquina, antes de pushar:
cd projetos/marquesa
# Confere que NÃO há .env, .env.production, .env.local commitado.
git status
```

### 2. Subir código pra VPS

```bash
ssh gustavo@187.127.17.153
mkdir -p /opt/gustavo
cd /opt/gustavo

# 1ª vez: clone do repo
git clone <url-do-repo> marquesa
cd marquesa

# Updates: git pull
```

### 3. Preencher envs (única coisa manual)

```bash
# Backend
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

Preencher:
- `DATABASE_URL` (use senha forte, formato `postgresql://marquesa:SENHA@db:5432/marquesa?schema=public`)
- `JWT_SECRET` e `JWT_REFRESH_SECRET` (cada um: `openssl rand -base64 48`)
- `MERCADOPAGO_ACCESS_TOKEN` e `MERCADOPAGO_PUBLIC_KEY` (PRODUCTION do painel MP)
- `MERCADOPAGO_WEBHOOK_SECRET` (vai ser exibido depois que cadastrar o webhook no painel MP — pode preencher placeholder agora e atualizar depois)
- `SEED_ADMIN_PASSWORD` e `SEED_CLIENTE_PASSWORD` (≥10 chars cada, gerar fortes)

```bash
# Frontend
cp frontend/.env.production.example frontend/.env.production
# ja vem com defaults certos pro dominio — abrir e conferir se quiser
nano frontend/.env.production

# Compose (DB_PASSWORD precisa BATER com o DATABASE_URL acima)
cp infra/.env.example infra/.env
nano infra/.env
```

### 4. Bootstrap (idempotente — pode rodar de novo a vontade)

```bash
chmod +x infra/scripts/setup-vps.sh
./infra/scripts/setup-vps.sh
```

O script:
1. Valida envs preenchidos
2. `docker compose build` + `up -d`
3. Aguarda DB ficar healthy
4. `prisma migrate deploy`
5. `prisma db seed` (só se DB vazio)
6. Configura nginx + ativa site
7. Roda certbot SSL
8. Smoke test

### 5. Senhas dos usuários iniciais

Após o **primeiro** `npx prisma db seed`, o console do API printa:

```
[seed] Admin criado: admin@marquesa.dev / <SENHA-GERADA>
[seed] Cliente criado: cliente@marquesa.dev / <SENHA-GERADA>
```

**Salvar essas senhas AGORA** — não serão mostradas de novo. Se preencheu `SEED_*_PASSWORD` no env, são essas.

### 6. Cadastrar webhook MercadoPago

No painel `mercadopago.com.br` → Suas integrações → Webhooks:

- **URL:** `https://marquesa.gustavo.agenciaever.cloud/api/webhooks/mercadopago`
- **Eventos:** `payment` (e `payment.updated` se disponível)
- **Modo:** PRODUCTION
- **Copiar a "Chave secreta"** que aparece e colocar em `backend/.env.production` como `MERCADOPAGO_WEBHOOK_SECRET`
- Restart API: `docker restart gustavo-marquesa-api`

### 7. Pronto

Validar:
- [ ] `https://marquesa.gustavo.agenciaever.cloud` carrega
- [ ] `https://marquesa.gustavo.agenciaever.cloud/imoveis` lista catálogo
- [ ] `https://marquesa.gustavo.agenciaever.cloud/healthz` retorna 200
- [ ] Login admin funciona, redireciona pra `/painel`
- [ ] Reserva com Pix gera QR (testar com cartão de teste se MP em sandbox; em prod, R$ 1,00 com Pix real)

## Comandos úteis

```bash
# Logs em tempo real
docker logs -f gustavo-marquesa-api
docker logs -f gustavo-marquesa-web
docker logs -f gustavo-marquesa-db

# Restart só API (após mudar env)
docker restart gustavo-marquesa-api

# Re-seed (CUIDADO — só se quiser zerar)
docker exec gustavo-marquesa-db psql -U marquesa -d marquesa -c 'TRUNCATE "Reserva", "Lead", "Imovel" CASCADE;'
docker exec gustavo-marquesa-api npx prisma db seed

# Backup do Postgres
docker exec gustavo-marquesa-db pg_dump -U marquesa marquesa > /opt/gustavo/marquesa/backup-$(date +%F).sql

# Conectar no DB
docker exec -it gustavo-marquesa-db psql -U marquesa -d marquesa
```

## Update / re-deploy

```bash
ssh gustavo@187.127.17.153
cd /opt/gustavo/marquesa
git pull
./infra/scripts/setup-vps.sh   # rebuilda só o que mudou
```

Se mudou só código sem schema:
```bash
cd /opt/gustavo/marquesa/infra
docker compose -f docker-compose.prod.yml build api web
docker compose -f docker-compose.prod.yml up -d
```

## Rollback

```bash
cd /opt/gustavo/marquesa
git log --oneline -10                                # acha o hash bom
git checkout <hash-bom>
cd infra
docker compose -f docker-compose.prod.yml up -d --build
```

Se schema do Postgres regrediu, resolver migrations manualmente — `prisma migrate resolve --rolled-back <nome-da-migration>`.

## Troubleshooting

| Sintoma | Provável causa | Fix |
|---|---|---|
| `502 Bad Gateway` no nginx | API container caiu | `docker logs gustavo-marquesa-api` — geralmente env mal preenchida (JWT default em prod, DB unreachable) |
| Login não persiste | `COOKIE_SECURE=false` em prod, ou `COOKIE_DOMAIN` setado errado | Conferir backend/.env.production: `COOKIE_SECURE=true`, `COOKIE_DOMAIN=` (vazio) |
| Frontend mostra mas API 404 | `NEXT_PUBLIC_API_URL` errado no build | Rebuildar `web` após corrigir env: `docker compose -f docker-compose.prod.yml build web && up -d` |
| Webhook MP não chega | URL errada no painel ou `WEBHOOK_SECRET` desincronizado | Conferir URL exata + reaplicar secret + restart API |
| Healthz 500 | DB não acessível pelo container API | Conferir se `db` healthy, network `marquesa-net` ok |

## Convenções (não mexer sem motivo)

- Container: `gustavo-marquesa-{api,web,db}`
- Portas host: `8210` (web), `8211` (api), DB sem porta exposta
- USER non-root nos containers
- `mem_limit: 512m` + `cpus: 1.0` (não derruba VPS dos outros)
- Logs com rotation (10MB × 3 arquivos)
- `.env*` no `.gitignore` (nunca commitado)

Mais detalhes em `memoria/reference_vps_ever_growth.md` (do framework).
