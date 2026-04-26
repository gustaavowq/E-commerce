# 🚨 #07 `COOKIE_DOMAIN=.miami.test` quebra cookie em Railway/Vercel

## Sintoma

Em Railway, login retorna 200 + `Set-Cookie`, mas browser não persiste o cookie. User segue deslogado.

## Causa raiz

Quando o "Suggested Variables" do Railway leu o `.env.example`, importou `COOKIE_DOMAIN=.miami.test` (config dev local). Backend setou cookie com `Domain=.miami.test`.

Browser rejeita: o domínio atual da request é `e-commerce-production-cd06.up.railway.app`, não `.miami.test`. Set-Cookie ignorado silenciosamente.

## Fix aplicado

Deletar `COOKIE_DOMAIN` da Variables do Railway. Sem essa env, backend (`setAuthCookies`) usa o host atual da request — funciona.

```ts
const cookieBase = {
  httpOnly: true,
  secure,
  sameSite,
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),  // condicional
}
```

## Quando setar `COOKIE_DOMAIN`

- ✅ Local dev com hosts file (`miami.test`, `admin.miami.test`, `api.miami.test`): `.miami.test`
- ✅ Prod com domínio próprio compartilhado: `.miamistore.com.br`
- ❌ Railway: vazio
- ❌ Cloudflare Quick Tunnel: vazio
- ❌ Vercel + Railway separados: vazio

## Prevenção

- ✅ `.env.example` documenta:
  ```
  # COOKIE_DOMAIN
  # - Local dev:    .miami.test
  # - Cloudflare:   (vazio)
  # - Railway:      (vazio)
  # - Prod próprio: .seudominio.com.br
  COOKIE_DOMAIN=
  ```
- ✅ Ao subir Railway, **NUNCA** clicar em "Suggested Variables" — usar Raw Editor + colar lista limpa de [[../20-DECISOES/env-vars-canonicas]]
