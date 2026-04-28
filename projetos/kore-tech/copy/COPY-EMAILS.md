# Copy Emails — Kore Tech

> 4 templates de email transacional. Backend (futuro, com Resend) usa esses templates como base.
> Cada template traz: assunto, preview text, corpo em markdown HTML-friendly, variáveis dinâmicas, footer padrão.
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Regras de ouro (de `BRAND-VOICE.md` seção 4):**
- Sem travessão (`—`) em qualquer string.
- Email transacional pode ter 1 emoji discreto se servir benefício direto, ainda assim limitado (e nunca em assunto de DOA).
- Cliente quer 4 informações: o que aconteceu, quando, próximo passo, como saber mais.
- Subject ≤ 40 chars, preview text ≤ 90 chars.
- "Você" sempre. Pix com 5% off antes de parcelamento. Nota fiscal sempre mencionada quando cabe.
- Em DOA, voz cede para empático e firme (regra `BRAND-VOICE.md` seção 6).

**Variáveis dinâmicas:** marcadas como `{nome_variavel}`. Backend substitui no momento do envio.

**Footer padrão (todos os 4 emails terminam com isso):**

```markdown
---

**Kore Tech**
Hardware sério, montado certo.
[kore.tech](https://kore.tech) · [Suporte](https://kore.tech/contato) · [Privacidade](https://kore.tech/policies/privacidade)

CNPJ 00.000.000/0001-00 · Rua Placeholder, 000, São Paulo SP

Recebeu esse email porque tem conta na Kore Tech. [Cancelar avisos]({unsubscribe_url}).
```

---

## Email 1 — Boas-vindas (após cadastro)

```yaml
trigger: usuário recém-cadastrado, conta confirmada
to: usuário recém-criado
template_slug: welcome
priority: low (não bloqueia checkout)
delay_minutes: 0 (envio imediato após confirmação de email)
```

### Subject

```
Bem-vindo na Kore. Cupom 5% off
```

(36 chars)

### Preview text

```
BEMVINDO5 ativa 5% off na primeira compra. Vale 7 dias.
```

(57 chars)

### Body (markdown)

```markdown
# Bem-vindo, {primeiro_nome}.

Sua conta na Kore Tech está pronta. Antes de qualquer coisa, segura esse cupom:

## BEMVINDO5

**5% off na primeira compra.** Vale 7 dias, em qualquer produto da loja, soma com Pix (totaliza ~10% de desconto).

[Aplicar cupom no carrinho]({store_url}?coupon=BEMVINDO5)

---

## O que dá pra fazer logado

- **Salvar build no Builder.** Monta seu PC peça por peça com checagem de compatibilidade na hora, salva, volta depois.
- **Lista de espera ativa.** Se a GPU que você quer está sem estoque, ativa "me avisa". Quando chegar, reservamos 24h pra você.
- **Acompanhar pedido em tempo real.** De aprovação a teste de qualidade até a entrega.

---

## Por onde começar

- [Ver builds prontos por uso]({store_url}/builds) (Valorant 240 FPS, edição 4K, IA local)
- [Abrir o Builder]({store_url}/montar)
- [Catálogo completo]({store_url}/produtos)

Qualquer dúvida técnica, manda no [WhatsApp]({whatsapp_url}). Suporte humano em horário comercial.

Bom build.
```

### Notas de implementação

- Variáveis: `{primeiro_nome}`, `{store_url}`, `{whatsapp_url}`, `{unsubscribe_url}`.
- Cupom `BEMVINDO5`: validar no Backend que está ativo, vale 7 dias, primeira compra apenas.
- Sem emoji nesse template (acolhimento é pelo cupom, não pelo símbolo).

---

## Email 2 — Confirmação de pedido (após pagamento)

```yaml
trigger: pagamento confirmado (Pix recebido, cartão aprovado, ou boleto compensado)
to: cliente comprador
template_slug: order_confirmation
priority: high (cliente espera ver isso em minutos após pagar)
delay_minutes: 0 (envio imediato após confirmação)
```

### Subject

```
Pedido #{numero_pedido} confirmado
```

(31 chars com pedido de 5 dígitos)

### Preview text

```
{metodo_pagamento} recebido. Separamos pra envio em até 24h.
```

(58 chars)

### Body (markdown)

```markdown
# Pedido #{numero_pedido} confirmado

{metodo_pagamento_texto_livre}.

Separamos pra envio em até 24h. Você recebe outro email com código de rastreio assim que o pacote sair daqui.

---

## O que vai junto

{lista_itens_iterada}

Cada item da lista usa o template:

- **{item_nome}** ({item_qty}x)
  {item_specs_curta}
  R$ {item_preco_total}

---

## Resumo do pagamento

| Linha | Valor |
|---|---|
| Subtotal | R$ {subtotal} |
| Frete ({metodo_envio}) | R$ {frete} |
| Desconto {cupom_aplicado} | -R$ {desconto} |
| **Total** | **R$ {total}** |

Forma de pagamento: **{metodo_pagamento}**
{linha_parcelamento_se_cartao}

---

## Pra onde vai

{nome_destinatario}
{endereco_completo}
CEP {cep}

Prazo estimado: chega em até {prazo_dias} dias úteis em {cidade}.

---

## Pix recebido? Próximo passo

Pix recebido às {horario_pagamento} de hoje.

PC montado entra na fila de montagem com SLA de 3 dias úteis. Componente avulso e periférico saem em 24h.

[Acompanhar pedido]({store_url}/conta/pedidos/{numero_pedido})

---

## Nota fiscal

A NFe sai junto com o produto. Você também recebe por email assim que emitida (em até 48h).

## Precisa falar com a gente?

[Suporte]({store_url}/contato) ou [WhatsApp]({whatsapp_url}).

Qualquer coisa fora do esperado nesse pedido, fala com a gente em vez de abrir disputa no banco. Resolvemos mais rápido.
```

### Variantes de `metodo_pagamento_texto_livre`

| Método | Texto |
|---|---|
| Pix | `Pix recebido às {horario_pagamento}` |
| Cartão | `Pagamento aprovado em {bandeira} terminado em {final_cartao}` |
| Boleto | `Boleto compensado em {data_compensacao}` |

### Bloco Pix QR Code (placeholder, exibe só se método = Pix e ainda pendente)

Se o pedido foi criado mas Pix ainda **não foi pago** (subject muda para "Pague seu Pix do pedido #X"), bloco extra com QR code:

```markdown
## Pagamento Pix pendente

QR Code abaixo ou copia e cola Pix:

[QR_CODE_IMAGE: {pix_qr_code_url}]

```
{pix_copia_cola}
```

Vale por 30 minutos. Após pagamento, confirmamos automaticamente.

[Tela do pagamento]({store_url}/checkout/pix/{numero_pedido})
```

### Notas de implementação

- Variáveis listadas inline (`{numero_pedido}`, `{metodo_pagamento}`, etc).
- Lista de itens iterada no template engine (Handlebars/Mustache).
- Bloco Pix QR só aparece em estado `awaiting_pix_payment`. Email principal de "confirmado" é só após `paid`.
- Sem emoji (transacional sério).

---

## Email 3 — GPU disponível na lista de espera

```yaml
trigger: cron diário identifica produto com waitlist ativa que voltou ao estoque
to: clientes na waitlist por ordem de inscrição
template_slug: waitlist_back_in_stock
priority: high (urgência real, reserva 24h)
delay_minutes: 0
rate_limit: 1 email por usuário por produto por 7 dias (anti-spam)
```

### Subject

```
{produto_curto} voltou. 24h reservadas
```

(exemplo: "RTX 4080 Super voltou. 24h reservadas" — 38 chars)

### Preview text

```
Você foi um dos primeiros a esperar. Reservamos pra você.
```

(56 chars)

### Body (markdown)

```markdown
# Sua {produto_curto} chegou.

Você ativou "me avisa" pra esse produto em {data_inscricao}. Estoque novo entrou hoje, e você é uma das primeiras pessoas a saber.

---

## O produto

**{produto_nome_completo}**
{produto_specs_curtas}

**Preço atual:** R$ {preco_atual}
{linha_se_preco_subiu}

12x R$ {parcela_12x} sem juros, ou Pix R$ {preco_pix} (5% off)

[Ver produto e comprar]({store_url}/produtos/{produto_slug})

---

## Reserva de 24h

Reservamos uma unidade pra você por **24h a partir de agora** ({hora_envio} de {data_envio}).

Se não comprar até {data_expiracao} {hora_expiracao}, a unidade volta pra fila pública e a próxima pessoa da lista é avisada.

[Comprar agora]({store_url}/produtos/{produto_slug}?reserved={token_reserva})

---

## Por que avisamos só agora

Estoque do nicho é volátil em 2026. RAM e GPU especialmente. A gente não promete data de chegada porque odeia paper launch tanto quanto você.

A boa: você ativou cedo, então pegou o aviso na primeira fornada. Quem ativar depois entra no fim da fila.

---

## Não tá interessado mais?

Sem problema. [Sair da lista de espera]({waitlist_remove_url}).

Você fica de fora desse produto, mas continua nas outras listas que ativou.
```

### Variantes de `linha_se_preco_subiu`

Se o preço atual está mais alto que quando o cliente entrou na lista:

```markdown
> Heads-up: o preço subiu R$ {diferenca} desde {data_inscricao} (mercado de GPU 2026, infelizmente foge do controle da loja). Se quiser pular, sem problema.
```

Se o preço está igual ou menor, não exibe esse bloco.

### Notas de implementação

- Variáveis: `{produto_curto}`, `{produto_nome_completo}`, `{produto_specs_curtas}`, `{preco_atual}`, `{parcela_12x}`, `{preco_pix}`, `{produto_slug}`, `{token_reserva}` (UUID), `{data_inscricao}`, `{hora_envio}`, `{data_envio}`, `{data_expiracao}`, `{hora_expiracao}`, `{waitlist_remove_url}`, `{diferenca}`.
- `{token_reserva}`: token único válido por 24h, vinculado ao usuário. Backend valida no carrinho/checkout (rejeita se outro usuário tentar usar).
- 1 emoji aceitável aqui no fim (próximo do CTA), mas opcional. Padrão atual: sem emoji.

---

## Email 4 — DOA / Suporte (cliente abriu ticket DOA)

```yaml
trigger: cliente abre ticket DOA (≤ 30 dias da entrega)
to: cliente comprador + cópia interna pro suporte
template_slug: doa_support_acknowledgment
priority: high (cliente está chateado, precisa de retorno em horas)
delay_minutes: 0 (envio imediato após abertura do ticket)
```

### Subject

```
Recebemos seu ticket DOA #{ticket_id}
```

(33 chars com ticket de 4 dígitos)

### Preview text

```
Próximos passos abaixo. Resposta humana em até 4h em horário comercial.
```

(70 chars)

### Body (markdown)

```markdown
# Ticket DOA #{ticket_id} recebido

{primeiro_nome}, recebi seu ticket. Lamento que o produto chegou com defeito, vou cuidar daqui em diante.

---

## O que você abriu

**Pedido:** #{numero_pedido} (entregue em {data_entrega})
**Produto com problema:** {produto_nome}
**Sintoma reportado:** {sintoma_texto}

---

## Como vai ser daqui

A política DOA da Kore cobre os primeiros 30 dias da entrega. Você está dentro do prazo.

**Próximos passos:**

1. **Responder em até 4h** (em horário comercial, segunda a sábado, 9h às 18h). Caso ticket aberto fora do horário, a primeira resposta sai no início do próximo dia útil.

2. **Solicito 2 fotos rápidas** se puder enviar:
   - Foto do produto com o problema visível (LED apagado, peça danificada, etc)
   - Foto do lacre da caixa original (se ainda tiver)

   Se já anexou, ignora esse passo.

3. **Coleta reversa pelos Correios.** Te mando o código rastreável, sem custo pra você. Embala no que tiver (caixa original ajuda mas não é obrigatório).

4. **Chegou aqui, conferimos em até 2 dias úteis** e:
   - Se confirmado defeito de fábrica: enviamos unidade nova (mesma SKU) pelo Sedex, sem custo.
   - Se sem estoque da mesma SKU: opção de produto equivalente ou reembolso integral via Pix.
   - Se confirmado dano por uso (raro mas acontece): explico antes de qualquer cobrança, com fotos do que encontramos.

---

## O que **não** acontece nesse processo

- Você **não** paga frete de retorno.
- Você **não** precisa abrir outro ticket no fabricante.
- Você **não** vai esperar 30 dias úteis pra resposta. Se demorar mais de 4h em horário comercial, manda no [WhatsApp]({whatsapp_url}).

---

## Acompanhe o ticket

[Status do ticket #{ticket_id}]({store_url}/conta/suporte/{ticket_id})

Toda atualização aparece aqui e te aviso por email.

---

## Vou voltar logo

Vou responder o ticket em até {sla_resposta_horas} horas (em horário comercial). Se o caso for crítico, manda no WhatsApp ou liga.

Lamento o transtorno. A gente resolve isso.

{nome_atendente}
Suporte Kore Tech
```

### Notas de implementação

- Variáveis: `{ticket_id}`, `{primeiro_nome}`, `{numero_pedido}`, `{data_entrega}`, `{produto_nome}`, `{sintoma_texto}`, `{whatsapp_url}`, `{store_url}`, `{sla_resposta_horas}` (default 4 em horário comercial, calcula em runtime), `{nome_atendente}`.
- **Sem emoji.** DOA é momento sensível.
- **Tom empático mas firme.** Não dramatiza ("que horror!"), não desculpa demais ("mil desculpas pelo transtorno horrível"), não joga no fabricante ("infelizmente é com o fabricante").
- **Próximos passos numerados, claros.** Cliente já está chateado, não pode ter dúvida do que fazer.
- O `{nome_atendente}` traz humanidade. Se não tem atendente atribuído ainda, default: "Equipe Kore Tech" (sem mais elaborar).

---

## Padrões cross-email

### Subject — limites e estrutura

- Máximo 40 chars (Gmail trunca em 50, mobile em 35).
- Sem emoji em subject (impacta deliverability em alguns provedores).
- Sem CAPS LOCK.
- Variáveis vão no fim quando possível ("Pedido confirmado #1234" lê melhor truncado que "#1234 Pedido conf...").

### Preview text — limites

- Máximo 90 chars.
- Complementa o subject, não repete.
- Tem benefício direto ("BEMVINDO5 ativa 5% off na primeira compra"), não decoração.

### Header / pré-cabeçalho visual

Frontend de email (Resend/MJML) renderiza:
- Logo Kore Tech 32px de altura, alinhado à esquerda.
- Background `#0A0E14` no header, padding 24px.
- Cyan elétrico só em CTA de botão, não em texto corrido.

### CTA primário (botão)

- Texto: verbo de ação real ("Aplicar cupom", "Acompanhar pedido", "Comprar agora", "Ver ticket").
- Nunca "Clique aqui".
- Visualmente: bg cyan `#00E5FF`, texto preto `#0A0E14`, padding 16px 24px, radius 8px, font-weight 600.

### Footer institucional

Repetido em todos os emails (ver topo deste documento).

---

## Lista futura (Sprint 2+)

Templates que ainda precisam ser escritos quando ativarmos:

- **Carrinho abandonado D+1** (24h após adicionar e não fechar)
- **Pedido enviado** (com código de rastreio Correios)
- **Pedido entregue** (pede review)
- **Esqueci a senha** (link reset com expiração 1h)
- **Newsletter — estoque novo da semana** (lote de avisos consolidados, semanal)
- **Pós-venda D+30** (sugestão de upgrade de periférico ou cooler)
- **Pós-venda D+180** (oportunidade de trade-in modular V3)

---

## Pendências pra outros agentes

- **[Backend]** Triggers e variáveis listados em cada template. Resend integration usa esses slugs.
- **[Designer]** MJML / template HTML do Resend precisa puxar as cores do `tokens.css` (ou hardcode dos hex dark + cyan). Logo SVG do header em `design/logo.svg`.
- **[Growth]** Cupons (`BEMVINDO5`) precisam estar criados no painel admin. Validade 7 dias, primeira compra apenas, soma com Pix.
- **[QA]** Testar deliverability em Gmail/Outlook/iCloud. Confirmar que CTA funciona em mobile com touch target 44px.
- **[Data Analyst]** Eventos GA4 para tracking de email: `email_open`, `email_click_cta`, `waitlist_email_converted_to_purchase`.
