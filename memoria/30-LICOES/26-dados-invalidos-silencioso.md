# 26 — "Dados inválidos" silencioso (campo write vs read)

## Sintoma

User clica "Salvar alterações" no painel admin, recebe toast vermelho "Dados inválidos / Não foi possível salvar". Sem nenhuma indicação de qual campo está errado. Nenhum log no browser. Nenhum erro inline no form. Pra cada salvamento parece sortear um motivo aleatório.

Saga real: 3 horas de fixes em sequência, todos sem efeito:
- Schema Zod do client mais frouxo
- Schema dinâmico create vs edit
- `describeApiError` extraindo `details.fieldErrors`

Nenhum atacou a causa raiz, porque era invisível pra qualquer ferramenta sem reproduzir via curl.

## Causa raiz

3 falhas em cadeia, nenhuma errada isoladamente:

**1. Frontend mandava body com nomes errados**

`dashboard/src/app/(admin)/products/[id]/page.tsx` (PATCH body):
```ts
adminProducts.update(id, {
  name, slug, description, basePrice,
  category: values.category,        // ❌ backend espera hardwareCategory
  persona: values.persona,           // ❌ backend espera personaSlug
  brand: { id: brandId, name, slug } // ❌ backend espera brandId: string
})
```

Confusão: o GET retorna `category`, `persona`, `brand: {id,name,slug}` (read shape). O PATCH espera `hardwareCategory`, `personaSlug`, `brandId` (write shape). Read ≠ Write. O dev frontend assumiu simétrico e usou o mesmo `Partial<AdminProductDetail>` pra ambos.

**2. Schema Zod backend usa `.strict()`**

```ts
// backend/src/validators/product.ts
export const productUpdateSchema = z.object({...}).strict()
```

`.strict()` rejeita campos desconhecidos com `code: 'unrecognized_keys'` e `path: []` (raiz do objeto, NÃO um campo individual).

**3. Middleware envia `fieldErrors` mas não `formErrors`**

```ts
// backend/src/middleware/error-handler.ts
if (err instanceof ZodError) {
  return res.status(422).json({
    error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos',
             details: err.flatten().fieldErrors },  // ← só fieldErrors
  })
}
```

`err.flatten()` retorna `{ formErrors: string[], fieldErrors: { campo: string[] } }`. Issues de `path: []` (como `unrecognized_keys`) vão pra `formErrors`. O middleware **descartava `formErrors`**. Frontend recebia `details: {}` vazio.

**4. Frontend cai no fallback genérico quando details vazio**

`describeApiError` (`dashboard/src/lib/api-error.ts`) procurava campos em `details`. Achava `{}`. Não tinha fallback pra `formErrors`. Caía no `err.message || 'Não foi possível salvar'`. Mensagem `err.message` era literalmente `'Dados inválidos'`. Resultado pro user: zero diagnóstico.

## Fix em 3 camadas (defesa em profundidade)

### Camada 1 (origem): renomear campos no client

`dashboard/src/app/(admin)/products/[id]/page.tsx` + `dashboard/src/app/(admin)/products/new/page.tsx`:

```ts
// Antes:
category: values.category
persona:  values.persona ?? null
...(brandId ? { brand: { id: brandId, name: '', slug: '' } } : {})

// Depois:
hardwareCategory: values.category ?? undefined
personaSlug:      values.persona ?? null
...(brandId ? { brandId } : {})
```

Plus tipo dedicado `AdminProductWritePayload` em `services/types.ts`, **separado** de `AdminProductDetail`. Backend canônico vs API response são entidades diferentes — modelar como tal.

### Camada 2 (backend): incluir `formErrors` em `details`

`backend/src/middleware/error-handler.ts`:

```ts
if (err instanceof ZodError) {
  const flat = err.flatten()
  const details: Record<string, string[]> = { ...flat.fieldErrors }
  if (flat.formErrors.length > 0) {
    details._form = flat.formErrors  // ← chave especial
  }
  return res.status(422).json({
    error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details },
  })
}
```

Garante que erros de schema raiz (`.strict()`, `.refine()` global) **nunca mais ficam invisíveis**.

### Camada 3 (frontend): fallback `_form` no helper

`dashboard/src/lib/api-error.ts`:

```ts
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

## Prevenção

### Padrão 1: tipos write/read SEMPRE separados

Pra qualquer endpoint de mutação:
- `XxxDetail` ou `XxxResponse` = shape do GET (read)
- `XxxWritePayload` ou `XxxInput` = shape do POST/PATCH (write)

NÃO usar `Partial<XxxDetail>` em mutações — quase sempre o backend espera shape diferente (FKs em vez de objetos, campos canônicos em vez de UI-friendly, sem campos read-only como `id`/`createdAt`).

### Padrão 2: schema `.strict()` exige middleware completo

Se o backend usa `.strict()` em qualquer schema Zod, o errorHandler central **DEVE** incluir `formErrors` no payload. Senão você tá criando bugs invisíveis pra cada nova rota.

Adicionar como item do checklist `memoria/10-PLAYBOOKS/security-audit.md`:
- [ ] errorHandler envia `flat.fieldErrors` E `flat.formErrors`?
- [ ] Frontend lê os 2 ou só fieldErrors?

### Padrão 3: smoke test write antes de declarar tela pronta

Pra cada CRUD admin no painel:
- [ ] List funciona (GET) — visível
- [ ] Detail funciona (GET) — visível
- [ ] **Update funciona (PATCH) — clicar salvar e ver toast verde**
- [ ] Create funciona (POST) — idem

O 3º item foi violado. ProductForm tinha visual lindo, mas ninguém tinha testado salvar uma ÚNICA vez. Adicionar ao checklist `memoria/10-PLAYBOOKS/bug-bash-ux.md`.

### Padrão 4: senha admin/test válida em prod

Quando despachei agent QA pra reproduzir via curl, ele bateu em `UNAUTHORIZED` com a senha que eu tinha em memória. Sem reprodução real, diagnóstico ficou metade chute, metade leitura de código.

Adicionar ao bootstrap de qualquer projeto: criar admin de teste com senha conhecida E **escrever na memória pessoal do Claude** assim que criar, atualizar quando mudar.

## Custo de descoberta

~3h de fixes errados (schema relax, dynamic schema create/edit, helper que não atacava a causa) + 8min de QA agent que finalmente isolou via simulação Zod local. Reprodução por curl falhou (senha errada em prod), simulação local salvou.

**Lição de processo**: quando o user reporta o MESMO bug 3+ vezes seguidas após "fix", é sinal de que o diagnóstico está errado, não de que o fix tá incompleto. Parar de aplicar bandagem e despachar QA pra **reproduzir** via curl/script — diagnosticar antes de fixar.

## Lições relacionadas
- [[20-validar-shape-backend]] — meta-lição que esse bug viola
- [[24-redesign-visual-sozinho-nao-impressiona]] — visual lindo sem ação testada = bug invisível
