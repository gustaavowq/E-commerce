# Lição 33 — Design tipo Lovable / IA genérica é VETADO

> Custo de descoberta: **CRÍTICO PRA PERCEPÇÃO DE VALOR** — site que parece template de IA Lovable destrói credibilidade da marca, mesmo se as features funcionam.

## Sintoma do "Site Lovable"

Padrões reconhecíveis a olho humano:
- Hero com gradient pop genérico (purple-to-pink, blue-to-cyan) + headline tipo "Build the future of X".
- 3 USP cards icônicos lado a lado ("Fast", "Secure", "Beautiful") com ícone Heroicons.
- Scroll-jack ou parallax forçado no scroll.
- Cursor glow seguindo o mouse no viewport.
- Toast genérico "Something went wrong".
- Botão sem loading, delete sem confirm, formulário que não diz o que tá errado.
- Newsletter popup hostil em todo refresh.
- Espaçamento "Bootstrap default" — tudo igualmente afastado, nenhuma hierarquia.

User percebe em **5 segundos** que o site foi gerado, não pensado.

## Causa raiz

Quando o agente design não tem POV (point-of-view) sobre a marca, ele recai pro template médio dos data de treino. Resultado: visual estatístico, não autoral.

## Regra

> **Design é POV, não template.** Toda escolha visual responde "por que ESSA marca, ESSE produto, ESSE público?". Se a resposta é "porque fica bonito", é Lovable.

## Padrão Apple / Linear / Stripe (referência aprovada)

- **Hierarquia clara**: 1 elemento principal por viewport. Resto é silêncio.
- **Espaço respirável**: `py-32` em hero, não `py-12`. Tipografia grande, generosa.
- **Animação responde a ação**: hover, click, drag. NUNCA scroll-position ou cursor-position globais.
- **Cor com motivo**: paleta com ≤ 4 cores fora dos neutros, cada uma justificada (CTA, accent, danger, success).
- **Tipografia tier**: 1 sans pra UI, 1 display pra hero/títulos. Nunca 3+.
- **Componente padronizado**: card, botão, input — TODOS com mesma altura, padding, radius. Detalhe de carinho.

## Anti-padrões obrigatórios (não fazer NUNCA)

- ❌ **Cursor glow** seguindo viewport global (ver [[../50-PADROES/motion-policies]]).
- ❌ **Scroll-jacking** ou scroll-snap forçado.
- ❌ **`scroll-behavior: smooth`** global em html/body (ver [[27-scroll-behavior-smooth-mata-mouse-roda]]).
- ❌ **Parallax** no hero/sections.
- ❌ **3 USP cards icônicos** lado a lado se não foram pedidos pelo cliente. Visual de landing genérico.
- ❌ **Hero "Build the future of"** ou variantes ("Reimagining", "The next generation of").
- ❌ **Toast "Something went wrong"** sem detalhe acionável.
- ❌ **Skeleton de loading que não respeita o layout final** (cards de tamanho aleatório enquanto carrega).
- ❌ **Newsletter popup que abre toda visita** (cookie de dismiss 7d obrigatório — ver `feedback_qualidade_visual_gustavo`).
- ❌ **Travessão (`—`)** em copy de UI/marketing (vibe IA).

## Antídoto: 5 detalhes de carinho que removem o vibe IA

1. **Empty state ilustrado** com 1 frase específica do contexto ("Sua sacola tá vazia. Bora ver o que chegou?").
2. **Formulário com erro inline** explicando QUAL campo e POR QUÊ ("Email já cadastrado. [Entrar](/login) ou [Recuperar senha](/forgot)").
3. **Confirmação de ação destrutiva** com texto que repete o nome do alvo ("Excluir produto **Polo Lacoste Vermelha**? Ação não desfeita.").
4. **Loading state contextual** ("Salvando produto...", não só spinner).
5. **Microcopy autoral** em CTAs (não "Submit", "OK", "Confirmar"; em vez disso "Adicionar ao carrinho", "Pedir agora", "Quero esse").

## Auditoria de design (rodar antes de aprovar visual)

- [ ] Olho de leigo no hero por 5s. Pergunta: "que marca é essa?". Se a resposta é genérica ("startup tech qualquer"), refazer.
- [ ] Cada animação tem trigger explícito do user (hover, click, drag). Sem animação por scroll-position ou cursor-position.
- [ ] Toda cor além de neutro tem justificativa documentada em `brand-brief.md`.
- [ ] Pelo menos 3 dos 5 antídotos acima implementados.
- [ ] Passou no [[../50-PADROES/UX-UI-QUALIDADE]] inteiro.

## Lições relacionadas

- [[24-redesign-visual-sozinho-nao-impressiona]] — visual sem feature nova é invisível.
- [[../50-PADROES/UX-UI-QUALIDADE]] — distância máxima do Lovable.
- [[../50-PADROES/MOBILE-FIRST]] — anti-padrões mobile.
- [[../50-PADROES/motion-policies]] — quando animar.
- [[../50-PADROES/depth-pack-cinematic]] — depth pack aprovado (Kore Tech).
