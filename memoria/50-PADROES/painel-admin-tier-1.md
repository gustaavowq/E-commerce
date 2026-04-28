# Padrão — Painel admin Linear/Vercel-tier

## Princípio

> "Admin é workspace, não hero. Mas tem que sentir que **pensa**.
> Visual sutil + funcionalidades inteligentes + lógica que se mostra."

Após o redesign do painel Kore Tech (commits `49158b8` → `da493ed`),
ficou claro: redesign visual **sozinho** não impressiona. O admin
precisa de FUNCIONALIDADES que mostram inteligência: command palette,
smart insights auto-gerados, sorting nas tabelas, period comparison
nos charts. **Visual + função juntos = tier-1.**

## Anatomia de um painel tier-1

### 1. Background (canvas calmo)
- `canvas-spotlight-admin` — spotlight radial cyan SUTIL no topo (mais discreto que loja)
- `grid-admin` — grid 56px branco opacity **1.5%** (não 2.5% da loja — admin é workspace)
- `bg-noise-admin` — textura SVG opcional
- `section-divider-admin` — linha horizontal degrade entre seções com dot cyan glow no centro

### 2. Sidebar (Linear-style)
- `bg-surface-2` (mais escuro que content `bg-bg`) — separa hierarquia
- Nav agrupado em 3-4 seções com label discreto (Operação · Catálogo · Engajamento · Sistema)
- **Active state via `motion.div layoutId="sidebar-active-bg"`** — desliza entre items via spring 380/32 quando user troca rota
- User card no rodapé: avatar com inicial + nome + email truncado
- Badge ping (animate-ping) em items com pendentes

### 3. Header / Date range picker
- DateRangePicker com 5 presets: Hoje · 7d · 30d · 90d · Este ano
- Shortcuts mnemônicos quando aberto (D/7/3/9/Y)
- ChevronDown rotate 180° quando aberto
- Dropdown com listbox role + ativos com Check icon

### 4. KPI cards com sparkline
- Sparkline inline SVG 80×24px ao lado direito (zero deps)
- Gradient fill cyan stop 0.35 → 0
- AnimatedNumber tween no valor principal
- Stagger fade-up 60ms entre cards
- Hover: -translate-y-0.5 + line accent gradient na borda inferior (scaleX origin-left)

### 5. Smart Insights (LÓGICA QUE PARECE INTELIGENTE)
- Componente que **lê os dados** (overview + revenue trend) e gera 4 cards de texto
- Tipos: good (verde) / bad (vermelho) / opportunity (amarelo) / milestone (cyan)
- Detecta automaticamente:
  - Receita ±10% → trend
  - Pedidos ±15% → opportunity (sugere campanha)
  - AOV cai ≥10% → upsell sugestão
  - Conversão < 1% → bottleneck
  - 3 dias consecutivos subindo OU caindo
  - Pedidos hoje >= 5 → milestone
- Cada card com CTA pra drill-down
- Limita 4 mais relevantes

### 6. Charts premium
- Recharts AreaChart (não LineChart) com gradient fill
- **Period comparison overlay**: este período em sólido cyan + período anterior em tracejado (split data ao meio)
- Custom tooltip dark com dot glow + 2 linhas comparando valores
- Vertical grid removido (cleaner)
- Animation entry 1.2s ease-out

### 7. Top Categorias / Top Produtos com bar viz
- Bar relativa ao max do conjunto (não absoluta)
- Toggle ordenação inline (Receita/Pedidos/AOV)
- Width spring 600ms ease-kore stagger 50ms
- Gradient cyan + glow shadow
- Hover destaca linha

### 8. DataTable v2 (sortable + sticky + animado)
- Headers clicáveis com cycle asc → desc → reset
- Icon indicator: ArrowUpDown idle → ArrowUp asc → ArrowDown desc
- `sortable: boolean | (a, b) => number` + `sortAccessor` no column
- Default compare: localeCompare strings, numérico nums, getTime Dates, null-safe
- `stickyHeader` opcional (top 0 + backdrop-blur)
- Row enter: fade-up stagger 12ms cap 360ms total
- Floating BulkActionBar com spring entry/exit

### 9. Command palette Cmd+K (ICONIC)
- Lib `cmdk` (mesma do Linear/Vercel/Raycast)
- 3 grupos: Páginas (jumps) / Criar (new entities) / Ferramentas (utils)
- Fuzzy search por label + keywords
- Animação spring 18ms + fade
- Footer com kbd hints (↵ selecionar · ↑↓ navegar · esc fechar)

### 10. Skeleton premium
- Substituir `animate-pulse` genérico por `shimmer-skeleton` (gradient pan tilted)
- `background: linear-gradient(90deg, #18181b 0%, #27272a 50%, #18181b 100%); background-size: 200% 100%; animation: shimmer 1.6s linear infinite`
- Respeita prefers-reduced-motion

## Tokens canônicos do painel

```css
--ease-kore: cubic-bezier(0.32, 0.72, 0, 1)
--dur-fast: 180ms
--dur-base: 280ms
--dur-slow: 420ms
--spring-snappy: { type: 'spring', stiffness: 380, damping: 40 }
--spring-gentle: { type: 'spring', stiffness: 200, damping: 28 }
```

## Bibliotecas escolhidas (validadas em 2026-04-28)

| Componente | Lib | Razão |
|---|---|---|
| DataTable | TanStack Table v8 | Headless, sticky, sort, filter, virtualization |
| Command palette | cmdk | Mesma do Linear/Vercel/Raycast |
| Toast | Sonner (futuro) | 2-3kb, swipe-to-dismiss, dark mode nativo |
| Charts | Recharts (já no projeto) | Pragmático; Tremor opcional pra visual mais Vercel |
| Animation | Framer Motion 11 | layoutId, spring, prefers-reduced-motion built-in |
| Date picker | Custom (presets) | Suficiente pra 95% dos casos; react-day-picker se precisar custom |

## Lista mínima pra próximo painel (checklist)

Em todo novo e-commerce do framework, painel admin DEVE ter:

- [ ] canvas-spotlight + grid-admin no fundo
- [ ] Sidebar Linear-style com nav agrupado + layoutId active
- [ ] DateRangePicker com 5 presets + shortcuts
- [ ] KpiCards com sparkline + AnimatedNumber + period comparison
- [ ] SmartInsights (4 cards auto-gerados)
- [ ] RevenueChart com period overlay (atual + anterior tracejado)
- [ ] TopCategorias com bar viz ordenável
- [ ] DataTable v2 sortable + animateRows
- [ ] Command palette Cmd+K
- [ ] Skeleton shimmer (não pulse genérico)
- [ ] Page transitions via template.tsx
- [ ] Live-dot pulse pra status indicators

## Padrões relacionados
- [[validar-visual-antes-de-fechar]] — testar com olho humano
- [[motion-policies]] — animação responde a ação
- [[../30-LICOES/22-css-layer-com-import]] — admin-tokens.css sem @layer
