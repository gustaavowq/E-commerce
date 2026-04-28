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
| 06 | [[06-env-files-multiplos]] | ~30 min — `.env` raiz vs `src/infra/.env` |
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

## Padrão de leitura

Cada lição tem:
- **Sintoma** (o que aparecia pro user)
- **Causa raiz** (file:line + explicação técnica)
- **Fix** (código exato)
- **Prevenção** (como NÃO repetir)

## Top 5 lições META que valem ouro

1. **[[20-validar-shape-backend]]** — engloba boa parte dos bugs
   crash. Type ≠ prova. Sempre curl o endpoint antes de tipar.
2. **[[19-repo-dedicado-por-projeto]]** — repo dedicado por projeto
   resolve 4 problemas simultaneamente (Vercel auto-deploy, Railway
   source, paths longos, build cache).
3. **[[14-zustand-persist-race]]** — flag `hydrated` é obrigatória em
   stores persist se houver redirect baseado no estado.
4. **[[../50-PADROES/validar-visual-antes-de-fechar]]** — análogo
   visual do #1: bug de UI exige conferir com olho (preview/prod)
   antes de declarar fechado. Código que parece certo ≠ ellipsis
   rendendo. (Caso fundador: [[21-truncate-precisa-block]]).
5. **[[24-redesign-visual-sozinho-nao-impressiona]]** — em admin/painel,
   redesign visual SEM features novas é invisível. Pacote mínimo pra
   "wow": Cmd+K palette + Smart Insights + sortable DataTable + period
   comparison nos charts. Ver [[../50-PADROES/painel-admin-tier-1]].
