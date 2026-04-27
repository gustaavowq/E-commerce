import { apiGet } from './api'
import type { Persona } from './types'

export async function listPersonas() {
  return apiGet<Persona[]>('/personas')
}

export async function getPersonaBySlug(slug: string) {
  return apiGet<Persona>(`/personas/${encodeURIComponent(slug)}`)
}
