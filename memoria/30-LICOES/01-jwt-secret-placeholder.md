# 🚨 #01 JWT_SECRET com valor placeholder = porta aberta

**Severidade:** CRÍTICO

## Sintoma

Pentester conseguiu forjar JWT de admin usando o placeholder do `.env.example`, e a API aceitou:
```
curl -H "Authorization: Bearer $forjado" /api/admin/customers → 200 + lista de clientes reais
```

## Causa raiz

`projetos/miami-store/backend/src/config/env.ts:11` tinha:
```ts
JWT_SECRET: z.string().default('troque_isso_em_producao_use_openssl_rand_base64_48')
```

Se o operador subisse prod sem `JWT_SECRET` na env, o backend usava o default. Esse default está **commitado no repo** em `.env.example`. Qualquer pessoa que olhasse o repo sabia o segredo.

## Fix aplicado

1. **Tirar `.default()`** do schema — sem env, backend não sobe (fail-fast):
   ```ts
   JWT_SECRET: z.string().min(32, 'JWT_SECRET muito curto')
   ```

2. **Gerar real**:
   ```bash
   openssl rand -base64 48
   ```

3. **Setar em todos os ambientes** (Railway, dev, etc).

## Prevenção (próximo e-commerce)

- ✅ Em `env.ts`, todas as envs sensíveis usam `.min(N)` sem default
- ✅ Pre-deploy checklist obriga gerar JWT_SECRET fresh
- ✅ `.env.example` mostra `JWT_SECRET=<openssl rand -base64 48>` literal — fica óbvio
- ✅ CI/teste: rodar `grep -r "troque_isso\|change_me\|default_only" projetos/miami-store/backend/src/config/` deve retornar 0 matches
