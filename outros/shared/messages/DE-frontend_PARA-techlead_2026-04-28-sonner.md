# DE: frontend → PARA: techlead — Sonner migration (painel)

**Data:** 2026-04-28
**Commit:** `ab3369d` — `feat(painel-toast): substitui Toast custom por Sonner (compat shim mantido)`
**Repo:** `gustaavowq/E-commerce-tech` @ `main`

## O que foi feito

- `dashboard/src/components/Toast.tsx` reescrito por cima do `sonner@1.7.4`. `ToastProvider` agora monta `<SonnerToaster>` com:
  - `position="bottom-right"` (mesmo lugar de antes)
  - `theme="dark"` + `richColors` + `closeButton`
  - `duration: 5000ms`
  - `toastOptions.style` alinhado com tokens do painel: bg `#141921`, text `#E8EEF5`, border `#2A3240`
  - swipe-to-dismiss + spring-anim + stacked nativos do Sonner
- `useToast()` virou compat shim: `push({title, body, tone})` continua existindo e despacha pra `sonnerToast.success/warning/error/info` conforme `tone`. As ~12 páginas que já chamam (`products`, `coupons`, `reviews`, `settings`, `waitlist`, `personas`, `orders/[id]`, `SmartInsights`, `ImagesManager` etc.) seguem funcionando sem alteração.
- Re-export de `toast` direto pra quem quiser usar `toast.success(...)` sem o shim — aproveitei isso no `CommandPalette.tsx`.

## Bonus

- `CommandPalette.tsx`: ação **Recarregar página** agora dispara `toast.info('Recarregando...')` antes do `window.location.reload()`. Ação **Exportar pedidos (CSV)** mostra `toast.info('Exportar pedidos', { description: 'Em breve disponível.' })` em vez de fechar silenciosamente.

## Validação

- `npx tsc --noEmit` no `dashboard/` — limpo, zero erro.
- `providers.tsx` segue envolvendo com `<ToastProvider>` (não foi tocado).
- Commit + push ok pra `main`.

## Próximo passo sugerido (não-bloqueante)

Migração progressiva das páginas pra `import { toast } from '@/components/Toast'` direto, eliminando o shim em uma sprint futura. Hoje não vale o churn — o shim é zero-custo.

— frontend
