# DE: Copywriter (Agente 07) | PARA: Tech Lead | Data: 2026-04-26

## Sprint 1 — Kore Tech | Copy completo | concluído

---

## 1. Arquivos entregues

Todos em `projetos/projeto-tech/kore-tech/copy/`.

Já existiam (entregues antes nesta sprint):

| Arquivo | O que é |
|---|---|
| `BRAND-VOICE.md` | Refinamento operacional do brand-brief: 5 atributos da voz, 5 regras pareadas, tom por contexto com 6 exemplos ON/OFF brand, decisões de execução (pronome, "a gente", emoji, Pix), 10 erros que disparam revisão imediata, slogan e USPs validados |
| `COPY-PERSONAS.md` | Copy completo das 8 landings de persona (`/builds/[persona-slug]`): headline, subheadline, 3 bullets com número, CTAs primário/secundário, meta title e meta description, padrões cross-persona |
| `COPY-UI.md` | 18 seções com TODA string visível ao cliente da loja: header/footer/home/PLP/PDP componente/PDP PC/cart/checkout/auth/account/empty states/erros/toasts/loading/cookie banner. Mapeamento string-componente Next.js no fim |
| `GLOSSARIO.md` | Termo técnico hardware explicado pra iniciante (4 partes por termo: o que é, tradução amigável, por que importa, onde aparece) |

Entregues agora (Sprint 1 — fechamento):

| Arquivo | O que é |
|---|---|
| `COPY-PRODUTOS-EXEMPLO.md` | 3 SKUs molde pro Backend usar no seed: 1 GPU avulsa (RTX 4070 Super Gainward Phoenix), 1 PC montado (Kore Tech Valorant Pro), 1 monitor (LG UltraGear 27GP850-B). Cada SKU tem `name`, `slug`, `tagline`, `description_short`, `description_long`, `bullets_benefit`, `specs` JSON, `compatibility` JSON, `benchmark_fps` JSON (PC), `personas_alvo`, `warranty_months`, `installments_copy`. Padrões cross-SKU pro Backend aplicar em outros 30 SKUs do seed (estrutura de description_long em 3 parágrafos, regras de garantia, regras de parcelamento) |
| `COPY-EMAILS.md` | 4 templates transacionais: (1) Boas-vindas com cupom BEMVINDO5, (2) Confirmação de pedido com lista de itens + bloco Pix QR opcional, (3) GPU disponível na lista de espera com reserva 24h e variante "preço subiu", (4) DOA / Suporte com 4 passos numerados + lista do que **não** acontece. Padrões cross-email (subject ≤ 40 chars, preview ≤ 90, footer institucional, CTA verbo de ação). Lista de templates futuros pra Sprint 2+ |
| `COPY-INSTITUCIONAL.md` | 6 páginas: `/sobre` (5 seções incluindo "o que a gente não faz" pra transparência), `/contato` (canais + formulário + endereço + SLA), `/policies/garantia` (3 camadas + DOA 30 dias + como acionar), `/policies/troca` (3 cenários + 4 passos + prazos de reembolso), `/policies/privacidade` (LGPD-friendly com tabela de dados, 9 direitos, cookies, DPO), `/policies/termos` (10 seções incluindo limitação de responsabilidade e garantia de performance) |

---

## 2. Decisões de tom

1. **Variação por contexto, voz consistente.** Mesma voz em PDP de componente (técnico, frio), PDP de PC montado (técnico-amigável com FPS prometido), email de boas-vindas (acolhedor sem perder a direção), DOA (empático mas firme), Termos de uso (institucional sem juridiquês). Sem alternar pronome ou pessoa.

2. **Garantia explícita em toda peça de copy.** `BRAND-VOICE.md` diz "garantia que a gente intermedia" como USP. Aplicado em PDP (trust signals), email DOA (3 passos claros), página /garantia (3 camadas com prazos). Cliente sabe exatamente quem chamar e quando.

3. **Pix com 5% off sempre antes de parcelamento.** Linha padrão: `12x R$ 458 sem juros, ou Pix R$ 5.230 (5% off)`. Vírgula separa, nunca travessão. Aplicado em PDP, email de confirmação, política de pagamento.

4. **Honestidade calculada em página /sobre.** Seção "O que a gente não faz" lista que não somos a maior loja, não temos físico, não vendemos refurb. Funciona como confiança, não fragilidade. Cliente do nicho desconfia de loja que afirma demais.

5. **Email DOA sem emoji, com `{nome_atendente}`.** DOA é momento sensível. Voz cede pra empático mas não dramatiza ("que horror!" não, "lamento o transtorno" sim). Numerar próximos passos resolve a ansiedade do cliente.

6. **Política de privacidade em prosa LGPD-friendly.** Tabela de dados/base legal em vez de parágrafo jurídico. 9 direitos LGPD listados em verbo de ação (Confirmar, Acessar, Corrigir, etc). DPO com email direto.

7. **Reserva 24h no email de waitlist com token único.** Senso de urgência real (volta pra fila pública após), não desespero ("ÚLTIMAS UNIDADES!!!"). Variante de "preço subiu" mantém transparência se mercado de GPU mudou.

---

## 3. Palavras e expressões evitadas (lista de 10 do BRAND-BRIEF + adicionais)

Verificação aplicada em todos os arquivos:

- "tecnologia de ponta", "tecnologia de última geração", "última geração"
- "revolucionário", "revolucione", "revolucionar"
- "next-level", "nível acima"
- "gamers de verdade", "verdadeiros entusiastas"
- "experiência única", "experiência inesquecível", "experiência exclusiva"
- "performance incrível", "performance brutal", "performance monstruosa"
- "premium VIP", "clientes vip", "experiência premium"
- "incrível", "sensacional", "espetacular" (adjetivo solto sem número)
- "somos a referência em"
- "Clique aqui" (substituído por verbo de ação real em todo CTA)

Adicionais que evitei além da lista oficial:
- "Configuração otimizada", "configuração inteligente"
- "Atendimento exclusivo"
- "Bem-vindo!" sozinho (substituí por "Bem-vindo, {nome}." com cupom no mesmo bloco)
- Travessão (`—`) zero ocorrências em qualquer string visível ao cliente

---

## 4. Gaps e itens fora do escopo Sprint 1

Nada bloqueante. Identifiquei pra próximas sprints:

- **`COPY-BUILDER.md`** referenciado em `COPY-UI.md` mas não criado nesta sprint. Microcopy do Builder está em `BUILDER-VISUAL-SPECS.md` seção 6 (Designer entregou) e cobre o essencial. Em Sprint 2, posso consolidar microcopy + tooltips + helper text + estados em arquivo dedicado.
- **`COPY-FAQ-PERSONAS.md`** referenciado em `COPY-PERSONAS.md` (4 a 6 perguntas frequentes por persona). Sprint 2.
- **Templates de email Sprint 2+:** abandono de carrinho D+1, pedido enviado, pedido entregue, esqueci a senha, newsletter semanal, pós-venda D+30 e D+180. Listei em `COPY-EMAILS.md`.
- **Blog posts SEO** mencionados em SKILL.md (cuidados, comparações, tutoriais técnicos). Coordenação com Growth (Agente 08) na Sprint 2 ou 3.
- **Variáveis com placeholder:** `{numero_whatsapp}`, `{razao_social}`, `{nome_dpo}`, `{email_dpo}`, endereços. Hoje genéricos porque é demo fictícia. Quando virar projeto real, substituir.

---

## 5. Dependências pra outros agentes

### Backend (Agente 01) — bloqueante pro seed
- **Usar `COPY-PRODUTOS-EXEMPLO.md` como molde** para os 30+ SKUs do seed. Os 3 blocos têm shape literal de `specs`, `compatibility`, `benchmark_fps` JSON. Padrões cross-SKU explicam como adaptar pra outras categorias (CPU, RAM, Mobo, PSU, etc) mantendo a voz.
- **Triggers de email** em `COPY-EMAILS.md` listam variáveis que o Backend precisa enviar pro template engine (Resend ou MJML). Token de reserva 24h precisa ser UUID com expiração e validação no carrinho/checkout.
- **Endpoint `/api/contact-form`** pro formulário de `/contato` precisa salvar em tabela `ContactMessage`.

### Frontend (Agente 03) — bloqueante pra UI
- **`COPY-UI.md`** é fonte da verdade de TODA string da loja. Frontend cria `lib/copy/ui.ts` com objeto aninhado seguindo os slugs (ex: `copy.home.hero.h1`). Sem hardcode em JSX.
- **`COPY-INSTITUCIONAL.md`** vira rotas estáticas: `app/(loja)/sobre/page.tsx`, `app/(loja)/contato/page.tsx`, `app/(loja)/policies/[slug]/page.tsx`. Markdown via react-markdown ou MDX. `meta_title` e `meta_description` em cada YAML alimentam `metadata` do Next.js.
- **`COPY-PERSONAS.md`** alimenta `PersonaHero.tsx` em `app/(loja)/builds/[persona-slug]/page.tsx`.

### Designer (Agente 02) — coordenação
- Templates de email (Resend / MJML) precisam de paleta dark + cyan elétrico do `tokens.css`. Logo `design/logo.svg` no header com altura 32px.
- Páginas institucionais usam grid e tipografia da home; sem novo componente.

### Growth (Agente 08)
- Cupons referenciados (`BEMVINDO5` no welcome email) precisam estar definidos em `growth/CUPONS.md` com regra: 5% off, primeira compra apenas, vale 7 dias, soma com Pix.
- Meta title e meta description de personas e institucional vão pra `<Head>` da rota.
- JSON-LD `Organization` em `/contato`, `WebPage` nas demais.

### QA (Agente 06)
- Bug bash de copy: validar zero travessão, zero palavras proibidas, contraste WCAG AA em texto de policy, links institucionais funcionando, formulário de contato com label e error message acessível.
- Validar HTML semântico (H1 único por página em institucional, listas marcadas, link com texto descritivo).

### Data Analyst (Agente 04)
- Eventos GA4 a instrumentar conforme copy: `view_persona` (param `persona_slug`), `view_product`, `email_open`, `email_click_cta`, `waitlist_email_converted_to_purchase`, `coupon_applied` (param `coupon_code`), `contact_form_submitted`.

---

## 6. Brand voice respeitada

- Português revisado: SIM (PT-BR, sem estrangeirismo gratuito além do jargão real do nicho)
- Sem travessão em qualquer string visível: SIM (zero ocorrências verificadas em todos os 7 arquivos)
- Sem palavras proibidas: SIM (lista de 10 do BRAND-BRIEF + 5 adicionais minhas, todas verificadas)
- "Você" sempre, "a gente" preferido sobre "nós" em UI casual: SIM
- Pix com 5% off antes de parcelamento, vírgula como separador: SIM
- Número antes de adjetivo: SIM (FPS, W, GB, ms, R$ presentes em todos os blocos onde cabia número)
- Sem emoji em UI da loja, limitado em email transacional (zero emoji em todos os 4 emails entregues): SIM

---

## 7. Bloqueios

Nenhum. Todos os 7 arquivos do escopo Sprint 1 do Copywriter entregues. Pronto pra Sprint 2 (consolidação de microcopy do Builder, FAQ por persona, blog posts SEO).

— Copywriter (Agente 07), 2026-04-26
