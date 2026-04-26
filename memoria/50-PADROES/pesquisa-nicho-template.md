# Template — Pesquisa de Nicho (output do Tech Lead)

> Formato padrão do `PESQUISA-NICHO.md` que o Tech Lead gera no início de cada projeto novo.
> Quem usa: **00-tech-lead** (escreve), **02-designer / 03-frontend / 07-copywriter / 04-data-analyst / 08-growth** (consomem).

## Por que existe

Antes deste padrão: cliente precisava saber tudo do próprio nicho pra responder o Tech Lead.
Depois: Tech Lead pesquisa, monta proposta validada, cliente só confirma/ajusta.

Cada projeto novo tem **um arquivo deste tipo** em `projetos/[slug-do-projeto]/PESQUISA-NICHO.md`.

## Formato (copiar e preencher)

```markdown
# Pesquisa de Nicho — [Nome do Projeto]

> Compilado pelo Tech Lead em [data]. Sources no final.

## 1. Visão geral do mercado

[2-3 frases: tamanho do mercado BR, tendência (crescendo/estável/saturando), maturidade da concorrência online]

## 2. Concorrentes top 5 (referência visual + UX)

| # | Nome | URL | Por que olhar |
|---|---|---|---|
| 1 | ... | https://... | (ex: ref de checkout, paleta, copy) |
| 2 | ... | https://... | ... |
| 3 | ... | https://... | ... |
| 4 | ... | https://... | ... |
| 5 | ... | https://... | ... |

## 3. Faixa de preço típica (BR)

| Segmento | Range | Observação |
|---|---|---|
| Entry | R$ X-Y | (ex: produto básico, sem bordado) |
| Mid | R$ Y-Z | mais comum |
| Premium | R$ Z+ | edição limitada, importado |

**Ticket médio do nicho:** R$ X
**Parcelamento típico:** [N]x sem juros / com juros depois de Nx

## 4. Variações de produto (pra schema Prisma)

Atributos que MUDAM entre SKUs:
- [ ] Cor
- [ ] Tamanho (P/M/G ou numeração)
- [ ] Voltagem (110/220)
- [ ] Sabor
- [ ] Validade
- [ ] Outro: ___

## 5. Jargão / glossário do setor

Termos que o público usa (Copywriter precisa pra não soar genérico):

| Termo | Significado | Onde aparece |
|---|---|---|
| ... | ... | (PDP, FAQ, blog) |

## 6. Mood visual dominante

[Descrever em 3-5 bullets. Ex:]
- Paletas: monocromáticas escuras / pastel suave / neon contrastante
- Fotografia: studio limpo / lifestyle / ambiente
- Tipografia: serif elegante / sans bold / display
- Densidade: minimalista / informacional rica
- Referências fora do BR (se aplica): [marcas internacionais]

## 7. Canais de aquisição (ordem de prioridade)

1. **[Canal]** — Por quê: ... (ex: Instagram — público é visual, ticket alto)
2. **[Canal]** — ...
3. **[Canal]** — ...

## 8. SEO — Keywords de cauda longa

Pra Growth implementar em metadata + blog:

- "[keyword 1]" (intent: comparação)
- "[keyword 2]" (intent: tutorial)
- "[keyword 3]" (intent: trust — "como saber se X é original")
- "[keyword 4]" (intent: tabela / referência — "tabela de medidas X")

## 9. Regulamentação / legal

⚠️ Itens que se ignorados quebram o projeto:

- [ ] ANVISA (cosméticos, alimentos, suplementos)
- [ ] Anatel (eletrônicos com radiofrequência)
- [ ] Inmetro (brinquedos, equipamento)
- [ ] Nota fiscal eletrônica (todos)
- [ ] Lei do consumidor — direito de arrependimento 7 dias (todos)
- [ ] LGPD — banner cookie + privacy policy (todos)
- [ ] Outro do nicho: ___

## 10. KPIs específicos do nicho (pro painel)

Pra Data Analyst priorizar no dashboard:

| KPI | Por quê neste nicho |
|---|---|
| ... | ... |

## 11. Pains do comprador (pro Frontend + Copywriter)

| Dor | Como a loja aborda |
|---|---|
| Medo de fake | Selo de autenticidade, foto de NF, "vem com caixa" |
| Tamanho errado | Tabela de medidas, "compra 1 acima se entre tamanhos" |
| Frete caro | Free shipping bar, cupom FRETE10 |
| Devolução difícil | Política clara em /policies/troca |
| ... | ... |

## 12. Integrações comuns

| Integração | Quando precisa |
|---|---|
| Mercado Envios | Frete competitivo, tracking auto |
| Bling / Tiny | NFe automática (faturamento > R$ 10k/mês) |
| Programa de pontos (Loymee, Bossa) | Recompra alta (beleza, alimentação) |
| Cloudinary | Sempre (template padrão) |
| MercadoPago | Sempre (template padrão) |
| Resend | Sempre (template padrão, ativa quando cliente entregar conta) |

## 13. Sazonalidade

| Período | Pico/Vale | Cupom sugerido |
|---|---|---|
| Black Friday (Nov) | Pico forte | BLACK40 |
| Natal (Dez) | Pico moderado | NATAL20 |
| Janeiro | Vale | (cupom de "esvazia estoque") |
| Dia das mães (Maio) | Pico se aplicável | MAES15 |
| ... | ... | ... |

## 14. Sources (URLs consultadas)

- https://...
- https://...
- https://...

---

**Status:** Rascunho / Validado pelo cliente em [data]
```

## Como o Tech Lead preenche

### Ferramentas que usa

- **WebSearch** — primeiro pulse: "[nicho] e-commerce Brasil mercado", "melhores lojas online de [nicho] BR"
- **WebFetch** — abre top concorrentes, extrai paleta visual, copy, estrutura de PDP
- **Memory** — `memoria/70-NICHOS/[nicho].md` se já existe (acumula entre projetos)

### Critério de qualidade

Pesquisa serve se:
- ✅ Os 8 agentes conseguem trabalhar SEM perguntar mais nada do nicho ao cliente
- ✅ Identificou ≥ 3 concorrentes específicos do BR (não genérico tipo "Amazon")
- ✅ Faixa de preço com range específico (não "varia muito")
- ✅ Citou ≥ 1 risco regulatório se aplicável
- ✅ Citou jargão específico (não "as pessoas usam termos do mercado")

### Quanto tempo gastar

- Nicho que já tem template em `memoria/70-NICHOS/`: **5-10 min** (lê + atualiza com novidades)
- Nicho NOVO sem template: **15-25 min** (pesquisa do zero + cria template)

Acima disso = está pesquisando o que não vai usar. Para.

## Como apresentar pro cliente

Após pesquisa, Tech Lead manda mensagem ÚNICA:

```
Pesquisei [nicho]. Aqui meu entendimento — corrige o que tiver errado:

📊 Mercado: [resumo 1 linha]
🏆 Concorrentes referência: [3 nomes com URL]
💰 Ticket médio: R$ X (parcelamento Nx)
📦 Variações típicas: [lista]
🎨 Vibe visual: [descrição curta]
📣 Canal principal: [canal]
⚠️ Atenção: [risco regulatório se houver]

Plano:
- Loja com foco em [pain principal]
- Cupons [BEMVINDO5, PIXFIRST, FRETE10] desde dia 1
- KPIs no painel: [3-4 KPIs]
- Integrações iniciais: [Cloudinary, MP, ...]

Pra fechar, preciso de:
1. Nome / logo (ou decido)
2. Cores (ou decido)
3. WhatsApp do lojista
4. Conta MercadoPago + Cloudinary (ou faço com placeholder)
5. URL/domínio (ou .vercel.app)

Confirma? Levanto os 8 agentes assim que aprovar.
```

Cliente responde em 1-2 mensagens. Comparado às 7 perguntas no escuro do fluxo antigo.

## Acumulação entre projetos

Após o projeto **terminar e estar deployado**, Tech Lead atualiza `memoria/70-NICHOS/[nicho].md` com:

- Concorrentes novos descobertos
- Jargão novo
- Integrações que o cliente pediu (vira opção pro próximo)
- Pains que apareceram em pós-venda
- Cupons que performaram melhor

Próximo projeto do mesmo nicho parte de uma base mais rica — a máquina aprende.

## Ver também

- [kickoff-novo-ecommerce](../10-PLAYBOOKS/kickoff-novo-ecommerce.md) — onde Fase 0.5 (esta pesquisa) se encaixa
- [70-NICHOS/INDEX](../70-NICHOS/INDEX.md) — templates por vertical (input desta pesquisa)
- [.claude/skills/ecommerce-tech-lead/SKILL.md](../../.claude/skills/ecommerce-tech-lead/SKILL.md) — quem executa
