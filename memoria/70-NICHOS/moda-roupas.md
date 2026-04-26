# Nicho: Moda / Roupas / Calçados

> Template baseado no Miami Store. Funcionou bem. Reusar pra qualquer e-commerce de vestuário.

## Brief típico

- **Faixa de preço:** R$ 50–500 (revendedor de marca premium pode subir pra R$ 1.000+)
- **Cliente:** B2C, 18–45 anos, Insta-driven, sensível a marca
- **Sazonalidade:** Datas comemorativas (Dia das Mães, Black, Natal), troca de coleção (verão/inverno)

## Schema adaptations

| Campo | Valor pro nicho |
|---|---|
| `ProductVariation.size` | `'34', '35', ..., 'P', 'M', 'G', 'GG'` |
| `ProductVariation.color` | nome textual: `'Branco', 'Preto', 'Marinho'` |
| `ProductVariation.colorHex` | OBRIGATÓRIO pra swatch visual: `'#FFFFFF'`, `'#000000'` |
| `Product.measureTable` | tabela tamanhos: `{ headers: ['busto','cintura','quadril'], rows: [{ size:'P', values: {...} }] }` |
| `Product.tags` sugeridas | `['novidade', 'queima-de-estoque', 'verao', 'inverno', 'tendencia', 'basico']` |

## Filtros essenciais

- Marca (Lacoste, Nike, Adidas, Tommy, etc)
- Categoria (Polos, Tênis, Bonés, Conjuntos, Bermudas, Jaquetas, Calças, Acessórios)
- Tamanho (chips horizontais)
- Cor (swatches circulares)
- Faixa de preço (slider ou chips: até R$ 100, R$ 200, R$ 300, R$ 500)
- Em promoção (toggle)
- Em destaque (toggle, opcional)

## KPIs específicos (painel)

- **Tamanho mais vendido** (pra ajustar reposição)
- **Cor mais vendida**
- **Marca top vendedora**
- **Taxa de devolução por tamanho** (pra detectar produto com tabela errada)
- **Estoque baixo por SKU** (alertar quando < 5)
- **Cross-sell taxa de aceitação** (se "quem viu também levou" converte)

## Trust signals do nicho

- "100% original, vem com caixa e etiqueta"
- "Frete fixo R$ 15 pro Brasil todo"
- "Pix com 5% off"
- "Troca grátis em 7 dias (CDC)"
- Selo "Loja segura"
- Comunidade no Insta

## Integrações típicas

- Correios + Melhor Envio (frete real, baseado em CEP destino)
- MercadoPago (Pix + Cartão até 4x)
- Cloudinary (catálogo cresce — fotos múltiplas por produto e por cor)
- Resend (email transacional: confirmação, envio, entrega)
- WhatsApp Business (link pra atendimento + notificação status)

## Cross-sell/upsell padrão

- PDP "Quem viu também levou" → mesma categoria + marca preferencialmente
- Cart "Levando junto sai por R$ X" → produto complementar (camiseta + bermuda)
- Wishlist persistente (localStorage + DB se logado)
- Email pós-compra com produtos similares

## Páginas extras

Igual padrão do Miami Store:
- /sobre, /contato (com mapa Google)
- /policies/privacy, terms, exchange, shipping
- /favoritos
- /search

## Exemplos de produto pro seed

**Polo Lacoste Branca**
- Variações: tamanhos P/M/G/GG × cor Branco
- Imagens: 2 fotos (vestida, plana)
- Tags: ['basico', 'classico']

**Tênis Nike Air Max**
- Variações: tamanhos 38/40/42 × cor Branco
- Imagens: 3 fotos (lateral, top, sola)
- Tags: ['novidade', 'streetwear']

**Conjunto Lacoste Tactel**
- Variações: tamanhos P/M/G × cor Marinho
- Imagens: 4 fotos (peça inteira, blusa, calça, detalhe)
- measureTable preenchida
- Tags: ['conjunto', 'esporte']

## Considerações

- **Variações com cor**: SEMPRE preencher `colorHex` pra renderizar swatch — sem ele cai no fallback `#ccc`
- **Imagens por cor** (variationColor): o ProductDetailView já tem lógica pra mostrar imagens da cor selecionada. Importante seedar imagens com `variationColor` correto
- **Tabela de medidas**: cliente deve preencher pelo painel (se nicho tem). Modal já existe no PDP

## Já validado no Miami Store

✅ Header com Início | Loja ▼ | Sobre | Contato funciona
✅ Cross-sell por mesma categoria+marca traz resultado
✅ Frete grátis bar converte (estatística externa: ticket-médio +15%)
✅ WhatsApp opt-in pós-compra tem alta aceitação
✅ Newsletter popup com 5% off captura ~10% dos visitantes (estimado)
