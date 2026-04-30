# DE: growth → PARA: tech-lead — SEO + Analytics + Newsletter

**Data:** 2026-04-29 23:59
**Escopo:** SEO técnico, analytics LGPD-compliant, captura de newsletter no footer.

## Arquivos criados

- `frontend/src/app/sitemap.ts` — gera `/sitemap.xml` com 6 rotas estáticas + 1 entry por imóvel disponível (até 500). Revalida 1h. `BASE` lê de `NEXT_PUBLIC_SITE_URL`.
- `frontend/src/app/robots.ts` — allow `/`, disallow `/api/`, `/painel`, `/auth`. Sitemap apontado.
- `frontend/src/components/analytics/GoogleAnalytics.tsx` — GA4 placeholder, `anonymize_ip`, só carrega com consent.analytics + fora de `/painel`/`/auth`.
- `frontend/src/components/analytics/MetaPixel.tsx` — Meta Pixel placeholder, só carrega com consent.marketing + fora de `/painel`/`/auth`.
- `frontend/src/hooks/useCookieConsent.ts` — hook com 3 categorias (essential sempre on; analytics + marketing toggle), persiste em `localStorage` key `marquesa-cookie-consent`, propaga via custom event.
- `frontend/src/components/CookieConsent.tsx` — banner LGPD com 3 botões (Aceitar todos / Apenas essenciais / Configurar) + toggles por categoria.
- `frontend/src/components/loja/NewsletterCapture.tsx` — formulário no footer, valida email + checkbox de consentimento, posta em `/api/leads`.

## Arquivos editados

- `frontend/src/app/layout.tsx` — injeta `<GoogleAnalytics>`, `<MetaPixel>`, `<CookieConsent>` antes de `</body>`.
- `frontend/src/app/(loja)/page.tsx` — `metadata` rica + JSON-LD `RealEstateAgent` (Organization).
- `frontend/src/app/(loja)/imoveis/page.tsx` — `generateMetadata` async dinâmico baseado em filtro de tipo/bairro.
- `frontend/src/app/(loja)/imoveis/[slug]/page.tsx` — JSON-LD `RealEstateListing` por imóvel + `generateMetadata` agora com `canonical`, `twitter card` e `siteName`.
- `frontend/src/components/loja/Footer.tsx` — adiciona `NewsletterCapture` no topo do footer (sem virar popup invasivo).
- `frontend/next.config.mjs` — CSP ampliada pra `connect.facebook.net` + `*.google-analytics.com`. `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` expostos com fallback vazio.
- `frontend/.env.example` — documenta `NEXT_PUBLIC_GA4_ID` + `NEXT_PUBLIC_META_PIXEL_ID`.

## Decisões

- **Sem cupons / desconto.** Marquesa é boutique, não e-commerce de produto físico — comissão é o ganho do corretor, sinal não tem desconto.
- **Newsletter usa `/api/leads` existente** com `imovelId` de um destaque (resolvido client-side antes do POST) e `mensagem` prefixada `[NEWSLETTER]`. Trade-off: evita criar rota nova, mas Lead virá ancorado a um imóvel arbitrário. Se newsletter virar volume, vale rota dedicada `/api/newsletter` ou modelo `Subscriber` separado.
- **Analytics fora de `/painel` e `/auth`** — KPIs só refletem comportamento público real, não admin.
- **Consent default = false** pra analytics e marketing (LGPD opt-in explícito).
- **JSON-LD por imóvel** com `availability` traduzido por status (`InStock`/`LimitedAvailability`/`OutOfStock`).
- **Sitemap omite `INATIVO` e `VENDIDO`** — prevenir indexação de imóveis fora do mercado.

## TODO / dependências externas (Gustavo)

1. **Registrar GA4** em `analytics.google.com`, gerar measurement ID `G-XXXXXXX`, setar `NEXT_PUBLIC_GA4_ID` na Railway/VPS.
2. **Registrar Meta Pixel** em `business.facebook.com`, copiar pixel ID, setar `NEXT_PUBLIC_META_PIXEL_ID`.
3. **Google Search Console** — adicionar property `https://marquesa.gustavo.agenciaever.cloud`, submeter `/sitemap.xml` após primeiro deploy.
4. **CRECI/SP** — substituir placeholder `12345-J` no Organization JSON-LD + Footer pelo número real ao ir pra produção real.
5. **Logo asset** — `/logo.svg` referenciado no Organization schema; designer precisa exportar arquivo final (hoje só design tokens).

## Riscos LGPD que cobri

- Scripts de analytics/marketing **não carregam** sem consent explícito.
- Banner aparece se `localStorage` não tem decisão; persiste e propaga via custom event.
- Newsletter exige checkbox de consentimento + linka pra `/policies/privacidade`.
- `anonymize_ip: true` no GA4 + `cookie_flags: SameSite=Lax;Secure`.
- robots disallow em `/painel` e `/auth` evita indexação de área autenticada.

## Validação

- `npx tsc --noEmit` passou (exit 0).
- Verificar visualmente após deploy: banner aparece em primeira visita, some após decisão; `view-source:` na home mostra `<script type="application/ld+json">` com `RealEstateAgent`; `/sitemap.xml` retorna XML com imóveis; `/robots.txt` lista disallow corretos.
