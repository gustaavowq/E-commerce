# #08 `.tsbuildinfo` no gitignore precisa de `*` na frente

## Sintoma

`src/dashboard/tsconfig.tsbuildinfo` aparecia como modificado no VSCode toda vez que TypeScript compilava, mesmo após `git rm --cached`.

## Causa raiz

`.gitignore` tinha:
```
.tsbuildinfo
```

Essa regra match SÓ arquivos chamados literalmente `.tsbuildinfo` (com ponto na frente). Não match `tsconfig.tsbuildinfo` que é o nome real gerado pelo `incremental: true` do TypeScript.

`git check-ignore -v src/dashboard/tsconfig.tsbuildinfo` → exit 1 (não ignorado).

## Fix aplicado

```diff
- .tsbuildinfo
+ *.tsbuildinfo
```

## Prevenção

`.gitignore` template padrão:
```
# Build outputs
dist/
build/
out/
.next/
*.tsbuildinfo       # ← com asterisco
```
