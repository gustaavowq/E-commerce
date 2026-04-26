# 🚨 #03 `tsx` precisa estar em `dependencies` (não `devDependencies`)

## Sintoma

Backend deploy verde no Railway, `/healthz` OK, `/products` retorna `data: []`. Catálogo vazio. Logs do Railway não mostravam o seed rodar.

## Causa raiz

O Dockerfile de produção faz:
```dockerfile
RUN npm ci --omit=dev
```

`tsx` (que executa `prisma/seed.ts` via comando `tsx prisma/seed.ts` definido em `package.json#prisma.seed`) estava em `devDependencies`. Resultado: container de prod não tinha `tsx`, comando falhava silenciosamente.

```json
// package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"        // ← invoca tsx
  }
}
```

## Fix aplicado

Mover `tsx` pra `dependencies`:
```diff
{
  "dependencies": {
+   "tsx": "^4.19.2",
    ...
  },
  "devDependencies": {
-   "tsx": "^4.19.2",
    ...
  }
}
```

E atualizar `package-lock.json` com `npm install --package-lock-only`.

## Alternativa (se não quiser tsx em prod)

Compilar `prisma/seed.ts` no build do TypeScript:
```json
// tsconfig.json
"include": ["src/**/*.ts", "prisma/**/*.ts"]
```

E mudar:
```json
"prisma": {
  "seed": "node dist/prisma/seed.js"
}
```

Não fizemos isso no Miami Store por simplicidade.

## Prevenção

- ✅ Em `package.json` template: `tsx` sempre em `dependencies`
- ✅ Smoke test pós-deploy: bater `/products` e confirmar que não retorna lista vazia depois do seed
- ✅ Railway logs mostram `Running seed command...` quando o startCommand inclui seed — checar
