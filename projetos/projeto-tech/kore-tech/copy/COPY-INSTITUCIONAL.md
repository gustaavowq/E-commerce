# Copy Institucional — Kore Tech

> Templates institucionais adaptáveis pra `/sobre`, `/contato`, `/policies/{garantia,troca,privacidade,termos}`.
> Frontend (Agente 03) renderiza essas páginas como rotas estáticas.
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Voz aplicada:**
- Institucional mas humano. Não corporativês.
- Sem travessão (`—`) em qualquer string.
- Sem palavras proibidas (lista de 10 do `BRAND-BRIEF.md` seção 2): nada de "tecnologia de ponta", "experiência única", "premium VIP", "revolucionário", "next-level", "gamers de verdade", etc.
- Privacidade e Termos são LGPD-friendly **sem** jurídico engessado. Cliente entende sem advogado.
- Sub-headlines com no máximo 2 linhas.
- Estrutura escaneável: H2 + 2 a 4 parágrafos curtos por seção.

**Estrutura comum a cada página:**
- **Hero:** H1 + subheadline curta
- **Conteúdo:** 3 a 6 seções
- **CTA contextual:** quando faz sentido (ex: contato leva pra WhatsApp; garantia leva pra abrir ticket)

---

## 1. /sobre — Quem somos

```yaml
slug: sobre
url: /sobre
meta_title: Sobre a Kore Tech · Hardware sério, montado certo
meta_description: A Kore Tech vende hardware com Builder de compatibilidade, FPS estimado por jogo e lista de espera ativa contra paper launch. Conheça a casa.
```

### Hero

```markdown
# Hardware sério, montado certo.

A Kore existe pra resolver 3 dores de quem compra hardware no Brasil:
medo de incompatibilidade, paper launch, e não saber se o PC vai rodar o que você quer rodar.
```

### Seção 1 — De onde a gente vem

```markdown
## De onde a gente vem

Quem montou PC nos últimos 10 anos no Brasil sabe: a parte boa do nicho é a comunidade. A parte ruim é fechar um carrinho de R$ 8 mil torcendo pra fonte aguentar a GPU, pro cooler caber no gabinete, pra placa-mãe servir na CPU.

A Kore Tech começou com um time que vinha de comunidade técnica (r/buildapcbrasil, Clube do Hardware, fóruns) e cansou de ver gente errando a fonte ou comprando GPU que não cabia. A loja é o que a gente queria ter quando montou o primeiro PC.
```

### Seção 2 — O que a gente faz diferente

```markdown
## O que a gente faz diferente

**Builder com checagem na hora.** 50+ regras de compatibilidade rodam enquanto você monta. Se a fonte não cobre a GPU, a gente sugere troca com diferença em reais. Se o cooler não cabe no gabinete, avisamos antes do checkout.

**Catálogo por uso, não por categoria.** Em vez de só "Placas de vídeo", você acha "PC pra Valorant 240 FPS" ou "PC pra rodar Llama 70B local". Cada uso tem build pronto e FPS estimado em jogo real.

**Lista de espera ativa.** Sem estoque hoje? Ativa "me avisa". Quando chegar, reservamos 24h pra você. Sem paper launch.
```

### Seção 3 — O que a gente promete

```markdown
## O que a gente promete

- **Estoque real, sempre visível.** Você vê quantas unidades temos antes de fechar.
- **Garantia que a gente intermedia.** Defeito? Fala com a gente, não com o fabricante.
- **Suporte humano antes da compra.** Dúvida no build? Manda no WhatsApp, a gente responde em horário comercial.
- **Nota fiscal em todo pedido.** Sem exceção, vem na caixa e por email.
```

### Seção 4 — O que a gente não faz (transparência)

```markdown
## O que a gente não faz (ainda)

- Não somos a maior loja do Brasil. Pichau e Kabum têm catálogo maior. Não competimos em volume.
- Não temos loja física. Demo do site, atendimento via WhatsApp e email, frete pra todo Brasil pelos Correios e Mercado Envios.
- Não trabalhamos com PC usado nem refurbished. Tudo é novo, com nota fiscal.
- Não fazemos overclock de fábrica em PC montado padrão. Se você quer, a gente conversa.

Quando crescer, contamos.
```

### Seção 5 — Time

```markdown
## Quem está atrás disso

Time pequeno, técnico, com mais tempo de comunidade que de varejo. Endereço fiscal em São Paulo, suporte distribuído.

Todos os PCs montados passam por teste de estresse de 24h (CPU, GPU, RAM) antes de sair. Quem monta é a mesma pessoa que escreve descrição de produto e responde no WhatsApp. Não tem call center.
```

### CTA final

```markdown
[Ver builds prontos](/builds)   ·   [Abrir o Builder](/montar)
```

---

## 2. /contato — Fale com a gente

```yaml
slug: contato
url: /contato
meta_title: Contato · Kore Tech · Suporte humano em horário comercial
meta_description: WhatsApp, email e formulário. Suporte humano segunda a sábado, 9h às 18h. Resposta em até 4h em horário comercial.
```

### Hero

```markdown
# Fala com a gente.

Suporte humano em horário comercial.
WhatsApp pra dúvida rápida, email pra coisa formal, formulário se preferir.
```

### Seção 1 — Canais

```markdown
## Canais de contato

### WhatsApp (mais rápido)
**{numero_whatsapp}**
Segunda a sábado, 9h às 18h.

[Abrir WhatsApp]({link_whatsapp_direto})

### Email
**suporte@kore.tech**
Resposta em até 24h úteis.

### Formulário
Use o formulário abaixo se preferir não usar WhatsApp/email.

### Telefone
A gente prefere mensagem (deixa registro escrito), mas se for caso urgente: **{numero_telefone}**.
```

### Seção 2 — O que mandar

```markdown
## Pra adiantar o atendimento

Antes de mandar mensagem, separa o que tiver disponível:

- **Número do pedido** (formato `#XXXX`, vem no email de confirmação)
- **CPF do titular do pedido**
- **Foto/vídeo curto se for problema técnico** (LED apagado, peça danificada, tela com artefato)
- **Mensagem de erro**, se for caso de software ou teste de pós-venda

Quanto mais info, mais rápido a gente resolve. Sem isso, primeiro a gente pede tudo, e aí demora.
```

### Seção 3 — O que NÃO faz pelo contato

```markdown
## O que pedimos não fazer

- **Não abre disputa no banco antes de falar com a gente.** Quase 100% dos casos a gente resolve direto. Disputa congela o pedido por 30 dias.
- **Não compartilha dado bancário ou senha.** A gente nunca pede senha por WhatsApp ou email. Se alguém pedir, é golpe.
- **Não promete reembolso ou troca via DM em redes sociais.** Suporte oficial é nos canais acima. Instagram e TikTok são só pra conteúdo.
```

### Seção 4 — Formulário

```markdown
## Formulário de contato

[FORM_FIELDS]
- Nome
- Email
- CPF (opcional)
- Número do pedido (opcional)
- Assunto (dropdown: dúvida pré-venda, problema com pedido, garantia/DOA, sugestão, outro)
- Mensagem (textarea, max 2000 chars)
- Anexar foto/vídeo (até 10MB)

CTA: "Enviar mensagem"

Sucesso: "Mensagem recebida. Resposta em até 24h úteis no email cadastrado."
```

### Seção 5 — Endereço fiscal e prazos

```markdown
## Endereço e horário

**CNPJ:** 00.000.000/0001-00
**Endereço fiscal:** Rua Placeholder, 000, São Paulo SP, CEP 00000-000

**Horário de atendimento humano:** segunda a sábado, 9h às 18h (horário de Brasília).
Domingo e feriado, ticket fica em fila e respondemos no próximo dia útil.

**SLA padrão de resposta:**
- WhatsApp em horário comercial: até 4h
- Email: até 24h úteis
- Caso DOA (defeito de fábrica): até 4h em horário comercial, com plano de coleta no mesmo dia
```

---

## 3. /policies/garantia

```yaml
slug: garantia
url: /policies/garantia
meta_title: Política de garantia · Kore Tech
meta_description: 7 dias arrependimento + 90 dias CDC + garantia fabricante de 12 a 36 meses, intermediada pela Kore. Como funciona, prazos, o que cobre.
```

### Hero

```markdown
# Garantia que a gente intermedia.

3 camadas de cobertura, sem você ter que falar com fabricante.
7 dias pra arrependimento, 90 dias do CDC, 12 a 36 meses do fabricante.
```

### Seção 1 — Quais garantias você tem

```markdown
## As 3 camadas de garantia

### 1. Arrependimento (7 dias do recebimento)
Direito do CDC artigo 49. Se mudou de ideia, devolve em até 7 dias do recebimento, sem precisar justificar. A gente reembolsa o valor integral, incluindo o frete que você pagou.

### 2. Garantia legal (90 dias do recebimento)
Direito do CDC. Cobre defeito não-aparente que apareça nos primeiros 90 dias. Vale pra todo produto novo.

### 3. Garantia contratual do fabricante (12 a 36 meses)
Cada peça vem com prazo do fabricante na descrição da PDP. Padrões comuns:
- Componentes (CPU, GPU, mobo, RAM): 12 a 36 meses
- Fonte: até 10 anos (Corsair RM série, EVGA Supernova)
- SSD: 5 anos
- Periféricos (mouse, teclado, headset): 12 a 24 meses
- Monitor: 12 a 36 meses
- PC montado completo: 12 meses Kore + garantia individual de cada peça
```

### Seção 2 — O que a Kore intermedia

```markdown
## Por que "intermediada pela Kore"

A lei diz que loja **e** fabricante são solidariamente responsáveis. A Kore assume o suporte do início ao fim:

- Você fala com a gente, não com fabricante chinês ou americano.
- A gente cuida de logística reversa, contato com fabricante e reposição.
- Se o fabricante demorar mais que 30 dias, a gente troca a peça pelo estoque, sem você pagar a conta da espera.
- Nota fiscal e comprovante de garantia ficam vinculados à sua conta na Kore. Você não precisa guardar nada.
```

### Seção 3 — DOA (Defeito de Fábrica)

```markdown
## DOA (Dead on Arrival): primeiros 30 dias

Se o produto chegou defeituoso ou parou de funcionar nos primeiros 30 dias, a gente troca sem perícia.

**Como funciona:**
1. Abre ticket DOA na sua conta ou pelo formulário de [contato](/contato).
2. Resposta em até 4h em horário comercial.
3. Coleta reversa pelos Correios, sem custo pra você.
4. Conferimos em até 2 dias úteis.
5. Se confirmado defeito de fábrica, mandamos peça nova. Se sem estoque, opção de equivalente ou reembolso integral via Pix.

**O que precisa:**
- Foto do produto com problema visível
- Foto do lacre da caixa (ajuda mas não é obrigatório)
- Número do pedido

Lacre violado **não invalida** garantia DOA. Foi você que abriu pra usar, claro. O que invalida é dano por uso (cair no chão, derramar líquido, queimar por sobretensão sem estabilizador, etc).
```

### Seção 4 — O que a garantia não cobre

```markdown
## Onde a garantia não vai

- Dano por mau uso (queda, líquido, calor extremo, sobretensão sem estabilizador)
- Modificação não-autorizada (overclock fora de spec, desbloqueio de firmware, abertura de peça selada)
- Desgaste natural (pasta térmica seca, switch de teclado mecânico após X milhões de cliques, ventoinha com rolamento gasto)
- Produtos sem nota fiscal Kore

Em caso de dúvida se a garantia se aplica, abre ticket que a gente avalia antes de cobrar qualquer coisa.
```

### Seção 5 — Como acionar

```markdown
## Acionar garantia em 3 passos

1. **Entra na sua conta** em /conta/pedidos e clica no pedido afetado.
2. **Botão "Acionar garantia"** abre formulário com sintoma e foto.
3. **Em até 4h** em horário comercial, retornamos com plano de ação (coleta, troca direta ou reposição).

Sem conta? Usa o [formulário de contato](/contato) com número do pedido e CPF.

[Acionar garantia agora](/conta/pedidos)
```

---

## 4. /policies/troca — Troca e devolução

```yaml
slug: troca
url: /policies/troca
meta_title: Troca e devolução · Kore Tech
meta_description: 7 dias pra arrependimento (CDC), 30 dias pra DOA, 90 dias pra garantia legal. Sem letra miúda. Reembolso integral em até 5 dias úteis.
```

### Hero

```markdown
# Troca e devolução, sem letra miúda.

7 dias pra arrependimento, 30 dias pra defeito de fábrica, 90 dias pra garantia legal.
Reembolso integral em até 5 dias úteis após chegada do produto aqui.
```

### Seção 1 — 3 cenários de devolução

```markdown
## 3 motivos pra devolver

### 1. Mudei de ideia (arrependimento, 7 dias)
Direito do CDC. Sem precisar justificar. Reembolso integral, incluindo frete de ida.

**Condição:** produto não pode ter sido usado a ponto de descaracterizar (PC montado e ligado conta, GPU instalada e testada conta). Se foi usado, ainda dá pra devolver, mas a gente avalia desgaste e desconta proporcional.

### 2. Defeito de fábrica nos primeiros 30 dias (DOA)
Troca sem perícia. Mais detalhes em [/policies/garantia](/policies/garantia).

### 3. Defeito que apareceu entre 30 e 90 dias (CDC)
Garantia legal cobre. Avaliação em laboratório (até 30 dias úteis). Se confirmado, troca ou reembolso. Se for dano por uso, te mostramos as fotos e conversamos.
```

### Seção 2 — Como devolver

```markdown
## Como devolver em 4 passos

1. **Entra em /conta/pedidos** e clica em "Solicitar devolução" no pedido.
2. **Escolhe motivo** (arrependimento, DOA, garantia legal).
3. **Receba código de coleta** dos Correios em até 24h úteis. Sem custo pra você em caso de DOA ou CDC. Em arrependimento, frete de retorno é por sua conta (CDC art. 49 §3, opcional).
4. **Embala e despacha.** Caixa original ajuda mas não é obrigatória. Nota fiscal vai junto.

Chegando aqui, a gente confere em até 2 dias úteis. Reembolso vai pelo método original do pagamento (Pix devolve em Pix; cartão estorna no cartão).
```

### Seção 3 — Prazos de reembolso

```markdown
## Prazos de reembolso

- **Pix:** até 2 dias úteis após confirmação da devolução
- **Cartão de crédito:** até 5 dias úteis pra estornar (operadora pode levar até 2 faturas pra refletir, fora do nosso controle)
- **Boleto:** até 5 dias úteis via Pix ou TED, na conta que você indicar
```

### Seção 4 — O que não dá pra trocar

```markdown
## O que não tem como devolver

- Produto personalizado sob encomenda (PC com configuração customizada além das opções padrão da loja)
- Produto com dano por uso comprovado
- Produto sem nota fiscal Kore
- Software de licença ativada (a key vira ativa, sem volta)

Em caso de dúvida, abre ticket antes de comprar.
```

### CTA final

```markdown
[Solicitar devolução agora](/conta/pedidos)   ·   [Falar com suporte](/contato)
```

---

## 5. /policies/privacidade — Política de privacidade

```yaml
slug: privacidade
url: /policies/privacidade
meta_title: Política de privacidade · Kore Tech
meta_description: Como a Kore Tech coleta, usa e protege seus dados pessoais conforme a LGPD. Sem letra miúda jurídica, com linguagem que dá pra entender.
```

### Hero

```markdown
# Política de privacidade.

A Kore Tech coleta o mínimo necessário pra processar seu pedido e te avisar de estoque novo.
Você pode ver, editar ou apagar seus dados quando quiser.
```

### Seção 1 — Quem é o controlador

```markdown
## Quem cuida dos seus dados

**Controlador dos dados:** Kore Tech (CNPJ 00.000.000/0001-00)
**Encarregada de Dados (DPO):** {nome_dpo} ({email_dpo})
**Endereço:** Rua Placeholder, 000, São Paulo SP

Em qualquer dúvida sobre seus dados, escreve pro DPO. Resposta em até 15 dias úteis (prazo da LGPD).
```

### Seção 2 — Que dados coletamos

```markdown
## Que dados coletamos e por quê

| Dado | Por que coletamos | Base legal |
|---|---|---|
| Nome, email, telefone, CPF | Cadastro, emissão de nota fiscal, contato sobre pedidos | Execução de contrato (LGPD art. 7º V) |
| Endereço de entrega | Logística do pedido | Execução de contrato |
| Dados de pagamento | Processamento via MercadoPago (a Kore não armazena número de cartão completo) | Execução de contrato |
| Histórico de pedidos | Suporte, garantia, recomendação | Legítimo interesse e execução de contrato |
| Cookies de analytics (GA4, Meta Pixel) | Medir o que funciona, melhorar a loja | Consentimento (banner cookie) |
| Dados de navegação no site | Análise de uso agregada | Legítimo interesse |
| Email pra newsletter | Avisos de estoque novo, cupons | Consentimento (você aceitou explicitamente) |

**O que não coletamos:** dados de saúde, biometria, religião, opinião política, dado de menor de 12 anos sem consentimento parental explícito.
```

### Seção 3 — Com quem compartilhamos

```markdown
## Com quem compartilhamos dado

Só com quem precisa pra processar seu pedido:

- **MercadoPago:** processa pagamento (Pix, cartão, boleto). [Política do MP]({link_mp_privacy})
- **Correios e transportadoras:** entrega física. Recebem nome, endereço, telefone.
- **Cloudinary:** hospedagem de imagens. Não recebe dado pessoal.
- **Resend:** envio de email transacional. Recebe email e nome.
- **Google Analytics 4 e Meta Pixel:** análise de uso, com seu consentimento.

**O que NÃO fazemos:** vender lista de email, compartilhar dado com afiliado terceirizado pra remarketing fora dos canais oficiais (Google Ads / Meta Ads via Pixel próprio).
```

### Seção 4 — Quanto tempo guardamos

```markdown
## Por quanto tempo guardamos

- **Dados de pedido (NF, valor, endereço de entrega):** 5 anos após a última compra (obrigação fiscal)
- **Logs de acesso ao site:** 6 meses (Marco Civil da Internet)
- **Cookies de analytics:** até você sair do site ou retirar consentimento
- **Conta de cliente inativa:** 3 anos sem acesso, depois excluímos (você pode pedir exclusão antes a qualquer momento)
```

### Seção 5 — Seus direitos LGPD

```markdown
## O que você pode fazer com seus dados

A LGPD garante 9 direitos. A gente atende todos:

1. **Confirmar** se a Kore tem dado seu
2. **Acessar** os dados que temos sobre você
3. **Corrigir** dado errado ou desatualizado
4. **Anonimizar, bloquear ou apagar** dado desnecessário
5. **Portabilidade** (pedir cópia dos seus dados em formato CSV)
6. **Eliminar** dados tratados com base em consentimento
7. **Saber com quem** compartilhamos dado
8. **Saber sobre** consequências de não dar consentimento
9. **Revogar consentimento** a qualquer momento

**Como exercer:** acessa /conta/privacidade ou escreve pro DPO no email acima. Resposta em até 15 dias úteis.
```

### Seção 6 — Cookies

```markdown
## Cookies

Quando você entra no site pela primeira vez, mostramos um banner pedindo aceite. Você escolhe:

- **Só os essenciais** (login, carrinho, segurança): obrigatórios pra loja funcionar, não dá pra desligar
- **Analytics** (GA4): nos ajuda a entender o que funciona; pode desligar a qualquer momento
- **Marketing** (Meta Pixel): nos ajuda a mostrar produtos relevantes em outros sites; pode desligar

Você pode mudar a escolha em /conta/cookies a qualquer momento.
```

### Seção 7 — Mudanças e contato

```markdown
## Mudanças nessa política

Quando a gente mudar algo significativo, avisamos por email pra todos com conta ativa, com 15 dias de antecedência. Versão sempre datada no topo (vide última atualização: 2026-04-26).

## Pra falar com a Encarregada de Dados

Email: dpo@kore.tech
Endereço: Rua Placeholder, 000, São Paulo SP
Resposta em até 15 dias úteis.

Se preferir, pode reclamar direto na ANPD (Autoridade Nacional de Proteção de Dados) pelo site oficial gov.br/anpd.
```

---

## 6. /policies/termos — Termos de uso

```yaml
slug: termos
url: /policies/termos
meta_title: Termos de uso · Kore Tech
meta_description: Regras de uso da loja Kore Tech. Quem pode comprar, formas de pagamento, conduta esperada, limitações de responsabilidade.
```

### Hero

```markdown
# Termos de uso.

Regras pra usar a Kore Tech. Em português, sem juridiquês desnecessário.
Última atualização: 2026-04-26.
```

### Seção 1 — Quem somos

```markdown
## Quem somos

A Kore Tech é uma loja online de hardware (PCs montados, componentes, monitores e periféricos) operada pela {razao_social} (CNPJ 00.000.000/0001-00), com endereço fiscal na Rua Placeholder, 000, São Paulo SP.

Esses termos valem pra qualquer uso do site kore.tech, do painel de cliente, e do atendimento via WhatsApp e email.
```

### Seção 2 — Quem pode comprar

```markdown
## Quem pode comprar

- Pessoa física maior de 18 anos com CPF ativo
- Pessoa jurídica com CNPJ ativo
- Endereço de entrega no Brasil

Compras feitas em nome de menor de 18 anos precisam ter responsável legal informado no checkout. Se você é menor, pede pra alguém maior fazer a compra.
```

### Seção 3 — Cadastro e conta

```markdown
## Sua conta

- Você é responsável pela senha. A gente nunca pede senha por WhatsApp ou email.
- Se desconfia que alguém entrou na sua conta, troca a senha em /conta/seguranca e avisa a gente.
- A Kore pode suspender ou cancelar conta em casos de fraude, abuso de cupom (criar contas falsas pra ganhar BEMVINDO5 várias vezes), ataque ao site, ou uso pra fim ilegal.
```

### Seção 4 — Preço, pagamento e impostos

```markdown
## Preço, pagamento, impostos

- **Preços em R$.** Mercado de hardware é volátil em 2026. A gente atualiza preço várias vezes por dia. O preço que vale é o que aparece na tela na hora do checkout.
- **Erro de preço:** se um produto for publicado com preço claramente errado (ex: RTX 5090 a R$ 99), a gente cancela o pedido e estorna integral. Boa fé pra ambos os lados.
- **Pagamento via MercadoPago.** Pix com 5% off, cartão de crédito até 12x sem juros, boleto à vista. A Kore não armazena dado de cartão (só MercadoPago).
- **Nota fiscal eletrônica** sai junto com o produto e por email em até 48h.
- **ICMS, frete e Difal** (em vendas interestaduais) já vêm calculados no checkout.
```

### Seção 5 — Entrega

```markdown
## Entrega

- **Prazo estimado** aparece no checkout, calculado pelo CEP. Conta dias úteis a partir da confirmação do pagamento.
- **PC montado:** 3 dias úteis de montagem + prazo de envio. Total típico de 5 a 10 dias úteis pra capital, 7 a 14 pra interior.
- **Componente avulso e periférico:** envio em 24h após pagamento confirmado.
- **Frete asseguro até R$ 15.000** sem custo extra pra você. Em caso de extravio ou dano em transporte, a gente refaz o pedido e cobra do seguro.
- **Tentativas de entrega:** 3 tentativas pelos Correios. Após isso, encomenda volta pra agência. Se não retirar em 7 dias, volta pra Kore. Reenvio cobra novo frete.
```

### Seção 6 — Conduta esperada

```markdown
## Conduta esperada

- Não tentar burlar a loja (ataques, bots de scraping massivo, criação de conta falsa pra cupom).
- Não usar a loja pra revenda profissional sem CNPJ declarado e contato comercial direto.
- Comentários e avaliações de produto devem ser sobre o produto, não ofensa pessoal a outro cliente.
- A Kore pode remover review com xingamento, conteúdo discriminatório ou spam, sem aviso prévio.
```

### Seção 7 — Garantia, troca e devolução

```markdown
## Garantia, troca e devolução

Resumo:
- **7 dias** pra arrependimento (CDC art. 49)
- **30 dias** pra DOA (defeito de fábrica)
- **90 dias** pra garantia legal (CDC)
- **12 a 36 meses** de garantia do fabricante, intermediada pela Kore

Detalhes em [/policies/garantia](/policies/garantia) e [/policies/troca](/policies/troca).
```

### Seção 8 — Limitação de responsabilidade

```markdown
## Limitação de responsabilidade

A Kore se responsabiliza por:
- Defeito de fábrica do produto (DOA + garantia legal + garantia fabricante)
- Erro de descrição ou divergência entre produto entregue e produto anunciado
- Falha logística com seguro acionado

A Kore **não** se responsabiliza por:
- Dano por uso inadequado (queda, líquido, sobretensão sem estabilizador, overclock fora de spec)
- Incompatibilidade com hardware antigo do cliente que não foi declarado no momento da compra
- Performance abaixo do esperado em jogos ou softwares **não** listados como referência na PDP do produto
- Atraso nos Correios em greve, calamidade pública ou força maior (a gente acompanha e te ajuda, mas não controla)
```

### Seção 9 — Garantia de performance (selecionados)

```markdown
## Garantia de performance (PCs selecionados)

Em PCs montados com selo "Garantia de Performance", a gente promete o FPS específico listado na PDP. Se você receber e o PC não rodar o número prometido na configuração descrita, devolve em 7 dias com reembolso integral.

Vale pra build idêntico, jogo idêntico, resolução idêntica e qualidade gráfica idêntica à descrita. Não vale pra:
- Configuração customizada além do build padrão
- Testes em jogo ou versão diferente do listado
- Hardware adicional do cliente (segundo monitor 8K, headset que ocupa USB que muda comportamento, etc) que afete medição
```

### Seção 10 — Foro e contato

```markdown
## Foro e contato

- **Foro:** São Paulo SP, salvo eleição diferente do CDC.
- **Lei aplicável:** Código de Defesa do Consumidor (Lei 8.078/90), Marco Civil da Internet (Lei 12.965/14), LGPD (Lei 13.709/18).
- **Mudança de termos:** a gente pode atualizar com aviso de 15 dias por email pra contas ativas. A versão vigente é sempre a que está nessa página.

**Contato pra qualquer assunto contratual:** suporte@kore.tech ou [/contato](/contato).
```

---

## Padrões cross-página institucional

### Tom

- **Próximo, não casual demais.** "A gente cuida" é OK; "Nóis cuida" não. "Você" é OK; "Tu" não.
- **Honesto sobre limites.** "A gente não é a maior loja" funciona melhor que afirmação inflada.
- **Listas e tabelas em vez de parágrafos longos.** Cliente do nicho varre em vez de ler.

### Headers

- **H1 único por página**, no hero, com ponto final ("Hardware sério, montado certo." é um H1 completo).
- **H2 por seção**, máximo 6 por página.
- **H3 dentro de H2** quando precisa subdividir.

### Listas

- Bullets quando ordem não importa.
- Lista numerada quando é processo passo a passo.
- Tabela quando é relação chave-valor estruturada (dados pessoais, prazos, garantias).

### CTAs em página institucional

- **CTA primário** quando faz sentido (ex: garantia leva pra "Acionar garantia agora").
- **CTAs secundários** em links inline ("[Falar com suporte](/contato)").
- Nunca "Saiba mais" ou "Clique aqui". Sempre verbo de ação real.

### Variáveis a substituir antes do go-live

- `{razao_social}`, `{numero_whatsapp}`, `{link_whatsapp_direto}`, `{numero_telefone}`
- `{nome_dpo}`, `{email_dpo}`
- `{link_mp_privacy}`
- Endereço fiscal real

Hoje todas estão como placeholder porque demo é fictícia.

---

## Pendências pra outros agentes

- **[Frontend]** Renderiza essas páginas como rotas estáticas em `app/(loja)/sobre/page.tsx`, `app/(loja)/contato/page.tsx`, `app/(loja)/policies/[slug]/page.tsx`. Markdown vira JSX via `react-markdown` ou MDX. Cabeçalho usa `metadata` do Next.js com `meta_title` e `meta_description` listados em cada YAML.
- **[Designer]** Páginas institucionais usam mesmo grid e tipografia da home. Hero tem padding maior em desktop pra dar respiro.
- **[DevOps]** `/policies/privacidade` e `/policies/termos` precisam estar **sempre acessíveis** (não atrás de auth), inclusive em modo de manutenção. Sitemap incluí.
- **[Growth]** JSON-LD `WebPage` em cada página. `meta_description` vai pra `<Head>`. `/contato` ganha schema `Organization` com canais.
- **[Backend]** Endpoint `/api/contact-form` recebe POST do formulário em /contato. Salva em tabela `ContactMessage` (campos: nome, email, cpf, pedido, assunto, mensagem, anexos). Notifica suporte por email/Slack.
- **[QA]** Validar HTML semântico (H1 único, lista alt, link com texto descritivo). Validar contraste WCAG AA em links institucionais.
