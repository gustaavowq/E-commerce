# Lição 28 — Botão não pega o click (parece interativo, não é)

> Custo de descoberta: **CRÍTICO** — bug invisível por code review, só aparece quando humano clica no preview real.

## Sintoma

User clica no botão, ícone, card. Nada acontece. Sem loading, sem navegação, sem erro no console.

## Causas-raiz mais comuns

### 1. Animação cresce além do hitbox e cobre o vizinho
```tsx
// ❌ BUG: hover scale faz o card cobrir o botão "favoritar" do card ao lado
<motion.div whileHover={{ scale: 1.05 }}>
  <ProductCard />
</motion.div>
```
- Em hover, o card escalado se sobrepõe ao card vizinho (z-index implícito do `transform`).
- Botão "favoritar" do card vizinho fica **atrás** do card escalado e perde click.

**Fix:**
```tsx
<motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
  <ProductCard />  {/* z-index isolado */}
</motion.div>
```
Ou: trocar `scale` por elevação visual (shadow, border) que NÃO altera bounding box.

### 2. Overlay invisível com `z-index` capturando click
```tsx
// ❌ BUG: gradient decorativo absolute sem pointer-events:none
<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
<button onClick={...}>Comprar</button>  {/* atrás do gradient */}
```

**Fix:** todo elemento decorativo absolute precisa `pointer-events-none`:
```tsx
<div className="pointer-events-none absolute inset-0 ..." />
```

### 3. `motion.div` sem `pointer-events` no parent
Framer Motion preserva pointer-events, mas se o pai tem `pointer-events: none` em algum estado (ex: durante exit animation), os filhos clicáveis morrem junto.

### 4. Hitbox menor que o ícone visível
Ícone 24px com padding zero = touch-target 24px. iOS exige **44x44px**. Botão "parece" responder mas só pega click no centro do glyph.

**Fix:** padding mínimo + utility `touch-44`:
```tsx
<button className="touch-44 p-3" aria-label="Favoritar">
  <Heart className="h-5 w-5" />
</button>
```

### 5. `<a>` envolvendo `<button>` (HTML inválido)
```tsx
// ❌ BUG: HTML quebrado, iOS dispara nav e ignora onClick
<Link href="/produto">
  <button onClick={(e) => { e.stopPropagation(); favoritar() }}>
    <Heart />
  </button>
</Link>
```
- HTML inválido: `<button>` não pode estar dentro de `<a>`.
- iOS prioriza navegação do `<a>` e o `onClick` do botão é descartado.

**Fix:** usar `<button onClick>` separado fora do `<Link>`, ou um único elemento clicável com `e.stopPropagation()` e navegação programática.

### 6. `disabled` invisível
Botão estilizado com `opacity-50` em estado loading mas ainda clicável (porque `disabled` não foi aplicado). User clica 3x e dispara 3 requests.

## Prevenção (checklist obrigatório)

- [ ] **Toda animação que altera bounding box** (`scale`, `translateY` grande) tem `position: relative` no parent OU é trocada por shadow/border.
- [ ] **Todo elemento decorativo `absolute`** tem `pointer-events-none`.
- [ ] **Todo botão de ícone** tem `touch-44` ou `p-3` (mínimo 44x44).
- [ ] **Nunca `<button>` dentro de `<a>`** ou vice-versa.
- [ ] **Estado loading** usa `disabled` (não só visual).
- [ ] **No QA bug bash**: clicar em TODOS os interativos no preview real (não confiar em "deve funcionar").

## Anti-padrão

- ❌ "O código tá certo, deve clicar" — bug visual não confessa pelo `tsc`. Ver [[../50-PADROES/validar-visual-antes-de-fechar]].
- ❌ Adicionar `z-index: 9999` pra "resolver" — esconde sintoma, não causa.

## Lições relacionadas

- [[21-truncate-precisa-block]] — outro bug que parece OK no código mas não no preview.
- [[27-scroll-behavior-smooth-mata-mouse-roda]] — animação global que mata UX.
- [[../50-PADROES/MOBILE-FIRST]] — touch-44 vem daqui.
- [[../50-PADROES/motion-policies]] — quando animar e quando não.
