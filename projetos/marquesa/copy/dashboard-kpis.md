# Dashboard KPIs — Marquesa

> Especificação dos 9 KPIs do painel admin/analista, em ordem de prioridade. Doc de referência para Backend (endpoints) e Frontend (visualização).
>
> **Janela default:** últimos 30 dias, comparado com 30 dias anteriores (delta %). Ajustável via querystring `?from=YYYY-MM-DD&to=YYYY-MM-DD` em todos os endpoints.
> **Timezone:** todas queries em UTC, exibição em `America/Sao_Paulo`.
> **Cache:** `Cache-Control: no-store` no painel — ADM precisa de dado fresco.
> **Guarda contra div/0:** `if (denom === 0) return 0` em toda taxa.
> **Permissão:** `role IN (ADMIN, ANALYST)` em todos endpoints `/api/admin/dashboard/*`.

---

## Layout sugerido (3 linhas, 12 colunas)

```
[ Funil completo (full-width — 12 col) ]
[ Receita prevista (4) ] [ Receita confirmada (4) ] [ Ticket médio (4) ]
[ Sinais 30d donut (3) ] [ Conversão lead → reserva (3) ] [ Taxa fechamento (3) ] [ Tempo médio catálogo (3) ]
[ Top imóveis engajamento (6) ] [ Reservas ativas vs expiradas (6) ]
```

Acima do layout: 3 cards de **alerta** (`stuck listings`, `reservas expirando 48h`, `imóveis sem foto`) — só aparecem se há ocorrência.

---

## KPI 1 — Funil completo

| Campo | Valor |
|---|---|
| **Nome curto** | Funil de conversão |
| **Tooltip** | Visita no catálogo → lead → reserva paga → fechamento. Mostra onde o funil sangra. |
| **Periodicidade** | Daily (atualiza via cron 01:00 UTC) |
| **Visualização** | Barra horizontal de 4 etapas com largura proporcional ao volume. Etapa de maior queda destacada em **terracota #C76E4A** (ou cor de aviso do brand). Cada barra mostra valor absoluto + % do topo. |
| **Endpoint** | `GET /api/admin/dashboard/funil?days=30` |
| **Threshold de alerta** | Etapa lead → reserva < 1.5% por 7 dias consecutivos = banner amarelo "captação ou preço fora do mercado". |

**Fórmula (4 etapas):**

```
Etapa 1: Visitas no catálogo  = SUM(Imovel.viewCount delta nos N dias)        -- exige campo viewCount + lastViewedAt
Etapa 2: Leads                = COUNT(Lead WHERE createdAt IN window)
Etapa 3: Reservas pagas       = COUNT(Reserva WHERE pagamentoStatus='APROVADO' AND paidAt IN window)
Etapa 4: Fechamentos          = COUNT(Reserva WHERE status='CONVERTIDA' AND updatedAt IN window)

Conversão step N → N+1 = (volume etapa N+1) / (volume etapa N)   -- guarda div/0
```

**Resposta esperada:**
```json
{
  "window": { "from": "2026-03-30", "to": "2026-04-29" },
  "etapas": [
    { "label": "Visitas",       "valor": 4820, "convNext": 0.062 },
    { "label": "Leads",         "valor": 299,  "convNext": 0.121 },
    { "label": "Reservas pagas","valor": 36,   "convNext": 0.222 },
    { "label": "Fechamentos",   "valor": 8,    "convNext": null }
  ],
  "gargalo": "Visitas → Leads"
}
```

---

## KPI 2 — Sinais pagos vs recusados/desistidos

| Campo | Valor |
|---|---|
| **Nome curto** | Sinais 30d |
| **Tooltip** | Distribuição dos pagamentos de sinal nos últimos 30 dias entre aprovados, recusados, cancelados e reembolsados. Detecta atrito no checkout MP. |
| **Periodicidade** | Real-time (consulta direta) |
| **Visualização** | Donut com 4 fatias. Centro mostra total absoluto. Legenda lateral com count + %. Verde-musgo para APROVADO, neutros para os demais. |
| **Endpoint** | `GET /api/admin/dashboard/sinais-status?days=30` |
| **Threshold de alerta** | % REJEITADO + CANCELADO > 30% = banner "investigar checkout MP". |

**Fórmula:**
```
GROUP BY pagamentoStatus
COUNT(*) WHERE Reserva.createdAt >= now() - 30 days
```
Status considerados: `APROVADO`, `REJEITADO`, `CANCELADO`, `REEMBOLSADO`. `PENDENTE` fica fora (ainda em janela MP).

---

## KPI 3 — Top imóveis por engajamento + estagnados

| Campo | Valor |
|---|---|
| **Nome curto** | Imóveis em destaque & estagnados |
| **Tooltip** | Top 5 com mais views/leads/reservas e Top 5 sem ação > 30 dias (sinaliza captação a revisitar ou preço a ajustar). |
| **Periodicidade** | Daily |
| **Visualização** | Duas tabelas lado a lado (`Top engajamento` esquerda verde-musgo, `Estagnados` direita cinza-grafite com mini-warning). 5 linhas cada: thumbnail (40x40), título, bairro, preço, métrica ranqueadora. Linha clicável → PDP painel. |
| **Endpoint** | `GET /api/admin/dashboard/imoveis-engajamento?topN=5&days=30` |
| **Threshold de alerta** | Imóvel listado > 90 dias sem lead → flag automático "revisar preço". |

**Score de engajamento:**
```
score = (viewCount_30d * 1) + (leads_30d * 5) + (reservas_30d * 20)
```
Pesos refletem custo do funil: 1 reserva = 4 leads = 20 views.

**Estagnados:**
```sql
SELECT * FROM Imovel
WHERE status = 'DISPONIVEL'
  AND lastInteractionAt < now() - INTERVAL '30 days'
ORDER BY lastInteractionAt ASC
LIMIT 5
```
`lastInteractionAt = MAX(createdAt do último Lead OU Reserva no imóvel)`. Calculado via trigger ou batch nightly.

---

## KPI 4 — Ticket médio

| Campo | Valor |
|---|---|
| **Nome curto** | Ticket médio |
| **Tooltip** | Preço médio dos imóveis com sinal aprovado nos últimos 30 dias. Indica posicionamento do catálogo. |
| **Periodicidade** | Daily |
| **Visualização** | Number card grande (R$ 4.250.000), delta vs mês anterior em pequeno (`▲ 12,3%` verde / `▼ -5,1%` terracota). Numerais tabulares (`font-feature-settings: 'tnum'`). |
| **Endpoint** | `GET /api/admin/dashboard/ticket-medio?days=30` |
| **Threshold de alerta** | Queda > 20% vs mês anterior = banner "ticket caiu — reforçar mid-luxo ou retirar entradas". |

**Fórmula:**
```sql
SELECT AVG(i.preco) AS ticket_medio
FROM Reserva r
JOIN Imovel i ON i.id = r.imovelId
WHERE r.pagamentoStatus = 'APROVADO'
  AND r.paidAt >= now() - INTERVAL '30 days'
```
Usa `Imovel.preco` no momento da reserva (snapshot ideal: `Reserva.precoSnapshot`, sugerido pra Backend).

---

## KPI 5 — Tempo médio em catálogo (DOM — Days on Market)

| Campo | Valor |
|---|---|
| **Nome curto** | DOM médio |
| **Tooltip** | Dias entre publicação do imóvel e o primeiro sinal aprovado. Benchmark alto-padrão SP: 90-180 dias. |
| **Periodicidade** | Weekly (atualiza domingo 02:00 UTC) |
| **Visualização** | Number card (`87 dias`), abaixo um sparkline de 12 semanas mostrando tendência. |
| **Endpoint** | `GET /api/admin/dashboard/dom?days=180` |
| **Threshold de alerta** | DOM > 150 dias subindo 4 semanas seguidas = "catálogo envelhecendo". |

**Fórmula:**
```sql
SELECT AVG(EXTRACT(DAY FROM (r.paidAt - i.createdAt))) AS dom_medio
FROM Imovel i
JOIN Reserva r ON r.imovelId = i.id
WHERE r.pagamentoStatus = 'APROVADO'
  AND r.paidAt = (
    SELECT MIN(paidAt) FROM Reserva
    WHERE imovelId = i.id AND pagamentoStatus = 'APROVADO'
  )
  AND i.createdAt >= now() - INTERVAL '180 days'
```

---

## KPI 6 — Taxa de conversão (Lead → Reserva paga)

| Campo | Valor |
|---|---|
| **Nome curto** | Conversão lead→reserva |
| **Tooltip** | % dos leads dos últimos 30 dias que viraram reserva paga (qualquer paidAt, mesmo após janela). Benchmark BR: 2-3% lead-to-close geral; queremos ≥ 5% lead-to-sinal. |
| **Periodicidade** | Daily |
| **Visualização** | Number card com %. Delta vs período anterior. Cor verde-musgo se ≥ 5%, cinza se 2-5%, terracota se < 2%. |
| **Endpoint** | `GET /api/admin/dashboard/conversao-lead?days=30` |
| **Threshold de alerta** | < 1.5% por 14 dias consecutivos = "qualidade dos leads ou follow-up corretor". |

**Fórmula:**
```
denom = COUNT(DISTINCT Lead.email WHERE createdAt IN window)
num   = COUNT(DISTINCT Reserva WHERE pagamentoStatus='APROVADO'
              AND userId IN (
                SELECT userId FROM Lead WHERE createdAt IN window
              ))
taxa  = denom === 0 ? 0 : num / denom
```
Match Lead↔Reserva via `userId` ou fallback `email`.

---

## KPI 7 — Reservas ativas vs expiradas

| Campo | Valor |
|---|---|
| **Nome curto** | Reservas 30d |
| **Tooltip** | Distribuição das reservas criadas nos últimos 30 dias entre ativas, expiradas, canceladas e convertidas. Mostra saúde do estoque "travado". |
| **Periodicidade** | Real-time |
| **Visualização** | Bar chart vertical com 4 colunas (ATIVA verde-musgo, EXPIRADA cinza, CANCELADA neutra, CONVERTIDA verde escuro). Total no header. |
| **Endpoint** | `GET /api/admin/dashboard/reservas-status?days=30` |
| **Threshold de alerta** | Expiradas > Convertidas = "follow-up de pós-reserva fraco". |

**Fórmula:**
```sql
SELECT status, COUNT(*) AS total
FROM Reserva
WHERE createdAt >= now() - INTERVAL '30 days'
GROUP BY status
```

---

## KPI 8 — Receita prevista + receita confirmada

| Campo | Valor |
|---|---|
| **Nome curto** | Receita prevista / confirmada |
| **Tooltip** | **Prevista** = soma do preço cheio dos imóveis com sinal pago e reserva ATIVA (entrada no funil de fechamento). **Confirmada** = soma do preço dos imóveis com Reserva CONVERTIDA. |
| **Periodicidade** | Real-time |
| **Visualização** | Dois number cards lado a lado. Prevista em cinza-grafite (italic — "potencial"), confirmada em verde-musgo bold. Embaixo de cada, contagem de reservas. |
| **Endpoint** | `GET /api/admin/dashboard/receita?days=30` |
| **Threshold de alerta** | Confirmada / Prevista < 30% por 60 dias = "muitas reservas escapando após pago". |

**Fórmula:**
```sql
-- Prevista
SELECT SUM(i.preco)
FROM Reserva r JOIN Imovel i ON i.id = r.imovelId
WHERE r.status = 'ATIVA' AND r.pagamentoStatus = 'APROVADO';

-- Confirmada (no window)
SELECT SUM(i.preco)
FROM Reserva r JOIN Imovel i ON i.id = r.imovelId
WHERE r.status = 'CONVERTIDA' AND r.updatedAt >= now() - INTERVAL '30 days';
```

> ⚠️ NÃO somar `valorSinal` como "receita" — a Marquesa não fica com o sinal, é arras do imóvel inteiro. Receita real = comissão sobre preço cheio (V2 quando tivermos o campo `Imovel.comissaoPct`).

---

## KPI 9 — Taxa de fechamento

| Campo | Valor |
|---|---|
| **Nome curto** | Taxa fechamento |
| **Tooltip** | % das reservas pagas que viraram venda confirmada (CONVERTIDA / pagamentoStatus=APROVADO). Janela de 90 dias para refletir ciclo completo de diligência. |
| **Periodicidade** | Weekly |
| **Visualização** | Number card com % grande. Cor: ≥ 60% verde-musgo, 30-60% cinza, < 30% terracota. |
| **Endpoint** | `GET /api/admin/dashboard/taxa-fechamento?days=90` |
| **Threshold de alerta** | < 40% = "diligência reprovando ou comprador desistindo — checar processo offline". |

**Fórmula:**
```
denom = COUNT(Reserva WHERE pagamentoStatus='APROVADO' AND paidAt IN window)
num   = COUNT(Reserva WHERE status='CONVERTIDA' AND paidAt IN window)
taxa  = denom === 0 ? 0 : num / denom
```

---

## Endpoints — checklist Backend

```
GET /api/admin/dashboard/funil?days=30
GET /api/admin/dashboard/sinais-status?days=30
GET /api/admin/dashboard/imoveis-engajamento?topN=5&days=30
GET /api/admin/dashboard/ticket-medio?days=30
GET /api/admin/dashboard/dom?days=180
GET /api/admin/dashboard/conversao-lead?days=30
GET /api/admin/dashboard/reservas-status?days=30
GET /api/admin/dashboard/receita?days=30
GET /api/admin/dashboard/taxa-fechamento?days=90

GET /api/admin/dashboard/alertas               # cards de alerta no topo
GET /api/admin/dashboard/summary               # bundle: chama todos acima e devolve agregado (1 req)
```

Todos exigem `role IN (ADMIN, ANALYST)`. Resposta padrão: `{ window: {from,to}, ...payload }`. Cabeçalho `Cache-Control: no-store`.

---

## Cards de alerta (topo do dashboard)

Endpoint `GET /api/admin/dashboard/alertas`:

| Alerta | Trigger | Severidade |
|---|---|---|
| Reservas expirando em 48h | `Reserva.status='ATIVA' AND expiraEm < now()+48h` | warning |
| Imóveis sem foto | `Imovel.status='DISPONIVEL' AND _count.imagens < 3` | warning |
| Sinal aprovado sem corretor designado | `Reserva.pagamentoStatus='APROVADO' AND Imovel.corretorId IS NULL` | critical |
| Imóveis estagnados > 90d | `lastInteractionAt < now()-90d` | info |
| % rejeição MP > 30% | rolling 7d | critical |

Frontend: só renderiza alertas onde `count > 0`.

---

## V2 (não entram no MVP)

- LTV por cliente (poucos compradores recorrentes em alto-padrão; baixa prioridade)
- CAC por canal (precisa instrumentar UTM antes)
- Heatmap de bairros mais procurados (pesado pra MVP, vale fase 2 com cluster Map)
- Alerta de preço fora de mercado (precisa scraping benchmark Quintoandar/iApartamentos)
- Coorte de leads por mês (interessante mas baixo ROI no início)
