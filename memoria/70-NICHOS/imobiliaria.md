# Nicho: Imobiliária boutique alto padrão

> Template extraído do projeto Marquesa (kickoff 2026-04-29). Próximo projeto desse nicho começa daqui, não do zero.

## Diferenças críticas vs e-commerce de produto físico

1. **Catálogo é editorial, não SKU.** Foto grande, descrição literária 80-150 palavras, ficha técnica densa (m², quartos, suítes, banheiros, vagas, IPTU, condomínio).
2. **Não tem "carrinho".** Cliente não compra imóvel via Pix — paga **sinal pra reservar** (arras confirmatórias, CC arts. 417-420). Sinal trava imóvel por 10 dias enquanto negociação acontece offline com corretor.
3. **5 estados de imóvel** (não é "em estoque / fora de estoque"): `DISPONIVEL`, `RESERVADO` (sinal pago), `EM_NEGOCIACAO` (sinal expirou mas cliente ainda interessado), `VENDIDO`, `INATIVO`.
4. **Painel ADM diferente:** status colorido, gestão de reservas com ações (cancelar, converter pra vendido, extender), KPI funil multi-etapas (visita → lead → sinal → fechamento).
5. **Compliance forte:** CRECI obrigatório no rodapé + LGPD com consentimento explícito + Cofeci Resolução 1504/2023 (material precisa ID/área/tipo/preço).

## Stack canônica neste nicho (validada Marquesa)

- Backend: Express + Prisma + Postgres 16 (mesmo do framework)
- Frontend: Next.js 14 App Router **único** (loja + painel via role-based middleware) — economia de complexidade vs 2 apps
- MP Preference API (Pix + cartão) — **NÃO** usar Payment direto
- Webhook idempotente com HMAC `timingSafeEqual`
- Job de expiração 1h pra liberar imóvel após 10d sem fechamento

## Schema mínimo

```prisma
enum ImovelTipo { APARTAMENTO CASA COBERTURA SOBRADO TERRENO COMERCIAL }
enum ImovelStatus { DISPONIVEL RESERVADO EM_NEGOCIACAO VENDIDO INATIVO }
enum ReservaStatus { ATIVA EXPIRADA CANCELADA CONVERTIDA }
enum PagamentoStatus { PENDENTE APROVADO REJEITADO CANCELADO REEMBOLSADO }

model Imovel {
  // identidade + descrição
  slug, titulo, descricao, tipo, status
  // valores
  preco, precoSinal (5% default), iptuAnual, condominio
  // ficha técnica
  area, quartos, suites, banheiros, vagas
  // localização
  endereco, bairro, cidade, estado, cep, latitude, longitude
  // mídia
  fotos (String[])
  destaque (Boolean)
  // KPI tracking
  viewCount, lastViewedAt, lastInteractionAt
}

model Reserva {
  imovelId, userId, status, pagamentoStatus
  valorSinal, precoSnapshot (preço congelado no momento da reserva)
  mpPaymentId (unique), mpPreferenceId
  expiraEm (paidAt + 10 dias), paidAt
}

model Lead { imovelId, userId?, nome, email, telefone, mensagem }
```

**Campos de tracking obrigatórios:** `viewCount`, `lastViewedAt`, `lastInteractionAt` (sem isso, KPI funil topo + ranking de imóveis estagnados não funciona).

## Faixas de preço plausíveis (SP alto padrão, ano 2026)

| Tipo | Faixa | Mediana |
|------|-------|---------|
| Apartamento | R$ 1.5M - 5M | R$ 2.5M |
| Cobertura | R$ 4M - 15M | R$ 7M |
| Casa | R$ 2.5M - 10M | R$ 5M |
| Sobrado | R$ 1.8M - 4M | R$ 2.8M |
| Terreno comercial | R$ 3M - 8M | R$ 4.5M |

Bairros premium: Jardins (R$ 35k/m²), Vila Nova Conceição (R$ 26k/m²), Itaim Bibi (R$ 23k/m²), Higienópolis, Pinheiros, Vila Madalena, Perdizes, Moema.

## Variações típicas (catálogo de 20 imóveis)

- 6 coberturas (200-450m²)
- 6 apartamentos alto-padrão (80-200m²)
- 4 casas (200-600m²)
- 2 sobrados (150-280m²)
- 2 terrenos comerciais (500-1500m²)
- ~30% destaque (`destaque: true`)

## Mood visual dominante

- **Paleta:** monocromático preto/off-white/grafite + 1 acento verde-musgo (NÃO dourado, NÃO saturado)
- **Tipografia:** serifada display (Cormorant Garamond free / Canela paga) + Inter / Söhne body
- **Animação:** scroll-reveal IntersectionObserver fade+translateY 32px easing 0.16/1/0.3/1, 700ms, **run-once**
- **Sem cantos arredondados** (Marquesa boutique editorial, não SaaS)
- **Hover scale só na imagem** do card (1.03 em 400ms), nunca no card todo

## Refs visuais por mercado

- **BR:** Bossa Nova Sotheby's, Coelho da Fonseca, NPi, LPS Lopes
- **EUA:** Compass (mais alinhado Apple/Linear), Sotheby's IR, Christie's IR, Douglas Elliman, The Agency
- **Europa:** Lionard (IT), Coldwell Banker IT, Quintela+Penalva (PT), John Taylor (FR), Lucas Fox (ES), Mayfair Square (UK)

## KPIs do painel (9 essenciais)

1. **Funil completo** — visita catálogo → lead → sinal pago → vendido (barra com gargalo destacado)
2. **Sinais pagos vs recusados** — donut 30d
3. **Top imóveis por engajamento** (score = views\*1 + leads\*5 + reservas\*20) e estagnados (sem interação >30d)
4. **Ticket médio** (preço dos imóveis com sinal pago, último 30d)
5. **DOM — Tempo médio em catálogo** (createdAt → primeira reserva ATIVA)
6. **Taxa de conversão** (sinais pagos / leads)
7. **Reservas ativas vs expiradas** (últimos 30d)
8. **Receita prevista** (precoSnapshot de reservas ATIVAS+APROVADAS) + receita confirmada (CONVERTIDA)
9. **Taxa de fechamento** (CONVERTIDA / total APROVADAS)

## Funil 12 etapas (referência teórica, MVP cobre 4)

1. Captação (corretor adquire mandato — offline)
2. Listagem (publicado no catálogo — `Imovel.createdAt`)
3. Visita catálogo (`POST /api/imoveis/:slug/view`, deduplicado por IP+session 30min)
4. Lead (formulário "tenho interesse" — `Lead.createdAt`)
5. Qualificação (offline, V2)
6. Agendamento de visita (offline, V2)
7. Visita real (offline, V2)
8. Proposta (offline, V2)
9. Sinal pago (`Reserva.pagamentoStatus = APROVADO`)
10. Diligência (offline)
11. Escritura (offline — `Reserva.status = CONVERTIDA`)
12. CRI / matrícula final

MVP digital cobre 1, 2, 3, 4, 9, 11. Etapas 5-8 e 10 são offline com corretor.

## Modelo de monetização

**Sinal pra reservar** (não compra direta, não locação por temporada):
- Cliente paga **5% do preço** via MP (configurável 1-5% por imóvel)
- Sinal **trava imóvel por 10 dias corridos** (status RESERVADO)
- Resto da negociação offline com corretor
- Não fechou em 10 dias → reserva expira, imóvel volta DISPONIVEL, sinal devolvido em 5 dias úteis (arras confirmatórias)

**Why 5%/10d:** alinhado com prática BR (QuintoAndar style + arras). 2%/7d (default antigo testado) é fraco — mostra falta de seriedade do cliente.

## Conteúdo (estratégia "fake mas coerente")

- Fotos: Unsplash CC0 alta resolução (4-6 por imóvel, mesma propriedade)
- Descrições: editoriais 80-150 palavras, refinadas, sem clichê IA, sem travessão
- Endereços: logradouro fictício plausível + lat/lng em parques/reservas (Parque do Carmo, Villa-Lobos, Ibirapuera mata, Parque do Estado) — Google Maps embed mostra mata sem expor endereço real
- Contato: WhatsApp `+55 11 90000-0000` (fake), Instagram genérico, email `contato@marquesa.dev`
- CRECI placeholder `12345-J` (substituir antes de prod real)

## Páginas obrigatórias

- `/` home com hero + 6 destaques + CTA contato
- `/imoveis` catálogo com filtros (tipo, bairro, faixa preço, quartos)
- `/imoveis/[slug]` PDP com galeria + Google Maps + descrição + sidebar reserva
- `/sobre` (manifesto editorial)
- `/contato` (com Maps + WhatsApp + Insta)
- `/policies/reserva` (arras CC 417-420 sem ser jurídico-pesado)
- `/policies/privacidade` (LGPD completa)
- `/auth/login` universal (role-based redirect)
- `/auth/register`
- `/auth/forgot-password` + `/auth/reset?token=...`
- `/painel` dashboard
- `/painel/imoveis` CRUD
- `/painel/reservas` (cancelar, converter, extender)
- `/painel/leads`
- `/painel/clientes`
- `/painel/settings`
- `/reservas/[id]` (callback MP pós-pagamento)

## Bloqueadores comuns (lições do projeto Marquesa)

1. **Payload mismatch admin/reservas** — frontend envia `{action}`, backend espera `{status}`. Padronizar canonical OU aceitar ambos
2. **Senha mismatch** entre validação frontend/backend — alinhar em 8 chars sem regex especial (UX moderna)
3. **`/admin/leads` sempre é solicitado pelo painel — não esquecer endpoint
4. **`/admin/dashboard/summary` consolidado** é diferente de `/dashboard/kpis` granular — frontend prefere o consolidado
5. **5%/10d nas decisões e copy + 2%/7d no código** — alinhar em ambos os lados antes do release
6. **`/auth/reset?token=` page falta sempre** — link de reset sem destino quebra fluxo
7. **`/reservas/[id]` callback MP** — back_urls do MP redirecionam pra rota inexistente após pagamento

## Compliance

- **CRECI** no rodapé (placeholder em dev, real em prod)
- **LGPD:** banner de consentimento 3 categorias (essenciais/analytics/marketing) + página `/policies/privacidade` completa + checkbox em formulários
- **Cofeci Resolução 1504/2023:** todo material de imóvel precisa ID/área/tipo/preço — campos obrigatórios no schema
- **ITBI ~3%** mencionar como info pro comprador (não calcular dinâmico)

## Integrações típicas

- Cloudinary (fotos)
- Google Maps Embed (sem API key — usa URL pública)
- MercadoPago Preference API
- GA4 + Meta Pixel (gated por consent)
- Resend (email transacional, opcional MVP)

## Out of scope MVP

- Financiamento simulator (calculadora SAC/Price)
- Lookup IPTU/ITBI dinâmico
- Tour 360° / VR
- CRM avançado (Pipedrive/HubSpot)
- WhatsApp API (link wa.me é suficiente)
- Heatmap de bairros, LTV, CAC por canal
- App mobile

## Referência completa

Projeto exemplar: `projetos/marquesa/` (criado 2026-04-29).
