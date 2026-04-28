# Padrão — Command Palette Cmd+K (cmdk)

## Por que

Painel admin tier-1 (Linear, Vercel, Notion, Raycast) tem command palette Cmd+K. Assinatura visual + funcional que distingue admin profissional de "painel Bootstrap genérico".

Resolve 3 problemas:
1. **Velocidade** — admin pula entre páginas sem mouse
2. **Descoberta** — features escondidas viram acessíveis (search por keyword)
3. **Atalhos** — ações comuns ganham shortcut único

## Stack escolhida

- **Lib:** [`cmdk`](https://cmdk.paco.me) (mesma usada por Linear, Vercel, Raycast)
- Headless, acessível, fuzzy search via `command-score`, ~3kb gzip
- Integra trivialmente com Framer Motion + Tailwind

## Estrutura mínima

```tsx
'use client'
import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'

const items = [
  // Jumps (rotas)
  { id: 'go-orders', group: 'jump', label: 'Pedidos', icon: ShoppingBag, action: () => router.push('/orders') },
  // Create
  { id: 'new-product', group: 'create', label: 'Novo produto', action: () => router.push('/products/new') },
  // Tools
  { id: 'open-store', group: 'tool', label: 'Abrir loja em nova aba', action: () => window.open(STORE_URL) },
]

// Cmd/Ctrl+K toggle global
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      setOpen((v) => !v)
    }
    if (e.key === 'Escape') setOpen(false)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])

// Modal
<AnimatePresence>
  {open && (
    <motion.div className="fixed inset-0 z-[200] bg-bg/85 backdrop-blur-md ...">
      <motion.div className="w-full max-w-2xl rounded-xl border ...">
        <Command shouldFilter loop>
          <Command.Input placeholder="Pular pra... ou buscar..." autoFocus />
          <Command.List>
            <Command.Empty>Nada encontrado pra "{search}"</Command.Empty>
            <Command.Group heading="Páginas">
              {items.filter(i => i.group === 'jump').map(item => (
                <Command.Item key={item.id} onSelect={item.action}>{item.label}</Command.Item>
              ))}
            </Command.Group>
            ...
          </Command.List>
        </Command>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

## Conteúdo padrão (e-commerce admin)

3 grupos sempre:

### Páginas (todas as rotas + label simples)
- Visão geral, Pedidos, Produtos, PCs montados, Personas, Clientes, Cupons, Lista de espera, Reviews, Analytics, Configurações

### Criar
- Novo produto
- Novo cupom (futuro)
- Novo persona (futuro)

### Ferramentas
- Abrir loja em nova aba (window.open)
- Recarregar página (window.location.reload)
- Exportar pedidos CSV (futuro)

## Anatomia visual

- **Backdrop:** `bg-bg/85 backdrop-blur-md` — vinheta dark
- **Modal:** `max-w-2xl rounded-xl border border-border-strong bg-surface shadow-[0_30px_80px_rgba(0,0,0,0.6)]`
- **Input:** `text-base px-5 py-4` + Search icon + `esc` button
- **Item ativo:** `data-[selected=true]:bg-primary-soft` + ArrowRight aparecendo
- **Item icon:** `h-7 w-7 rounded-md` com tone shift no selected
- **Footer kbd hints:** `↵ selecionar · ↑↓ navegar · esc fechar` + brand mark

## Acessibilidade

- `aria-modal="true"` no backdrop
- `aria-label="Buscar comandos"` no Command.Input
- Focus trap nativo do cmdk
- Esc fecha (mesmo fora de input)
- Cmd+K toggle (não force open) — segundo press fecha

## Extensões possíveis

- **Recent commands** (localStorage como SearchBar da loja)
- **Keyboard shortcuts globais** (e.g., G+O = Go Orders)
- **Action history** com undo
- **Preview pane** ao lado direito (Linear-style)

## Caso real

Kore Tech 2026-04-28 — implementado em `dashboard/src/components/CommandPalette.tsx` (commit `af6dfc2`). Mountado em `(admin)/layout.tsx`.

## Padrões relacionados
- [[painel-admin-tier-1]] — checklist completo do painel
- [[../30-LICOES/22-css-layer-com-import]]
