# Cross-references — consistência entre agentes

**De:** QA · **Para:** Tech Lead · **Data:** 2026-04-29

---

## Backend ↔ Frontend (endpoints)

| Frontend chama | Backend tem? | Status |
|---|---|---|
| `GET  /api/imoveis?...filtros` | sim (`routes/imoveis.ts:13`) | OK |
| `GET  /api/imoveis/:slug` | sim (`routes/imoveis.ts:76`) | OK |
| `POST /api/imoveis/:slug/view` | sim (`routes/imoveis.ts:100`) | OK |
| `POST /api/auth/login` | sim | OK |
| `POST /api/auth/register` | sim | OK |
| `POST /api/auth/logout` | sim | OK |
| `POST /api/auth/forgot-password` | sim | OK |
| `GET  /api/auth/me` | sim | OK |
| `POST /api/auth/refresh` | sim — frontend NÃO chama (sem rotação no client) | OK (refresh manual via cookie) |
| `POST /api/leads` | sim | OK |
| `POST /api/reservas` | sim | OK |
| `GET  /api/reservas/me` | sim — frontend NÃO chama, mas existe rota `/painel/reservas` que é admin (não cliente) | OK |
| `GET  /api/admin/imoveis?...` | sim | OK |
| `GET  /api/admin/imoveis/:id` | sim | OK |
| `POST /api/admin/imoveis` | sim | OK |
| `PATCH /api/admin/imoveis/:id` | sim | OK |
| `DELETE /api/admin/imoveis/:id` | sim | OK |
| `GET  /api/admin/reservas?...` | sim | OK |
| `PATCH /api/admin/reservas/:id` | sim, **mas payload divergente** | **FALHA** (bug-bash item 1) |
| `GET  /api/admin/clientes?...` | sim | OK |
| `GET  /api/admin/leads?...` | **NÃO existe** | **FALHA** (bug-bash item 3) |
| `GET  /api/admin/dashboard/summary` | **NÃO existe** | **FALHA** (bug-bash item 4) |
| `GET  /api/admin/dashboard/kpis` | sim, mas shape divergente | RISCO (bug-bash item 4) |
| `GET  /api/admin/dashboard/series?metric=...` | sim — frontend NÃO chama | OK |

### Tipos de payload (write/read) — lição 31

- `ImovelWritePayload` (frontend types) e `imovelWriteSchema` (backend zod): bate. OK.
- `ImovelDetail` retorna `Decimal` como string OU number; frontend tipa `string | number` e usa `Number()` na borda — defesa em depth boa.
- `Reserva.imovel.preco`: backend manda Decimal-as-string em alguns casos, frontend `formatBRL` aceita ambos.
- **Action vs Status na PATCH /admin/reservas:** ver bug-bash item 1.

---

## DECISOES-ESPECIFICAS ↔ Implementação

| Decisão | Implementação | Status |
|---|---|---|
| Sinal default 5% configurável 1-5% | env `SINAL_DEFAULT_PERCENT=2`, schema `@default(2)`, microcopy diz 5% hard-coded | **FALHA** (bug-bash 6) |
| Reserva trava 10 dias corridos | `RESERVA_DURACAO_DIAS=7`, microcopy diz 10 hard-coded | **FALHA** (bug-bash 7) |
| Status: DISPONIVEL/RESERVADO/EM_NEGOCIACAO/VENDIDO/INATIVO | `enum ImovelStatus` bate exato | OK |
| 3 roles USER/ADMIN/ANALYST | `enum Role` bate, redirect implementado em useAuth e RoleGate | OK |
| Cookie sem domain hardcoded | `COOKIE_DOMAIN` env optional, default vazio | OK |
| `scroll-behavior smooth` SÓ em containers | globals.css respeita | OK |
| Endereços fakes plausíveis com lat/lng em mata | seed placeholders Itaim Bibi/Pinheiros/Petrópolis com coords aproximadas (precisaria audit do `assets/catalogo.json` real, 20 imóveis) | OK presumido |
| Imóveis seedados com fotos Unsplash | confirmado (placeholder e catalogo.json) | OK |
| CRECI no rodapé | `Footer.tsx` exibe `microcopy.footer.creci = "CRECI/SP 12345-J. Marquesa Imóveis Ltda."` | OK |
| ITBI mencionado em "info pro comprador" | NÃO encontrado no Footer nem PDP | RISCO (compliance Cofeci 1504/2023) |
| Cofeci 1504/2023: matrícula/área/tipo/preço em todo imóvel | schema tem `area, tipo, preco`, mas NÃO há `matricula`/`registro` | RISCO médio |

---

## Brand-brief ↔ Frontend

| Brand-brief | Implementação | Status |
|---|---|---|
| Paleta: paper #FAFAF7, ink, graphite, ash, bone, moss | `globals.css` define todos os tokens. Tailwind importa via `tailwind.config.ts` | OK |
| Cormorant Garamond display + Inter sans | `layout.tsx` carrega via next/font, vars CSS populadas | OK |
| Numerais tabulares em preços | `.tnum` aplicada em prices em ImovelCard, PDP, KpiCard | OK |
| Hero 80vh com foto + título serifado + 1-2 CTAs | `Hero.tsx` h-[80vh]/85vh, font-display, 2 CTAs (primário+secundário) | OK |
| Cards padronizados (sem cantos arredondados) | `ImovelCard.tsx` sem `rounded-*` no card outer; só badge "Destaque" tem `rounded-md` (cosmético) | OK presumido |
| Hover discreto 200ms fade | `transition-colors duration-fast` em CTAs e nav | OK |
| Espaço respirável `py-24` em desktop | home, about, contato, PDP, similares — todos `py-24` | OK |
| ScrollReveal sóbrio (0→1, 32px→0, 700ms, run-once, reduced-motion) | `ScrollReveal.tsx` matches spec | OK |

---

## Microcopy ↔ Frontend (chaves usadas)

Verifiquei amostragem de chaves.

| Chave | Componente que usa | Existe? |
|---|---|---|
| `navbar.imoveis/sobre/contato/entrar/sair/painel` | Header | OK |
| `hero.titulo/subtitulo/cta_primario/cta_secundario` | Hero | OK |
| `home.secao_destaques/secao_destaques_subtitulo` | (loja)/page.tsx | OK |
| `pdp.voltar_catalogo/sobre_imovel/ficha_tecnica/area_util/quartos/.../reservar_sinal/tenho_interesse` | (loja)/imoveis/[slug] + ImovelActions | OK |
| `checkout_sinal.titulo/explicacao/valor_imovel/valor_label/prazo_label/prazo_valor/termos/voltar/avancar` | ReservaCheckout | OK |
| `lead.titulo/subtitulo/nome/email/telefone/mensagem/.../enviar/sucesso_titulo/sucesso_descricao` | LeadForm + ImovelActions | OK |
| `auth.login_titulo/login_subtitulo/email/senha/entrar/esqueci/criar_conta/ja_tem_conta/ainda_nao_tem_conta` | LoginForm | OK |
| `auth.registro_titulo/registro_subtitulo` | RegisterForm | OK |
| `auth.esqueci_titulo/esqueci_subtitulo/esqueci_enviar/esqueci_sucesso` | forgot-password/page.tsx | OK |
| `erros.email_invalido/credenciais/senha_curta/senha_diferente/rede` | LoginForm/RegisterForm/forgot-password | OK |
| `validacoes.obrigatorio/termos_aceitar` | LoginForm + ReservaCheckout | OK |
| `painel.nav_dashboard/nav_imoveis/nav_reservas/nav_clientes/nav_leads/nav_settings/voltar_loja` | PainelSidebar | OK |
| `cookies.titulo/texto/aceitar/recusar/saiba_mais` | CookieConsent | OK |
| `footer.sobre/imoveis/contato/politicas/politica_reserva/politica_privacidade/creci/endereco/copyright/newsletter_*` | Footer + NewsletterCapture | OK |
| `filtros.tipo*/bairro/preco_min/preco_max/quartos*/ordenar*/aplicar/limpar` | FiltersBar | OK |
| `catalogo.titulo/resultado_singular/resultado_plural` | (loja)/imoveis/page.tsx | OK |

**Hardcoded strings achadas:**
- `ImovelActions.tsx:24` "Indisponível para reserva" — não tá em microcopy.
- `ImovelActions.tsx:33-34` "Após o sinal pago, o imóvel é retirado do catálogo e o corretor responsável conduz a negociação por **10 dias corridos**." — número 10 hard, alinhar com decisão final do prazo.
- `(loja)/page.tsx:131-135` Sobre block todo hard-coded.
- `(loja)/imoveis/[slug]/page.tsx:246` "Comodidades" hard-coded (não em microcopy).
- `Hero.tsx:13` "CURADORIA · 2026" como prop default — aceitável (eyebrow data-aware).
- Painel: vários `<h1>` "Dashboard", "Imóveis", "Reservas", "Leads", "Clientes", "Configurações", botões "Novo imóvel", "Buscar por nome ou email…", "Excluir este imóvel?". Nada quebra mas Copywriter poderia centralizar.

**Microcopy órfã (existe no JSON mas não usada):**
- `auth.ou_continuar_com`, `auth.google` — sem implementação Google login.
- `auth.lembrar` — checkbox "Manter conectado" não existe no form.
- `auth.redefinir_titulo/redefinir_enviar` — página `/auth/reset` referenciada em buildResetUrl (`auth.ts:264`) mas NÃO existe no frontend (`/auth/reset/page.tsx` ausente). **RISCO MÉDIO** — link de reset que vier por email vai dar 404.
- `card.preco_sob_consulta`, `card.novo`, `card.ver_detalhes` — só `destaque` é usado.
- `pdp.compartilhar/favoritar/agendar_visita/corretor_responsavel/matricula/ano_construcao` — ações não implementadas.
- `agendar.*` — fluxo de agendar visita não existe.
- `minha_conta.*` — página `/minha-conta` não existe (só `/painel/*` admin).
- `compartilhar.*` — botão compartilhar não existe.
- `painel.reserva_estender/reserva_marcar_vendido/reserva_liberar/reserva_estornar` — botões usam strings hard-coded ("Estender", "Marcar vendido", "Cancelar") em vez dessas chaves.
- `kpis.*` — KPIs no Dashboard usam strings hard-coded ("Visitas no catálogo", "Leads recebidos", etc).

**Recomendação:** Copywriter pode podar ou Frontend pode wirar. Não bloqueia.

---

## /auth/reset ausente — bloq de reset password

Backend gera link `${origin}/auth/reset?token=...` (`auth.ts:264`). Frontend NÃO tem página em `/auth/reset/page.tsx`. Se o cliente realmente clicar no link (no MVP, link é só logado em dev), 404. **Adicionar à lista de gaps**.

---

## Catalogo.json (Copywriter)

- 20 slugs detectados em `assets/catalogo.json` (matches a meta de 20-30 imóveis).
- Validação técnica do conteúdo (coords em mata, descrições coerentes com fotos) fica fora do escopo deste audit estático — Copywriter responsável.
- Seed `prisma/seed.ts:193-209` carrega `assets/catalogo.json` se existir, idempotente via slug. OK.

---

## Gaps de implementação (não declarados como out-of-scope mas faltando)

1. `GET /api/admin/leads` (frontend chama)
2. `GET /api/admin/dashboard/summary` (frontend chama)
3. PATCH `/api/admin/leads/:id` (marcar contatado — schema tem campos)
4. `/auth/reset?token=...` page (backend gera link)
5. `/reservas/[id]` page (back_urls do MP redirecionam pra `${webBase}/reservas/${id}?status=...` — não existe rota Next pra essa)
6. ITBI no rodapé das PDPs (DECISOES diz "menciona em informações pro comprador")
7. Campo `matricula`/`registro` no Imovel schema (Cofeci 1504/2023)
