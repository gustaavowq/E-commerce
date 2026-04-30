// Tipos compartilhados pra resposta do Backend Marquesa.
// Backend envia Decimal como string em JSON; convertemos com Number() na borda.

export type Role = 'USER' | 'ADMIN' | 'ANALYST'

export type ImovelTipo =
  | 'APARTAMENTO'
  | 'CASA'
  | 'COBERTURA'
  | 'SOBRADO'
  | 'TERRENO'
  | 'COMERCIAL'

export type ImovelStatus =
  | 'DISPONIVEL'
  | 'RESERVADO'
  | 'EM_NEGOCIACAO'
  | 'VENDIDO'
  | 'INATIVO'

export type ReservaStatus = 'ATIVA' | 'EXPIRADA' | 'CANCELADA' | 'CONVERTIDA'

export type PagamentoStatus =
  | 'PENDENTE'
  | 'APROVADO'
  | 'REJEITADO'
  | 'CANCELADO'
  | 'REEMBOLSADO'

export interface User {
  id: string
  email: string
  name: string
  phone?: string | null
  role: Role
  createdAt?: string
}

// ImovelListItem — payload reduzido do GET /api/imoveis
export interface ImovelListItem {
  id: string
  slug: string
  titulo: string
  tipo: ImovelTipo
  status: ImovelStatus
  preco: string | number
  precoSinal: string | number
  area: number
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  endereco: string
  bairro: string
  cidade: string
  estado: string
  fotos: string[]
  destaque: boolean
  novidade: boolean
  createdAt: string
}

// ImovelDetail — payload completo do GET /api/imoveis/:slug
export interface ImovelDetail extends ImovelListItem {
  descricao: string
  areaTotal?: number | null
  cep: string
  latitude: number
  longitude: number
  videoUrl?: string | null
  tourUrl?: string | null
  iptuAnual?: string | number | null
  condominio?: string | number | null
  amenidades: string[]
  updatedAt: string
}

// ImovelWritePayload — separado pro CRUD admin (lição feedback_tipos_write_read_separados.md)
export interface ImovelWritePayload {
  titulo: string
  slug?: string
  descricao: string
  tipo: ImovelTipo
  status?: ImovelStatus
  preco: number
  precoSinal?: number
  area: number
  areaTotal?: number
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  latitude: number
  longitude: number
  fotos: string[]
  destaque?: boolean
  novidade?: boolean
  iptuAnual?: number
  condominio?: number
  amenidades: string[]
}

export interface Reserva {
  id: string
  imovelId: string
  imovel?: Pick<ImovelListItem, 'id' | 'slug' | 'titulo' | 'fotos' | 'preco' | 'bairro' | 'cidade'>
  userId: string
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>
  status: ReservaStatus
  pagamentoStatus: PagamentoStatus
  valorSinal: string | number
  precoSnapshot: string | number
  mpInitPoint?: string | null
  paidAt?: string | null
  expiraEm: string
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  imovelId: string
  imovel?: Pick<ImovelListItem, 'id' | 'slug' | 'titulo' | 'bairro'>
  userId?: string | null
  nome: string
  email: string
  telefone?: string | null
  mensagem?: string | null
  contatado: boolean
  contatadoEm?: string | null
  createdAt: string
}

// Dashboard — espelha shape REAL de /api/admin/dashboard/summary
export interface DashboardKpis {
  ticketMedio: number
  conversao: number          // %
  taxaFechamento: number     // %
  receitaPrevista: number
  receitaSinaisAtivos: number
  reservasAtivasCount: number
  totalImoveis: number
  imoveisDisponiveis: number
  imoveisVendidos: number
}

export interface FunnelEtapa {
  etapa: string
  count: number
}

export interface ImovelEngajamento {
  id: string
  slug: string
  titulo: string
  bairro: string
  viewCount: number
  preco: number
  fotos: string[]
  leads: number
  reservas: number
  score: number
}

export interface DistribuicaoTipo {
  tipo: ImovelTipo
  count: number
}

export interface ImoveisPorStatus {
  status: ImovelStatus
  count: number
}

export interface SerieDia {
  day: string        // YYYY-MM-DD
  leads: number
  reservas: number
  receita: number
}

export interface ReservasAtivasResumo {
  count: number
  somaSinais: number
  somaPrecoCheio: number
}

export interface DashboardSummary {
  kpis: DashboardKpis
  funil: FunnelEtapa[]
  topImoveis: ImovelEngajamento[]
  reservasAtivasResumo: ReservasAtivasResumo
  distribuicaoTipo: DistribuicaoTipo[]
  imoveisPorStatus: ImoveisPorStatus[]
  serie30d: SerieDia[]
}

export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number }
}

export interface ApiErrorBody {
  success: false
  error: { code: string; message: string; details?: unknown }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody

export interface ListResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
