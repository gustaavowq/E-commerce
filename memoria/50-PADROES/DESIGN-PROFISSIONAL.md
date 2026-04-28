# 🎨 DESIGN PROFISSIONAL — receita Awwwards-tier

> "Site tech sem personalidade fica quadrado. Personalidade vem de
> camadas que respiram, não de animação invasiva. Awwwards-tier vs
> template-de-IA é a diferença entre o que entregamos."

Receita completa do **Depth Pack Cinematográfico** + **Header Active Underline**, validados em prod no Kore Tech (commits `fad575b`, `c8878d6`, `cccc8d5`).

## 🌌 Depth Pack — 5 camadas de profundidade

### 1. Aurora orbs (ambient)

Dois blobs cyan que respiram. Nunca seguem cursor. Loops longos desincronizados (24s + 32s) com ease-in-out.

```css
.aurora-bg::before,
.aurora-bg::after {
  content: '';
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(110px);
  will-change: transform, opacity;
}
.aurora-bg::before {
  top: -8%; left: -8%; width: 55%; height: 70%;
  background: radial-gradient(circle, rgba(0, 229, 255, 0.32) 0%, transparent 70%);
  opacity: 0.55;
  animation: aurora-drift-a 24s ease-in-out infinite;
}
.aurora-bg::after {
  bottom: -15%; right: -10%; width: 60%; height: 75%;
  background: radial-gradient(circle, rgba(77, 184, 196, 0.28) 0%, transparent 70%);
  opacity: 0.45;
  animation: aurora-drift-b 32s ease-in-out infinite;
}
@keyframes aurora-drift-a { 50% { transform: translate(8%, 10%) scale(1.08); } }
@keyframes aurora-drift-b { 50% { transform: translate(-7%, -6%) scale(1.05); } }
```

### 2. Light beam vertical (cinematic)

Feixe descendo do topo. Mix-blend screen pra somar luz.

```css
.light-beam {
  position: absolute;
  top: -10%; left: 50%;
  width: min(900px, 80%); height: 65%;
  transform: translateX(-50%);
  background: linear-gradient(180deg,
    rgba(0, 229, 255, 0.14) 0%,
    rgba(0, 229, 255, 0.05) 28%,
    rgba(0, 229, 255, 0.01) 60%,
    transparent 85%);
  filter: blur(36px);
  pointer-events: none;
  mix-blend-mode: screen;
}
```

### 3. Vignette (foco no centro)

```css
.vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 110% 80% at 50% 50%,
    transparent 35%,
    rgba(11, 14, 19, 0.4) 85%,
    rgba(11, 14, 19, 0.7) 100%);
  pointer-events: none;
}
```

### 4. Grain global (Apple-style)

SVG fractalNoise sutil no body inteiro. Tira aspecto digital chapado.

```css
.grain-global {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 60;  /* abaixo do header z-100, acima do conteúdo */
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'><filter id='gn'><feTurbulence type='fractalNoise' baseFrequency='0.92' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23gn)' opacity='0.6'/></svg>");
  opacity: 0.04;
  mix-blend-mode: overlay;
}
```

### 5. Grid técnico + bg noise (já existiam)

```css
.grid-fine {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, #000 0%, #000 50%, transparent 100%);
}
.bg-noise {
  background-image: url(...feTurbulence...);
  opacity: 0.06;
  mix-blend-mode: overlay;
}
```

## Aplicação no hero

Ordem importa: aurora atrás, beam, grid, noise, vignette por cima. Conteúdo `relative` pra ficar acima.

```tsx
<section className="relative isolate overflow-hidden canvas-spotlight aurora-bg">
  <div aria-hidden className="light-beam" />
  <div aria-hidden className="absolute inset-0 grid-fine" />
  <div aria-hidden className="absolute inset-0 bg-noise" />
  <div aria-hidden className="vignette" />
  <div className="container-app relative ...">
    {/* conteúdo */}
  </div>
</section>
```

E no `<body>` do layout root:
```tsx
<body>
  <div aria-hidden className="grain-global" />
  {children}
</body>
```

## 🎯 Active Nav — underline animada Linear-tier

Anti-padrão: active state via peso (semibold) cria respiração visual inconsistente entre rotas.

### Padrão correto

```tsx
import { motion } from 'framer-motion'

<nav className="flex items-center gap-0.5 text-sm font-medium">
  {NAV.map((it) => {
    const active = isActive(it.href)
    return (
      <Link
        href={it.href}
        className={cn(
          'relative inline-flex items-center px-3 py-2 transition-colors',
          active ? 'text-text' : 'text-text-secondary hover:text-text',
        )}
      >
        {it.label}
        {active && (
          <motion.span
            layoutId="header-nav-active"
            className="absolute inset-x-3 -bottom-px h-px bg-primary"
            style={{ boxShadow: '0 0 8px rgb(0 229 255 / 0.6)' }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
      </Link>
    )
  })}
</nav>
```

`layoutId` faz framer-motion automaticamente deslizar entre posições quando rota muda. Spring 380/32 (snappy, não bouncy).

## ✅ Princípios fundamentais

### NUNCA
- ❌ **Animações reagindo a cursor** em viewport touch (motion sickness)
- ❌ **Scroll-jacking ou parallax forçado** ("site feio de IA Lovable")
- ❌ **Particles.js / canvas WebGL ambient** (pesa, distrai)
- ❌ **Vídeo de fundo loop** (mata performance mobile)
- ❌ **`font-black` (peso 900)** quando vizinhos são `font-medium` (contraste brutal)

### SEMPRE
- ✅ **CSS layers + filter blur + ease-in-out longo** (leve e elegante)
- ✅ **`prefers-reduced-motion`** desliga drift e cai opacity
- ✅ **Animação ambient** (aurora, light beam) NÃO reage a cursor/scroll
- ✅ **Animação responde a AÇÃO** (hover deliberado, click) — nunca a movimento parasita

## 📐 Tokens canônicos

```css
:root {
  /* Cores Kore Tech */
  --color-bg:        #0B0E13;  /* dark background */
  --color-surface:   #11151D;  /* cards, sections */
  --color-surface-2: #161B26;  /* sidebar, sub-cards */
  --color-surface-3: #212A38;  /* hover states */
  --color-primary:   #00E5FF;  /* cyan accent */
  --color-text:      #E8EEF5;  /* texto principal */
  --color-text-secondary: #B8C2D1;
  --color-text-muted: #5A6573;

  /* Animation */
  --ease-kore: cubic-bezier(0.32, 0.72, 0, 1);
  --dur-fast: 180ms;
  --dur-base: 280ms;  /* padrão pra tudo */
  --dur-slow: 420ms;
}
```

## 🎬 Springs canônicos (framer-motion)

```ts
const SPRING_SNAPPY = { type: 'spring', stiffness: 380, damping: 40 }   // active indicators, slide-overs
const SPRING_GENTLE = { type: 'spring', stiffness: 200, damping: 28 }   // page transitions
const SPRING_BOUNCE = { type: 'spring', stiffness: 480, damping: 24 }   // só pra elementos pequenos com personalidade
```

## 🚫 Performance no mobile

- Aurora orbs: filter `blur(110px)` em low-end mobile (iPhone SE) pode lagar
- **Mitigação**: `prefers-reduced-motion` desliga drift e baixa opacity
- Pra projetos novos: considerar `@media (max-width: 768px) { .aurora-bg::before, ::after { animation: none; opacity: 0.3; } }`

## Padrões relacionados
- [[MOBILE-FIRST]] — animação ambient sem causar lag mobile
- [[UX-UI-QUALIDADE]] — feedback visual + animação ligados
- [[motion-policies]] — animação responde a ação clara
- [[depth-pack-cinematic]] — versão original mais detalhada
- [[header-loja-active-underline]] — anti-padrão peso vs padrão underline
