# RETENTION — Kore Tech

> Estratégia pós-compra. Hardware tem ciclo longo (cliente compra PC, some por 2-3 anos). Retenção = converter PC em ecossistema (periféricos, upgrades, trade-in).

---

## 1. Lista de espera — notificação ativa

Anti-paper-launch. Killer feature já mapeado.

### 1.1 Fluxo

1. Cliente clica "Me avise quando chegar" em PDP fora de estoque
2. Backend cria `WaitlistSubscription { productId, email, userId?, createdAt, notifiedAt: null, reservedUntil: null }`
3. Admin reabastece produto → endpoint `POST /api/admin/products/:id/restock { quantity }` dispara:
   - busca `WaitlistSubscription` com `notifiedAt = null`, ordem `createdAt ASC`
   - dispara email "GPU disponível" pros primeiros N clientes (N = `min(quantity, total_inscritos)`)
   - marca `notifiedAt = now()` e `reservedUntil = now() + 24h`
4. Cliente clica no email → vai pro PDP com hash `?reserved=1`. Sistema mostra contador "Reservado pra você por 23h 47min". Adiciona ao carrinho com prioridade.
5. Após 24h, se não comprou → libera reserva (`reservedUntil` passa, próximo da fila é notificado se quantidade permitir)

### 1.2 Email — copy já em `COPY-EMAILS.md`

| Campo | Valor |
|---|---|
| **Subject** | `[Produto] disponível! Reservado pra você por 24h` |
| **Preheader** | `Você foi o primeiro a entrar na fila. Garanta antes que acabe.` |
| **CTA primário** | "Comprar agora" → `/produtos/[slug]?reserved=1&utm_source=email&utm_medium=waitlist_notify&utm_campaign=gpu_disponivel` |

### 1.3 Métrica

- **Conversão de fila → compra dentro das 24h** — alvo: >40% (lead super qualificado)
- **Tempo médio fila → notificação** (Data Analyst tem KPI no dashboard — alerta se > 14 dias sem reposição)

---

## 2. Pós-compra D+30 — cross-sell de periféricos

| Campo | Valor |
|---|---|
| **Quando** | 30 dias após `purchase` confirmada |
| **Condição** | só envia se cliente comprou PC (componentes) E **não** comprou periférico no mesmo pedido |
| **Subject** | `Como tá rodando seu PC? Bora completar o setup?` |
| **Preheader** | `Mouse, teclado, headset com 10% off pra quem já é cliente.` |
| **Conteúdo** | Cumprimenta pelo nome, pergunta como tá a experiência (link "responder pesquisa NPS" — V2). Mostra 4 periféricos sugeridos com base na persona inferida da compra (se comprou build de Valorant, sugere mouse 8000Hz polling, teclado magnético, headset 7.1, mousepad XL). Oferece cupom `RECOMPRA10` (V2 — não no MVP) ou frete grátis. |
| **CTA primário** | "Ver setup completo pro [persona]" → `/produtos?categoria=peripheral&persona=[slug]&utm_source=email&utm_medium=postpurchase_d30&utm_campaign=upgrade_setup` |
| **CTA secundário** | "Fale com a gente no WhatsApp" |

> **MVP-friendly:** se `RECOMPRA10` não for criado no Sprint 1, manda email sem cupom (foco no cross-sell visual). Adiciona `RECOMPRA10` em V2.

---

## 3. Pós-compra D+90 — transparência sobre garantia

| Campo | Valor |
|---|---|
| **Quando** | 90 dias após `purchase` |
| **Condição** | sempre envia (obrigatório, é educativo + reforça confiança) |
| **Subject** | `Seus 90 dias de garantia legal acabam hoje — o que muda` |
| **Preheader** | `Garantia do fabricante segue ativa. Aqui está o passo-a-passo se algo acontecer.` |
| **Conteúdo** | Tom direto e honesto (alinhado com brand voice): "Hoje completou 90 dias da sua compra. A garantia legal CDC encerrou, mas a do fabricante segue (12 meses). Se der defeito, fala com a gente — abrimos o RMA junto, você não fica sozinho com o suporte do fabricante." Lista o passo-a-passo de RMA (3 passos). Fim sem CTA de compra. |
| **CTA primário** | "Ver minha garantia ativa" → `/account/orders/[id]` |
| **Por que envia:** | Confiança gera recompra. Cliente que sente que loja é "honest broker" volta. Diferencial vs concorrência que joga pro fabricante. |

---

## 4. Pós-compra D+180 — preparação trade-in

| Campo | Valor |
|---|---|
| **Quando** | 180 dias após `purchase` |
| **Condição** | só envia se comprou PC montado ou GPU/CPU de tier alto (>= R$ 2.000) |
| **Subject** | `6 meses de PC novo. Quer upgradar a GPU?` |
| **Preheader** | `Trade-in modular chegando em 2026 — entra na lista de interesse.` |
| **Conteúdo** | Cumprimenta milestone (6 meses!), mostra 2-3 upgrades prováveis pra build dele (se tem RTX 4060, sugere 4070 Super; se tem 4070, sugere 4080). Mostra que o programa de **trade-in** ("manda a antiga, paga só diferença") tá em fase de teste e cliente pode entrar pra fila beta. |
| **CTA primário** | "Quero upgradar minha GPU" → `/produtos?categoria=gpu&minPrice=[x]&utm_source=email&utm_medium=postpurchase_d180&utm_campaign=upgrade_gpu` |
| **CTA secundário** | "Entrar na fila do trade-in beta" → captura email + persona em form simples (input pro programa V3) |

> **MVP-friendly:** trade-in é V3 (ver PESQUISA-NICHO seção 14.6). O email **prepara terreno** — não precisa programa funcionando ainda. Captura de fila vira insumo pra V3.

---

## 5. Aniversário do cliente

| Campo | Valor |
|---|---|
| **Quando** | dia do aniversário (se cliente forneceu data no cadastro) |
| **Subject** | `Feliz aniversário! 10% off de presente` |
| **Preheader** | `Cupom ANIVERSARIO10 válido por 7 dias. Use em qualquer item.` |
| **Conteúdo** | Curto, leve, sem grandes promessas. "Hoje é seu dia. Cá vai um cupom de 10% off, válido pra qualquer pedido na semana. Aproveita." |
| **Cupom** | `ANIVERSARIO10` (10% off, validade 7 dias, 1x por usuário, sem mínimo) — adicionar em V2 ao `CUPONS.md` quando data de nascimento for capturada |
| **CTA** | "Usar cupom" → `/?coupon=ANIVERSARIO10&utm_source=email&utm_medium=birthday&utm_campaign=aniversario` |

> **MVP:** campo `birthDate` opcional no cadastro. Cliente preenche se quiser. Cron diário 9h dispara emails do dia.

---

## 6. NPS pós-compra (V2)

Não é Sprint 1, mas registrar:

- D+45 envia email com link pro NPS (escala 0-10 + comentário)
- Detratores (0-6) → encaminha pro WhatsApp com pedido de feedback profundo, oferece cupom de recuperação
- Promotores (9-10) → pede review no Google Meu Negócio + Reclame Aqui (ajuda E-A-T) + oferece cupom de indicação `INDICA15` (V2)

---

## 7. Reativação de cliente inativo (V2)

| Campo | Valor |
|---|---|
| **Quando** | cliente inativo há 90 dias (sem login E sem compra) |
| **Cupom** | `VOLTA10` (10% off, validade 14 dias, 1x por usuário) |
| **Subject** | `Faz tempo que não te vejo por aqui` |
| **Conteúdo** | Mostra 3 lançamentos relevantes desde a última visita (GPU nova, CPU lançada, builds atualizados). Oferece cupom. Tom amigável sem cobrar. |

> Não é Sprint 1 — listar pra V2.

---

## 8. Programa de indicação (V2)

| Campo | Valor |
|---|---|
| **Mecânica** | Cliente A gera link único `kore.tech/r/[código]`. Cliente B usa e ganha 5% off (`INDICOU5`). Quando B compra, A ganha R$ 50 de saldo aplicável no próximo pedido |
| **Limite** | 5 indicações por cliente por mês |
| **Trigger pra evento** | `signup_via_referral` no GA4 |

> V2 — listar.

---

## 9. Resumo dos 5 emails pós-compra do MVP

| # | Quando | Subject | Cupom |
|---|---|---|---|
| 1 | Lista de espera (evento) | `[Produto] disponível! Reservado pra você por 24h` | nenhum |
| 2 | D+30 | `Como tá rodando seu PC? Bora completar o setup?` | (nenhum no MVP, RECOMPRA10 em V2) |
| 3 | D+90 | `Seus 90 dias de garantia legal acabam hoje — o que muda` | nenhum |
| 4 | D+180 | `6 meses de PC novo. Quer upgradar a GPU?` | nenhum (CTA pra trade-in beta) |
| 5 | Aniversário | `Feliz aniversário! 10% off de presente` | `ANIVERSARIO10` (V2) |

---

## 10. Métricas (Data Analyst trackeia)

- **Recompra rate em 180 dias** — alvo MVP: >12% (nicho hardware tem recompra baixa, periféricos puxam)
- **Conversão lista de espera (D+24h)** — alvo: >40%
- **Open rate emails pós-compra** — alvo: >40% (alta porque cliente engajado)
- **CTR D+30 cross-sell periférico** — alvo: >8%
- **% clientes com `birthDate` preenchido** — alvo: >25% (incentivar cadastro)
- **Sign-up fila trade-in beta** — alvo: >10% dos D+180 enviados (sinaliza interesse pra V3)

---

## 11. Pendências bloqueadas em outros agentes

- **Backend:** schema `WaitlistSubscription` (com `reservedUntil`), endpoint `POST /api/admin/products/:id/restock` que dispara emails, schema `User.birthDate` opcional, cron diário 9h pra aniversários, cron D+30/D+90/D+180 pra pós-compra
- **Backend:** lógica de fila de reserva (24h) no `WaitlistSubscription` + sincronização com estoque (não vender o reservado pra outro)
- **Frontend:** componente `<ReservedTimer />` no PDP quando vem de `?reserved=1`, form opcional `birthDate` no cadastro
- **Copywriter:** copy dos 4 emails pós-compra novos (D+30, D+90, D+180, aniversário) — adicionar ao `COPY-EMAILS.md` (atual cobre só welcome + abandono + waitlist)
- **Cliente:** Resend ativo + domínio verificado (compartilhado com NEWSLETTER.md)
