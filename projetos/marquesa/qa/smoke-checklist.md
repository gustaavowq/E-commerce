# Smoke checklist Marquesa — pra Gustavo executar localmente

**De:** QA · **Para:** Gustavo
**Pré-requisito:** ler `qa/security-audit.md`, `qa/bug-bash-ux.md`, `qa/cross-references.md` antes de seguir. **Há 7 BLOQUEADORES críticos** documentados — alguns travam o smoke (item 1, 3, 4 do bug-bash). Idealmente fix antes de smoke.

---

## 0. Pré-condição — subir o ambiente

```bash
# 0.1 Subir Postgres dev
cd projetos/marquesa/infra
docker compose up -d
docker compose ps         # deve mostrar marquesa-db-dev (healthy)
```

- [ ] `docker compose ps` mostra `marquesa-db-dev` em estado `(healthy)`

```bash
# 0.2 Backend
cd ../backend
cp .env.example .env
# IMPORTANTE: editar .env e trocar DATABASE_URL pra usar porta 5433 (compose dev expõe 5433):
#   DATABASE_URL="postgresql://marquesa:dev@localhost:5433/marquesa?schema=public"
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

- [ ] migrate criou tabelas (sem erro)
- [ ] seed criou: settings + users + 20 imóveis (do `assets/catalogo.json`)
- [ ] **anotar credenciais que aparecem no console**:
  - ADMIN: `admin@marquesa.dev` + senha gerada (16 chars com `!aA1` no fim)
  - CLIENTE: `cliente@marquesa.dev` + senha idem

```bash
# 0.3 Backend dev server
npm run dev               # tem que escutar em :8211
```

- [ ] log mostra `Marquesa Backend rodando em :8211 (development)`
- [ ] `curl http://localhost:8211/healthz` retorna `{"success":true,"data":{"status":"ok",...}}`
- [ ] `curl http://localhost:8211/api/imoveis` retorna lista com 20 items

```bash
# 0.4 Frontend
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
```

- [ ] log Next mostra `http://localhost:3000`
- [ ] sem erros TypeScript no boot
- [ ] abrir `http://localhost:3000` no Chrome — home renderiza

---

## 1. Loja pública (anônimo, sem cookie)

### Home `/`
- [ ] Hero renderiza com foto Unsplash, título serifa "Imóveis com curadoria.", 2 CTAs
- [ ] CTA "Ver catálogo" leva pra `/imoveis/[slug-do-destaque]` (ou `/imoveis` se sem destaque)
- [ ] CTA "Conheça a Marquesa" leva pra `/sobre`
- [ ] DevTools Console: ZERO erros, ZERO CSP violations
- [ ] Scroll devagar pra baixo: cards de "Em destaque" aparecem com fade+up sóbrio (700ms)
- [ ] Click num card → vai pra `/imoveis/[slug]` correto
- [ ] Section "Sobre Marquesa" renderiza com bg `paper-warm`
- [ ] Section "Vamos conversar" renderiza com CTA "Falar com a Marquesa" → `/contato`

### Catálogo `/imoveis`
- [ ] Header "Catálogo" + contador de resultados (tnum)
- [ ] FiltersBar sticky no topo com 5 selects (tipo/bairro/precoMin/precoMax/quartos) + ordenar + Aplicar/Limpar
- [ ] Filtro `tipo=APARTAMENTO`: lista atualiza só com APARTAMENTO
- [ ] Filtro `precoMin=2000000`: lista atualiza, sem imóveis abaixo de 2M
- [ ] Filtro `quartosMin=3`: lista atualiza
- [ ] Botão "Aplicar" sobe URL com query
- [ ] Botão "Limpar filtros" volta pra `/imoveis` raw
- [ ] Ordenar: "Maior preço" → primeiro card é o mais caro. **NOTA**: ordenar "Mais recentes" pode silenciosamente cair no default backend (item 5 bug-bash) — use Maior preço pra validar funcionamento.
- [ ] Pagination aparece se total > 12 (depende dos seed)
- [ ] DevTools Network: chamadas `/api/imoveis` retornam 200, body `success: true, data: [], meta`

### PDP `/imoveis/[slug]` — abrir um imóvel DISPONIVEL
- [ ] Header com bairro · cidade (eyebrow) + título grande serifa
- [ ] Galeria: thumbnails à esquerda em desktop, foto principal grande
- [ ] Click na foto principal: lightbox abre full-screen com fundo escuro
- [ ] Setas ‹ ›, Esc fecha, ArrowRight/Left navegam fotos. Click fora fecha.
- [ ] Sidebar de preço: valor formatado BRL, sinal sugerido (com tnum)
- [ ] Stats de quartos/banheiros/vagas/área renderizam
- [ ] Botão "Reservar com sinal" (botão grande)
- [ ] Botão "Tenho interesse" (secundário)
- [ ] Texto "Após o sinal pago... 10 dias corridos." renderiza (verifica que microcopy bate com decisão real — item 7 bug-bash)
- [ ] Section "Sobre o imóvel" + descrição preserva quebras de linha (`whitespace-pre-line`)
- [ ] Section "Ficha técnica" lista todos os campos com valores
- [ ] Section "Comodidades" se imóvel tem amenidades
- [ ] Section "Localização" com mapa Google embed renderiza (NÃO erro de X-Frame). NOTA: ad-blockers tipo uBlock podem bloquear o iframe Google.
- [ ] Section "Outros imóveis selecionados" mostra 2-3 similares
- [ ] DevTools: requisição POST `/api/imoveis/[slug]/view` dispara 1 vez (ViewTracker), retorna 204
- [ ] Refresh da página: 2ª chamada de view retorna 204 também (rate-limited 30min, não duplicou no DB)
- [ ] DevTools: tag `<script type="application/ld+json">` com schema.org RealEstateListing presente

### `/sobre`, `/contato`, `/policies/reserva`, `/policies/privacidade`
- [ ] Cada uma renderiza sem 500 ou erro Next
- [ ] Footer aparece em todas

### Footer
- [ ] CRECI placeholder visível ("CRECI/SP 12345-J. Marquesa Imóveis Ltda.")
- [ ] Links de policies levam às páginas corretas
- [ ] NewsletterCapture: digitar email + aceitar consent + clicar "Quero receber" → sucesso. **NOTA**: cria Lead órfão atrelado ao destaque (item 9 bug-bash).
- [ ] Copyright "© 2026 Marquesa Imóveis."

### Cookie consent
- [ ] Após ~600ms do load da home pela 1ª vez, banner cookies aparece embaixo
- [ ] Click "Aceitar todos" → some, persiste em localStorage `marquesa-cookie-consent`
- [ ] Refresh: banner não reaparece
- [ ] Limpar localStorage `marquesa-cookie-consent` + refresh: banner volta
- [ ] Click "Configurar": expande com 3 toggles (essenciais sempre on, analytics, marketing)
- [ ] Click "Apenas essenciais": some, salva analytics=false
- [ ] Se `NEXT_PUBLIC_GA4_ID` não setado: scripts GA NÃO são adicionados (fonte = `<head>` em DevTools)

---

## 2. Auth

### Registro `/auth/register`
- [ ] Form com nome, email, telefone(opc), senha, confirmar
- [ ] Senha < 8 chars: erro "8 caracteres" (microcopy)
- [ ] **CONHECIDO**: senha 8 chars com letras+numeros (ex: `senha1234`) é aceita pelo client mas backend rejeita 422 (item 2 bug-bash). Pra teste real, use senha de 12+ chars com `Marquesa@2026!` ou similar.
- [ ] Submeter com senha forte e dados válidos: cria conta + redireciona pra `/`
- [ ] DevTools: cookie `access_token` httpOnly + `refresh_token` httpOnly setados

### Login `/auth/login`
- [ ] Login com `cliente@marquesa.dev` + senha do seed: redireciona pra `/`
- [ ] Header agora mostra "Sair" no lugar de "Entrar"
- [ ] `/auth/login?redirect=/painel`: tenta login com cliente — redireciona pra `/painel`, mas RoleGate detecta role=USER e empurra de volta pra `/`. Smoke: validar visualmente.
- [ ] Login admin (`admin@marquesa.dev`): redireciona pra `/painel`
- [ ] Login com senha errada 6 vezes em 1 minuto: 6ª tentativa retorna 429 RATE_LIMITED
- [ ] Logout (Header → Sair): cookies limpam, volta pra `/`

### Forgot password
- [ ] Submeter email cadastrado: mensagem "Se houver conta com este email…"
- [ ] Submeter email NÃO cadastrado: mesma mensagem (anti-enumeração)
- [ ] DevTools/console backend: log `[dev] reset url` aparece com URL `${origin}/auth/reset?token=...`
- [ ] **CONHECIDO**: page `/auth/reset` NÃO existe no frontend (item Cross-references). Click no link → 404.

---

## 3. Painel ADMIN (`admin@marquesa.dev` logado)

### `/painel` Dashboard
- [ ] Sidebar escura à esquerda (Marquesa | Painel | links)
- [ ] **CONHECIDO**: cards renderizam com 0/-/0 ou similar, porque `/api/admin/dashboard/summary` não existe (item 4 bug-bash). Fallback `/kpis` retorna shape errado.
- [ ] Sem console errors graves (a query falha silenciosa cai no catch).

### `/painel/imoveis`
- [ ] Tabela com 20 imóveis seedados, status colorido
- [ ] Filtro status=DISPONIVEL: lista atualiza
- [ ] Search "Itaim": filtra por bairro
- [ ] Click "Novo imóvel": abre `/painel/imoveis/novo`

### `/painel/imoveis/novo`
- [ ] Form completo (sections: Principais, Preço, Características, Endereço, Mídia, Custos, Flags)
- [ ] Submeter form vazio: mostra erros de validação Zod inline
- [ ] Preencher campos obrigatórios (titulo, descrição 20+ chars, preco, area, quartos, banheiros, endereço, bairro, cidade, estado UF 2-char, cep, latitude, longitude, fotos URL) + submit:
  - [ ] Cria imóvel
  - [ ] Redireciona pra `/painel/imoveis/[id]`

### `/painel/imoveis/[id]` editar
- [ ] Form pré-populado com dados do imóvel
- [ ] Mudar `status` pra `VENDIDO` + Salvar: persiste, refresh mostra status atualizado
- [ ] Botão "Excluir imóvel": confirm dialog → cliica OK → soft-delete (status=INATIVO), redireciona pra `/painel/imoveis`. PDP pública desse slug agora retorna 404.

### `/painel/reservas`
- [ ] Tabela vazia inicialmente ("Nenhuma reserva encontrada.")
- [ ] **CONHECIDO**: ações Estender/Marcar vendido/Cancelar enviam payload errado (item 1 bug-bash). Quando criar reserva no fluxo 4 abaixo, voltar e tentar — vai dar erro silencioso 422.

### `/painel/leads`
- [ ] **CONHECIDO**: tabela sempre vazia (item 3 bug-bash). Aguardar fix.

### `/painel/clientes`
- [ ] Lista com `cliente@marquesa.dev` (ADMIN não aparece, filtro role=USER no backend)
- [ ] Click em cliente: rota não existe (`/painel/clientes/[id]` não foi feita). Apenas tabela.

### `/painel/settings`
- [ ] Renderiza com cartão "Conta" (nome/email/role)
- [ ] Cartão "Configurações da loja" placeholder

### Voltar à loja
- [ ] Botão "← Voltar à loja" no rodapé da sidebar volta pra `/`

---

## 4. Reserva — fluxo cliente (`cliente@marquesa.dev` logado)

- [ ] Logout do admin, login como cliente
- [ ] Abrir PDP de um imóvel DISPONIVEL
- [ ] Click "Reservar com sinal"
- [ ] Modal abre: valor do imóvel, valor do sinal (verificar se bate com 2% ou 5% — item 6 bug-bash), prazo "10 dias corridos" (vs backend 7 dias — item 7)
- [ ] Aceitar termos + clicar "Pagar sinal e reservar"
- [ ] Sem MERCADOPAGO_ACCESS_TOKEN configurado em `.env`: backend cai em mock, retorna `initPoint = ${PUBLIC_WEB_URL}/reservas/${reservaId}/pagar?mock=1`
- [ ] **CONHECIDO**: `/reservas/[id]` page NÃO existe no frontend. Vai 404.
- [ ] DevTools verificar: backend salvou Reserva com `status=ATIVA, pagamentoStatus=PENDENTE`
- [ ] Sem webhook real chegando, reserva fica PENDENTE indefinidamente. Pra simular APROVADO em DB direto:
  ```bash
  npx prisma studio
  # editar Reserva: pagamentoStatus=APROVADO, status=ATIVA, paidAt=now, expiraEm=now+7d
  # editar Imovel: status=RESERVADO
  ```
- [ ] Recarregar PDP: botão "Reservar" agora mostra "Indisponível para reserva" (status != DISPONIVEL)
- [ ] Painel admin → Reservas: a reserva aparece na tabela

---

## 5. Multi-PC / cross-browser

Lição 29 (Kore Tech): auth e scroll quebrando em PC diferente.

- [ ] Repetir smoke #1-#3 em **Firefox** (verificar especialmente: cookie httpOnly cross-origin, scroll mouse-roda, ScrollReveal)
- [ ] Mobile DevTools (Chrome iPhone SE 375x667):
  - [ ] Hero não corta texto, CTAs não ficam fora do viewport
  - [ ] Mobile menu (hamburger) abre/fecha
  - [ ] Botões touch ≥ 44px (FiltersBar `py-3` pode estar tight = 24px+content; verifique com Lighthouse)
  - [ ] FiltersBar usável em mobile
  - [ ] Lightbox PDP funciona (swipe nem esperado, mas botões nav e fechar OK)
- [ ] Aba anônima: home loja → register cliente novo → login → reservar imóvel → todo fluxo end-to-end sem cookie pré-existente
- [ ] Logout em uma aba: verifica que outra aba aberta perde acesso ao painel ao tentar navegar (não há broadcast push, só na próxima request)

---

## 6. Performance / Console / Lighthouse

- [ ] DevTools Console na home: ZERO erros 4xx/5xx, ZERO CSP violations, ZERO React warnings (key warnings, etc)
- [ ] DevTools Network: imagens Unsplash carregam (200), nenhuma 403/404. Total transfer < 3MB.
- [ ] Lighthouse (Chrome DevTools, mobile, Public, deslogado):
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90 (sitemap.xml, robots.txt, meta tags presentes)
- [ ] `view-source:` na home tem JSON-LD `RealEstateAgent` no head
- [ ] `view-source:` em PDP tem JSON-LD `RealEstateListing` no head

---

## 7. Stop conditions (NÃO aprovar deploy se algum disparar)

1. Console mostra erro 500 em qualquer rota pública
2. Login não persiste em Firefox (regressão Kore Tech)
3. CSP violation aparece no Console
4. Botão Reservar leva pra 404 sem mostrar mensagem do mock
5. Cookies aparecem como "non httpOnly" no Application tab
6. Painel acessível com `cliente@marquesa.dev` logado (RoleGate quebrado)
7. Smoke termina e dashboard nunca mostra valores reais (mesmo com seed)
