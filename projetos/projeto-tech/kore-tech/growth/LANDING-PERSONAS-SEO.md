# LANDING-PERSONAS-SEO — Kore Tech

> SEO ON-PAGE de cada uma das 8 landing pages de persona em `/builds/[slug]`. Killer feature de tráfego do projeto.
>
> Personas alinhadas com brief (`08-growth` no brief): Valorant 240fps, Fortnite competitivo, CS2 high-tier, Edição Vídeo 4K, Streaming, IA Local Llama, Workstation 3D, Entry Gamer.

**Convenção comum a todas:**

- `<html lang="pt-BR">`
- `og:type = "website"`, `twitter:card = "summary_large_image"`
- `canonical = https://koretech.com.br/builds/[slug]`
- JSON-LD `BreadcrumbList`: Home → Builds prontos → [Persona]
- JSON-LD `WebPage` com `mainEntity` referenciando `ItemList` dos 3 PCs prontos sugeridos
- Link interno padrão (no fim de cada landing):
  - 3 PCs prontos relacionados (mesma persona, ordenados por preço crescente)
  - CTA pro Builder com query `?persona=[slug]` (vem pré-filtrado)
  - Link pro Glossário se mencionar termo técnico avançado
- Cor primária visual: `#00E5FF` (cyan) com gradiente sutil dark

---

## 1. Valorant 240fps

| Campo | Valor |
|---|---|
| **Slug** | `valorant-240fps` |
| **URL** | `/builds/valorant-240fps` |
| **Persona** | Player competitivo de Valorant que precisa de 240+ FPS estáveis em monitor de alta taxa |
| **H1** | `PC pra rodar Valorant a 240 FPS — sem stutter, sem desculpa` |
| **H2** | `240 FPS no Valorant 1080p high — builds prontos a partir de R$ X.XXX` |
| **Meta title** | `PC pra Valorant 240 FPS | Build pronto a partir de R$ X.XXX | Kore Tech` |
| **Meta description** | `Builds pra rodar Valorant em 240 FPS estáveis no 1080p high. CPU + GPU + RAM ajustados pro motor da Riot. Parcelado em 12x, frete BR.` |
| **Keywords primárias** | "pc pra rodar valorant 240fps", "pc para valorant competitivo" |
| **Keywords secundárias** | "pc valorant 240hz", "build valorant pro player", "valorant requisitos 240fps" |
| **CTA primário** | `Ver os 3 PCs prontos` (scroll suave pra grid) |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=valorant-240fps` |
| **Links internos** | 3 PCs prontos (Bronze/Prata/Ouro de Valorant) + builder + `/produtos/rtx-4070-super` + `/produtos/ryzen-7-7800x3d` + `/glossario#fps` |

**JSON-LD WebPage + BreadcrumbList:**

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "PC pra Valorant 240 FPS — Kore Tech",
  "description": "Builds prontos pra rodar Valorant em 240 FPS estáveis no 1080p high.",
  "url": "https://koretech.com.br/builds/valorant-240fps",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://koretech.com.br/" },
      { "@type": "ListItem", "position": 2, "name": "Builds prontos", "item": "https://koretech.com.br/builds" },
      { "@type": "ListItem", "position": 3, "name": "Valorant 240 FPS", "item": "https://koretech.com.br/builds/valorant-240fps" }
    ]
  },
  "mainEntity": {
    "@type": "ItemList",
    "name": "PCs prontos pra Valorant 240fps",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://koretech.com.br/pcs/valorant-bronze" },
      { "@type": "ListItem", "position": 2, "url": "https://koretech.com.br/pcs/valorant-prata" },
      { "@type": "ListItem", "position": 3, "url": "https://koretech.com.br/pcs/valorant-ouro" }
    ]
  }
}
```

---

## 2. Fortnite Competitivo

| Campo | Valor |
|---|---|
| **Slug** | `fortnite-competitivo` |
| **URL** | `/builds/fortnite-competitivo` |
| **Persona** | Player que joga Performance Mode mirando 144+ FPS estáveis em build/edit fights |
| **H1** | `PC pra Fortnite competitivo — 144+ FPS no Performance Mode` |
| **H2** | `Builds com prioridade em CPU rápida e RAM ágil — pra build fight sem perder frame` |
| **Meta title** | `PC pra Fortnite competitivo | 144+ FPS Performance Mode | Kore Tech` |
| **Meta description** | `Builds otimizados pro Fortnite competitivo: 144+ FPS no Performance Mode 1080p. CPU rápida + RAM 6000MHz. Parcelado em 12x.` |
| **Keywords** | "pc pra rodar fortnite competitivo", "pc pra rodar fortnite 144fps", "build fortnite pro" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=fortnite-competitivo` |
| **Links internos** | 3 PCs (Bronze/Prata/Ouro) + builder + `/produtos/ryzen-7-7800x3d` + `/produtos/ddr5-32gb-6000` + `/glossario#1ahit-latency` |

**JSON-LD:** análogo ao Valorant, trocando nome/url/itemList.

---

## 3. CS2 High-Tier

| Campo | Valor |
|---|---|
| **Slug** | `cs2-high-tier` |
| **URL** | `/builds/cs2-high-tier` |
| **Persona** | Player com aim-trainer que joga CS2 mirando 300+ FPS pra ler peek/flick com vantagem |
| **H1** | `PC pra CS2 high-tier — 300+ FPS estáveis em qualquer mapa` |
| **H2** | `CPU monstra + monitor 240/360Hz: peek primeiro, atira primeiro` |
| **Meta title** | `PC pra CS2 high-tier | 300+ FPS estáveis | Kore Tech` |
| **Meta description** | `Builds CS2 com 300+ FPS em qualquer mapa, do Mirage ao Anubis. CPU 7800X3D ou Intel 14700K. Mouse polling 8000Hz suportado.` |
| **Keywords** | "pc pra rodar cs2", "pc pra rodar cs2 alto fps", "pc cs2 300fps" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=cs2-high-tier` |
| **Links internos** | 3 PCs + builder + `/produtos/ryzen-7-7800x3d` + `/produtos/intel-14700k` + `/produtos/monitor-360hz-1080p` + `/glossario#frame-time` |

---

## 4. Edição Vídeo 4K

| Campo | Valor |
|---|---|
| **Slug** | `edicao-4k` |
| **URL** | `/builds/edicao-4k` |
| **Persona** | Editor freelancer/profissional usando Premiere/DaVinci/Final Cut em material 4K H.264/HEVC/RAW |
| **H1** | `PC pra editar vídeo 4K — Premiere e DaVinci sem render-bar travando` |
| **H2** | `RAM 64GB + GPU NVENC + NVMe Gen5: timeline 4K em tempo real` |
| **Meta title** | `PC pra edição vídeo 4K | Premiere, DaVinci, Final Cut | Kore Tech` |
| **Meta description** | `Builds com 64GB RAM, GPU com NVENC e NVMe Gen5 dedicado pra cache. Timeline 4K H.264 em tempo real. Render 5x mais rápido vs notebook.` |
| **Keywords** | "pc pra editar video 4k", "pc para edição premiere", "pc davinci resolve 4k" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=edicao-4k` |
| **Links internos** | 3 PCs + builder + `/produtos/ryzen-9-7950x` + `/produtos/rtx-4070-ti-super` + `/produtos/ram-64gb-ddr5` + `/glossario#nvenc` |

---

## 5. Streaming Twitch / YouTube

| Campo | Valor |
|---|---|
| **Slug** | `streaming` |
| **URL** | `/builds/streaming` |
| **Persona** | Streamer que joga e transmite ao mesmo tempo, mira 1080p60 estável sem perder FPS no jogo |
| **H1** | `PC pra streamar Twitch e YouTube — 1080p60 sem perder FPS no jogo` |
| **H2** | `Encoder dedicado em GPU + CPU folgada: stream e gameplay simultâneos sem stutter` |
| **Meta title** | `PC pra streamar Twitch | 1080p60 sem perder FPS | Kore Tech` |
| **Meta description** | `Builds otimizados pra streamar Twitch e YouTube em 1080p60 estável usando NVENC ou x264 medium. Sem queda de FPS no jogo.` |
| **Keywords** | "pc pra streamar twitch", "pc gamer com placa de captura", "pc streaming youtube" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=streaming` |
| **Links internos** | 3 PCs + builder + `/produtos/rtx-4070-super` + `/produtos/ryzen-9-7900x` + `/glossario#nvenc` + `/glossario#x264-preset` |

---

## 6. IA Local Llama

| Campo | Valor |
|---|---|
| **Slug** | `ia-local-llama` |
| **URL** | `/builds/ia-local-llama` |
| **Persona** | Dev / pesquisador / profissional que roda LLMs locais (Llama 3 70B Q4, Mistral, Qwen) sem mandar dado pra cloud |
| **H1** | `PC pra rodar Llama 70B local — sem mandar seu dado pra cloud` |
| **H2** | `24GB+ VRAM, 64GB RAM ECC opcional: Llama 3 70B Q4 a 12 tokens/s` |
| **Meta title** | `PC pra rodar Llama 70B local | IA local sem cloud | Kore Tech` |
| **Meta description** | `Builds pra rodar Llama 70B Q4 local, Mistral 8x7B e Qwen. 24GB+ VRAM, RAM 64GB. Privacidade total, sem mandar dado pra OpenAI ou Google.` |
| **Keywords** | "pc pra rodar llama 70b local", "pc para ia local", "pc para llm local 70b", "rodar llama local" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=ia-local-llama` |
| **Links internos** | 3 PCs + builder + `/produtos/rtx-4090-24gb` + `/produtos/rtx-5080-16gb` + `/produtos/ram-64gb-ddr5-ecc` + `/glossario#vram` + `/glossario#quantization` |

> **Nota Growth:** essa persona tem volume baixo MAS dificuldade SEO baixíssima (15-20). Vamos rankear top 3 em 60-90 dias com 1 landing + 1 blog post complementar.

---

## 7. Workstation 3D

| Campo | Valor |
|---|---|
| **Slug** | `workstation-3d` |
| **URL** | `/builds/workstation-3d` |
| **Persona** | Profissional de Blender / Maya / 3ds Max / Cinema 4D que renderiza cenas pesadas (Cycles, Octane, Redshift) |
| **H1** | `Workstation pra renderização 3D — Blender, Maya, Cinema 4D` |
| **H2** | `CPU multi-core + GPU CUDA/Optix: Cycles 30% mais rápido vs setup notebook` |
| **Meta title** | `Workstation 3D Render | Blender Cycles, Octane, Redshift | Kore Tech` |
| **Meta description** | `Workstations pra Blender Cycles, Octane e Redshift. CPU 12-16 núcleos, GPU CUDA com Optix, RAM 64-128GB ECC. Render 30% mais rápido.` |
| **Keywords** | "workstation 3d render", "pc para blender", "pc para octane render", "pc para maya" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=workstation-3d` |
| **Links internos** | 3 PCs + builder + `/produtos/ryzen-9-7950x` + `/produtos/rtx-4090-24gb` + `/glossario#cuda` + `/glossario#ecc-ram` |

---

## 8. Entry Gamer

| Campo | Valor |
|---|---|
| **Slug** | `entry-gamer` |
| **URL** | `/builds/entry-gamer` |
| **Persona** | Primeiro PC gamer, vem do console ou notebook fraco. Quer rodar os atuais em 1080p high sem quebrar a banca |
| **H1** | `Primeiro PC gamer — roda os atuais em 1080p high sem quebrar a banca` |
| **H2** | `Builds entry de R$ 3.500 a R$ 4.800 — Valorant, Fortnite, GTA V, EAFC, todos 60+ FPS` |
| **Meta title** | `Melhor PC gamer custo benefício 2026 | A partir de R$ X.XXX | Kore Tech` |
| **Meta description** | `Primeiro PC gamer custo-benefício: Valorant 144 FPS, Fortnite 1080p high, GTA V ultra. A partir de R$ X.XXX em 12x sem juros.` |
| **Keywords** | "melhor pc gamer custo benefício 2026", "pc gamer barato", "pc gamer entrada", "primeiro pc gamer" |
| **CTA primário** | `Ver os 3 PCs prontos` |
| **CTA secundário** | `Customizar no Builder` → `/montar?persona=entry-gamer` |
| **Links internos** | 3 PCs + builder + `/produtos/ryzen-5-7600` + `/produtos/rtx-4060` + `/blog/como-montar-pc-gamer` (pillar TOFU) + `/glossario#bottleneck` |

> **Nota Growth:** essa landing serve TAMBÉM como porta de entrada das landings de orçamento (`/builds/ate-5k`, `/ate-7k`, `/ate-10k`) — incluir CTA "Procura por faixa de preço?" linkando pra elas.

---

## 9. Estrutura comum de cada landing (pra Frontend implementar)

Todas seguem o mesmo molde de seções na ordem:

1. **Hero** — H1 + H2 + CTA primário + foto/render do build representativo da persona
2. **FPS estimado em destaque** (badge JetBrains Mono) — 3 jogos icônicos da persona com FPS
3. **3 PCs prontos** (Bronze/Prata/Ouro) com `<PCBuildCard />`
4. **"O que define um PC pra esse uso"** — 3 bullets explicando a escolha técnica (CPU/GPU/RAM/etc) — atende keywords secundárias
5. **CTA Builder** — "Quer customizar? Use o Builder, vem pré-filtrado pra essa persona"
6. **FAQ específica da persona** (3-4 perguntas) — gera schema `FAQPage`
7. **Cross-sell de periféricos relacionados** (mouse + teclado + headset adequado pra persona)
8. **Footer padrão**

---

## 10. Pendências bloqueadas em outros agentes

- **Backend:** API `/api/personas/[slug]` deve retornar `{ slug, name, h1, h2, metaTitle, metaDescription, heroImage, faqs[], suggestedPCs[], suggestedComponents[] }` — esses campos saem do seed
- **Copywriter:** validar/refinar H1/H2 e refinar tagline (ele tem o `BRAND-VOICE.md`). Crio aqui a base; ele pode polir.
- **Designer:** definir crop/foto de hero por persona (8 imagens — pode ser placeholder Cloudinary no MVP)
- **Frontend:** componente `<PersonaHero />` recebe persona via prop e renderiza tudo (já está no brief de Frontend)
