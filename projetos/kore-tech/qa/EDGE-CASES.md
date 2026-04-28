# Edge Cases — Kore Tech

> Cenários de borda **específicos do nicho hardware** que não cabem em smoke nem bug bash.
> Cada um isola uma regra de negócio crítica que, se quebrada, gera disputa com cliente, perda de margem, ou problema legal.
> **Quando executar:** após smoke + bug bash verdes, antes do release. Cada item testado e documentado.

## Como usar

Cada cenário tem:
- **Setup** — estado inicial necessário
- **Ação** — o que fazer
- **Esperado** — comportamento correto
- **Risco se falhar** — o que acontece em prod
- **Critério passa** — sinal verde

---

## 1. Frete de gabinete pesado (15kg)

**Setup:**
- Produto seedado: gabinete `Lian Li O11 Dynamic XL` com `weightGrams=15000`, `dimensionsMm={length:570,width:300,height:560}`
- CEP destino: `01310-100` (SP centro) e `69900-000` (Rio Branco AC, longe)

**Ação:**
- Adicionar gabinete ao carrinho
- Calcular frete pra ambos CEPs

**Esperado:**
- Frete usa peso real (15kg) e dimensões pra cálculo (cubagem)
- Correios PAC + SEDEX calculam acima do mínimo (não vira "frete grátis" por bug)
- Frete pra AC > frete pra SP (distância)
- Se peso > limite Correios (30kg) ou dimensão > limite, sistema oferece "Frete sob consulta — entraremos em contato"

**Risco se falhar:**
- Frete subestimado: loja paga diferença, perde margem
- Frete superestimado: cliente abandona carrinho

**Critério passa:** frete realista pra ambos CEPs, sem zero, sem absurdo (>R$ 500 pra SP).

---

## 2. Cupom BUILDER10 só aplica via builder

**Setup:**
- 2 carrinhos: A) montado via `/montar` com 8 peças; B) compra direta de PC montado via `/pcs/[slug]`

**Ação:**
- Aplicar `BUILDER10` em A
- Aplicar `BUILDER10` em B

**Esperado:**
- A: aplica 10% off (carrinho originado pelo builder, marcado com flag `cart.source='builder'` ou similar)
- B: rejeita com mensagem "Este cupom só vale pra compras montadas no nosso PC Builder. Experimente em [link /montar]"
- Tentar burlar via mistura (1 peça do builder + comprou PC montado direto): regra do cupom decide consistente

**Risco se falhar:**
- Cliente usa BUILDER10 sem usar builder, perde o incentivo de adoção da feature
- Margem corrói sem propósito

**Critério passa:** rejeição amigável + sem brecha de bypass.

---

## 3. Lista de espera notifica só quando stock vai de 0 → positivo

**Setup:**
- Produto X com `stock=0`, 5 clientes na waitlist
- Cron / job de notificação configurado

**Ação:**
- Cenário 1: admin atualiza X de `stock=0` pra `stock=10` → cron roda
- Cenário 2: admin atualiza X de `stock=null` (descontinuado) pra `stock=10` → cron roda
- Cenário 3: admin atualiza X de `stock=10` pra `stock=0` → cron roda
- Cenário 4: admin atualiza X de `stock=10` pra `stock=20` → cron roda
- Cenário 5: admin atualiza X de `stock=0` pra `stock=null` (descontinua) → cron roda

**Esperado:**
- Cenário 1: notifica os 5 (estoque entrou)
- Cenário 2: notifica os 5 (descontinuado voltou)
- Cenário 3: NÃO notifica (estoque saiu, não entrou)
- Cenário 4: NÃO notifica (já tinha estoque)
- Cenário 5: NÃO notifica (não tem como comprar mesmo)

**Implementação correta:**
```ts
// Trigger notify só na transição: stock_anterior <= 0 && stock_atual > 0
if (oldStock <= 0 && newStock > 0) {
  await notifyWaitlist(productId)
}
```

**Risco se falhar:**
- Cenário 4 quebrado: spam de "produto disponível" toda vez que admin ajusta inventário
- Cenário 1 quebrado: cliente nunca recebe notificação, perde venda

**Critério passa:** matriz 5x cenários bate o esperado.

**Bonus:** após notificar, cada notificado deve ter janela de 24h de **reserva** (lock virtual) — outros clientes veem "X reservado, Y disponível".

---

## 4. Build com wattagem somada > PSU disponível mais alta

**Setup:**
- Cliente monta build absurdo: dual RTX 5090 (575W cada) + Threadripper 7980X (350W) + 256GB RAM + 4 NVMe = ~1700W consumo
- PSU mais alta no catálogo: 1000W Platinum

**Ação:**
- Tentar fechar build sem PSU
- Tentar fechar build com PSU 1000W

**Esperado:**
- Footer mostra wattagem somada (1700W) em **danger red**
- Mensagem clara: "Seu build precisa de fonte > 1000W. Não temos esse modelo no catálogo no momento. [Falar com um especialista]"
- Botão "Comprar tudo" **desabilitado** (não deixa fechar build inválido)
- Alternativa: oferecer **build server-grade** sob consulta (link pra contato)
- Se cliente força via API direta (POST /cart/items) com build inválido, backend valida e rejeita 400

**Risco se falhar:**
- Cliente compra, monta, queima fonte → suporte vira pesadelo, devolução, churn
- Loja pode ser responsabilizada por dano (CDC produto inadequado pro uso)

**Critério passa:** UI bloqueia + backend valida + mensagem amigável + alternativa oferecida.

---

## 5. Race condition: PC montado stock=1 comprado simultâneo por 2 clientes

**Setup:**
- PC montado pré-configurado "Kore Valorant Pro" com `stock=1`
- 2 sessões anônimas em paralelo

**Ação:**
- Sessão A e B abrem `/pcs/kore-valorant-pro` ao mesmo tempo
- Ambos clicam "Comprar agora" no mesmo segundo
- Ambos chegam no checkout
- Ambos clicam "Confirmar pedido" simultaneamente (usar `&` no curl ou Promise.all em script)

**Esperado:**
- Atomic decrement no backend: `UPDATE Product SET stock=stock-1 WHERE id=X AND stock>0 RETURNING stock`
- Apenas 1 dos 2 retorna 201 (pedido criado, stock vira 0)
- O outro retorna 409 ou 400: "Esse PC acabou de ser comprado por outra pessoa. Que tal montar um igual no [Builder] ou ver [PCs similares]?"
- O cliente que perdeu NÃO tem cobrança no MercadoPago
- Carrinho do que perdeu é limpo do item esgotado

**Implementação correta:**
- Transaction Prisma com lock otimista: `tx.product.update({ where: { id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } })` — se zero rows affected, throw OutOfStockError
- Alternativa pessimista: `SELECT FOR UPDATE` em transação

**Risco se falhar:**
- Vende 2x o mesmo PC, só tem 1 → cliente vê pedido confirmado mas nunca recebe → disputa, chargeback, reputação destruída

**Critério passa:** apenas 1 sucesso, outro recebe 409 amigável, sem cobrança duplicada.

---

## 6. DOA (Dead on Arrival) D+5 vs garantia legal D+90

**Setup:**
- Cliente recebeu PC há 5 dias
- Acessa `/account/orders/[id]` e clica "Solicitar garantia"

**Ação:**
- Selecionar motivo: "Não liga / Defeito grave"

**Esperado:**
- Sistema detecta: dias desde entrega = 5 → **DOA aplicável** (janela 7-14 dias, dependendo da política — Kore Tech: 14)
- Fluxo DOA: troca por igual sem perícia, frete reverso pago pela loja, prazo 5 dias úteis pra envio do substituto
- Se cliente acionasse no D+30: cai no fluxo de **garantia legal CDC 90 dias** (perícia, prazo 30 dias pra resolução)
- Se acionasse no D+120: cai no fluxo de **garantia fabricante 12 meses** (loja intermedia)

**Lógica:**
```
dias_desde_entrega <= DOA_WINDOW (14)         → DOA: troca direta
dias_desde_entrega <= LEGAL_WARRANTY (90)     → CDC: perícia + prazo 30 dias
dias_desde_entrega <= MANUFACTURER (365+)     → Fabricante intermediado
```

**Risco se falhar:**
- DOA classificado como CDC: cliente passa por perícia desnecessária, churn
- CDC classificado como fabricante: loja viola CDC art. 18, Procon multa

**Critério passa:** rota correta no admin baseada em data + motivo.

---

## 7. Devolução por arrependimento D+7 reembolsa frete

**Setup:**
- Cliente recebeu PC há 6 dias
- Não tem defeito, simplesmente desistiu (CDC art. 49)

**Ação:**
- Solicitar devolução por arrependimento

**Esperado:**
- Sistema valida: dias_desde_entrega ≤ 7 → aceita arrependimento
- Frete reverso por conta da loja (CDC obriga)
- Reembolso integral: produto + **frete original também** (jurisprudência consolidada)
- Estorno na forma de pagamento original (Pix → Pix; cartão → estorno cartão)
- Se acionado D+8: cai no fluxo de garantia legal (precisa motivo de defeito)

**Implementação:**
```
total_reembolso = order.subtotal + order.shipping_cost
// NÃO subtrair frete reverso do reembolso (loja paga)
```

**Risco se falhar:**
- Reter frete = reclamação Procon = multa
- Não reembolsar frete original = mesma coisa

**Critério passa:** valor total reembolsado = subtotal + frete original.

---

## 8. Cupom acumulação — ordem de aplicação

**Setup:**
- Carrinho com PC montado R$ 8.000 + periférico R$ 500 (subtotal R$ 8.500)
- Cupons disponíveis: BEMVINDO5 (5%), PIXFIRST (5%), COMBO15 (15% PC+periférico), FRETE15 (frete grátis acima R$ 5k)

**Ação:**
- Tentar aplicar BEMVINDO5 + PIXFIRST simultaneamente
- Tentar aplicar COMBO15 + FRETE15

**Esperado:**
- Regra (decisão de negócio): **1 cupom de desconto por pedido + 1 cupom de frete**
- BEMVINDO5 + PIXFIRST → rejeita o segundo: "Apenas 1 cupom de desconto por pedido. Mantenha [BEMVINDO5] ou substitua por [PIXFIRST]?"
- COMBO15 + FRETE15 → aceita ambos (um é desconto, outro é frete)
- Aplicação **deve ser sobre subtotal** (não sobre total + frete) — clarificação importante

**Risco se falhar:**
- Acumulação não controlada → cliente combina 4 cupons → preço final R$ 0 (já aconteceu)
- Margem destruída

**Critério passa:** matriz de combinações + regra "1 desconto + 1 frete" respeitada.

---

## 9. Builder com peça descontinuada (stock=null) escolhida

**Setup:**
- Cliente salvou build em janeiro (B650 X)
- Em abril, admin descontinuou B650 X (stock=null, isActive=false)
- Cliente acessa `/account/builds` e abre o build salvo

**Ação:**
- Visualizar build
- Tentar "Comprar tudo"

**Esperado:**
- Build mostra B650 X com flag visual: "❌ Não disponível mais"
- Sugestão automática: "Substituir por [B650 Y similar — R$ 720]"
- Botão "Comprar tudo" desabilitado até substituir
- Alternativa: "Comprar disponíveis" pula a B650 e adiciona o resto, alertando

**Risco se falhar:**
- Cliente compra build com peça inexistente → backend permite → entrega trava → suporte bombado

**Critério passa:** detecção + sugestão + bloqueio da compra direta.

---

## 10. PC montado tem peça que esgotou no catálogo individual

**Setup:**
- "Kore Valorant Pro" usa Ryzen 5 7600 + RTX 4060 + ...
- Admin vendeu todo o estoque de Ryzen 5 7600 individual (avulso, stock=0)
- Mas Kore Tech ainda tem 3 unidades do PC Pro montadas

**Ação:**
- Cliente abre `/pcs/kore-valorant-pro` (stock=3)
- Cliente compra

**Esperado:**
- PC montado tem `stock` próprio (independe das peças individuais — já está montado)
- Compra prossegue normalmente
- Se cliente também tentar comprar Ryzen 5 7600 avulso: aparece como esgotado + lista de espera

**Lógica:** `Product.stock` do `pc_full` é independente. As peças usadas pra montar foram debitadas do estoque quando admin "produziu" o PC.

**Risco se falhar:**
- Sistema bloqueia venda do PC porque "peça esgotada" (lógica errada de cascata)

**Critério passa:** PC montado vende independente de estoque de peça avulsa.

---

## 11. PIX expirado (cliente fechou pedido mas não pagou em 30 min)

**Setup:**
- Pedido criado com Pix
- TTL Pix MercadoPago: 30 min (configurável)
- Cliente abre QR mas não paga

**Ação:**
- Após 30 min, MercadoPago dispara webhook `payment.cancelled`
- Sistema processa

**Esperado:**
- Status do pedido muda pra "Expirado" (não "Cancelado" — não foi ação do cliente)
- Estoque é **devolvido** (Product.stock += quantity de cada item)
- Se foi PC montado stock=1, volta a stock=1 (disponível pra outros)
- Email pro cliente: "Seu Pix expirou. Quer tentar de novo? [Recriar pedido]"
- Cliente pode recriar pedido (novo pedido, mesmo carrinho restaurado)

**Risco se falhar:**
- Estoque não devolve → produto fica preso, outros clientes não compram
- Sem aviso → cliente pensa que pagou e está esperando entrega

**Critério passa:** webhook processado + estoque devolvido + email enviado.

---

## 12. Lacre violado em devolução

**Setup:**
- Cliente devolve produto por arrependimento (D+5)
- Loja recebe e inspeciona: lacre está rompido

**Ação:**
- Admin marca devolução como "Lacre violado" no painel

**Esperado:**
- Sistema oferece 2 caminhos:
  - **Aceitar mesmo assim**: reembolso completo (decisão comercial)
  - **Rejeitar**: estorna parcial (deduz % de desvalorização) ou rejeita total (com justificativa enviada ao cliente)
- Foto do lacre **antes** do envio (snapshot anexado ao pedido) serve de prova em disputa
- Cliente recebe email com justificativa + foto do lacre rompido
- Logado em audit trail (quem decidiu, quando, motivo)

**Risco se falhar:**
- Sem prova fotográfica → cliente abre disputa MercadoPago/Procon → loja perde
- Aceitar 100% sempre → loja absorve fraude (cliente compra GPU, troca por defeituosa, devolve)

**Critério passa:** 2 caminhos + foto do lacre + audit trail.

---

## 13. Cliente compra com cartão, depois pede troca de pagamento pra Pix (com desconto)

**Setup:**
- Pedido confirmado com cartão 12x
- Cliente lê "Pix dá 5% off com PIXFIRST" e quer mudar
- Pedido ainda não foi cobrado (ou pode ser estornado)

**Ação:**
- Cliente liga / WhatsApp pede troca

**Esperado:**
- Política definida (cliente decide):
  - Opção A: "Pagamento confirmado, não troca. Use Pix na próxima"
  - Opção B: Cancela pedido, recria com Pix (cliente refaz checkout)
- NÃO oferecer rebate retroativo (vira loophole)

**Risco se falhar:**
- Cliente exige rebate, ameaça Procon → loja cede → vira política não escrita → margem corrói

**Critério passa:** política clara em `/policies/troca-pagamento`, suporte alinhado.

---

## 14. Builder em mobile com erro de conexão

**Setup:**
- Cliente monta 6 peças no `/montar` em mobile (375px)
- Wi-Fi cai
- Cliente clica "Comprar tudo"

**Ação:**
- POST `/api/cart/items` falha com network error

**Esperado:**
- UI **não perde o estado do builder** (Zustand persistido em localStorage)
- Toast de erro: "Sem conexão. Suas peças foram salvas, tente novamente quando voltar"
- Botão "Comprar tudo" volta ao estado normal (não fica em loading infinito)
- Quando wi-fi volta, cliente clica de novo, funciona

**Risco se falhar:**
- Cliente perde 30 min de montagem → frustração → não volta

**Critério passa:** estado persistido + erro amigável + retry funciona.

---

## 15. Reserva de estoque expira sem compra (waitlist)

**Setup:**
- RTX 5080 entrou em estoque, 5 clientes na waitlist notificados
- Cliente A foi o primeiro, ganhou reserva 24h
- Cliente A não compra em 24h

**Ação:**
- Cron roda às 24h+1min após notificação

**Esperado:**
- Reserva de A é liberada
- Próximo da fila (B) recebe notificação + reserva 24h
- Estoque permanece o mesmo (1 unidade, agora pra B)
- A recebe email "Sua reserva expirou. O produto continua disponível pra compra normal"

**Risco se falhar:**
- Reserva nunca expira → estoque congela → outros não compram
- Múltiplas reservas simultâneas → 2 clientes acham que reservaram a mesma unidade

**Critério passa:** cron cron expira + transfere pra próximo + email automático.

---

## 16. Specs JSON malformado em PDP componente

**Setup:**
- Admin cadastra produto com `specs={"socket":"AM5","tdp":105}` corretamente
- Outro admin edita e quebra o JSON: `specs={"socket":"AM5","tdp":}` (inválido)

**Ação:**
- Backend valida no save (Zod) → rejeita
- Se passar (bug), frontend tenta renderizar SpecsTable

**Esperado:**
- Backend bloqueia JSON inválido no save: 400 Zod
- Frontend, se receber JSON inválido (defensivo), renderiza fallback: "Specs não disponíveis. Entre em contato"
- NÃO crashar a página com `JSON.parse error` ou `[object Object]`

**Risco se falhar:**
- PDP quebra → produto inacessível → vendas perdidas

**Critério passa:** validação no save + defensive render no frontend.

---

## 17. Comparador de "PC montado vs peças soltas" preço

**Setup:**
- "Kore Valorant Pro" custa R$ 6.500 (montado, com taxa de montagem inclusa)
- Soma das peças individuais = R$ 5.800 + R$ 350 (taxa de montagem cobrada à parte) = R$ 6.150

**Ação:**
- Acessar PDP do PC montado
- Ver comparador "Comprar montado vs comprar peças"

**Esperado:**
- Comparador honesto: mostra "Montado: R$ 6.500 / Peças soltas + montagem: R$ 6.150 / **Diferença: +R$ 350 pelo conforto**"
- OU: "Soma das peças: R$ 5.800 sem montagem (você monta sozinho)"
- NÃO mascarar pra forçar venda do montado

**Risco se falhar:**
- Comparador desonesto → cliente descobre, perde confiança
- Sem comparador → cliente vai pra concorrência calcular

**Critério passa:** comparador presente + valores honestos.

---

## 18. Email de "GPU disponível" chega pra cliente que já comprou outra

**Setup:**
- Cliente assinou waitlist da RTX 5080 em janeiro
- Em fevereiro, comprou RTX 4070 Super (não 5080) e desistiu da espera
- Em abril, RTX 5080 entra em estoque

**Ação:**
- Cron de waitlist dispara

**Esperado:**
- Sistema verifica: cliente está ativo na waitlist? (flag `unsubscribed=false`)
- Se cliente já comprou produto da mesma categoria recentemente, oferecer opt-out: "Você já comprou uma GPU. Continua querendo aviso da 5080?"
- Idealmente: cliente removeu manualmente em `/account/waitlist` quando comprou outra

**Risco se falhar:**
- Spam → cliente marca como spam → domínio perde reputação Resend → outros emails não chegam

**Critério passa:** flag de unsubscribe respeitada + UI de gerenciamento em `/account/waitlist`.

---

## 19. Build público compartilhado: tentar editar via slug

**Setup:**
- A criou build, marcou `isPublic=true`, gerou `shareSlug=valorant-monstro`
- B abre `/builds/share/valorant-monstro`

**Ação:**
- B tenta editar via `PATCH /api/builds/:id` (descobriu o ID via DevTools)

**Esperado:**
- 403 Forbidden (lição IDOR build no PENTEST)
- B só consegue: ver, copiar pro próprio carrinho, duplicar pra editar como build próprio
- Build duplicado é **fork**, não compartilha owner

**Risco se falhar:**
- Build de A é editado/deletado por B → frustração + perda de dados

**Critério passa:** PATCH/DELETE rejeita não-dono.

---

## 20. Estoque negativo (bug de race ou import errado)

**Setup:**
- Bug hipotético: por alguma falha, `Product.stock = -2`

**Ação:**
- Cliente tenta comprar
- Admin abre PDP no painel

**Esperado:**
- Frontend trata `stock <= 0` como esgotado (mostra "Avise-me quando voltar")
- Admin vê alerta no painel: "Estoque negativo detectado. Verifique manualmente"
- Backend tem constraint Postgres: `CHECK (stock >= 0)` ou validação no Prisma
- Logs alertam time de DevOps

**Risco se falhar:**
- UI mostra "−2 disponíveis" → bug visível ao cliente, perde credibilidade

**Critério passa:** constraint DB + frontend defensivo + alerta painel.

---

## Relatório final

```markdown
# Edge Cases — Kore Tech — <data>

## Cenários OK: N/20
## Cenários falharam: N/20
- Cenário X: descrição. Risco: ... Sugestão: ...

## Cenários novos descobertos durante teste:
- ...

## Veredito: APROVADO / APROVADO COM RESSALVAS / REPROVADO
```

## Princípio

Edge cases existem porque **realidade é mais maluca que planejamento**. Se descobrirmos um novo cenário durante teste, **adicionar aqui e atualizar `memoria/30-LICOES/`** se virou bug.

A diferença entre QA bom e QA ruim é cobertura de edge — qualquer dev faz happy path.
