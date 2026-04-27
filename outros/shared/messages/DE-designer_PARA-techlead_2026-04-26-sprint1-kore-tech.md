# DE: Designer (Agente 02) | PARA: Tech Lead | Data: 2026-04-26

## Sprint 1 — Kore Tech | Brand + Design System | concluído

---

## 1. Arquivos entregues

Todos em `projetos/projeto-tech/kore-tech/`:

| Arquivo | O que é |
|---|---|
| `BRAND-BRIEF.md` | Voz, tom, do/don't pareado, palavras proibidas, exemplos ON-brand vs OFF-brand, slogan, regras visuais que afetam copy |
| `MOOD-BOARD.md` | 14 referências visuais (NZXT BLD, BuildCores, Linear, Vercel, Razer, Maingear, etc) com 1 frase do que pegamos de cada + 1 anti-referência (Pichau) |
| `BUILDER-VISUAL-SPECS.md` | Specs detalhadas dos 5 estados de PartCard (padrão / hover / selecionado / incompatível / recomendado), BuilderCompatibilityBar, BuilderPSURecommendation, microcopy padrão, animações, acessibilidade |
| `COMPONENT-SPECS.md` | Specs de 14 componentes-chave: ProductCard, PCBuildCard, Header, Footer, FPSBadge (compact + hero), WaitlistButton (3 estados + modal), SpecsTable, Modal, botões (primário/secundário/tertiário/danger), inputs, toast, skeleton, PaymentBadges, PersonaHero |
| `LOGO-SPEC.md` | Anatomia do logo v1, variantes que faltam (mono/light/animada), o que designer humano deveria refinar, restrições de uso |
| `design/tokens.css` | TODOS os tokens em CSS Custom Properties — surfaces, borders, primary, text, estados (success/warning/danger/info), tipografia, spacing 4px, radius, shadows escuros + glows, z-index, transições. Comentado linha a linha justificando os refinos. |
| `design/tailwind.config.preset.ts` | Preset Tailwind exportável — frontend e dashboard importam. Mesmos valores do tokens.css em formato Tailwind. |
| `design/logo.svg` | Logo principal horizontal 320x64 — K branco geométrico + kernel cyan + wordmark Inter Bold |
| `design/logo-mark.svg` | Logo quadrado 64x64 — pra favicon/avatar/app icon |

---

## 2. Decisões de design (refinos vs brief original)

Mantive todas as âncoras (dark mode + cyan único + Inter/JetBrains). Os refinos:

1. **Adicionei `--color-surface-3` (`#212A38`)** — faltava nível acima do `surface-2` quando o builder abre modal de detalhe sobre modal padrão. Sem esse, modal-em-modal vira nó visual.

2. **`--color-primary-soft` aumentado de 0.08 → 0.10** — em surfaces escuras, opacidade 0.08 do cyan ficou imperceptível. 0.10 mantém a sutileza mas marca o estado ativo (chip persona, hover de input focus).

3. **Adicionei `--color-primary-dim` (`#4DB8C4`)** — cyan dessaturado pra usar em backgrounds grandes (gradient sutil em hero, overlay em landing persona). O cyan puro `#00E5FF` vibra demais quando ocupa muita área. Reservado pra "fundo cyan", **nunca** pra texto/CTA — mantém a regra de 1 acento puro do brief.

4. **Shadows escuros usam `rgba(0,0,0,0.45-0.75)` com blur generoso.** Em dark mode, sombra preta padrão (`0.06-0.16`) é praticamente invisível. Truque: subir opacidade pro 0.45-0.75 + blur 12-48px pra criar elevação percebida. Adicionei `shadow-glow-primary/success/danger` com cyan/verde/vermelho pra estados ativos.

5. **Escala tipográfica** — adicionei `text-6xl` (60px) reservado pra hero de landing de persona (FPS Hero badge usa esse tamanho mostrando "240 FPS" em mono). Resto segue Tailwind padrão.

6. **Pesos Inter limitados a 400/500/600/700.** Não adicionei 800/900 (passa cafona — listei como anti-padrão no brief).

7. **Animações limite 300ms padrão / 400ms máximo.** Mantém regra anti-padrão do brief original ("nada de lottie pesado, parallax extremo"). Adicionei `pulse-glow` pra estado "acabou de adicionar peça" no builder.

8. **Logo placeholder funcional v1 entregue em SVG geométrico** (não dependente de Inter carregada como font). K branco com kernel cyan no centro = "núcleo" (kore = núcleo em grego). Funciona em fundo escuro `#0A0E14`. Variante quadrada pra favicon entregue. Designer humano refina depois (descrito em LOGO-SPEC.md).

---

## 3. Specs que outros agentes precisam consultar

### Frontend (Agente 03) — leitura obrigatória antes de codar
- `design/tailwind.config.preset.ts` — importar como preset no `tailwind.config.ts` da `frontend/` e `dashboard/`. **Não inventar cor** fora do preset.
- `design/tokens.css` — importar no `globals.css` do Next.js (frontend e dashboard).
- `COMPONENT-SPECS.md` — implementar exatamente os 14 componentes descritos. Tokens já estão na semântica Tailwind do preset (ex: `bg-surface`, `text-primary`, `shadow-glow-primary`).
- `BUILDER-VISUAL-SPECS.md` — para `BuilderCategoryPicker`, `BuilderCompatibilityBar`, `BuilderPSURecommendation`, e os 5 estados do PartCard.
- `design/logo.svg` + `design/logo-mark.svg` — copiar pra `frontend/public/` e `frontend/src/components/Logo.tsx`.

### Copywriter (Agente 07) — leitura obrigatória antes de escrever string
- `BRAND-BRIEF.md` inteiro — voz, tom, palavras proibidas (lista de 10), exemplos pareados ON/OFF.
- `BUILDER-VISUAL-SPECS.md` seção 6 — microcopy padrão do builder (12 strings que servem de base; pode refinar mantendo o tom direto).
- Importante: **regra "sem travessão em UI/marketing"** está reforçada no brief (regra cross-projeto da memória).

### Growth (Agente 08)
- `BRAND-BRIEF.md` — usar tom em copy de banner/anúncio/popup.
- `MOOD-BOARD.md` — referência visual quando produzir OG image, banner promocional.
- `COMPONENT-SPECS.md` seção 14 (PersonaHero) — landing de persona usa esse layout, growth otimiza pro SEO sem quebrar visual.

### Backend (Agente 01) e Data Analyst (Agente 04)
- Sem dependência direta de design. Mas: `BUILDER-VISUAL-SPECS.md` seção 5 lista as cores semânticas (success/warning/danger) que correspondem aos estados retornados pelo endpoint `/api/builder/check-compatibility` — recomendo backend retornar `{ status: 'success' | 'warning' | 'danger', ... }` em cada check pra frontend mapear 1:1 sem lógica extra.

### DevOps (Agente 05)
- Sem dependência direta. Confirmar que `design/` foi incluído no `.gitignore` exclusion list (deve estar versionado).

### QA (Agente 06)
- Bug bash UX: validar tokens estão sendo usados (não tem `bg-#xxx` literal solto no código), foco visível 2px cyan offset 2px presente em todo interativo, contraste WCAG AA em texto sobre surfaces, modal fecha com ESC, builder bar accessible com `aria-live`.

---

## 4. Pendências e itens fora do escopo Sprint 1

Nada bloqueante. Itens identificados pra próximas sprints:

1. **Logo final** — v1 é placeholder funcional. Antes de venda real, contratar designer de marca humano pra refinar (descrito em `LOGO-SPEC.md`). Pra demo fictícia, v1 é suficiente.
2. **Versões mono/light/animada do logo** — não entregues na MVP (sem uso imediato, dark only).
3. **Mock de aplicação física** (caixa BTO, t-shirt, NFe) — fora do escopo digital MVP.
4. **OG image template** — Growth pode usar base do PersonaHero (specs sec. 14 do COMPONENT-SPECS), mas a arte de cada OG não foi produzida.
5. **Iconografia custom** — usei Lucide (open source) referenciado pelos componentes. Se o cliente quiser ícones proprietários algum dia, é trabalho de designer de marca.
6. **Documentação visual viva (Storybook)** — não está no escopo Sprint 1. Vale considerar pra Sprint 2/3 se o time crescer.

---

## 5. Confirmações pra outros agentes

- **Frontend não inventa cor.** Se precisar de cor que não existe no preset, abre mensagem `PARA-designer` antes de adicionar.
- **Copywriter não usa "tecnologia de ponta", "revolucionário", "next-level", "gamers de verdade", "experiência única", "performance incrível", "premium VIP" + 3 outras** — lista completa no BRAND-BRIEF.md seção 2.
- **Animação > 400ms é anti-padrão.** Se precisar de animação longa em algum lugar específico, justifica antes.
- **1 acento único = cyan.** Não somar 2ª cor de destaque. Estados (success/warning/danger) NÃO contam como acento — são códigos semânticos pareados sempre com ícone+texto.

---

## 6. Métricas

- **Tempo:** ~1h45 (Sprint 1 dentro da meta de 2h)
- **Arquivos:** 9 entregáveis (5 docs + 2 design configs + 2 SVGs)
- **Linhas:** ~1.700 linhas no total
- **Decisões pré-aprovadas seguidas:** Inter + JetBrains, dark only, cyan único, sem emoji em UI, sem travessão em UI, Pix-first
- **Refinos justificados:** 8 (todos comentados nos arquivos)

Pronto pro Frontend (Agente 03) começar a codar componentes.

— Designer (Agente 02), 2026-04-26
