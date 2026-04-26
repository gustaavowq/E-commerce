# Nicho: Beleza / Cosméticos / Skincare

## Brief típico

- **Faixa de preço:** R$ 30–500 (premium pode subir)
- **Cliente:** B2C, predominante feminino 18–45, sensível a marca/influencer
- **Sazonalidade:** Black Friday, Dia das Mães, Natal, lançamentos sazonais

## Schema adaptations

| Campo | Valor |
|---|---|
| `ProductVariation.size` | Volume: `'30ml'`, `'50ml'`, `'200ml'`. Pra batom: `'3.5g'` |
| `ProductVariation.color` | **Tom/cor exata**: `'Vermelho Cereja'`, `'Nude Rose'`. Hex obrigatório pra swatch |
| `Product.measureTable` | Não usar pra tabela. Em vez: `ingredients` field (lista INCI) |
| `Product.tags` sugeridas | `['vegan', 'cruelty-free', 'natural', 'pele-oleosa', 'pele-seca', 'antiidade', 'fps']` |

**Adicionar ao schema:**
```prisma
model Product {
  ...
  ingredients      String? @db.Text                    // lista INCI
  skinType         String? @map("skin_type")           // 'oleosa'|'seca'|'mista'|'todas'
  fps              Int?                                 // proteção solar (se aplicável)
  scent            String?                              // descrição da fragrância
}
```

## Filtros essenciais

- Categoria (Maquiagem, Skincare, Cabelo, Perfumaria, Corpo)
- **Tipo de pele** (oleosa, seca, mista, todas)
- **Tom** (chips de cor) — CRÍTICO em batom/base
- Marca
- FPS (15+, 30+, 50+) se solar
- Cruelty-free (toggle)
- Vegan (toggle)
- Faixa de preço

## KPIs específicos

- **Tom mais vendido** por categoria (essencial pra reposição)
- **Influência por canal** (Insta, TikTok, indicação) — UTM tracking importante
- **Cross-sell** (skincare = step-by-step, "limpeza + tônico + hidratante = -15%")
- **Frequência de recompra** (skincare sai mensalmente, perfume a cada 3-6 meses)

## Trust signals do nicho

- "Lacrado, original"
- "Cruelty-free (selo)"
- "Vegano (selo)"
- "Dermatologicamente testado"
- "Validade mínima 12 meses"
- "Resenha de blogueira [@xxx]" se aplicável

## Integrações típicas

- **Sephora-like styling**: PDP rica com swatch interativo, "experimente virtualmente"
- **Programa de pontos/fidelidade** — recompra alta justifica
- **Reviews com foto** (mais que outros nichos)
- **Resend** pra fluxo de boas-vindas e indicação

## Cross-sell/upsell padrão

- **Ritual completo**: "Compre os 3 do ritual e ganhe 15%"
- **"Vai com tudo"**: kit pré-montado por necessidade ("Pele Oleosa", "Antiidade", "Hidratação")
- **Sample grátis** acima de R$ X (cosmético tem custo de amostra baixo, conversão alta)
- **Programa de pontos**: 1 ponto por R$ 1, 100 pontos = R$ 10 off

## Páginas extras

- `/blog` (skincare blog drives traffic — SEO)
- `/diagnostico-pele` (quiz interativo que recomenda produtos) — não obrigatório no MVP
- `/como-aplicar/[produto]` — vídeos curtos

## Considerações

- **Foto da swatch (cor aplicada na pele)** é crítica — adicionar como variationColor com imagem
- **Reviews COM FOTO** convertem 3x mais — incentivar (cupom pra quem posta)
- **Influencer integration**: tag "Visto no Insta" / "Recomendação @xxx" — usar Product.tags
- **Tom de pele**: filtro mais usado em base/corretivo. Padrão skin tones: light, light-medium, medium, tan, deep
- **FPS**: campo dedicado (não tag) pra filtros numéricos

## Exemplo de produto seed

**Base Líquida Mate FPS 30**
- Variações: 30ml × 8 tons (do mais claro ao mais escuro) → 8 SKUs
- skinType: 'mista'
- fps: 30
- Tags: ['cruelty-free', 'vegan', 'fps']
- Foto da swatch em cada tom (variationColor)

**Sérum Vitamina C 30ml**
- Variação única
- skinType: 'todas'
- ingredients: 'Aqua, Ascorbic Acid 15%, ...' (INCI)
- Tags: ['antiidade', 'vegan']
