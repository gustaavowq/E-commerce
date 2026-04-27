# Copy UI — Kore Tech

> Toda string visível ao cliente, organizada por contexto de tela. **Frontend (Agente 03) copia daqui sem alterar.**
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Regras de ouro (de `BRAND-VOICE.md`):**
- Sem travessão (`—`) em qualquer string.
- Sem emoji em UI da loja (ícone SVG ok). Email transacional pode ter 1 emoji discreto.
- "Você" sempre. "A gente" preferido sobre "nós" em UI casual.
- Pix vem 1º com badge "5% off".
- Verbo de ação no CTA. Nunca "Clique aqui".

**Mapeamento por slug** — cada string tem um slug em `lower-kebab` pra Frontend referenciar (`ui.header.search.placeholder`).

---

## 1. Header

### Top bar (anúncio rotativo)
```
ui.topbar.frete-gratis     →  Frete grátis acima de R$ 5.000 pra todo Brasil
ui.topbar.pix-off          →  Pix com 5% off em qualquer produto
ui.topbar.parcelamento     →  Até 12x sem juros no cartão
ui.topbar.builder          →  Compatibilidade checada na hora no Builder
```
Rotação: 1 mensagem a cada 5s. Pausa no hover.

### Nav principal
```
ui.nav.inicio              →  Início
ui.nav.loja                →  Loja
ui.nav.builder             →  Builder
ui.nav.builds              →  Builds prontos
ui.nav.sobre               →  Sobre
ui.nav.contato             →  Contato
```

### Submenu "Loja" (megamenu)
```
ui.megamenu.loja.titulo                →  Componentes
ui.megamenu.loja.cpu                   →  Processadores
ui.megamenu.loja.gpu                   →  Placas de vídeo
ui.megamenu.loja.mobo                  →  Placas-mãe
ui.megamenu.loja.ram                   →  Memória RAM
ui.megamenu.loja.storage               →  SSD e HD
ui.megamenu.loja.psu                   →  Fontes
ui.megamenu.loja.case                  →  Gabinetes
ui.megamenu.loja.cooler                →  Coolers e watercoolers
ui.megamenu.loja.monitor               →  Monitores
ui.megamenu.loja.perifericos           →  Mouse, teclado, headset
```

### Submenu "Builds prontos" (por persona)
```
ui.megamenu.builds.titulo              →  Builds prontos
ui.megamenu.builds.subtitle            →  PCs montados pra cada uso
ui.megamenu.builds.valorant            →  Valorant 240 FPS
ui.megamenu.builds.fortnite            →  Fortnite competitivo
ui.megamenu.builds.cs2                 →  CS2 high-tier
ui.megamenu.builds.edicao              →  Edição 4K
ui.megamenu.builds.streaming           →  Streaming
ui.megamenu.builds.ia                  →  IA local Llama
ui.megamenu.builds.workstation         →  Workstation 3D
ui.megamenu.builds.entry               →  Entry gamer
ui.megamenu.builds.cta                 →  Ver todos os builds
```

### Busca
```
ui.search.placeholder      →  Busca peça, modelo ou jogo
ui.search.button-aria      →  Buscar
ui.search.recent           →  Buscas recentes
ui.search.popular          →  Mais buscadas
ui.search.clear            →  Limpar busca
```

### Ações do usuário (header direita)
```
ui.header.login            →  Entrar
ui.header.cadastrar        →  Criar conta
ui.header.minha-conta      →  Minha conta
ui.header.favoritos-aria   →  Meus favoritos
ui.header.carrinho-aria    →  Carrinho de compras
ui.header.carrinho-badge   →  {n}            (número de itens)
```

---

## 2. Footer

### Coluna 1 — Loja
```
ui.footer.col1.titulo      →  Loja
ui.footer.col1.builds      →  Builds prontos
ui.footer.col1.builder     →  Monte seu PC
ui.footer.col1.componentes →  Componentes
ui.footer.col1.monitores   →  Monitores
ui.footer.col1.perifericos →  Periféricos
ui.footer.col1.ofertas     →  Ofertas
```

### Coluna 2 — Atendimento
```
ui.footer.col2.titulo      →  Atendimento
ui.footer.col2.contato     →  Fale com a gente
ui.footer.col2.faq         →  Perguntas frequentes
ui.footer.col2.garantia    →  Garantia
ui.footer.col2.troca       →  Troca e devolução
ui.footer.col2.frete       →  Frete e prazo
ui.footer.col2.glossario   →  Glossário técnico
```

### Coluna 3 — Sobre
```
ui.footer.col3.titulo      →  Kore Tech
ui.footer.col3.sobre       →  Quem somos
ui.footer.col3.blog        →  Blog
ui.footer.col3.afiliados   →  Afiliados
ui.footer.col3.privacidade →  Privacidade
ui.footer.col3.termos      →  Termos de uso
```

### Coluna 4 — Newsletter
```
ui.footer.col4.titulo      →  Fica por dentro
ui.footer.col4.subtitulo   →  Receba avisos de estoque novo de GPU/CPU e cupons
ui.footer.col4.placeholder →  voce@email.com
ui.footer.col4.cta         →  Cadastrar
ui.footer.col4.success     →  Pronto, te avisamos por email
ui.footer.col4.privacy     →  Sem spam. Cancela quando quiser.
```

### Bottom bar
```
ui.footer.copyright        →  © {ano} Kore Tech. Hardware sério, montado certo.
ui.footer.cnpj             →  CNPJ 00.000.000/0001-00
ui.footer.endereco         →  Rua Placeholder, 000, São Paulo SP
```

### Trust badges (linha logo acima do bottom)
```
ui.footer.badge.entrega    →  Entrega Brasil todo
ui.footer.badge.garantia   →  Garantia oficial
ui.footer.badge.nf         →  Nota fiscal em todo pedido
ui.footer.badge.pagamento  →  Pix, cartão até 12x
```

---

## 3. Home

### Hero principal
```
ui.home.hero.h1            →  Monte certo. Jogue alto.
ui.home.hero.sub           →  PCs montados pra Valorant 240 FPS, edição 4K e IA local.
                              Ou monta o seu, a gente checa as peças.
ui.home.hero.cta-primary   →  Ver builds prontos
ui.home.hero.cta-secondary →  Montar do zero
```

### USPs (4 cards abaixo do hero)
```
ui.home.usp.1.headline     →  Compatibilidade checada
ui.home.usp.1.sub          →  50+ regras de compatibilidade rodam no Builder antes de você fechar.

ui.home.usp.2.headline     →  FPS estimado em jogo real
ui.home.usp.2.sub          →  Cada PC pronto mostra quanto roda em Valorant, Fortnite e CS2.

ui.home.usp.3.headline     →  12x sem juros, 5% off no Pix
ui.home.usp.3.sub          →  Parcela tudo no cartão ou paga Pix com 5% de desconto.

ui.home.usp.4.headline     →  Avisamos quando voltar ao estoque
ui.home.usp.4.sub          →  Ativa "me avise" e a gente reserva 24h pra você quando chegar.
```

### Section "Builds prontos por uso"
```
ui.home.section.builds.h2          →  Builds prontos pra cada uso
ui.home.section.builds.sub         →  Selecionados pelo time, com FPS estimado em jogo real.
ui.home.section.builds.cta-link    →  Ver todos os builds
```

### Section "Componentes em destaque"
```
ui.home.section.componentes.h2     →  Componentes em destaque
ui.home.section.componentes.sub    →  Peças mais procuradas, em estoque pra envio em 24h.
ui.home.section.componentes.cta    →  Ver catálogo completo
```

### Section "Anti paper launch" (lista de espera)
```
ui.home.section.waitlist.h2        →  Estoque novo, primeiro pra quem se inscreve
ui.home.section.waitlist.sub       →  Sem estoque hoje? Ativa o aviso e a gente reserva 24h pra você quando chegar.
ui.home.section.waitlist.cta       →  Ver produtos sem estoque
```

### Section "Builder em 4 passos" (mini-explainer)
```
ui.home.section.builder.h2         →  Monte do zero em 4 passos
ui.home.section.builder.passo1     →  Escolhe o processador
ui.home.section.builder.passo2     →  A gente filtra placas-mãe compatíveis
ui.home.section.builder.passo3     →  Adiciona RAM, GPU, fonte (com sugestão automática)
ui.home.section.builder.passo4     →  Salva, compartilha ou compra direto
ui.home.section.builder.cta        →  Abrir Builder
```

### Section "Por que comprar na Kore"
```
ui.home.section.trust.h2           →  Por que Kore Tech
ui.home.section.trust.item1.h3     →  Estoque real, exibido na PDP
ui.home.section.trust.item1.body   →  Você vê quantas unidades temos em SP antes de fechar.

ui.home.section.trust.item2.h3     →  Garantia que a gente intermedia
ui.home.section.trust.item2.body   →  Defeito? Fala com a gente, não com o fabricante.

ui.home.section.trust.item3.h3     →  Frete que cabe gabinete de 15kg
ui.home.section.trust.item3.body   →  Embalagem reforçada, asseguro até R$ 15 mil.

ui.home.section.trust.item4.h3     →  Suporte humano antes da compra
ui.home.section.trust.item4.body   →  Dúvida no build? Manda no Zap, a gente responde.
```

---

## 4. PLP — Página de listagem de produtos

### Header da página
```
ui.plp.title.template      →  {Categoria}              (ex: "Placas de vídeo", "Processadores")
ui.plp.subtitle.template   →  {n} produtos
ui.plp.breadcrumb.home     →  Início
ui.plp.breadcrumb.loja     →  Loja
```

### Filtros (sidebar)
```
ui.plp.filters.titulo              →  Filtros
ui.plp.filters.limpar              →  Limpar tudo
ui.plp.filters.categoria           →  Categoria
ui.plp.filters.marca               →  Marca
ui.plp.filters.preco               →  Faixa de preço
ui.plp.filters.preco.min           →  Mín
ui.plp.filters.preco.max           →  Máx
ui.plp.filters.persona             →  Pra qual uso
ui.plp.filters.estoque             →  Disponibilidade
ui.plp.filters.estoque.disponivel  →  Em estoque
ui.plp.filters.estoque.waitlist    →  Aceito esperar (lista)
ui.plp.filters.aplicar             →  Aplicar
ui.plp.filters.toggle-mobile       →  Filtros e ordenação
```

### Filtros específicos de CPU
```
ui.plp.filters.cpu.socket          →  Socket
ui.plp.filters.cpu.tdp             →  Consumo (TDP)
ui.plp.filters.cpu.cores           →  Núcleos
```

### Filtros específicos de GPU
```
ui.plp.filters.gpu.vram            →  VRAM
ui.plp.filters.gpu.consumo         →  Consumo de energia
ui.plp.filters.gpu.length          →  Comprimento (cabe no gabinete)
```

### Ordenação
```
ui.plp.sort.label                  →  Ordenar por
ui.plp.sort.relevance              →  Mais relevantes
ui.plp.sort.price-asc              →  Menor preço
ui.plp.sort.price-desc             →  Maior preço
ui.plp.sort.newest                 →  Mais recentes
ui.plp.sort.fps                    →  Maior FPS estimado     (só nas listagens de PC)
```

### Resultado
```
ui.plp.results.count.singular      →  1 produto encontrado
ui.plp.results.count.plural        →  {n} produtos encontrados
ui.plp.results.applied-filters     →  Filtros aplicados:
ui.plp.results.remove-filter-aria  →  Remover filtro {nome}
```

### Paginação
```
ui.plp.pagination.prev             →  Anterior
ui.plp.pagination.next             →  Próxima
ui.plp.pagination.page             →  Página {n} de {total}
```

### Card do produto (PLP)
```
ui.plp.card.in-stock               →  Em estoque
ui.plp.card.last-units             →  Últimas {n} unidades
ui.plp.card.out-of-stock           →  Sem estoque
ui.plp.card.notify-me              →  Me avisa quando chegar
ui.plp.card.parcela                →  ou 12x R$ {valor} sem juros
ui.plp.card.pix                    →  Pix R$ {valor} com 5% off
ui.plp.card.cta-view               →  Ver detalhes
ui.plp.card.cta-quick-add          →  Adicionar
```

---

## 5. PDP — Página de produto (componente avulso)

### Bloco superior (acima da dobra)
```
ui.pdp.brand.label                 →  Marca:
ui.pdp.sku.label                   →  Código:
ui.pdp.warranty.label              →  Garantia:
ui.pdp.warranty.template           →  {n} meses fabricante + 90 dias CDC
ui.pdp.stock.in                    →  Em estoque, envio em 24h
ui.pdp.stock.last                  →  Últimas {n} unidades em SP
ui.pdp.stock.out                   →  Sem estoque no momento
```

### Preço
```
ui.pdp.price.from                  →  A partir de
ui.pdp.price.now                   →  Por
ui.pdp.price.was                   →  De R$ {valor}
ui.pdp.price.discount              →  {n}% off
ui.pdp.price.installments          →  ou em até 12x R$ {valor} sem juros
ui.pdp.price.pix.label             →  Pix
ui.pdp.price.pix.value             →  R$ {valor}
ui.pdp.price.pix.badge             →  5% off
ui.pdp.price.see-installments      →  Ver opções de parcelamento
```

### Modal de parcelamento
```
ui.pdp.installments.modal.title    →  Parcelamento
ui.pdp.installments.modal.row      →  {n}x de R$ {valor} sem juros
ui.pdp.installments.modal.pix      →  Pix à vista R$ {valor} (5% off)
ui.pdp.installments.modal.close    →  Fechar
```

### CTAs
```
ui.pdp.cta.add                     →  Adicionar ao carrinho
ui.pdp.cta.buy-now                 →  Comprar agora
ui.pdp.cta.add-to-build            →  Adicionar ao meu build
ui.pdp.cta.notify-me               →  Me avisa quando chegar
ui.pdp.cta.favorite-aria           →  Adicionar aos favoritos
ui.pdp.cta.share-aria              →  Compartilhar produto
```

### Trust signals (bloco lateral)
```
ui.pdp.trust.original              →  Original, com nota fiscal
ui.pdp.trust.warranty              →  Garantia intermediada pela Kore
ui.pdp.trust.shipping              →  Frete asseguro até R$ 15.000
ui.pdp.trust.doa                   →  Defeito de fábrica? Trocamos em 7 dias
ui.pdp.trust.return                →  7 dias pra devolver, mesmo sem defeito
```

### Abas (tabs)
```
ui.pdp.tabs.specs                  →  Especificações
ui.pdp.tabs.compatibility          →  Compatibilidade
ui.pdp.tabs.reviews                →  Avaliações
ui.pdp.tabs.faq                    →  Perguntas
```

### Conteúdo aba "Especificações"
```
ui.pdp.specs.titulo                →  Ficha técnica
ui.pdp.specs.empty                 →  Especificações chegam em breve.
```

### Conteúdo aba "Compatibilidade"
```
ui.pdp.compat.titulo               →  Compatibilidade
ui.pdp.compat.intro                →  Essa peça serve com:
ui.pdp.compat.cta                  →  Testar no Builder
ui.pdp.compat.empty                →  Sem regras de compatibilidade pra esse produto.
```

### Conteúdo aba "Avaliações"
```
ui.pdp.reviews.titulo              →  Avaliações
ui.pdp.reviews.average             →  {n}/5 com base em {total} avaliações
ui.pdp.reviews.empty               →  Ainda sem avaliações. Compre e seja o primeiro.
ui.pdp.reviews.cta-write           →  Escrever avaliação
ui.pdp.reviews.helpful             →  Útil ({n})
ui.pdp.reviews.report              →  Reportar
```

### Conteúdo aba "Perguntas"
```
ui.pdp.faq.titulo                  →  Perguntas e respostas
ui.pdp.faq.cta-ask                 →  Fazer uma pergunta
ui.pdp.faq.empty                   →  Sem perguntas ainda. Manda a sua que a gente responde.
ui.pdp.faq.answered-by             →  Respondido pela Kore
```

### Cross-sell
```
ui.pdp.crosssell.also-bought       →  Quem comprou também levou
ui.pdp.crosssell.complete-build    →  Pra fechar o build
ui.pdp.crosssell.upgrade           →  Considere também
```

---

## 6. PDP — Página de PC montado

### Hero do PC
```
ui.pdp-pc.kicker                   →  PC montado · {persona-nome}
ui.pdp-pc.tier                     →  Tier {nome}
ui.pdp-pc.h1.template              →  {nome do PC}
ui.pdp-pc.tagline.template         →  {GPU} + {CPU} + {RAM}
```

### FPS estimado (cards destaque)
```
ui.pdp-pc.fps.titulo               →  FPS estimado em jogo real
ui.pdp-pc.fps.method               →  Medido com FRAPS na configuração descrita. Variação de até 10% conforme cenário.
ui.pdp-pc.fps.card.template        →  {jogo}                    {fps} FPS
                                      {resolucao} {qualidade}
```

### Lista de peças que vêm dentro
```
ui.pdp-pc.parts.titulo             →  Peças que vêm dentro
ui.pdp-pc.parts.cta-detail         →  Ver detalhes da peça
ui.pdp-pc.parts.cta-compare        →  Comparar com peças soltas
```

### Modal "Comparar com peças soltas"
```
ui.pdp-pc.compare.titulo           →  Montado vs comprando peças soltas
ui.pdp-pc.compare.h.col1           →  Comprando montado
ui.pdp-pc.compare.h.col2           →  Comprando peça por peça
ui.pdp-pc.compare.row.parts        →  Soma das peças
ui.pdp-pc.compare.row.assembly     →  Mão de obra (R$ 350)
ui.pdp-pc.compare.row.test         →  Teste e benchmark
ui.pdp-pc.compare.row.warranty     →  Garantia única na Kore
ui.pdp-pc.compare.row.shipping     →  Frete único
ui.pdp-pc.compare.row.total        →  Total
ui.pdp-pc.compare.savings          →  Economia: R$ {valor}
ui.pdp-pc.compare.close            →  Fechar
```

### Build-to-order info
```
ui.pdp-pc.bto.titulo               →  Como chega
ui.pdp-pc.bto.passo1               →  Pedido confirmado, montagem em até 3 dias úteis
ui.pdp-pc.bto.passo2               →  Teste de 24h ligado em estresse (CPU + GPU + RAM)
ui.pdp-pc.bto.passo3               →  Embalagem com proteção interna nos componentes
ui.pdp-pc.bto.passo4               →  Frete asseguro até R$ 15.000
ui.pdp-pc.bto.eta                  →  Chega em até {n} dias úteis em {cidade}
```

### Cross-sell periféricos
```
ui.pdp-pc.peripheral.titulo        →  Pra completar o setup
ui.pdp-pc.peripheral.sub           →  Monitor, mouse e teclado que combinam com esse build.
```

---

## 7. Carrinho

### Header e estado
```
ui.cart.titulo                     →  Carrinho
ui.cart.count.singular             →  1 item
ui.cart.count.plural               →  {n} itens
ui.cart.continue-shopping          →  Continuar comprando
```

### Linha do item
```
ui.cart.item.qty                   →  Qtd
ui.cart.item.unit-price            →  Preço unitário
ui.cart.item.subtotal              →  Subtotal
ui.cart.item.remove                →  Remover
ui.cart.item.save-for-later        →  Salvar pra depois
ui.cart.item.notify.in-stock       →  Em estoque
ui.cart.item.notify.low-stock      →  Restam {n} unidades
ui.cart.item.notify.out-of-stock   →  Sem estoque, vamos remover do carrinho
```

### Bar de frete grátis
```
ui.cart.freegift.bar.below         →  Faltam R$ {valor} pra frete grátis
ui.cart.freegift.bar.reached       →  Você liberou o frete grátis
```

### Cupom
```
ui.cart.coupon.label               →  Cupom de desconto
ui.cart.coupon.placeholder         →  Digite o cupom
ui.cart.coupon.apply               →  Aplicar
ui.cart.coupon.success             →  Cupom {codigo} aplicado: -R$ {valor}
ui.cart.coupon.invalid             →  Cupom inválido ou expirado
ui.cart.coupon.minimum             →  Esse cupom precisa de R$ {valor} mínimo
ui.cart.coupon.remove              →  Remover cupom
```

### Resumo (sidebar)
```
ui.cart.summary.titulo             →  Resumo do pedido
ui.cart.summary.subtotal           →  Subtotal
ui.cart.summary.shipping           →  Frete
ui.cart.summary.shipping.calc      →  Calcular frete
ui.cart.summary.shipping.cep       →  CEP
ui.cart.summary.shipping.cep-cta   →  Calcular
ui.cart.summary.discount           →  Desconto
ui.cart.summary.pix                →  Pix com 5% off
ui.cart.summary.total              →  Total
ui.cart.summary.installments       →  ou 12x R$ {valor} sem juros
ui.cart.summary.cta-checkout       →  Ir pro pagamento
ui.cart.summary.security           →  Pagamento seguro com MercadoPago
```

### Empty state
```
ui.cart.empty.h2                   →  Carrinho vazio
ui.cart.empty.sub                  →  Bora ver os builds prontos ou começar uma montagem do zero.
ui.cart.empty.cta-builds           →  Ver builds prontos
ui.cart.empty.cta-builder          →  Abrir Builder
```

---

## 8. Checkout

### Indicador de passos
```
ui.checkout.steps.1                →  Identificação
ui.checkout.steps.2                →  Endereço
ui.checkout.steps.3                →  Pagamento
ui.checkout.steps.4                →  Confirmação
```

### Passo 1 — Identificação
```
ui.checkout.id.titulo              →  Quem vai receber
ui.checkout.id.guest-cta           →  Continuar sem cadastro
ui.checkout.id.login-cta           →  Já tenho conta, entrar
ui.checkout.id.register-cta        →  Criar conta
ui.checkout.id.email.label         →  Email
ui.checkout.id.email.placeholder   →  voce@email.com
ui.checkout.id.cpf.label           →  CPF
ui.checkout.id.cpf.placeholder     →  000.000.000-00
ui.checkout.id.phone.label         →  Celular com WhatsApp
ui.checkout.id.phone.placeholder   →  (11) 9 0000-0000
ui.checkout.id.next                →  Continuar
```

### Passo 2 — Endereço
```
ui.checkout.address.titulo         →  Endereço de entrega
ui.checkout.address.cep            →  CEP
ui.checkout.address.cep.help       →  Buscamos seu endereço pelo CEP
ui.checkout.address.street         →  Rua
ui.checkout.address.number         →  Número
ui.checkout.address.complement     →  Complemento (opcional)
ui.checkout.address.district       →  Bairro
ui.checkout.address.city           →  Cidade
ui.checkout.address.state          →  Estado
ui.checkout.address.recipient      →  Quem recebe
ui.checkout.address.shipping.title →  Forma de envio
ui.checkout.address.shipping.pac   →  PAC: {n} dias úteis · R$ {valor}
ui.checkout.address.shipping.sedex →  Sedex: {n} dias úteis · R$ {valor}
ui.checkout.address.shipping.free  →  Frete grátis: {n} dias úteis
ui.checkout.address.next           →  Continuar pro pagamento
ui.checkout.address.back           →  Voltar
```

### Passo 3 — Pagamento
```
ui.checkout.pay.titulo             →  Como você quer pagar
ui.checkout.pay.tab.pix            →  Pix (5% off)
ui.checkout.pay.tab.card           →  Cartão até 12x
ui.checkout.pay.tab.boleto         →  Boleto bancário

ui.checkout.pay.pix.titulo         →  Pix com 5% off
ui.checkout.pay.pix.body           →  Geramos o QR Code, você paga e a gente confirma na hora. Após confirmação, separamos pra envio em 24h.
ui.checkout.pay.pix.cta            →  Gerar QR Code Pix

ui.checkout.pay.card.titulo        →  Cartão de crédito
ui.checkout.pay.card.number        →  Número do cartão
ui.checkout.pay.card.name          →  Nome impresso no cartão
ui.checkout.pay.card.expiry        →  Validade (MM/AA)
ui.checkout.pay.card.cvv           →  CVV
ui.checkout.pay.card.installments  →  Parcelar em
ui.checkout.pay.card.cta           →  Pagar R$ {valor}
ui.checkout.pay.card.security      →  Dados criptografados pelo MercadoPago. A Kore não armazena.

ui.checkout.pay.boleto.titulo      →  Boleto bancário
ui.checkout.pay.boleto.body        →  Compensação em até 2 dias úteis. Após confirmação, separamos pra envio.
ui.checkout.pay.boleto.cta         →  Gerar boleto

ui.checkout.pay.terms              →  Ao continuar, você aceita os termos de uso e política de privacidade.
```

### Passo 4 — Confirmação
```
ui.checkout.confirm.titulo         →  Pedido confirmado
ui.checkout.confirm.code           →  Pedido #{numero}
ui.checkout.confirm.body.pix       →  Pix recebido. Separamos pra envio em até 24h.
ui.checkout.confirm.body.card      →  Pagamento autorizado. Separamos pra envio em até 24h.
ui.checkout.confirm.body.boleto    →  Boleto gerado. Após pagamento, separamos pra envio em 24h.
ui.checkout.confirm.email          →  Enviamos o resumo pro seu email
ui.checkout.confirm.cta-track      →  Acompanhar pedido
ui.checkout.confirm.cta-shop       →  Continuar comprando
```

---

## 9. Auth

### Login
```
ui.auth.login.titulo               →  Entrar
ui.auth.login.email                →  Email
ui.auth.login.email.placeholder    →  voce@email.com
ui.auth.login.password             →  Senha
ui.auth.login.password.placeholder →  Sua senha
ui.auth.login.remember             →  Continuar conectado
ui.auth.login.forgot               →  Esqueci minha senha
ui.auth.login.cta                  →  Entrar
ui.auth.login.no-account           →  Ainda não tem conta?
ui.auth.login.register             →  Criar conta
ui.auth.login.error.generic        →  Email ou senha incorretos
ui.auth.login.error.locked         →  Muitas tentativas. Espera 5 minutos e tenta de novo.
```

### Registro
```
ui.auth.register.titulo            →  Criar conta
ui.auth.register.sub               →  Salva builds, acompanha pedidos e libera lista de espera ativa.
ui.auth.register.name              →  Nome completo
ui.auth.register.email             →  Email
ui.auth.register.password          →  Senha
ui.auth.register.password.help     →  Mínimo 8 caracteres, com 1 número
ui.auth.register.cpf               →  CPF
ui.auth.register.phone             →  Celular com WhatsApp
ui.auth.register.terms             →  Aceito os termos de uso e política de privacidade
ui.auth.register.newsletter        →  Quero receber avisos de estoque novo e cupons
ui.auth.register.cta               →  Criar conta
ui.auth.register.has-account       →  Já tem conta?
ui.auth.register.login             →  Entrar
ui.auth.register.error.email-used  →  Esse email já tem conta. Tenta entrar.
```

### Esqueci a senha
```
ui.auth.forgot.titulo              →  Recuperar senha
ui.auth.forgot.sub                 →  Manda seu email, enviamos um link pra redefinir.
ui.auth.forgot.email               →  Email
ui.auth.forgot.cta                 →  Enviar link
ui.auth.forgot.success             →  Se esse email tem conta, enviamos o link. Confere a caixa em alguns minutos.
ui.auth.forgot.back-to-login       →  Voltar pro login
```

### Reset
```
ui.auth.reset.titulo               →  Nova senha
ui.auth.reset.sub                  →  Define a senha nova. Mínimo 8 caracteres com 1 número.
ui.auth.reset.password             →  Nova senha
ui.auth.reset.confirm              →  Confirma a senha
ui.auth.reset.cta                  →  Salvar nova senha
ui.auth.reset.success              →  Senha alterada. Já pode entrar.
ui.auth.reset.error.expired        →  Esse link expirou. Pede um novo.
ui.auth.reset.error.mismatch       →  As senhas não batem
```

---

## 10. Account

### Sidebar de navegação
```
ui.account.greeting.template       →  Olá, {primeiro-nome}
ui.account.nav.dashboard           →  Início
ui.account.nav.orders              →  Meus pedidos
ui.account.nav.builds              →  Meus builds salvos
ui.account.nav.waitlist            →  Lista de espera
ui.account.nav.favorites           →  Favoritos
ui.account.nav.addresses           →  Endereços
ui.account.nav.profile             →  Dados pessoais
ui.account.nav.password            →  Alterar senha
ui.account.nav.logout              →  Sair
```

### Dashboard (home da conta)
```
ui.account.dashboard.last-order    →  Último pedido
ui.account.dashboard.builds-saved  →  Builds salvos
ui.account.dashboard.waitlist      →  Esperando estoque
ui.account.dashboard.recommend     →  Recomendado pra você
```

### Pedidos
```
ui.account.orders.titulo           →  Meus pedidos
ui.account.orders.empty.h2         →  Nenhum pedido ainda
ui.account.orders.empty.sub        →  Quando comprar, seus pedidos aparecem aqui.
ui.account.orders.empty.cta        →  Ver builds prontos
ui.account.orders.row.code         →  Pedido #{numero}
ui.account.orders.row.date         →  Feito em {data}
ui.account.orders.row.total        →  R$ {valor}
ui.account.orders.row.cta          →  Ver detalhes
```

### Status do pedido (chips)
```
ui.account.order.status.aguardando-pagamento   →  Aguardando pagamento
ui.account.order.status.pago                   →  Pago
ui.account.order.status.em-separacao           →  Em separação
ui.account.order.status.em-montagem            →  Em montagem
ui.account.order.status.em-teste               →  Em teste de qualidade
ui.account.order.status.enviado                →  Enviado
ui.account.order.status.entregue               →  Entregue
ui.account.order.status.cancelado              →  Cancelado
ui.account.order.status.devolvido              →  Devolvido
```

### Detalhe do pedido
```
ui.account.order.detail.tracking   →  Código de rastreio: {codigo}
ui.account.order.detail.tracking.cta →  Acompanhar nos Correios
ui.account.order.detail.itens      →  Itens do pedido
ui.account.order.detail.address    →  Entrega em
ui.account.order.detail.payment    →  Pagamento
ui.account.order.detail.invoice    →  Baixar nota fiscal
ui.account.order.detail.support    →  Preciso de ajuda
ui.account.order.detail.cancel     →  Cancelar pedido
```

### Builds salvos
```
ui.account.builds.titulo           →  Meus builds salvos
ui.account.builds.empty.h2         →  Nenhum build salvo
ui.account.builds.empty.sub        →  Salve builds no Builder pra comparar e voltar depois.
ui.account.builds.empty.cta        →  Abrir Builder
ui.account.builds.card.parts      →  {n} peças
ui.account.builds.card.total      →  R$ {valor}
ui.account.builds.card.cta-edit   →  Editar
ui.account.builds.card.cta-buy    →  Comprar tudo
ui.account.builds.card.cta-share  →  Copiar link de compartilhamento
ui.account.builds.card.cta-delete →  Excluir
```

### Lista de espera
```
ui.account.waitlist.titulo         →  Lista de espera
ui.account.waitlist.sub            →  Quando esses produtos voltarem ao estoque, você é o primeiro a saber.
ui.account.waitlist.empty.h2       →  Nenhum produto na lista
ui.account.waitlist.empty.sub      →  Quando ver "sem estoque" em algum produto, ativa "me avisa".
ui.account.waitlist.row.added      →  Adicionado em {data}
ui.account.waitlist.row.notified   →  Avisamos em {data}
ui.account.waitlist.row.cta-buy    →  Comprar agora
ui.account.waitlist.row.cta-remove →  Sair da lista
```

### Endereços
```
ui.account.addresses.titulo        →  Meus endereços
ui.account.addresses.cta-new       →  Adicionar endereço
ui.account.addresses.default       →  Endereço padrão
ui.account.addresses.set-default   →  Tornar padrão
ui.account.addresses.edit          →  Editar
ui.account.addresses.delete        →  Excluir
```

### Dados pessoais
```
ui.account.profile.titulo          →  Dados pessoais
ui.account.profile.cta-save        →  Salvar alterações
ui.account.profile.success         →  Dados atualizados
```

### Alterar senha
```
ui.account.password.titulo         →  Alterar senha
ui.account.password.current        →  Senha atual
ui.account.password.new            →  Senha nova
ui.account.password.confirm        →  Confirma senha nova
ui.account.password.cta            →  Alterar senha
ui.account.password.success        →  Senha alterada
ui.account.password.error.current  →  Senha atual incorreta
```

---

## 11. Empty states gerais

```
ui.empty.search.h2                 →  Não achei nada com "{termo}"
ui.empty.search.sub                →  Tenta um termo mais curto, ou veja os builds prontos.
ui.empty.search.cta                →  Ver builds prontos

ui.empty.filter.h2                 →  Nenhum produto com esses filtros
ui.empty.filter.sub                →  Tira um filtro ou amplia a faixa de preço.
ui.empty.filter.cta                →  Limpar filtros

ui.empty.favorites.h2              →  Nenhum favorito ainda
ui.empty.favorites.sub             →  Clica no coração de qualquer produto pra salvar aqui.
ui.empty.favorites.cta             →  Explorar catálogo

ui.empty.compare.h2                →  Nada pra comparar
ui.empty.compare.sub               →  Adiciona até 4 produtos pra comparar specs lado a lado.
ui.empty.compare.cta               →  Ir pra loja
```

---

## 12. Erros

### 404
```
ui.error.404.h1                    →  Essa página saiu de estoque
ui.error.404.sub                   →  O link pode ter expirado ou nunca existiu.
ui.error.404.cta-home              →  Voltar pra Home
ui.error.404.cta-builder           →  Abrir Builder
```

### 500
```
ui.error.500.h1                    →  Algo deu errado do nosso lado
ui.error.500.sub                   →  Já estamos vendo aqui. Tenta de novo em alguns minutos.
ui.error.500.cta                   →  Tentar de novo
```

### Network / sem internet
```
ui.error.network.h1                →  Sem conexão
ui.error.network.sub               →  Confere sua internet e tenta de novo.
ui.error.network.cta               →  Tentar de novo
```

### Validação de formulário (genérico)
```
ui.error.field.required            →  Esse campo é obrigatório
ui.error.field.email               →  Email inválido. Confere aí.
ui.error.field.cpf                 →  CPF inválido
ui.error.field.cep                 →  CEP não encontrado
ui.error.field.phone               →  Celular precisa ter 11 dígitos
ui.error.field.password.weak       →  Senha precisa ter 8+ caracteres com 1 número
ui.error.field.password.match      →  As senhas não batem
ui.error.field.card.invalid        →  Número do cartão inválido
ui.error.field.card.expired        →  Cartão vencido
ui.error.field.card.cvv            →  CVV inválido
```

### Pagamento (mais formal — voz cede)
```
ui.error.payment.declined.h2       →  Pagamento não autorizado
ui.error.payment.declined.body     →  Sua compra não foi processada. Tenta de novo ou usa outro cartão.
ui.error.payment.declined.cta      →  Tentar outro pagamento

ui.error.payment.timeout.h2        →  Tempo esgotado
ui.error.payment.timeout.body      →  A operação demorou demais e foi cancelada. Seu cartão não foi debitado.
ui.error.payment.timeout.cta       →  Voltar pro checkout

ui.error.payment.pix-expired.h2    →  QR Code Pix expirado
ui.error.payment.pix-expired.body  →  O QR Code vale por 30 minutos. Geramos um novo pra você.
ui.error.payment.pix-expired.cta   →  Gerar novo Pix
```

### Estoque (durante checkout)
```
ui.error.stock.h2                  →  Esse produto saiu de estoque
ui.error.stock.body                →  Enquanto você finalizava a compra, alguém levou a última unidade. Removemos do carrinho.
ui.error.stock.cta-similar         →  Ver produtos parecidos
ui.error.stock.cta-waitlist        →  Entrar na lista de espera
```

---

## 13. Toasts (notificações flutuantes)

### Success
```
ui.toast.success.added-to-cart     →  Adicionado ao carrinho
ui.toast.success.removed-from-cart →  Removido do carrinho
ui.toast.success.added-favorite    →  Salvo nos favoritos
ui.toast.success.removed-favorite  →  Removido dos favoritos
ui.toast.success.address-saved     →  Endereço salvo
ui.toast.success.profile-saved     →  Dados atualizados
ui.toast.success.build-saved       →  Build salvo na sua conta
ui.toast.success.build-shared      →  Link copiado pra área de transferência
ui.toast.success.coupon-applied    →  Cupom aplicado
ui.toast.success.waitlist-joined   →  Avisaremos quando voltar ao estoque
ui.toast.success.newsletter-ok     →  Pronto, te avisamos por email
```

### Info
```
ui.toast.info.cart-updated         →  Carrinho atualizado
ui.toast.info.session-extended     →  Sessão renovada
ui.toast.info.copied               →  Copiado pra área de transferência
ui.toast.info.builder-saved-auto   →  Salvamos seu progresso no Builder
```

### Warning
```
ui.toast.warning.last-units        →  Últimas {n} unidades em estoque
ui.toast.warning.session-expiring  →  Sua sessão expira em 2 minutos
ui.toast.warning.builder-warn      →  Build com aviso de compatibilidade. Confere antes de fechar.
```

### Error
```
ui.toast.error.generic             →  Algo deu errado. Tenta de novo.
ui.toast.error.network             →  Sem conexão. Confere sua internet.
ui.toast.error.cart-failed         →  Não consegui adicionar ao carrinho. Tenta de novo.
ui.toast.error.coupon-failed       →  Cupom inválido ou expirado
ui.toast.error.session-expired     →  Sua sessão expirou. Faz login de novo.
```

---

## 14. Loading e estados em transição

```
ui.loading.generic                 →  Carregando…
ui.loading.products                →  Buscando produtos…
ui.loading.checkout                →  Processando pagamento…
ui.loading.builder.compat          →  Checando compatibilidade…
ui.loading.builder.psu             →  Calculando fonte sugerida…
ui.loading.shipping                →  Calculando frete…
ui.loading.cep                     →  Buscando endereço pelo CEP…
```

---

## 15. Cookie banner / LGPD

```
ui.cookie.titulo                   →  A gente usa cookies
ui.cookie.body                     →  Pra lembrar seus produtos no carrinho, recomendar peças e medir o que funciona. Você escolhe o que aceita.
ui.cookie.cta-accept-all           →  Aceitar todos
ui.cookie.cta-only-essential       →  Só os essenciais
ui.cookie.cta-customize            →  Personalizar
ui.cookie.privacy-link             →  Como tratamos seus dados
```

---

## 16. Mapeamento "string vai onde" (pro Frontend)

| Slug prefix | Componente Next.js correspondente |
|---|---|
| `ui.topbar.*` | `components/layout/AnnouncementBar.tsx` |
| `ui.nav.*`, `ui.megamenu.*` | `components/layout/Header.tsx`, `components/layout/MegaMenu.tsx` |
| `ui.search.*` | `components/search/SearchBar.tsx` |
| `ui.header.*` | `components/layout/Header.tsx` (ações usuário) |
| `ui.footer.*` | `components/layout/Footer.tsx` |
| `ui.home.*` | `app/page.tsx` + sections em `components/home/` |
| `ui.plp.*` | `app/(loja)/produtos/page.tsx` + `components/plp/*` |
| `ui.pdp.*` | `app/(loja)/produtos/[slug]/page.tsx` + `components/pdp/*` |
| `ui.pdp-pc.*` | `app/(loja)/pcs/[slug]/page.tsx` + `components/pdp-pc/*` |
| `ui.cart.*` | `app/(loja)/cart/page.tsx` + `components/cart/*` |
| `ui.checkout.*` | `app/(loja)/checkout/*` |
| `ui.auth.*` | `app/(auth)/login`, `register`, `forgot-password`, `reset-password` |
| `ui.account.*` | `app/(account)/*` |
| `ui.empty.*` | `components/states/EmptyState.tsx` |
| `ui.error.*` | `app/error.tsx`, `app/not-found.tsx` + `components/states/ErrorState.tsx` |
| `ui.toast.*` | hook `useToast()` em `lib/toast.ts` |
| `ui.loading.*` | `components/states/LoadingState.tsx` |
| `ui.cookie.*` | `components/legal/CookieBanner.tsx` |

**Builder copy** está em arquivo separado: ver [`COPY-BUILDER.md`](./COPY-BUILDER.md).
**Personas (landings de uso)** estão em [`COPY-PERSONAS.md`](./COPY-PERSONAS.md).
**Emails transacionais** estão em [`COPY-EMAILS.md`](./COPY-EMAILS.md).
**Páginas institucionais** estão em [`COPY-INSTITUCIONAL.md`](./COPY-INSTITUCIONAL.md).

---

## 17. Como o Frontend deve consumir

1. Cria `src/projeto-tech/kore-tech/frontend/lib/copy/ui.ts` exportando objeto aninhado seguindo os slugs.
2. Em qualquer componente, importa `import { copy } from '@/lib/copy/ui'` e usa `copy.home.hero.h1`.
3. Templates com `{variavel}` viram funções: `copy.cart.count(n)` retorna `"3 itens"` ou `"1 item"`.
4. Mudança de copy = edita aqui + atualiza `lib/copy/ui.ts`. Não tem hardcode em JSX.

---

## 18. Pendências pra outros agentes

- [Designer] Confirmar que ícones SVG vão entrar nos USPs da home (descritos só por texto aqui).
- [Frontend] Validar nomes de slugs (kebab-case) ou propor camelCase se preferir.
- [Growth] Slogan de top bar e USPs podem virar variantes A/B no futuro — registrar variantes em `growth/COPY-EXPERIMENTOS.md`.
