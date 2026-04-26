# Playbook: Kickoff de Novo E-Commerce

> Sequência operacional do **Tech Lead** quando cliente diz "vamos criar e-commerce de [nicho]".

## Objetivo

Tirar o projeto do zero ao "loja online com produtos cadastrados, painel admin, deploy público" em **~3-4 horas** (não dias).

## Fase 0 — Pesquisa de nicho (~10-20 min, autônoma)

⚠️ **NOVA FASE.** Antes de perguntar qualquer coisa pro cliente, Tech Lead pesquisa o nicho sozinho.

### Por que

Cliente não precisa ser especialista no próprio nicho. Tech Lead chega com contexto pronto e cliente só **valida/ajusta** — não responde 7 perguntas no escuro.

### Como

1. Lê [[../70-NICHOS/INDEX|INDEX dos nichos]]. Se já tem template do nicho, parte dele (acelera 50%).
2. Usa **WebSearch** + **WebFetch** pra preencher lacunas:
   - Top 5 concorrentes BR (paleta, copy, UX referência)
   - Faixa de preço típica (entry/mid/premium)
   - Variações de produto (cor+tamanho? voltagem? sabor?)
   - Jargão do setor (Copywriter precisa)
   - Mood visual dominante (Designer precisa)
   - Canal de aquisição prioritário
   - Keywords SEO de cauda longa
   - Riscos regulatórios (ANVISA, Anatel, Inmetro?)
   - KPIs que importam pro nicho
   - Pains do comprador
   - Integrações comuns do setor
   - Sazonalidade
3. Escreve em `projetos/[slug]/PESQUISA-NICHO.md` seguindo [[../50-PADROES/pesquisa-nicho-template|template padrão]].

### Limite de tempo

- Nicho com template existente: **5-10 min**
- Nicho novo (sem template em 70-NICHOS): **15-25 min** (e cria o template no fim)

Se está demorando mais, está pesquisando o que não vai usar. Para.

### Critério de qualidade

A pesquisa serve se:
- ✅ Os 8 agentes conseguem trabalhar SEM o cliente precisar explicar mais nada do nicho
- ✅ ≥ 3 concorrentes específicos BR (não "Amazon")
- ✅ Faixa de preço com range (não "varia muito")
- ✅ ≥ 1 risco regulatório se aplicável
- ✅ Jargão específico (≥ 5 termos do setor)

## Fase 0.5 — Apresentar proposta + fechar gaps (~5 min)

Após pesquisa, manda **uma única mensagem** pro cliente — proposta validada, não interrogatório:

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
2. Cores principais (2 hex, ou decido a partir do mood que pesquisei)
3. WhatsApp do lojista (formato 5511999999999)
4. Conta MercadoPago + Cloudinary (ou faço com placeholder)
5. URL/domínio (ou .vercel.app por enquanto)

Confirma? Levanto os 8 agentes assim que aprovar.
```

Cliente responde em 1-2 mensagens. **Total Fase 0 + 0.5: ≤ 3 mensagens cliente↔IA**.

**NÃO perguntar (tudo já decidido em memória):**
- Stack tecnológica → ver [[../20-DECISOES/stack]]
- Estrutura de pastas → ver [[../20-DECISOES/estrutura-pastas]]
- Como vai ser o auth → ver [[../20-DECISOES/auth-pattern]]
- Como vai ser deploy → ver [[../20-DECISOES/deploy-pattern]]
- Detalhes de UX/microinterações → Designer decide
- Schema de tabelas → Backend decide com base no nicho + PESQUISA-NICHO.md

## Fase 1 — Setup automatizado (~15 min)

Tech Lead executa **sem perguntar**:

1. Cria estrutura de pastas conforme [[20-DECISOES/estrutura-pastas]]
2. Copia [[50-PADROES/docker-compose-template]] adaptando nome (`miami` → nova marca slug)
3. Copia [[50-PADROES/nginx-config]] com subdomínios `loja.test`, `admin.loja.test`, `api.loja.test`
4. Cria `.env` raiz e `src/infra/.env` (CRÍTICO: ambos sincronizados — ver [[30-LICOES/06-env-files-multiplos]])
5. Gera `JWT_SECRET` forte com `openssl rand -base64 48`
6. Backend boilerplate: Express + Prisma + Helmet + CORS + rate limit + auth flow padrão (ver [[50-PADROES/auth-flow]])
7. Schema Prisma base ([[50-PADROES/prisma-models-base]]) + customizações do [[70-NICHOS|template do nicho]]
8. Frontend boilerplate: Next.js 14 + Tailwind + cores da marca + Header com nav (Início/Loja/Sobre/Contato)
9. Dashboard boilerplate: mesmo Next.js + Sidebar + páginas vazias por enquanto
10. Cria `outros/shared/messages/` com mensagem inicial do Tech Lead pro time

## Fase 2 — Brief pra equipe (1 mensagem em `outros/shared/messages/`)

Template:

```markdown
# DE: Tech Lead | PARA: TIME | Data: YYYY-MM-DD

## Brief: e-commerce [marca]

**Nicho:** [nicho]
**Cliente:** [perfil]
**Faixa de preço:** [range]
**Variações típicas:** [variações]
**Cores marca:** [hex1, hex2]
**Integrações:** [lista]

## Decisões já tomadas (não perguntem)
Stack, auth, deploy, segurança, estrutura — ver memoria/20-DECISOES.

## Tarefas paralelas

### 01-backend
- Schema Prisma com produto + variações específicas do nicho
- Seed com 5–10 produtos exemplo (use referências do nicho)
- Rotas padrão: /products, /cart, /orders, /auth, /admin/*

### 02-designer
- Paleta a partir das cores [hex1, hex2]
- Mood do nicho (consultar 70-NICHOS/[nicho].md)
- Brand brief 1 página (voz, tom, do/don't)

### 03-frontend
- Header + Footer + Home com hero + categorias + featured + sobre teaser + contato teaser
- PDP com galeria, variações, cross-sell, reviews, share
- Carrinho + checkout (com cupom + frete grátis bar + WhatsApp opt-in)
- Páginas /sobre /contato /policies/*

### 04-data-analyst
- Painel KPIs do nicho (consultar 70-NICHOS/[nicho].md)
- Funnel + revenue chart + top products + cohort

### 05-devops
- Docker compose dev + Nginx subdomain routing
- Setup tunnels (Cloudflare quick tunnel) ou hosts file
- Documentar credenciais Railway/Vercel/Cloudinary/MercadoPago necessárias

### 06-qa
- Smoke E2E completo: login, cadastrar conta, comprar, ver no painel
- Pentest checklist (consultar 10-PLAYBOOKS/security-audit.md)
- Testes de IDOR, XSS, CSRF, rate limit
```

## Fase 3 — Sprint 1 paralelo (~2h)

Cada agente trabalha em paralelo no seu escopo. Tech Lead:
- Não interrompe
- Lê mensagens em `outros/shared/messages/` quando recebem update
- Resolve bloqueios cross-time imediatamente

## Fase 4 — Integração + bug bash (~30min)

1. Smoke local (docker compose up)
2. QA varre UX procurando sobreposições, links quebrados, fallbacks
3. Tech Lead consolida e dispara correções

## Fase 5 — Security audit (~30min)

Consultar [[10-PLAYBOOKS/security-audit]]. Não é opcional. Lições do Miami Store mostram que JWT placeholder, IDOR, XSS são comuns.

## Fase 6 — Deploy (~30min)

Consultar [[60-DEPLOY/railway-passo-a-passo]] e [[60-DEPLOY/vercel-passo-a-passo]]. Setar todas envs antes de subir. CRÍTICO ler [[30-LICOES/06-env-files-multiplos]].

## Fase 7 — Smoke prod E2E (~10min)

Cliente abre URL, faz login admin, cria 1 produto, fecha 1 pedido teste. Se não passar, voltar correção.

## Fase 8 — Acumular aprendizado (~10min, pós-deploy)

Tech Lead atualiza:

1. `memoria/70-NICHOS/[nicho].md` — concorrentes novos, jargão novo, integrações pedidas, cupons que performaram
2. `memoria/30-LICOES/` — qualquer bug/armadilha nova encontrada
3. `projetos/[slug]/JORNADA.md` — finaliza com aprendizados do projeto

**Por que essa fase é obrigatória:** sem ela, próximo projeto do mesmo nicho parte do mesmo ponto. Com ela, a máquina aprende.

---

## Métrica de sucesso

- **Mensagens user ↔ assistente:** ≤ 15 (com pesquisa front-load → cliente só valida)
- **Tempo até loja pública:** ≤ 4h
- **Defeitos no smoke prod:** 0 críticos, ≤ 3 médios
- **Perguntas redundantes ao user:** 0
- **Tech Lead pesquisou nicho antes de perguntar:** SIM (Fase 0 obrigatória)

Se passar disso, atualizar memória — significa que algum padrão não estava capturado.
