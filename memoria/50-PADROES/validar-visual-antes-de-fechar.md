# Padrão — Validar visualmente antes de declarar fix de UI fechado

## Princípio

> "Type não é prova. Código que parece certo não é prova. Pra bug
> visual, **só o olho é prova**."

Bug de UI/CSS exige conferir com olho (devtools, preview deploy ou
prod) antes de marcar como resolvido. Raciocínio puro não basta —
CSS tem armadilhas silenciosas (display semantics, especificidade,
stacking context, computed styles) que o código parece certo e o
runtime ignora.

## Categoria de bug que exige validação visual

- Overflow / truncate / ellipsis
- Posicionamento (absolute, fixed, sticky, z-index, portal)
- Animação / transition / transform
- Responsividade em breakpoints
- Contraste / dark mode / cores semânticas
- Grid/flex layout estourando

## Workflow obrigatório

1. **Aplicar a mudança** no código.
2. **Identificar o caso edge mais agressivo** (nome mais longo, valor
   maior, item sem imagem, mobile 320px, etc.).
3. **Validar com olho** num desses canais:
   - Local: `npm run dev` + abrir browser no caso edge
   - Vercel preview deploy: `vercel deploy` (sem `--prod`)
   - Prod after push: aguardar deploy + Ctrl+F5
4. **Se passou** → commit com nota do caso testado:
   ```
   fix(ui): slot trunca nome longo com ellipsis

   Validado com "Kingston Fury Renegade DDR5 32GB (2x16GB) 7200MHz CL38"
   no breakpoint sm (sidebar 280px).
   ```
5. **Se não conseguiu validar** (sem servidor up, sem acesso prod):
   dizer ao user explicitamente — "apliquei mas não validei
   visualmente, confirma quando subir?". NÃO declarar fechado.

## Anti-padrão

- "Adicionei `truncate`, deve funcionar agora" — sem testar com nome longo
- "Mudei z-index pra 50, resolve" — sem testar com tooltip dentro de sticky
- "Coloquei `transition-all`, vai animar" — sem ver se o trigger dispara
- Fechar PR de fix UI sem screenshot ou referência ao caso testado

## Por que isso vale a pena

Cada "fix" não validado que volta como bug 2x:
1. Quebra confiança do user (ele já testou e gastou tempo abrindo issue)
2. Custa o dobro de iterações (commit + push + deploy + retest)
3. Cria sensação de "robô que não escuta" mesmo quando o código tá certo

## Caso real (Kore Tech 2026-04-28)

Bug: Slot do builder estourava com nome longo de produto.

Tentativa 1 (commit `ca3672b`): adicionei `h-14` + `truncate` num
`<motion.span>` e declarei resolvido. **Não validei em prod.**

Resultado: Gustavo testou com "Kingston Fury Renegade DDR5 32GB
(2x16GB) 7200MHz CL38" — slot continuou estourando. Span é
`display: inline`, text-ellipsis não rende.

Tentativa 2 (commit `18481ea`): troquei pra `<motion.div>`. Funcionou.

**Custo:** 2 ciclos commit/push/deploy quando 1 era suficiente. Quebra
de confiança evitável. Resposta do user: "a gente é foda e eu nao
quero erros como esse".

Ver lição relacionada: [[../30-LICOES/21-truncate-precisa-block]].

## Padrões relacionados

- [[../30-LICOES/20-validar-shape-backend]] — análogo pra backend:
  curl o endpoint antes de tipar
- [[../30-LICOES/21-truncate-precisa-block]] — caso específico de CSS
  silencioso (display: inline ignora overflow)
- [[motion-policies]] — animações respondem a ação clara
