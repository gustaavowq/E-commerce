# Pacote de profundidade cinematográfica (Apple/Linear-tier)

## Princípio

> "Site tech sem personalidade fica quadrado. Personalidade vem de **camadas
> que respiram**, não de animação invasiva."

Aprovado em 2026-04-28 no Kore Tech (commit `fad575b`). Próximo e-commerce
do framework já deve nascer com esse pacote no hero da home.

## 5 camadas (ordem de baixo pra cima)

### 1. Aurora orbs
Dois blobs cyan que respiram lento. Nunca seguem cursor. 24s + 32s loops
desincronizados. ease-in-out. Filter blur(110px). Border-radius 50%.

```css
.aurora-bg::before,
.aurora-bg::after {
  content: '';
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(110px);
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

### 2. Light beam vertical
Feixe cinema descendo do topo. Mix-blend screen pra somar luz. Blur 36px.

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

### 3. Grid técnico (`grid-fine`)
1px cells 56×56 opacity 2.5% branco neutro. Mask top→down pra desaparecer.
Já existia. Mantém.

### 4. Bg noise (`bg-noise`)
SVG fractalNoise inline 1.5kb opacity 0.06 mix-blend overlay. Já existia.

### 5. Vignette
Escurecimento radial pra empurrar foco pro centro.

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

## Camada extra global: grain

Body inteiro recebe noise SVG fractal sutil. Tira aspecto digital chapado.

```css
.grain-global {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 60;  /* abaixo do header z-100, acima do conteúdo */
  background-image: url("data:image/svg+xml;...feTurbulence...");
  opacity: 0.04;
  mix-blend-mode: overlay;
}
```

Aplica no `<body>` do layout root.

## Como aplicar no hero

```tsx
<section className="relative isolate overflow-hidden canvas-spotlight aurora-bg">
  <div aria-hidden className="light-beam" />
  <div aria-hidden className="pointer-events-none absolute inset-0 grid-fine" />
  <div aria-hidden className="pointer-events-none absolute inset-0 bg-noise" />
  <div aria-hidden className="vignette" />
  <div className="container-app relative ...">
    {/* conteúdo */}
  </div>
</section>
```

Ordem importa: aurora atrás, beam, grid, noise, vignette por cima.
Conteúdo tem `relative` pra ficar acima de tudo.

## prefers-reduced-motion

Aurora drift desliga. Opacity da aurora cai pra 0.25. Resto fica estático.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
  }
  .aurora-bg::before, .aurora-bg::after { opacity: 0.25 !important; }
}
```

## Por que NÃO outras alternativas

- ❌ Cursor glow seguindo viewport — Gustavo vetou ("site feio de IA Lovable")
- ❌ Scroll-jacking / parallax forçado — vetado
- ❌ Particles.js / canvas WebGL ambient — pesa, distrai
- ❌ Vídeo de fundo loop — mata performance mobile

✅ CSS layers + filter blur + ease-in-out longo = leve e elegante.

## Custo de performance

- Aurora orbs: 2 pseudo-elements com filter:blur(110px) — ~0.5ms repaint
  no GPU moderno. Em dispositivos baixo-end pode lagar; OK porque
  prefers-reduced-motion desliga e mobile vai ter ajuste futuro.
- Grain global: SVG inline 1KB. Painted uma vez. Negligível.
- Light beam: 1 elemento blur. Idem.

Total: < 1ms paint extra no first paint. Aceitável.

## Padrões relacionados
- [[design-dark-cinematografico]] — paleta dark + hero approach geral
- [[../30-LICOES/24-redesign-visual-sozinho-nao-impressiona]] — visual deve
  acompanhar funcionalidade nova; não basta polish
