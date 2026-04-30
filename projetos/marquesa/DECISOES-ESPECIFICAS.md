# Decisões específicas — Marquesa

Pré-aprovações que não saem do framework default — só o que é único deste projeto.

## Identidade

- **Nome:** Marquesa
- **Subdomínio:** `marquesa.gustavo.agenciaever.cloud`
- **Tom:** boutique italiano, sofisticado, alto-padrão sem ostentação
- **Posicionamento:** imobiliária com curadoria, foco em apartamentos/casas/coberturas em SP/RJ alto padrão

## Modelo de negócio

- **Sinal pra reservar imóvel** (não é compra direta nem aluguel temporada)
- Cliente paga **5% do preço** via MP (Pix preferencial, cartão como fallback) — **default; configurável por imóvel** entre 1-5%
- Sinal **trava o imóvel por 10 dias corridos** (status muda pra "RESERVADO") — alinhado com prática de mercado BR (arras confirmatórias)
- Resto da negociação acontece offline com corretor humano (fora do escopo digital)
- Se não fechar: sinal devolvido em até 5 dias úteis (regra padrão no Brasil)
- Texto institucional precisa explicar **arras** (lei brasileira do sinal) sem ser jurídico-pesado

## Status de imóvel (estados possíveis)

```
DISPONIVEL     → catálogo, recebe interessados
RESERVADO      → sinal pago, 7 dias bloqueado pra outros
EM_NEGOCIACAO  → após reserva expirar com cliente ainda interessado
VENDIDO        → contrato assinado, off-line confirmado
INATIVO        → corretor tirou do ar (em revisão)
```

## Conteúdo

- **Fotos:** Unsplash + outras fontes web (CC0 ou royalty-free), NÃO usar fotos com marca d'água ou licença comercial restrita
- **Descrições:** inventadas, mas coerentes com a foto (não dizer "vista mar" se foto mostra apartamento urbano)
- **Endereço fake:** logradouro fictício mas plausível, coordenadas Google Maps em **área de mata** (parques, reservas, áreas verdes longe de endereço real)
  - Ex: lat/lng dentro do Parque do Carmo, Jardim Botânico, Serra da Cantareira
- **Contato:**
  - WhatsApp: `+55 11 90000-0000` (número fake que não bate com nada real)
  - Instagram: `https://instagram.com/` (link genérico pra home, não perfil específico)
  - Email: `contato@marquesa.dev` (placeholder, não precisa ter SMTP de verdade — formulário envia pra log)

## Auth & Roles

3 roles:
- `USER` — cliente comprador, redirect pra `/`
- `ADMIN` — corretor/dono, redirect pra `/painel`, vê tudo
- `ANALYST` — analista de dados, redirect pra `/painel/dashboard`, somente leitura

JWT no cookie httpOnly. Middleware Next.js detecta role e redireciona.

**2 contas seed** entregues ao Gustavo:
- ADM: `admin@marquesa.dev` (senha gerada e mostrada no console na 1ª `npx prisma db seed`)
- Cliente: `cliente@marquesa.dev` (idem)

## Painel ADM (escopo)

Adaptado pra imobiliária — não copiar painel de e-commerce de produto físico:

- **Dashboard** (analista): KPIs reais — visitas, leads, sinais pagos, ticket médio, conversão
- **Imóveis** (CRUD): tabela com status colorido, filtros, edit em modal/sheet, upload múltiplo de fotos
- **Reservas** (read+actions): lista de sinais ativos, expira-em, ação "marcar como vendido / liberar / extender"
- **Clientes** (read): cadastros que pagaram sinal, histórico
- **Configurações:** pixel, MP token, email do corretor pra notificações, % padrão de sinal

## Critérios de qualidade ("Apple/Linear")

Refinado pela pesquisa de nicho (`PESQUISA-NICHO.md`):

- **Paleta:** monocromático preto / off-white (#FAFAF7) / grafite + 1 acento verde-musgo (#4A5D4F). Aurea sóbria; sem brilho dourado vulgar
- **Tipografia:** **Canela** (display, hero, títulos) ou **Cormorant Garamond** (alternativa free) + **Inter** ou **Söhne** (body/UI). Numerais tabulares (`font-feature-settings: 'tnum'`) em preços
- **Animação:** scroll-reveal sóbrio via IntersectionObserver — `opacity 0 → 1` + `translateY 32px → 0`, easing `cubic-bezier(0.16, 1, 0.3, 1)`, duração 700ms, **run-once** (não anima de novo ao scroll up)
- **Hero:** foto grande de imóvel destaque + título serifado + 1 CTA — sem vídeo pesado, sem parallax global
- **Galeria PDP:** lightbox sóbrio com transições de 200-300ms; thumbnails verticais lateral em desktop
- **Espaço respirável:** padding generoso (`py-24` em sections desktop), cards padronizados, hover discreto (200ms fade)
- **Refs visuais:** Compass (EUA), Lionard (IT), Quintela+Penalva (PT), Bossa Nova Sotheby's (BR)

### Vedados (regras absolutas)
- ❌ Cursor glow seguindo viewport
- ❌ Scroll-jacking (controle do scroll roubado do user)
- ❌ Parallax global pesado
- ❌ `scroll-behavior: smooth` em html/body (mata mouse de roda) — só em containers específicos via lib
- ❌ Botão sem onClick, hover sobrepondo, X de fechar quebrado, dead links
- ❌ Saturação de cores; Marquesa é "old money", não "startup tech"

## Compliance (LGPD + CRECI)

- **CRECI:** rodapé precisa exibir CRECI fictício (ex: "CRECI/SP 12345-J — Marquesa Imóveis Ltda."). Em produção real, número precisa ser real. Aqui é placeholder
- **LGPD:** popup de cookies + página `/policies/privacy` + checkbox de consentimento explícito em formulários (lead, reserva)
- **Cofeci Resolução 1504/2023:** material de imóvel deve ter ID (matrícula/registro), área, tipo, preço — todos os imóveis no catálogo precisam ter estes campos preenchidos
- **ITBI ~3%:** mencionado em "informações para o comprador" no rodapé das PDPs, sem cálculo dinâmico (out of scope)

## Multi-PC (não repetir bug Kore Tech)

Bug histórico Kore Tech (2026-04-28): auth e scroll quebravam em PC diferente. Causas suspeitas:
- Cookie domain hardcoded no localhost
- `scroll-behavior: smooth` global (incompatível com mouse de roda comum)
- Detecção de feature CSS sem fallback

**Mitigações obrigatórias Marquesa:**
- Cookie sem domain hardcoded; usa `secure: true` em prod
- `scroll-behavior` SÓ em containers específicos com smoothScroll lib (não global no html/body)
- Testar em pelo menos 2 browsers antes de declarar pronto (Chrome + Firefox)
- Smoke test que simula login → catálogo → PDP → sinal-checkout em viewport mobile + desktop

## Deploy

- **VPS:** Ever Growth (Jean), `/opt/gustavo/marquesa/`
- **Containers:**
  - `gustavo-marquesa-web` (Next.js, porta `127.0.0.1:8210`)
  - `gustavo-marquesa-api` (Express, porta `127.0.0.1:8211`)
  - `gustavo-marquesa-db` (Postgres 16, sem porta exposta)
- **Nginx:** proxy_pass de `marquesa.gustavo.agenciaever.cloud` pra `127.0.0.1:8210`; `/api/*` pra `127.0.0.1:8211`
- **SSL:** certbot pra `marquesa.gustavo.agenciaever.cloud`

## Out of scope (desta versão)

- Financiamento simulator
- Lookup de IPTU/ITBI
- CRM de leads (formulário simples + WhatsApp)
- Tour 360° / VR
- Notificação SMS (só email/WhatsApp link)
- App mobile
