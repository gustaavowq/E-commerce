# Funil imobiliária — Marquesa

> Diagrama das 12 etapas canônicas do funil boutique BR (alto-padrão), com perguntas-chave que cada etapa deve responder no painel.
> Referência para Backend (eventos a registrar) e Frontend (timeline visual da reserva no PDP painel).

---

## Diagrama

```
┌─────────────────────────────────────────────────────────────────────┐
│ DIGITAL (rastreável no Marquesa)                                    │
├─────────────────────────────────────────────────────────────────────┤
│ 1. CAPTAÇÃO          ─────►  Imóvel cadastrado, status=DISPONIVEL   │
│ 2. LISTAGEM          ─────►  Indexado em /imoveis, fotos publicadas │
│ 3. VISITA SITE       ─────►  pageView /imoveis/[slug]               │
│ 4. LEAD              ─────►  Lead criado (form ou WhatsApp)         │
│ 5. QUALIFICAÇÃO      ─────►  Corretor responde (offline + nota CRM) │
│ 6. AGENDAMENTO       ─────►  Visita marcada (campo V2: AgendaVisita)│
│ 7. VISITA REALIZADA  ─────►  Corretor confirma offline (V2)         │
│ 8. PROPOSTA / SINAL  ─────►  Reserva criada, pagamentoStatus=PEND.  │
│ 9. SINAL CONFIRMADO  ─────►  Webhook MP → APROVADO, status=RESERVADO│
├─────────────────────────────────────────────────────────────────────┤
│ OFFLINE (status atualizado manualmente pelo corretor no painel)     │
├─────────────────────────────────────────────────────────────────────┤
│ 10. DILIGÊNCIA       ─────►  status=EM_NEGOCIACAO (até 10 dias úteis)│
│ 11. ESCRITURA        ─────►  Reserva.status=CONVERTIDA              │
│ 12. REGISTRO CRI     ─────►  Imovel.status=VENDIDO (final)          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Etapas detalhadas — perguntas que o painel deve responder

### 1. Captação
**O que acontece:** corretor angaria o imóvel, assina contrato de exclusividade ou agenciamento. No Marquesa MVP, isso é manual via painel `/painel/imoveis/novo`.

**Tracking:** `Imovel.createdAt`, `Imovel.corretorId` (V2).

**Perguntas que o painel responde:**
- Quantos imóveis novos foram captados nos últimos 30 dias?
- Qual corretor capta mais? (V2)
- Qual a faixa de preço média da nova captação?

---

### 2. Listagem / catalogação
**O que acontece:** imóvel publicado em `/imoveis` (status `DISPONIVEL`), com fotos, ficha técnica completa, slug SEO.

**Tracking:** `Imovel.status='DISPONIVEL'`, contagem de fotos, completude de ficha.

**Perguntas:**
- Quantos imóveis ativos há no catálogo agora?
- Há imóveis sem foto suficiente? (alerta)
- Qual a distribuição por tipo (apto, casa, cobertura) e bairro?

---

### 3. Visita ao site (pageView do PDP)
**O que acontece:** visitante chega no `/imoveis/[slug]`. Métrica fundamental do topo do funil.

**Tracking:** **CAMPO NOVO sugerido pra Backend:**
- `Imovel.viewCount` (incrementa via endpoint `POST /api/imoveis/:slug/view` chamado pelo Frontend uma vez por session)
- `Imovel.lastViewedAt`
- Granularidade diária via tabela auxiliar `ImovelView (id, imovelId, viewedAt, sessionId)` — opcional pra V2; MVP só conta agregado.

**Perguntas:**
- Qual imóvel teve mais visitas nos últimos 30 dias?
- Quais imóveis estão com **0 view** há > 14 dias? (sinaliza problema de SEO ou foto pouco atrativa)
- Conversão view → lead por imóvel?

---

### 4. Lead in
**O que acontece:** visitante preenche form de interesse no PDP ou clica em CTA WhatsApp (rastreado via redirect).

**Tracking:** `Lead` criado (`imovelId`, `userId?`, `nome`, `email`, `telefone`, `mensagem`, `createdAt`).

**Perguntas:**
- Quantos leads novos hoje/semana/mês?
- Qual a fonte do lead? (V2: campo `Lead.source` — `form`, `whatsapp`, `instagram`, `direto`)
- Quais imóveis geram mais leads (engagement score)?
- Tempo de resposta do corretor após lead criado? (V2: `Lead.respondedAt`)

---

### 5. Qualificação
**O que acontece:** corretor liga, qualifica o lead (à vista/financiamento, perfil, urgência). Offline, mas painel registra status do lead.

**Tracking:** **V2** — adicionar `Lead.status (NOVO|QUALIFICADO|DESCARTADO|EM_NEGOCIACAO|GANHO|PERDIDO)` + `Lead.notas` (TextArea no painel).

**Perguntas:**
- Quantos leads pendentes de qualificação?
- Tempo médio entre criação do Lead e primeiro toque do corretor?
- % de leads descartados (frios) — input pra qualidade da captação digital.

---

### 6. Agendamento de visita
**O que acontece:** lead qualificado marca visita presencial.

**Tracking:** **V2** — modelo `AgendaVisita (id, leadId, imovelId, dataHora, status: AGENDADA|REALIZADA|CANCELADA, lembreteWhatsApp: bool)`.

**MVP:** corretor anota offline. Painel ainda não tracka.

**Perguntas (V2):**
- Quantas visitas agendadas próxima semana?
- Taxa de no-show?
- Imóveis com mais visitas presenciais agendadas?

---

### 7. Visita realizada
**O que acontece:** corretor confirma a visita, registra impressões.

**Tracking V2:** `AgendaVisita.status='REALIZADA'`, `AgendaVisita.feedback`.

**Perguntas:**
- Quantas visitas geraram proposta nos últimos 30 dias?
- Visita → proposta = qual taxa? (benchmark BR alto-padrão: 15-25%)

---

### 8. Proposta / Sinal solicitado
**O que acontece:** comprador decide reservar. Marquesa abre fluxo `Reservar com sinal`. Reserva criada com `pagamentoStatus='PENDENTE'` aguardando confirmação MP.

**Tracking:** `Reserva.createdAt`, `pagamentoStatus='PENDENTE'`.

**Perguntas:**
- Quantas reservas iniciadas nos últimos 7 dias?
- Quantas ainda pendentes (aguardando Pix)?
- Tempo médio entre criar Reserva e Pix cair? (benchmark: 5-30min)

---

### 9. Sinal confirmado
**O que acontece:** webhook MP recebe payment.approved. Backend muda `Reserva.pagamentoStatus='APROVADO'`, `Imovel.status='RESERVADO'` por 10 dias corridos. Email + WhatsApp pro comprador, vendedor e corretor.

**Tracking:** `Reserva.pagamentoStatus='APROVADO'`, `Reserva.paidAt`, `Imovel.status='RESERVADO'`, `Reserva.expiraEm = paidAt + 10 dias`.

**Perguntas:**
- Quantos sinais aprovados nos últimos 30 dias? Total R$ travado?
- Taxa de aprovação MP (aprovado / iniciado)?
- Reservas próximas de expirar (< 48h)?

---

### 10. Diligência (offline)
**O que acontece:** análise documental (matrícula, certidões, dívidas, ITBI). Até 10 dias úteis. Corretor pode prorrogar reserva se diligência atrasar.

**Tracking:** `Imovel.status='EM_NEGOCIACAO'` (transição manual após reserva expirar com cliente ainda interessado), `Reserva.expiraEm` extensível.

**Perguntas:**
- Quantos imóveis em `EM_NEGOCIACAO` agora?
- Tempo médio em diligência?
- % de diligências que reprovam (perda)?

---

### 11. Escritura
**O que acontece:** lavratura no cartório (presencial ou e-notariado). Corretor marca `Reserva.status='CONVERTIDA'` no painel.

**Tracking:** `Reserva.status='CONVERTIDA'`, `Reserva.updatedAt`.

**Perguntas:**
- Quantas escrituras lavradas nos últimos 30/90 dias?
- Tempo médio entre sinal pago e escritura?

---

### 12. Registro CRI
**O que acontece:** registro no Cartório de Registro de Imóveis. Imóvel sai do mercado definitivamente.

**Tracking:** `Imovel.status='VENDIDO'`. Final do funil.

**Perguntas:**
- Quantos imóveis vendidos no mês?
- Receita confirmada (sum dos preços)?
- Taxa de fechamento total (vendido / sinal pago)?

---

## Mapeamento etapa → KPI do dashboard

| Etapa | KPI dashboard | Fórmula |
|---|---|---|
| 1. Captação | Imóveis ativos | `COUNT(Imovel WHERE status='DISPONIVEL')` |
| 2. Listagem | Imóveis sem foto | alerta |
| 3. Visita site | Funil etapa 1 + Top engajamento | `Imovel.viewCount delta` |
| 4. Lead | Funil etapa 2 + Conversão | `COUNT(Lead WHERE createdAt IN window)` |
| 5-7. Qualif/Visita | (V2 — fora do MVP) | — |
| 8. Proposta/Sinal | Sinais 30d donut | `COUNT(Reserva GROUP BY pagamentoStatus)` |
| 9. Sinal confirmado | Funil etapa 3 + Receita prevista + Ticket médio | `COUNT(Reserva WHERE APROVADO)` |
| 10. Diligência | Reservas EM_NEGOCIACAO | `COUNT(Imovel WHERE status='EM_NEGOCIACAO')` |
| 11. Escritura | Funil etapa 4 + Taxa fechamento | `COUNT(Reserva WHERE CONVERTIDA)` |
| 12. Registro CRI | Receita confirmada | `SUM(Imovel.preco WHERE VENDIDO)` |

---

## Eventos que o Backend deve registrar (instrumentação)

```ts
// Etapa 3 — view (chamar uma vez por session no PDP)
POST /api/imoveis/:slug/view

// Etapa 4 — lead
POST /api/leads { imovelId, nome, email, telefone, mensagem, consentLgpd: true }

// Etapa 8/9 — reserva (já no escopo Backend)
POST /api/reservas { imovelId, valorSinal }     // cria PENDENTE
POST /api/webhooks/mercadopago                  // muda pra APROVADO

// Etapa 10/11/12 — transições offline (admin only)
PATCH /api/admin/imoveis/:id { status: 'EM_NEGOCIACAO' | 'VENDIDO' | 'INATIVO' }
PATCH /api/admin/reservas/:id { status: 'CONVERTIDA' | 'CANCELADA', expiraEm? }
```

---

## Visualização sugerida (V2 — timeline no PDP painel)

Quando o corretor abre `/painel/imoveis/[slug]`, ver timeline visual com 12 etapas:

```
●───●───●───●───○───○───○───●───●───○───○───○
1   2   3   4   5   6   7   8   9  10  11  12

Captado em 12/03  •  Publicado em 13/03
Recebeu 47 visitas, 6 leads
1 sinal pago em 18/04 (R$ 425.000) — Reservado até 28/04
Em diligência: aguardando matrícula atualizada
```

Cada etapa clicável mostra detalhes (leads, reservas, eventos).
