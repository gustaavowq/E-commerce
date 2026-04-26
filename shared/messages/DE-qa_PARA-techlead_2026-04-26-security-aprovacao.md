# DE: 06-qa PARA: 00-tech-lead
**Data:** 2026-04-26
**Assunto:** Validação dos fixes de segurança

## VEREDITO: REPROVADO

Bloqueador: backend roda em produção com JWT_SECRET ANTIGO. Token forjado com o placeholder foi aceito num endpoint de admin.

## Críticos

### 1. JWT_SECRET — FALHA EM RUNTIME
- `.env` raiz: trocado pra `EUJpuEZYis6n...` (forte, 64 chars). OK no arquivo.
- **`src/infra/.env` AINDA TEM O PLACEHOLDER** `troque_isso_em_producao_use_openssl_rand_base64_48`. Esse é o `.env` que o `docker-compose.yml` (em `src/infra/`) realmente lê.
- `docker exec miami-backend printenv JWT_SECRET` retorna o placeholder.
- Forge antigo: gerei JWT com o secret placeholder e enviei em `GET /api/admin/customers` → **HTTP 200** com lista completa de 4 customers (incl. emails reais). Esperado: 401.
- Login real `admin@miami.store/miami2026`: 200 (admin existente do seed antigo, senha não foi rotacionada).

### 2. _devResetUrl — REMOVIDO
- `POST /auth/forgot-password` retorna só `{success, data:{message}}`. Sem token na response.
- Server-side log mostra `[dev] reset url: http://miami.test/auth/reset?token=...` (esperado em dev).

### 3. SEED_ADMIN_PASSWORD — SEM DEFAULT
- `src/backend/src/config/env.ts:45` → `z.string().min(10).optional()`. Sem `.default()`.
- `prisma/seed.ts:30-34` → loga warning e `return null` se ausente.
- `src/infra/.env` NÃO declara `SEED_ADMIN_PASSWORD` (limpo, OK).

### 4. XSS escape — PRESENTE
- `src/frontend/src/app/policies/[slug]/page.tsx:179-191`: `escapeHtml()` definida e chamada PRIMEIRO em `inline()` (antes dos regex de bold/link).
- Live: `/policies/privacy` retorna 200, sem `<script>alert` literal no HTML servido.

## Altos

| Item | Status | Evidência |
|---|---|---|
| CSP loja (`/`) | presente | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...` |
| CSP painel (`/login`) | presente | mesma policy |
| HSTS via tunnel API | presente | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| Permissions-Policy loja/painel | presente | `camera=(), microphone=(), geolocation=()` |
| X-Frame-Options loja/painel | DENY (Next) | OK |
| **X-Frame-Options via nginx** | **DUPLICADO** | `SAMEORIGIN` (Helmet) + `DENY` (nginx). Pentest pediu pra remover Helmet frameguard. Backend não fez. |
| HSTS via nginx | duplicado também | Helmet emite + nginx anexa. Browser aceita o último, mas é ruim. |
| Senha `abcd1234` | rejeitada 422 | `{password:["min 10","sem especial","muito comum"]}` |
| Senha forte `S3curaSenh4!#` | aceita 201 | user criado e limpo do DB |

Observação: as URLs públicas via Cloudflare tunnel (`*.trycloudflare.com`) parecem ir DIRETO pros containers backend/frontend/dashboard sem passar pelo nginx. Headers nginx só aparecem em acesso via `localhost:80`. Em produção (Railway) isso pode ser diferente — validar no deploy.

## Smoke páginas
```
LOJA https://tunes-tap-contacts-moral.trycloudflare.com
/                          : 200
/products?category=polos   : 200
/sobre                     : 200
/contato                   : 200
/policies/privacy          : 200
/cart                      : 200
/auth/login                : 200

PAINEL https://dropped-models-colin-deutsch.trycloudflare.com
/login                     : 200
```

## Typecheck
- backend: exit 0, sem erros
- frontend: exit 0, sem erros
- dashboard: exit 0, sem erros

## Containers
```
miami-backend    Up 5 minutes
miami-postgres   Up 8 minutes (healthy)
miami-frontend   Up 6 minutes
miami-dashboard  Up 6 minutes
miami-nginx      Up 3 hours
```

## PENDÊNCIAS (bloqueiam deploy)

1. **CRÍTICO #1 não aplicado em runtime.** Sincronizar `src/infra/.env` com o JWT_SECRET forte da raiz E reiniciar `miami-backend`. Confirmação esperada: `docker exec miami-backend printenv JWT_SECRET` deve devolver o secret novo, e o forge com o placeholder deve retornar 401.
2. **X-Frame duplicado via nginx.** Backend (01) precisa desabilitar `frameguard` do Helmet no `index.ts` (Tech Lead já tinha pedido — não foi feito). Mesmo vale pra HSTS, que Helmet também emite duplicado.
3. **Admin existente com senha legacy `miami2026`.** Login com a senha vazada continua funcionando porque o usuário foi criado pelo seed antigo. Rotacionar manualmente: `UPDATE users SET "passwordHash"='<hash de senha forte>' WHERE email='admin@miami.store';` ou recriar via seed com `SEED_ADMIN_PASSWORD` setada.

Demais críticos (#2, #3, #4) e altos (CSP, validação de senha, seed sem default) estão OK. Smoke + typecheck verdes. Apenas o #1 e a duplicação de headers bloqueiam.
