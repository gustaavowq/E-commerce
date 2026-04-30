# DE: copywriter | PARA: techlead | 2026-04-29 22:00

## Conteúdo entregue

### 1. Catálogo seed (`assets/catalogo.json`)
20 imóveis com schema completo para alimentar o seed do backend. Distribuição: 6 coberturas (R$ 4,2M a R$ 14,8M), 6 apartamentos (R$ 1,75M a R$ 4,5M), 4 casas (R$ 2,9M a R$ 9,8M), 2 sobrados (R$ 1,98M a R$ 2,4M), 2 terrenos comerciais (R$ 6,5M a R$ 7,8M, um com tipo `TERRENO` e outro `COMERCIAL` para validar ambos os enums). Bairros distribuídos: Jardins, Vila Nova Conceição, Itaim Bibi, Higienópolis, Pinheiros, Vila Madalena, Perdizes, Moema, Jardim Europa, Cidade Jardim, Alto de Pinheiros, Vila Mariana, Vila Olímpia. **6 destaques** para a home (Jardins, VNC, Itaim Bibi, Pinheiros loft, Jardim Europa, Alto de Pinheiros condomínio). Fotos Unsplash royalty-free, 4 a 6 por imóvel. Coordenadas dentro de parques (Ibirapuera, Villa-Lobos, Parque do Carmo, Parque do Estado). Endereços fictícios mas plausíveis. Todos os campos exigidos presentes (preco, precoSinal 5%, area, quartos, suites, banheiros, vagas, IPTU anual, condomínio).

### 2. Microcopy UI (`copy/microcopy.json`)
Strings completas para navbar, hero, home, filtros, card, catálogo, PDP, checkout de sinal, sucesso, lead, agendar visita, auth (login/registro/esqueci/redefinir), minha conta, painel, KPIs, footer, cookies, compartilhar, vazios, loadings, erros, validações. Tom respeita brand-brief: refinado, factual, sem travessão, sem clichê IA.

### 3. Páginas institucionais (`copy/paginas/`)
- `sobre.md`: 250 palavras. Lorenzo Mancini como sócio fundador italiano, posicionamento boutique, equipe de 7 corretores, exclusividade na captação.
- `contato.md`: endereço fake (Rua dos Tranquilos 142, Jardins), WhatsApp `+55 11 90000-0000`, Instagram genérico, emails contato/captacao/imprensa/dpo, horário "atendimento por agendamento".
- `politica-reserva.md`: explica arras confirmatórias com base no Código Civil arts. 417-420, 4 cenários de devolução (comprador desiste = perde, vendedor desiste = recebe em dobro, pendência documental = devolve integral, prazo expira = devolve integral), prazo de 5 dias úteis para reembolso.
- `privacidade.md`: LGPD completa (dados coletados, finalidade, compartilhamento, retenção, direitos do titular, segurança, DPO).

### 4. Templates de email (`copy/emails/`)
- `confirmacao-reserva.md`: cliente recebe ao pagar sinal, com próximos passos e detalhes da reserva.
- `notificacao-corretor.md`: corretor recebe alerta de ação em 4h úteis com dados do cliente.
- `lead-recebido.md`: cliente recebe ao preencher formulário de interesse.

Todos com variáveis `{{handlebars}}` para o backend popular, subject ≤40 chars, preheader ≤90 chars.

## Decisões tomadas

- **CRECI placeholder padronizado**: `CRECI/SP 12345-J — Marquesa Imóveis Ltda.` em todos os arquivos institucionais.
- **Sócio fundador inventado**: Lorenzo Mancini, italiano de Florença, 20 anos de mercado. Dá "old money italiano" sem fingir grupo grande.
- **Tipo de imóvel `COMERCIAL`**: usei na ficha do terreno Vila Olímpia e `TERRENO` no Itaim Bibi para validar que o backend aceita ambos os enums (vide DECISOES). Coerência com schema esperado.
- **Política de reserva** segue exatamente as faixas decididas (5% padrão, 10 dias corridos, 5 dias úteis para devolução). Referencia Código Civil art. 417-420 sem ser jurídico-pesado.
- **Endereço de captação**: criei email separado `captacao@marquesa.dev` para vendedores, sinaliza estrutura mas todos apontam para o mesmo placeholder. Backend pode ignorar e usar caixa única.

## Atenção / handoffs

1. **Backend**: o seed precisa conhecer os enums `APARTAMENTO | CASA | COBERTURA | SOBRADO | TERRENO | COMERCIAL`. Validar no schema Prisma. Usar `slug` como chave de `upsert` (lição 18-seed-imagens-upsert: incluir `fotos` no update também, não só no create).
2. **Frontend**: o `microcopy.json` está em formato achatado por seção. Recomendo expor via hook `useCopy('hero.titulo')` ou import direto. Strings de erros já cobrem casos da PDP e checkout, devem alinhar com mensagens reais do backend (lição 26-dados-invalidos-silencioso).
3. **Designer**: textos do hero (`Imóveis com curadoria.` / `Apartamentos, casas e coberturas em endereços selecionados de São Paulo.`) foram pensados para respirar em serif grande (Canela/Cormorant). Headline curto, subtítulo em duas linhas no desktop.
4. **Growth**: as descrições dos imóveis (80-150 palavras cada) são SEO-friendly por natureza (vocabulário do nicho, bairros, atributos), mas falta meta-title e meta-desc dedicados por imóvel. Posso entregar em iteração posterior se priorizar.
5. **QA**: Ctrl+F `—` (travessão) em todos os arquivos entregues retorna zero. Conferir.

## Brand voice respeitada: SIM
## Português revisado: SIM
## Sem travessão em UI/marketing: SIM (verificado)
## Sem clichê IA ("descubra", "transforme", "experiência incrível"): SIM
## Endereços/coordenadas fake em parques: SIM

## Bloqueios

Nenhum. Pronto para o Backend rodar `prisma db seed` consumindo `assets/catalogo.json` e para o Frontend importar `copy/microcopy.json`.
