# 🚨 #05 CSP `connect-src` precisa incluir hosts da API

## Sintoma

User loga na loja Vercel. Botão "Entrar" mostra "Erro inesperado". Console do browser mostra:

```
Fetch API cannot load https://e-commerce-production-cd06.up.railway.app/auth/login.
Refused to connect because it violates the document's Content Security Policy.
```

Isso aparecia em **TODO** fetch da loja: `/settings`, `/auth/me`, `/auth/login`, etc. Nenhuma chamada chegava no backend.

## Causa raiz

`projetos/miami-store/frontend/next.config.mjs` tinha CSP herdado do dev local:
```ts
"connect-src 'self' https://*.trycloudflare.com https://api.mercadopago.com",
```

`*.trycloudflare.com` cobria os tunnels Cloudflare de demo. Quando deploy mudou pra Railway+Vercel, `*.up.railway.app` não estava na allowlist do CSP. Browser bloqueava antes do fetch sair.

## Fix aplicado

Adicionar todos os hosts onde a API pode rodar:
```ts
"connect-src 'self' https://*.trycloudflare.com https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com",
```

Mesma mudança em `projetos/miami-store/dashboard/next.config.mjs`.

## Prevenção

- ✅ Template `next.config.mjs` já vem com lista ampla:
  ```
  "connect-src 'self' https://*.up.railway.app https://*.vercel.app https://*.miami.test https://api.mercadopago.com"
  ```
- ✅ Documentar nas envs: "Se mudar host da API, adicionar em CSP `connect-src` dos 2 frontends"
- ✅ Smoke pós-deploy: abrir DevTools console e procurar `Refused to connect`
- ✅ Considerar gerar CSP dinamicamente a partir de `process.env.NEXT_PUBLIC_API_URL`:
  ```ts
  const apiHost = new URL(process.env.NEXT_PUBLIC_API_URL).host
  // monta connect-src com self + esse host + cloudinary
  ```

## Ambiente CSP típico (mais permissivo)

```
default-src 'self'
script-src 'self' 'unsafe-inline'   ← Next precisa unsafe-inline pra hidration
style-src 'self' 'unsafe-inline' fonts.googleapis.com
font-src 'self' fonts.gstatic.com data:
img-src 'self' data: https: blob:    ← https: cobre Cloudinary, placehold, etc
connect-src 'self' https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com
frame-src 'self' https://www.google.com   ← Google Maps em /contato
object-src 'none'
base-uri 'self'
form-action 'self'
```
