# Brand Brief — Kore Tech

> Um documento. Lê em 5 min. É a régua pra qualquer copy, UI, foto ou anúncio do Kore Tech.
> Mantido pelo Designer (Agente 02). Última atualização: 2026-04-26.

---

## 1. O que o Kore Tech é

E-commerce próprio de hardware (PC, componentes, monitores, periféricos) com 3 diferenciais que ninguém no BR tem juntos: PC Builder com checagem de compatibilidade visível, catálogo organizado por persona/uso (com FPS estimado por jogo), e lista de espera com notificação ativa contra paper launch.

Posicionamento: **loja de hardware que entende o cliente — sem jargão gratuito, sem "tecnologia de ponta", sem RGB cafona na UI.** Estética séria como Linear/Vercel, conhecimento profundo como meupc.net, vibe gamer respeitável como NZXT BLD.

Cliente-tipo:
- **Iniciante** que quer "rodar Valorant 240fps" e não sabe traduzir isso em peças (precisa de persona + builder didático).
- **Intermediário** que sabe o que quer mas tem medo de errar fonte ou comprar GPU que não cabe no gabinete (precisa de checagem visível).
- **Pro/criador** que monta workstation pra edição 4K ou IA local (precisa de specs completas + comparações).

---

## 2. Voz

| Eixo | Posição |
|---|---|
| Formalidade | **Informal mas técnico.** "Você", não "vocês". Não usa gíria forçada de gamer. |
| Confiança | **Confiante sem arrogância.** Mostra dado em vez de adjetivo. |
| Densidade | **Direto.** Frase curta. Verbo no início quando dá. |
| Sentimento | **Frio com calor humano.** Foca número, mas explica como humano explicaria pra amigo. |

### Faça vs Não faça (pareado, padrão Miami)

| Faça | Não faça |
|---|---|
| Roda Valorant a 240 FPS no 1080p high. | Tecnologia de ponta para experiência única. |
| Você monta. A gente checa as peças. | Builder revolucionário e next-level. |
| Fonte de 750W cobre essa GPU com folga. | Performance incrível pra gamers de verdade. |
| Em estoque. Chega em 2 dias em SP. | Disponível para entrega imediata em sua região. |
| Sem estoque. Te avisamos quando chegar. | Indisponível no momento, cadastre-se para alertas. |
| Pix com 5% off: R$ 6.175. | Pagamento via PIX com desconto exclusivo de 5%. |
| Trocou a fonte? Recalculei tudo. | Configuração otimizada com base em sua seleção. |
| Essa CPU pede AM5. Filtramos só placas que servem. | Selecione uma placa-mãe compatível com o processador. |
| Salvou. Compartilha o link com quem entende. | Build salva em sua conta. Compartilhe nas redes sociais. |
| Não rodou no FPS prometido? Devolve em 7 dias. | Garantia de satisfação com nossa política de devolução. |

### Palavras proibidas (regra dura, vale pra todo agente)

- **tecnologia de ponta** (vazia, anos 2000)
- **revolucionário / revolucionar** (overhyped)
- **next-level / nivel acima** (cliché internet 2018)
- **gamers de verdade** (excludente, infantil)
- **experiência única / inesquecível** (vazia)
- **performance incrível / brutal / monstro** (sem número, vale 0)
- **clientes vip / experiência premium** (não é luxo, é hardware)
- **incrível / sensacional / espetacular** (adjetivo solto)
- **tecnologia de última geração** (parece varejo grande dos anos 2000)
- **somos a referência em** (auto-elogio)

### Palavras a USAR (quando couberem com naturalidade)

`FPS`, `socket`, `wattagem`, `chipset`, `compatível`, `em estoque`, `monta`, `checa`, `roda`, `pede`, `cobre`, `avisamos`, `salva`, `Pix`, `parcela`, `frete`, `nota fiscal`, `garantia`, `original`.

### Regras visuais que afetam copy

- **Sem travessão (`—`) em UI/marketing.** Use vírgula ou divide a frase. (Regra cross-projeto da memória.)
- **Sem emoji em UI da loja.** Pode usar ícone SVG. Emoji só em email transacional descontraído (boas-vindas tipo).
- **Pix sempre primeiro** na lista de pagamento, com badge "5% off".
- **FPS / W / MHz / R$** sempre em `JetBrains Mono` (fonte mono) — números falam mais quando alinham.

---

## 3. Tom por contexto

| Contexto | Tom | Exemplo |
|---|---|---|
| **Hero da home** | Confiante, direto, 1 frase | "Monte certo. Jogue alto." |
| **PDP de PC montado** | Técnico-amigável, mostra o número | "RTX 4070 Super + Ryzen 7 7700. 240 FPS no Valorant 1080p high. Em estoque." |
| **PDP de componente** | Frio, técnico | "Socket AM5. TDP 105W. Pede placa B650/X670." |
| **Builder warning** | Curto, ação clara | "Fonte de 550W não cobre essa GPU. Sugestão: Corsair RM750x por +R$ 280." |
| **Builder erro crítico** | Direto, não dramatiza | "Esse cooler não cabe no gabinete (158mm vs 155mm). Troca o gabinete ou o cooler." |
| **Empty state** | Calmo, orienta | "Nenhum produto encontrado com esse filtro. Tira algum filtro ou veja todas as GPUs." |
| **Email confirmação pedido** | Formal-amigável, claro | "Pedido #1234 confirmado. Pagamento Pix recebido. Separamos pra envio em 24h." |
| **Email lista de espera disponível** | Urgência sem desespero | "Sua RTX 4080 chegou. Reservada por 24h. Compra aqui antes que acabe." |
| **404** | Curto, com saída | "Essa página saiu de estoque. Volta pra Home ou explora os builds prontos." |

---

## 4. Mood (3 palavras)

**Tech minimalista, cyan elétrico, denso técnico.**

Não é "gamer agressivo" (Razer cromado). Não é "Apple-clean" (vazio demais pro nicho). É **Linear/Vercel/NZXT BLD** — escuro, alta densidade de informação organizada, 1 cor de acento que pulsa, tipografia mono pra dado.

---

## 5. Identidade visual (resumo)

Detalhes em `design/tokens.css`, `design/tailwind.config.preset.ts`, `BUILDER-VISUAL-SPECS.md`, `COMPONENT-SPECS.md`, `LOGO-SPEC.md`.

| Item | Valor |
|---|---|
| Modo | Dark only (light mode NÃO existe na MVP, é anti-padrão visual no nicho) |
| Bg principal | `#0A0E14` (preto-azulado) |
| Acento único | `#00E5FF` (cyan elétrico) |
| Fonte UI | `Inter` (Google Fonts) |
| Fonte specs/números | `JetBrains Mono` (Google Fonts) |
| Foto produto | Closeup de componente iluminado, fundo escuro (matching o site) — RGB nas FOTOS sim, na UI não |
| Animação | Snappy (≤ 300ms padrão, 400ms máximo). Sem parallax, sem lottie pesado |
| Densidade | Alta. Cliente quer ver specs. Home pode respirar mais, PDP é denso. |

### Anti-padrões visuais (lei)

- ❌ RGB explosivo na UI (rosa + cyan + verde + roxo). RGB nas FOTOS sim, na UI **nunca**.
- ❌ Mais de 1 acento. Cyan é único. Não soma magenta, verde, dourado.
- ❌ Tipografia "gamer" (Orbitron, Audiowide, Press Start 2P). Inter passa "tech sério".
- ❌ Animação > 400ms. Sem parallax extremo, sem lottie pesado.
- ❌ Hover-to-reveal de info crítica em mobile (não tem hover em mobile).
- ❌ Texto cinza claro em fundo cinza escuro sem contraste WCAG AA.

---

## 6. Slogan e elementos de campanha

**Slogan provisório:** *"Monte certo. Jogue alto."*
Copywriter pode propor melhor (mantendo o ritmo curto e a ausência de adjetivo vazio).

**Tagline alternativa pra contextos longos:** *"Hardware sério, montado certo, no FPS que você queria."*

**USPs (sigla curta pra rotação em banners):**
- "Compatibilidade checada na hora"
- "FPS estimado em jogo real"
- "12x sem juros / 5% off no Pix"
- "Te avisamos quando voltar ao estoque"

---

## 7. Exemplos completos de copy ON-brand

### Hero da home
```
Monte certo. Jogue alto.

PCs montados pra Valorant 240 FPS, edição 4K, IA local.
Ou monta o seu — a gente checa as peças.

[Ver builds prontos]   [Montar do zero]
```

### Card de PC montado (PCBuildCard)
```
Kore Tech | Valorant Pro
RTX 4070 Super · Ryzen 7 7700 · 32GB DDR5

[FPS badge cyan] 240 FPS · Valorant 1080p high
[FPS badge cyan] 165 FPS · Fortnite 1440p competitivo

12x R$ 541 sem juros
Pix R$ 6.175 (5% off)

[Ver detalhes]
```

### Builder warning amigável
```
[ícone âmbar] Fonte insuficiente
Essa GPU pede 750W. Você selecionou 550W.

Sugestão: Corsair RM750x 80+ Gold por +R$ 280
[Trocar fonte]   [Ignorar]
```

### Empty state — busca sem resultado
```
Não achei nada com "RTX 5090 Ti".

Tenta: RTX 5090, RTX 4090, ou veja todas as GPUs.
```

### Notificação lista de espera
```
Sua GPU chegou.
RTX 4080 Super 16GB | R$ 7.999

Reservamos pra você por 24h.
[Comprar agora]
```

---

## 8. Exemplos completos de copy OFF-brand (não fazer)

```
[OFF] "Tecnologia de ponta para experiência incrível!"
       → vazio, "experiência incrível" não diz nada

[OFF] "Revolucione seu setup gamer com nosso configurador next-level"
       → 3 palavras proibidas em uma frase

[OFF] "Para gamers de verdade que exigem o máximo"
       → excludente, sem dado

[OFF] "Garantia premium e atendimento exclusivo VIP"
       → soa varejo grande dos anos 2000

[OFF] "Configurador inteligente otimizado por IA"
       → "IA" como buzzword, sem provar

[OFF] "Indisponível no momento. Cadastre-se em nossa lista de notificação"
       → corporativo demais, perde a oportunidade
```

---

## 9. Decisões já tomadas — não pergunta de novo

- **Sem travessão em UI/marketing** (vírgula ou split).
- **Sem emoji em UI da loja** (ícone SVG ok).
- **Pix sempre 1º** com badge 5% off.
- **Dark only** — não vai ter light mode na MVP.
- **1 acento cyan único** — não adicionar 2º cor de destaque.
- **Inter + JetBrains Mono** — não substituir por display gamer.
- **Pesos: Inter 400/500/600/700** — não usa 800/900 (passa cafona).

---

## 10. Quem usa este brief

- **Copywriter** (Agente 07): toda string da loja, descrição de produto, email transacional, blog.
- **Frontend** (Agente 03): valida microcopy, alt text, aria-label.
- **Growth** (Agente 08): copy de banner, anúncio, popup newsletter.
- **Designer** (Agente 02 — eu): qualquer banner, hero, ilustração futura.

Mudanças no brief disparam mensagem `DE-designer_PARA-todos_<data>-update-brief.md` com diff explícito.
