# Playbook — Auth cross-device smoke test

> Caso fundador: patrão do Gustavo tentou criar conta no PC dele. Falhou todas as vezes. Bug invisível pro dev (funcionava no PC dele).
> Lição relacionada: [[../30-LICOES/29-auth-cross-device]].

## Quando rodar

- **Antes de declarar deploy de prod aprovado** (toda primeira vez).
- **Sempre que mudar**: cookies, CORS, CSP, JWT, middleware de auth, rate-limit.

## Setup mínimo

Você precisa de acesso a:

1. **PC diferente do dev** (notebook secundário, PC do cliente, ou VM Windows).
2. **Smartphone real** (não emulador) com 4G ativado (testar fora do wifi do dev).
3. **Browsers**: Chrome, Safari (Mac), Firefox, Edge (Windows), Insta in-app browser.
4. **Conta de teste limpa**: email não usado antes.

## Suite (10 cenários obrigatórios)

### A. Desktop matrix

- [ ] **Chrome (Win), janela anônima**: criar conta → recebe email confirmação → login → vê dashboard
- [ ] **Chrome (Win), janela normal**: login + logout + login de novo
- [ ] **Edge (Win)**: criar conta + login
- [ ] **Firefox**: criar conta + login com cookies de terceiros bloqueados (Settings > Privacy > Strict)
- [ ] **Safari (Mac)**: criar conta + login (Safari é o mais restritivo com cookies cross-domain)

### B. Mobile matrix

- [ ] **iOS Safari** (real): criar conta + login
- [ ] **Android Chrome em 4G** (não wifi do dev): criar conta + login
- [ ] **Insta in-app browser**: mandar URL pro Insta DM, abrir, criar conta + login

### C. Recuperação

- [ ] **Reset password** completo: solicita reset → email chega → link funciona → senha nova → login com senha nova
- [ ] **Sessão persiste** após fechar/abrir browser

## Bugs típicos por cenário (consulta rápida)

| Cenário falhou | Causa provável | Onde olhar |
|---|---|---|
| Safari Mac OK no dev, falha no PC do cliente | Adblock | Console: request bloqueado |
| Tudo OK em janela anônima, falha em normal | Cookie velho corrompido | DevTools → Storage → clear cookies |
| Chrome OK, Firefox falha | Cookie SameSite=None+Secure | [[../30-LICOES/29-auth-cross-device#1]] |
| Mobile 4G falha, mobile wifi do dev passa | CSP `connect-src` ou rate-limit | [[../30-LICOES/05-csp-connect-src]] |
| Cliente em rede corporativa: 1º login OK, depois "Too many requests" | `app.set('trust proxy', 1)` faltando | [[../30-LICOES/29-auth-cross-device#3]] |
| Insta in-app falha "Erro de rede" | In-app browser bloqueia 3rd-party cookies | Usar Authorization header (não cookie) |
| Reset password: link "expirou" ao clicar | TTL do token muito curto OU clock skew | Backend: verificar `exp` do JWT de reset |
| Login OK mas reload deslogou | Zustand persist sem hydrated flag | [[../30-LICOES/14-zustand-persist-race]] |

## Documentação obrigatória

Após rodar, documentar em `projetos/[slug]/qa/AUTH-CROSS-DEVICE.md`:

```markdown
# Auth cross-device smoke — [DATA]

## Matriz testada
| Cenário | Status | Notas |
|---|---|---|
| Chrome Win anônimo (criar conta) | ✅ | OK |
| Safari Mac (criar conta) | ❌ | Cookie SameSite — fix em [[link]] |
| ... | | |

## Bugs encontrados
- ...

## Próxima rodada
- Quando: ...
```

Sem essa doc, **deploy não passa**.

## Lições relacionadas

- [[../30-LICOES/29-auth-cross-device]] — causas-raiz catalogadas.
- [[../30-LICOES/02-cookie-cross-domain]]
- [[../30-LICOES/05-csp-connect-src]]
- [[../30-LICOES/14-zustand-persist-race]]
- [[../50-PADROES/auth-pattern-completo]] — pattern aprovado.
