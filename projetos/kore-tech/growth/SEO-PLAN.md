# SEO-PLAN — Kore Tech

> Planejamento técnico de SEO do MVP. Implementação fica a cargo de Frontend + Backend.

---

## 1. Estratégia geral — 3 pilares de tráfego

O catálogo da Kore Tech rankeia em três intents distintos. Cada um gera tráfego com qualidade diferente — a soma sustenta o funil sem depender só de paid media.

| Pilar | Intent | Peso esperado de tráfego | Conteúdo de captura | Objetivo |
|---|---|---|---|---|
| **1. Compra direta** | Cliente já decidiu o que quer ("rtx 4070 super preço", "comprar pc gamer 5000") | **45%** | PDPs de componente + landing de orçamento + PCs montados | Conversão imediata, sessões curtas, alto CTR no anúncio Performance Max |
| **2. Persona / uso** | Cliente sabe o uso mas não as peças ("pc pra rodar valorant 240fps", "pc pra editar vídeo 4k") | **35%** | 8 landings de persona em `/builds/[slug]` + PDPs de PC montado | Educa, mostra FPS estimado, tira dúvida e converte. **Killer feature de SEO.** |
| **3. Comparação / tutorial** | Cliente está pesquisando antes de decidir ("diferença ddr5 ddr4", "como saber se a fonte é suficiente") | **20%** | Blog `/blog/*` + glossário `/glossario` | Topo de funil, captura email via newsletter (BEMVINDO5), reaquece via remarketing |

**Por que essa divisão funciona neste nicho:**
- Pichau e KaBuM dominam o pilar 1 (compra direta) há 10 anos. Brigar de frente exige paid pesado. **Vencer no pilar 2** é o atalho realista — ninguém no BR está rankeando bem para "pc pra rodar [jogo] [fps]" com landing dedicada.
- Pilar 3 capta o iniciante (mercado em expansão por causa de IA local + retorno do PC gamer). Custa pouco em conteúdo e gera lista de email de qualidade.

---

## 2. Sitemap dinâmico

Gerado em `src/projeto-tech/kore-tech/frontend/src/app/sitemap.ts` (Next.js App Router — `MetadataRoute.Sitemap`).

### Prioridades + frequência de atualização

| Tipo de página | URL pattern | priority | changefreq | Origem dos dados |
|---|---|---|---|---|
| Home | `/` | **1.0** | `daily` | estática |
| Landing de persona | `/builds/[persona-slug]` | **0.9** | `weekly` | API `/api/personas` (8 personas no MVP) |
| PCs montados (PDP) | `/pcs/[slug]` | **0.8** | `weekly` | API `/api/products?buildType=pc_pronto` |
| Categorias / Builder | `/produtos`, `/montar`, `/produtos?categoria=[slug]` | **0.7** | `daily` | estática + categorias do schema |
| PDPs de componente | `/produtos/[slug]` | **0.6** | `weekly` | API `/api/products?buildType=componente` |
| Blog | `/blog/[slug]` | **0.5** | `monthly` | MDX local ou CMS V2 |
| Institucionais | `/sobre`, `/contato`, `/garantia`, `/policies/*`, `/faq`, `/glossario` | **0.4** | `monthly` | estática |
| Auth / cart / checkout / account | `/auth/*`, `/cart`, `/checkout`, `/account/*`, `/orders/*`, `/favoritos` | **— (não no sitemap)** | — | bloqueado por robots.txt |

### Esqueleto do `sitemap.ts` (pseudocódigo pra Frontend implementar)

```ts
import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koretech.com.br';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [personas, pcs, componentes] = await Promise.all([
    api.get('/api/personas'),
    api.get('/api/products?buildType=pc_pronto&limit=200'),
    api.get('/api/products?buildType=componente&limit=500'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, priority: 1.0, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${SITE}/produtos`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${SITE}/montar`, priority: 0.7, changeFrequency: 'daily' },
    { url: `${SITE}/sobre`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/contato`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/garantia`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/faq`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/glossario`, priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/policies/privacidade`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE}/policies/termos`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE}/policies/troca`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  const personaPages = personas.map(p => ({
    url: `${SITE}/builds/${p.slug}`,
    priority: 0.9,
    changeFrequency: 'weekly' as const,
    lastModified: p.updatedAt,
  }));

  const pcPages = pcs.map(p => ({
    url: `${SITE}/pcs/${p.slug}`,
    priority: 0.8,
    changeFrequency: 'weekly' as const,
    lastModified: p.updatedAt,
  }));

  const componentPages = componentes.map(p => ({
    url: `${SITE}/produtos/${p.slug}`,
    priority: 0.6,
    changeFrequency: 'weekly' as const,
    lastModified: p.updatedAt,
  }));

  return [...staticPages, ...personaPages, ...pcPages, ...componentPages];
}
```

> **Observação:** quando passar de ~50k URLs (V3), particionar em sitemap-index com `sitemap-products.xml`, `sitemap-pcs.xml`, etc. No MVP a soma fica em ~80 URLs (8 personas + 8 PCs + ~30 componentes + 10 monitores/periféricos + estáticas).

---

## 3. Robots.txt

Em `src/projeto-tech/kore-tech/frontend/src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://koretech.com.br';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/account',
          '/account/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/orders',
          '/orders/*',
          '/favoritos',
          '/auth/*',
          '/api/*',
          '/*?utm_*',  // evita indexar URLs com tracking
          '/search?*', // evita indexar resultado de busca
        ],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
```

**Liberado explicitamente** (não bloquear nunca):
- `/`
- `/produtos*`
- `/pcs/*`
- `/builds/*` (landings de persona — KILLER)
- `/montar`
- `/blog/*`
- `/glossario`
- `/sobre`, `/contato`, `/garantia`, `/faq`
- `/policies/*` (são linkadas de footer, importam pra E-A-T)

---

## 4. Metadata por tipo de página

Cada página tem `metadata` dinâmica (`generateMetadata` no App Router quando o slug muda).

### 4.1 Templates

| Tipo | `<title>` (template) | `<meta description>` (template) |
|---|---|---|
| **Home** | `Kore Tech | PC Gamer Montado, Componentes e Periféricos` | `Monte seu PC gamer com checagem automática de compatibilidade ou escolha um build pronto pelo seu uso. Pix com 5% off, parcelado em 12x. Frete BR.` |
| **Persona** | `[Nome da Persona] | Build pronto a partir de R$ [preço mín] | Kore Tech` | `[FPS-alvo] em [jogo principal]. [Tagline da persona]. PCs prontos a partir de R$ [preço mín], parcelado em 12x sem juros.` |
| **PC montado** | `[Nome do PC] | [FPS de pico] em [jogo destaque] | Kore Tech` | `[Resumo das peças principais]. [FPS estimado em 2 jogos]. R$ [preço] à vista no Pix ou 12x R$ [parcela].` |
| **Componente** | `[Marca] [Modelo] | [Categoria] | Kore Tech` | `[Spec headline — ex: 12 núcleos AM5, DDR5 5200, 65W TDP]. Compatível com [chipset/socket]. R$ [preço] em até 12x.` |
| **Montar (Builder)** | `Monte seu PC | Builder com checagem de compatibilidade | Kore Tech` | `Monte seu PC peça por peça. Filtro automático de compatibilidade, cálculo de fonte e sugestão de upgrade em tempo real. Salve, compartilhe, compre.` |
| **PLP categoria** | `[Categoria] | Kore Tech` | `[N produtos] em [categoria]. Filtros por marca, faixa de preço e persona de uso. Frete BR e parcelado em 12x.` |
| **Blog post** | `[Título do post] | Blog Kore Tech` | `[Primeiro parágrafo, máx 158 chars]` |
| **Sobre** | `Sobre a Kore Tech | Loja de PC Gamer Brasileira` | `Loja brasileira de hardware focada em PC gamer e workstation. Builder com checagem de compatibilidade, garantia DOA 14 dias e suporte humano.` |
| **Garantia** | `Garantia | Kore Tech` | `Garantia DOA 14 dias, garantia legal CDC 90 dias e garantia de fabricante 12 meses intermediada por nós. Saiba mais.` |
| **FAQ** | `Perguntas Frequentes | Kore Tech` | `Tudo sobre prazo de entrega, parcelamento, garantia, troca, lista de espera e o builder. Respostas diretas, sem enrolação.` |

### 4.2 Regras gerais

- **Title máx 60 chars.** Truncar nome do PC se passar.
- **Description 140-160 chars.** Sempre incluir benefício (preço, parcelamento, prazo, FPS).
- **Nunca** dois títulos iguais entre páginas (Search Console reclama).
- `og:title` = `<title>` sem o sufixo `| Kore Tech`.
- `og:type` = `product` em PDP, `website` em landing/home.
- `og:image` = OG image dinâmica (ver seção 6).
- `twitter:card` = `summary_large_image` global.
- `canonical` = URL própria sem query params (`?utm_*` etc).
- `lang="pt-BR"` no `<html>`.

### 4.3 Snippet de `generateMetadata` (PDP de componente)

```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: `${product.brand} ${product.model} | ${product.categoryLabel} | Kore Tech`,
    description: `${product.specHeadline}. Compatível com ${product.compatibility.socketLabel ?? product.compatibility.formFactor}. R$ ${product.price.toFixed(2)} em até 12x.`,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: `${product.brand} ${product.model}`,
      description: product.specHeadline,
      type: 'website',
      images: [{ url: `/produtos/${product.slug}/opengraph-image` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

---

## 5. JSON-LD (structured data)

Implementar em componente `<JsonLd data={...} />` que renderiza `<script type="application/ld+json">`.

### 5.1 `Organization` — em `app/layout.tsx`

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Kore Tech",
  "url": "https://koretech.com.br",
  "logo": "https://koretech.com.br/logo.png",
  "sameAs": [
    "https://instagram.com/koretech",
    "https://wa.me/55XXXXXXXXXXX"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-XX-XXXX-XXXX",
    "contactType": "customer support",
    "areaServed": "BR",
    "availableLanguage": "Portuguese"
  }
}
```

### 5.2 `BreadcrumbList` — global em todas as páginas internas

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://koretech.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "Builds prontos", "item": "https://koretech.com.br/builds" },
    { "@type": "ListItem", "position": 3, "name": "Valorant 240fps", "item": "https://koretech.com.br/builds/valorant-240fps" }
  ]
}
```

### 5.3 `Product` + `Offer` — em PDP componente E PDP PC montado

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "AMD Ryzen 7 7700X",
  "image": ["https://res.cloudinary.com/.../ryzen-7-7700x.jpg"],
  "description": "Processador AMD Ryzen 7 7700X, 8 núcleos / 16 threads, socket AM5, TDP 105W.",
  "sku": "RYZN-7700X",
  "brand": { "@type": "Brand", "name": "AMD" },
  "category": "Processador",
  "offers": {
    "@type": "Offer",
    "url": "https://koretech.com.br/produtos/ryzen-7-7700x",
    "priceCurrency": "BRL",
    "price": "1899.00",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "itemCondition": "https://schema.org/NewCondition",
    "seller": { "@type": "Organization", "name": "Kore Tech" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": 47
  }
}
```

> **Importante:** `availability` muda entre `InStock`, `OutOfStock`, `PreOrder`. Quando OutOfStock, Frontend renderiza WaitlistButton e o JSON-LD reflete isso (não enganar o Google).

### 5.4 `FAQPage` — em `/faq` e `/garantia`

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Em quanto tempo recebo meu PC montado?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PCs montados (BTO) levam de 5 a 7 dias úteis pra montar e testar antes de despachar, mais o frete da sua região."
      }
    }
  ]
}
```

### 5.5 `WebPage` — em landings de persona (ver `LANDING-PERSONAS-SEO.md` por persona)

---

## 6. OG image template

Dinâmica via `app/.../opengraph-image.tsx` usando `ImageResponse` de `next/og`.

### Specs (Designer pode refinar visualmente)

- **Dimensões:** 1200 x 630 px (padrão Facebook/Twitter/LinkedIn)
- **Background:** `#0A0E14` (bg) com gradiente sutil para `#141921` no canto inferior direito
- **Logo:** canto superior esquerdo, 120px de largura, branco
- **Linha cyan #00E5FF** vertical à esquerda do título (4px, 80% da altura) — é a "barra de marca"
- **Título principal:** Inter Bold 64px, branco `#E8EEF5`, máx 2 linhas, centralizado verticalmente
  - PC montado: nome do PC ("Kore Tech Valorant Pro")
  - Componente: marca + modelo ("AMD Ryzen 7 7700X")
  - Persona: nome da persona ("Valorant 240fps")
  - Home: "Monte certo. Jogue alto."
- **Subtítulo:** Inter Regular 28px, `#8892A0`, 1 linha
  - PC: FPS destaque ("280 FPS no Valorant 1080p")
  - Componente: spec headline ("8 núcleos · AM5 · DDR5")
  - Persona: tagline da persona
- **Preço destaque** (só PC montado e componente): canto inferior direito, JetBrains Mono Bold 56px, cor `#00E5FF`, prefixo "R$" menor
- **Watermark:** rodapé "koretech.com.br" em Inter Regular 18px, `#5A6573`, alinhado à direita
- **Fallback (sem dados específicos):** background + logo + slogan "Monte certo. Jogue alto." em destaque

### Esqueleto (Frontend implementa)

```tsx
// app/produtos/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #0A0E14 0%, #141921 100%)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: 80, color: '#E8EEF5', position: 'relative',
      }}>
        <div style={{ position: 'absolute', left: 60, top: 140, bottom: 140, width: 4, background: '#00E5FF' }} />
        <div style={{ fontSize: 28, color: '#5A6573' }}>KORE TECH</div>
        <div style={{ marginTop: 'auto', marginBottom: 'auto', paddingLeft: 40 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>{product.brand} {product.model}</div>
          <div style={{ fontSize: 28, color: '#8892A0', marginTop: 16 }}>{product.specHeadline}</div>
        </div>
        <div style={{ position: 'absolute', right: 80, bottom: 80, fontSize: 56, fontWeight: 700, color: '#00E5FF', fontFamily: 'JetBrainsMono' }}>
          R$ {product.price.toLocaleString('pt-BR')}
        </div>
        <div style={{ position: 'absolute', right: 80, bottom: 30, fontSize: 18, color: '#5A6573' }}>koretech.com.br</div>
      </div>
    ),
    size
  );
}
```

Replicar pra:
- `app/pcs/[slug]/opengraph-image.tsx`
- `app/builds/[slug]/opengraph-image.tsx` (persona)
- `app/opengraph-image.tsx` (fallback global / home)

---

## 7. Auditoria contínua (pós-launch — anotar pra QA/V2)

- **Search Console** indexado → rodar todo lançamento de feature
- **Lighthouse SEO ≥ 95** em home, persona, PDP componente, PDP PC montado, builder
- **Schema.org validator** (validator.schema.org) em PDP — Product + Offer + Breadcrumb
- **PageSpeed mobile ≥ 80** (Google ranqueia mobile-first)
- **Sem `noindex` acidental** em rota indexável (Frontend cuidado com `robots: { index: false }` em layout!)

---

## 8. Pendências bloqueadas em outros agentes

- **Frontend:** implementar `sitemap.ts`, `robots.ts`, `<JsonLd />`, `opengraph-image.tsx`, `generateMetadata` em todas as rotas
- **Backend:** garantir `/api/personas` retorna `slug + name + heroPriceMin + updatedAt` (sitemap precisa) e `/api/products?buildType=...&limit=N` aceita filtro
- **Designer:** validar specs visuais do OG image, fornecer logo PNG 240x80 transparente
- **Copywriter:** fornecer `specHeadline` curto (max 60 chars) por categoria de componente — entra no schema/seed
