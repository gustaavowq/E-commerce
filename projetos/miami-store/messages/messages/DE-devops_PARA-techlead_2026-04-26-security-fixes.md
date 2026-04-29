# DE: 05-devops PARA: 00-tech-lead
**Data:** 2026-04-26
**Assunto:** Hardening de headers no nginx (default.conf)

## Fixes aplicados
- `src/infra/nginx/conf.d/default.conf`: headers atualizados nos **3 server blocks** (api, admin, frontend).
  - `X-Frame-Options`: `SAMEORIGIN` -> **`DENY`** (api ganhou o header, não tinha).
  - **Adicionados** em todos: `Permissions-Policy: camera=(), microphone=(), geolocation=()` e `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
  - `X-Content-Type-Options: nosniff` e `Referrer-Policy: strict-origin-when-cross-origin` mantidos.
  - **CSP NÃO adicionado no nginx** (decisão consciente): Frontend/Admin emitem CSP via Next.js (`next.config.js`); evita duplicidade e conflito de policy. API responde JSON, CSP não se aplica.

## nginx -t: **OK**
`nginx: configuration file /etc/nginx/nginx.conf test is successful` — reload via `nginx -s reload` sem erros.

## Headers retornados ao vivo
Validado via `curl -I` direto contra `localhost` com `Host:` correspondente em cada vhost (tunel Cloudflare bloqueado por revocation check no curl local, mas o nginx é o mesmo upstream).

| Header | api | admin | frontend |
|---|---|---|---|
| HSTS | presente | presente | presente |
| X-Frame-Options | **DENY** | **DENY** | **DENY** |
| Referrer-Policy | presente | presente | presente |
| Permissions-Policy | presente | presente | presente |
| X-Content-Type-Options | nosniff | nosniff | nosniff |

## Observação pro Backend (01)
A API mostra `X-Frame-Options` duplicado (Helmet emite `SAMEORIGIN` antes do nginx anexar `DENY`). Browser pega o mais restritivo (DENY) — funcional, mas confunde debug. Sugiro ao Backend remover/ajustar Helmet `frameguard` já que nginx cobre.
