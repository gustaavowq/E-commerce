# Política de animações — quando usar, quando não

> Aprovado pelo Gustavo após Kore Tech (rejeição do CursorGlow + scroll-jacking).

## Princípio orientador

> "Animação só vale se RESPONDE a uma ação clara do usuário ou contexto
> visível. Decoração ambiente sem motivo = lixo, parece site feito por
> IA do Lovable. Cortar."

## ❌ PROIBIDO

| Anti-padrão | Por quê |
|---|---|
| Cursor glow / aurora seguindo o mouse pelo viewport inteiro (estilo Linear) | Decorativo, sem motivo. Gustavo: "feio, piora a UX" |
| Scroll-jacking — alterar velocidade de scroll, smooth scroll customizado | Tira controle do user. Gustavo: "muda o scroll eu odeio isso" |
| Parallax forçado de seção inteira (hero "voa" no scroll) | Atrapalha, não tem motivo prático |
| Múltiplos efeitos brilhando simultâneos (glare em cada card ao mesmo tempo) | Sem hierarquia, polui visual |
| Letras/textos animando no scroll com pin (Apple-tier sem necessidade) | Em e-commerce, atrapalha leitura |

## ✅ PERMITIDO (responde a ação/contexto)

| Padrão | Quando |
|---|---|
| **Tilt 3D sutil** (`max ±6-8°`) no hover do card | Card sob hover ganha profundidade. Reset suave ao sair |
| **Hover spotlight ÚNICO migrante** | Em grid de cards: spotlight cyan aparece só no card sob hover (`opacity 0 → 1` 280ms). Move pro próximo card = anterior fade out. Dá impressão de UM spotlight migrando |
| **CTA magnético leve** (`strength 0.2-0.3`) | Botão primário "puxa" o cursor próximo. Spring de retorno |
| **Number ticker count-up** (1.5–3s) | Quando entra no viewport via IntersectionObserver. Uma vez |
| **Reveal scroll-triggered** | Fade-up `380-700ms` cubic-bezier ao entrar viewport. NÃO altera scroll |
| **Item voa pro carrinho (FLIP)** | Resposta direta a clicar "Adicionar". Imagem voa do PDP até o ícone do header (700ms) + badge bump |
| **Page transitions sutis** | `template.tsx` com fade+rise `300-320ms`. Não scroll-jack, só anima content |
| **Spring no encaixe de peças do builder** | Quando user seleciona peça, ela aparece no slot com `scale 0→1` + spring |
| **Pulse de validação** | Compatibility bar pulsa verde/vermelho 1x quando status muda (false→true) |

## Bibliotecas usadas no Kore Tech

- **Tailwind keyframes** (Nível 1): `fade-up`, `aurora`, `gradient-pan`,
  `shimmer`, `float`, `cart-bump` — definidas em `tailwind.config.ts`
- **framer-motion** (Nível 2, ~35KB gzip): `Tilt3D`, `MagneticButton`,
  `AnimatedNumber`, `CartFlyOverlay`, `template.tsx` page transitions
- **IntersectionObserver** nativo: `Reveal` component pra fade-up scroll

NÃO instalar GSAP nem Three.js sem aprovação explícita do Gustavo
(risco de virar invasivo).

## Acessibilidade obrigatória

Toda animação custom deve respeitar `prefers-reduced-motion: reduce`:

- Em CSS/Tailwind: `@media (prefers-reduced-motion: reduce) { animation
  none }` (já no `globals.css` global)
- Em framer-motion: `useReducedMotion()` hook → falsy fallback
- Em IntersectionObserver: ativar quando reduced motion não disponível
  ou usar `transition-duration: 0`

## Como usar

Antes de implementar QUALQUER animação:

1. Pergunta: "isso responde a uma ação do user OU contexto específico?"
2. Se SIM (clicou, scrollou pra ver, hovou): permitido. Calibrar
   sutileza
3. Se NÃO (decoração ambiente, "tem que ter algo se mexendo"): **NÃO
   FAZER**. Fica vetado. Se o user quiser, ele pede

## Calibragem

- Botões magnéticos: `strength 0.2` é suficiente. Acima de 0.4 vira
  agressivo
- Tilt 3D: `intensity 6` em ProductCard, `8` em PCBuildCard (cards
  maiores aceitam mais)
- Number ticker: `2-3s` duration. Menos é "passou rápido demais"
- Page transition: `300-320ms` cubic-bezier(0.16,1,0.3,1)
- Pulse: 1x, `500-600ms`. Spam é distração

## Referências aprovadas vs proibidas

✅ **OK seguir**: Apple iPhone launch (motion design), NZXT BLD (FPS
counters, hero), Stripe (number tickers, hover states), Vercel.com
(transitions sutis)

❌ **NÃO seguir**: sites do Lovable que mudam scroll, sites com aurora
mexendo o tempo todo no fundo, parallax tipo "tilt" usado decorativo
sem motivo

## Ver também

- [[../30-LICOES/20-validar-shape-backend]] — meta-lição de qualidade
- `frontend/src/components/motion/*` no Kore Tech (impl real)
