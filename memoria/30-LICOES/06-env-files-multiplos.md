# 🚨 #06 `.env` na raiz vs `src/infra/.env` — sincronizar SEMPRE

## Sintoma

Admin atualizou `JWT_SECRET` no `.env` da raiz, fez `docker compose up --force-recreate`, mas backend continuava com o secret antigo. Pentest confirmou: forge JWT com placeholder antigo retornava 200.

## Causa raiz

Duas cópias do `.env`:
- `c:\...\ecommerce-agents\.env` (raiz)
- `c:\...\ecommerce-agents\src\infra\.env` (legado, criado no kickoff inicial)

`docker-compose.yml` aponta `env_file: ../../.env` (relativo a `src/infra/`), o que **deveria** apontar pra raiz. MAS o Compose também faz auto-load de `.env` na **mesma pasta do compose** (`src/infra/.env`). Esse último venceu — sobrescreveu o `JWT_SECRET` da raiz com o placeholder do infra.

## Fix aplicado

1. **Sincronizar manualmente** os 2 arquivos quando mudar qualquer var
2. Recreate backend: `docker compose up -d --force-recreate backend`
3. Confirmar: `docker exec miami-backend env | grep JWT_SECRET`

## Solução melhor (próximo e-commerce)

**Não criar `src/infra/.env`.** Deixar só na raiz, e referenciar explicitamente no compose:
```yaml
# src/infra/docker-compose.yml
services:
  backend:
    env_file:
      - ../../.env       # ← único lugar
```

E garantir que NÃO tem outro `.env` na pasta do compose pra Compose não auto-carregar.

## Prevenção

- ✅ Template do projeto: `.env` só na raiz
- ✅ `.gitignore` bloqueia `src/infra/.env` (qualquer arquivo `.env` em qualquer lugar)
- ✅ README documenta: "**Nunca** crie `.env` em `src/infra/`. Se aparecer, deletar."
- ✅ Pre-deploy check: `find . -name '.env' -not -path '*/node_modules/*'` deve retornar só `./` 
