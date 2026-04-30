# Bug bash UX estático — Marquesa

**De:** QA · **Para:** Tech Lead · **Data:** 2026-04-29
**Método:** code review estático de componentes/páginas. Sem browser real.

Severidade: CRITICO (bloqueia release), MEDIO (vale fix antes), PEQUENO (V1.1).

---

## CRITICO

### 1. Painel reservas — todas as ações enviam payload errado pro backend
**Arquivo:** `frontend/src/app/painel/reservas/page.tsx:25-27`
**Sintoma:** mutação envia `{ action: 'extender' | 'converter' | 'cancelar' }`. Backend (`backend/src/routes/admin/reservas.ts:78` + `validators/reserva.ts:13`) aceita `{ status?, notesAdmin?, extenderDias? }`. Submeter "Estender" / "Marcar vendido" / "Cancelar" no painel retorna 422 silencioso.
**Fix sugerido:** mapear `action` pra payload correto:
```ts
const payloadFromAction = (a: string) => a === 'extender' ? { extenderDias: 7 }
  : a === 'converter' ? { status: 'CONVERTIDA' }
  : a === 'cancelar' ? { status: 'CANCELADA' } : {}
```

### 2. Senha mínima diverge frontend × backend
**Arquivo:** `frontend/src/app/auth/register/RegisterForm.tsx:19` (`min(8)`) vs `backend/src/validators/auth.ts:15` (`min(10) + letra+número+especial`).
**Microcopy:** `erros.senha_curta` diz "8 caracteres" (`microcopy.json:211`).
**Sintoma:** cliente cria senha tipo `senha1234` (8 chars), passa client-side, backend devolve 422 sem detalhes amigáveis. UX quebrada.
**Fix:** alinhar pelo backend (10 + letra/número/especial). Atualizar `RegisterForm.tsx` schema, atualizar microcopy.

### 3. Painel `/painel/leads` chama endpoint inexistente
**Arquivo:** `frontend/src/app/painel/leads/page.tsx:15-22`
**Sintoma:** chama `/api/admin/leads` (não existe no backend), fallback chama `/api/leads` (não existe — só POST). Tabela sempre fica vazia mesmo com leads no DB.
**Fix:** criar `backend/src/routes/admin/leads.ts` (GET listar com filtros) + montar em `admin/index.ts`. Padrão de `clientes.ts` serve como referência.

### 4. Painel dashboard chama endpoint inexistente
**Arquivo:** `frontend/src/app/painel/page.tsx:33`
**Sintoma:** chama `/api/admin/dashboard/summary` (não existe). Fallback pra `/api/admin/dashboard/kpis` retorna **shape diferente** do que o componente espera (`SummaryResponse` com `kpis.{visitas, leads, sinaisPagos, ticketMedio, ...}`, mas backend retorna `{ imoveis, reservas, leads, financeiro }`). Dashboard renderiza só `(0 0 0%) ...` em todos cards.
**Fix:** Data-Analyst implementa `GET /api/admin/dashboard/summary` retornando shape do contrato `SummaryResponse`. Ou ajustar frontend pra mapear de `kpis`. Bloqueia dashboard útil.

### 5. Sort `recentes` no frontend × `recent` no backend
**Arquivos:** `frontend/src/app/(loja)/page.tsx:73` e `frontend/src/components/loja/FiltersBar.tsx:8,21`. Backend `validators/imovel.ts:28` aceita `['recent', 'precoAsc', 'precoDesc', 'areaDesc']`.
**Sintoma:** Zod silenciosamente substitui por default (`recent`) quando recebe `recentes`. Mas se cliente filtrar por `precoAsc` na UI ele PASSA (string match). Só "recentes" cai no default. Não é bloqueador funcional, mas é desalinhamento.
**Fix:** trocar todos `'recentes'` pra `'recent'` no frontend (ou aceitar ambos no backend).

### 6. `precoSinal` mismatch backend ↔ DECISOES
**Arquivos:** `DECISOES-ESPECIFICAS.md:16` diz "5% default, 1-5% configurável", `backend/.env.example:42` diz `SINAL_DEFAULT_PERCENT=2`, `prisma/schema.prisma:289` `sinalDefaultPercent Int @default(2)`, `microcopy.json:107` checkout label diz "Valor do sinal (5%)" hard-coded, `ImovelForm.tsx:191` hint "Se vazio, usa 5% do preço."
**Sintoma:** UI mostra "5%" ao usuário mas backend calcula 2%. Cliente vê valor diferente ao redirecionar pro MP.
**Fix:** alinhar `SINAL_DEFAULT_PERCENT=5` no env (alinha com brand promise) OU corrigir microcopy/hint pra "1-5%, configurável por imóvel". Data-Analyst e Tech-Lead decidem qual o real.

### 7. `RESERVA_DURACAO_DIAS` mismatch backend ↔ DECISOES ↔ microcopy
**Arquivos:** `DECISOES-ESPECIFICAS.md:16` "10 dias corridos", `backend/.env.example:45` `RESERVA_DURACAO_DIAS=7`, `schema.prisma:290` `reservaDuracaoDias @default(7)`, `microcopy.json:109` checkout `"prazo_valor": "10 dias corridos"`, `ImovelActions.tsx:34` hard-coded "10 dias corridos".
**Sintoma:** UI promete 10 dias, backend trava só 7. Cliente verifica reserva 8 dias depois e ela já expirou.
**Fix:** decidir 7 ou 10, atualizar env + microcopy + texto hard-coded em ImovelActions. Recomendado: 10 (alinha com prática de mercado BR pra arras).

---

## MEDIO

### 8. `.env.example` DATABASE_URL aponta porta 5432, docker-compose dev expõe 5433
**Arquivos:** `backend/.env.example:11` (`localhost:5432`) vs `infra/docker-compose.yml:26` (`127.0.0.1:5433:5432`).
**Sintoma:** primeiro `npm run dev` falha com ECONNREFUSED. Onboarding ruim.
**Fix:** trocar `.env.example` pra `localhost:5433` (compose usa 5433 pra evitar conflito com Postgres locais já em 5432).

### 9. NewsletterCapture cria Lead órfão atrelado a imóvel arbitrário
**Arquivo:** `frontend/src/components/loja/NewsletterCapture.tsx:26-46`
**Sintoma:** newsletter exige `imovelId` no schema do Lead. Componente faz GET destaque + POST lead com `nome: 'Newsletter'`. Acaba poluindo a tabela de leads do imóvel destaque com inscrições de newsletter — KPI conversao_lead vai inflar incorretamente.
**Fix:** rota dedicada `POST /api/newsletter` ou tabela separada. Comentário do componente já reconhece o trade-off.

### 10. Falta endpoint `GET /api/admin/leads`
**Sintoma:** painel leads não funciona (item 3 acima). Mas inclusive no caso geral, falta CRUD admin de leads (marcar como contatado, etc — schema tem campos `contatado`/`contatadoEm` sem rota que toque).

### 11. Login não tem opção Google que microcopy promete
**Arquivo:** `microcopy.json:175-176` tem `auth.ou_continuar_com` e `auth.google: "Continuar com Google"`. `LoginForm.tsx` não usa.
**Sintoma:** copy órfã (não bloqueia, mas inconsistência) OU promessa visual quebrada se design intencionou login Google.
**Fix:** remover do microcopy ou implementar OAuth Google (V1.1).

### 12. Mobile menu `<button>` sem `type="button"`
**Arquivo:** `frontend/src/components/loja/Header.tsx:71-79`
**Sintoma:** botão de toggle mobile do menu. Default `type` em form é `submit`. Aqui não tem form ao redor mas é boa prática setar.
**Fix:** adicionar `type="button"`. Idem botão sair do mobile menu (linha 105).

### 13. Lightbox PDP sem aria-modal a11y completo
**Arquivo:** `frontend/src/components/loja/PdpGallery.tsx:101-142`
**Sintoma:** tem `role="dialog"` + `aria-modal="true"` MAS:
- Sem `aria-label` no `<div role="dialog">` (lightbox em si não tem nome).
- Sem focus trap (Tab vaza pro background).
- Botões nav (`‹` `›` `×`) não tem `type="button"`.
**Fix:** adicionar `aria-label="Galeria"` no role=dialog, `type="button"` nos botões. Focus trap fica pra V1.1.

### 14. Pagination `aria-disabled` sem `tabIndex={-1}` ou guard
**Arquivo:** `frontend/src/app/(loja)/imoveis/page.tsx:140-156`
**Sintoma:** `<a href="...">` com `aria-disabled` ainda é clicável (vai pra página 0 ou inexistente). Aria sem prevenção real.
**Fix:** condicional renderizar `<span>` ao invés de `<a>` quando desabilitado.

### 15. ImovelForm sem feedback de slug duplicado
**Arquivo:** `frontend/src/components/painel/ImovelForm.tsx`
**Sintoma:** se admin tentar criar 2 imóveis com mesmo slug, backend retorna 409 CONFLICT genérico. Form mostra mensagem do erro mas pode parecer críptico.
**Fix:** parse mais explícito do `error.code === 'CONFLICT'` no form pra mostrar "Slug já existe, escolha outro".

### 16. Dashboard `/painel/page.tsx:103,113` `(valor*100).toFixed(1) + '%'` em endpoint que já retorna percentual
**Arquivo:** `frontend/src/app/painel/page.tsx:103, 113`
**Sintoma:** `conversaoLeadParaSinalPercent` em backend já vem como `Number(... * 100).toFixed(1)` (`backend/src/routes/admin/dashboard.ts:60`). Frontend multiplica por 100 de novo. Mostraria "5300.0%" em vez de "53%".
**Fix:** alinhar contrato (backend retorna ratio 0-1 ou já-percentual) e ajustar frontend. Como o `summary` ainda nem existe, isso bate quando o Data-Analyst implementar.

---

## PEQUENO

### 17. Hover scale do Card é só na imagem (correto, lição 28)
**Arquivo:** `frontend/src/components/loja/ImovelCard.tsx:29`
**Status:** OK — `group-hover:scale-[1.03]` está aplicado SÓ em `<Image>` dentro do container, não no card todo. Vizinhos não são afetados. Memória capturada.

### 18. `placehold.co` fallback no PdpGallery e ImovelCard
**Arquivos:** `ImovelCard.tsx:13` e `PdpGallery.tsx:16`
**Sintoma:** anti-pattern listado em SKILL.md. Fallback de imagem deveria ser placeholder estático local (`/public/imovel-placeholder.svg` ou similar). Como seed real popula 20 imóveis com fotos Unsplash válidas, isso só dispara se algum admin salvar imóvel sem foto. Cosmético.
**Fix:** trocar por SVG inline em `public/`. Brief Designer pode fornecer.

### 19. Cookie domain hardcoded — OK
**Arquivo:** `backend/src/routes/auth.ts:39`, `config/env.ts:25`
**Status:** `COOKIE_DOMAIN` é optional, vazio = host exato. Lição Kore Tech (`feedback_files_migrate_outros.md` / 02-cookie-cross-domain) capturada.

### 20. `scroll-behavior: smooth` global — OK
**Arquivo:** `frontend/src/app/globals.css:68-73`
**Status:** comment explícito "NUNCA scroll-behavior: smooth global". Lição 27 capturada.

### 21. Truncate em `<span>` (lição 21) — OK
Procurei `truncate` em spans. `frontend/src/app/painel/leads/page.tsx:64`: `<Td className="text-ash max-w-xs truncate">` — Td renderiza `<td>` (block-level), OK. Outros usos: `text-ink truncate` em `<p>` — bloco, OK. Sem violação.

### 22. Animações invasivas — OK
Sem cursor glow, sem parallax, sem scroll-jacking. ScrollReveal é IntersectionObserver run-once com fade+translateY 32px → 0, 700ms, prefers-reduced-motion respeitado. Ok.

### 23. Empty states — OK na maioria
- `ImovelGrid` empty: tem fallback amigável ("Limpe os filtros…").
- Painel imoveis: "Carregando…" e tabela vazia com header. Sem CTA "criar primeiro" — cosmético.
- Painel reservas: "Nenhuma reserva encontrada." OK.
- Painel leads: "Nenhum lead recebido." OK (mas chama endpoint errado, item 3).
- Painel clientes: "Nenhum cliente encontrado." OK.

### 24. Loading states com skeleton — OK
`ImovelGridSkeleton` em `/imoveis`. Painel usa "Carregando…" texto (poderia ser skeleton, mas aceitável).

### 25. Touch target ≥ 44px — não validado sem viewport
Botões "container-marquesa" usam `py-4` (32px) + `px-8`. Linha 47 do Hero: 64px+ horizontal, ~52px vertical. OK em desktop. Mobile: `py-3` em filtros = 24px, **risco** se também houver text-body-sm. Validar visualmente no smoke (item 5 do checklist).

### 26. Microcopy "termos_aceitar" usado em ReservaCheckout — OK
`ReservaCheckout.tsx:37` usa `microcopy.validacoes.termos_aceitar`. OK.

### 27. ImovelForm hint hard-coded "5%" mas env é 2%
**Arquivo:** `ImovelForm.tsx:191` `hint="Se vazio, usa 5% do preço."`
**Sintoma:** já listado item 6. Se decidir 5%, microcopy alinha. Se decidir 2%, ajustar hint.
