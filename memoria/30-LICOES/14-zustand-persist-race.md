# 14 — Zustand persist é assíncrono — flag `hydrated` é obrigatória

## Sintoma

Dois bugs UX-críticos causados pelo mesmo padrão:

1. **"Comprar agora" → "Carrinho vazio"**: user clicava "Comprar agora"
   no PDP, era redirecionado pra `/checkout`, mas via "Carrinho vazio"
   e era empurrado de volta pra `/cart`.
2. **"Criar pedido" → `/cart`**: depois de criar pedido com sucesso, a
   página `/checkout` redirecionava pra `/cart` em vez de
   `/orders/[id]`.

## Causa raiz

Zustand `persist` middleware faz hydrate do localStorage de forma
**assíncrona** no client. Sequência típica:

1. SSR/initial render: `items = []` (default do store)
2. React hydrate completa
3. `useEffect` mount roda primeiro: `mounted = true`
4. **persist hydrate AINDA não rodou** → `items` segue `[]`
5. Outro `useEffect` checa `if (mounted && items.length === 0) →
   router.replace('/cart')` → DISPARA antes do persist popular
6. localStorage finalmente carrega, mas user já foi redirecionado

E no caso de "Criar pedido": `clearCart()` zera items=0, useEffect
imediatamente dispara redirect pra `/cart` antes do `router.push` pra
`/orders/[id]` chegar.

## Fix — flag `hydrated` no store + setRehydrate

```ts
type CartState = {
  items: CartItem[]
  hydrated: boolean
  setHydrated: (h: boolean) => void
  // ...
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      // ...
    }),
    {
      name: 'kore-cart-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      },
    },
  ),
)
```

E no checkout, sempre aguardar:

```ts
useEffect(() => {
  if (mounted && cartHydrated && items.length === 0) {
    router.replace('/cart')
  }
}, [mounted, cartHydrated, items.length, router])
```

Pro caso de race **pós-pedido**, adicionar flag local de "estou
navegando":

```ts
const [redirectingToOrder, setRedirectingToOrder] = useState(false)

useEffect(() => {
  if (redirectingToOrder) return
  if (mounted && cartHydrated && items.length === 0) router.replace('/cart')
}, [...])

async function placeOrder() {
  const order = await createOrder({...})
  setRedirectingToOrder(true)  // trava o useEffect
  clearCart()                   // zera items=0
  router.push(`/orders/${order.id}`)
}
```

## Prevenção

- **Todo store Zustand persist** que tenha redirect baseado no estado
  precisa de flag `hydrated`. Padrão obrigatório do framework.
- Cart e wishlist são local-first (guest pode usar) — sempre persist +
  hydrated. Ver `[[50-PADROES/zustand-persist-pattern]]`.
- Em ações que **mudam estado E redirecionam** (clearCart + push),
  usar flag local pra travar useEffect que depende do estado.

## Custo

2 sessões de debug pra cada bug. Sintoma genérico ("não funciona") pq o
console não mostra erro — comportamento racy era reproduzível só em
sessões frescas (sem cache localStorage).
