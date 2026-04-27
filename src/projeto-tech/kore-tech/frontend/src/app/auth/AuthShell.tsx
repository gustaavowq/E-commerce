import Link from 'next/link'
import { Logo } from '@/components/Logo'
import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Shell visual compartilhado das paginas de auth (login / register / forgot / reset).
 * Lado esquerdo: form. Lado direito (≥ lg): hero institucional Kore Tech.
 */
export function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-start gap-3">
            <Logo />
            <div>
              <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
            </div>
          </div>
          {children}
          {footer && <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-surface lg:flex lg:items-center lg:justify-center">
        <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-md px-10 py-16">
          <p className="font-specs text-xs font-bold uppercase tracking-widest text-primary">Sua conta na Kore Tech</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-text">
            Builds salvos. Pedidos rastreados. Lista de espera ativa.
          </h2>
          <p className="mt-4 text-sm text-text-secondary">
            Crie conta pra salvar PCs do builder, acompanhar entrega passo a passo e receber alerta quando uma GPU
            voltar ao estoque. Reservamos 24h pra primeiros da fila.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              Pix com 5% off, parcele em 12x sem juros
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              Builds salvos compartilhaveis com link
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
              Alerta quando GPU/CPU volta ao estoque
            </li>
          </ul>
          <p className="mt-8 text-xs text-text-muted">
            Continuar no <Link href="/" className="text-primary hover:underline">site sem login</Link>? Tudo bem, voce
            so perde os builds salvos e o aviso de estoque.
          </p>
        </div>
      </aside>
    </div>
  )
}
