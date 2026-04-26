# 🚨 #02 Cookie cross-domain: PSL bloqueia compartilhamento

**Severidade:** ALTO

## Sintoma

User loga na loja (`*.vercel.app`), redireciona pro painel (`*.vercel.app` outro projeto, OU `*.up.railway.app`), e o painel se comporta como **deslogado**. Login parecia "não funcionar".

## Causa raiz

`vercel.app` e `trycloudflare.com` estão na **Public Suffix List**. Browser não permite setar cookie com `Domain=.vercel.app` ou `Domain=.trycloudflare.com` — seria como compartilhar cookie entre lojas.com e bancos.com.

Backend tentava setar `Domain=.miami.test` (config copiada do dev local), o que browser rejeitava silenciosamente em prod. Ou setava sem Domain mas cookie ficava preso ao host da API e não chegava no painel.

## Fix aplicado

**Não setar `COOKIE_DOMAIN` em ambientes onde os 3 serviços estão em domínios PSL diferentes.**

Em vez disso:
- Cookie é setado no domínio da API (`*.up.railway.app`)
- Frontend (loja+painel) faz fetch pra API com `credentials: 'include'`
- Browser inclui cookie automaticamente nessas requests cross-origin
- API responde com `Access-Control-Allow-Credentials: true`
- Cookie precisa ter `SameSite=None` + `Secure=true`

Painel valida auth client-side (não server-side middleware), porque cookie só vive no domínio da API.

## Quando volta a usar `COOKIE_DOMAIN`

Em prod com **domínio próprio compartilhado**:
- Loja: `loja.miamistore.com.br`
- Painel: `admin.miamistore.com.br`
- API: `api.miamistore.com.br`

Aí setar:
- `COOKIE_DOMAIN=.miamistore.com.br`
- `COOKIE_SAMESITE=lax` (mesmo registrável domain, não precisa de None)

E middleware Next no painel volta a funcionar.

## Prevenção

- ✅ Documentar nas env vars qual config vale pra cada ambiente (dev local / Vercel demo / prod com domínio)
- ✅ `.env.example` tem comentário: `# COOKIE_DOMAIN= → vazio em Cloudflare/Vercel separados, .seudominio.com em prod`
- ✅ No deploy do Vercel, **não** colocar middleware Next no painel se cookie vem de outro registrável domain
- ✅ Testar fluxo login completo no smoke E2E pós-deploy
