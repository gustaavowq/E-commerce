# Playbook: Bug Bash UX

> Varredura sistemática antes do release. Pega o que typecheck não pega: HTML inválido, sobreposição visual, dead buttons, edge cases.

## Quando executar

- ✅ Antes do release pra cliente final ver
- ✅ Após mudanças grandes em layout/Header/Footer
- ✅ Após adicionar feature nova que mexe em fluxo principal

## Estrutura: 1 agente investigador (frontend+QA combinado) + tech lead síntese + 1 corretor

## Brief pro investigador

Mensagem em `outros/shared/messages/DE-techlead_PARA-frontend-qa_<data>-bug-bash.md`:

```markdown
# Varredura UX — loja + painel

URLs:
- LOJA: https://...
- PAINEL: https://...
- Admin: <email> / <senha>

Páginas pra checar (loja):
- / (home)
- /products + /products?category=X
- /products/[slug] (PDP completa)
- /cart
- /checkout (precisa logar)
- /sobre, /contato
- /auth/login, /auth/register
- /policies/privacy, /policies/terms

Páginas pra checar (painel):
- /login (sem cookie)
- /, /orders, /products, /coupons, /settings (autenticado)

Heurísticas obrigatórias:
1. **HTML inválido**: `<a>` envolvendo `<button>`, `<div>` solto em `<ul>`, `<button>` sem onClick (dead)
2. **Sobreposição mobile**: badges colidindo em cards, header tampando hero, etc
3. **Imagens fallback**: classe `from-surface-2` ativa = produto sem foto
4. **Links quebrados**: mailto sem destino, tel inválido, anchor #foo sem destino
5. **Aria-labels**: ícones-botão têm? Sem isso quebra leitor de tela
6. **Touch target**: botões mobile <44px (use `touch-44` utility)
7. **Hover states**: feedback visual em todos os interativos
8. **Empty states**: páginas sem dados têm mensagem amigável?
9. **Mobile UA**: testar com user-agent mobile (PowerShell `-Headers @{'User-Agent'='iPhone'}`)
10. **Voz da marca**: brand-brief diz "sem travessão em copy"? Verificar

Reporta em formato:
- Críticos (quebra função)
- Médios (atrapalha mas funciona)
- Pequenos (polimento)

Cada item: arquivo:linha + 1 frase descrição + fix em 1 linha.
NÃO modifique código.
```

## Síntese tech lead

Em mensagem nova `DE-techlead_PARA-frontend_<data>-fixes-ux.md`, lista priorizada com fix sugerido pra cada item.

## Brief pro corretor

```markdown
# Corrigir N bugs UX

NÃO mexer em src/backend/, src/dashboard/middleware (se houver), src/frontend/auth/AuthForm.

Itens:
1. [arquivo:linha] descrição. Fix sugerido: ...
...

Workflow:
1. Read cada arquivo
2. Aplicar correção
3. Typecheck no fim
4. Reportar arquivo:linha do que mudou
```

## Re-validação (QA)

Smoke das URLs corrigidas + verificação no HTML servido (PowerShell):

```powershell
$h = (Invoke-WebRequest -Uri 'https://...' -UseBasicParsing).Content
$h.Contains('<script>alert')   # XSS
$h -match 'aria-label'         # acessibilidade
([regex]::Matches($h, '<img[^>]*>')).Count  # imagens
```

## Catálogo de bugs UX comuns (Miami Store achou)

Esses VOLTAM em e-commerce novo se não tomar cuidado:

| # | Bug | Onde | Fix |
|---|---|---|---|
| 1 | `<Link>` envolvendo `<button>` (heart) | ProductCard | `stopPropagation` no onClick do button |
| 2 | SearchBar oculta em mobile | Header | tirar `hidden sm:flex` da lupa |
| 3 | `<div>` em `<ul>` no cart | CartPage | trocar por `<li>` ou mover pra fora |
| 4 | Botão "Tabela de medidas" sem onClick | PDP | implementar modal `<dialog>` |
| 5 | Aside sticky inflado pela descrição | PDP | mover `<details>` Descrição pra fora do grid sticky |
| 6 | Filtros duplicados na PLP | products/page | tirar 1 dos 2 `<Filters>` |
| 7 | Fotos não aparecem | ProductCard, PDP | fallback inline (sem `placehold.co` externo) |
| 8 | Travessões em copy | home, sobre, contato | regex substituir por vírgula/ponto |
| 9 | Emoji em copy | Footer | tirar (viola brand-brief) |
| 10 | Tabela painel sem min-width | orders, products | `min-w-[768px]` |

## Anti-padrões que vamos PREVENIR

- ❌ Usar `placehold.co` ou outro CDN externo como fallback de imagem (cai e vira tela branca)
- ❌ Botão dead (sem onClick/href)
- ❌ Multi-line travessão em copy (viola brand-brief)
- ❌ Emoji em UI/marketing (mesmo motivo)
- ❌ HTML semanticamente inválido (`<div>` em `<ul>`, `<button>` em `<a>`)
- ❌ Touch targets < 44px em mobile
