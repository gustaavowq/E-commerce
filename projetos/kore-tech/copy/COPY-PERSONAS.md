# Copy Personas — Kore Tech

> Copy completo das 8 landing pages de persona (`/builds/[persona-slug]`). Cada persona = página SEO indexável.
> Mantido pelo Copywriter (Agente 07). Última atualização: 2026-04-26.

**Estrutura por persona:**
- `slug` (URL)
- `nome` (display)
- `headline` (h1 da landing)
- `subheadline` (h2)
- `bullets` (3 bullets de benefício, com número quando dá)
- `cta_primary` (botão "Ver builds prontos")
- `cta_secondary` (botão "Montar do zero")
- `meta_title` (SEO ≤ 60 chars)
- `meta_description` (SEO ≤ 160 chars)

**Voz aplicada:** sem travessão, sem "gamers de verdade", sem "experiência única". Número antes de adjetivo. CTA sempre verbo de ação.

---

## 1. Valorant 240 FPS

```yaml
slug: valorant-240fps
nome: Valorant 240 FPS
headline: PC pra rodar Valorant a 240 FPS
subheadline: Builds checados pra entregar 240 FPS estáveis no 1080p high. Pra quem já passou de Diamante e o monitor não acompanha mais.
bullets:
  - 240 FPS confirmados no 1080p high (testado com FRAPS no Bind, Haven e Ascent)
  - Latência abaixo de 5ms: sente o flick antes do oponente
  - Configuração econômica em watts: cabe em fonte 650W com folga
cta_primary: Ver builds prontos pra Valorant
cta_secondary: Montar do zero no Builder
meta_title: PC para Valorant 240 FPS · Builds prontos · Kore Tech
meta_description: Builds testados pra entregar 240 FPS no Valorant 1080p high. Compatibilidade checada, parcela 12x sem juros, Pix com 5% off.
```

---

## 2. Fortnite competitivo

```yaml
slug: fortnite-competitivo
nome: Fortnite competitivo
headline: PC pra Fortnite competitivo no 1440p
subheadline: Builds com FPS estável pra modo Performance e modo DirectX 12 com Lumen ligado. Pra quem joga arena, cash cup ou só quer parar de cair em build battle por queda de frame.
bullets:
  - 240 FPS no modo Performance 1080p, 144 FPS no DX12 1440p
  - SSD NVMe Gen4: textura carrega antes do inimigo aparecer
  - Sem stutter em build battle: CPU dimensionada pro pico de inputs
cta_primary: Ver builds prontos pra Fortnite
cta_secondary: Montar do zero no Builder
meta_title: PC para Fortnite competitivo · Builds 240 FPS · Kore Tech
meta_description: PCs montados pra rodar Fortnite a 240 FPS no Performance e 144 FPS no DX12 1440p. Sem stutter em build battle. Frete asseguro Brasil todo.
```

---

## 3. CS2 high-tier

```yaml
slug: cs2-high-tier
nome: CS2 high-tier
headline: PC pra CS2 com 400 FPS reais
subheadline: Builds focados em CPU forte e cache grande, que é o que o CS2 pede. 400+ FPS em mapas oficiais no 1080p high, latência baixa pra spray controlado.
bullets:
  - 400+ FPS em Mirage, Inferno e Dust2 no 1080p high
  - Cache L3 grande: o que o CS2 mais ama, mais que GPU absurda
  - Compatível com monitores 240Hz e 360Hz top
cta_primary: Ver builds prontos pra CS2
cta_secondary: Montar do zero no Builder
meta_title: PC para CS2 com 400 FPS · Builds high-tier · Kore Tech
meta_description: PCs montados pra rodar CS2 acima de 400 FPS em mapas oficiais. CPU otimizada pra cache, suporte a monitor 360Hz. 12x sem juros.
```

---

## 4. Edição 4K

```yaml
slug: edicao-4k
nome: Edição de vídeo 4K
headline: PC pra edição 4K em DaVinci e Premiere
subheadline: Builds com 32-64GB de RAM, GPU com 12+ GB de VRAM e SSD Gen4 dedicado pra cache. Renderiza linha do tempo 4K em tempo real, exporta H.265 sem travar o resto do PC.
bullets:
  - Timeline 4K rodando em tempo real no DaVinci Resolve Studio
  - Exportação de 10 minutos em 4K H.265: até 4x mais rápida que notebook entry
  - Cache em SSD NVMe dedicado: scrubbing fluido em projetos grandes
cta_primary: Ver builds prontos pra edição
cta_secondary: Montar do zero no Builder
meta_title: PC para edição de vídeo 4K · DaVinci e Premiere · Kore Tech
meta_description: PCs montados pra editar 4K no DaVinci e Premiere com timeline em tempo real. 32-64GB RAM, GPU com 12+ GB VRAM. Frete asseguro até R$ 15 mil.
```

---

## 5. Streaming

```yaml
slug: streaming
nome: Streaming
headline: PC pra stream em 1080p60 sem travar o jogo
subheadline: Builds com CPU robusta o bastante pra encodar x264 medium na CPU enquanto a GPU foca no jogo. Ou NVENC na GPU, se quiser preservar a CPU pro jogo competitivo.
bullets:
  - Stream 1080p60 com x264 medium sem queda no FPS do jogo
  - 32GB RAM: OBS, Discord, Chrome e jogo abertos juntos sem swap
  - Configuração com captura via NVENC ou x264, você escolhe no setup
cta_primary: Ver builds prontos pra streaming
cta_secondary: Montar do zero no Builder
meta_title: PC para streaming 1080p60 · Stream sem travar · Kore Tech
meta_description: PCs pra streamar 1080p60 com x264 medium ou NVENC. CPU dimensionada pra encode em paralelo. OBS, Discord e jogo sem queda de FPS.
```

---

## 6. IA local Llama

```yaml
slug: ia-local-llama
nome: IA local Llama
headline: PC pra rodar Llama 7B, 13B e 70B em casa
subheadline: Builds com VRAM generosa (16GB+ pra 13B em 4bit, 24GB pra 70B em quantização agressiva) e RAM 64GB+ pra layer offload. Roda Llama, Mistral e Qwen sem mandar dados pra ninguém.
bullets:
  - Llama 7B em 4bit: 80+ tokens/s em GPU única
  - Llama 70B em 4bit com layer offload: roda local, sem precisar de cluster
  - SSD NVMe Gen4 com 1TB+: peso de modelo grande não vira gargalo
cta_primary: Ver builds prontos pra IA local
cta_secondary: Montar do zero no Builder
meta_title: PC para rodar Llama local · IA on-premise · Kore Tech
meta_description: Builds pra rodar Llama 7B, 13B e 70B local com VRAM 16-24GB. RAM 64GB+, SSD Gen4. Privacidade total, sem mandar dados pra cloud.
```

---

## 7. Workstation 3D

```yaml
slug: workstation-3d
nome: Workstation 3D
headline: PC pra Blender, Unreal e CAD profissional
subheadline: Builds com GPU CUDA forte, 64GB+ de RAM e armazenamento dual. Renderiza cena pesada no Blender, abre projeto Unreal Engine 5 com Nanite e Lumen, e ainda roda viewport CAD fluido.
bullets:
  - Render Blender Cycles em GPU: até 6x mais rápido que CPU only
  - Unreal Engine 5 com Nanite e Lumen: viewport editável a 60 FPS
  - Storage dual: NVMe Gen4 pra projeto ativo, HD 4TB pra arquivo
cta_primary: Ver builds prontos pra workstation
cta_secondary: Montar do zero no Builder
meta_title: PC workstation 3D · Blender, Unreal, CAD · Kore Tech
meta_description: Workstations pra Blender, Unreal e CAD. GPU CUDA, 64GB+ RAM, storage dual. Render Cycles em GPU, viewport UE5 Nanite a 60 FPS.
```

---

## 8. Entry gamer

```yaml
slug: entry-gamer
nome: Entry gamer
headline: Primeiro PC gamer, sem cair em pegadinha
subheadline: Builds entry checados peça por peça. Roda os jogos do momento em 1080p, com folga pra upgrade futuro. Sem fonte ruim que vai queimar daqui 6 meses, sem RAM lenta que limita CPU boa.
bullets:
  - Roda Valorant 144 FPS, Fortnite 90 FPS, GTA V ultra no 1080p
  - Fonte com folga pra upgrade: troca a GPU em 2 anos sem trocar a fonte
  - Configuração em até 12x sem juros, ticket entre R$ 2.500 e R$ 4.000
cta_primary: Ver builds prontos pra começar
cta_secondary: Montar do zero no Builder
meta_title: Primeiro PC gamer · Builds entry conferidos · Kore Tech
meta_description: PCs entry gamer entre R$ 2.500 e R$ 4.000. Valorant 144 FPS, Fortnite 90 FPS no 1080p. Fonte com folga pra upgrade futuro. 12x sem juros.
```

---

## Padrões cross-persona (Frontend/Growth)

### Estrutura visual da landing (sem copy, só pra coordenação)
1. Hero: headline + subheadline + CTA primary + CTA secondary (referência hero da home)
2. Strip de 3 bullets (ícone SVG + texto)
3. Section "Builds prontos pra {persona}" — 3 cards de PC montado (PCBuildCard) com FPS estimado
4. Section "FPS estimado em jogos populares" — tabela ou mini-cards
5. Section "Quer customizar? Monte do zero" — link pro Builder
6. Section "Perguntas frequentes" — 4 a 6 perguntas (Copy futuro em `COPY-FAQ-PERSONAS.md`)

### Tom — variações por persona

| Persona | Tom específico |
|---|---|
| Valorant 240 FPS | Tático, fala em flick, latência, tier (Diamante+) |
| Fortnite competitivo | Fala em build battle, arena, modo Performance vs DX12 |
| CS2 high-tier | Foca em cache L3 e CPU (não vende GPU absurda à toa) |
| Edição 4K | Fala em DaVinci, Premiere, scrubbing, render, H.265 |
| Streaming | Fala em OBS, NVENC, x264, encode paralelo |
| IA local Llama | Fala em VRAM, quantização, layer offload, tokens/s |
| Workstation 3D | Fala em Blender Cycles, UE5, Nanite, Lumen, viewport |
| Entry gamer | Mais didático, explica "pegadinha", foca em durabilidade e upgrade |

### Anti-padrões nas landings

- ❌ "Para verdadeiros gamers" — excludente
- ❌ "Performance imbatível" — sem número
- ❌ "A escolha perfeita pra você" — vazia
- ❌ Headline > 50 caracteres — quebra layout no mobile
- ❌ Subheadline > 200 caracteres — vira parágrafo
- ❌ Bullet sem número quando o número está disponível

---

## Pendências pra outros agentes

- [Backend] Cada slug acima precisa virar `Persona.slug` no banco com seed correspondente.
- [Frontend] Componente `PersonaHero.tsx` consome `headline`, `subheadline`, `bullets`, `cta_primary`, `cta_secondary`.
- [Growth] Meta title e meta description vão pro `<Head>` da landing. JSON-LD `WebPage` com `description` igual ao `meta_description`.
- [Designer] Cada persona pode ter cor de destaque secundária mantendo o cyan único? Ou só foto de hero diferente? Decisão sua.
- [Data Analyst] Evento `view_persona` no GA4 com `persona_slug` como param.
