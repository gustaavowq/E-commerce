'use client'

import { useMemo } from 'react'
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react'
import { useBuilder } from '@/stores/builder'
import { cn } from '@/lib/utils'

/**
 * Mostra erros / warnings / sucessos de compatibilidade.
 * Cores: success / warning / danger conforme severidade.
 */
export function BuilderCompatibilityBar() {
  const issues = useBuilder((s) => s.issues)
  const isValid = useBuilder((s) => s.isValid)
  const totalWattage = useBuilder((s) => s.totalWattage)
  const lastChecked = useBuilder((s) => s.lastCheckedAt)

  const grouped = useMemo(() => {
    return {
      danger: issues.filter((i) => i.level === 'danger'),
      warning: issues.filter((i) => i.level === 'warning'),
      success: issues.filter((i) => i.level === 'success'),
    }
  }, [issues])

  if (!lastChecked && issues.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-secondary">
        <Info className="h-4 w-4 text-text-muted" />
        Adicione pecas pra ver compatibilidade.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-sm',
          !isValid
            ? 'border-danger/60 bg-danger/10 text-danger'
            : grouped.warning.length > 0
              ? 'border-warning/60 bg-warning/10 text-warning'
              : 'border-success/60 bg-success/10 text-success',
        )}
      >
        <div className="flex items-center gap-2">
          {!isValid ? (
            <XCircle className="h-5 w-5" />
          ) : grouped.warning.length > 0 ? (
            <AlertTriangle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          <span className="font-semibold">
            {!isValid
              ? `${grouped.danger.length} ${grouped.danger.length === 1 ? 'incompatibilidade' : 'incompatibilidades'}`
              : grouped.warning.length > 0
                ? `${grouped.warning.length} ${grouped.warning.length === 1 ? 'aviso' : 'avisos'}`
                : 'Tudo compativel'}
          </span>
        </div>
        <span className="font-specs text-xs">{totalWattage > 0 ? `${totalWattage} W consumo` : ''}</span>
      </div>

      {issues.length > 0 && (
        <ul className="space-y-1.5">
          {grouped.danger.map((it, i) => (
            <li key={`d-${i}`} className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/5 px-3 py-2 text-xs text-danger">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{it.message}</span>
            </li>
          ))}
          {grouped.warning.map((it, i) => (
            <li key={`w-${i}`} className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {it.message}
                {it.fixSuggestion?.description && (
                  <span className="ml-1 text-text-secondary">{', '}{it.fixSuggestion.description}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
