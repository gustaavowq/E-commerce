# 📱 MOBILE-FIRST — regras anti-Lovable obrigatórias

> "Desenvolver mobile primeiro. Desktop é progressive enhancement.
> Site que parece template de IA tem desktop perfeito + mobile quebrado.
> O nosso é o oposto."

Estabelecido em 2026-04-28 após audit que pegou **27 bugs** em UI/UX mobile do Kore Tech (loja + painel). Todo projeto novo deve nascer com essas regras.

## ❌ NUNCA FAÇA

### Layout
- ❌ **Sidebar/aside desktop virar coluna vertical no mobile** — empilha 600px de filtros antes da grid de produtos
- ❌ **Botões empilhados verticalmente** ocupando 60% da tela (footer fixo com 4 stats + 2 botões)
- ❌ **Asides com resumo/total no FIM** do mobile (user precisa rolar 3 telas pro CTA "Criar pedido")
- ❌ **Modal fullscreen sem fechar com swipe** ou ESC

### Tipografia
- ❌ **Tipografia maior que 2.5rem** no hero mobile (text-5xl `48px` com `leading-[1.02]` vaza em viewport 360px)
- ❌ **Sem `break-words`** em headings com texto traduzível
- ❌ **Inputs com text < 16px** — iOS faz auto-zoom no foco (use text-base mínimo)

### Interação
- ❌ **Ícones sem label** em mobile (touch targets sem affordance)
- ❌ **Hover-only states** sem fallback de touch (use `pointer:fine` check)
- ❌ **Cursor effects (Tilt3D, glare)** rodando sem checagem de pointer
- ❌ **Componentes 3D pesados** (Three.js, R3F) carregando em mobile (250KB+ JS, 30 FPS em iPhone SE)

### Tabelas
- ❌ **Tabelas sem scroll horizontal** quando colunas estouram viewport
- ❌ **`overflow-x-auto` sem indicador visual** — user não sabe que tem mais conteúdo

### Formulários
- ❌ **Sem padding bottom suficiente** — sticky submit bar cobre input quando teclado abre
- ❌ **Validação silenciosa** — submit não dispara, sem feedback

### Animação
- ❌ **Animações reagindo a cursor** em viewport touch (motion sickness)
- ❌ **Aurora drift / blur 110px** em low-end mobile (lag, drop frame)
- ❌ **Sem `prefers-reduced-motion`** — acessibilidade quebrada

## ✅ SEMPRE FAÇA

### Layout
- ✅ **Bottom-sheet** no lugar de sidebar em mobile
  ```tsx
  // Padrão estabelecido em ProductsClient.tsx (loja) e produtos/page.tsx (painel)
  <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden">
    <SlidersHorizontal /> Filtros {activeCount > 0 && <Badge>{activeCount}</Badge>}
  </button>
  <aside className="hidden lg:block">{/* desktop inline */}</aside>
  <AnimatePresence>{mobileFiltersOpen && (
    <motion.div className="fixed inset-0 z-[120] flex items-end lg:hidden">
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }}
        className="rounded-t-2xl bg-surface p-5 max-h-[85vh] overflow-y-auto">
        {/* filtros */}
      </motion.div>
    </motion.div>
  )}</AnimatePresence>
  ```

- ✅ **Sticky bar bottom** pra CTAs críticos (checkout, salvar montagem, comprar)
  ```tsx
  <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <p>Total: {formatBRL(total)}</p>
      <Button>Criar pedido</Button>
    </div>
  </div>
  // Importante: pb-28 no <main> pra não cobrir conteúdo
  ```

- ✅ **Body lock no scroll** quando sheet/modal aberto
  ```ts
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])
  ```

### Tipografia
- ✅ **`text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-[5.5rem]`** em hero (escala completa)
- ✅ **`break-words`** em h1 com nomes/produtos traduzíveis
- ✅ **`leading-[1.04]` mobile** vs `leading-[1.02]` desktop (mais respiro)
- ✅ **`text-base` mínimo em inputs** (16px) — desliga auto-zoom iOS

### Interação
- ✅ **Touch targets ≥ 44×44px** (Apple/Google guideline)
  - Wrappers `h-11 w-11 flex items-center justify-center` em ícones < 24px
- ✅ **`pointer:fine` check** antes de qualquer hover/tilt effect
  ```ts
  const enabled = window.matchMedia('(pointer: fine)').matches
  if (!enabled) return <div>{children}</div>  // pass-through
  ```
- ✅ **Disable componentes 3D em `<lg`**
  ```tsx
  <div className="hidden lg:block">
    <HeroPC3D /> {/* ~250KB JS — só desktop */}
  </div>
  ```

### Tabelas
- ✅ **Gradient fade-out** na borda direita em mobile + dica "deslize"
  ```tsx
  <div className="relative">
    <div className="overflow-x-auto">
      <table>...</table>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface to-transparent md:hidden pointer-events-none" />
    </div>
    {columns.some(c => c.hideOnMobile) && (
      <p className="md:hidden text-center text-[11px] text-text-muted mt-2">
        Deslize a tabela pra ver mais colunas
      </p>
    )}
  </div>
  ```

### Formulários
- ✅ **`pb-24 sm:pb-4`** em forms com sticky submit bar
- ✅ **Banner de erro no topo** + auto-jump pra tab certa em forms multi-tab
- ✅ **Erro inline embaixo de cada campo**, não só toast
- ✅ **Schema dinâmico**: criação rígida, edição livre (backend é autoridade)

### Animação
- ✅ **`prefers-reduced-motion`** em TODA animação, sem exceção
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; }
    .aurora-bg::before, .aurora-bg::after { opacity: 0.25 !important; }
  }
  ```
- ✅ **Animações ambient** (aurora, light beam) NÃO seguem cursor/scroll
- ✅ **Slide-over com `x: '100%'`** (relativo) em vez de `x: 480` (literal) — adaptativo

## 🧪 Antes de QUALQUER deploy de UI

Audit de **3 viewports** obrigatório:
- **375px** (iPhone SE / Android baixo)
- **768px** (iPad portrait / Android tablet)
- **1440px** (desktop padrão)

Pra cada viewport, validar:
- Conteúdo principal **acima do fold** sem scroll prematuro
- Sticky elements (header, sticky bars) **não se sobrepõem ao conteúdo**
- Touch targets ≥ 44px
- Forms preenchíveis **com keyboard aberta** (testar com DevTools "Toggle device toolbar")

## 🤖 QA agent obrigatório

**Antes de qualquer deploy de feature nova de UI**, rodar QA agent com prompt:

> Audita responsividade mobile em viewport 375px do arquivo X. Reporta TODOS os bugs em formato:
> - Severidade: Crítico/Alto/Médio/Baixo
> - Linhas exatas
> - Fix sugerido (1-2 linhas)
> Não escreve código. Só reporta.

QA NÃO faz fix — só diagnóstica. Main thread (você) ataca em batch ou despacha agent específico.

## 🎯 Anti-padrão dominante (visto em 6 arquivos do Kore Tech)

> "Sidebar/aside desktop-first em `lg:grid-cols-[Npx_1fr]` que vira coluna única vertical em mobile, empurrando o conteúdo principal pra baixo."

Aparece em: catálogo de produtos, builder, checkout, cart, PDP, painel admin. Fix: filtros/asides em mobile **sempre** viram drawer/sheet acessível por botão sticky-top, **nunca** stacked.

## Padrões relacionados
- [[depth-pack-cinematic]] — animação ambient sem mobile sickness
- [[header-loja-active-underline]] — touch targets corretos
- [[../30-LICOES/ERROS-CRITICOS]] — bugs silenciosos invisíveis sem audit mobile
