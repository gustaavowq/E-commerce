# DE: qa | PARA: techlead | Data: 2026-04-26 | Sprint 1 — Kore Tech

## Status: ENTREGUE

Sprint 1 do QA é **só documentação** (apps em construção paralela). Execução real será no Sprint 2 (smoke + bug bash) e Sprint 3 (security audit).

---

## Roteiros entregues

Em `projetos/projeto-tech/kore-tech/qa/`:

| Arquivo | Conteúdo | Volume |
|---|---|---|
| `SMOKE-E2E.md` | 14 passos numerados do happy path completo (home → persona → PDP → cart → checkout → admin → registro → forgot password) | ~270 linhas |
| `BUILDER-E2E.md` | 20 passos do PC Builder (escolha CPU AM5 → mobos só AM5 → RAM só DDR5 → GPU + warning de PSU → recálculo dinâmico → gabinete + cooler + checkout) | ~290 linhas |
| `PENTEST-CHECKLIST.md` | OWASP Top 10 + lições Miami: JWT_SECRET, IDOR (cart/order/admin/build), XSS, CSRF, rate limit, CORS, CSP, headers Helmet, cookie httpOnly, webhook MP HMAC, upload Cloudinary, builder validation | ~370 linhas |
| `BUGBASH-UX.md` | 14 heurísticas obrigatórias (links, HTML válido, imagens, estados loading/empty/error, mobile 375/768/1280/1920, a11y, performance, confirms, voz da marca, cross-browser, console) + catálogo bugs Miami + 10 bugs Kore Tech específicos | ~340 linhas |
| `EDGE-CASES.md` | 20 cenários de borda específicos do nicho hardware (frete pesado, cupom BUILDER10 só via builder, waitlist transição stock, race condition PC stock=1, DOA D+5 vs CDC D+90, devolução D+7 reembolsa frete, acumulação cupom, peça descontinuada em build salvo, lacre violado, Pix expirado, etc) | ~440 linhas |

Total: ~1.700 linhas de documentação executável (cada item tem critério passou/não passou).

---

## Cenários extras descobertos durante a redação

Surgiram da leitura cruzada PESQUISA-NICHO + lições Miami + brief. Não estavam no escopo original do brief, mas valem destaque:

1. **Race condition PC montado stock=1** (EDGE #5) — atomic decrement Postgres `UPDATE ... WHERE stock>0 RETURNING` é mandatório. Se backend implementar com `findFirst` + `update` separado, vende 2x.
2. **Build salvo com peça descontinuada** (EDGE #9) — cliente salva em jan, admin tira do catálogo em mar, cliente abre em abr. Precisa detecção + sugestão de substituto.
3. **Comparador "montado vs peças soltas"** (EDGE #17) — pain do cliente novato (PESQUISA seção 11). Vale checar se Frontend implementou isso na PDP de PC montado.
4. **Build público compartilhado vaza dados owner** (EDGE #19 + BUGBASH #14) — `/builds/share/[slug]` não pode expor email/nome do criador, só specs.
5. **Estoque negativo defensivo** (EDGE #20) — constraint Postgres `CHECK (stock >= 0)` + alerta painel admin. Bug latente em qualquer e-commerce.
6. **Cron de waitlist transferindo reserva expirada** (EDGE #15) — não basta notificar, precisa de TTL + transferência automática pra próximo da fila.
7. **Spec JSON malformado quebrando PDP** (EDGE #16) — backend valida no save, frontend defensivo. Caso clássico que aparece quando admin importa CSV.
8. **Wattagem somada com 2 GPUs (multi-GPU)** (BUGBASH #15) — edge raro mas possível em workstation IA. Builder precisa decidir: bloqueia (MVP) ou suporta (V2).

---

## Riscos identificados pré-execução

### Críticos potenciais (vai virar pentest crítico se não cuidar):

1. **JWT_SECRET com placeholder** (lição #01 Miami) — Backend precisa garantir `z.string().min(32)` SEM `.default()` no `env.ts`. Documentei explicitamente em PENTEST.
2. **CSP `connect-src` sem hosts API** (lição #05 Miami) — Frontend + Dashboard precisam listar `*.up.railway.app, *.vercel.app, api.mercadopago.com, res.cloudinary.com` no `next.config.mjs`. Se esquecer, login não funciona.
3. **Cookie `Domain=.kore.test` em ambiente Vercel/Railway** (lições #02 + #07 Miami) — DevOps tem que documentar `COOKIE_DOMAIN=` vazio em ambiente sem domínio próprio. Se não, cookie não persiste.
4. **`_devResetUrl` na response /forgot** (security-audit Miami) — Backend precisa garantir que NUNCA vaza, mesmo em dev. Pentester do Miami fez account takeover com isso.
5. **Race condition PC stock=1** — depende 100% de implementação atomic do Backend. Se usar `findFirst` + `update` separado, é vulnerável.
6. **Builder check-compatibility aceitar IDs de produto rascunho** — vaza specs de produtos não-publicados. Backend precisa filtrar `isActive=true`.

### Altos (release vai ter ressalva):

7. **Mobile do builder** — diferencial competitivo nº 1 do projeto. Se quebrar em mobile, perdemos adoção. BUILDER-E2E lista 6 cenários mobile específicos.
8. **Validação cupom BUILDER10** — regra "só via builder" depende de flag `cart.source='builder'` ou similar. Se Frontend/Backend não conversaram sobre isso, cupom funciona em qualquer compra (margem corrói).
9. **Frete de gabinete pesado (15kg)** — Correios tem limites. Se calculadora não trata, vira disputa.
10. **Lista de espera sem TTL de reserva** — sem expiração, estoque congela. Cron precisa rodar.

### Médios (V2 hardening):

11. **Container USER non-root** no Dockerfile (deploy hardening Miami)
12. **Postgres porta exposta em prod** (depende deploy real, irrelevante em demo)
13. **HSTS preload** (depende domínio próprio)
14. **WAF Cloudflare** (depende domínio próprio)
15. **`npm audit` periódico** (CI futuro)

---

## Dependências de outros agentes

Pra executar os roteiros no Sprint 2/3, preciso destes prontos:

- **Backend:** todas as rotas funcionando + seed completo (8 personas, ~30 componentes com `compatibility` JSON correto, 8 PCs montados, cupons MVP), **especialmente** atomic decrement em `/api/orders` e validação Zod em `/api/builder/check-compatibility`
- **Frontend:** todas as 12+ páginas funcionais + Builder com filtro por compatibilidade real (não mock) + componentes `WaitlistButton`, `BuilderCompatibilityBar`, `BuilderPSURecommendation`, `FPSBadge`, `SpecsTable` ativos
- **Dashboard:** dashboard com KPIs + CRUD de produtos com campos extras (compatibility, benchmarkFps, weight, dimensions) + página de waitlist por produto
- **DevOps:** docker-compose subindo + `.env.example` com placeholders documentados (COOKIE_DOMAIN comentado, JWT_SECRET com aviso)
- **Copywriter:** strings de empty states, mensagens de erro, copy de cupom — todas sem travessão e sem emoji
- **Designer:** tokens de cores `success/warning/danger` aplicados no Builder (visual feedback de compatibilidade)
- **Data Analyst:** endpoints de dashboard funcionais pra validar passo 9 do SMOKE
- **Growth:** cupons MVP populados com regras corretas (BUILDER10 com flag `requiresBuilderOrigin=true`)

---

## Pendências pra próximo Sprint

### Sprint 2 (após integração)
- Executar SMOKE-E2E completo
- Executar BUILDER-E2E completo
- Executar BUGBASH-UX (todas as 14 heurísticas em todas as páginas)
- Reportar bugs em `DE-qa_PARA-techlead_2026-XX-XX-bugs-sprint2.md` com formato `[arquivo:linha]`

### Sprint 3 (security audit)
- Executar PENTEST-CHECKLIST item por item
- Executar EDGE-CASES (20 cenários)
- Aprovação final pra release: `DE-qa_PARA-techlead_2026-XX-XX-aprovacao.md`

---

## Observações finais

- Todos os arquivos seguem o **formato de relatório QA** definido no SKILL.md (vereditos, severidade, arquivo:linha, fix sugerido)
- Cada checklist tem **critério passa/não passa explícito** — não dá pra "achar que está OK"
- Lições Miami estão referenciadas com link relativo onde aplicável (`memoria/30-LICOES/01-jwt-secret-placeholder.md`, etc)
- Princípio guia: **edge cases existem porque realidade é mais maluca que planejamento**. Se Sprint 2/3 descobrir cenário novo, vai pra `EDGE-CASES.md` + atualiza `memoria/30-LICOES/` se virou bug.

— QA, Sprint 1, 2026-04-26
