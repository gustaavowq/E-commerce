# Playbook — Kickoff de iteração (bug-bash em prod ANTES de codar)

> Aprovado pelo Gustavo: "iteração nova começa por smoke test em produção, ataca achados na ordem de severidade visível".

## Princípio

> **Não codar sem ver.** Toda iteração nova (sprint 2, polishing, "vamos melhorar a Miami") começa com 30-60min de bug-bash em prod. Sem essa etapa, você fixa o que IMAGINA que tá quebrado, não o que TÁ.

## Quando rodar

- Início de qualquer iteração nova num projeto JÁ deployado.
- Após pausa > 1 semana sem mexer no projeto.
- Antes de começar feature grande ("vamos adicionar X") — se a base tá quebrada, X vai herdar.

## Sequência (30-60min)

### Passo 1 — Setup (5min)
- Abrir o site em **navegador anônimo** (sem cache/cookies/extensão).
- Abrir DevTools (F12) com Console e Network visíveis.
- Ter pronto: notepad pra anotar achados, screenshot tool, gravador de tela.

### Passo 2 — Tour da loja (15min)
Caminhar pelas páginas como se fosse cliente. NÃO consertar nada agora — só anotar.

- [ ] **Home**: scroll completo. Hero, sections, CTAs. Click em todos os botões visíveis.
- [ ] **Categoria/PLP**: filtros funcionam? Sort funciona? Paginação? Cliques em produto abrem PDP?
- [ ] **PDP**: imagens carregam? Variações selecionáveis? Add to cart? Botão favoritar pega click? Cross-sell?
- [ ] **Cart**: ajustar quantidade, remover item, aplicar cupom, frete grátis bar atualiza?
- [ ] **Checkout**: form valida? CEP busca endereço? Pix gera QR? Voltar pra cart e tudo persiste?
- [ ] **Auth**: criar conta nova, login, logout, recuperar senha (mandar email de teste).
- [ ] **Account**: ver pedidos, atualizar dados, favoritos.
- [ ] **404**: digite URL inexistente. Página de erro é amigável?

### Passo 3 — Tour do painel admin (10min)

- [ ] Login admin. Dashboard carrega com KPIs?
- [ ] Lista de produtos — filtros, sort, bulk action.
- [ ] Edit produto — salvar UM campo só. `200 OK`? Se "Dados inválidos", crítico (ver [[../30-LICOES/26-dados-invalidos-silencioso]]).
- [ ] Lista de pedidos — mudar status, filtrar.
- [ ] Cupons — criar cupom novo, ativar/desativar.
- [ ] Settings — atualizar info da loja.

### Passo 4 — Mobile real (10min)
Pegar **smartphone real** (não DevTools emulator), abrir loja em 4G.

- [ ] Hero respira ou tá esmagado?
- [ ] Touch targets >= 44px? Botões pegam click?
- [ ] Scroll suave (não engasga, não "puxado")?
- [ ] Header sticky funciona, menu mobile abre?
- [ ] Cart drawer abre, fecha?
- [ ] Checkout completo funciona em mobile?

### Passo 5 — Anotar achados ordenados (10min)

Pra cada bug encontrado, anotar:
- **URL** específica.
- **Sintoma** (o que vi, com print se possível).
- **Severidade** (1-3): 1 = bloqueia compra, 2 = quebra confiança, 3 = polish.

Exemplo:
```
1. /products/polo-lacoste — botão "Adicionar ao carrinho" não pega click [SEV 1]
2. /cart — frete grátis bar não atualiza ao adicionar 2º item [SEV 2]
3. /sobre — espaçamento entre seções pequeno demais [SEV 3]
```

## Atacar achados (nova fase, depois do bug-bash)

Ordem: **SEV 1 antes de SEV 2 antes de SEV 3**. Mesmo que SEV 3 seja "fácil de fixar". Quebra de confiança em SEV 1 elimina o resto.

Cada fix segue [[../30-LICOES/32-iteracao-em-camadas-curtas]]: 1 fix = 1 commit = 1 push = 1 validação visual.

## Tempo médio

- Bug-bash completo: 45-60min (pra catálogo de 20+ produtos).
- Pode ser despachado pro **QA agent** com o playbook como prompt.

## Anti-padrão

- ❌ "Vou começar adicionando feature X" sem bug-bash. Você herda bugs invisíveis e gasta tempo dobrado depois.
- ❌ Bug-bash só em desktop. Mobile é onde 70% dos clientes vivem.
- ❌ Bug-bash com cache do dev (login antigo, dados de seed cached). Sempre janela anônima.

## Lições relacionadas

- [[bug-bash-ux]] — catálogo de bugs UX recorrentes.
- [[../30-LICOES/30-diagnosticar-antes-de-fixar]] — diagnose antes de fix.
- [[../30-LICOES/32-iteracao-em-camadas-curtas]] — execução das fixes.
- [[../50-PADROES/validar-visual-antes-de-fechar]] — validar com olho, não com tsc.
