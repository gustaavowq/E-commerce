# Lição 30 — Diagnosticar antes de fixar (meta-lição)

> Custo de descoberta: **3+ commits "fix" em sequência sem resolver** — sintoma de diagnóstico errado mascarado por urgência.

## Sintoma

- User reporta um bug. Você fixa. User volta dizendo "ainda dá".
- Você fixa de novo, jeito diferente. User: "ainda dá".
- Após 3 tentativas, ou você acerta por sorte ou enterra a feature em bandagens.

## Causa raiz

**Você tratou o sintoma, não a causa.** Sem reproduzir o bug com olho próprio (ou via QA), o "fix" é palpite vestido de código.

## Regra

> Mesmo bug reportado **2x** depois de "fix" = diagnóstico errado.
> **Pare de codar. Despache QA pra reproduzir antes de mais bandagem.**

## Protocolo correto

### 1ª vez que o bug aparece
- Ler relato do user com calma. Pedir screenshot/print/URL específica.
- Reproduzir local OU em prod (pelo menos 1).
- Identificar arquivo:linha que causa.
- Fix mínimo + commit explicando QUAL é a causa.

### 2ª vez (user diz "ainda dá")
- **NÃO codar mais.** O fix anterior tratou outro bug.
- Despachar QA com prompt: "reproduz exatamente o que o user descreveu, traz logs/console/network".
- QA volta com causa-raiz observada (não suposta).
- Aí sim, novo fix.

### 3ª vez (raro mas acontece)
- Rolar back todos os "fix" anteriores. Eles podem estar mascarando o problema.
- Re-arquitetar a feature do zero se necessário.

## Casos-fundadores

- **Saga "Dados Inválidos"** ([[26-dados-invalidos-silencioso]]) — 3h de fixes errados porque a causa real (Zod `.strict()` + `formErrors` descartado pelo middleware) era invisível pra type-check.
- **Truncate em `<span>`** ([[21-truncate-precisa-block]]) — 2 commits "fix" que não fixavam porque o ellipsis nunca renderizava em inline element.

## Sinais que você tá em diagnóstico errado

- 🚨 "Talvez seja..." em commit message.
- 🚨 Mesmo arquivo editado 2x com lógica oposta.
- 🚨 User repetindo o relato palavra por palavra.
- 🚨 Fix que adiciona check defensivo sem entender por que o caso "impossível" aconteceu.

## Anti-padrão

- ❌ "Vou tentar mais um fix rápido" — se "rápido" virou turn 3, o problema não é simples.
- ❌ Adicionar `console.log` em prod e esperar repetir — diagnostique local com repro confiável.
- ❌ Marcar "resolved" sem confirmar com user que o bug sumiu pra ele (no PC dele, não no seu).

## Lições relacionadas

- [[20-validar-shape-backend]] — diagnóstico via curl real, não inferência.
- [[26-dados-invalidos-silencioso]] — caso fundador.
- [[../50-PADROES/validar-visual-antes-de-fechar]] — análogo visual.
