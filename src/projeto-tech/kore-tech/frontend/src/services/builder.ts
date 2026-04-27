import { apiGet, apiPost } from './api'
import type {
  BuilderCheckResponse,
  BuilderPart,
  PsuRecommendation,
  SavedBuild,
  ProductListItem,
  ProductCategory,
} from './types'

export async function checkCompatibility(parts: BuilderPart[]) {
  return apiPost<BuilderCheckResponse>('/builder/check-compatibility', { parts })
}

export async function recommendPsu(parts: BuilderPart[]) {
  return apiPost<PsuRecommendation>('/builder/recommend-psu', { parts })
}

/**
 * Lista produtos compativeis com a build atual filtrados por categoria-alvo.
 * Backend pode aceitar isso direto ou cair em fallback de listProducts({ category }).
 */
export async function listCompatibleProducts(category: ProductCategory, parts: BuilderPart[]) {
  return apiPost<ProductListItem[]>(`/builder/compatible/${encodeURIComponent(category)}`, { parts })
}

export async function saveBuild(input: { name?: string; parts: BuilderPart[]; isPublic?: boolean }) {
  return apiPost<SavedBuild>('/builds', input)
}

export async function getBuildBySlug(shareSlug: string) {
  return apiGet<SavedBuild>(`/builds/${encodeURIComponent(shareSlug)}`)
}

export async function listMyBuilds() {
  return apiGet<SavedBuild[]>('/builds')
}
