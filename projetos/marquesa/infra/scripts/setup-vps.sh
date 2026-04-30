#!/usr/bin/env bash
# =============================================================================
# Marquesa — bootstrap idempotente da VPS Ever Growth.
# Roda APOS o git clone em /opt/gustavo/marquesa/. Pode ser re-rodado a vontade.
#
# Pre-requisitos:
#   - Acesso ssh gustavo@187.127.17.153
#   - DNS A criado pelo Jean: marquesa.gustavo.agenciaever.cloud -> 187.127.17.153
#   - .env.production preenchidos em backend/ e frontend/
#   - .env (do compose, com DB_PASSWORD) na pasta infra/
#
# Uso:
#   cd /opt/gustavo/marquesa
#   ./infra/scripts/setup-vps.sh
# =============================================================================

set -euo pipefail

PROJECT_DIR="/opt/gustavo/marquesa"
DOMAIN="marquesa.gustavo.agenciaever.cloud"
NGINX_SITE="gustavo-marquesa"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-everia@agenciaevergrowth.com.br}"

cd "$PROJECT_DIR"

echo ""
echo "================================================================"
echo "  Marquesa — bootstrap VPS"
echo "  Domain : $DOMAIN"
echo "  Path   : $PROJECT_DIR"
echo "================================================================"
echo ""

# -----------------------------------------------------------------------------
# 1) Pre-checks: arquivos de env
# -----------------------------------------------------------------------------
fail() { echo ""; echo "ERRO: $*" >&2; exit 1; }

if [[ ! -f backend/.env.production ]]; then
  fail "backend/.env.production nao existe.
   Copie de backend/.env.production.example, abra com nano e preencha:
     - DATABASE_URL (use postgresql://marquesa:SENHA@db:5432/marquesa?schema=public)
     - JWT_SECRET, JWT_REFRESH_SECRET (openssl rand -base64 48)
     - MERCADOPAGO_ACCESS_TOKEN (token PRODUCTION) e MERCADOPAGO_PUBLIC_KEY
     - MERCADOPAGO_WEBHOOK_SECRET
     - CORS_ORIGIN=https://$DOMAIN
     - PUBLIC_API_URL=https://$DOMAIN
     - PUBLIC_WEB_URL=https://$DOMAIN
     - COOKIE_SECURE=true
     - NODE_ENV=production
     - SEED_ADMIN_PASSWORD e SEED_CLIENTE_PASSWORD (>=10 chars, gerar fortes)"
fi

if [[ ! -f frontend/.env.production ]]; then
  fail "frontend/.env.production nao existe.
   Copie de frontend/.env.production.example e preencha:
     - NEXT_PUBLIC_API_URL=https://$DOMAIN
     - NEXT_PUBLIC_SITE_URL=https://$DOMAIN
     - INTERNAL_API_URL=http://api:8211   (rede interna do compose)
     - NEXT_PUBLIC_WHATSAPP_NUMBER=5511900000000"
fi

if [[ ! -f infra/.env ]]; then
  fail "infra/.env nao existe (compose substitution).
   Crie com:
     DB_PASSWORD=<mesma senha do DATABASE_URL no backend/.env.production>"
fi

echo "[1/7] envs OK"

# -----------------------------------------------------------------------------
# 2) Build dos containers
# -----------------------------------------------------------------------------
echo ""
echo "[2/7] Building containers (pode demorar 3-5min na 1a vez)..."
( cd infra && docker compose -f docker-compose.prod.yml build )

# -----------------------------------------------------------------------------
# 3) Up (db sobe primeiro com healthcheck, api/web depois)
# -----------------------------------------------------------------------------
echo ""
echo "[3/7] Subindo containers..."
( cd infra && docker compose -f docker-compose.prod.yml up -d )

echo "    Aguardando DB ficar saudavel..."
TIMEOUT=60
ELAPSED=0
until docker exec gustavo-marquesa-db pg_isready -U marquesa -d marquesa &>/dev/null; do
  sleep 2
  ELAPSED=$((ELAPSED+2))
  if [[ $ELAPSED -ge $TIMEOUT ]]; then
    fail "DB nao ficou pronto em ${TIMEOUT}s. Veja: docker logs gustavo-marquesa-db"
  fi
done
echo "    DB OK"

# -----------------------------------------------------------------------------
# 4) Migrations (Prisma deploy — usa migrations existentes, nao gera)
# -----------------------------------------------------------------------------
echo ""
echo "[4/7] Rodando Prisma migrate deploy..."
docker exec gustavo-marquesa-api npx prisma migrate deploy

# -----------------------------------------------------------------------------
# 5) Seed condicional (so se DB tem 0 imoveis)
# -----------------------------------------------------------------------------
echo ""
echo "[5/7] Verificando seed..."
COUNT=$(docker exec gustavo-marquesa-db psql -U marquesa -d marquesa -tAc 'SELECT COUNT(*) FROM "Imovel";' 2>/dev/null || echo "0")
COUNT=$(echo "$COUNT" | tr -d '[:space:]')

if [[ "$COUNT" == "0" || -z "$COUNT" ]]; then
  echo "    DB vazio — rodando seed..."
  docker exec gustavo-marquesa-api npx prisma db seed
  echo "    SEED COMPLETO. Senhas dos usuarios admin/cliente foram printadas acima."
  echo "    SALVA elas em local seguro AGORA (nao serao mostradas de novo)."
else
  echo "    DB ja tem $COUNT imoveis. Pulando seed."
fi

# -----------------------------------------------------------------------------
# 6) Nginx site + SSL (idempotente)
# -----------------------------------------------------------------------------
echo ""
echo "[6/7] Configurando Nginx..."

NGINX_CONF_SRC="$PROJECT_DIR/infra/nginx/marquesa.conf"
NGINX_CONF_DST="/etc/nginx/sites-available/$NGINX_SITE"
NGINX_LINK="/etc/nginx/sites-enabled/$NGINX_SITE"

if [[ ! -f "$NGINX_CONF_DST" ]] || ! sudo cmp -s "$NGINX_CONF_SRC" "$NGINX_CONF_DST"; then
  echo "    Copiando config..."
  sudo cp "$NGINX_CONF_SRC" "$NGINX_CONF_DST"
fi

if [[ ! -L "$NGINX_LINK" ]]; then
  echo "    Ativando site..."
  sudo ln -sf "$NGINX_CONF_DST" "$NGINX_LINK"
fi

echo "    nginx -t..."
sudo nginx -t
echo "    reload nginx..."
sudo systemctl reload nginx

# Certbot — so se ainda nao tem cert pro dominio
if ! sudo certbot certificates 2>/dev/null | grep -q "$DOMAIN"; then
  echo "    Gerando SSL via certbot (Let's Encrypt)..."
  sudo certbot --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos -m "$LETSENCRYPT_EMAIL" \
    --redirect
else
  echo "    SSL ja configurado pra $DOMAIN — pulando certbot."
fi

# -----------------------------------------------------------------------------
# 7) Smoke test
# -----------------------------------------------------------------------------
echo ""
echo "[7/7] Smoke test..."
sleep 3

echo "    HEAD https://$DOMAIN ..."
curl -sf -I "https://$DOMAIN" | head -1 || echo "    AVISO: front nao respondeu"

echo "    GET https://$DOMAIN/healthz ..."
curl -sf "https://$DOMAIN/healthz" | head -c 300 || echo "    AVISO: API healthz nao respondeu"
echo ""

echo "    GET https://$DOMAIN/api/imoveis?limit=1 ..."
curl -sf "https://$DOMAIN/api/imoveis?limit=1" | head -c 300 || echo "    AVISO: catalogo nao respondeu"
echo ""

echo ""
echo "================================================================"
echo "  FEITO. Marquesa no ar em https://$DOMAIN"
echo ""
echo "  Logs:"
echo "    docker logs -f gustavo-marquesa-api"
echo "    docker logs -f gustavo-marquesa-web"
echo "    docker logs -f gustavo-marquesa-db"
echo ""
echo "  Webhook MP a configurar no painel do MercadoPago:"
echo "    URL    : https://$DOMAIN/api/webhooks/mercadopago"
echo "    Eventos: payment"
echo "================================================================"
