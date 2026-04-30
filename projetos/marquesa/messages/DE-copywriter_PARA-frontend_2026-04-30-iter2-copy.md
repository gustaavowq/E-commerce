# DE Copywriter PARA Frontend — Iteração 2 (2026-04-30)

Resposta direta ao bug-bash da iter 1. Tudo já está no `copy/microcopy.json`. Abaixo, o raciocínio + o que precisa ser plugado em qual arquivo.

Restrições mantidas: zero travessão, zero exclamação, zero palavra vetada do brand-brief §8, zero emoji em UI da loja.

---

## 1. Hero — 3 propostas + escolha

Hero atual ("Imóveis com curadoria." + "Apartamentos, casas e coberturas em endereços selecionados de São Paulo.") falha em duas frentes: descreve o canal (somos uma imobiliária com curadoria, ok, e daí?) e enumera categoria (apartamento/casa/cobertura, qualquer site faz). O manifesto §1 diz "não vende metro quadrado, cura endereço". O hero precisa carregar essa tensão concreta.

### PROPOSTA A — declarativa, manifesto comprimido (ESCOLHIDA)

```
Eyebrow:   CURADORIA · 2026
Título:    Endereço antes de metragem.
Subtítulo: Apartamentos, casas e coberturas escolhidos um a um, em bairros que envelhecem bem em São Paulo e Rio.
```

Por quê: 4 palavras no título carregam a tese inteira da Marquesa em frase declarativa. "Endereço antes de metragem" é um deslocamento concreto, não slogan, contraria o reflexo do mercado (m² é o primeiro número que todo portal mostra). Subtítulo entrega informação útil (categorias, geografia) e sustenta com a metáfora do brief ("bairro que valoriza no silêncio" virou "bairros que envelhecem bem"). Frase única, 19 palavras: dentro do limite, leitura num fôlego.

### PROPOSTA B — editorial, mais atmosférica

```
Eyebrow:   SÃO PAULO · RIO · CURADORIA
Título:    Vendemos endereço, não metro quadrado.
Subtítulo: Cada imóvel passa pelo mesmo crivo de arquitetura, vizinhança e documentação antes de chegar até você.
```

Por quê: posição declarada na primeira pessoa do plural, herda diretamente o verbo do manifesto. Mais combativa que a A, comunica princípio explicitamente. Subtítulo vira mini-manifesto operacional (o que a curadoria faz, em três palavras encadeadas). Risco: "vendemos não" tem leve eco publicitário "we do X, not Y", que é pattern conhecido demais.

### PROPOSTA C — concreta, citação implícita do imóvel

```
Eyebrow:   EM CATÁLOGO AGORA
Título:    Cobertura em Higienópolis. Casa em Vila Madalena. Apartamento em Ipanema.
Subtítulo: Doze imóveis no catálogo. Nenhum por acaso.
```

Por quê: a mais editorial das três, parecida com a vitrine física de uma galeria. Hero vira manchete em vez de slogan; o subtítulo é a tese em duas frases curtas. Funciona muito bem se a foto do hero for forte. Risco: precisa atualizar manualmente os bairros (ou puxar dinâmico do destaque). Para MVP estático pode ficar bom; em catálogo dinâmico exige lógica adicional. Por isso fica como reserva.

### Decisão

Entrou no JSON a **PROPOSTA A**. É a que melhor balanceia carga conceitual (ataca o reflexo de m²) com legibilidade no primeiro segundo. As outras duas ficam guardadas; trocar é só editar `hero.titulo` + `hero.subtitulo` no `microcopy.json`.

Plus: incluí `hero.eyebrow` no JSON também (estava hardcoded no `Hero.tsx`). Frontend pode passar a consumir.

---

## 2. Curadoria sutil na home — 3 propostas + escolha

Pedido do Gustavo: comunicar curadoria sem "abrangência", frase curta refinada. A frase precisa fazer o leitor entender que a triagem é real (não é vitrine "curada" no sentido genérico de marketing).

### PROPOSTA A — método em 3 vetores (ESCOLHIDA)

```
Eyebrow:  MÉTODO
Frase:    Cada imóvel passa por arquitetura, vizinhança e documentação antes de entrar. O que não passa, fica de fora.
```

Por quê: 22 palavras, duas frases. Primeira lista os três crivos concretos (não diz "curamos"; diz o que curar significa em ação). Segunda fecha por exclusão, que é o ponto-chave da boutique: o filtro existe porque algo sai dele. Mais factual que aspiracional, alinhado com brief §8 ("descritivo antes de adjetivo").

### PROPOSTA B — proporção declarada

```
Eyebrow:  CURADORIA
Frase:    Avaliamos cinquenta imóveis para entrar com um. O que está aqui passou nesse corte.
```

Por quê: número torna concreto o filtro ("cura, não lista"). Mais punchy, quase confronto. Risco: número precisa ser verdade ou ser plausível como escala da boutique; se a curadoria for menos rigorosa, vira propaganda enganosa. Recomendo só usar se o cliente confirmar que o filtro tem essa ordem de grandeza.

### PROPOSTA C — silêncio como princípio

```
Eyebrow:  PRINCÍPIO
Frase:    O que está em catálogo, está porque cabe. O que não cabe, não está aqui.
```

Por quê: a mais editorial, ecoa o tom de manifesto §1 ("rigor", "silêncio", "nada sobra"). Funciona como inscrição em pedra. Risco: leitor casual pode não pegar a tese de primeira; é mais lenta na decodificação.

### Decisão

Entrou no JSON a **PROPOSTA A** (`home.curadoria_intro` + `home.curadoria_intro_eyebrow`). É a que entrega informação concreta (três critérios nomeados) e fecha com a regra de exclusão. Mantém tom factual, sem abstração.

---

## 3. Editorial topos/rodapés — texto pronto

Tudo já está no JSON. Chaves criadas:

### catalogo.intro_editorial
> "Entram aqui apartamentos, casas e coberturas com matrícula limpa, fotografia feita em visita e ficha técnica conferida pela equipe. Faixas de preço variam, o critério não."

Ângulo deliberadamente diferente da home: a home fala do **porquê** (método); o catálogo fala do **o que entra** (critério prático: matrícula, foto, ficha). Última frase fecha com a invariante ("preço varia, critério não"), que reforça a tese boutique sem repetir vocabulário.

### catalogo.outro_editorial + catalogo.outro_editorial_cta
> "Não encontrou o que procurava? A curadoria também trabalha com pedidos sob encomenda."
> CTA: "Falar com a curadoria"

Ponto de saída humano para quem chegou ao fim do grid sem fechar. Comunica que a Marquesa também opera sob demanda (captação ativa), sem soar como pop-up de captura de lead.

### policies.privacidade_intro
> "Tratamos seus dados com a mesma discrição que tratamos cada negociação. Coletamos só o necessário, guardamos pelo tempo necessário, compartilhamos apenas com quem precisa estar na mesa. Para qualquer dúvida, fale com nosso encarregado de dados antes de chegar ao texto legal abaixo."

Faz a ponte: voz da marca primeiro (discrição = mesma palavra que se aplica à negociação), depois resumo operacional em três cláusulas espelhadas, depois caminho de saída humano (DPO) antes do texto legal.

### policies.reserva_intro
> "A reserva por sinal serve para retirar o imóvel do catálogo enquanto você decide com calma. São 10 dias corridos de exclusividade, prazo escolhido por respeitar o tempo de uma decisão dessa ordem sem prender quem está do outro lado. Devolução, prorrogação e regras de retratação estão descritas a seguir, sem letra miúda."

Explica o instrumento em uma frase, justifica o prazo (princípio do brief: "respeitar o tempo de quem decide"), encerra com promessa de transparência ("sem letra miúda") que abre o texto jurídico.

---

## 4. /contato editorial — texto pronto + sugestão de layout

Página atual está funcional mas seca: lista 5 blocos verticais (Escritório, WhatsApp, Email, Para vendedores, LGPD). Sem voz, sem hierarquia visual entre o que é primário (atender quem quer comprar) e secundário (vendedores, LGPD).

Sugestão de layout para o Frontend (você decide a implementação, eu só forneço a estrutura):

```
┌─────────────────────────────────────────────────────┐
│ [eyebrow] CONTATO                                    │
│ [h1]      Fale com a curadoria                       │
│ [lead]    contato.intro_editorial                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  COLUNA ESQUERDA              COLUNA DIREITA         │
│  ─────────────────            ──────────────────     │
│  Visite o escritório          Atendimento remoto     │
│  [coluna_visita_corpo]        [coluna_remoto_corpo]  │
│                                                       │
│  Endereço                     WhatsApp               │
│  Rua dos Tranquilos, 142...   +55 11 90000-0000      │
│                                                       │
│  [horário implícito           Email                  │
│   já no corpo]                contato@marquesa.dev   │
│                                                       │
├─────────────────────────────────────────────────────┤
│  [Bloco horizontal cheio:]                           │
│  Para vendedores                                     │
│  contato.vendedores_corpo                            │
├─────────────────────────────────────────────────────┤
│  [Bloco horizontal cheio, em ash menor:]            │
│  Encarregado de dados (LGPD)                         │
│  contato.lgpd_corpo                                  │
└─────────────────────────────────────────────────────┘
```

Hierarquia visual:
1. Lead (intro_editorial) — voz da marca, dá tom
2. Duas colunas paralelas — visita presencial vs. remoto, pesos iguais
3. Bloco "Para vendedores" — separado, secundário (não é o público alvo da página)
4. Bloco LGPD — pé da página, em `text-ash`, secundário

Chaves disponíveis (todas em `contato.*`):
- `eyebrow`, `titulo_editorial`, `intro_editorial`
- `coluna_visita_titulo`, `coluna_visita_corpo`, `coluna_visita_endereco_titulo`, `coluna_visita_endereco`
- `coluna_remoto_titulo`, `coluna_remoto_corpo`, `coluna_remoto_whatsapp_titulo`, `coluna_remoto_email_titulo`
- `form_titulo`, `form_subtitulo` — opcional, se decidir adicionar formulário inline (eu não recomendaria nessa página, mas deixei caso queira reutilizar em modal)
- `vendedores_titulo`, `vendedores_corpo`
- `lgpd_titulo`, `lgpd_corpo`

Ponto importante: WhatsApp e Email viraram **dado dentro da coluna remoto** em vez de seções de primeiro nível, porque coluna remoto já comunica "como falar de longe", e os canais são instâncias dela. Reduz fragmentação vertical.

---

## Pra Frontend — checklist de renderização

Arquivos a tocar e onde plugar cada chave:

### `frontend/src/components/loja/Hero.tsx`
- Trocar `eyebrow` hardcoded `'CURADORIA · 2026'` por `microcopy.hero.eyebrow`
- `microcopy.hero.titulo` e `microcopy.hero.subtitulo` já estão consumidos, vão atualizar sozinhos

### `frontend/src/app/(loja)/page.tsx` (home)
- Inserir nova section entre o Hero e os Destaques (ou imediatamente depois do bloco Destaques, decida pelo ritmo visual):
  ```tsx
  <section className="container-marquesa py-16 md:py-24">
    <ScrollReveal>
      <div className="max-w-2xl">
        <p className="text-eyebrow uppercase tracking-[0.16em] text-ash mb-4">
          {microcopy.home.curadoria_intro_eyebrow}
        </p>
        <p className="font-display text-display-md text-ink leading-snug">
          {microcopy.home.curadoria_intro}
        </p>
      </div>
    </ScrollReveal>
  </section>
  ```
  Recomendação: usa `font-display` em peso Light (a frase é curta o bastante para virar tipografia editorial, não corpo de texto). Posição ideal é **entre Hero e Destaques** porque atua como "abertura editorial" antes de entregar o produto.

### `frontend/src/app/(loja)/imoveis/page.tsx` (catálogo)
- Adicionar bloco editorial logo abaixo do `<h1>{microcopy.catalogo.titulo}</h1>`:
  ```tsx
  <p className="text-body-lg text-ink leading-relaxed mt-4 max-w-2xl">
    {microcopy.catalogo.intro_editorial}
  </p>
  ```
- Adicionar bloco no rodapé do grid (depois da paginação):
  ```tsx
  <div className="mt-24 text-center">
    <p className="text-body text-ash mb-3">{microcopy.catalogo.outro_editorial}</p>
    <Link href="/contato" className="text-body-sm text-ink hover:text-moss border-b border-ink hover:border-moss pb-1 transition-colors duration-fast">
      {microcopy.catalogo.outro_editorial_cta}
    </Link>
  </div>
  ```

### `frontend/src/app/(loja)/policies/privacidade/page.tsx`
- Inserir parágrafo intro logo após o `<h1>` e antes do primeiro `<p>` legal:
  ```tsx
  <p className="text-body-lg text-ink leading-relaxed mb-12 pb-12 border-b border-bone">
    {microcopy.policies.privacidade_intro}
  </p>
  ```
  O divisor `border-b border-bone` cria a separação visual entre voz-da-marca e texto legal, sem precisar de subtítulo extra.

### `frontend/src/app/(loja)/policies/reserva/page.tsx`
- Mesmo padrão da privacidade, com `microcopy.policies.reserva_intro`.

### `frontend/src/app/(loja)/contato/page.tsx`
- Reescrita completa seguindo o layout sugerido na seção 4 acima. Todo texto vem do JSON. O componente `Section` interno pode ser mantido, mas use `grid grid-cols-1 md:grid-cols-2 gap-12` para as duas colunas centrais (Visita / Remoto), e blocos `full-width` para Vendedores e LGPD.

---

## Pra Designer

Nada nesta rodada. Todas as decisões de tipografia, cor e espaçamento já estão no brand-brief §4-§5 e foram aplicadas. Se o Frontend tiver dúvida sobre tamanho da intro de catálogo (body-lg vs. body), default body-lg, alinhado à esquerda, max-width 2xl.

---

Faltou algo? `microcopy.json` é a fonte única, todas as chaves listadas existem e o JSON está válido (testado).
