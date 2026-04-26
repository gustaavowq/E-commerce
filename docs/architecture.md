# Arquitetura do Projeto — E-Commerce Multi-Agent

> Documento mantido pelo Tech Lead. Última atualização: início do projeto.

## Decisão 1 — Stack Tecnológica

**Backend:** Node.js + Express + PostgreSQL + Prisma
- Node.js por familiaridade do time e ecossistema npm
- PostgreSQL por ser relacional (pedidos, produtos, usuários têm relações complexas)
- Prisma por type-safety e migrations automáticas

**Frontend / Dashboard:** Next.js 14 (App Router) + TailwindCSS
- Next.js por SSR/SSG (SEO para loja) e performance
- TailwindCSS por velocidade de implementação seguindo o design system
- Aplicações separadas (frontend ≠ dashboard) para isolamento de acesso

**Infra:** Docker + Docker Compose + Nginx
- Docker para paridade dev/prod
- Nginx como reverse proxy unificando os 3 apps em portas lógicas

---

## Arquitetura de Serviços

```
                    ┌─────────────────────────────────┐
                    │           NGINX :80              │
                    │   /      → frontend:3000         │
                    │   /admin → dashboard:3002        │
                    │   /api   → backend:3001          │
                    └──────────────┬──────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
     ┌────────▼──────┐   ┌────────▼──────┐   ┌────────▼──────┐
     │   Frontend    │   │   Dashboard   │   │    Backend    │
     │  (Next.js)    │   │  (Next.js)    │   │   (Express)   │
     │   :3000       │   │   :3002       │   │    :3001      │
     └───────────────┘   └───────────────┘   └───────┬───────┘
                                                      │
                                             ┌────────▼───────┐
                                             │  PostgreSQL    │
                                             │    :5432       │
                                             └────────────────┘
```

---

## Estrutura do Banco de Dados (definida pelo Backend + Analyst)

```
users               — clientes e lojistas. role enum: CUSTOMER | ADMIN
brands              — marcas (Lacoste, Nike, Adidas, Tommy, etc.)  ⬅ multimarca
categories          — categorias (Polos, Tênis, Bonés, Conjuntos, ...)
products            — catálogo. FK para brand + category. Preço base.
product_variations  — variações por SKU (tamanho × cor) com estoque próprio
product_images      — imagens do produto, com ordenação
addresses           — endereços de entrega dos clientes
carts               — carrinhos (inclui abandonados — métrica do Analyst)
cart_items          — itens do carrinho com referência a variation
orders              — pedidos com status enum
order_items         — itens do pedido (snapshot de preço no momento da compra)
payments            — pagamentos com status, método (PIX | CARD | BOLETO) e dados do gateway
coupons             — cupons de desconto com regras de uso
```

### Decisões importantes
- **`Brand` ≠ `Category`** desde o dia 1. Um produto é (Lacoste, Polos), outro é (Nike, Tênis). Filtros cruzados são requisito.
- **`ProductVariation` separada de `Product`** porque cada combinação tamanho+cor tem estoque, SKU e (opcionalmente) preço próprios.
- **Snapshot de preço no `order_items`** — o preço pago fica congelado mesmo se o produto subir/cair depois.
- **`cart` mesmo pra usuário não-logado** (via cookie/session) — pra o Analyst medir abandono real.

---

## Autenticação e Autorização

### Roles
| Role | Quem | Domínio |
|---|---|---|
| `CUSTOMER` | Cliente final | Loja (`/`) |
| `ADMIN` | Lojista (dono Miami Store) | Painel (`/admin`) |

### Regras
- Cadastro público sempre cria `CUSTOMER`. ADMIN só via seed ou outro ADMIN.
- JWT carrega `{ userId, role, exp }`.
- Middleware `requireRole('ADMIN')` em todo `/api/admin/*`.
- Apps separados: `src/frontend/` (loja) e `src/dashboard/` (painel) são Next.js apps independentes. Nginx faz o roteamento.
- Cookie de auth com `httpOnly + secure + sameSite=strict` em produção.

---

## Fluxo de Comunicação entre Agentes

```
Tech Lead
    │
    ├─→ Designer (entrega: design system + wireframes)
    │       │
    │       └─→ Frontend (consome: tokens de design)
    │
    ├─→ Backend (entrega: APIs + schema do banco)
    │       │
    │       ├─→ Frontend (consome: endpoints REST)
    │       └─→ Data Analyst (consome: dados para dashboard)
    │
    ├─→ Data Analyst (define: KPIs e métricas)
    │       │
    │       ├─→ Backend (solicita: endpoints de dados)
    │       └─→ Frontend (valida: visualizações)
    │
    ├─→ DevOps (entrega: ambiente + CI/CD)
    │       │
    │       └─→ Todos (consome: variáveis de ambiente)
    │
    └─→ QA (testa: tudo que os outros entregam)
            │
            └─→ Todos (reporta: bugs via shared/messages/)
```
