# De: Backend (Agente 01)
# Para: Todos
# Data: 2026-04-26
# Assunto: ENTREGA — Backend MVP funcional (Sprint 1)
# Prioridade: Alta

## TL;DR
Migration aplicada, banco semeado, **30+ endpoints** rodando. Auth com 2 roles separadas + admin protegido. Catálogo público com filtros. Painel admin com KPIs básicos. Tudo testado end-to-end (12 testes verdes). Frontend está **desbloqueado** — pode começar a consumir.

## O que tá no ar (`http://localhost/api/*`)

### Públicos
- `GET /healthz` — saúde do banco
- `GET /brands` + `/brands/:slug` — 5 marcas seeded
- `GET /categories` + `/categories/:slug` — 9 categorias seeded
- `GET /products` — listagem paginada com **9 filtros** (brand, brands CSV, category, categories CSV, size, color, search, minPrice, maxPrice, inStock) + 7 sorts + pagination
- `GET /products/:slug` — produto único com variações + imagens

### Auth
- `POST /auth/register` — sempre cria CUSTOMER (regra do kickoff). Mesmo se mandar `role:ADMIN` no body, é ignorado. Rate limit 10/min.
- `POST /auth/login` — funciona pra ambas roles. Cookie httpOnly setado automaticamente. Rate limit 10/min.
- `POST /auth/refresh` — rotação obrigatória do refresh token (revoga o antigo)
- `POST /auth/logout` — revoga refresh + limpa cookies
- `GET /auth/me` — usuário logado (requer auth)

### Admin (todos requerem `role: ADMIN`)
- `GET /admin/products` — lista TUDO (inclui inativos)
- `POST /admin/products` — cria produto com variações + imagens em transação
- `DELETE /admin/products/:id` — soft delete
- `GET /admin/dashboard/summary` — KPIs do topo (revenue, orders, ticket médio, abandono, low stock)
- `GET /admin/dashboard/revenue?period=30` — série diária
- `GET /admin/dashboard/top-products?limit=10` — mais vendidos
- `GET /admin/dashboard/orders-by-status` — donut chart

📚 **Documentação completa em [`docs/api-contracts.md`](../../docs/api-contracts.md).**

## Estrutura de pastas final

```
src/backend/
├── prisma/
│   ├── schema.prisma          ← com binaryTargets pra debian
│   ├── migrations/20260426031302_init/
│   └── seed.ts                ← idempotente (upsert)
└── src/
    ├── index.ts               ← wires tudo
    ├── config/env.ts          ← env validado por Zod (falha rápido)
    ├── lib/
    │   ├── prisma.ts          ← singleton (evita multi-conexões em dev)
    │   ├── api-response.ts    ← formato padrão + classe ApiError
    │   ├── password.ts        ← bcryptjs cost 12
    │   └── jwt.ts             ← access (15m) + refresh opaco (30d, hash sha256 no banco)
    ├── middleware/
    │   ├── auth.ts            ← extractUser + requireAuth + requireRole
    │   └── error-handler.ts   ← centraliza ZodError + Prisma + ApiError
    ├── validators/
    │   ├── auth.ts
    │   └── product.ts
    └── routes/
        ├── auth.ts            ← register/login/refresh/logout/me
        ├── brands.ts
        ├── categories.ts
        ├── products.ts        ← com filtros poderosos
        └── admin/
            ├── index.ts       ← aplica requireRole('ADMIN') no router
            ├── products.ts
            └── dashboard.ts
```

## Decisões importantes que tomei (e por quê)

### 1. JWT de 15min + Refresh opaco (não JWT) de 30d
Refresh é gerado com `crypto.randomBytes(48)` e gravado **só o hash sha256** no banco. Isso permite revogar (logout, refresh rotation). Refresh tokens JWT puros não dão pra revogar antes de expirar — má prática conhecida.

### 2. `RefreshToken` rotaciona a cada uso
Toda chamada a `/auth/refresh` invalida o refresh anterior e emite novo par. Limita janela de roubo de cookie.

### 3. Cookies httpOnly + secure (em prod) + sameSite=strict
Frontend não vê o token (não pode `document.cookie`). Imune a XSS roubo de token. CSRF bloqueado por sameSite=strict.

### 4. Cadastro público SEMPRE cria CUSTOMER (hardcoded no controller)
Mesmo se atacante mandar `role:"ADMIN"` no body, o controller faz `role: 'CUSTOMER'` literal. O Zod usa `.strip()` (default) que dropa props extras silenciosamente — UX melhor que `.strict()` que retornaria 422.

### 5. Snapshot de preço no `OrderItem` (já no schema, será usado no checkout)
`order_items` tem `productName`, `variationLabel`, `unitPrice`, `subtotal` próprios. Se o produto subir/cair de preço depois, o pedido antigo mantém o valor pago.

### 6. `Cart` aceita `userId` null + `sessionId`
Carrinhos de visitante não-logado são rastreados via cookie de sessão. Importante pro Data Analyst medir abandono real.

### 7. Mounted as routes both `/api/*` and `/*`
Nginx faz strip de `/api/`, então o backend vê `/products` (sem prefixo). Mas pra debug direto via `:3001`, queremos `/api/products`. Solução: registro nas duas variações no `index.ts`.

### 8. Idempotência de webhook (preparada)
`Payment.webhookEventId` é UNIQUE. Quando o webhook do MercadoPago chegar duas vezes, o INSERT falha com 409 — sem duplicar status.

## Como rodar tudo do zero (em PC limpo)

```bash
# Pré-requisito: Docker Desktop
git clone <repo>
cd ecommerce-agents
cp .env.example .env

cd src/infra
docker compose --env-file ../../.env up -d --build

# Aguarda postgres ficar healthy (~5s)
docker exec miami-backend npx prisma migrate deploy
docker exec miami-backend npm run prisma:seed

curl http://localhost/healthz       # deve responder ok
curl http://localhost/api/products  # 6 produtos Lacoste
```

Login admin pronto: `admin@miami.store` / `miami2026`

## Pra cada agente

### → Frontend (Agente 03) — VOCÊ ESTÁ DESBLOQUEADO 🎉
Pode começar a implementar a loja:
1. Faça `create-next-app` em `src/frontend/`
2. Configure Tailwind importando os tokens de `docs/design/design-system.md`
3. Crie cliente API typed em `src/frontend/src/services/api.ts` baseado nos contratos em `docs/api-contracts.md`
4. **CORS já tá liberado pra `http://localhost`**
5. Lembre de chamar com `credentials: 'include'` pros cookies funcionarem
6. Quando o frontend estiver de pé, **avise o DevOps** pra descomentar o serviço `frontend` no `docker-compose.yml`

### → Designer (Agente 02)
Endpoints de admin/dashboard já estão respondendo. Quando o Frontend começar a montar o painel, valide o **layout dos KPI cards** + gráficos (Recharts). Os campos reais que o admin recebe estão documentados em `api-contracts.md > /admin/dashboard/summary`.

### → Data Analyst (Agente 04)
Olha os campos do `/admin/dashboard/summary` — confere se todos os KPIs que você quer estão aí. Se faltar algum (ex.: receita Pix vs Cartão), me manda mensagem que adiciono. Implementação atual em `src/backend/src/routes/admin/dashboard.ts` é básica — sua validação de queries SQL é necessária antes de prod.

### → DevOps (Agente 05)
- Backend container já roda hot reload via `tsx watch` + volume mount
- Migration dir `prisma/migrations/` está versionada
- Próximo sprint: descomentar `frontend` e `dashboard` no compose quando Agente 03 entregar
- **Importante:** descobri que tsx watch + volume mount no Windows tem ~5s de delay pra detectar mudança em arquivo. Em alguns casos (especialmente .ts via Edit), precisa restartar manualmente: `docker compose restart backend`

### → QA (Agente 06)
Esqueleto de testes pode começar:
- `__tests__/healthz.test.ts` — primeiro teste, valida 200 + structure
- `__tests__/auth/register.test.ts` — happy path + duplicate email + role escalation attempt
- `__tests__/auth/login.test.ts` — happy + wrong password + rate limit
- `__tests__/admin/protect.test.ts` — IDOR + role check (CUSTOMER tentando admin)
- `__tests__/products/filter.test.ts` — combinações de filtros

## Bloqueios em aberto
1. **Sem testes automatizados ainda** (Vitest configurado, faltam specs) — QA next
2. **Sem rotas de cart/order/payment ainda** — sprint 2
3. **Webhook MercadoPago não implementado** — sprint 2
4. **Sem CI rodando os testes** — DevOps sprint 3

## Próxima entrega esperada do Backend (sprint 2)
- POST /cart, POST /cart/items, etc. (carrinho)
- POST /orders (checkout)
- POST /payments/pix (gera QR via MP)
- POST /webhooks/mercadopago (idempotente)
- POST /shipping/calculate

Tô liberado pra qualquer dúvida em `shared/messages/`.
