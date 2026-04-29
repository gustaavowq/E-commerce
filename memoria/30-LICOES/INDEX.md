# 🚨 Lições aprendidas — Miami Store + Kore Tech

> Cada item foi um bug ou armadilha que custou tempo. **Antes de começar e-commerce novo, ler todos.**

## Miami Store (lições 1–10)

| # | Lição | Custo de descoberta |
|---|---|---|
| 01 | [[01-jwt-secret-placeholder]] | CRÍTICO — pentest forjou JWT admin com placeholder |
| 02 | [[02-cookie-cross-domain]] | ~2h — debug "login não funciona" |
| 03 | [[03-tsx-dependencies]] | ~30 min — seed falhava silenciosamente |
| 04 | [[04-seed-startcommand]] | Latente — sobrescreve edições admin |
| 05 | [[05-csp-connect-src]] | ~1h — "Erro inesperado" no login |
| 06 | [[06-env-files-multiplos]] | ~30 min — `.env` raiz vs `projetos/miami-store/infra/.env` |
| 07 | [[07-cookie-domain-railway]] | ~30 min — `.miami.test` quebrava cookie em prod |
| 08 | [[08-tsbuildinfo-gitignore]] | ~5 min — VSCode mostrava arquivo vermelho sempre |
| 09 | [[09-vercel-application-preset]] | ~10 min — Vercel reseta preset ao mudar Root Directory |
| 10 | [[10-suggested-variables-railway]] | CRÍTICO — Railway sugere placeholders inseguros |

## Kore Tech (lições 11–21)

| # | Lição | Custo de descoberta |
|---|---|---|
| 11 | [[11-backend-relations-objeto]] | CRÍTICO — "Não foi possível carregar essa página" em qualquer card |
| 12 | [[12-hardware-category-vs-slug]] | ~30 min — `/montar` mostrava "Sem produtos" em todas categorias |
| 13 | [[13-totalstock-faltando-detail]] | ~20 min — PDPs sempre "Sem estoque" mesmo com 18 unidades |
| 14 | [[14-zustand-persist-race]] | ~1h — "Comprar agora" + "Criar pedido" caíam em /cart vazio |
| 15 | [[15-mercadopago-pix-pre-requisitos]] | ~2h — 3 erros MP empilhados (env name, token, chave Pix) |
| 16 | [[16-vercel-rootdir-monorepo]] | ~1h — push em main não auto-deploya, build falha sem package.json |
| 17 | [[17-railway-source-rootdir]] | ~30 min — 5 deploys FAILED em sequência sem build |
| 18 | [[18-seed-imagens-upsert]] | ~30 min — URL nova de imagem ignorada em re-runs |
| 19 | [[19-repo-dedicado-por-projeto]] | LATENTE — monorepo subpath é frágil |
| 20 | [[20-validar-shape-backend]] | META-LIÇÃO — engloba 11/12/13 |
| 21 | [[21-truncate-precisa-block]] | ~2 commits — `truncate` em `<span>` ignora ellipsis silenciosamente |
| 22 | [[22-css-layer-com-import]] | ~3 commits — `@layer utilities` quebra quando arquivo importado via `@import` (PostCSS isolado) |
| 23 | [[23-sub-agents-token-limit]] | LATENTE — sub-agents podem hit limite mid-task; recover via git stash |
| 24 | [[24-redesign-visual-sozinho-nao-impressiona]] | META — admin precisa funcionalidades novas (Cmd+K, sort, insights), não só polish |
| 25 | [[25-vercel-deploy-quota]] | ~6h espera — Vercel free tier tem 100 deploys/dia, batch de agents bate quota |
| 26 | [[26-dados-invalidos-silencioso]] | CRÍTICO — 3h de fixes errados. "Dados inválidos" sem detalhe quando frontend manda campo write com shape de read. `.strict()` + formErrors descartado pelo middleware = invisível. |
| 27 | [[27-scroll-behavior-smooth-mata-mouse-roda]] | UX — `scroll-behavior: smooth` global mata mouse de roda. Nunca em html/body. |
| 28 | [[28-botao-nao-pega-click]] | UX CRÍTICO — botão parece clicar e não clica. Hitbox/overlay/motion sem pointer-events/`<button>` em `<a>`. |
| 29 | [[29-auth-cross-device]] | CRÍTICO — auth funciona no PC do dev, falha no PC do cliente. Cookie SameSite/trust proxy/CSP/in-app browser. Caso fundador: patrão. |
| 30 | [[30-diagnosticar-antes-de-fixar]] | META — bug repetido 2x após "fix" = diagnóstico errado. Pare, despache QA. |
| 31 | [[31-tipos-write-read-separados]] | CRUD — sempre `XxxWritePayload` separado de `XxxDetail`. Nunca `Partial<Detail>` em PATCH. |
| 32 | [[32-iteracao-em-camadas-curtas]] | META — 1 fix = 1 commit = 1 push = 1 validação. Sem batches gigantes. |
| 33 | [[33-design-tipo-lovable-vetado]] | DESIGN — sem hero "Build the future", sem 3 USP cards, sem cursor glow. POV não template. |

## Padrões 50-PADROES novos (2026-04-29)

- [[../50-PADROES/anti-animacoes-invasivas]] — lista negra de animações que viram vibe IA.
- [[../50-PADROES/copy-anti-IA]] — sem travessão, sem "Build the future", regras duras de voz.
- [[../50-PADROES/demo-seed-completo]] — todo produto com foto/estoque/preço/specs.

## Playbooks 10-PLAYBOOKS novos

- [[../10-PLAYBOOKS/auth-cross-device-smoke]] — matriz obrigatória pré-deploy.
- [[../10-PLAYBOOKS/kickoff-iteracao]] — bug-bash em prod ANTES de codar feature nova.

## Padrão de leitura

Cada lição tem:
- **Sintoma** (o que aparecia pro user)
- **Causa raiz** (file:line + explicação técnica)
- **Fix** (código exato)
- **Prevenção** (como NÃO repetir)

## Top 7 lições META que valem ouro

1. **[[20-validar-shape-backend]]** — engloba boa parte dos bugs
   crash. Type ≠ prova. Sempre curl o endpoint antes de tipar.
2. **[[30-diagnosticar-antes-de-fixar]]** — bug repetido 2x = diagnóstico
   errado. Pare de empilhar fixes. Despache QA pra reproduzir.
3. **[[32-iteracao-em-camadas-curtas]]** — 1 fix = 1 commit = 1 push = 1
   validação. Cada camada testável e revertível.
4. **[[19-repo-dedicado-por-projeto]]** — repo dedicado por projeto
   resolve 4 problemas simultaneamente (Vercel auto-deploy, Railway
   source, paths longos, build cache).
5. **[[14-zustand-persist-race]]** — flag `hydrated` é obrigatória em
   stores persist se houver redirect baseado no estado.
6. **[[../50-PADROES/validar-visual-antes-de-fechar]]** — análogo
   visual do #1: bug de UI exige conferir com olho (preview/prod)
   antes de declarar fechado. (Caso fundador: [[21-truncate-precisa-block]]; ver também [[28-botao-nao-pega-click]]).
7. **[[33-design-tipo-lovable-vetado]]** — design é POV, não template.
   Sem hero "Build the future", sem 3 USP cards icônicos, sem cursor
   glow. Apple/Linear references.
