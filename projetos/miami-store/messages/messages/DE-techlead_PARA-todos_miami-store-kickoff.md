# De: Tech Lead
# Para: Todos os Agentes
# Data: 2026-04-25
# Assunto: KICKOFF — Cliente real definido: Miami Store
# Prioridade: Alta

## Contexto
O projeto deixou de ser um exercício genérico. Cliente real:

- **Nome:** Miami Store
- **Categoria:** Roupas de marca (revenda)
- **Instagram:** https://www.instagram.com/miamii_storee/
- **Público:** Periferia urbana — streetwear, hip-hop/funk, faixa etária ~16–28
- **Diferencial competitivo:** Marca aspiracional + preço acessível + Pix-first

Leia o **`docs/brand-brief.md`** completo antes de qualquer entrega. Lá está a persona, voz, tom, paleta provisória, regras de UX e o que NÃO fazer.

---

## Mudanças importantes no escopo (em relação ao kickoff genérico anterior)

### 1. Mobile virou prioridade #1, não #2
Atualizei os AGENT.md do **Frontend (03)** e **QA (06)** com:
- Lighthouse Mobile ≥ 85 obrigatório por página crítica
- Touch targets ≥ 44x44px
- PR só com screenshot 375px anexado
- Playwright E2E rodando em viewport mobile como padrão
- Veto automático do QA em score Lighthouse < 80

Releiam suas seções "Mobile Standards" / "Mobile Audit" — são novas regras de aceite.

### 2. Pix tem que ser cidadão de primeira classe
Não é só "mais uma opção de pagamento". Fluxo real:
- Pix com **5% de desconto** automático
- Mostrado como **opção padrão** no checkout, antes de cartão
- QR code grande, fácil de escanear no celular
- Webhook do MercadoPago atualiza status em tempo real (Backend)
- Confirmação por WhatsApp do lojista quando pago (Backend)

### 3. WhatsApp e CEP em todas as páginas
- **Botão flutuante WhatsApp** fixo no canto inferior direito (Frontend)
- **CEP no topo** com cálculo de frete sem precisar entrar no produto (Frontend + Backend)

### 4. Sem login pra navegar
Catálogo, preço, frete, checkout até a tela de pagamento — tudo acessível sem cadastro. Cadastro só na hora de finalizar a compra.

### 5. Auth tem DUAS roles distintas — separação obrigatória

| Role | Quem é | Onde loga | Para onde vai |
|---|---|---|---|
| `CUSTOMER` | Cliente final que compra na loja | `/auth/login` (loja, em `src/frontend/`) | Home `/`, área `/account` |
| `ADMIN` | Lojista (dono da Miami Store) | `/admin/login` (painel, em `src/dashboard/`) | Painel `/admin` (dashboard de KPIs + gestão) |

**Regras de implementação (Backend):**
- `User.role` é enum `CUSTOMER | ADMIN` no schema Prisma
- Cadastro público (`POST /api/auth/register`) sempre cria `CUSTOMER` — **nunca aceita `role` no body**
- ADMIN só é criado via seed/script ou por outro ADMIN existente (`POST /api/admin/users` requer role ADMIN)
- Middleware `requireRole('ADMIN')` em **todos** os endpoints `/api/admin/*`
- JWT carrega `{ userId, role }` — frontend usa pra decidir redirect

**Regras de implementação (Frontend / Dashboard):**
- Após login: customer → `router.push('/')`, admin → `router.push('/admin')`
- Loja (`src/frontend/`) e Painel (`src/dashboard/`) são **apps Next.js separados**, rodando em portas/paths distintos (Nginx roteia: `/admin` → dashboard:3002, `/` → frontend:3000). Isso isola completamente o código e reduz superfície de ataque.
- Painel tem `middleware.ts` que redireciona pra `/admin/login` se não houver token ADMIN válido

**Cobertura do QA:**
- Tentar acessar `/admin` como customer → deve bloquear (redirect ou 403)
- Tentar chamar `POST /api/admin/products` com token de customer → deve retornar 403
- Tentar elevar privilégio mandando `role: "ADMIN"` no body de `/api/auth/register` → deve ignorar e criar como CUSTOMER
- IDOR: customer A tentando ver pedido do customer B → 403

**Análise futura:**
- Data Analyst valida o painel ADMIN (KPIs, queries dos endpoints `/api/dashboard/*`)
- QA valida segurança da separação de roles (cobertura E2E + testes de API)
- DevOps configura Nginx pra rotear `/admin` separado da loja

---

## Ordem de execução (atualizada)

### Sprint 1 — Fundação visual + base técnica (em paralelo)

**Designer (Agente 02) — DESBLOQUEADOR**
- Acessar Instagram @miamii_storee e capturar paleta, tipografia, estilo de fotos
- Atualizar `docs/brand-brief.md` substituindo seções `[A CONFIRMAR]`
- Entregar `docs/design/design-system.md` com tokens REAIS da marca (não os provisórios do brief)
- Entregar wireframes priorizando mobile 375px primeiro

**Backend (Agente 01) — EM PARALELO**
- Criar schema Prisma com as categorias do brief (Camisetas, Calças, Bermudas, etc.)
- Schema deve ter variação de **tamanho** + **cor** com swatch
- Schema deve ter campo `tabela_medidas` por produto
- Endpoint de cálculo de frete por CEP (ViaCEP + tabela própria)
- Decidir: gateway de Pix vai ser MercadoPago ou Pix direto via banco? Documentar a escolha

**DevOps (Agente 05) — EM PARALELO**
- Subir `docker-compose.yml` funcional
- Configurar Nginx com cache agressivo de imagens (público mobile = banda fraca)
- Configurar HTTPS de dev (mkcert) — checkout não funciona sem HTTPS no MercadoPago

### Sprint 2 — Loja vendável (MVP)

**Frontend (Agente 03)**
- Home com banner Pix + categorias em destaque
- Listagem com filtro por categoria/tamanho/preço
- Página do produto: galeria, variações, tabela de medidas, frete inline, botão "Comprar"
- Carrinho com cálculo de frete
- Checkout em 1 página com Pix em destaque

**Data Analyst (Agente 04)**
- Validar com Backend: query de top produtos vendidos
- Aprovar dashboard MVP: receita 30d, ticket médio, abandono de carrinho, top 10 produtos
- Definir KPI de **conversão Pix vs Cartão** (importante pra esse público)

### Sprint 3 — Confiança e qualidade

**QA (Agente 06)**
- Testes E2E mobile-first do fluxo crítico
- Lighthouse audit em cada página crítica (Mobile + Desktop)
- Edge cases de pagamento Pix (timeout, webhook duplicado)
- Teste em celular real (não só DevTools)

**Designer (Agente 02) — segunda passada**
- Microinterações (animação ao adicionar carrinho, transição de carrossel)
- Loading skeletons fiéis ao layout final
- Estados vazios (carrinho vazio, sem resultado de busca)

---

## Bloqueios conhecidos

### 1. Não temos as fotos reais do catálogo ainda
O Tech Lead vai documentar opções de extração das fotos do Instagram em `docs/instagram-photo-extraction.md`. Enquanto isso, o Frontend pode usar **placeholders com proporção 1:1.3** e o Designer pode definir o estilo visual.

### 2. Não temos info financeira real
- CNPJ do cliente
- Conta MercadoPago (precisa do `ACCESS_TOKEN`)
- Tabela de frete praticada
- CEP de origem (de onde vai ser enviado)
- WhatsApp oficial da loja

DevOps: documente em `.env.example` quais variáveis o cliente precisa fornecer antes de subir prod.

---

## Próximo passo esperado de cada agente
1. Confirme que leu este documento criando: `shared/messages/CONFIRMACAO-{seu-id}_miami-store.md`
2. Liste no próprio arquivo de confirmação as **dúvidas que tem antes de começar** sua sprint
3. Tech Lead vai responder uma a uma e desbloquear

**Não comece a codar sem ler o `brand-brief.md` inteiro.** Senão você vai construir uma loja genérica e o cliente não vai reconhecer a marca dele.
