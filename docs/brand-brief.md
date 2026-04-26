# 🐊 Brand Brief — Miami Store

> **Atualizado em 2026-04-25 com análise visual real das 82 fotos do Instagram @miamii_storee.**
> Fonte de referência visual: `assets/miami-instagram/gallery-dl/instagram/miamii_storee/`

---

## 1. O que a Miami Store é (de verdade)

**Miami Store é uma loja de revendedora de marcas originais, com Lacoste como carro-chefe atual.** A maioria do estoque visível no Instagram hoje é Lacoste — bonés, polos, tênis, conjuntos — mas a operação não é mono-marca: outras marcas aspiracionais (esperado: Nike, Adidas, Tommy, Polo Ralph Lauren, Stüssy, Fila etc.) também entram no catálogo. O posicionamento é **"marca de respeito, original, com preço acessível"**, vendido pra um público que normalmente não compra direto nas lojas oficiais.

**Direção do site:** manter a alma autêntica do Instagram (voz direta, comunidade, prova de autenticidade) **mas com acabamento profissional** — fotos de produto bem cortadas, layout consistente, microinterações limpas, navegação previsível. Site não pode parecer feito em casa; tem que parecer loja de e-commerce séria, mesmo que o tom da copy continue informal.

**Instagram:** [@miamii_storee](https://www.instagram.com/miamii_storee/) (~12 posts visíveis, 82 imagens, 8 vídeos baixados)

### Catálogo observado hoje no Instagram (Lacoste-líder)
| Categoria | Itens identificados |
|---|---|
| **Polos** | Vermelho, branco, branco com detalhe azul marinho, com estampa "CROCODILE" |
| **Tênis** | Marinho/branco, preto/vermelho — todos com jacaré bordado/estampado |
| **Bonés** | Verde, vermelho, azul marinho, branco, azul claro, oliva — todos com jacaré |
| **Conjuntos esportivos** | Jaqueta + calça em azul claro/marinho, vermelho/marinho |
| **Camisetas** | Pretas com estampa grande do jacaré em frente |
| **Caixas Lacoste originais** | Aparecem em quase todas as fotos — usado como prova de autenticidade |

### Catálogo previsto (multimarca — confirmado pelo cliente)
A operação **vende e vai vender outras marcas originais**, não só Lacoste. Marcas esperadas no catálogo (a confirmar com o lojista quais já estão no estoque):
`Lacoste` (carro-chefe atual), `Nike`, `Adidas`, `Tommy Hilfiger`, `Polo Ralph Lauren`, `Stüssy`, `Fila`, `Reserva`, `Calvin Klein`.

⚠️ **O Backend deve modelar uma entidade `Brand` separada de `Category`** desde o dia 1 — produtos são organizados por marca **E** por categoria (ex.: filtrar "Polos da Lacoste" e "Polos da Tommy" ao mesmo tempo). Sem isso, refatoração depois vai doer.

### Sinais de posicionamento captados
- Fotos da loja física com **galera reunida em quadra coberta** (uniformes verdes "Picpay 2025") → forte presença comunitária local
- Banners com **bandeira americana** + "MIAMI STORE" → posicionamento aspiracional EUA
- Caixas verdes Lacoste em destaque → resposta à desconfiança "será que é original?"
- Tom direto nas artes: "VOCÊS NÃO PERDEM POR ESPERAR", "EM BREVE NOVIDADES" → linguagem coloquial, sem corporativês
- Fotos de produto em **mesa de madeira / piso** com luz natural → não é estúdio, é foto de celular autêntica

---

## 2. Público-alvo (refinado pós-análise)

### Persona principal — "Tiago, 20-25 anos, periferia"
- Renda R$ 1.500–3.500/mês
- Sonha em ter Lacoste original mas não vai pagar R$ 600 em um polo na loja oficial
- Quer pagar R$ 200–300 em algo que **pareça e seja original**
- Compra principalmente via **Pix** (instantâneo, sem juros, sem cadastro)
- Confia em loja que **mostra a caixa Lacoste original** nas fotos
- Acompanha @miamii_storee porque viu alguém da quebrada usando

### O que esse público mais teme
1. **"É falsificado?"** → maior medo. A loja precisa provar autenticidade visualmente
2. **Site não confiável** → quer ver CNPJ, redes sociais ativas, fotos reais
3. **Frete caro/demorado** → quer fixo, claro, antes de chegar no checkout
4. **Não receber o produto** → precisa de prova de outras vendas (depoimentos, entregas)

---

## 3. Identidade visual REAL (extraída das fotos)

### 🎨 Paleta de cores (substituiu a versão provisória anterior)

```
PRIMARY     #1B5E20  Verde Lacoste escuro (caixa, logo)
PRIMARY-2   #2E7D32  Verde Lacoste médio (jacaré bordado)
ACCENT-1    #D32F2F  Vermelho Lacoste (polos, detalhes de tênis)
ACCENT-2    #C5E000  Verde-limão neon (texto "voces nao perdem")
NEUTRAL-DK  #0A0A0A  Preto puro (fundo de banners)
NEUTRAL     #FFFFFF  Branco (fundo de fotos de produto)
NEUTRAL-MD  #1F2937  Cinza escuro (texto secundário)
NAVY        #0D2C54  Azul marinho (variações de produto)
```

**Destaques de uso:**
- Cor primária do site: **verde Lacoste #1B5E20** — botões CTA, links, headers
- Vermelho #D32F2F só pra **destaques fortes** (badge "promoção", "últimas peças")
- Preto pra **fundo de banners promocionais** com tipografia clara
- Branco pra **fundo geral do site** (a vibe do produto Lacoste é limpo)

### 🔤 Tipografia (deduzida das artes)

| Uso | Estilo observado | Sugestão de fonte |
|---|---|---|
| **Display / banners** | Serif chunky branca em fundo preto ("EM BREVE NOVIDADES") | `Playfair Display` Bold ou `DM Serif Display` |
| **Logo "MIAMI STORE"** | Serif tradicional all-caps, oval verde estilo Lacoste | `Cinzel` ou `Cormorant Garamond` Bold |
| **Texto street/dripping** | Stencil verde-limão neon ("VOCÊS NÃO PERDEM POR ESPERAR") | `Bungee`, `Rubik Mono One` (uso pontual) |
| **UI / corpo do site** | (não tem referência — definir clean) | `Inter` ou `Manrope` |

### 📸 Estilo fotográfico

- **No Instagram (atual):** foto de celular em mesa de madeira / piso, luz natural — autêntico, casual.
- **No site (alvo):** subir o nível pra **fundo branco limpo + ângulo padronizado + boa luz**, mantendo proporção 1:1.3 (ou 4:5). Não precisa virar estúdio top-tier, mas precisa ser **consistente entre produtos**. Site de e-commerce não pode ter foto torta ou sombra estranha.
- **Foto institucional:** continuar registrando a galera da loja/comunidade — fica em página "Sobre" ou no rodapé. Mostra que é loja real.
- **Banner gráfico:** fundo preto + tipografia chunky branca + ícones temáticos. Pode manter o estilo do Instagram nos banners promocionais.
- **Lookbook:** 1 foto "vestindo" por produto seria o ideal — pode ser informal (modelo da casa, fundo neutro, luz natural), não precisa de produção cara.

### 🪪 Logo
Logo atual: oval verde Lacoste-style com jacaré + "MIAMI STORE" em serif. Preserve essa estética se for redesenhar — **não invente identidade visual nova**, refine a existente.

---

## 4. Voz e tom

### Princípios
- **Direto, sem firula.** Frase curta, verbo no início.
- **Trata como gente.** "Você", "vc", "mano", "mina" — sem perder o respeito.
- **Sem corporativês.** "Confira", "adquira", "produto", "consumidor" → fora.
- **Provar autenticidade sempre.** "Original", "caixa Lacoste", "etiqueta", "QR Code" são palavras-chave.

### Faça vs Não faça (pareados ao tom real do Instagram)

| Faça | Não faça |
|---|---|
| "Chegou peça nova, corre ver" | "Confira nossas novidades" |
| "100% original, com caixa Lacoste" | "Produto autêntico de qualidade premium" |
| "Pix instantâneo — receba na hora" | "Pagamento via PIX com aprovação imediata" |
| "Tá faltando seu tamanho? Chama no zap" | "Indisponível. Cadastre-se para alertas" |
| "Vocês não perdem por esperar" (estilo deles) | "Em breve teremos novidades exclusivas" |
| "Valor à vista no Pix: R$ 199" | "Investimento à vista: R$ 199" |

---

## 5. Diferenciais que devem aparecer no site

| Diferencial | Onde mostrar | Por quê |
|---|---|---|
| **100% original com caixa Lacoste** | Banner topo + página do produto + selo no card | Combate o medo principal do público |
| **Pix instantâneo, sem taxa** | Banner topo + destaque no checkout | Pix = método dominante deste público |
| **Frete fixo / grátis acima de R$ X** | Banner topo + página do produto | Quer saber frete antes de tudo |
| **WhatsApp pra tirar dúvida** | Botão flutuante fixo + rodapé | Confiança vem do contato humano |
| **Parcelamento sem juros** | Página do produto + checkout | Aspiracional precisa caber no bolso |
| **Comunidade Miami Store** | Galeria de "clientes usando" no footer | Prova social = anti-falsificação |

---

## 6. Estrutura de catálogo (validada com Instagram)

### Estrutura: Brand × Category (separadas)
**Marcas (`brands`):** Lacoste, Nike, Adidas, Tommy, Polo Ralph Lauren, Stüssy, Fila, Calvin Klein… (incremental)
**Categorias (`categories`):**
```
- Polos
- Camisetas
- Tênis
- Bonés
- Conjuntos Esportivos
- Bermudas / Shorts
- Jaquetas / Moletons
- Calças
- Acessórios (cordão, óculos, meia, bolsa)
```

Cada produto é **(brand, category)** → permite filtros poderosos: "Polos × Lacoste", "Tênis × Nike", "Tudo da Tommy", etc.

### Variação obrigatória por produto
- **Tamanho** (P, M, G, GG / 38, 39, 40, 41, 42, 43)
- **Cor** com **swatch visual** (vermelho, marinho, branco, verde, preto, etc.)
- **Tabela de medidas** específica por categoria (polo é peito/comprimento, tênis é tamanho/numeração)

### Foto de produto: regra mínima
- 3 fotos por produto: **plana frente** + **plana costas/detalhe** + **com caixa Lacoste**
- Idealmente + 1 foto de **alguém vestindo / usando** (lookbook)

---

## 7. Decisões de UX específicas pra esse público

1. **Pix sempre primeiro** na lista de pagamento, com badge "instantâneo" ou "5% off"
2. **Selo "100% Original com Caixa Lacoste"** em toda página de produto (canto superior direito da foto)
3. **CEP no topo de toda página** — calculadora de frete inline, sem precisar abrir produto
4. **Botão WhatsApp flutuante** em todas as páginas (canto inferior direito)
5. **Sem login obrigatório pra navegar** — só pede dados na finalização
6. **Checkout em uma página só** — minimizar cliques (público mobile)
7. **Galeria de "comunidade"** no footer — fotos reais de clientes usando (com permissão)
8. **Rodapé com CNPJ + endereço físico** — prova legitimidade

---

## 8. O que NÃO fazer

- ❌ Não usar **modelo internacional padrão** que não representa o público
- ❌ Não esconder o frete pra mostrar só no checkout (gera abandono)
- ❌ Não fazer cadastro obrigatório pra navegar
- ❌ Não usar **"luxo" / "premium" / "exclusivo"** como linguagem — soa falso
- ❌ Não copiar layout de Shopee/Mercado Livre (genérico demais, sem identidade)
- ❌ Não usar **pop-up de e-mail** assim que entra no site (irritante em mobile)
- ❌ Não esconder a estética Lacoste — ela É a identidade da loja
- ❌ Não usar paleta neon Miami (rosa/cyan) — não combina com a marca real
- ❌ Não fazer foto de catálogo asséptico estilo "Polo Ralph Lauren" — perde a alma

---

## 9. Considerações legais (importante)

A Miami Store revende produtos Lacoste, mas **não é uma loja autorizada da Lacoste**. Implicações:
- Não usar o logo Lacoste oficial como logo da loja (já não usa — bom)
- O nome "Miami Store" é independente — sem conflito direto com Lacoste
- A estética "inspirada em Lacoste" (verde, jacaré desenhado em estilo próprio) é OK desde que não copie o jacaré oficial pixel a pixel
- Footer deve ter disclaimer: "Miami Store é revendedora autorizada/independente. Marca Lacoste® pertence aos seus respectivos proprietários."
- **Tech Lead deve confirmar com o cliente:** existe contrato de revenda? São produtos comprados em outlet/atacado? Isso afeta o copy.

---

## 10. Próximos passos do Designer (Agente 02)

1. ✅ ~~Acessar Instagram e capturar paleta~~ — feito pelo Tech Lead, dados em `assets/miami-instagram/`
2. ⏳ Validar este brief com o cliente (perguntar se o posicionamento está correto)
3. ⏳ Criar `docs/design/design-system.md` com tokens reais (paleta deste documento)
4. ⏳ Desenhar wireframes mobile-first (375px) das telas principais
5. ⏳ Definir componente "selo de autenticidade" — visual chave do site
6. ⏳ Sugerir refinamento do logo atual (sem destruir a identidade existente)

## 11. Referências visuais salvas

```
assets/miami-instagram/
└── gallery-dl/instagram/miamii_storee/
    ├── *.jpg  (82 fotos de produto, lookbook, banners)
    └── *.mp4  (8 vídeos / reels)
```

Designer: abra essas fotos antes de qualquer entrega visual. Tudo neste brief foi extraído delas.
