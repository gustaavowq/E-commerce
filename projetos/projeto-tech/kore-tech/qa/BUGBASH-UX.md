# Bug Bash UX — Kore Tech

> Varredura UX sistemática. Pega o que typecheck não pega: HTML inválido, sobreposição visual, dead buttons, edge cases, mobile overlap.
> **Quando executar:** Sprint 2 (após integração frontend+backend), antes do pentest.
> **Critério de aprovação:** zero críticos. Médios documentados. Pequenos vão pra polimento V1.1.

## Princípio

Cada item testado deve ter critério **passou / não passou** explícito. Não "parece OK" — ou bate o que está descrito ou não bate.

## Cobertura mínima

### Páginas — Loja
- [ ] `/` (home)
- [ ] `/produtos` + filtros (`?category=cpu`, `?persona=valorant-240fps`, `?marca=nvidia`, faixa preço)
- [ ] `/produtos/[slug]` — PDP componente (5 SKUs diferentes mínimo)
- [ ] `/pcs/[slug]` — PDP PC montado (3 SKUs mínimo, 1 por persona variada)
- [ ] `/builds/[persona-slug]` — landing persona (testar 3 personas)
- [ ] `/montar` — Builder (testar desktop + mobile especialmente)
- [ ] `/cart` — vazio + com itens
- [ ] `/checkout` — anônimo (redirect) + autenticado
- [ ] `/auth/login`, `/auth/register`, `/auth/forgot`, `/auth/reset?token=...`
- [ ] `/account` + `/account/orders`, `/account/builds`, `/account/waitlist`, `/account/addresses`
- [ ] `/favoritos`
- [ ] `/search?q=ryzen`
- [ ] `/sobre`, `/contato`
- [ ] `/policies/privacidade`, `/policies/termos`, `/policies/garantia`, `/policies/troca`

### Páginas — Painel admin
- [ ] `/admin/login` (sem cookie)
- [ ] `/admin/` (dashboard com KPIs)
- [ ] `/admin/orders` (lista + filtros) + `/admin/orders/[id]`
- [ ] `/admin/products` + `/admin/products/new` + `/admin/products/[id]/edit`
- [ ] `/admin/personas` + edit
- [ ] `/admin/builds` (PCs montados + builds de cliente)
- [ ] `/admin/waitlist` (lista de espera por produto)
- [ ] `/admin/coupons`
- [ ] `/admin/customers`
- [ ] `/admin/settings`

---

## Heurísticas obrigatórias

### 1. Links — nenhum 404, nenhum dead

**Teste:**
- [ ] Header: clicar em CADA link (Início, Loja ▼, Builder, Builds prontos ▼, Sobre, Contato, ícone admin) — todos resolvem com status 200
- [ ] Mega-menu de Loja: clicar em todas as categorias (CPU, GPU, Mobo, RAM, Storage, PSU, Case, Cooler, PC montado, Periférico, Monitor) — todos abrem PLP filtrado
- [ ] Mega-menu de Builds prontos: 8 personas — todas abrem `/builds/[slug]` válido
- [ ] Footer: políticas, redes sociais, contato — todos resolvem
- [ ] Sidebars de admin: cada item navega corretamente

**Comando útil:**
```bash
# Capturar todos os hrefs de uma página e testar:
curl -s https://loja.kore.test | grep -oP 'href="\K[^"]+' | sort -u | xargs -I{} curl -o /dev/null -s -w "%{http_code} {}\n" {}
# Esperado: zero 404
```

**Critério passa:** zero 404, zero `<a href="#">`, zero `<button>` sem `onClick` ou `type="submit"`.

---

### 2. HTML válido — sem nesting inválido

**Anti-padrões frequentes (Miami caiu nestes):**
- `<a>` envolvendo `<button>` — clique duplo, browser confuso
- `<button>` envolvendo `<a>` — quebra acessibilidade
- `<div>` solto em `<ul>` (precisa ser `<li>`)
- `<p>` dentro de `<p>`
- `<form>` dentro de `<form>`
- `<table>` sem `<tbody>` quando há `<tr>`

**Teste:**
- [ ] Validar via [validator.w3.org](https://validator.w3.org/nu/) cada página chave
- [ ] Grep no código:
  ```bash
  grep -rE "<a[^>]*>.*<button" src/projeto-tech/kore-tech/frontend/app/
  grep -rE "<button[^>]*>.*<a " src/projeto-tech/kore-tech/frontend/app/
  ```

**Casos especiais Kore Tech:**
- [ ] `ProductCard` (componente + PC) — heart/wishlist button **não** dentro de `<Link>` (usar `stopPropagation` no onClick)
- [ ] `PCBuildCard` — múltiplos CTAs (ver build, comprar, salvar) — cada um botão isolado
- [ ] `BuilderCategoryPicker` — itens da sidebar são `<button>` ou `<a>`, mas não aninhados
- [ ] `SpecsTable` — usa `<dl><dt><dd>` ou `<table>` válido
- [ ] `FPSBadge` — span/div, não botão se não interativo

---

### 3. Imagens — sem fallback externo, alt obrigatório

**Anti-padrão:** `placehold.co`, `via.placeholder.com`, qualquer CDN externo como fallback. Se o CDN cai, vira tela branca.

**Teste:**
- [ ] Grep:
  ```bash
  grep -rE "placehold\.co|via\.placeholder|loremflickr" src/projeto-tech/kore-tech/frontend/
  # Esperado: 0 matches
  ```
- [ ] Forçar 404 em uma imagem (renomear no Cloudinary) e verificar fallback inline (SVG ou skeleton)
- [ ] Toda `<img>` ou `<Image>` tem `alt` (não `alt=""` exceto decorativas)
- [ ] Cards com produto sem foto: classe `from-surface-2` ativa (visual placeholder consistente)

---

### 4. Estados de carregamento e vazio

**Toda página com fetch deve ter 4 estados:**
- [ ] **Loading:** skeleton (não spinner). Cards skeleton replicam a estrutura final
- [ ] **Empty:** mensagem amigável + CTA de saída
  - `/cart` vazio: "Seu carrinho está vazio. Comece pela [Builder] ou veja [Builds prontos]"
  - `/account/orders` vazio: "Nenhum pedido ainda. Que tal montar seu primeiro PC?"
  - `/account/builds` vazio: "Suas builds aparecerão aqui. [Montar agora]"
  - `/account/waitlist` vazio: "Você não está na lista de espera de nenhum produto"
  - `/produtos?categoria=xyz` sem resultados: "Nenhum produto nessa categoria. [Ver todos]"
- [ ] **Error:** card de erro amigável com botão "Tentar novamente"
  - Network error não derruba a página
  - 500 do backend → mensagem genérica, não stack trace
- [ ] **Unauthenticated:** rotas privadas (`/account/*`, `/admin/*`) redirecionam pra login com `redirect=` query

**Anti-padrão:** travessão em copy de empty states (regra cross-projeto). Usar vírgula ou ponto.

---

### 5. Mobile (375px) — viewport iPhone SE

**Páginas críticas em 375px:**
- [ ] `/` — hero não corta texto, CTAs ≥ 44px touch target, personas em carrossel ou stack vertical
- [ ] `/produtos/[slug]` — galeria de fotos full-width, specs table sem overflow horizontal, botão "Adicionar" sticky no bottom (?)
- [ ] `/pcs/[slug]` — FPS badges quebram em grid 2 colunas (não 1 só com whitespace)
- [ ] **`/montar` — ESPECIAL.** Builder deve funcionar BEM em mobile:
  - Sidebar de categorias vira **drawer** ou **abas horizontais scrolláveis**
  - Lista de peças em scroll vertical
  - `BuilderCompatibilityBar` fixo no bottom (não cobre conteúdo principal)
  - Total + wattagem visíveis sem scroll
  - Botão "Comprar tudo" acessível com polegar (área inferior)
- [ ] `/cart` — itens em coluna, totais em card sticky bottom
- [ ] `/checkout` — formulário em coluna única, sem 2 campos por linha
- [ ] Header — hamburger menu funciona, search bar acessível (não escondida — lição Miami #2)

**Anti-padrões a buscar:**
- Sobreposição: badges colidindo em cards
- Header tampando hero (h-screen sem `pt-header`)
- Touch target < 44px (botões pequenos)
- Modal que não fecha em mobile (X muito pequeno ou fora da tela)
- Drawer que abre mas não fecha por scroll lock missing
- Footer cortado, conteúdo escondido atrás de barra de navegação fixa

---

### 6. Tablet (768px) — viewport iPad Mini

- [ ] Layout intermediário coerente (não force mobile, não force desktop)
- [ ] Builder em 768px: sidebar visível em coluna estreita ou drawer
- [ ] Cards em grid 2 colunas
- [ ] Header navegação completa visível (sem hamburger ainda)

### 7. Desktop (1280px) — laptop padrão

- [ ] Layout otimizado, max-width container (~1200px) centralizado
- [ ] Cards em grid 3-4 colunas (PLP)
- [ ] PDP em 2 colunas (galeria + ficha)
- [ ] Builder com sidebar visível + content + footer em layout fluido

### 8. Desktop wide (1920px) — full HD

- [ ] Não estica conteúdo infinito (max-width respeitado)
- [ ] Margens laterais coerentes (não whitespace exagerado)
- [ ] Imagens hero não pixelam (usar `priority` + `sizes` corretos no Next Image)

---

### 9. Acessibilidade (a11y)

**Mínimo aceitável:**
- [ ] `alt` em toda `<img>` ou `<Image>` (decorativas: `alt=""` explícito)
- [ ] `<label>` em todo `<input>` (ou `aria-label`)
- [ ] Ícones-botão (heart, search, cart icon) têm `aria-label`
- [ ] Skip link "Pular para conteúdo" no topo (acessível com Tab)
- [ ] Foco visível em todos os elementos interativos (não remover `outline` sem substituir)
- [ ] Contraste cyan-em-dark passa AA: `#00E5FF` em `#0A0E14` = ratio ~14:1 ✅
- [ ] Texto secundário `#8892A0` em `#0A0E14` = ratio ~5.8:1 ✅ (AA passou)
- [ ] Texto muted `#5A6573` em `#0A0E14` = ratio ~3.5:1 ❌ (só usar pra texto desativado, nunca pra info crítica)
- [ ] Form fields: erro tem `aria-invalid` + mensagem associada via `aria-describedby`
- [ ] Modal com `role="dialog"` + `aria-modal="true"` + foco preso (focus trap)
- [ ] Lighthouse Accessibility score ≥ 90 em home + PDP + Builder

**Comando:**
```bash
npx lighthouse https://loja.kore.test --only-categories=accessibility --view
npx lighthouse https://loja.kore.test/montar --only-categories=accessibility --view
```

---

### 10. Performance

**Lighthouse mínimo:**
- [ ] Home: Performance ≥ 80
- [ ] PDP componente: Performance ≥ 80
- [ ] PDP PC montado: Performance ≥ 75 (mais imagens)
- [ ] Builder: Performance ≥ 70 (interativo pesado)

**Bottlenecks a investigar se score baixo:**
- Imagens não otimizadas (Next Image + Cloudinary `f_auto,q_auto`)
- JS bundle gigante (analizar `next/bundle-analyzer`)
- Fonts carregando bloqueante (usar `display: swap` no `next/font`)
- LCP > 2.5s
- CLS > 0.1 (imagens sem dimensões)

---

### 11. Confirmação em interação destrutiva

**Toda ação que destrói/cancela exige confirm:**
- [ ] Deletar item do carrinho — confirm modal "Tem certeza?"
- [ ] Cancelar pedido — confirm
- [ ] Deletar build salvo — confirm
- [ ] Sair (logout) — confirm? (opcional, depende do produto — Kore Tech: sim, evita logout acidental)
- [ ] Admin: deletar produto — confirm com nome do produto digitado (double-check)
- [ ] Admin: deletar usuário — confirm com email digitado
- [ ] Admin: cancelar pedido pago — confirm + motivo obrigatório

---

### 12. Voz da marca em copy (cross-cut com Copywriter)

**Validar em TODAS as páginas:**
- [ ] **Sem travessão** (regra cross-projeto). Buscar:
  ```bash
  grep -rE "—|–" src/projeto-tech/kore-tech/frontend/
  # Cada match: avaliar se é em copy UI (substituir) ou code comment (ignorar)
  ```
- [ ] **Sem emoji** em UI (a menos que Copywriter especifique pra um caso). Buscar:
  ```bash
  grep -rPn "[\x{1F300}-\x{1FAFF}]" src/projeto-tech/kore-tech/frontend/app/
  ```
- [ ] **Sem palavras proibidas** (BRAND-BRIEF):
  - "tecnologia de ponta"
  - "experiência única"
  - "revolucionário"
  - "next-level"
  - "gamers de verdade"
- [ ] **Tom direto, "você":** não "vocês", não impessoal demais
- [ ] **Números em destaque:** "280 FPS no Valorant" > "performance incrível"

---

### 13. Cross-browser

**Mínimo:**
- [ ] Chrome (latest) — Win/Mac/Linux
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Safari iOS (real device ou Xcode simulator) — comportamento de cookie + autoplay
- [ ] Edge (latest) — geralmente igual Chrome
- **Não obrigatório:** IE11 (morto), browsers nicho

---

### 14. Console & Network

**Em CADA página chave, abrir DevTools:**
- [ ] Console: ZERO erros vermelhos. Warnings amarelos avaliar caso a caso (React hydration warnings = bug)
- [ ] Network: zero requests com status >= 400 (ignorar 404 esperados como favicon em dev)
- [ ] Network: zero requests duplicadas (mesmo endpoint chamado N vezes na mesma render)
- [ ] Network: nenhuma chamada bloqueada por CSP (lição #05 Miami)
- [ ] Sem erro CORS

---

## Catálogo de bugs comuns (Miami achou — NÃO repetir)

Recap de `memoria/10-PLAYBOOKS/bug-bash-ux.md` adaptado pra Kore Tech:

| # | Bug | Onde provável em Kore Tech | Fix |
|---|---|---|---|
| 1 | `<Link>` envolvendo `<button>` heart | `ProductCard`, `PCBuildCard` | `stopPropagation` no onClick do button |
| 2 | SearchBar oculta em mobile | Header | tirar `hidden sm:flex` |
| 3 | `<div>` em `<ul>` | `/cart`, lista de peças no Builder | trocar por `<li>` |
| 4 | Botão "ver specs completas" sem onClick | `/pcs/[slug]` | implementar modal `<dialog>` ou expand |
| 5 | Aside sticky inflado pela descrição | PDP componente | mover `<details>` Descrição pra fora do grid sticky |
| 6 | Filtros duplicados | `/produtos`, `/builds/[persona]` | tirar 1 dos 2 `<Filters>` |
| 7 | Foto produto não aparece | `ProductCard`, PDP | fallback inline (sem `placehold.co`) |
| 8 | Travessão em copy | Home, sobre, builder | regex substituir por vírgula/ponto |
| 9 | Emoji em copy | Footer, empty states | tirar (viola brand-brief) |
| 10 | Tabela painel sem min-width | `/admin/orders`, `/admin/products` | `min-w-[768px]` no `<table>` |

## Bugs Kore Tech específicos a buscar (novos vs Miami)

| # | Bug | Onde | Como achar |
|---|---|---|---|
| 11 | Builder mostra peça incompatível mesmo após escolher CPU | `/montar` | testar passos 5, 7, 15, 17 do BUILDER-E2E |
| 12 | FPS badge quebra em pt-BR (decimal vírgula vs ponto) | `FPSBadge` | testar com Intl.NumberFormat pt-BR |
| 13 | Specs JSON renderiza `[object Object]` | `SpecsTable` | testar produto com specs aninhadas |
| 14 | Build compartilhado vaza dados do owner | `/builds/share/[slug]` | logar como B, abrir slug de A — não deve mostrar email/nome |
| 15 | Wattagem somada erra com 2 GPUs (multi-GPU) | Builder footer | edge case: tentar adicionar 2 GPUs |
| 16 | Cupom BUILDER10 aplica em compra direta (não builder) | `/cart` | edge case (ver EDGE-CASES.md) |
| 17 | Lista de espera notifica antes do estoque chegar | `/account/waitlist` | testar cron logic |
| 18 | "Adicionar PSU sugerida" duplica PSU se já adicionada | `/montar` | UX state bug |
| 19 | Builder mobile: footer cobre lista de peças | `/montar` em 375px | scroll padding-bottom |
| 20 | PDP PC montado: parcelamento mostra 12x mesmo se PIX-only | `/pcs/[slug]` | regra de negócio |

---

## Relatório final

```markdown
# Bug Bash UX — Kore Tech — <data>

## Críticos (quebra função, bloqueia release): N
- [arquivo:linha] descrição. Fix sugerido: ...

## Médios (atrapalha mas funciona): N
- ...

## Pequenos (polimento, vai pra V1.1): N
- ...

## Performance (Lighthouse):
- Home desktop: P/A/BP/SEO
- PDP componente: ...
- PDP PC montado: ...
- Builder: ...

## Acessibilidade (Lighthouse):
- Home: score X/100
- Builder: score X/100

## Veredito: APROVADO / APROVADO COM RESSALVAS / REPROVADO
```

## Anti-padrões zero-tolerância

- ❌ `placehold.co` ou CDN externo como fallback de imagem
- ❌ `<button>` ou `<a>` sem onClick/href (dead button)
- ❌ Travessão (—, –) em UI/marketing copy
- ❌ Emoji em UI sem aprovação Copywriter
- ❌ HTML semanticamente inválido (`<div>` em `<ul>`, etc)
- ❌ Touch target < 44px em mobile
- ❌ `<img>` sem alt
- ❌ Foco visível removido sem substituto
- ❌ Spinner em vez de skeleton (loading state)
- ❌ Modal sem focus trap
- ❌ Cor pra transmitir info crítica sem ícone/texto (acessibilidade)
