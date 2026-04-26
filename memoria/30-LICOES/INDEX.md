# 🚨 Lições aprendidas — Miami Store

> Cada item foi um bug ou armadilha que custou tempo. **Antes de começar e-commerce novo, ler todos.**

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

## Padrão de leitura

Cada lição tem:
- **Sintoma** (o que aparecia pro user)
- **Causa raiz** (file:line + explicação técnica)
- **Fix** (código exato)
- **Prevenção** (como NÃO repetir)
