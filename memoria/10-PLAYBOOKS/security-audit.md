# Playbook: Security Audit (pré-deploy)

> Pentest auto-aplicado. Não opcional. Lições do Miami Store: forge JWT em produção, XSS via Markdown, account takeover via `_devResetUrl`.

## Quando executar

- ✅ Antes de QUALQUER deploy pra prod
- ✅ Sempre que mexer em auth, validação, ou endpoint admin
- ✅ Periodicamente em prod (1x por trimestre)

## Estrutura: 3 pentesters em paralelo + tech lead síntese

Igual fizemos no Miami Store. Cada agente cobre uma frente.

### Agente A: Backend (auth, IDOR, injection, JWT)

**Cobre OWASP Top 10:**
- A01 Broken Access Control → IDOR em /orders/:id, /addresses/:id
- A01 Vertical privilege → cliente acessando /admin/*
- A01 Mass assignment → `role: 'ADMIN'` no body de /register
- A02 JWT secret strength → grep por placeholder no env
- A02 Refresh rotation → testa reuse detection
- A02 Bcrypt cost → confirma >= 10
- A03 Injection → grep por `queryRaw`, `executeRaw`
- A04 Rate limit → tenta 6+ login com senha errada
- A04 Reset password flow → token single-use? hash? expira?
- A05 Helmet config → todos os middlewares ativos
- A05 CORS → não tem `*`
- A07 Email enumeration → `/login` mensagem diferente pra user inexistente?

### Agente B: Frontend (XSS, CSRF, secrets, headers)

- A03 XSS → grep por `dangerouslySetInnerHTML`. Cada uso: conteúdo controlado pelo user? Sanitizado com `escapeHtml()`?
- A04 CSRF → cookies SameSite OK?
- A05 CSP → headers no `next.config.mjs`. Hosts da API em `connect-src`?
- A05 X-Frame, HSTS, Referrer, Permissions-Policy → todos presentes
- Bundle leak → secrets em chunks JS? `find .next -name '*.js' | xargs grep "JWT_SECRET\|MERCADOPAGO_TOKEN"`
- localStorage → tokens sensíveis NÃO devem estar lá

### Agente C: Infra (deps, secrets, headers)

- A06 npm audit em backend, frontend, dashboard
- A02 secrets em git → `git log --all -p -S 'JWT_SECRET'`
- Hardcoded secrets em código → `grep -rE "(secret|key).{0,3}=.{0,3}['\"][^'\"]{16,}"`
- Helmet ativo no Express
- Nginx headers nos 3 vhosts
- CORS_ORIGIN sem wildcard
- Container rodando como root? (Dockerfile tem `USER node`?)
- Postgres porta exposta em prod?

## Brief pro time

Mensagem em `projetos/[slug]/messages/DE-techlead_PARA-todos_<data>-security-audit.md`:

```markdown
# Security audit pré-deploy

3 pentesters em paralelo (A/B/C acima), reportam em ≤ 500 palavras cada com:
- CRÍTICOS (acesso indevido, RCE, dados vazando)
- ALTOS (auth fraca, IDOR limitado)
- MÉDIOS (headers ausentes, deps com CVE médio)
- BAIXOS (info disclosure, hardening)

PoC obrigatório nos críticos: comando + output.

NÃO modificar código nessa fase. Só identificar.

Credenciais pra teste:
- Admin: <email> / <senha>
- API: <URL>
```

## Síntese (Tech Lead)

Consolidar em 4 buckets. Disparar **agentes corretores em paralelo**:

- Backend: críticos auth + IDOR + mass assignment
- Frontend: XSS escape + CSP + headers
- DevOps: nginx headers + helmet config + npm audit fix

## Re-validação (Agente QA)

Smoke E2E + retest dos vetores críticos:

```bash
# JWT forjado com placeholder antigo deve dar 401
node -e 'console.log(jwt.sign({sub:"x",role:"ADMIN"},"placeholder",{expiresIn:"1h"}))' \
  | xargs -I{} curl -H 'Authorization: Bearer {}' <api>/admin/customers
# Esperado: 401

# _devResetUrl removido
curl -X POST <api>/auth/forgot-password -d '{"email":"admin@..."}'
# Response NÃO deve ter _devResetUrl

# Senha fraca rejeitada
curl -X POST <api>/auth/register -d '{"email":"a@b.com","password":"abcd1234","name":"X"}'
# Esperado: 422 com erros validation

# CSP no header
curl -I <loja> | grep Content-Security-Policy
# Esperado: presente, com connect-src incluindo <api>

# X-Frame DENY
curl -I <loja> | grep X-Frame-Options
# Esperado: DENY (NÃO duplicado por Helmet)
```

## Checklist final pré-deploy

- [ ] JWT_SECRET é `openssl rand -base64 48` (não placeholder)
- [ ] SEED_ADMIN_PASSWORD é forte (≥10 chars + special)
- [ ] NODE_ENV=production
- [ ] `_devResetUrl` removido da response /forgot-password
- [ ] `escapeHtml()` aplicado em MarkdownLite
- [ ] CSP `connect-src` inclui hosts API
- [ ] Headers nginx: HSTS, X-Frame DENY, Permissions-Policy, Referrer
- [ ] CORS allowlist sem `*`
- [ ] Webhook MP HMAC verificado se secret setado
- [ ] `npm audit` sem CRITICAL ou HIGH
- [ ] Senha admin rotacionada se vazou em algum lugar
- [ ] Smoke E2E com login admin OK
- [ ] DevTools console sem erros CSP

## Itens documentados pra DEPLOY.md (não fixar agora)

- Next 14→15 upgrade (CVEs HIGH em DoS/smuggling, mas breaking changes)
- Container USER non-root (Dockerfile)
- Postgres porta exposta (em dev OK, em prod fechar)
- WAF Cloudflare (depende de domínio próprio)
- HSTS preload (depende de domínio próprio + 6 meses)

## Após auditoria

- Atualizar [[../30-LICOES/INDEX]] com qualquer nova armadilha encontrada
- Marcar release como aprovado em mensagem `DE-qa_PARA-techlead`
