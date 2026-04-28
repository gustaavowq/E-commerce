# Builder E2E — Kore Tech

> **Diferencial competitivo nº 1 do Kore Tech.** Se o builder não funcionar, o projeto perde sua razão de ser.
> Roteiro de 20 passos pra validar o PC Builder ponta a ponta — escolha de peças, filtragem por compatibilidade, cálculo de wattagem, sugestão de PSU, salvar build, comprar tudo.
> **Critério geral de aprovação:** 20/20 passos verdes. Falha em compatibilidade = REPROVAR (cliente confia no builder, errar = quebra de confiança).

## Pré-requisitos

- Tudo de SMOKE-E2E (backend + frontend + dashboard rodando, seed completo)
- Seed deve garantir variedade de sockets:
  - **CPUs:** Ryzen 5 7600 (AM5, 65W), Ryzen 7 7700X (AM5, 105W), Core i5-14400 (LGA1700, 65W), Core i7-14700K (LGA1700, 125W), Ryzen 9 9950X (AM5, 170W)
  - **Mobos:** B650, X670E (AM5) + B760, Z790 (LGA1700)
  - **RAM:** DDR4 (legado LGA1700) e DDR5 (AM5 + LGA1700 high-end)
  - **GPU:** RTX 4060 (115W), RTX 4070 Super (220W), RTX 5080 (360W)
  - **PSU:** 550W Bronze, 650W Bronze, 750W Gold, 850W Gold, 1000W Platinum
  - **Gabinetes:** ATX, mATX, ITX (com `gpu_max_length_mm` e `cooler_max_height_mm` no seed)
  - **Coolers:** Air AM5 (155mm), AIO 240mm AM5, Air LGA1700 (160mm)
- Endpoints `/api/builder/check-compatibility` e `/api/builder/recommend-psu` ativos

## Modo de teste

- Browser limpo, **anônimo OK** (builder não exige login pra testar — login só pra salvar)
- DevTools aberto: monitorar requests POST `/api/builder/check-compatibility` em cada adição

---

## Passos numerados (20 obrigatórios)

### 1. Acessar `/montar` (anônimo OK)

**Ação:** abrir `https://loja.kore.test/montar` direto.

**Validar:**
- [ ] Página carrega sem exigir login
- [ ] Hero curto explicando "Monte seu PC peça por peça com checagem automática de compatibilidade"
- [ ] Sidebar lateral lista as 8 categorias (`BuilderCategoryPicker`)
- [ ] Conteúdo central mostra estado inicial: "Comece pela CPU"
- [ ] Footer fixo (`BuilderCompatibilityBar`) visível com totais zerados (R$ 0, 0W, "Adicione peças")

---

### 2. Sidebar lista 8 categorias, primeira é CPU

**Validar (lendo a sidebar):**
- [ ] Ordem: **CPU → Placa-mãe → RAM → GPU → Storage → PSU → Gabinete → Cooler** (ordem coerente com dependências)
- [ ] CPU está marcada como "ativa" / próxima a escolher
- [ ] Demais categorias visíveis mas em estado "trancado" ou "desativado" visualmente sutil (sem bloquear cliques avançados pra power users)
- [ ] Cada item da sidebar mostra ícone, nome, e estado (vazio / ✅ / ⚠️ / ❌)

---

### 3. Escolher Ryzen 5 7600 (AM5, 65W)

**Ação:** clicar em CPU → lista de CPUs aparece → click no Ryzen 5 7600.

**Validar:**
- [ ] Card mostra specs: socket AM5, 6c/12t, 65W TDP, suporte DDR5
- [ ] Click em "Adicionar" — toast ou animação de confirmação (sem travessão, sem emoji)
- [ ] POST `/api/builder/check-compatibility` disparado com `{ parts: [cpuId] }`
- [ ] Footer atualiza: 1 peça, 65W, R$ <preço da CPU>
- [ ] Sidebar marca CPU como ✅ (success-green `#00E676`)

---

### 4. Sidebar avança pra Mobo

**Validar:**
- [ ] Após adicionar CPU, foco visual move pra "Placa-mãe" na sidebar (auto-avança ou animação sutil)
- [ ] CPU continua ✅
- [ ] Click em "Placa-mãe" → lista carrega

---

### 5. Lista de mobos só mostra socket AM5

**Validar (CRÍTICO):**
- [ ] Lista filtra automaticamente: **só aparecem placas AM5** (B650, X670, X670E)
- [ ] **Nenhuma LGA1700 visível** (B760, Z790 não estão na lista)
- [ ] Se houver toggle "ver todas (incompatíveis)", as LGA1700 aparecem com badge `❌ socket incompatível` em danger red
- [ ] Search/filtro por chipset funciona dentro do escopo filtrado

**Critério passa:** zero LGA1700 na lista filtrada padrão.

---

### 6. Escolher mobo B650

**Ação:** click numa B650.

**Validar:**
- [ ] Specs visíveis: socket AM5, chipset B650, 4× DDR5 slots, ATX (ou mATX se for o caso), PCIe 5.0 x16
- [ ] Adicionar → POST `/api/builder/check-compatibility` retorna sem warnings
- [ ] Footer atualiza wattagem somada (ainda só 65W da CPU; mobo conta ~30W estimado, então ~95W)
- [ ] Sidebar: CPU ✅, Mobo ✅, próxima foco em RAM

---

### 7. RAM: lista mostra só DDR5 (não DDR4)

**Validar (CRÍTICO):**
- [ ] Como a mobo é B650 (AM5), só aceita DDR5
- [ ] Lista de RAM filtra: **só DDR5 visível** (Corsair Vengeance DDR5-6000, G.Skill Trident Z5 DDR5-6400, etc)
- [ ] **Nenhuma DDR4 na lista** (Corsair Vengeance DDR4-3200 não aparece)
- [ ] Se houver toggle "ver incompatíveis", DDR4 aparece com `❌ tipo incompatível`

---

### 8. Adicionar 16GB DDR5

**Ação:** click numa RAM 16GB DDR5-6000.

**Validar:**
- [ ] Adicionada
- [ ] Footer: ~110W (CPU 65 + mobo 30 + RAM 5 × 1 módulo)
- [ ] Sidebar: CPU/Mobo/RAM ✅

---

### 9. GPU: escolher RTX 4070 Super (220W)

**Ação:** ir pra GPU, click RTX 4070 Super.

**Validar:**
- [ ] Specs: 220W TDP, 285mm length, conector 12VHPWR ou 2×8-pin
- [ ] POST check-compatibility ainda OK (sem PSU, sem warning de wattagem ainda — depende da implementação)
- [ ] Footer: ~330W (110 + 220)
- [ ] Sidebar: CPU/Mobo/RAM/GPU ✅

---

### 10. Footer mostra wattagem somada + PSU sugerida

**Validar (CRÍTICO — diferencial do builder):**
- [ ] `BuilderCompatibilityBar` mostra:
  - Wattagem somada: **~330W** (cálculo: CPU + GPU + mobo + RAM + estimativa de fans/storage)
  - PSU sugerida: **650W 80+ Bronze** (regra: somatório × 1.5 com headroom + arredondar pra cima entre 550/650/750/850/1000)
  - Componente `BuilderPSURecommendation` exibido inline com modelo + preço estimado + botão "Adicionar essa PSU"
- [ ] Cor da barra: success/`#00E676` (sob orçamento)

---

### 11. Storage: NVMe Gen4 compatível

**Ação:** ir pra Storage, escolher NVMe Gen4 1TB (ex: Kingston KC3000 ou Samsung 980 Pro).

**Validar:**
- [ ] Lista mostra opções compatíveis com a mobo (M.2 PCIe Gen4 — B650 suporta Gen5 e Gen4)
- [ ] Adicionar NVMe Gen4
- [ ] Footer: ~340W (storage soma ~10W)
- [ ] Sidebar: 5 ✅

---

### 12. Trocar GPU pra RTX 5080 (360W) → warning + recomendação muda

**Ação:** voltar em GPU, **remover** RTX 4070 Super, escolher **RTX 5080**.

**Validar (CRÍTICO):**
- [ ] Remoção limpa o item anterior, footer atualiza
- [ ] Adição da 5080: POST `/api/builder/check-compatibility` retorna **warning amber `#FFB74D`**
- [ ] Footer: wattagem agora ~470W (110 + 360)
- [ ] Recomendação de PSU **muda para 850W 80+ Gold** (cálculo: 470 × 1.5 ≈ 705W → arredonda pra 850 considerando picos de transientes da 5080)
- [ ] Mensagem amber visível: "Sua GPU exige fonte mais robusta. Sugerimos 850W 80+ Gold (~R$ 680) com headroom pra picos de consumo."
- [ ] Sidebar: GPU pisca em warning (não erro, não bloqueia)
- [ ] Botão "Substituir por 850W" no card da PSU (se PSU já tiver sido adicionada)

---

### 13. Voltar pra GPU, voltar pra 4070 Super

**Ação:** trocar GPU de novo: remover 5080, adicionar 4070 Super.

**Validar:**
- [ ] Footer volta pra ~330W
- [ ] Recomendação volta pra **650W Bronze**
- [ ] Warning amber some, sidebar GPU volta a ✅
- [ ] Build state consistente (não vaza estado da 5080)

---

### 14. PSU: aceitar sugestão de 650W 80+ Bronze

**Ação:** ir pra PSU, escolher a 650W 80+ Bronze sugerida (ou clicar em "Adicionar PSU sugerida" no footer).

**Validar:**
- [ ] PSU adicionada
- [ ] Footer: PSU não soma na wattagem (é a fonte, não consumidor)
- [ ] Mas footer agora mostra: "Consumo: 330W / Capacidade: 650W (50% utilização) ✅"
- [ ] Cor: success/green
- [ ] Sidebar: PSU ✅

---

### 15. Case: lista mostra só ATX/mATX compatíveis com GPU length

**Validar (CRÍTICO — pega bug clássico de gabinete pequeno + GPU grande):**
- [ ] Como mobo é ATX (assumido) e GPU é 285mm:
  - Gabinetes ITX que aceitam só GPU < 280mm **não aparecem** (ou aparecem com `❌ GPU não cabe`)
  - Gabinetes ATX/mATX com `gpu_max_length_mm ≥ 285` aparecem normalmente
- [ ] Se houver toggle, incompatíveis ficam com badge danger
- [ ] Se mobo for ATX, gabinetes só-ITX **não aparecem** (form factor)

---

### 16. Escolher case ATX

**Ação:** escolher um gabinete ATX típico (ex: Lian Li Lancool 216, NZXT H7 Flow).

**Validar:**
- [ ] Specs do gabinete: ATX/mATX/ITX support, gpu_max_length 380mm, cooler_max_height 167mm
- [ ] Adicionar
- [ ] Footer: ainda 330W (gabinete não consome)
- [ ] Sidebar: 7 ✅

---

### 17. Cooler: socket AM5 ✅, altura compatível

**Validar (CRÍTICO):**
- [ ] Lista de coolers filtra:
  - Só coolers compatíveis com socket AM5 (descartar LGA1700-only)
  - Só coolers com `height_mm ≤ 167mm` (limite do gabinete escolhido)
- [ ] Coolers AM5 com altura > 167 aparecem com `❌ não cabe no gabinete` (se toggle ligado)
- [ ] AIO 240mm aparece — validar que gabinete suporta radiador 240 no top/front
- [ ] Adicionar Air Cooler AM5 (ex: Noctua NH-U12S, 158mm)

---

### 18. Final: total estimado + wattagem + ações

**Validar:**
- [ ] Footer agora mostra:
  - **Total estimado:** R$ <soma dos 8 itens>
  - **Consumo:** 330W / **Capacidade PSU:** 650W ✅
  - **Compatibilidade:** ✅ Tudo OK (success green)
  - Botão **"Salvar build"** (com tooltip "Login required" se anônimo) ativo mas exige login no click
  - Botão **"Comprar tudo"** ativo, primary cyan
- [ ] Click "Salvar build" anônimo → modal/redirect pra login com `redirect=/montar?build=temp123`
- [ ] Após login, salva e mostra link compartilhável `/builds/share/<slug>` (público read-only)

---

### 19. Click "Comprar tudo" → 7 itens no carrinho

**Ação:** click "Comprar tudo".

**Validar:**
- [ ] POST `/api/cart/items` em batch (8 itens? ou agrupa? ver implementação) — todos os componentes vão pro carrinho
- [ ] Toast: "8 itens adicionados ao carrinho"
- [ ] Redirect ou navegação pra `/cart`

---

### 20. Validar carrinho com todos os itens

**Validar:**
- [ ] `/cart` lista os 8 itens (CPU, Mobo, RAM, GPU, Storage, PSU, Case, Cooler)
- [ ] Cada um com qty 1, preço unitário, subtotal
- [ ] Total bate com o footer do builder
- [ ] Aplicar cupom `BUILDER10` → desconto 10% aplica (regra: só pra origem builder; ver edge case em `EDGE-CASES.md`)
- [ ] Pode prosseguir pro checkout normalmente

**Critério passa:** carrinho com 8 itens, BUILDER10 aplicou, checkout liberado.

---

## Relatório final do builder

```markdown
# Builder E2E — Kore Tech — <data>

## Resultado: 20/20 OK | X/20 falhas

## Compatibilidade verificada:
- [x] Filtro de socket CPU↔Mobo (passos 5)
- [x] Filtro RAM DDR4/DDR5 vs mobo (passo 7)
- [x] Cálculo wattagem dinâmico (passos 10, 12, 13)
- [x] Recomendação PSU adapta a GPU (passo 12 vs 14)
- [x] GPU length vs gabinete (passo 15)
- [x] Cooler height vs gabinete (passo 17)
- [x] Cooler socket vs CPU (passo 17)
- [x] Form factor mobo vs gabinete (implícito passo 16)

## Falhas
- Passo X: [arquivo:linha] descrição. Sugestão: ...

## Veredito: APROVADO / REPROVADO
```

## Cenários complementares (rodar em segundo passe — não bloqueia release MVP)

- **Mobile (375px):** todo o fluxo funciona em mobile? Sidebar vira drawer? Footer fixo não come a tela?
- **Build totalmente errado (ex: CPU AM5 + Mobo LGA1700 forçado via URL/state)**: backend retorna lista de erros, UI mostra danger red, botão "Comprar tudo" desabilita
- **Builder com 0 peças**: `Comprar tudo` desabilitado, mensagem amigável "Adicione pelo menos a CPU"
- **Build duplicado**: tentar adicionar 2 CPUs — UI substitui ou impede?
- **RAM kit duplo**: 2× 16GB DDR5 = 32GB total. Footer reflete?
- **Compartilhar build via slug público** `/builds/share/[slug]`: abre em anônimo, mostra peças (read-only), CTA "Comprar este build" copia pro carrinho do visitante

## Observações de design

- Animação ao adicionar peça deve ser **snappy** (≤ 200ms). Lottie pesado ou parallax = anti-padrão (`BRAND-BRIEF.md`).
- Cores devem usar tokens Designer:
  - `success` `#00E676` (compatível)
  - `warning` `#FFB74D` (insuficiente, sugere upgrade)
  - `danger` `#FF5252` (incompatível, bloqueia)
- FPS badges em JetBrains Mono se PC montado for derivado do build (V2)
