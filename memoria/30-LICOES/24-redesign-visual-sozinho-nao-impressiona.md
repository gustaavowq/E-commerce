# 24 — Redesign visual sozinho não impressiona; precisa lógica/funcionalidade

## Sintoma

Em 2026-04-28, fiz redesign visual completo do painel admin Kore Tech:
- Sidebar Linear-style com layoutId active state
- KpiCard v2 com Sparkline inline
- Page transitions
- Canvas spotlight + grid sutil
- Section dividers Linear-style

User reaction: "deu certo nao vi muita diferenca precisa fazer mais sentido tipo graficos fodas analises fodas funcionalidades fodas e logica".

Tradução: visual sutil é INVISÍVEL pra usuário não-designer. Linear-style "responde a ação" mas não chama atenção. Pra "wow", precisa de **funcionalidades novas** + **lógica que se mostra**.

## Causa raiz

Em painel admin, usuário avalia por **o que pode FAZER**, não por **como parece**. Sidebar Linear-style + KpiCard com sparkline = "ok, igual ao antigo mas um pouco mais bonito".

O que realmente impressiona:
- Cmd+K command palette (assinatura tier-1)
- Smart Insights auto-gerados (parece inteligente)
- Charts com period comparison overlay (mostra contexto)
- DataTable sortable (funcional, todo dia faz diferença)

## Princípio

> "Em admin, uma funcionalidade nova vale 10 polishes visuais."

Pra cada round de redesign de admin, dosagem ideal:
- 30% polish visual (canvas, tokens, motion)
- 70% funcionalidades novas / lógica explícita

## Casos de "wow" comprovados

1. **Command palette Cmd+K** — universal, descobre tudo, sente Linear na hora
2. **Smart Insights** — texto auto-gerado lendo os dados ("Receita caiu 8% essa semana — top driver: GPU X esgotou")
3. **Period comparison overlay no chart** — este período sólido + anterior tracejado, comparação visual instantânea
4. **DataTable sortable** — todo admin clica em coluna pra ordenar; quando funciona, parece serio
5. **Date range picker com presets** — chrome de software pago
6. **Sparkline trend nos KpiCards** — contexto micro sem novo chart

## Casos de "ok, mas..." (visual-only)

- Sidebar bg mais escuro (sutil)
- Section dividers (decorativo)
- Page transitions (perceptível só se reparar)
- Canvas spotlight de fundo (estético, ninguém reclama de não ter)

## Prevenção

Em todo redesign de painel admin futuro:

1. **Sempre commitar 1+ funcionalidade nova POR commit visual** — não fazer "polish week" sem features
2. **Smart insights / command palette / date picker / sortable / export** = pacote mínimo
3. **Apresentar pro user como "o que sente fazendo"** (cliques) não como "o que muda no visual"
4. **Testar com olho humano (lição 21)** sim, mas também testar **interação humana** (faz isso, faz aquilo, sente?)

## Caso real

Kore Tech painel: commit `5fe3b35` (visual redesign) → user "não vi muita diferença". Commits subsequentes (`af6dfc2` Cmd+K + Insights, `f684d26` chart period overlay, `7118f9c` DateRangePicker, `da493ed` DataTable sortable) → começou a sentir.

## Padrões relacionados
- [[../50-PADROES/painel-admin-tier-1]] — checklist completo (visual + funcional)
- [[../50-PADROES/smart-insights-pattern]]
- [[../50-PADROES/command-palette-cmdk]]
