# 🎯 UX/UI QUALIDADE — distância máxima do Lovable

> "Site de IA mal feita tem padrões reconhecíveis: toast genérico, botão sem loading, delete sem confirm, formulário que não sabe o que tá errado. Estamos no oposto."

Padrão obrigatório pra todo projeto do framework. Estabelecido após audit do Kore Tech (2026-04-28).

## 🔘 BOTÕES

### Sempre
- ✅ **Loading state com spinner** em toda mutation
  ```tsx
  <Button loading={mutation.isPending} disabled={mutation.isPending} onClick={() => mutation.mutate()}>
    Salvar
  </Button>
  ```
- ✅ **Disabled durante request** — previne double-submit
- ✅ **`ConfirmDialog` antes** de toda ação destrutiva (delete, cancelar, refund)
  ```tsx
  <Button variant="danger" onClick={() => setConfirmOpen(true)}>Excluir</Button>
  <ConfirmDialog
    open={confirmOpen}
    title="Excluir produto?"
    description="Sem volta."
    destructive
    onConfirm={() => mutation.mutate()}
    onClose={() => setConfirmOpen(false)}
  />
  ```
- ✅ **Feedback visual em <200ms** (spinner OU disabled OU toast)

### Nunca
- ❌ Dois botões `variant="primary"` na mesma tela (hierarquia confusa)
- ❌ Botão de submit fora de `<form>` (Enter não dispara)
- ❌ Botão sem `aria-label` quando ícone-only

## 📝 FORMULÁRIOS

### Sempre
- ✅ **`useForm + zodResolver`** em forms com 3+ campos (não `useState` manual)
- ✅ **Erro inline embaixo do campo**, não só toast
  ```tsx
  <Input {...register('email')} error={formState.errors.email?.message} />
  ```
- ✅ **Toast genérico "Dados inválidos" PROIBIDO** — sempre `describeApiError(err)` com lista de campos
- ✅ **Foco automático no campo com erro** após submit falho
  ```ts
  function onInvalid(errors) {
    const firstField = Object.keys(errors)[0]
    if (FIELD_TO_TAB[firstField]) setTab(FIELD_TO_TAB[firstField])
    setTimeout(() => errorBannerRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  <form onSubmit={handleSubmit(submit, onInvalid)}>
  ```
- ✅ **Banner de erro no topo** com lista de campos inválidos clicáveis (forms multi-tab)
- ✅ **Labels sempre visíveis**, nunca só placeholder
- ✅ **Schema dinâmico**: criação rígida vs edição flexível
  ```ts
  const schema = isEdit ? editSchema : createSchema
  // edit: campos sem min/regex (backend é autoridade)
  // create: tudo obrigatório (produto novo nasce completo)
  ```

### Nunca
- ❌ Submit que não dispara sem feedback (validação Zod silenciosa)
- ❌ Validação manual com `!form.code` em vez de schema (cupom 200% passa pro backend)
- ❌ Input controlado quebrado: `value={state || data.original}` (não dá pra apagar)
- ❌ `Partial<XxxDetail>` em PATCH (read shape ≠ write shape)

## 📱 RESPONSIVIDADE

### Sempre
- ✅ **Mobile first** — desenvolver começando de 375px e progredir pra desktop
- ✅ **Audit 27 pontos** antes de qualquer deploy de feature nova (ver `MOBILE-FIRST.md`)
- ✅ **QA agent roda em 375px, 768px, 1440px** obrigatório
- ✅ **Componentes pesados (3D, charts)** com `lazy load + lg:block` (não carrega em mobile)
- ✅ **Bottom-sheet > sidebar** em mobile (filtros, drawer, ações)
- ✅ **Sticky bar bottom** pra CTAs críticos sempre visíveis enquanto user scrolla form

### Nunca
- ❌ Desenvolver desktop primeiro e "adaptar" mobile depois (resultado sempre quebrado)
- ❌ `text-7xl` em hero sem responsive scale
- ❌ Sidebar virando coluna vertical longa antes do conteúdo principal mobile
- ❌ Tabela sem indicador de scroll horizontal

## 🔇 ERROS SILENCIOSOS — PROIBIDOS

Esses são bugs invisíveis até user reclamar. **Cada um custa horas de debug + relação estressada.**

### Sempre
- ✅ **`onError` em TODA mutation** com toast informativo via `describeApiError(err)`
  ```ts
  useMutation({
    mutationFn: () => api.update(id, body),
    onSuccess: () => toast.push({ tone: 'success', title: 'Salvo' }),
    onError: (err) => toast.push({ tone: 'error', ...describeApiError(err) }),
  })
  ```
- ✅ **Backend retorna `formErrors` em `details._form`** quando `.strict()` rejeita
- ✅ **Frontend lê `_form` quando `fieldErrors` vazio**
- ✅ **Confirmação antes de delete** (ConfirmDialog)
- ✅ **Loading visível** (spinner OU skeleton) em toda fetch ≥ 200ms
- ✅ **Toast com duração ≥ 4s** + botão fechar manual

### Nunca
- ❌ `useMutation` sem `onError`
- ❌ Delete sem ConfirmDialog (1 clique apaga sem volta)
- ❌ Ação que não dispara feedback visual
- ❌ Toast que some em 1s antes do user ler
- ❌ `early-return silencioso` (`if (!valid) return`) sem toast

## 📊 FEEDBACK PROGRESSIVO

Cada ação do user precisa de **3 níveis** de feedback:

1. **Imediato (<100ms)**: hover state, focus ring, click feedback (background pulse)
2. **Durante (200-2000ms)**: spinner, skeleton, optimistic update
3. **Resultado (após response)**: toast verde (sucesso) OU toast vermelho com detalhe (erro)

Sem qualquer um dos 3 = bug de UX.

## 🎨 HIERARQUIA VISUAL

### Botões (3 níveis)
- **Primary (cyan glow)**: 1 por tela, ação principal (Comprar, Salvar, Criar)
- **Secondary (border outline)**: ações importantes (Voltar, Cancelar, Editar)
- **Ghost (text-only)**: ações de descarte (Limpar filtros, Voltar pra lista)

### Cores por estado
- **success** (`#00E676`): completou, pago, em estoque
- **warning** (`#FFB74D`): atenção (estoque baixo, pendente)
- **danger** (`#FF5252`): erro, destrutivo, esgotado
- **primary** (`#00E5FF`): destaque de marca, ação primária
- **text-muted**: secundário, metadata

### Tipografia
- **Display** (Inter Display): hero, h1
- **Body** (Inter): texto corrido, descrição
- **Specs** (JetBrains Mono): números, códigos, dados técnicos
- **Pesos**: `font-medium` (500) padrão, `font-semibold` (600) ênfase, `font-bold` (700) heading
- **NUNCA** `font-black` (900) — peso brutal, destoa

## 🔍 SCANNABILITY

User não lê, scanneia. Cada tela precisa:
- **Hierarquia clara** (h1 > h2 > h3 com tamanhos discrepantes)
- **Whitespace generoso** (`space-y-6` mínimo entre sections)
- **CTAs visíveis acima do fold**
- **Densidade balanceada** — admin denso (Linear-tier), loja respirável (Apple-tier)

## ✅ Checklist final pré-deploy

Antes de declarar feature pronta:
- [ ] Smoke test write (clicar salvar 1 vez, ver toast verde)
- [ ] Smoke test em 375px (mobile real ou DevTools)
- [ ] `tsc --noEmit` zero erros
- [ ] `prefers-reduced-motion` testado
- [ ] Touch targets ≥ 44px nos clicáveis
- [ ] Loading state em todas mutations
- [ ] ConfirmDialog em todas destrutivas
- [ ] `describeApiError` em todos `onError`
- [ ] Banner de erro com lista de campos em forms

## Padrões relacionados
- [[MOBILE-FIRST]] — regras anti-Lovable mobile
- [[DESIGN-PROFISSIONAL]] — depth pack + active underline
- [[../30-LICOES/ERROS-CRITICOS]] — bugs silenciosos custam horas
- [[motion-policies]] — animação responde a ação
