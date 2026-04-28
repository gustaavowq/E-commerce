# Padrão: Zustand persist com flag `hydrated`

> Padrão obrigatório do framework após [[../30-LICOES/14-zustand-persist-race]].
> Aplicar em TODO store que tenha redirect baseado no estado.

## Por quê

Zustand `persist` middleware faz hydrate do localStorage de **forma
assíncrona** no client. Componente que renderize antes do hydrate
completar vê estado inicial vazio e pode redirecionar erroneamente.

## Template

```ts
'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type FooState = {
  items: Item[]
  hydrated: boolean
  setHydrated: (h: boolean) => void
  // ... outras actions
}

export const useFoo = create<FooState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      // ... outras actions
    }),
    {
      name: 'kore-foo-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
```

## Uso

Páginas que dependem do estado pra decidir redirecionar:

```tsx
const items = useFoo((s) => s.items)
const hydrated = useFoo((s) => s.hydrated)
const [mounted, setMounted] = useState(false)

useEffect(() => { setMounted(true) }, [])

useEffect(() => {
  if (mounted && hydrated && items.length === 0) {
    router.replace('/empty-state')
  }
}, [mounted, hydrated, items.length, router])
```

A guarda `hydrated &&` é **crítica**. Sem ela, o useEffect dispara com
items=[] (default) antes do localStorage carregar.

## Caso especial: ações que mudam estado E redirecionam

Quando uma action zera/altera o estado E redireciona pra outra rota,
adicionar flag local `redirecting` pra travar useEffect:

```tsx
const [redirecting, setRedirecting] = useState(false)

useEffect(() => {
  if (redirecting) return  // ← trava
  if (mounted && hydrated && items.length === 0) router.replace('/cart')
}, [mounted, hydrated, items.length, router, redirecting])

async function placeOrder() {
  const order = await createOrder({...})
  setRedirecting(true)         // trava ANTES de zerar
  clearCart()                   // items=0, mas useEffect ignora
  router.push(`/orders/${order.id}`)
}
```

## Stores que usam esse padrão (Kore Tech)

- `frontend/src/stores/cart.ts` — `hydrated` setado via
  `onRehydrateStorage`. CheckoutClient + CartClient consomem
- `frontend/src/stores/wishlist.ts` — mesmo padrão
- `frontend/src/stores/auth.ts` — `hydrated` setado por hook externo
  (`useAuthSync`) após GET `/auth/me` no boot

## Gotcha: SSR

`persist` não roda em server. Pra evitar mismatch:

```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])

if (!mounted) return null  // OU skeleton
```

## Ver também

- [[../30-LICOES/14-zustand-persist-race]] — sintomas e debug
- [[login-redirect-pattern]] — uso conjunto pra fluxo de auth
