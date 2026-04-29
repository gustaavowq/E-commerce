# 23 — Sub-agents podem bater limite de tokens da API mid-task

## Sintoma

Sub-agent dispatchado via Task tool retorna sumário curto:
```
You've hit your limit · resets 2:40am (America/Sao_Paulo)
```

E não posta a mensagem final esperada em `projetos/[slug]/messages/`. **Mas pode ter deixado código no working tree** antes de bater o limite.

## Causa raiz

Limite de tokens da Anthropic API é **shared entre o agent pai e os sub-agents**. Em missão grande com múltiplos agents em paralelo (5+ agents simultâneos rodando 1500-2000 palavras de prompt + ferramentas pesadas) o limit acaba antes deles terminarem.

## Estratégia de recovery

1. **Antes de declarar agent perdido**, checar `git status` + working tree do projeto. Sub-agents commitam diretamente OU deixam arquivos não-commitados.
2. **Se houver arquivos órfãos** (criados/modificados mas não commitados), **consolidar e commitar manualmente** com Co-Authored-By apropriado.
3. **TS check antes de commit** pra confirmar que o código entregue não quebra.

## Como evitar / mitigar

- Em missões muito grandes, dispatch agents **em ondas de 3-4 em paralelo** (não 6-8 simultaneous).
- Briefings concisos (~600-800 palavras max em vez de 1500+).
- Estabelecer NA INSTRUÇÃO: "Se bater limite, deixe o último arquivo PARCIALMENTE pronto se necessário — mas sempre TS-clean."
- Pra missões críticas, dividir frontend (worker mais caro) em 2-3 agents menores em vez de 1 mega.
- Tech-lead deve **reservar capacidade** pra rodar QA + consolidação no final — não dispatchar workers até a borda do limite.

## Caso real

Kore Tech 2026-04-28 redesign do painel: 5 worker agents dispatchados (designer, data-analyst, copywriter, backend, growth). Designer + Growth completaram. Data-analyst + Copywriter + Backend bateram limite, **mas deixaram artefatos sólidos** no working tree:
- `admin-copy.ts` (629 LOC)
- `admin-kpis-v2.ts` (752 LOC)
- `backend dashboard.ts` refactor (+182/-88) + `cache.ts`

Tech-lead recuperou via `git stash pop`, validou TS, consolidou em commit único `65a0a4a feat(painel): consolida trabalho dos 3 agents`.

Custo evitado: ~50 min de re-trabalho.

## Memória relacionada

Ver `feedback_painel_via_tech_lead` (memória pessoal) — hierarquia user → tech-lead → 8 agents.
Ver `feedback_usar_todos_agents` (memória pessoal) — paralelismo é a regra.
