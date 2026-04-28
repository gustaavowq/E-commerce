# Padrão: login redirect inteligente

> Aprovado pelo Gustavo: "sempre que vc precisar que o usuario logue
> vc leva ele pra pagina de login e assim que ele logar ja redirecione
> para a pagina desejada"

## Regra do framework

**Toda ação que exige login** deve:

1. Empurrar o user pra `/auth/login?redirect=<path original encoded>`
2. LoginForm lê `searchParams.get('redirect')` e redireciona após
   autenticar (email/senha **OU** Google OAuth)
3. NUNCA jogar o user na home ou `/account` perdendo o contexto

## Padrão por categoria

| Caso | Comportamento |
|---|---|
| Página protegida (`/account`, `/checkout`, `/orders/[id]`) | Detecta `!user && hydrated`, faz `router.replace('/auth/login?redirect=' + encodeURIComponent(currentPath))` |
| **"Comprar agora"** no PDP (guest) | `addToCart()` imediato (cart é local Zustand, persiste). Se `!user`: redirect pra `/auth/login?redirect=/checkout`. Após login, item ainda está no cart |
| Cancelar pedido / endpoints admin | Backend devolve 401. Frontend captura, mesmo padrão de redirect |
| **Login Form** (`redirectAfterLogin`) | Helper único respeita `?redirect`. Se ADMIN sem redirect explícito, vai pra `NEXT_PUBLIC_DASHBOARD_URL` (painel). Funciona pra email/senha E Google OAuth |
| **Cart, Wishlist, Builder** | Local-first (Zustand persist). Guest pode usar tudo. Só precisa logar pra finalizar compra. Persistem entre sessões |

## Implementação canônica

### Página protegida (Client Component)

```tsx
useEffect(() => {
  if (hydrated && !user) {
    router.replace(`/auth/login?redirect=${encodeURIComponent(`/account`)}`)
  }
}, [hydrated, user, router])
```

### Botão CTA condicional (PDP "Comprar agora")

```tsx
function buyNow() {
  addToCart()
  if (authHydrated && !user) {
    router.push(`/auth/login?redirect=${encodeURIComponent('/checkout')}`)
    return
  }
  router.push('/checkout')
}
```

### LoginForm helper

```tsx
function redirectAfterLogin(user: User) {
  const redirect = params.get('redirect')
  if (redirect) {
    router.push(redirect)
    return
  }
  // ADMIN sem redirect explícito vai pro painel
  if (user.role === 'ADMIN') {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'https://default-painel.vercel.app'
    window.location.href = dashboardUrl
    return
  }
  router.push('/account')
}
```

Tanto `onSubmit` (email/senha) quanto `handleGoogleSuccess` chamam
`redirectAfterLogin(user)`.

## Anti-padrões

❌ Após login, sempre ir pra `/account` (perde contexto)
❌ Usar window.location.reload() no logout (recarrega tudo, ruim UX)
❌ Bloquear navegação no PDP sem cart local (guest não consegue
   adicionar ao cart sem logar)

## Cart como sessão guest

Zustand persist + flag `hydrated` (ver [[../30-LICOES/14-zustand-persist-race]])
permite que **guest construa carrinho inteiro** antes de logar. Login só
é exigido no `/checkout` final. Carrinho persiste no localStorage entre
sessões.

## Por quê isso importa

Sem isso: user vê produto, clica "Comprar agora", é jogado pra login,
loga, vai pra home, perde o contexto da compra, abandona. Conversão cai.

Com isso: user vê produto, clica "Comprar agora", é jogado pra login
(item já no cart local), loga, vai DIRETO pro checkout com o item lá.
Conversão preservada.
