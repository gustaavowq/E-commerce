# Lição 32 — Iteração em camadas curtas (1 fix = 1 commit = 1 push = 1 validação)

> Custo de descoberta: **META** — sessão de 30-60min sem mostrar resultado virou padrão de baixa eficiência.

## Sintoma

- Você acumula 8 mudanças em 1h. Commit gigante. Push. User testa. **Algum** dos 8 fixes regrediu — qual?
- Reverter o commit inteiro perde os 7 fixes que tavam ok.
- `git bisect` em commit gordo é tortura.
- User fica sem feedback por 60min, energia caí.

## Regra

> **1 fix = 1 commit = 1 push = 1 validação.**

Cada mudança coerente é commit isolado, push imediato, mensagem clara, expectativa de validação visual antes do próximo. Sem batch.

## Por que funciona

- **Bisect grátis**: cada commit é unidade testável. Bug volta em commit X, sabe exatamente onde.
- **User vibra**: vê resultado a cada 5-10min. Conta corrente emocional positiva (ver `feedback_tom_comemorar_vitorias`).
- **Reverter é cirúrgico**: `git revert <hash>` mantém o resto.
- **PRs de review (se aplicável)** ficam legíveis.

## Mensagens em camadas curtas

Cada turn da conversa: **3-6 linhas**. Não parágrafo cheio. Estado:

- O que acabei de fazer (1 frase).
- Resultado visível agora (1 frase, com URL/print se aplicável).
- Próxima camada (1 frase).

```
✅ Fix do botão favoritar: hitbox subiu pra 44px, motion.div com pointer-events.
🌐 Preview: https://miami.vercel.app/products/polo-lacoste — clica no coração do card 1 e vê.
👉 Próxima: ajustar o card escalado pra não cobrir vizinho.
```

## Anti-padrão

- ❌ "Vou agrupar essas 5 mudanças num commit só pra ficar limpo" — `git log` limpo é commit pequeno bem escrito, não commit gigante.
- ❌ "Termino tudo e mando pra você ver" — 30min sem sinal vital = perda de contexto, energia, e provavelmente regressão escondida.
- ❌ Mensagem 20 linhas explicando 5 coisas — divida em 5 mensagens de 4 linhas.

## Quando ABRIR exceção

- Refator estrutural (rename de pasta, mover arquivo) — 1 commit grande mas TUDO MV, zero edição. Validação é `git status` mostrar só renames.
- Regeneração de arquivo gerado (lock, schema) — não tem como dividir.

## Lições relacionadas

- [[../50-PADROES/validar-visual-antes-de-fechar]] — cada camada precisa ser validada visualmente antes da próxima.
- [[30-diagnosticar-antes-de-fixar]] — bug repetido 2x = pare de empilhar fixes.
