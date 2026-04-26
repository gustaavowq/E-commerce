# 📡 API Contracts — Miami Store Backend

> Mantido pelo Backend (Agente 01). Toda mudança em endpoint exige update aqui ANTES de mergear.
>
> Base URL em dev: `http://localhost/api` (via Nginx) ou `http://localhost:3001/api` (direto).

## Convenções

### Formato de resposta
Todo endpoint responde no formato:

**Sucesso:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

**Erro:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": { "email": ["Email inválido"] }
  }
}
```

### Códigos de erro padronizados
| Code | HTTP | Significado |
|---|---|---|
| `BAD_REQUEST` | 400 | Requisição malformada |
| `VALIDATION_ERROR` | 422 | Dados não passaram no Zod |
| `UNAUTHORIZED` | 401 | Token ausente ou inválido |
| `FORBIDDEN` | 403 | Token OK mas role não autoriza |
| `NOT_FOUND` | 404 | Recurso não existe |
| `CONFLICT` | 409 | Conflito (ex: email duplicado) |
| `RATE_LIMITED` | 429 | Bloqueado por rate limit |
| `INTERNAL` | 500 | Erro inesperado |

### Autenticação
- **Cookie httpOnly + secure (em prod) + sameSite=strict** para sessão web (`access_token` + `refresh_token`)
- **OU** header `Authorization: Bearer <accessToken>` (mobile, curl)
- Access token expira em **15 min** (default). Refresh em **30 dias**.
- Cliente deve chamar `/auth/refresh` ao receber `401` antes de redirecionar pro login.

---

# 📂 Endpoints públicos

## `GET /api/healthz`
Healthcheck. Faz `SELECT 1` no Postgres.
- **200** — `{ status: "ok", service: "miami-backend", version: "0.1.0", timestamp }`
- **503** — `{ code: "DB_UNAVAILABLE" }`

## `GET /api/brands`
Lista todas as marcas ativas, com contagem de produtos ativos.
- **200** — array de `{ id, slug, name, logoUrl, productCount }`
- ordenação: `sortOrder` ASC, depois `name` ASC

## `GET /api/brands/:slug`
- **200** — mesmo formato acima
- **404** — marca inexistente ou inativa

## `GET /api/categories`
Lista flat de todas as categorias ativas. Front pode reconstruir hierarquia via `parentId`.
- **200** — `{ id, slug, name, parentId, productCount }[]`

## `GET /api/categories/:slug`
- **200** — `{ id, slug, name, parentId, productCount, children: [...] }`
- **404** — não existe ou inativa

## `GET /api/products`
Listagem paginada de produtos ativos com filtros.

**Query params (todos opcionais):**
| Param | Tipo | Descrição |
|---|---|---|
| `brand` | string | slug de uma marca |
| `brands` | string | CSV de slugs (ex: `lacoste,nike`) |
| `category` | string | slug de uma categoria |
| `categories` | string | CSV de slugs |
| `size` | string | tamanho exato (ex: `M`, `42`) |
| `color` | string | cor exata (case-insensitive) |
| `search` | string | busca em `name` ou `description` |
| `minPrice` | number | preço mínimo |
| `maxPrice` | number | preço máximo |
| `inStock` | boolean | só produtos com pelo menos 1 variação com estoque > 0 |
| `sort` | enum | `newest` (default), `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`, `featured` |
| `page` | number | default 1 |
| `limit` | number | default 20, máx 100 |

**Resposta `200`** — `data[]`:
```json
{
  "id": "...",
  "slug": "polo-lacoste-vermelha",
  "name": "Polo Lacoste Original Vermelha",
  "basePrice": 249.90,
  "comparePrice": 349.90,
  "isFeatured": true,
  "brand": { "id": "...", "slug": "lacoste", "name": "Lacoste" },
  "category": { "id": "...", "slug": "polos", "name": "Polos" },
  "primaryImage": { "url": "...", "alt": "..." },
  "sizes": ["P", "M", "G", "GG"],
  "colors": [{ "color": "Vermelho", "hex": "#D32F2F" }],
  "totalStock": 28
}
```

`meta`: `{ page, limit, total, totalPages }`

## `GET /api/products/:slug`
Produto único com **todas** as variações + imagens.

**Resposta `200`:**
```json
{
  "id": "...",
  "slug": "...",
  "name": "...",
  "description": "...",
  "basePrice": 249.90,
  "comparePrice": 349.90,
  "isFeatured": true,
  "measureTable": { "tipo": "polo", "P": { "peito": 50, "comprimento": 70 }, ... },
  "metaTitle": null,
  "metaDesc": null,
  "brand":    { "id", "slug", "name", "logoUrl" },
  "category": { "id", "slug", "name" },
  "variations": [
    { "id", "sku", "size", "color", "colorHex", "stock", "priceOverride" }
  ],
  "images": [
    { "id", "url", "alt", "sortOrder", "isPrimary" }
  ]
}
```

---

# 🔐 Endpoints de autenticação

## `POST /api/auth/register`
**Cadastro público.** SEMPRE cria role `CUSTOMER` — qualquer `role` no body é silenciosamente ignorado (regra do kickoff).

**Rate limit:** 10 req/min por IP.

**Body:**
```json
{
  "email":    "user@miami.test",
  "password": "senha12345",
  "name":     "Tiago Silva",
  "phone":    "11999999999",         // opcional
  "cpf":      "12345678901"          // opcional, 11 dígitos OU formato 999.999.999-99
}
```

**Validação:**
- `email` válido
- `password` ≥ 8 chars, ao menos 1 letra E 1 número
- `name` ≥ 2 chars

**201** — cria user + seta cookies + retorna:
```json
{ "user": { "id", "email", "name", "role": "CUSTOMER", "createdAt" }, "accessToken": "..." }
```
**409** — email já cadastrado

## `POST /api/auth/login`
Funciona pra ambas roles. Frontend decide redirect (CUSTOMER → `/`, ADMIN → `/admin`).

**Rate limit:** 10 req/min por IP.

**Body:** `{ email, password }`

**200** — `{ user: { id, email, name, role }, accessToken }` + cookies

**401** — `Email ou senha incorretos` (mensagem genérica pra evitar enumeração de emails)

## `POST /api/auth/refresh`
Lê `refresh_token` do cookie, valida, **revoga o antigo** e emite novo par (access + refresh).

**200** — novo `{ user, accessToken }` + novos cookies
**401** — refresh ausente/inválido/expirado/revogado (cookies são limpos)

## `POST /api/auth/logout`
Revoga o refresh atual e limpa cookies.
**200** — `{ message: "Logout realizado" }`

## `GET /api/auth/me`
**Requer autenticação.**

**200** — `{ user: { id, email, name, phone, cpf, role, emailVerifiedAt, createdAt } }`
**401** — não autenticado

---

# 🛡️ Endpoints admin (todos requerem role `ADMIN`)

Aplicado `requireAuth + requireRole('ADMIN')` no router master. Sem chance de leak.

## `GET /api/admin/products`
Lista TODOS os produtos (inclui inativos).

**Query:**
- `page`, `limit`
- `onlyInactive=true` — só inativos

**200** — `data[]` com `{ id, slug, name, basePrice, isActive, isFeatured, brand, category, variationCount, totalStock, updatedAt }` + paginação no `meta`

## `POST /api/admin/products`
Cria produto com variações + imagens em uma transação.

**Body:**
```json
{
  "slug": "polo-nova-edicao",
  "name": "Polo Nova Edição",
  "description": "...",
  "basePrice": 199.90,
  "comparePrice": 249.90,           // opcional
  "brandId": "...",                  // FK
  "categoryId": "...",               // FK
  "isActive": true,
  "isFeatured": false,
  "measureTable": { "tipo": "polo", ... },   // JSON livre
  "variations": [                    // mín 1
    { "sku", "size", "color", "colorHex", "stock", "priceOverride" }
  ],
  "images": [
    { "url", "alt", "sortOrder", "isPrimary" }
  ]
}
```

**201** — `{ id, slug, name }`
**409** — slug ou SKU duplicado
**422** — validação Zod

## `DELETE /api/admin/products/:id`
**Soft delete** — seta `isActive = false`. Não apaga do banco.
**204** — sem corpo
**404** — produto não existe

## `GET /api/admin/dashboard/summary?period=30`
KPIs do topo do painel.

**200:**
```json
{
  "period": 30,
  "revenue": 12450.50,
  "paidOrders": 42,
  "ordersTotal": 67,
  "ordersToday": 3,
  "averageTicket": 296.44,
  "activeProducts": 6,
  "lowStockSkus": 9
}
```

## `GET /api/admin/dashboard/revenue?period=30`
Série diária de receita (status PAID) no período.

**200** — `[{ "date": "2026-04-25", "total": 1850.00 }, ...]`

## `GET /api/admin/dashboard/top-products?limit=10`
**200** — `[{ "product": { id, slug, name, brand }, "quantity": 12, "revenue": 2999.00 }]`

## `GET /api/admin/dashboard/orders-by-status`
**200** — `[{ "status": "PAID", "count": 42 }, { "status": "PENDING_PAYMENT", "count": 8 }, ...]`

---

# 🔄 Fluxos comuns

## Cadastro + login automático
Após `POST /register`, o cliente **já está logado** (cookies setados). Não precisa fazer `/login` em seguida.

## Refresh transparente no frontend
Padrão recomendado:
1. Faz request normal
2. Se receber **401**, chama `POST /auth/refresh`
3. Se refresh deu **200**, refaz a request original
4. Se refresh deu **401**, redireciona pro login

## Filtros de produto combinados (ex: home com seção "Lacoste")
```
GET /api/products?brand=lacoste&sort=featured&limit=8
```

## Filtros pra tela "Tênis tamanho 42"
```
GET /api/products?category=tenis&size=42&inStock=true
```

---

# 📋 Códigos prontos pra usar (snippets)

## Curl — registrar e listar produtos
```bash
# Register
curl -i -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@miami.test","password":"senha12345","name":"Teste"}'

# Login admin (recebe cookies)
curl -i -c cookies.txt -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miami.store","password":"miami2026"}'

# Usa os cookies pra acessar admin
curl -b cookies.txt http://localhost/api/admin/dashboard/summary
```

## Fetch (frontend)
```typescript
async function fetchProducts(filter: { brand?: string; category?: string }) {
  const params = new URLSearchParams(filter as Record<string, string>)
  const res = await fetch(`/api/products?${params}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Erro ao buscar produtos')
  return res.json()
}
```

---

# 🚧 Endpoints planejados (próximos sprints)

- `POST /api/cart` + `POST /api/cart/items` (carrinho de visitante)
- `POST /api/orders` (checkout)
- `POST /api/payments/pix` (gera QR code via MercadoPago)
- `POST /api/webhooks/mercadopago` (atualiza status de pagamento, idempotente via `webhookEventId`)
- `POST /api/shipping/calculate` (frete via ViaCEP + tabela)
- `GET /api/coupons/validate?code=XXX`
- `POST /api/admin/orders/:id/ship` (admin marca como enviado, registra tracking)
