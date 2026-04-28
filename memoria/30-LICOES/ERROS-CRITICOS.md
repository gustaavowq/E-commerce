# 🚨 ERROS CRÍTICOS — top dos críticos que custaram horas

Cada item aqui custou ≥ 1 hora pra descobrir + emoção do user. Antes de qualquer projeto novo, ler tudo.

## 🔥 SAGA "Dados Inválidos" silencioso (commit 5b78ca3)

### O que aconteceu (cliente furioso depois de 4 fixes errados)

PATCH `/admin/products/:id` retornava `422 "Dados inválidos"` sem dizer qual campo. User clica salvar, toast genérico, sem dica nenhuma. Eu apliquei 4 fixes em sequência (relax schema, schema dinâmico create/edit, banner com errors, helper describeApiError), nenhum atacou a causa raiz. Cliente explodiu na 5ª tentativa: **"MANO NÃO RESOLVE, CHAME TODOS OS AGENTS"**.

### Causa raiz (descoberta via QA agent reproduzindo Zod local)

3 falhas em cadeia, **nenhuma errada isoladamente**:

**1. Frontend mandava body com nome errado dos campos**

```ts
// dashboard/src/app/(admin)/products/[id]/page.tsx (PATCH body antigo)
adminProducts.update(id, {
  category: values.category,        // ❌ backend espera hardwareCategory
  persona:  values.persona,         // ❌ backend espera personaSlug
  brand:    { id: brandId, name, slug }, // ❌ backend espera brandId: string
})
```

GET retornava `category`, `persona`, `brand: {...}` (read shape). PATCH esperava `hardwareCategory`, `personaSlug`, `brandId` (write shape). **Read ≠ Write.** O dev usou `Partial<AdminProductDetail>` em PATCH, presumindo simétrico.

**2. Schema Zod backend usava `.strict()`**

```ts
// backend/src/validators/product.ts
export const productUpdateSchema = z.object({...}).strict()
```

`.strict()` rejeita campos desconhecidos com `code: 'unrecognized_keys'` e `path: []` (raiz, não campo individual).

**3. Middleware enviava só `fieldErrors`, descartando `formErrors`**

```ts
// backend/src/middleware/error-handler.ts (antes)
return res.status(422).json({
  error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos',
           details: err.flatten().fieldErrors },  // ← só fieldErrors
})
```

`err.flatten()` retorna `{ formErrors: string[], fieldErrors: { campo: string[] } }`. Issues de `path: []` (como `unrecognized_keys`) vão pra **`formErrors`**. Middleware **descartava `formErrors`**. Frontend recebia `details: {}` vazio, caía no fallback genérico, mostrava "Dados inválidos" puro.

### Fix correto em 3 camadas (defesa em profundidade)

**Camada 1 — origem (frontend rename):**
```ts
// products/[id]/page.tsx + products/new/page.tsx
hardwareCategory: values.category ?? undefined  // era: category
personaSlug:      values.persona ?? null         // era: persona
...(values.brandId ? { brandId: values.brandId } : {})  // era: brand: {id,name,slug}
```

Plus tipo dedicado `AdminProductWritePayload` em `services/types.ts`, **separado** de `AdminProductDetail`. Backend canônico vs API response são entidades diferentes.

**Camada 2 — backend defesa:**
```ts
// backend/src/middleware/error-handler.ts
if (err instanceof ZodError) {
  const flat = err.flatten()
  const details: Record<string, string[]> = { ...flat.fieldErrors }
  if (flat.formErrors.length > 0) {
    details._form = flat.formErrors  // ← chave especial pra erros de schema raiz
  }
  return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details } })
}
```

**Camada 3 — frontend fallback:**
```ts
// dashboard/src/lib/api-error.ts
if (err.code === 'VALIDATION_ERROR' && err.details && typeof err.details === 'object') {
  const fields = err.details as Record<string, string[] | undefined>
  const fieldItems = Object.entries(fields)
    .filter(([k, v]) => k !== '_form' && Array.isArray(v) && v.length > 0)
    .map(([k, v]) => `${FIELD_LABELS_PT[k] ?? k}: ${v?.[0]}`)
  if (fieldItems.length > 0) return { title: 'Corrige antes de salvar', body: fieldItems.join(' · ') }

  if (Array.isArray(fields._form) && fields._form.length > 0) {
    return { title: 'Não foi possível salvar', body: fields._form.join(' · ') }
  }
}
```

### Regras pra nunca mais

#### 🚦 REGRA DE OURO: bug volta 2x = diagnóstico errado

Quando user reporta o **mesmo bug** mais de 2 vezes seguidas após você ter aplicado "fixes":
- **PARE de aplicar bandagem**
- **Despacha agent QA pra reproduzir** o bug via curl/script ANTES de qualquer fix novo
- Se senha admin não bate, simular Zod local com `node -e "..."`
- Bug que parece "aleatório" geralmente tem causa em **camada de serialização** (shape errado, encoding, timezone) — não em lógica de negócio

#### Padrão write/read SEMPRE separado

Pra qualquer endpoint de mutação:
- `XxxDetail` ou `XxxResponse` = shape do GET (read)
- `XxxWritePayload` ou `XxxInput` = shape do POST/PATCH (write)

NÃO usar `Partial<XxxDetail>` em mutações — quase sempre o backend espera shape diferente (FKs em vez de objetos, campos canônicos em vez de UI-friendly, sem campos read-only como `id`/`createdAt`).

#### `.strict()` exige middleware completo

Se o backend usa `.strict()` em qualquer schema Zod, o errorHandler central **DEVE** incluir `formErrors` no payload. Senão você tá criando bugs invisíveis pra cada nova rota.

#### Smoke test write antes de declarar tela pronta

Pra cada CRUD admin no painel, o checklist NÃO É só:
- [x] List funciona (GET)
- [x] Detail funciona (GET)
- ... mas TAMBÉM:
- [ ] **Update funciona (PATCH) — clicar salvar e ver toast verde**
- [ ] Create funciona (POST) — idem

#### Senha admin atualizada na memória

Quando despachei agent QA pra reproduzir via curl, ele bateu em `UNAUTHORIZED` com a senha em memória. Sem reprodução real, diagnóstico ficou metade chute, metade leitura de código. **Manter senha admin do projeto sempre atualizada na memória pessoal**.

## Outros erros críticos catalogados

| # | Lição | Custo |
|---|---|---|
| 01 | [01-jwt-secret-placeholder](01-jwt-secret-placeholder.md) | CRÍTICO — pentest forjou JWT admin |
| 10 | [10-suggested-variables-railway](10-suggested-variables-railway.md) | CRÍTICO — Railway sugere placeholders inseguros |
| 11 | [11-backend-relations-objeto](11-backend-relations-objeto.md) | CRÍTICO — "Não foi possível carregar essa página" em qualquer card |
| 15 | [15-mercadopago-pix-pre-requisitos](15-mercadopago-pix-pre-requisitos.md) | ~2h — 3 erros MP empilhados (env name, token, chave Pix) |
| 26 | [26-dados-invalidos-silencioso](26-dados-invalidos-silencioso.md) | ~3h — saga acima |

## Padrão de processo: "5x WHY" antes de fix

Quando bug some de aparência simples mas continua aparecendo:
1. Por que o user vê esse erro? (camada UI)
2. Por que a UI tá nesse estado? (camada API)
3. Por que a API retornou isso? (camada backend handler)
4. Por que o handler decidiu rejeitar? (camada validator)
5. Por que o validator não tá sendo claro sobre rejeição? (camada serialização/middleware)

Sem chegar até a 5ª camada, fix em qualquer camada acima é bandagem.
