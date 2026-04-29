# Padrão — Animações invasivas PROIBIDAS

> Aprovado pelo Gustavo após Kore Tech (rejeição explícita do CursorGlow + scroll-jacking + parallax forçado).
> Suplemento ao [[motion-policies]].

## Princípio orientador

> **Animação só vale se responde a uma ação clara do user.** Se o gatilho é scroll-position, cursor-position global, ou tempo passando, é invasiva.

Site de IA Lovable se denuncia por animação que "acontece sem o user pedir". Apple/Linear não fazem isso.

## Lista negra (não fazer NUNCA)

### 1. Cursor Glow / Spotlight global
```tsx
// ❌ PROIBIDO — segue cursor no viewport, distrai do conteúdo
<div className="pointer-events-none fixed inset-0 z-50">
  <div style={{ background: `radial-gradient(... at ${mouseX}px ${mouseY}px ...)` }} />
</div>
```
Por que ruim: distrai, consome battery (re-render a cada mousemove), parece "demo de portfolio", não produto.

### 2. Scroll-jacking
```tsx
// ❌ PROIBIDO — força velocidade/direção do scroll
useEffect(() => {
  document.body.style.overscrollBehavior = 'none'
  // OU
  window.addEventListener('wheel', e => { e.preventDefault(); customScroll(e.deltaY) })
})
```
Por que ruim: quebra muscle memory do user, mata mouse de roda comum, viola affordance do navegador.

Ver [[../30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]] (caso fundador).

### 3. Parallax forçado no hero/sections
```tsx
// ❌ PROIBIDO — fundo se move em velocidade diferente do conteúdo
<motion.div style={{ y: useTransform(scrollY, [0, 1000], [0, 300]) }}>
  <BackgroundImage />
</motion.div>
```
Por que ruim: ruído visual, performance ruim em mobile, vibe genérico de "site moderno IA".

### 4. Auto-play de carrosseis sem trigger
Carrossel que rotaciona sozinho a cada 5s sem user pedir. User abre, espera ler, e o slide muda no meio da leitura. Hostil.

### 5. Animações de entrada em cascata por scroll (FadeIn-on-view exagerado)
Cada parágrafo, cada card, cada ícone aparecendo com delay diferente conforme o user scrolla. Vira festa de fade-in. Apple usa isso com **muita** parcimônia (1 ou 2 elementos por viewport, não 20).

```tsx
// ❌ Cada filho com delay incrementado
{items.map((it, i) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} />
))}

// ✅ Aparecer junto, sem delay sequencial
{items.map((it, i) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} />
))}
```

### 6. Hover effects que ALTERAM bounding box
```tsx
// ❌ scale ou translate grande no hover de card cobre vizinho e mata click do botão dele
whileHover={{ scale: 1.05 }}
```
Trocar por shadow/border (efeito visual sem mexer em bounding box).

Ver [[../30-LICOES/28-botao-nao-pega-click]].

## Whitelist (pode usar à vontade)

- ✅ **Hover state** com mudança de cor, shadow, border (não scale/translate grande).
- ✅ **Click feedback**: ripple curto, scale 0.97 no press, opacity flash.
- ✅ **Page transition** entre rotas (fade 200ms ou slide curtinho).
- ✅ **Loading skeleton** com pulse sutil.
- ✅ **Drag/drop** com feedback visual durante a ação.
- ✅ **Number ticker** ao revelar (uma vez, por seção, não a cada scroll).
- ✅ **Focus ring** animado em inputs (acessibilidade).

## Duração

- Micro-interações (hover, click): **120–200ms**.
- Page transition: **200–300ms**.
- Loading skeleton pulse: **1500ms**.
- Acima de 400ms: questionar. Acima de 600ms: rejeitar a não ser que seja deliberado (ex: confetti de checkout).

## Auditoria visual rápida

- [ ] Abro a home com scroll bem devagar de roda. Algo se mexe sem eu pedir? **NÃO**.
- [ ] Movo o mouse pelo viewport sem clicar em nada. Algo aparece/some? **NÃO** (exceto tooltip explícito em hover de elemento).
- [ ] Faço scroll rápido pra baixo e de volta pra cima. Animação re-dispara cada vez? Ruim. Deve disparar 1x.

## Lições relacionadas

- [[motion-policies]] — política original.
- [[../30-LICOES/27-scroll-behavior-smooth-mata-mouse-roda]] — caso real.
- [[../30-LICOES/33-design-tipo-lovable-vetado]] — anti-padrão geral.
- [[UX-UI-QUALIDADE]] — distância do Lovable.
