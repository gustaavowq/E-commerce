# NEWSLETTER — Kore Tech

> Captura + welcome series + carrinho abandonado. Resend é o transacional. Cupom carro-chefe é `BEMVINDO5`.

---

## 1. Captura — onde, como, quando

### 1.1 Popup principal

| Campo | Valor |
|---|---|
| **Aparece** | Após **30 segundos** OU em **exit-intent** (mouse sai pela borda superior do viewport, desktop) — o que ocorrer primeiro |
| **Quem** | Visitante **não-logado** + sem cookie `kore_newsletter_dismissed` E sem cookie `kore_newsletter_subscribed` |
| **Frequência** | Uma vez por sessão. Se dispensado, **não mostra por 7 dias** (cookie `kore_newsletter_dismissed = true; max-age=604800`) |
| **Conteúdo** | Headline: "5% off na primeira compra. E spoilers de lançamento de GPU." · Sub: "Sem spam. Cupom chega no email em 2 minutos." · Input email + Botão "Quero o cupom" · Linkzinho "não, valeu" (dismiss) |
| **Cupom oferecido** | `BEMVINDO5` (5% primeira compra, sem mínimo) |
| **Mobile** | Sim, mas só após 60s (não exit-intent) — UX mobile precisa de mais paciência |
| **Acessibilidade** | `aria-modal=true`, focus trap, ESC fecha = dispensar |
| **Analytics** | dispara `newsletter_subscribed` (sucesso) ou `newsletter_dismissed` (fechou) |

### 1.2 Footer (sempre presente)

- Caixa simples no footer: "Receba ofertas e lançamentos de GPU/CPU. 5% off na primeira compra."
- Input email + botão "Inscrever"
- Sucesso → toast "Pronto. Confere o email pra ver o cupom."
- Source = `'footer'` no schema

### 1.3 Checkout (V2)

- Checkbox opt-in no checkout: "Quero receber ofertas no email" (default OFF — opt-in explícito)
- Source = `'checkout'`

### 1.4 Lista de espera (já é por produto, mas entra na newsletter geral)

- Quando assina lista de espera, pergunta extra: "Quer também receber lançamentos e ofertas?" (checkbox)
- Se sim, adiciona à newsletter geral com source = `'waitlist'`

---

## 2. Schema (input pro Backend)

```prisma
model NewsletterSubscriber {
  id            String    @id @default(cuid())
  email         String    @unique
  source        String    // 'popup' | 'footer' | 'checkout' | 'waitlist'
  subscribedAt  DateTime  @default(now())
  unsubscribedAt DateTime?
  bemvindo5SentAt DateTime?
  d3SentAt      DateTime?
  d7SentAt      DateTime?
  d14SentAt     DateTime?
  utmSource     String?
  utmCampaign   String?
}
```

---

## 3. Welcome series (4 emails sequenciais via Resend)

Disparados por cron job que roda 2x/dia (10h e 18h). Backend implementa o cron + endpoint `/internal/cron/welcome-series`.

### Email 1 — Dia 0 (imediato)

| Campo | Valor |
|---|---|
| **Quando** | imediatamente após `newsletter_subscribed` (não esperar cron) |
| **Subject** | `Seu cupom BEMVINDO5 chegou — 5% off na primeira` |
| **Preheader** | `Use no checkout. Vale em qualquer carrinho.` |
| **Conteúdo** | Copy já existe em `COPY-EMAILS.md` (Copywriter). Resumo: agradece, entrega `BEMVINDO5`, 3 atalhos: "Ver PCs prontos", "Montar no Builder", "Entrar pra ver builds" |
| **CTA primário** | "Aplicar o cupom agora" → `/?coupon=BEMVINDO5&utm_source=email&utm_medium=welcome_d0&utm_campaign=bemvindo5` |
| **From** | `Kore Tech <ola@koretech.com.br>` |
| **Reply-to** | `suporte@koretech.com.br` |

### Email 2 — Dia 3

| Campo | Valor |
|---|---|
| **Quando** | D+3 (cron diário) |
| **Subject** | `Não sabe o que escolher? Monta com a gente.` |
| **Preheader** | `Glossário rápido + Builder em 5 passos.` |
| **Conteúdo** | Apresenta o `/glossario` (3 termos selecionados: socket, TDP, NVMe) + chama pro Builder explicando que ele filtra peça incompatível automaticamente. Reforça cupom ainda válido. |
| **CTA primário** | "Abrir o Builder" → `/montar?utm_source=email&utm_medium=welcome_d3&utm_campaign=glossario_builder` |

### Email 3 — Dia 7

| Campo | Valor |
|---|---|
| **Quando** | D+7 |
| **Subject** | `Veja PCs prontos pra cada uso — Valorant, edição, IA local` |
| **Preheader** | `8 personas, FPS estimado em destaque.` |
| **Conteúdo** | Mostra 4 personas de destaque com card visual: Valorant 240fps, Edição 4K, IA Local Llama, Entry Gamer. Cada um com link pra landing. |
| **CTA primário** | "Ver todas as personas" → `/builds?utm_source=email&utm_medium=welcome_d7&utm_campaign=personas` |

### Email 4 — Dia 14 (último lembrete)

| Campo | Valor |
|---|---|
| **Quando** | D+14 |
| **Condição** | só dispara se cliente **ainda não usou** `BEMVINDO5` (Backend checa `OrderCouponUsage`) |
| **Subject** | `Seu cupom BEMVINDO5 expira em 7 dias` |
| **Preheader** | `Aplica em qualquer carrinho. Sem mínimo.` |
| **Conteúdo** | Tom direto, sem floreio. "Você assinou no D-X. Cupom segue válido por 7 dias e some depois. Se ficar com dúvida no que pegar, manda mensagem no WhatsApp." |
| **CTA primário** | "Usar agora" → `/?coupon=BEMVINDO5&utm_source=email&utm_medium=welcome_d14&utm_campaign=bemvindo5_final` |
| **CTA secundário** | "Falar no WhatsApp" |

> **Nota:** "expira em 7 dias" no copy é incentivo psicológico — o cupom em si tem validade indefinida, mas se o cliente não usar em 14+7=21 dias o engajamento despenca. Tudo bem reforçar urgência (o copy não mente: cliente PODE usar depois, mas pra ele é sinal de "agora ou nunca").

---

## 4. Carrinho abandonado

### 4.1 Definição

- **Cart com itens + email/userId conhecido** (cliente logado OU forneceu email no checkout)
- **SEM** progresso para checkout/order completed nas últimas 24h
- **NÃO** dispara se cliente fez `purchase` no meio-tempo

### 4.2 Schema (input Backend)

```prisma
model AbandonedCartReminder {
  id          String   @id @default(cuid())
  cartId      String
  userEmail   String
  itemsSnapshot Json   // snapshot pra email
  totalValue  Decimal
  d1SentAt    DateTime?
  d3SentAt    DateTime?
  recoveredAt DateTime? // se virou purchase
}
```

### 4.3 Email D+1

| Campo | Valor |
|---|---|
| **Quando** | 24h depois do último update do carrinho |
| **Subject** | `Esqueceu algo no carrinho? Tá guardado.` |
| **Preheader** | `Seu PC tá te esperando. Sem pressão.` |
| **Conteúdo** | Mostra os itens (foto + nome + preço), total, botão "Voltar ao carrinho" (URL com `cartId` re-hidrata). Tom amigável, sem urgência fake. |
| **CTA primário** | "Voltar ao carrinho" → `/cart?recover={cartId}&utm_source=email&utm_medium=cart_abandon_d1&utm_campaign=volte_carrinho` |

### 4.4 Email D+3

| Campo | Valor |
|---|---|
| **Quando** | 72h depois (se ainda não recuperou) |
| **Condição** | reforço de cupom — se cliente ainda não usou `BEMVINDO5` (Backend checa), oferece de novo. Se já usou, oferece pequeno frete grátis upgrade ou nada extra. |
| **Subject** | `Última chamada — 5% off no que tá no carrinho` |
| **Preheader** | `BEMVINDO5 reaplicado. Vale em qualquer item.` |
| **Conteúdo** | Mostra itens + total **com 5% off já calculado** ("De R$ 5.999 por R$ 5.699"). Botão "Comprar agora com 5% off". Tom mais direto. |
| **CTA primário** | "Comprar com 5% off" → `/cart?recover={cartId}&apply=BEMVINDO5&utm_source=email&utm_medium=cart_abandon_d3&utm_campaign=volte_carrinho_5off` |

### 4.5 Não enviar mais que 2 emails de carrinho abandonado

Se passar D+3 sem conversão, marca como `lost` e para. **Nunca insistir em D+7 ou mais** — vira spam e cliente reporta.

---

## 5. Lista de espera — emails (referência)

Detalhe completo em `RETENTION.md` seção 1. Resumo:
- Quando GPU volta ao estoque → email "Disponível! reserva em 24h" (já em `COPY-EMAILS.md`)
- Reserva 24h = se cliente clica no email, o produto fica reservado pra ele por 24h via `WaitlistSubscription.reservedUntil`

---

## 6. Cron jobs necessários (input pro Backend)

| Job | Schedule | Endpoint interno |
|---|---|---|
| Welcome series D+3, D+7, D+14 | `0 10 * * *` e `0 18 * * *` (2x/dia) | `POST /internal/cron/welcome-series` |
| Carrinho abandonado D+1, D+3 | `0 */6 * * *` (4x/dia) | `POST /internal/cron/cart-abandon` |
| Lista de espera notificação | a cada `POST /api/admin/products/:id/restock` | trigger evento, não cron |

---

## 7. Boas práticas / restrições

- **Sempre** link `unsubscribe` no rodapé de cada email (footer Resend automático ou manual). Lei brasileira (LGPD + CAN-SPAM equivalente).
- **Sempre** identificação clara do remetente: "Kore Tech — CNPJ XX.XXX.XXX/0001-XX"
- **Nunca** comprar lista. Toda inscrição é opt-in.
- **Bounce hard** (email inexistente) → marcar `unsubscribedAt` automático e parar.
- **Soft bounce** (caixa cheia) → tentar 3 vezes em 7 dias, depois desistir.
- **Reply-to** sempre humano (`suporte@koretech.com.br`). Cliente que responde = lead morno, vira atendimento WhatsApp.

---

## 8. Métricas (Data Analyst trackeia)

- **Taxa de captura** (% visitantes únicos que assinam) — alvo MVP: >2%
- **Taxa de conversão D+0 → primeira compra** — alvo: >8% em 30 dias
- **Open rate por email** (D+0, D+3, D+7, D+14, abandono D+1, D+3) — alvo: >35% no transacional
- **Click rate** — alvo: >8%
- **Recuperação de carrinho abandonado** (% recovered / total reminders enviados) — alvo: >12%
- **Unsubscribe rate** — alerta se >0.5% por email

---

## 9. Pendências bloqueadas em outros agentes

- **Frontend:** componente `<NewsletterPopup />` (timing 30s + exit-intent + cookie dismissal 7d), input no footer, integração com `POST /api/newsletter/subscribe`
- **Backend:** `POST /api/newsletter/subscribe` (recebe email + source + UTMs), schema `NewsletterSubscriber` + `AbandonedCartReminder`, cron jobs welcome-series + cart-abandon, integração Resend (templates + dispatch)
- **Backend:** rota `GET /cart?recover={cartId}` re-hidrata carrinho abandonado (re-cria sessão temporária com itens) E aceita `?apply=BEMVINDO5` pra aplicar cupom
- **Copywriter:** copy dos 4 emails de welcome + 2 de carrinho abandonado já está na lista do `COPY-EMAILS.md` (D+0, D+3, D+7, D+14, abandon D+1, abandon D+3) — confirmar que cobriu os 6
- **Designer:** template HTML de email (header com logo, corpo dark mode-friendly, footer com endereço CNPJ + unsubscribe). Resend aceita HTML simples, sem React Email no MVP
- **Cliente:** conta Resend + domínio verificado (`koretech.com.br` com DKIM/SPF/DMARC) — sem isso emails caem no spam
