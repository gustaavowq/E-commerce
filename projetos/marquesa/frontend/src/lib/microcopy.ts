// Tipo do microcopy — single source of truth para strings de UI.
// Importa o JSON do projeto. Se o JSON mudar, este shape precisa acompanhar.

import microcopyJson from '../../../copy/microcopy.json'

export type Microcopy = typeof microcopyJson
export const microcopy = microcopyJson as Microcopy

// Helper para interpolar `{n}` etc.
export function interp(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}
