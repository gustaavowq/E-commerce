# 💻 Fase 4 — Frontend mobile-first

> Loja Next.js 14 App Router. Cada componente nasce 375 → 768 → 1440. Login redirect inteligente. Write/Read separados. `describeApiError` em toda mutation. 27-pt mobile audit ZERO crítico.

Skill responsável: **`ecommerce-frontend`**.
Tempo esperado: **60–90 min**.
Gate de saída: [[GATES#Gate 4 — Frontend]].

Esta é a fase com **maior recorrência de bugs Kore Tech** (scroll, auth, redirect, sidebar empilhada, Dados Inválidos, truncate). Densidade de checklist + snippets é proposital.

## 9 subcamadas

### 4.1 Estrutura App Router

```
frontend/src/
├── app/
│   ├── layout.tsx          ← root layout (mobile-first shell)
│   ├── providers.tsx       ← QueryClient + auth hydrate via /auth/me
│   ├── page.tsx            ← home
│   ├── auth/
│   │   ├── login/page.tsx  ← LoginForm
│   │   ├── register/page.tsx
│   │   └── reset/page.tsx
│   ├── account/page.tsx    ← protegida
│   ├── checkout/page.tsx   ← protegida
│   ├── orders/[id]/page.tsx← protegida
│   ├── produtos/
│   │   ├── page.tsx        ← catálogo
│   │   └── [slug]/page.tsx ← PDP
│   └── carrinho/page.tsx
├── stores/
│   ├── auth.ts             ← Zustand
│   ├── cart.ts             ← Zustand persist + flag hydrated
│   └── wishlist.ts         ← Zustand persist
├── lib/
│   ├── api.ts              ← fetch wrapper credentials: 'include'
│   ├── api-error.ts        ← describeApiError + ApiError
│   └── format.ts           ← formatBRL etc
└── services/
    ├── auth.ts             ← getMe, login, register
    ├── products.ts
    └── types.ts            ← XxxDetail + XxxWritePayload separados
```

**Hydrate via `/auth/me`** em providers (não em layout). Snippet em [[../50-PADROES/auth-pattern-completo]].

### 4.2 Auth flow + redirect inteligente

**A subcamada que mais quebrou no Kore Tech.**

#### Regras
- Toda ação que exige login → `/auth/login?redirect=<path encoded>`
- LoginForm lê `searchParams.get('redirect')` e respeita
- `redirectAfterLogin(user)` é helper único pra **email/senha + Google OAuth**
- ADMIN sem `?redirect=` explícito → vai pra `NEXT_PUBLIC_DASHBOARD_URL`
- **NUNCA** jogar pra home/`/account` perdendo contexto

#### Snippet completo — `redirectAfterLogin` helper

```tsx
// frontend/src/components/LoginForm.tsx
import { useRouter, useSearchParams } from 'next/navigation'
import type { User } from '@/services/types'

function useRedirectAfterLogin() {
  const router = useRouter()
  const params = useSearchParams()

  return (user: User) => {
    const redirect = params.get('redirect')
    if (redirect) {
      router.push(redirect)
      return
    }
    if (user.role === 'ADMIN') {
      const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? '/'
      window.location.href = dashboardUrl  // hard nav porque domínio diferente
      return
    }
    router.push('/account')
  }
}

// Email/senha
async function onSubmit(data: LoginFormData) {
  try {
    const { user } = await login(data)
    setUser(user)
    redirectAfterLogin(user)  // ← helper único
  } catch (err) {
    toast.push({ tone: 'error', ...describeApiError(err) })
  }
}

// Google OAuth — depois do callback
function handleGoogleSuccess(user: User) {
  setUser(user)
  redirectAfterLogin(user)  // ← MESMO helper
}
```

#### Snippet — página protegida

```tsx
// frontend/src/app/account/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'

export default function AccountPage() {
  const router = useRouter()
  const { user, hydrated } = useAuth()

  useEffect(() => {
    if (hydrated && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/account')}`)
    }
  }, [hydrated, user, router])

  if (!hydrated) return <Skeleton />  // espera hydrate antes de decidir
  if (!user) return null               // o useEffect vai redirecionar
  return <AccountContent user={user} />
}
```

**Atenção:** sem `hydrated`, Zustand persist pode disparar `!user` antes do localStorage hidratar → user logado é jogado pro login (lição 14).

#### Snippet — buy-now no PDP guest-friendly

```tsx
function BuyNowButton({ product }: { product: ProductDetail }) {
  const router = useRouter()
  const { user, hydrated } = useAuth()
  const addToCart = useCart(s => s.add)

  function buyNow() {
    addToCart({ productId: product.id, qty: 1 })  // ← cart local, persiste
    if (hydrated && !user) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`)
      return
    }
    router.push('/checkout')
  }

  return <Button onClick={buyNow} disabled={!hydrated}>Comprar agora</Button>
}
```

**Cart é local-first.** Guest pode construir carrinho inteiro. Login só no `/checkout`. Persiste entre sessões via Zustand persist.

#### 3 fluxos a testar em prod (gate 4)

1. **PDP guest "Comprar agora"** → adicionar ao cart → redirect login → logar → checkout direto com item
2. **`/account` direto sem login** → redirect login → logar → volta `/account`
3. **`/checkout` sem login** → redirect login → logar → volta `/checkout`

Repetir os 3 com Google OAuth também.

#### Logout sem `window.location.reload()`

```tsx
async function handleLogout() {
  await logout()
  setUser(null)
  // cart, wishlist NÃO limpa (são local). User-specific data limpa via:
  queryClient.clear()
  router.push('/')
  router.refresh()  // re-roda Server Components
  // ❌ NÃO: window.location.reload() — UX ruim
}
```

### 4.3 Tipos Write/Read separados

Saga 26 — anti-padrão dominante.

```ts
// frontend/src/services/types.ts

// READ — o que o GET retorna
export type ProductDetail = {
  id: string
  slug: string
  name: string
  price: number
  category: { id: string; name: string }       // ← objeto
  brand: { id: string; name: string; slug: string }  // ← objeto
  images: { url: string; alt: string }[]
  createdAt: string
}

// WRITE — o que o POST/PATCH espera
export type ProductWritePayload = {
  name: string
  slug?: string
  price: number
  hardwareCategory?: string  // ← canônico backend, não 'category'
  brandId?: string           // ← FK string, não objeto
  images?: { url: string; alt: string }[]
}
```

**Anti-padrão:** `Partial<ProductDetail>` em PATCH. **Crime contra o framework.** Ver [[../30-LICOES/26-dados-invalidos-silencioso]].

### 4.4 Mobile-first dos componentes core

Reuso de [[../50-PADROES/MOBILE-FIRST]]. **Todo componente** nasce em 375px.

#### Hero (escala completa)

```tsx
<h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem] leading-[1.04] sm:leading-[1.02] break-words">
  {headline}
</h1>
```

`text-5xl` (48px) com `leading-[1.02]` em viewport 360px **vaza**. Use `text-[2.5rem]` (40px) base.

#### Inputs — desligar auto-zoom iOS

```tsx
<input className="text-base ..." />  // ≥ 16px
```

`text-sm` (14px) → iOS faz auto-zoom no foco. Bug invisível pra dev desktop.

#### Touch targets

```tsx
// Wrapper para ícones < 24px
<button className="h-11 w-11 flex items-center justify-center" aria-label="Carrinho">
  <ShoppingBag className="h-5 w-5" />
</button>
```

44×44px Apple/Google guideline.

### 4.5 Bottom-sheet em vez de sidebar empilhada

**Anti-padrão dominante Kore (visto em 6 arquivos):** `lg:grid-cols-[280px_1fr]` que vira coluna vertical em mobile, empurrando produtos pra baixo de 600px de filtros.

Pattern correto:

```tsx
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'

export function ProductsClient({ products, filters }: Props) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const activeCount = countActiveFilters(filters)

  // Body lock
  useEffect(() => {
    if (!mobileFiltersOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [mobileFiltersOpen])

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-6">
      {/* Botão sticky-top mobile */}
      <button
        onClick={() => setMobileFiltersOpen(true)}
        className="lg:hidden sticky top-16 z-30 flex items-center gap-2 ..."
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtros {activeCount > 0 && <Badge>{activeCount}</Badge>}
      </button>

      {/* Sidebar inline desktop */}
      <aside className="hidden lg:block">
        <FiltersPanel filters={filters} />
      </aside>

      {/* Bottom-sheet mobile */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end lg:hidden"
            onClick={() => setMobileFiltersOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full rounded-t-2xl bg-surface p-5 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FiltersPanel filters={filters} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>{/* grid de produtos */}</div>
    </div>
  )
}
```

Mesmo pattern pra: catálogo, builder, cart-aside, PDP-related-products, painel admin filtros.

#### Sticky bar bottom (CTAs críticos)

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
  <div className="flex items-center justify-between gap-3">
    <p className="text-sm font-medium">Total: {formatBRL(total)}</p>
    <Button onClick={onCheckout}>Finalizar pedido</Button>
  </div>
</div>
{/* Importante: pb-28 no <main> pra não cobrir conteúdo */}
```

### 4.6 PDP + Cart + Checkout

#### Cart Zustand persist + `hydrated` flag

```tsx
// frontend/src/stores/cart.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartState = {
  items: CartItem[]
  hydrated: boolean
  add: (item: CartItem) => void
  remove: (productId: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hydrated: false,
      add: (item) => set(state => ({ items: addOrIncrement(state.items, item) })),
      remove: (productId) => set(state => ({ items: state.items.filter(i => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart',
      onRehydrateStorage: () => (state) => state?.hydrated || (state ? (state.hydrated = true) : null),
    }
  )
)
```

**Antes de qualquer redirect baseado em cart**, checar `hydrated`. Sem flag → race entre Zustand sync default `[]` e localStorage hydrate → user é jogado pro login indevidamente (lição 14).

#### Buy-now (já mostrado em 4.2)

#### Checkout — login obrigatório

```tsx
// frontend/src/app/checkout/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, hydrated: authHydrated } = useAuth()
  const { items, hydrated: cartHydrated } = useCart()

  useEffect(() => {
    if (authHydrated && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/checkout')}`)
      return
    }
    if (cartHydrated && items.length === 0) {
      router.replace('/carrinho?empty=1')
    }
  }, [authHydrated, cartHydrated, user, items, router])

  if (!authHydrated || !cartHydrated) return <CheckoutSkeleton />
  if (!user || items.length === 0) return null

  return <CheckoutContent />
}
```

### 4.7 Animações — motion-policies

Reuso de [[../50-PADROES/motion-policies]].

#### Regras
- Animação responde a **ação clara do user** (clique, hover desktop, scroll explícito do user)
- Animação **ambient** (aurora, light beam) NÃO segue cursor/scroll
- `prefers-reduced-motion` em TUDO
- `pointer:fine` check antes de Tilt3D/glare/cursor effects
- Componente 3D (R3F) disable em `<lg`

#### Anti-padrão crítico (lição 27)

```css
/* ❌ NÃO FAZER — globals.css */
html { scroll-behavior: smooth; }  /* mata mouse de roda comum */
body { scroll-behavior: smooth; }
```

Smooth scroll global interpola JS por tic do mouse → user roda 3 cliques de roda, página rola 1 cm porque cancelou e recomeçou. Solução: usar `scrollIntoView({ behavior: 'smooth' })` apenas em ações pontuais (anchor link, voltar ao topo).

#### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .aurora-bg::before, .aurora-bg::after { opacity: 0.25 !important; }
}
```

#### `pointer:fine` check

```tsx
function Tilt3D({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches)
  }, [])
  if (!enabled) return <>{children}</>
  return <TiltImpl>{children}</TiltImpl>
}
```

### 4.8 `describeApiError` em todas mutations

Sem exceção. Toast genérico = bug.

```tsx
const updateProduct = useMutation({
  mutationFn: (payload: ProductWritePayload) => api.patch(`/admin/products/${id}`, payload),
  onSuccess: () => {
    toast.push({ tone: 'success', title: 'Produto atualizado' })
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  },
  onError: (err) => {
    toast.push({ tone: 'error', ...describeApiError(err) })  // ← SEMPRE
  },
})
```

`describeApiError` lê `_form` e `fieldErrors` do backend (subcamada 3.4). Se faltar `_form` no backend, ainda assim o helper retorna fallback útil.

#### Banner de erro topo + auto-jump em forms multi-tab

```tsx
const errors = form.formState.errors
const firstErrorTab = findTabWithError(errors)
useEffect(() => {
  if (firstErrorTab) setActiveTab(firstErrorTab)
}, [firstErrorTab])

return (
  <>
    {Object.keys(errors).length > 0 && (
      <Banner tone="error">
        Corrige antes de salvar:
        <ul>{Object.entries(errors).map(([k, v]) => <li key={k}>{FIELD_LABELS[k]}: {v.message}</li>)}</ul>
      </Banner>
    )}
    <Tabs value={activeTab}>...</Tabs>
  </>
)
```

### 4.9 QA visual self-check antes de PR

DevTools "Toggle device toolbar":

- [ ] **375px** — sem overflow horizontal, sticky bar não cobre conteúdo, touch targets ≥ 44px
- [ ] **768px** — layout intermediário OK, transições 1col→2col suaves
- [ ] **1440px** — desktop padrão, sem padding excessivo no centro

Print das 3 viewports em mensagem PR/relatório. **Sem print, fix de UI não conta.**

## ✅ Checklist de saída (Gate 4)

Reuso direto de [[GATES#Gate 4 — Frontend]].

## 🚫 Anti-padrões Kore (consolidados)

Lista numerada. Cada um custou bug em prod ou lição na memória.

1. **`window.location.reload()` no logout** — UX ruim, recarrega tudo. Use `router.refresh()` + `setUser(null)`.
2. **`scroll-behavior: smooth` global** ([[../30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]]) — mata mouse de roda. Use só em ação pontual.
3. **Cursor glow seguindo viewport** — motion sickness em mobile, banido pelo Gustavo.
4. **Sidebar empilhada vertical mobile** — anti-padrão dominante 6 arquivos Kore. Sempre bottom-sheet.
5. **`Partial<XxxDetail>` em PATCH** ([[../30-LICOES/26-dados-invalidos-silencioso]]) — saga 3h. Sempre `XxxWritePayload`.
6. **Toast "Dados inválidos" sem `describeApiError`** — frontend mascara erro útil.
7. **Componente 3D (R3F) em mobile** — 250KB JS, 30 FPS iPhone SE. Disable `<lg`.
8. **Inputs `text-sm`** — auto-zoom iOS.
9. **`truncate` em `<span>`** ([[../30-LICOES/21-truncate-precisa-block]]) — text-ellipsis ignora inline. Use `motion.div + flex min-w-0`.
10. **Hover-only state sem fallback touch** — botão "invisível" em mobile.
11. **Página protegida sem `hydrated` flag** ([[../30-LICOES/14-zustand-persist-race]]) — race jogando user logado pro login.
12. **Login sem `?redirect=`** ([[../50-PADROES/login-redirect-pattern]]) — perde contexto, conversão cai.
13. **Mood/depth pack pesado em mobile** — blur 110px low-end = 30 FPS. Disable + `prefers-reduced-motion`.
14. **PR de UI sem print das 3 viewports** ([[../50-PADROES/validar-visual-antes-de-fechar]]) — fix invisível pra reviewer.

## Padrões reusáveis
- [[../50-PADROES/auth-pattern-completo]] — auth completo
- [[../50-PADROES/MOBILE-FIRST]] — 27 pontos anti-Lovable
- [[../50-PADROES/UX-UI-QUALIDADE]] — bar Apple/Linear
- [[../50-PADROES/DESIGN-PROFISSIONAL]] — depth pack snippets
- [[../50-PADROES/motion-policies]] — animação sem invasiva
- [[../50-PADROES/zustand-persist-pattern]] — flag hydrated
- [[../50-PADROES/header-loja-active-underline]] — `layoutId`
- [[../50-PADROES/validar-visual-antes-de-fechar]] — olho em devtools
- [[../50-PADROES/login-redirect-pattern]] — referência consolidada em auth-pattern-completo
