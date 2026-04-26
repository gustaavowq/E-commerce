# Nicho: Eletrônicos / Tecnologia

## Brief típico

- **Faixa de preço:** R$ 200–10.000 (parcelamento crítico — até 12x)
- **Cliente:** B2C predominante, conscientes técnicos
- **Sazonalidade:** Black Friday, Volta às aulas, lançamentos (iPhone, etc)

## Schema adaptations

| Campo | Valor |
|---|---|
| `ProductVariation.size` | Capacidade/voltagem: `'128GB'`, `'256GB'`, `'110V'`, `'220V'` |
| `ProductVariation.color` | Cor: `'Preto'`, `'Branco'`, `'Grafite'` |
| `Product.measureTable` | **Especificações técnicas** (vira "Ficha Técnica" no PDP): `{ headers: ['atributo','valor'], rows: [{ size:'Processador', values: { '0': 'Snapdragon 8 Gen 2' }}, ...] }` |
| `Product.tags` sugeridas | `['lancamento', 'top-de-linha', 'custo-beneficio', 'gamer', 'profissional']` |

## Filtros essenciais

- Marca (Apple, Samsung, Xiaomi, etc)
- Categoria (Smartphones, Tablets, Notebooks, Periféricos, Acessórios)
- **Capacidade** (32/64/128/256/512/1TB)
- **Faixa de preço** (chips: até R$500, R$1k, R$2k, R$5k, acima R$5k)
- **Cor**
- Em promoção
- Lançamento (tag `lancamento`)

## KPIs específicos

- **Ticket médio** (alto — preços altos, parcelamento)
- **Taxa de parcelamento** (% Pix vs Cartão 3x/6x/12x)
- **Margem por categoria** (acessórios geralmente têm margem maior que produto principal)
- **Garantia ativada** (% que ativa garantia estendida)
- **Devolução por arrependimento** (CDC 7 dias) — útil pra detectar produto problemático

## Trust signals do nicho

- "Garantia oficial 12 meses do fabricante"
- "Nota fiscal eletrônica"
- "Produto lacrado, original"
- "Loja autorizada [marca]"
- Selo "Frete seguro"
- "Compra protegida MercadoPago"

## Integrações típicas

- **Correios PAC + Sedex** (peso/dimensões importam — schema precisa de `weight`, `width`, `height`, `length` em Product ou ProductVariation)
- **Mercado Envios** (full pra entregadores)
- **Garantia estendida** (oferta no checkout — integração com Cardif, Assurant, etc)
- **MercadoPago** com parcelamento configurado

## Cross-sell/upsell padrão

- **Acessórios** sempre: capa pra celular, película, fone, mouse pra notebook
- **Garantia estendida** no checkout (em vez de "Levando junto", oferece proteção)
- **Combo desconto**: "Notebook + Mochila + Mouse = -10%"

## Páginas extras

- `/garantia` — política de garantia detalhada por categoria
- `/duvidas-tecnicas` — FAQ técnico
- Manual de produto (PDF) — link na PDP

## Considerações

- **Peso e dimensões CRÍTICOS** pra cálculo Correios. Adicionar ao schema:
  ```prisma
  model ProductVariation {
    ...
    weightGrams Int?     @map("weight_grams")
    widthCm     Decimal? @db.Decimal(6,2) @map("width_cm")
    heightCm    Decimal? @db.Decimal(6,2) @map("height_cm")
    lengthCm    Decimal? @db.Decimal(6,2) @map("length_cm")
  }
  ```
- **Voltagem é ESSENCIAL** mostrar — vender 220V pra cliente do interior de SP é devolução garantida
- **Especificações técnicas** estruturadas (não markdown solto) pra comparação entre produtos depois

## Exemplo de produto seed

**iPhone 15 128GB**
- Variações: 128GB × (Preto, Branco, Rosa, Azul, Amarelo) → 5 SKUs
- Specs: Processador A16, Tela 6.1", iOS 17, Câmera 48MP+12MP, Bateria 3349mAh, ...
- Tags: ['lancamento', 'top-de-linha']
- Peso: 171g

**Notebook Dell Inspiron 15**
- Variações: i5/8GB/256SSD vs i7/16GB/512SSD → 2 SKUs
- Specs: tela, bateria, garantia, etc
- Tags: ['custo-beneficio']
