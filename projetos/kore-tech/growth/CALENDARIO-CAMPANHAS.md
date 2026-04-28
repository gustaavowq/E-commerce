# CALENDARIO-CAMPANHAS — Kore Tech

> Calendário 12 meses de campanhas sazonais. Cada uma: cupom + público + canal + entregáveis necessários.
>
> Hardware tem 2 picos massivos (Black Friday + Natal) e 2 vales conhecidos (Janeiro + Junho). Resto é oportunidade calibrada.

---

## Visão geral 12 meses

| Mês | Campanha principal | Cupom carro-chefe | Intensidade |
|---|---|---|---|
| Janeiro | Outlet pós-festas | `OUTLET40` | Alta (esvazia estoque) |
| Fevereiro | Volta às aulas | `ESTUDANTE15` | Média |
| Março | (vale) | — | Baixa |
| Abril | Lançamentos Q2 (se houver) | `LANCAMENTO` | Média |
| Maio | Dia das Mães (opcional) | `MAES15` | Baixa-Média |
| Junho | (vale) | — | Baixa |
| Julho | Férias / friends-and-family | `AMIGOS10` (V2) | Média |
| Agosto | Dia dos Pais | `PAIS15` | Média |
| Setembro | Aniversário Kore Tech (V2) | `KORE3ANOS` | Média |
| Outubro | Semana do Gamer + esquenta BF | `GAMER20` | Alta |
| Novembro | **Black Friday** | `BLACK40` | **Crítica** |
| Dezembro | Natal + reta final ano | `NATAL15` + `COMBO20` | Alta |

---

## Janeiro — OUTLET40 (esvaziar pós-festas)

| Campo | Valor |
|---|---|
| **Período** | 02/01 a 31/01 |
| **Objetivo** | Liberar estoque de itens parados de Q4 (sobras de BF/Natal) sem queimar margem do catálogo principal |
| **Cupom** | `OUTLET40` — 40% off, **só** em produtos com flag `outlet=true` (Backend filtra). Não cumula. |
| **Público** | Toda base + adquisição paga (lookalike de quem comprou em Nov-Dez) |
| **Canais** | Google Ads search ("pc gamer barato outlet"), Performance Max, email pra base, Meta Ads retargeting visitantes BF/Natal que não compraram |
| **Entregáveis** | Landing `/outlet` curada (~15 SKUs), banner home + header, badge "OUTLET" nos cards |
| **Backend precisa** | flag `Product.outlet: boolean` (filtro de cupom) |
| **Risco** | Queimar margem em produto que sairia naturalmente. Curar manualmente os 15 SKUs com Estoque > 60 dias parados. |

---

## Fevereiro — ESTUDANTE15 (volta às aulas)

| Campo | Valor |
|---|---|
| **Período** | 01/02 a 28/02 |
| **Objetivo** | Capturar pais comprando PC pra filho universitário ou ensino médio |
| **Cupom** | `ESTUDANTE15` — 15% off em PCs montados das categorias `entry-gamer` e nova `pc-estudante` (custo-benefício pra estudo + leve gaming). Validação por email institucional opcional (`@usp.br`, etc) — V2. No MVP, sem validação. |
| **Público** | Adquisição: pais 35-55, lookalike de compradores entry. Insta/TikTok com criativos "primeiro PC do filho" |
| **Canais** | Google Ads ("pc para estudar faculdade"), Insta/TikTok |
| **Entregáveis** | Landing `/builds/estudante` (criar persona V2), email pra base atual sugerindo "presente pra um estudante" |
| **Backend precisa** | flag em produtos elegíveis ou nova `category=pc-estudante` |

---

## Março/Junho — Vales

| Campo | Valor |
|---|---|
| **Estratégia** | Não criar campanha ofensiva. Manter `BEMVINDO5` rolando + `PIXFIRST` + `BUILDER10`. Investir em conteúdo SEO (3 blog posts/mês) pra criar pipeline pra picos seguintes. |
| **Cupom** | nenhum sazonal — só os perenes |
| **Canais** | só orgânico + reativação (`VOLTA10` em V2) |

---

## Abril — Lançamentos Q2

| Campo | Valor |
|---|---|
| **Período** | variável (depende do que NVIDIA/AMD/Intel anunciam) |
| **Objetivo** | Capitalizar busca por "rtx 6000 preço brasil" / "ryzen 8000" no momento do lançamento |
| **Cupom** | `LANCAMENTO5` — 5% off no produto novo (margem fina porque produto novo já é raro) |
| **Público** | Hardcore enthusiast — entusiasta segue news no day-1 |
| **Canais** | YouTube ads em vídeos de review (canais Adrenaline, Tec Mundo Hardware), Reddit r/buildapcbrasil, email pra base segmentada (quem comprou GPU/CPU > R$ 3k em últimos 12m) |
| **Entregáveis** | Landing pré-pronta `/lancamento/[produto]` + lista de espera ativada antes do estoque chegar |

---

## Maio — MAES15 (Dia das Mães, opcional)

| Campo | Valor |
|---|---|
| **Período** | 01/05 a 12/05 |
| **Objetivo** | Pequeno boost. Hardware **não é** presente típico de Mães. Foco em **monitor** ou **periférico premium** (mãe que joga ou trabalha em casa). |
| **Cupom** | `MAES15` — 15% off em monitores + periféricos. Não em PC montado (não é o público). |
| **Público** | Filhos comprando pra mãe |
| **Canais** | Insta + Google curto |
| **Entregáveis** | Landing simples `/presente-maes`, criativos com tom honesto ("se sua mãe joga ou trabalha em casa, isso aqui faz diferença") |
| **Risco** | Forçar narrativa fora do nicho. Se o dado mostrar conversão baixa em Maio do ano anterior, pular em 2027. |

---

## Agosto — PAIS15 (Dia dos Pais)

| Campo | Valor |
|---|---|
| **Período** | 01/08 a 11/08 |
| **Objetivo** | Boost médio. Pai gamer ou pai que monta PC com filho — narrativa funciona melhor que Mães. |
| **Cupom** | `PAIS15` — 15% off em PCs montados + periféricos premium |
| **Público** | Filhos jovens comprando, esposas/parceiras comprando |
| **Canais** | Insta, Google, email pra base ("um setup que ele vai amar") |
| **Entregáveis** | Landing `/presente-pais`, kit "setup completo" highlight |

---

## Outubro — GAMER20 (Semana do Gamer + esquenta BF)

| Campo | Valor |
|---|---|
| **Período** | 22/10 a 29/10 (semana do gamer) + esquenta de BF a partir de 15/11 |
| **Objetivo** | Pico médio de periféricos + criar awareness pra Black Friday |
| **Cupom** | `GAMER20` — 20% off em periféricos (mouse, teclado, headset, mousepad). Não em PC/componente. |
| **Público** | Gamers entusiastas, compradores de PC dos últimos 12m (cross-sell de periférico) |
| **Canais** | Twitch ads em streamers BR, YouTube ads em jogo de FPS, Insta, email D-2 |
| **Entregáveis** | Landing `/semana-gamer`, página `/black-friday` em "wait list" pra capturar email D-15 |

---

## Novembro — BLACK40 (Black Friday — A campanha do ano)

| Campo | Valor |
|---|---|
| **Período** | Esquenta D-15 (a partir de 15/11). Pico 28-30/11. Cyber Monday 02/12 (residual). |
| **Objetivo** | **Pico do ano.** Hardware é o nicho mais buscado em BF brasileira. Meta de faturamento mensal = 3x média de outros meses. |
| **Cupons** | `BLACK40` (40% off em catálogo selecionado, Backend filtra `blackFriday=true`), `GPU40` (40% off em GPUs específicas), `BUILDER10` mantém ativo (incentivo extra pra builder), `FRETE15` mantém |
| **Público** | TODO mundo. Adquisição agressiva + base inteira + lista de espera (notificada antecipado). |
| **Canais** | TODOS — Google PMax (orçamento 4x), Meta Ads (4x), YouTube, Twitch, Instagram, Reddit, email diário D-15 esquenta + diário D-7 contagem regressiva, WhatsApp broadcast (V2) |
| **Entregáveis** | **Landing `/black-friday` ATIVA O ANO INTEIRO** (vazia fora do período, captura email "me avise da BF"), countdown timer, badge "BLACK FRIDAY" em todos os cards elegíveis, modal "BF começa em 3h" no D-1 |
| **Backend precisa** | flag `Product.blackFriday: boolean` + `Product.blackFridayPrice: Decimal?` (preço dedicado, não só percentual) — comparar com preço normal vira badge "De R$ X por R$ Y (-40%)" |
| **Risco** | Procon multa por preço mascarado. Backend deve **persistir histórico de preço** — se "preço de" foi inflado nas últimas semanas, geramos prejuízo de imagem. **Snapshot mensal de preço de cada SKU em tabela `PriceHistory`** (input pro Backend). |

---

## Dezembro — NATAL15 + COMBO20

| Campo | Valor |
|---|---|
| **Período** | 01/12 a 24/12 (corte D-1 do Natal pra honrar entrega) |
| **Objetivo** | Aproveitar onda de presente. Foco em **periféricos, monitores e PCs prontos** (mais "presenteáveis" que componente avulso). |
| **Cupons** | `NATAL15` — 15% off no catálogo geral. `COMBO20` — 20% off se carrinho ≥ R$ 3.000 com mix de categorias (presente "completo"). |
| **Público** | Toda base + adquisição mass market |
| **Canais** | Email D-7 + D-3 + D-1, Insta, Google, retargeting de quem viu produto em BF e não comprou |
| **Entregáveis** | Landing `/presente-natal` (kits sugeridos: "kit gamer básico", "kit streamer", "kit primeiro PC"), prazo de entrega destacado em vermelho ("encomende até DD/12 pra chegar no Natal") |
| **Risco** | Logística. Comunicar prazos claramente — atraso em presente de Natal = reclamação Procon + reputação. |

---

## Calendário visual rápido (input pra Frontend banner schedule)

```
Jan  ▓▓▓▓ OUTLET40
Fev  ▓▓▓ ESTUDANTE15
Mar  · · · (orgânico)
Abr  ▓▓ Lançamento (se houver)
Mai  ▓ MAES15 (opcional)
Jun  · · · (orgânico)
Jul  ▓▓ Friends & Family (V2)
Ago  ▓▓ PAIS15
Set  ▓▓ Aniversário Kore (V2)
Out  ▓▓▓▓ GAMER20 + esquenta BF
Nov  ████████ BLACK40 (PICO)
Dez  ▓▓▓▓▓▓ NATAL15 + COMBO20
```

---

## Coordenação com outros agentes (entregáveis recorrentes)

| Agente | Responsabilidade recorrente |
|---|---|
| **Designer** | Banners de cada campanha (header, home, email) — 4 dimensões: 1920x600 (home desktop), 768x400 (home mobile), 1200x630 (OG), 600x400 (email) |
| **Copywriter** | Copy dos emails de esquenta + reta final por campanha. Subject, preheader, body. |
| **Backend** | Flags de campanha em produtos (`outlet`, `blackFriday`, `blackFridayPrice`), histórico de preço pra evitar Procon, agendamento de cupons (active automatic) |
| **Frontend** | Componente `<CampaignBanner />` que lê config `campaignSchedule.json` e mostra banner certo na data certa, countdown timer, modal "começa em X" |
| **Data Analyst** | Dashboard "campanhas em andamento" com receita realizada vs meta, taxa de conversão por canal |

---

## Métrica geral (campanhas)

- **Receita por campanha** vs meta (Data Analyst)
- **CAC por campanha** (gasto em paid ÷ pedidos atribuídos)
- **% receita atribuível a campanha vs orgânico** mês a mês — saudável: 30-50% campanha em meses normais, 60-70% em BF
- **Lista de espera de BF** (capturas D-15 a D-1) — alvo: 10% do tráfego daquele período

---

## Pendências bloqueadas em outros agentes

- **Backend:** flags em `Product` (`outlet`, `blackFriday`, `blackFridayPrice`), tabela `PriceHistory` (snapshot mensal), agendamento automático de `Coupon.active` por janela de data
- **Frontend:** `<CampaignBanner />` + countdown timer + landing `/black-friday` em modo "aguardando" o ano inteiro
- **Designer:** template de banner reusável (4 dimensões) + ID visual de cada campanha (Black Friday geralmente foge da paleta — confirmar se aceita ou se mantém cyan único)
- **Copywriter:** copy de cada email sazonal (V2 — não é Sprint 1)
