# 📸 Como extrair fotos e identidade visual do Instagram da Miami Store

> **Documento mantido pelo Tech Lead.** Última atualização: 2026-04-25.
>
> **Por quê este documento existe:** o Designer (Agente 02) precisa de imagens reais e referências visuais do Instagram [@miamii_storee](https://www.instagram.com/miamii_storee/) pra construir o `design-system.md`. Tentamos extrair via WebFetch e o Instagram bloqueia (login wall + base64). Aqui estão as alternativas viáveis, em ordem de recomendação.

---

## ⚠️ Antes de começar — disclaimers importantes

1. **Se a loja é sua (cliente é o dono):** você tem permissão legal pra usar o conteúdo dela. Sem problema nenhum.
2. **Se você não é o dono:** baixar conteúdo pra reutilizar comercialmente sem autorização **viola direitos autorais** das fotos e os Termos do Instagram. Use só pra **referência interna** (paleta, layout, vibe) — não republicar como se fosse seu.
3. **Termos do Instagram:** scraping automatizado tecnicamente vai contra os Termos de Uso. Risco real é ter o IP/conta limitado pelo Instagram, não processo. Mas é informação que você precisa ter.

---

## 🟢 Opção 1 (RECOMENDADA) — Pedir o "Download Your Information" do próprio Instagram

**Quando usar:** se você é o dono da conta @miamii_storee ou tem acesso a quem é.

**Como:**
1. Logar no Instagram com a conta da loja
2. Configurações → Sua atividade → **Baixar suas informações**
3. Pedir formato HTML ou JSON
4. Instagram envia por e-mail um ZIP com **TODAS** as fotos, vídeos, legendas, hashtags, comentários — em até 48h
5. Extrai o ZIP e o Designer já tem tudo localmente, sem ferramenta nenhuma

**Vantagens:** legal, completo, sem bloqueio, fotos em resolução máxima
**Desvantagens:** demora até 48h pra Instagram entregar

---

## 🟡 Opção 2 — `instaloader` (ferramenta Python, gratuita, open source)

**Quando usar:** quer pegar **só os posts públicos** da conta, agora, sem esperar Instagram.

**O que é:** ferramenta CLI feita em Python, baixa posts públicos sem precisar de login. ~10k stars no GitHub. Mantida ativamente.

**Como instalar e usar (no seu PC com Windows):**

```powershell
# 1. Instalar Python (se ainda não tiver)
winget install Python.Python.3.12

# 2. Instalar instaloader
pip install instaloader

# 3. Baixar todos os posts públicos da Miami Store
cd C:\Users\gu\Downloads
instaloader --no-videos --no-metadata-json miamii_storee

# 4. Resultado: pasta C:\Users\gu\Downloads\miamii_storee\
#    com todas as fotos em alta resolução + legenda em .txt
```

**Vantagens:**
- Gratuito, rápido, completo
- Pega capa de cada post, álbuns inteiros, legendas
- Pode pegar Stories destacados também (`--stories`)

**Desvantagens:**
- Tecnicamente vai contra os Termos do Instagram (mas é uso comum pra referência)
- Se rodar muito frequente, Instagram pode bloquear seu IP por algumas horas
- Vídeos e Reels são pesados — flag `--no-videos` recomendada se não precisa

**Comando completo recomendado pra Miami Store:**
```powershell
instaloader --no-videos --no-metadata-json --no-compress-json --post-metadata-txt="{caption}" miamii_storee
```

---

## 🟡 Opção 3 — `gallery-dl` (alternativa ao instaloader)

Funcionalmente parecido com instaloader, suporta dezenas de sites além do Instagram (Pinterest, TikTok, etc.).

```powershell
pip install gallery-dl
gallery-dl https://www.instagram.com/miamii_storee/
```

Use se o instaloader der problema. Mais "esperto" pra contornar bloqueios, mas requer login pra contas privadas.

---

## 🟠 Opção 4 — Manual (lento, mas 100% legal e simples)

**Quando usar:** se nenhuma das opções acima funcionar e você só precisa de 10–20 fotos pra começar.

1. Abrir [@miamii_storee no celular ou desktop](https://www.instagram.com/miamii_storee/)
2. Em cada post, abrir, **botão direito → "Salvar imagem como"**
3. Pra álbuns: clicar pra avançar e salvar uma a uma
4. Salvar tudo em `C:\Users\gu\Downloads\ecommerce-agents\assets\miami-instagram\`

Demorado mas sem ferramenta, sem risco, sem nada.

---

## 🔴 O que NÃO funciona (já testado)

- **WebFetch direto na URL do Instagram:** retorna apenas base64 de imagens placeholder + login wall. **Inútil** pra capturar texto, paleta ou metadados.
- **Instagram Basic Display API:** depende de revisão de app pela Meta + token de usuário. Demora dias e é complicado pra um projeto pequeno.

---

## 📁 Onde colocar as fotos depois de baixar

Quando você tiver as fotos baixadas (qualquer opção acima), organize assim:

```
ecommerce-agents/
└── assets/
    └── miami-instagram/
        ├── posts/                    ← Fotos de produto (catálogo)
        ├── lifestyle/                ← Fotos de modelo / lookbook
        ├── stories-destaque/         ← Capas dos destaques
        ├── logo-marca/               ← Logo da loja se identificável
        └── REFERENCIA-paleta.md      ← Designer anota as cores recorrentes
```

O Designer (Agente 02) usa essa pasta como **referência visual**. Não vai ser o catálogo final do site — é só fonte pra capturar identidade.

---

## 🎨 O que o Designer (Agente 02) deve extrair das imagens

Depois de baixar, o Designer abre 10-15 fotos no Photoshop / Figma e extrai:

1. **Paleta dominante** — usar [coolors.co/image-picker](https://coolors.co/image-picker) ou similar pra tirar 5-7 cores recorrentes
2. **Tipografia das artes** — qual fonte aparece nos banners, stories, capas
3. **Estilo de fotografia** — estúdio plano? rua? modelo? luz natural ou neon?
4. **Composição de produto** — mostrado como? sozinho? em pessoa? mockup?
5. **Tom das legendas** — como falam? Que palavras usam? Quanto emoji?
6. **Hashtags recorrentes** — pra entender posicionamento e nichos

**Tudo isso vira input pra atualizar o `docs/brand-brief.md`** e produzir o `docs/design/design-system.md` final.

---

## 📊 Recomendação prática do Tech Lead

**Pra começar HOJE sem esperar nada:**
1. Faz a Opção 4 (manual) com 10-15 fotos das mais representativas
2. Designer já consegue extrair paleta e estilo dessas
3. Em paralelo, dispara a Opção 1 (Download Your Information) pra ter o backup completo em 48h
4. Quando o ZIP do Instagram chegar, atualiza com o material completo

**Se quiser rápido e completo agora:** Opção 2 (instaloader) — 5 minutos pra instalar Python+ferramenta, depois 1 comando puxa tudo.

---

## ✅ Checklist de "fotos prontas"

- [ ] Pasta `assets/miami-instagram/` criada e populada
- [ ] Pelo menos **15 fotos** de referência visual
- [ ] Designer extraiu paleta dominante (5-7 cores)
- [ ] Designer identificou tipografia das artes
- [ ] `brand-brief.md` atualizado com seções `[A CONFIRMAR]` substituídas
- [ ] `docs/design/design-system.md` criado com tokens reais

Quando todos esses checks tiverem feitos, o Frontend (Agente 03) está desbloqueado pra começar a implementar a loja com identidade visual real.
