# Lição 29 — Auth funciona no MEU PC, falha no PC do cliente

> Custo de descoberta: **ALTO** — patrão tentou criar conta no PC dele e deu erro todas as vezes. Sem repro local = invisível.

## Sintoma

- "Criar conta" / "Login" funciona perfeito no PC do dev (você).
- No PC de outra pessoa (cliente, patrão, QA externo) dá erro "Erro inesperado", "Não foi possível", ou loop infinito de redirect.
- Console pode ou não mostrar mensagem útil.

## Causas-raiz cruzando devices

### 1. Cookie `SameSite` errado pra cross-domain
- Loja em `loja.com`, API em `api.loja.com` → tudo mesmo eTLD+1, cookie `SameSite=Lax` funciona.
- Loja em `vercel.app`, API em `railway.app` → domínios diferentes. Cookie precisa `SameSite=None; Secure` OU **bearer token** (Authorization header) em vez de cookie.

```ts
// backend/src/lib/jwt.ts ou onde setar cookie
res.cookie('token', jwt, {
  httpOnly: true,
  secure: true,           // obrigatório em prod
  sameSite: 'none',       // cross-domain
  domain: undefined,      // NÃO setar — deixa browser inferir
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

Ver [[02-cookie-cross-domain]] e [[07-cookie-domain-railway]].

### 2. Cookies de terceiros bloqueados no browser
- Safari, Brave, Firefox em modo restrito bloqueiam cookies de "third-party" por padrão.
- Se loja e API estão em domínios diferentes, cookie da API é "third-party" pro browser na loja.
- **Único fix robusto**: usar mesmo eTLD+1 (subdomain `api.loja.com`) ou Authorization header.

### 3. Rate-limit por IP atrás de proxy sem `X-Forwarded-For`
```ts
// ❌ Backend sem trust proxy: rate-limit lê IP do proxy, não do user
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// ✅ Com trust proxy
app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));
```
Sem isso, todos os users vêm "do mesmo IP" (do load balancer) e batem o rate-limit do primeiro acesso. Cliente em rede compartilhada (corporativa) é o primeiro a ser bloqueado.

### 4. CSP `connect-src` sem o domínio da API em prod
- Local roda OK porque CSP é menos restritiva ou DEV mode.
- Em prod, `connect-src` precisa listar **explicitamente** o domínio da API.

Ver [[05-csp-connect-src]].

### 5. Browser/sistema fora da matriz suportada
- IE 11, Safari < 13, navegadores embed do Insta/Facebook (in-app browsers) podem não suportar `fetch` com `credentials: 'include'` corretamente.
- **Mínimo testar**: Chrome (Win+Mac), Safari (Mac+iOS), Firefox, Edge, Mobile Chrome (Android), Insta in-app browser.

### 6. Adblock / extensão de privacidade bloqueando endpoint
- uBlock + lista EasyPrivacy bloqueia patterns como `/api/auth`, `/track`, etc.
- User vê "erro de rede" no console.
- Não tem fix do lado do código — só comunicação ("desative adblock pra fazer login").

### 7. `localStorage`/`sessionStorage` desabilitado (modo privado em algum browser)
- Se Zustand persist usa localStorage e não tem fallback, store vira undefined.
- Login "funciona" mas user não fica autenticado (token não persiste).

```ts
// ✅ defensiva
const storage = typeof window !== 'undefined' && window.localStorage
  ? createJSONStorage(() => localStorage)
  : undefined;
```

Ver [[14-zustand-persist-race]].

## Suite de smoke obrigatória antes de declarar auth pronto

Rodar em **PC DIFERENTE** do dev, em ordem:

1. [ ] Chrome desktop, janela anônima, criar conta → loga ✓
2. [ ] Chrome desktop, janela normal, login depois logout → ambos OK ✓
3. [ ] Safari macOS, criar conta + login → OK ✓
4. [ ] iOS Safari mobile, criar conta + login → OK ✓
5. [ ] Mobile Chrome Android (em rede 4G, não wifi do dev) → OK ✓
6. [ ] Edge no Windows (PC de cliente real ou VM) → OK ✓
7. [ ] Insta in-app browser (mandar link pro Insta DM, abrir, login) → OK ✓
8. [ ] User tem uBlock ativo → mensagem clara OU funciona ✓
9. [ ] Reset password completo (email recebido, link funciona) ✓
10. [ ] Sessão persiste após reload da página ✓

Documentar em `projetos/[slug]/qa/AUTH-CROSS-DEVICE.md` qual matriz foi testada e em que data.

## Prevenção (regras antes do bug)

- [ ] **Mesmo eTLD+1** sempre que possível (subdomain `api.loja.com`, não Railway+Vercel separados).
- [ ] Se subdomain não der: **Authorization header** com bearer token, nunca cookie cross-domain.
- [ ] **`app.set('trust proxy', 1)`** antes do rate-limit em deploy atrás de proxy.
- [ ] **CSP `connect-src`** revisada por feature nova que faz fetch.
- [ ] **Smoke matrix executada** em PC diferente antes de aprovar deploy.

## Anti-padrão

- ❌ "Funciona no meu PC" — não vale como aprovação. Ver [[../10-PLAYBOOKS/auth-cross-device-smoke]].
- ❌ Setar `domain: '.loja.com'` no cookie sem entender consequência (quebra subdomain isolation).
- ❌ Confiar em CORS configurado uma vez — cada feature nova pode quebrar.
