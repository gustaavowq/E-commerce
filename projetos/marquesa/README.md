# Marquesa — Imobiliária Boutique

> Catálogo de imóveis de alto padrão à venda, com sistema de **reserva por sinal** via MercadoPago. Cliente paga 1-5% pra travar visita exclusiva e iniciar negociação; restante é offline com corretor.

## Status

🚧 **Em construção** (kickoff 2026-04-29). Projeto-teste de capacidade do framework — fica no ar enquanto Gustavo acompanha.

## Stack

- **Backend:** Node 20 + Express + TypeScript + Prisma 5 + PostgreSQL 16
- **Frontend:** Next.js 14 (App Router) + Tailwind + Zustand + TanStack Query — **app único** com role-based routing
- **Pagamento:** MercadoPago (Pix + cartão) — sinal de reserva
- **Imagens:** Cloudinary
- **Mapas:** Google Maps Embed (coordenadas fake para evitar exposição de localização real)
- **Deploy:** VPS Ever Growth (`/opt/gustavo/marquesa/` no host `187.127.17.153`)
- **Domínio:** `marquesa.gustavo.agenciaever.cloud`

## Arquitetura de URL única

```
marquesa.gustavo.agenciaever.cloud/
├── /                           ← loja pública (cliente)
│   ├── /imoveis                  catálogo + filtros
│   ├── /imoveis/[slug]           PDP + galeria + Google Maps + sinal
│   ├── /sobre, /contato
│   └── /policies/*
├── /auth/login                 ← universal — redireciona por role
├── /painel                     ← layout admin/analista
│   ├── /imoveis                  CRUD + status (disponível, reservado, vendido, em negociação)
│   ├── /reservas                 acompanhar sinais pagos
│   ├── /clientes
│   ├── /dashboard                analista olha KPIs
│   └── /settings
└── botão "← voltar pra loja" sempre visível no painel
```

Auth: middleware Next.js detecta role no JWT → ADMIN/ANALYST → `/painel`, USER → `/`.

## Decisões pré-aprovadas

- **Modelo:** sinal pra reservar (1-5% do imóvel via MP)
- **Conteúdo:** fotos reais (Unsplash/web), descrições inventadas mas coerentes, endereços fake em coordenadas no meio do mato
- **Qualidade:** Apple/Linear, animações scroll-reveal estilo Cisco sem invasivo
- **Multi-PC:** funcionar em qualquer browser/PC (não repetir bug Kore Tech)
- **Zero erro de auth** entre dispositivos
- **Painel adaptado pra imobiliária** (não e-commerce de produto físico)

## Estrutura

```
projetos/marquesa/
├── README.md                   este arquivo
├── JORNADA.md                  cronologia
├── PESQUISA-NICHO.md           output da Fase 0
├── DECISOES-ESPECIFICAS.md     decisões do projeto
├── DEPLOY.md                   passo-a-passo VPS
├── api-contracts.md
├── brand-brief.md              identidade visual
├── .env.example
├── design/                     logos, tokens
├── assets/                     fotos curadas
├── messages/                   DE-X_PARA-Y_*.md
├── scripts/                    seed, hooks
├── backend/                    Express + Prisma
├── frontend/                   Next.js 14 (loja + painel)
└── infra/                      docker-compose.prod.yml + nginx
```

## Convenções (VPS Ever Growth)

- Container: `gustavo-marquesa-{api,web,db}`
- Porta API (host): `127.0.0.1:8210` (faixa 8200-8299)
- USER non-root no Dockerfile
- `mem_limit` e `cpus` em todos os services
- Sem `0.0.0.0` em DB
- `.env` no `.gitignore` desde commit 1
