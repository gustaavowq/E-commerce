# Nicho: Alimentação / Bebidas / Suplementos

## Brief típico

- **Faixa de preço:** R$ 20–500 (cestas/kits sobem)
- **Cliente:** B2C, recorrência alta, alta frequência de compra
- **Sazonalidade:** Festas (Páscoa, Natal), datas comemorativas (Dia dos Pais), saúde (janeiro academia)

## Schema adaptations

| Campo | Valor |
|---|---|
| `ProductVariation.size` | Volume/peso: `'500ml'`, `'1L'`, `'500g'`, `'1kg'` |
| `ProductVariation.color` | **Sabor**: `'Chocolate'`, `'Baunilha'`, `'Morango'` (renomear visualmente pra "Sabor" no painel/PDP) |
| `Product.measureTable` | **Tabela nutricional**: `{ headers: ['nutriente','quantidade','%VD'], rows: [...] }` |
| `Product.tags` sugeridas | `['vegano', 'sem-gluten', 'sem-lactose', 'organico', 'low-carb', 'whey', 'pre-treino']` |

**Adicionar ao schema:**
```prisma
model Product {
  ...
  expirationDays Int?    @map("expiration_days")  // validade em dias após produção
  ingredients    String? @db.Text                 // lista ingredientes
  storageInstructions String? @map("storage_instructions")  // "Conservar em lugar fresco e seco"
}
```

## Filtros essenciais

- Categoria (Suplementos, Snacks, Bebidas, Marmitas, Cestas)
- **Restrição alimentar** (vegano/sem-glúten/sem-lactose/orgânico — via tags)
- Sabor
- Volume/peso
- Marca

## KPIs específicos

- **Recompra** (alimentação tem alta — ver % clientes que compraram 2+ vezes em 30 dias)
- **Carrinho médio** (geralmente 3-5 itens, vs moda 1-2)
- **Categoria mais vendida**
- **Validade próxima** (alerta de produto vencendo em 30/60 dias) ⚠️

## Trust signals do nicho

- "Validade mínima [X meses] na entrega"
- "Embalagem lacrada"
- "Produto refrigerado, embalagem com gel térmico" (se aplicável)
- "Origem [estado/país]"
- Certificações (ANVISA, Selo Vegano, Orgânico Brasil, GMP)

## Integrações típicas

- **Frete refrigerado** (Loggi, iFood Shop, Rappi) pra orgânicos/marmitas
- **Frete normal** (Correios) pra não-perecível
- **MercadoPago + Pix recorrente** (pra clube de assinatura, se nicho permite)

## Cross-sell/upsell padrão

- "Levando 3 unidades, sai por R$ X" (combo de mesmo SKU — comum em alimentação)
- "Quem comprou whey também levou pre-treino" (categoria afim)
- **Assinatura mensal** (UI no PDP: "Compra única" vs "Assinar mensal -10%")
- "Frete grátis acima de R$ X" mais agressivo (alimentação tem ticket menor, frete grátis converte mais)

## Páginas extras

- `/info-nutricional/[produto]` — pra SEO
- `/duvidas-frete` — refrigerado, prazo, conservação
- `/como-armazenar`

## Considerações

- **Validade** é regulamento (ANVISA). Mostrar PROEMINENTEMENTE — "Validade até DD/MM/AAAA"
- **Lote** rastreabilidade (se for produção própria) — coluna em OrderItem
- **Frio**: produto refrigerado quebra a UX se cliente comprar e não estiver em casa. Considerar entrega agendada
- **Tabela nutricional** estrutura padrão (carboidrato, proteína, gordura, sódio, etc) — não markdown solto

## Exemplo de produto seed

**Whey Protein Concentrado 1kg**
- Variações: 1kg × (Chocolate, Baunilha, Morango) → 3 SKUs
- Tags: ['whey', 'sem-gluten']
- Tabela nutricional: por dose 30g

**Cesta de Café da Manhã**
- Variação única (kit fixo)
- Tags: ['kit', 'presente']
- Foto do conjunto + lista de itens na descrição
