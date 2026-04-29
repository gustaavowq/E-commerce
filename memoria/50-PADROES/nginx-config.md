# Template Nginx — Reverse proxy (dev)

> Padrão extraído do Miami Store. Quem usa: **05-devops** no Sprint 1, junto com [docker-compose-template](docker-compose-template.md).

## O que faz

Roteia 3 subdomínios `.test` pros 3 services Node:

| Subdomínio | Aponta pra | Service Docker |
|---|---|---|
| `{{slug}}.test` | Loja (Next.js) | `frontend:3000` |
| `admin.{{slug}}.test` | Painel (Next.js) | `dashboard:3002` |
| `api.{{slug}}.test` | API (Express) | `backend:3001` |

Por que `.test`? RFC 6761 reserva pra dev — não conflita com TLD real, não vaza pra DNS público.

## Antes de copiar

Substituir `{{slug}}` pelo kebab-case da marca (`miami-store`, `loja-tech`, etc).

## Onde mora

`projetos/miami-store/infra/nginx/conf.d/default.conf` (montado read-only no container Nginx — ver [docker-compose-template](docker-compose-template.md)).

## Template

```nginx
# =============================================================================
# {{slug}} — Nginx config (dev)
# Mantido pelo DevOps (Agente 05).
#
# Pré-requisito no host (uma vez):
#   adicionar ao hosts file: 127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test
# =============================================================================

# Rate limit zones (proteção anti-abuse em dev)
limit_req_zone $binary_remote_addr zone=apilimit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=authlimit:10m rate=5r/s;

# Upstreams — nomes batem com service names do docker-compose
upstream backend_upstream {
    server backend:3001;
    keepalive 16;
}
upstream frontend_upstream {
    server frontend:3000;
    keepalive 16;
}
upstream dashboard_upstream {
    server dashboard:3002;
    keepalive 16;
}

# WebSocket upgrade (Next.js HMR)
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# =============================================================================
# api.{{slug}}.test → backend
# =============================================================================
server {
    listen 80;
    server_name api.{{slug}}.test;

    client_max_body_size 10m;

    # Headers de segurança (CSP omitido — API responde JSON)
    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "DENY"    always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    proxy_connect_timeout 10s;
    proxy_send_timeout    30s;
    proxy_read_timeout    30s;

    # Auth: rate limit agressivo (anti-bruteforce)
    location ~ ^/auth/(login|register) {
        limit_req zone=authlimit burst=10 nodelay;

        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        limit_req zone=apilimit burst=40 nodelay;

        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection        "";
    }
}

# =============================================================================
# admin.{{slug}}.test → dashboard
# =============================================================================
server {
    listen 80;
    server_name admin.{{slug}}.test;

    client_max_body_size 10m;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "DENY"    always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # CSP omitido aqui — Next.js (dashboard) emite via next.config.js (evita duplicidade)

    location / {
        proxy_pass http://dashboard_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Next.js HMR via WebSocket
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
    }
}

# =============================================================================
# {{slug}}.test → frontend (loja)  [DEFAULT — captura localhost também]
# =============================================================================
server {
    listen 80 default_server;
    server_name {{slug}}.test localhost;

    client_max_body_size 10m;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "DENY"    always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # CSP omitido — Next.js (frontend) emite via next.config.js

    # Healthcheck público (probe externo)
    location = /healthz {
        proxy_pass http://backend_upstream/healthz;
        access_log off;
    }

    # Compat: /api/* roteado pra backend (caso frontend use NEXT_PUBLIC_API_URL=/api)
    location /api/ {
        limit_req zone=apilimit burst=40 nodelay;

        proxy_pass http://backend_upstream/;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection        "";
    }

    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Next.js HMR
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        $connection_upgrade;
    }
}
```

## Decisões importantes

### Por que rate limit em `/auth/(login|register)` separado?

Login/register são alvos de bruteforce. 5 req/s é generoso pra usuário real, restritivo pra ataque. Burst=10 absorve burst legítimo (typo na senha + retry rápido). Ver [seguranca-padrao](../20-DECISOES/seguranca-padrao.md).

### Por que `default_server` no frontend?

Captura request sem `Host` correto (curl, scanner, localhost direto sem hosts file). Encaminha pra loja em vez de retornar 404 — UX melhor pra dev novo no time.

### Por que CSP omitido no Nginx?

Next.js (frontend e dashboard) já emite CSP via `next.config.js`. Duplicidade gera conflito de policy (ambos viram "script-src" e o browser usa o mais restritivo, quebrando HMR). API não precisa CSP — só JSON. Ver [05-csp-connect-src](../30-LICOES/05-csp-connect-src.md).

### Por que `proxy_set_header Connection ""` na API?

Limpa o header `Connection: close` de algumas libs (axios antigo) — mantém keepalive ativo no upstream. Reduz latência ~10ms por request.

### Por que `proxy_set_header Upgrade $http_upgrade` nos Next?

Next.js HMR (hot reload) usa WebSocket. Sem upgrade, dev fica recarregando manual. Em prod (Vercel) não tem HMR — irrelevante.

## Pré-requisitos no host

Adicionar ao hosts file (uma vez):

**Windows** (PowerShell admin):
```powershell
Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test"
```

**Linux/macOS:**
```bash
echo "127.0.0.1 {{slug}}.test admin.{{slug}}.test api.{{slug}}.test" | sudo tee -a /etc/hosts
```

Sem isso, browser não resolve `.test` — solta DNS_PROBE_FINISHED_NXDOMAIN.

## Validar config

```bash
# Sintaxe
docker compose exec nginx nginx -t

# Reload sem restart
docker compose exec nginx nginx -s reload

# Tail logs
docker compose logs -f nginx
```

## Quando NÃO usar este template

- **Prod:** Vercel/Railway/Cloudflare cuidam de TLS + roteamento. Este Nginx é dev-only.
- **HTTPS local:** este template é HTTP. Pra HTTPS dev, usar `mkcert` + ajustar `listen 443 ssl` + cert paths. Não cobrimos aqui (raro precisar).

## Ver também

- [docker-compose-template](docker-compose-template.md) — sobe os services que este Nginx roteia
- [seguranca-padrao](../20-DECISOES/seguranca-padrao.md) — rate limits, headers
- [05-csp-connect-src](../30-LICOES/05-csp-connect-src.md) — quando atualizar CSP no Next.js
