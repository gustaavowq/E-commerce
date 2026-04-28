# Padrão — Smart Insights (admin parece pensar)

## Princípio

> "Mostrar dados é fácil. Interpretar dados é o que separa
> painel-admin-bootstrap de Linear/Stripe."

Cards auto-gerados que LEEM os KPIs e descrevem em texto humano o que está acontecendo. Não é IA — é regra de negócio explícita aplicada aos dados. Mas dá a sensação de que o painel **está pensando junto com o lojista**.

## Anatomia

Componente puro client (lê props, gera array de insights, render):

```tsx
type Insight = {
  id: string
  type: 'good' | 'bad' | 'opportunity' | 'milestone'
  icon: React.ComponentType<...>
  title: string         // 1-line factual
  body: string          // 1-2 frases analíticas
  action?: { label: string; href: string }  // CTA pra drill-down
}

function deriveInsights(overview, revenue, period): Insight[] {
  const out: Insight[] = []
  
  // Regra 1: receita ±10%
  if (Math.abs(overview.revenue.change) >= 10) {
    out.push({ type: up ? 'good' : 'bad', ... })
  }
  
  // Regra 2: pedidos ±15%
  // Regra 3: AOV cai ≥10% → upsell
  // Regra 4: conversão < 1% → bottleneck
  // Regra 5: 3 dias seguidos crescendo OU caindo
  // Regra 6: pedidos hoje >= 5 → milestone
  
  return out.slice(0, 4)  // max 4 mais relevantes
}
```

## Regras de negócio canônicas (e-commerce)

| Regra | Trigger | Tipo | CTA sugerido |
|---|---|---|---|
| Receita ↑/↓ ≥10% | Periodo vs anterior | good/bad | Drill funil se cai |
| Pedidos ↑/↓ ≥15% | Periodo vs anterior | good/opportunity | Cupom se cai |
| AOV ↓ ≥10% | Periodo vs anterior | opportunity | "PCs montados" upsell |
| Conversão < 1% | Threshold absoluto | bad | "Ver funil completo" |
| 3 dias seguidos ↓ | Sequence revenue | bad | Investigar trafego/estoque |
| 3 dias seguidos ↑ | Sequence revenue | good | "Escala o que tá funcionando" |
| Pedidos hoje ≥ 5 | Threshold | milestone | "Ver pedidos pendentes" |
| Estoque crítico | Cross-data com /stock-alert | bad | Restock |
| Alta cancelamento ≥ 5% | Cancelamento ratio | bad | Investigar pagamento |

## Visual (4 tipos com cor semântica)

```tsx
const toneStyles = {
  good:        { border: 'border-success/30', bg: 'bg-success-soft/40', icon: 'text-success' },
  bad:         { border: 'border-danger/30',  bg: 'bg-danger-soft/40',  icon: 'text-danger' },
  opportunity: { border: 'border-warning/30', bg: 'bg-warning-soft/30', icon: 'text-warning' },
  milestone:   { border: 'border-primary/30', bg: 'bg-primary-soft',    icon: 'text-primary' },
}
```

Layout: 2 cols em md+, 1 col mobile. Stagger fade-up 60ms entre cards.

## Tom de voz nos textos

- **Curto** — 1 linha de title, 1-2 linhas de body. Nada de parágrafo.
- **Factual + opinião curta** — "Receita +23%. Ritmo bom, vale revisar estoque." Não vende.
- **Sem tom IA** — sem "Excelente!", "Ops!", "Vamos lá!". Sem emoji.
- **Português BR direto** — "Volume desacelerou" não "Houve uma desaceleração".
- **Sugestão concreta no body** — "Considera empurrar PCs prontos como upsell" (ação > observação).
- **CTA verbo-primeiro** — "Ver funil", "Ver cupons", "Ver pedidos".

## Regras de composição

- **Limite 4 insights** mais relevantes (qualidade > quantidade)
- **Priorize bad/milestone** sobre good (lojista vê o que precisa de atenção)
- **Sem duplicação** (revenue + orders mesma trend = só 1 card)
- **Skip se overview vazio** (return null, sem placeholder ruidoso)
- **Animação stagger** pra cards parecerem "pensando" um por um

## Caso real

Kore Tech 2026-04-28 — implementado em `dashboard/src/components/SmartInsights.tsx` (commit `af6dfc2`). Renderizado acima dos KpiCards na home admin.

Reaction do user: "deu certo nao vi muita diferenca" → AÍ veio o redesign mais ousado com Smart Insights + Command Palette + period overlay nos charts. Lição: redesign visual sutil sem features novas não impressiona — precisa **mostrar inteligência**.

## Padrões relacionados
- [[painel-admin-tier-1]] — checklist completo
- [[command-palette-cmdk]] — outra "feature inteligente"
