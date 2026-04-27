# Smoke E2E — Kore Tech

> Roteiro de **smoke test end-to-end** do happy path. Não cobre edge cases (esses estão em `EDGE-CASES.md`).
> **Quando executar:** após Sprint 2 (integração), antes do Sprint 3 (security audit). Re-executar após cada fix de release.
> **Critério geral de aprovação:** 14/14 passos verdes. Qualquer falha = REPROVAR e abrir bug com `arquivo:linha`.

## Pré-requisitos

- Backend rodando em `api.kore.test:4001` (ou `localhost:4001`)
- Frontend (loja) rodando em `loja.kore.test:3001` (ou `localhost:3001`)
- Dashboard (admin) rodando em `admin.kore.test:3002` (ou `localhost:3002`)
- Postgres rodando em `localhost:5433` com seed completo:
  - 8 personas, ~30 componentes, 8 PCs montados, 5 monitores, 5 periféricos
  - 1 admin (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`)
  - Cupons MVP populados: `BEMVINDO5`, `PIXFIRST`, `BUILDER10`, `COMBO15`, `FRETE15`
- Browser limpo (modo anônimo, sem cookies)
- DevTools aberto na aba Console + Network (qualquer erro vermelho = falha)

## Credenciais de teste

| Tipo | Email | Senha | Origem |
|---|---|---|---|
| Admin | `admin@kore.test` | `<env SEED_ADMIN_PASSWORD>` | Seed |
| Cliente novo | `cliente.smoke+<timestamp>@kore.test` | `Senha@123` | Criado no passo 11 |

---

## Passos numerados (14 obrigatórios)

### 1. Acessar home — verificar estrutura básica

**Ação:** abrir `https://loja.kore.test` em browser limpo.

**Validar:**
- [ ] `<title>` contém "Kore Tech"
- [ ] Hero principal carrega com headline ("Monte certo. Jogue alto." ou variante do Copywriter) + CTA primário visível
- [ ] Seção "4 personas em destaque" carrega 4 cards (não menos, não mais) — cada um com imagem, nome, headline, link
- [ ] Cada card de persona tem `<a href="/builds/[slug]">` válido (sem `#`, sem `null`)
- [ ] USPs visíveis (parcelamento 12x, lista de espera, builder)
- [ ] Footer com PaymentBadges, redes, política, contato
- [ ] DevTools console: zero erros (CSP, 404, CORS)
- [ ] DevTools network: zero requests vermelhas

**Critério passa:** todos os checkboxes acima.

---

### 2. Click em persona → landing dedicada

**Ação:** clicar no primeiro card de persona em destaque (esperado: Valorant 240fps).

**Validar:**
- [ ] URL muda pra `/builds/valorant-240fps` (ou slug equivalente)
- [ ] Hero específico da persona com H1 contendo nome do uso
- [ ] Subheadline + 3 bullets de benefício
- [ ] **3 builds prontos** listados (não 2, não 4)
- [ ] Cada build mostra: imagem, nome, **FPS estimado** em pelo menos 1 jogo (badge JetBrains Mono), preço total, parcelamento
- [ ] CTA "Monte o seu" visível e linkando pra `/montar?persona=valorant-240fps`
- [ ] JSON-LD `Product` no `<head>` (verificar via View Source)

**Critério passa:** todos os checkboxes.

---

### 3. Click em PC montado → PDP completa

**Ação:** clicar no primeiro build pronto da landing.

**Validar:**
- [ ] URL muda pra `/pcs/[slug]`
- [ ] Galeria de imagens carrega (sem `placehold.co` externo, sem fallback `from-surface-2` se houver foto)
- [ ] Lista de peças do build (CPU, mobo, RAM, GPU, storage, PSU, gabinete, cooler) — cada uma legível
- [ ] **FPS badges visíveis em cards** — pelo menos 3 jogos (Valorant, CS2, Fortnite por exemplo) com FPS em JetBrains Mono
- [ ] **Parcelamento em destaque** — "12x R$ XXX,XX" antes do preço total (regra de hardware: parcelamento vende)
- [ ] Botão "Adicionar ao carrinho" ativo (não dead, com onClick)
- [ ] Cross-sell de periféricos visível abaixo
- [ ] Specs estruturadas (SpecsTable) renderizadas

**Critério passa:** todos.

---

### 4. Adicionar PC ao carrinho

**Ação:** clicar "Adicionar ao carrinho" no PC montado.

**Validar:**
- [ ] Toast de sucesso aparece ("Adicionado ao carrinho" ou similar) — sem travessão, sem emoji
- [ ] Ícone de carrinho no header atualiza badge pra `1`
- [ ] Mini-cart drawer (se existir) mostra o item correto
- [ ] Não navegou pra fora da PDP (mantém contexto pra cross-sell)

---

### 5. Voltar e adicionar 1 periférico cross-sell

**Ação:** rolar até a seção cross-sell na mesma PDP, clicar em "Adicionar" no primeiro periférico.

**Validar:**
- [ ] Toast aparece, badge do carrinho vai pra `2`
- [ ] Item de cross-sell foi um periférico (não outro PC montado) — coerente com regra de cross-sell

---

### 6. Ir pro carrinho — totais + cupom

**Ação:** clicar no ícone do carrinho, abrir `/cart`.

**Validar:**
- [ ] Lista mostra os 2 itens com nome, foto thumbnail, preço unitário, qty 1
- [ ] Botão `+`/`-`/remover funciona em cada item (touch target ≥ 44px em mobile)
- [ ] Subtotal correto (PC + periférico)
- [ ] Frete calculado (precisa CEP — usar `01310-100` SP)
- [ ] Barra de frete grátis visível (se aplicável: cupom FRETE15 disponível acima de R$ 5.000)
- [ ] Campo de cupom: digitar `BEMVINDO5` → click "Aplicar"
- [ ] Resposta visual imediata: linha "BEMVINDO5 -5%" aparece, total atualiza
- [ ] Total final = subtotal × 0.95 + frete (calcular manualmente, conferir)
- [ ] Cupom inválido (digitar `XXXXX`) retorna mensagem amigável de erro, não trava UI

**Critério passa:** cupom aplicou + total bateu.

---

### 7. Checkout completo — endereço + Pix

**Ação:** clicar "Finalizar compra".

**Validar:**
- [ ] Se anônimo, redireciona pra `/auth/login` ou tela de "checkout como guest" — caminho documentado funciona
- [ ] Para este teste, fazer login com cliente existente OU criar conta express (depende da decisão do Frontend)
- [ ] Tela de checkout `/checkout`:
  - [ ] Campo CEP autocompleta endereço (ViaCEP) — digitar `01310-100`, esperar autocomplete
  - [ ] Campos número, complemento editáveis
  - [ ] Resumo do pedido na lateral (sticky no desktop)
  - [ ] Opção de pagamento: Pix selecionado (default por dar 5-8% off com PIXFIRST)
  - [ ] Tentar aplicar `PIXFIRST` em cima de `BEMVINDO5` → regra do cupom decide (provável: 1 cupom por pedido, mostra mensagem)
  - [ ] Checkbox WhatsApp opt-in visível
- [ ] Click "Confirmar pedido" — loading aparece (não trava sem feedback)
- [ ] Redirect pra `/orders/[id]/confirmacao` ou similar

**Critério passa:** pedido criado no backend (verificar Network tab: POST `/api/orders` retornou 201).

---

### 8. Confirmação de pedido — código + prazo

**Ação:** ler tela de confirmação.

**Validar:**
- [ ] Código do pedido visível (formato `KORE-XXXXX` ou similar)
- [ ] Status atual: "Aguardando pagamento"
- [ ] Pix QR code OU instrução de pagamento renderiza (placeholder OK em demo)
- [ ] Prazo estimado de entrega visível
- [ ] CTA "Ver meus pedidos" ou "Voltar à loja"
- [ ] Email de confirmação enviado (Resend) — verificar log do backend ou caixa

---

### 9. Login admin → ver pedido novo

**Ação:** abrir nova aba anônima → `https://admin.kore.test/admin/login` → logar com admin.

**Validar:**
- [ ] Login retorna 200, redireciona pra `/admin/`
- [ ] Dashboard mostra KPIs (Ticket médio, Funil builder, Conversão por persona, etc — ver brief 04-data-analyst)
- [ ] Lista de "Pedidos recentes" mostra o pedido criado no passo 7-8
- [ ] **Toast de notificação de pedido novo aparece** (se o frontend tem polling/websocket)
- [ ] Click no pedido → `/admin/orders/[id]` mostra detalhes completos: cliente, itens, endereço, total, status

**Critério passa:** pedido aparece e detalhes batem com o que o cliente comprou.

---

### 10. Marcar como pago → mudança de status

**Ação:** no detalhe do pedido, mudar status pra "Pago" via dropdown / botão.

**Validar:**
- [ ] Confirm modal aparece (interação destrutiva → confirmar)
- [ ] Status muda visualmente (badge color)
- [ ] PATCH `/api/admin/orders/:id/status` retorna 200
- [ ] Refresh da página: status persistiu
- [ ] Email transacional disparado pro cliente ("seu pedido foi pago")

---

### 11. Logout admin → registro de novo cliente

**Ação:** logout admin (deve voltar pra `/admin/login`). Voltar pra loja `https://loja.kore.test/auth/register`.

**Validar:**
- [ ] Página de registro carrega: campos nome, email, senha, confirmar senha
- [ ] Validação client-side: senha < 8 chars rejeita, sem número rejeita
- [ ] Validação server-side: tentar `password=abcd1234` → backend retorna 422 (lição #01)
- [ ] Email único: tentar registrar com email do admin → 409 (mas com mensagem genérica, não vazar email enumeration — ver pentest)
- [ ] Registrar com `cliente.smoke+<timestamp>@kore.test` / `Senha@123` / nome "Cliente Smoke"
- [ ] Redirect pra `/account` ou home autenticado

---

### 12. Login cliente novo → área `/account`

**Ação:** se ainda autenticado, ir direto pra `/account`. Senão, login e ir.

**Validar:**
- [ ] `/account` carrega: nome do cliente no header
- [ ] Menu lateral: Pedidos, Endereços, Builds salvas, Lista de espera, Sair
- [ ] Click em "Pedidos" → `/account/orders`

---

### 13. Histórico vazio + builds salvas

**Ação:** verificar `/account/orders` e `/account/builds`.

**Validar:**
- [ ] Pedidos: estado vazio amigável (ex: "Você ainda não fez pedidos. Que tal montar seu primeiro PC?") — sem travessão, com CTA pro builder
- [ ] Builds salvas: estado vazio amigável + CTA pro `/montar`
- [ ] Loading skeleton enquanto carrega (não spinner)

---

### 14. Forgot password — fluxo de reset

**Ação:** logout. Acessar `/auth/forgot`.

**Validar:**
- [ ] Campo email + botão "Enviar"
- [ ] Submit com email do cliente novo: response 200, mensagem genérica ("Se o email existir, enviaremos um link") — **NÃO vazar se email existe** (lição: email enumeration)
- [ ] Submit com email inexistente: **mesma resposta 200 + mesma mensagem** (não dar 404)
- [ ] Response NÃO contém `_devResetUrl` (lição Miami `01-jwt-secret-placeholder.md` + security-audit)
- [ ] Email de reset chega (Resend log) — placeholder OK em demo, mas o link deve apontar pra `/auth/reset?token=...`
- [ ] Acessar link → tela de nova senha → submit → redirect pra login

**Critério passa:** sem `_devResetUrl` no response + mensagem genérica.

---

## Relatório final do smoke

```markdown
# Smoke E2E — Kore Tech — <data>

## Resultado: 14/14 OK | X/14 falhas

## Passos OK: 1, 2, 3, ..., 14

## Falhas
- Passo X: [arquivo:linha] descrição. Sugestão: ...

## Observações de polimento (não bloqueia)
- ...

## Veredito: APROVADO / REPROVADO
```

## Notas de execução

- **Não pular passos.** Mesmo que tudo "pareça funcionar", a sequência cobre interdependências (ex: passo 9 só faz sentido se 7 criou pedido).
- **Modo anônimo sempre.** Cookies residuais escondem bugs de auth.
- **Mobile separado.** Esse smoke é desktop. Para mobile, rodar BUGBASH-UX em paralelo com viewport 375px.
- **Re-executar após qualquer fix.** Bug bash ≠ smoke. Ambos são obrigatórios pré-deploy.
