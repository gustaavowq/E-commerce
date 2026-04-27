# ANALYTICS — Kore Tech

> Mapeamento completo de eventos GA4 + Meta Pixel pro MVP. Frontend implementa via hook `useAnalytics()`. Tudo gated em consentimento LGPD.

---

## 1. Setup técnico

### 1.1 Variáveis de ambiente

```bash
# .env (frontend)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX            # placeholder até cliente dar
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXXX # placeholder
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX             # opcional, V2
```

### 1.2 Carregamento (lazy + consent-gated)

- Scripts GA4 e Meta Pixel injetados via `<Script strategy="afterInteractive" />` em `app/layout.tsx`, **MAS** `gtag('consent', ...)` arranca como `denied` por padrão.
- Banner de consentimento LGPD aparece na primeira visita. **Antes do click**: nenhum `gtag('event', ...)` ou `fbq('track', ...)` dispara — só carrega o script.
- Após click "Aceitar todos" → `gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted' })` + `fbq('consent', 'grant')`.
- Após click "Só essenciais" → mantém denied. Eventos disparados ficam em queue `gtag` mas não saem.

### 1.3 Hook centralizador

```ts
// hooks/useAnalytics.ts
export function useAnalytics() {
  const consent = useConsent(); // lê do contexto

  const track = useCallback((eventName: string, params?: Record<string, any>) => {
    if (!consent.analytics) return;
    if (typeof window === 'undefined') return;
    // GA4
    window.gtag?.('event', eventName, params);
    // Meta Pixel — mapear pro evento equivalente (ver tabela seção 5)
    const meta = META_EVENT_MAP[eventName];
    if (meta) window.fbq?.('track', meta.name, meta.params(params));
  }, [consent]);

  return { track };
}
```

---

## 2. Eventos GA4 — catálogo completo

Todos os eventos abaixo seguem **convenção GA4 enhanced ecommerce** quando aplicável (`view_item`, `add_to_cart`, `purchase`). Os customizados usam snake_case.

### 2.1 Navegação básica

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `page_view` | automático (gtag config) | `page_path`, `page_title`, `page_location` |
| `view_home` | montagem da `/` | — |
| `view_persona` | montagem de `/builds/[slug]` | `persona_slug`, `persona_name` |
| `view_pc_pronto` | montagem de `/pcs/[slug]` | `pc_slug`, `pc_name`, `persona_slug`, `value`, `currency: 'BRL'` |
| `view_product` (= `view_item`) | montagem de `/produtos/[slug]` | `items: [{ item_id, item_name, item_brand, item_category, price }]`, `value`, `currency: 'BRL'` |
| `view_category` | aplicar filtro de categoria em `/produtos` | `category` |

### 2.2 PC Builder (funil killer)

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `start_builder` | usuário entra em `/montar` (primeira interação ou load) | `entry_source` (`'home'`, `'persona'`, `'cta_blog'`, `'direct'`), `persona_prefilter` (slug ou null) |
| `add_part_builder` | usuário escolhe peça em qualquer categoria do builder | `category` (`cpu`,`gpu`,`mobo`,...), `product_id`, `product_name`, `total_value` (acumulado), `total_wattage` (acumulado), `parts_count` |
| `remove_part_builder` | remove peça | `category`, `product_id` |
| `change_part_builder` | substitui peça | `category`, `old_product_id`, `new_product_id` |
| `compatibility_warning` | builder mostra warning amarelo | `warning_type` (`psu_low`, `cooler_height`, `gpu_length`, `ram_speed`, ...), `current_parts_count` |
| `compatibility_error` | builder mostra erro vermelho (impede compra) | `error_type` (`socket_mismatch`, `formfactor_case`, ...), `current_parts_count` |
| `psu_recommendation_accepted` | usuário aceita sugestão automática de fonte | `recommended_psu_id`, `replaced_psu_id` (ou null), `wattage_required` |
| `complete_build` | builder considera "build válido" (sem erros) | `total_value`, `num_parts`, `persona_inferred` (slug detectado) |
| `save_build` | clica "salvar build" | `is_logged_in`, `total_value` |
| `share_build` | clica "compartilhar build" (gera shareSlug) | `share_slug`, `total_value` |
| `builder_to_cart` | clica "comprar" no builder | `total_value`, `num_parts`, `coupon_auto_applied` (`'BUILDER10'`) |

> **Funil principal (Data Analyst monta no GA4):**
> `start_builder` → `add_part_builder` (≥1) → `complete_build` → `builder_to_cart` → `begin_checkout` → `purchase`

### 2.3 Catálogo

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `search` | submeter busca em `/search` | `search_term`, `results_count` |
| `select_item` | clicar em produto numa lista (PLP, persona, home) | `item_list_name`, `items: [{...}]` |
| `view_item_list` | renderizar lista (PLP, home, persona) | `item_list_name`, `items` |

### 2.4 Carrinho / checkout / compra (enhanced ecommerce)

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `add_to_cart` | adiciona produto ao carrinho (qualquer fonte: PDP, PLP, builder) | `items: [{ item_id, item_name, item_category, price, quantity }]`, `value`, `currency: 'BRL'`, `source` (`'pdp'`,`'builder'`,`'plp'`,`'crosssell'`) |
| `remove_from_cart` | remove item | `items`, `value`, `currency` |
| `view_cart` | abre `/cart` | `items`, `value`, `currency` |
| `apply_coupon` | submete cupom no carrinho/checkout | `coupon_code`, `success` (bool), `reason` (se falhou), `discount_value` (se sucesso) |
| `begin_checkout` | entra em `/checkout` | `items`, `value`, `currency`, `coupon` (se aplicado) |
| `add_shipping_info` | preenche endereço | `value`, `shipping_tier` (`pac` `sedex`), `shipping_cost` |
| `add_payment_info` | escolhe método de pagamento | `value`, `payment_type` (`pix`, `cartao_3x`, `cartao_12x`, ...) |
| `purchase` | order confirmada (server-side ou via `/orders/[id]?just_purchased=1`) | `transaction_id` (orderId), `value`, `currency`, `tax`, `shipping`, `coupon`, `payment_method`, `items` |
| `purchase_failed` | erro no checkout (gateway recusou) | `value`, `error_code`, `payment_method` |

### 2.5 Lista de espera

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `waitlist_subscribed` | clica "me avise quando chegar" | `product_id`, `product_name`, `product_category`, `is_logged_in` |
| `waitlist_notified_open` | abre email "GPU disponível" e clica | `product_id`, `notified_at` (server-side via UTM) |
| `waitlist_to_cart` | adiciona ao carrinho a partir da notificação | `product_id`, `time_from_notification_minutes` |

### 2.6 Engajamento

| Evento | Quando dispara | Parâmetros |
|---|---|---|
| `signup` | cria conta com sucesso | `method` (`'email'`, `'google'` se V2) |
| `login` | login bem-sucedido | `method` |
| `newsletter_subscribed` | submete email no popup ou footer | `source` (`'popup'`, `'footer'`, `'checkout'`), `coupon_offered` (`'BEMVINDO5'`) |
| `newsletter_dismissed` | fecha popup | `dismissed_at_seconds` (após quantos segundos) |
| `whatsapp_clicked` | clica botão WhatsApp (header/footer/PDP) | `source` (`'header'`, `'footer'`, `'pdp_doubt'`) |
| `add_to_wishlist` | favorita produto | `items`, `value` |
| `view_blog_post` | montagem `/blog/[slug]` | `post_slug`, `post_title`, `post_category` |
| `scroll_75` | scroll passou 75% da página (auto via GA4 enhanced measurement) | `page_path` |

---

## 3. Schema canônico de `items[]` (compartilhado)

Sempre que evento usa `items[]`, segue este shape (compatível GA4 + Meta Pixel `ViewContent`/`AddToCart`/`Purchase` `content_ids`):

```json
{
  "item_id": "ryzen-7-7700x",
  "item_name": "AMD Ryzen 7 7700X",
  "item_brand": "AMD",
  "item_category": "cpu",
  "item_category2": "componente",
  "item_category3": "amd-am5",
  "price": 1899.00,
  "quantity": 1,
  "discount": 0,
  "currency": "BRL"
}
```

> Frontend deve ter helper `productToGA4Item(product)` pra normalizar.

---

## 4. UTM convention (todos os emails / anúncios)

Cada link saindo de email/anúncio deve carregar UTMs. Padrão:

| Source | Medium | Campaign | Content |
|---|---|---|---|
| `email` | `welcome_d0` | `bemvindo5` | `cta_principal` |
| `email` | `welcome_d3` | `glossario_builder` | `cta_builder` |
| `email` | `cart_abandon_d1` | `volte_carrinho` | `cta_carrinho` |
| `email` | `waitlist_notify` | `gpu_disponivel` | `cta_reservar` |
| `google_ads` | `cpc` | `pmax_pc_gamer_5k` | `headline_a` |
| `meta_ads` | `cpc` | `valorant_240fps` | `creative_video_a` |
| `instagram` | `social` | `reel_unboxing` | `bio_link` |
| `youtube` | `video` | `review_canal_x` | `descrição` |

Backend não precisa fazer nada — Frontend lê `searchParams` no `layout.tsx` e dispara `set_utms` (custom event GA4) na primeira visita da sessão. Persiste no `sessionStorage` pra atribuir ao `purchase` futuro.

---

## 5. Mapeamento Meta Pixel

| GA4 | Meta Pixel (standard) | Params |
|---|---|---|
| `page_view` | `PageView` | (auto) |
| `view_product` / `view_item` | `ViewContent` | `content_ids: [item_id]`, `content_type: 'product'`, `value`, `currency` |
| `view_pc_pronto` | `ViewContent` | mesmo, `content_category: 'pc_pronto'` |
| `view_persona` | (custom) `ViewPersona` | `persona_slug` |
| `view_category` | (custom) `ViewCategory` | `category` |
| `add_to_cart` | `AddToCart` | `content_ids`, `content_type`, `value`, `currency` |
| `view_cart` | (custom) `ViewCart` | `value` |
| `apply_coupon` | (custom) `ApplyCoupon` | `coupon_code`, `success` |
| `begin_checkout` | `InitiateCheckout` | `content_ids`, `value`, `currency`, `num_items` |
| `add_payment_info` | `AddPaymentInfo` | `value`, `currency`, `payment_type` |
| `purchase` | `Purchase` | `content_ids`, `value`, `currency`, `num_items` |
| `signup` | `CompleteRegistration` | `method` |
| `newsletter_subscribed` | `Lead` | `source` |
| `waitlist_subscribed` | `Lead` | `content_id` (productId), `lead_type: 'waitlist'` |
| `start_builder` | (custom) `StartBuilder` | `entry_source` |
| `complete_build` | (custom) `CompleteBuild` | `value`, `num_parts` |
| `search` | `Search` | `search_string`, `value` (se houver) |
| `add_to_wishlist` | `AddToWishlist` | `content_ids`, `value` |

> **Eventos custom no Pixel** precisam ser registrados via `fbq('trackCustom', 'StartBuilder', {...})` em vez de `fbq('track', ...)`.

---

## 6. Conversões prioritárias (configurar no GA4 + Pixel)

Marcar essas como **conversion** no GA4 e **standard event** no Pixel:

1. `purchase` — venda concluída (KPI principal)
2. `begin_checkout` — sinal de intenção forte (otimização de campanha)
3. `complete_build` — sinal de qualidade do tráfego pro builder (otimização de Performance Max)
4. `newsletter_subscribed` — captura de lead (otimização de campanha de topo)
5. `waitlist_subscribed` — lead qualificadíssimo de produto sem estoque

---

## 7. Server-side tracking (V2, recomendação)

No MVP, tudo client-side. **V2 recomendação:**
- Backend dispara `purchase` server-side via Meta Conversion API (CAPI) — bypassa adblocker do iOS, ITP, etc. Aumenta atribuição em 20-40%.
- Hash de email/telefone com SHA-256 vai junto pro matching.
- Mesma coisa pro GA4 via Measurement Protocol.

Documentar no roadmap.

---

## 8. LGPD checklist (obrigatório no MVP)

- [ ] Banner de cookie aparece na 1ª visita
- [ ] Botão "Aceitar todos" / "Só essenciais" / "Configurar" (V2)
- [ ] Decisão guardada em cookie `kore_consent` (1 ano)
- [ ] Antes do consentimento: scripts carregam mas eventos NÃO disparam
- [ ] Página `/policies/privacidade` lista TODOS os eventos coletados
- [ ] Página `/policies/cookies` lista todos os cookies (essenciais + analytics + marketing)
- [ ] Botão "rever consentimento" no footer (V2)

---

## 9. Pendências bloqueadas em outros agentes

- **Frontend:** implementar `useAnalytics()`, `<ConsentBanner />`, integração GA4 + Meta Pixel via `<Script>`, hook que dispara cada evento da seção 2 nos componentes corretos
- **Frontend:** componente `<JsonLd />` (compartilhado com SEO-PLAN.md) e injeção UTM no `sessionStorage`
- **Backend:** endpoint `POST /api/cart` aceita `source` (`'builder'` | `'pdp'` | etc) e persiste em `Cart.source`
- **Backend:** webhook MercadoPago → marca order, retorna 302 pra `/orders/[id]?just_purchased=1` (sinaliza Frontend a disparar `purchase`)
- **Backend (V2):** Meta CAPI server-side
- **Cliente:** GA4 Measurement ID + Meta Pixel ID + (V2) Meta CAPI access token
