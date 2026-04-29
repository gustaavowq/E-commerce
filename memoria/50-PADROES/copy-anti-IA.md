# Padrão — Copy anti-IA (sem vibe ChatGPT/Lovable)

> Aprovado pelo Gustavo. Brand voice da Miami Store estabeleceu as regras. Vale pra QUALQUER projeto.

## Princípio

> **Copy de IA tem padrões reconhecíveis.** Reler em voz alta — se soou "AI assistant", reescrever.

## REGRAS DURAS (não negociar)

### 1. Sem travessão (`—`)
- Travessão é assinatura visual de IA. Trocar por:
  - **Vírgula** se a pausa é leve.
  - **Dois pontos** se há explicação.
  - **Ponto + frase nova** se a pausa é forte.

```
❌ "Compra fácil — sem cadastro chato — direto pelo Pix."
✅ "Compra fácil, sem cadastro chato, direto pelo Pix."
✅ "Compra fácil. Sem cadastro chato. Direto pelo Pix."
```

### 2. Sem emoji em UI/marketing institucional
- Emoji em CTA, hero, descrição de produto, email transacional: **VETADO**.
- Exceção: WhatsApp/redes sociais onde é vernáculo.

### 3. Sem "frase guarda-chuva" tipo IA
Padrões reconhecíveis a banir:

- ❌ "Reimaginando a forma como você compra X"
- ❌ "Build the future of [X]" / "O futuro do X"
- ❌ "Mais que [substantivo], um [substantivo grandioso]"
- ❌ "Descubra um novo jeito de..."
- ❌ "Transformando a experiência de..."
- ❌ "Não é só [X]. É [X] elevado a outra dimensão."

### 4. Sem advérbio inútil
- ❌ "Realmente bom", "Verdadeiramente único", "Genuinamente diferente"
- ✅ "Bom.", "Único.", "Diferente."

Adjetivo sozinho é mais forte que adjetivo com muleta.

### 5. Sem "amor" gratuito
- ❌ "Feito com amor pra você"
- ❌ "Sua satisfação é nossa paixão"
- ✅ Falar do produto: "Costura reforçada, peça inteira em algodão Pima."

### 6. Sem floreio "premium" vazio
- ❌ "Experiência premium", "Curadoria exclusiva", "Sofisticação atemporal"
- ✅ Especificidade: "Selecionamos só Lacoste, Nike, Tommy. 200+ peças no estoque."

## Voz por contexto

### CTAs (botões)
Verbo de ação + objeto específico. Curto.

```
❌ "Saiba mais"             ✅ "Ver tabela de medidas"
❌ "Comece agora"           ✅ "Adicionar ao carrinho"
❌ "Submit"                  ✅ "Pedir agora"
❌ "Confirmar"               ✅ "Confirmar pedido — R$ 247,00"
```

### Empty states
Específico do contexto, sem jeitinho mole.

```
❌ "Nenhum item encontrado"
✅ "Sua sacola tá vazia. Bora ver o que chegou?"

❌ "Lista vazia"
✅ "Você ainda não favoritou nada. Coração no produto pra salvar aqui."
```

### Mensagens de erro
Diz QUE falhou, POR QUÊ, e o QUE FAZER.

```
❌ "Erro ao processar"
❌ "Algo deu errado, tente novamente"
✅ "Pix expirou (10min). [Gerar novo Pix](#)."
✅ "Email já cadastrado. [Entrar](/login) ou [recuperar senha](/forgot)."
```

### Confirmações destrutivas
Repete o nome do alvo. Diz que não desfaz.

```
❌ "Tem certeza?"
✅ "Excluir Polo Lacoste Vermelha? Ação não desfeita."
```

### Loading states
Verbo no gerúndio + objeto.

```
❌ [spinner sem texto]
✅ "Salvando produto..."
✅ "Gerando Pix..."
```

## Voz da marca (varia por nicho)

Cada marca tem seu tom específico (formal, casual, irreverente). Vem do `brand-brief.md` que o Designer entrega. **Mas** as 6 regras duras acima valem em **qualquer** voz.

## Auditoria

Antes de aprovar copy:

- [ ] Ctrl+F `—` no codebase: **0 ocorrências** em arquivos de UI/copy.
- [ ] Ctrl+F "Reimagin" / "Future of" / "experien" / "premium" / "exclusiv": revisar cada match.
- [ ] Ler hero + CTA principal em voz alta. Soou "AI assistant"? Refazer.
- [ ] Cada empty state e mensagem de erro tem ação clara (link/botão pra próximo passo).

## Lições relacionadas

- [[../30-LICOES/33-design-tipo-lovable-vetado]] — equivalente visual.
- `feedback_copy_style.md` (auto-memória).
