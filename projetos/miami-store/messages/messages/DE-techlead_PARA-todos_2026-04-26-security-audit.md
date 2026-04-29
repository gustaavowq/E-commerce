# DE: Tech Lead | PARA: TIME | Data: 2026-04-26

## Security audit + correções

Cliente pediu pentest antes do deploy real. Vamos cobrir OWASP Top 10 no que faz sentido HOJE (sem TLS/WAF que dependem do deploy).

## Plano

**Fase 1 — 3 pentesters em paralelo**
- 01-backend: auth, authorization, IDOR, SQL injection, mass assignment, JWT, rate limit nos endpoints da API
- 03-frontend: XSS, CSRF, headers de segurança, secrets em bundle, sanitização de output
- 05-devops: npm audit, secrets em .env e código, Helmet, CORS, dependências vulneráveis

**Fase 2 — Tech Lead sintetiza**

**Fase 3 — Correções em paralelo por área**

**Fase 4 — QA retesta os vetores + smoke geral**

## Regras

- Pentesters NÃO modificam código nessa fase. Só identificam.
- Ataque deve ser **não-destrutivo** (sem dropar tabela, sem flood real). Usar tokens reais conhecidos pra testar, não fazer brute real.
- Reportem com prioridade: **CRÍTICO** (acesso indevido, RCE, dados vazando) / **ALTO** (auth fraca, IDOR limitado) / **MÉDIO** (headers ausentes, deps com CVE médio) / **BAIXO** (info disclosure, hardening).
- URLs ativas:
  - LOJA: https://tunes-tap-contacts-moral.trycloudflare.com
  - PAINEL: https://dropped-models-colin-deutsch.trycloudflare.com
  - API: https://called-measuring-relay-alarm.trycloudflare.com
- Admin: admin@miami.store / miami2026

Bora.
