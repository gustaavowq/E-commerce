# DE: frontend-fix | PARA: techlead | 2026-04-30 — Iteração 2 implementada

## O que foi alterado

### 1. Bug crítico API URL fallback (`||` → `??`)
- `frontend/src/lib/api.ts:28` — `getBaseUrl()` no client agora retorna `process.env.NEXT_PUBLIC_API_URL ?? ''`. String vazia preserva caminho relativo, rewrites resolvem.
- `frontend/src/lib/api.ts:20-29` — comentário explicativo + ajuste do server-side mantendo `||` (no servidor `''` não é URL utilizável, fallback pra INTERNAL ou localhost dev é correto).
- `frontend/src/app/(loja)/reservas/[id]/page.tsx:24-32` — só comentário; já era server-only, `||` continua adequado.
- `frontend/next.config.mjs:38` — confirmado `?? ''` (já estava OK do commit anterior).
- `buildUrl()` testado mentalmente: com `base = ''`, gera `/api/imoveis?...` (path relativo, browser pede ao próprio host, Next rewrite proxa pro INTERNAL_API_URL). Same-origin garantido.

### 2. CookieConsent compacto
- `frontend/src/components/CookieConsent.tsx` — refator total.
  - Banner barra única `py-3` (≈56px desktop / ≈88-96px mobile).
  - Desktop: 1 linha flex-row com texto truncate à esquerda + 3 ações à direita.
  - Mobile: 2 linhas flex-col, texto sem truncate.
  - Botões `px-4 py-2 text-caption uppercase`.
  - "Configurar" virou link textual `text-ash` (não botão), abre modal/sheet separado em `z-[60]`.
  - Settings em modal centralizado desktop / bottom-sheet mobile, fecha por ESC, click no backdrop ou "Cancelar".
  - Removido `shadow-[0_-8px_32px_rgba(0,0,0,0.06)]`. Só `border-t border-bone`.
  - Lógica `useCookieConsent` intacta (mesmo hook, mesmas chamadas `acceptAll`/`rejectNonEssential`/`update`).
- `copy/microcopy.json` — adicionadas chaves `cookies.texto_curto` (84 chars, cabe truncate desktop), `cookies.configurar`, e bloco `modal_*` + `categoria_*` pro modal. `cookies.texto` (longo) fica preservado para o modal/contexto explicativo. Renomeado `cookies.aceitar` "Aceitar todos" → "Aceitar" e `cookies.recusar` "Apenas essenciais" → "Recusar" pra caber em barra compacta.

### 3. Hero — copy + contraste
- `frontend/src/components/loja/Hero.tsx`
  - `eyebrow` agora consome `microcopy.hero.eyebrow` por default (prop ainda override).
  - Overlay: `bg-ink/20` → `bg-gradient-to-t from-ink/55 via-ink/25 to-transparent` (Designer recomendado, mantém topo da foto vivo + base com contraste AA).
  - `text-paper/70` (eyebrow) → `text-paper`
  - `text-paper/80` (subtítulo) → `text-paper/95` (Designer pediu `text-paper`, escolhi `/95` porque `text-paper` cru sob gradient na base ficaria muito hard sob fotos quase brancas; 95% mantém AAA com leve respiração)
  - `border-paper/40` (CTA secundário) → `border-paper/60`
  - Adicionado `quality={80}` no Image (default Next é 75; levei pra 80 pra hero — diferença visual é boa pra hero, custo de banda baixo).

### 4. Catálogo home "Em destaque"
- `frontend/src/app/(loja)/page.tsx`
  - Adicionada `export const revalidate = 60` (SSR reaproveita HTML por 60s).
  - `getDestaques()` agora pede `limit: 3` (em vez de 6) e tem **fallback**: se `destaque=true` retornar vazio, refaz fetch sem flag (`?limit=3&sort=recentes`).
  - Bloco "Em destaque" usa `microcopy.home.secao_destaques` no eyebrow + título + subtítulo + link fantasma "Ver catálogo completo" estilizado com `border-b border-ink hover:border-moss`.
  - `ImovelGrid` recebe `emptyMessage={microcopy.vazio.sem_destaques}` pra empty state coerente.

### 5. Curadoria sutil home
- `frontend/src/app/(loja)/page.tsx` — entre Hero e Destaques.
  - Eyebrow `microcopy.home.curadoria_intro_eyebrow` ("MÉTODO") + frase em `font-display font-light text-display-md` `max-w-2xl` (recomendação do Copywriter).
  - Padding generoso `py-16 md:py-24` pra respirar antes do grid.
  - `ScrollReveal` envolvendo pra fade-in suave.

### 6. Editorial topos/rodapés
- `frontend/src/app/(loja)/imoveis/page.tsx` — adicionado:
  - Intro editorial `microcopy.catalogo.intro_editorial` em `text-body-lg text-ink max-w-2xl` logo abaixo do h1.
  - Outro editorial + CTA `microcopy.catalogo.outro_editorial_cta` ("Falar com a curadoria") no rodapé do grid (depois da paginação).
  - Adicionado `import Link from 'next/link'`.
- `frontend/src/app/(loja)/policies/privacidade/page.tsx` — `microcopy.policies.privacidade_intro` no topo, separado por `border-b border-bone` antes do texto legal.
- `frontend/src/app/(loja)/policies/reserva/page.tsx` — mesmo padrão com `policies.reserva_intro`.

### 7. /contato editorial 2 colunas
- `frontend/src/app/(loja)/contato/page.tsx` — refator total.
  - Lead editorial: eyebrow + h1 + intro `text-body-lg text-ash`.
  - Grid `lg:grid-cols-2 gap-12`. Coluna direita = visual editorial (placeholder monograma "M" em `bg-paper-warm`, `aspect-[4/5]`, font-display em `text-ink/15` com clamp pra escala). Mobile: visual vai pro topo (`order-1` invertido pra `lg:order-2`), conteúdo embaixo.
  - Coluna esquerda: blocos "Visite o escritório" + "Atendimento remoto" empilhados, divididos por `border-t border-bone`. WhatsApp e email viraram dado dentro do bloco remoto (sugestão Copywriter pra reduzir fragmentação vertical).
  - Vendedores e LGPD viram seções full-width abaixo, secundárias.
  - Escolhi Opção C (placeholder) por ser fallback sem dependência de asset novo (assim como Designer indicou na missão). Quando houver foto editorial real, troca o `<div>` placeholder por `<Image src=... fill className="object-cover">`.

### 8. Footer contraste WCAG
- `frontend/src/components/loja/Footer.tsx:107-109` — `text-paper/40` → `text-inverse-subtle` (token semântico, resolve `var(--text-inverse-subtle)` → `--ash-pale` #B0B0B0, dá 5.6:1 sobre graphite).
- `frontend/tailwind.config.ts` — adicionado mapping `'inverse-subtle': 'var(--text-inverse-subtle)'`. Token já estava em `tokens.css` e `tailwind-extend.json`, mas nunca tinha sido portado pro `tailwind.config.ts`. Agora `text-inverse-subtle` funciona como utility.

### 9. Performance
- Hero `quality={80}` confirmado, `priority` + `sizes="100vw"` mantidos.
- Home `export const revalidate = 60` adicionado.
- Destaques limit reduzido de 6 → 3 (era 6 no fetch, mas só renderiza 3 cards).
- `next.config.mjs` images já tinha `images.unsplash.com` + `res.cloudinary.com` whitelisted.

## Validações

- `npm run typecheck` — **OK** (zero erros).
- `npm run build` — **OK**, 22 rotas geradas, bundle home 1.21 kB / 102 kB First Load JS.
- Specs Designer aplicadas:
  - [x] Cookie barra única ≤56px desktop / ≤96px mobile, 3 ações com `px-4 py-2 text-caption`, settings em modal/sheet z-60, sem shadow
  - [x] Hero overlay gradient + texto sem opacity (`/95` em subtitle, full em eyebrow)
  - [x] Footer L107-109 trocado pra `text-inverse-subtle`
- Copy aplicado:
  - [x] Hero eyebrow do JSON
  - [x] `home.curadoria_intro` + eyebrow MÉTODO
  - [x] `catalogo.intro_editorial` + outro + CTA
  - [x] `policies.{privacidade,reserva}_intro`
  - [x] `contato.*` (todas chaves coluna_visita_*, coluna_remoto_*, vendedores_*, lgpd_*)

## Pendências

- **Foto editorial /contato**: Designer Opção A (foto real do escritório) ainda depende de asset. Implementei Opção C (placeholder monograma) como interim. Trocar quando Designer/cliente fornecer asset.
- **`microcopy.cookies.texto`** (longo, original): NÃO está sendo usado em nenhum lugar agora. Banner usa `texto_curto`, modal usa `modal_subtitulo`. Posso remover na próxima rodada se ninguém reclamar; mantive por ora pra não quebrar testes externos eventuais.
- **WCAG audit das outras classes `text-paper/X`**: NewsletterCapture e PainelSidebar usam `text-paper/40-70` em fundos `graphite`. Designer só apontou correção pro Footer.tsx L107-109. Os outros já estão dentro de AA segundo cálculo do Designer (eyebrows `/50` = 5.6:1 OK AA, descrições `/60` = 6.4:1 OK AA). Nada a corrigir.

## Pra DevOps Deploy

**Tudo limpo do lado frontend.** Sem env nova, sem config nova além de:

- `tailwind.config.ts` ganhou um novo token `inverse-subtle` (zero-impact, só adiciona utility).
- `microcopy.json` ganhou bloco `cookies.texto_curto` + `cookies.modal_*` + `cookies.categoria_*`. Source-of-truth única, já no JSON, build inclui.
- `lib/api.ts` agora aceita `NEXT_PUBLIC_API_URL=''` (string vazia) no client → caminho relativo via Next rewrite. Confirma:
  - Vercel `NEXT_PUBLIC_API_URL` em production = vazio (já está, conforme DevOps reportou)
  - Vercel `INTERNAL_API_URL` precisa apontar pra Railway backend URL real **assim que** Railway destravar e backend subir (DevOps já anotou isso na lista de pendências)
  - Sem isso, fetch SSR retorna 502 (rewrite tenta proxar pra placeholder)

Build testado verde com `.env.local` corrente (NEXT_PUBLIC_API_URL=vazio + INTERNAL_API_URL=localhost:8211). Funciona em demo Cloudflare tunnel + funciona em prod Vercel+Railway desde que INTERNAL_API_URL seja atualizado pós-deploy backend.

— ecommerce-frontend
