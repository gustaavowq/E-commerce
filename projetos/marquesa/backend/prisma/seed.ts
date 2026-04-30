// =============================================================================
// Marquesa — Seed
// Cria 2 users (admin + cliente). Senha gerada randomicamente se não vier do
// env (printa no console no fim). Idempotente: roda quantas vezes precisar.
//
// Imóveis: tenta carregar de projetos/marquesa/assets/catalogo.json (criado
// pelo Copywriter). Se não existir, popula 3 placeholders.
// =============================================================================

import 'dotenv/config'
import { PrismaClient, type ImovelTipo, type ImovelStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)
const ROOT_BACKEND = path.resolve(__dirname, '..')
const ROOT_PROJETO = path.resolve(ROOT_BACKEND, '..')
const CATALOGO_PATH = path.join(ROOT_PROJETO, 'assets', 'catalogo.json')

type CatalogoImovel = {
  slug?: string
  titulo: string
  descricao: string
  tipo: ImovelTipo
  status?: ImovelStatus
  preco: number
  precoSinal?: number
  area: number
  areaTotal?: number
  quartos: number
  suites?: number
  banheiros: number
  vagas?: number
  endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  latitude: number
  longitude: number
  fotos: string[]
  videoUrl?: string
  destaque?: boolean
  novidade?: boolean
  iptuAnual?: number
  condominio?: number
  amenidades?: string[]
}

function genPassword(): string {
  // 16 chars random com letra+número (acima do mín 8 do validador).
  const base = crypto.randomBytes(8).toString('base64url').slice(0, 12)
  return `${base}aA1!`
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

const SINAL_PCT = Number(process.env.SINAL_DEFAULT_PERCENT ?? 5) / 100

function calcSinal(preco: number, override?: number): number {
  if (override && override > 0) return Number(override.toFixed(2))
  return Number((preco * SINAL_PCT).toFixed(2))
}

const PLACEHOLDERS: CatalogoImovel[] = [
  {
    titulo:    'Cobertura duplex no Itaim Bibi',
    descricao: 'Cobertura duplex impecável com 280m², acabamentos em mármore travertino, terraço com piscina privativa e vista panorâmica do skyline paulistano. Living integrado, 4 suítes, home theater. Pé-direito duplo na sala. 4 vagas demarcadas.',
    tipo: 'COBERTURA',
    preco: 8_900_000,
    area: 280,
    areaTotal: 320,
    quartos: 4, suites: 4, banheiros: 5, vagas: 4,
    endereco: 'Rua Joaquim Floriano, 1000',
    bairro: 'Itaim Bibi', cidade: 'São Paulo', estado: 'SP', cep: '04534-002',
    latitude: -23.4982, longitude: -46.6402,  // Cantareira (mata)
    fotos: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&w=1600',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&w=1600',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&w=1600',
    ],
    destaque: true,
    iptuAnual: 38_000,
    condominio: 4_500,
    amenidades: ['piscina-privativa', 'sauna', 'churrasqueira', 'lareira', 'terraço'],
  },
  {
    titulo:    'Apartamento garden em Pinheiros',
    descricao: 'Garden de 180m² + 60m² de jardim privativo. Living com pé-direito de 3.2m, suíte master com closet, 3 dormitórios, lavabo. Cozinha gourmet integrada. Edifício novo com lazer completo: piscina, academia, salão gourmet.',
    tipo: 'APARTAMENTO',
    preco: 3_200_000,
    area: 180, areaTotal: 240,
    quartos: 3, suites: 1, banheiros: 4, vagas: 2,
    endereco: 'Rua dos Pinheiros, 500',
    bairro: 'Pinheiros', cidade: 'São Paulo', estado: 'SP', cep: '05422-001',
    latitude: -23.5613, longitude: -46.7180,  // próximo a parque
    fotos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&w=1600',
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&w=1600',
      'https://images.unsplash.com/photo-1560185009-5bf9f2849488?auto=format&w=1600',
    ],
    destaque: true,
    novidade: true,
    iptuAnual: 14_000,
    condominio: 2_200,
    amenidades: ['jardim-privativo', 'piscina', 'academia', 'salão-gourmet'],
  },
  {
    titulo:    'Casa de campo em Itaipava',
    descricao: 'Casa em condomínio fechado, 4 suítes, piscina aquecida, quadra de tênis particular. Terreno de 2.500m² com mata nativa. Lareira na sala principal, churrasqueira, suíte master com hidromassagem.',
    tipo: 'CASA',
    preco: 4_500_000,
    area: 420, areaTotal: 2500,
    quartos: 4, suites: 4, banheiros: 6, vagas: 6,
    endereco: 'Estrada do Rosário, s/n - Condomínio Boa Vista',
    bairro: 'Itaipava', cidade: 'Petrópolis', estado: 'RJ', cep: '25745-000',
    latitude: -22.3489, longitude: -43.1670,
    fotos: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&w=1600',
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&w=1600',
      'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&w=1600',
    ],
    destaque: false,
    iptuAnual: 12_000,
    condominio: 1_800,
    amenidades: ['piscina-aquecida', 'quadra-tênis', 'churrasqueira', 'lareira', 'mata-nativa'],
  },
]

async function seedUsers() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@marquesa.dev'
  const clienteEmail = process.env.SEED_CLIENTE_EMAIL ?? 'cliente@marquesa.dev'

  let adminPassword = process.env.SEED_ADMIN_PASSWORD
  let clientePassword = process.env.SEED_CLIENTE_PASSWORD
  let adminGerado = false
  let clienteGerado = false

  if (!adminPassword) { adminPassword = genPassword(); adminGerado = true }
  if (!clientePassword) { clientePassword = genPassword(); clienteGerado = true }

  const adminHash   = await bcrypt.hash(adminPassword, 10)
  const clienteHash = await bcrypt.hash(clientePassword, 10)

  await prisma.user.upsert({
    where:  { email: adminEmail },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      name: process.env.SEED_ADMIN_NAME ?? 'Admin Marquesa',
      role: 'ADMIN',
    },
    // Em re-seed, mantém senha existente se foi alterada via painel.
    // Só atualiza nome/role.
    update: {
      name: process.env.SEED_ADMIN_NAME ?? 'Admin Marquesa',
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where:  { email: clienteEmail },
    create: {
      email: clienteEmail,
      passwordHash: clienteHash,
      name: process.env.SEED_CLIENTE_NAME ?? 'Cliente Demo',
      role: 'USER',
    },
    update: {
      name: process.env.SEED_CLIENTE_NAME ?? 'Cliente Demo',
    },
  })

  return {
    admin:   { email: adminEmail,   password: adminGerado ? adminPassword : '[mantida do .env]', gerada: adminGerado },
    cliente: { email: clienteEmail, password: clienteGerado ? clientePassword : '[mantida do .env]', gerada: clienteGerado },
  }
}

async function loadCatalogo(): Promise<CatalogoImovel[]> {
  if (fs.existsSync(CATALOGO_PATH)) {
    try {
      const raw = fs.readFileSync(CATALOGO_PATH, 'utf-8')
      const parsed = JSON.parse(raw) as CatalogoImovel[] | { imoveis: CatalogoImovel[] }
      const arr = Array.isArray(parsed) ? parsed : parsed.imoveis
      if (Array.isArray(arr) && arr.length > 0) {
        console.log(`[seed] catalogo.json carregado (${arr.length} imóveis)`)
        return arr
      }
    } catch (err) {
      console.warn('[seed] erro lendo catalogo.json — usando placeholders:', (err as Error).message)
    }
  }
  console.log('[seed] catalogo.json não encontrado, usando 3 placeholders')
  return PLACEHOLDERS
}

async function seedImoveis() {
  const items = await loadCatalogo()
  let created = 0
  let updated = 0

  for (const item of items) {
    const slug = item.slug ?? slugify(`${item.titulo}-${item.bairro}-${item.cidade}`)
    const precoSinal = calcSinal(item.preco, item.precoSinal)

    const data = {
      slug,
      titulo:     item.titulo,
      descricao:  item.descricao,
      tipo:       item.tipo,
      status:     item.status ?? 'DISPONIVEL',
      preco:      item.preco,
      precoSinal,
      area:       item.area,
      areaTotal:  item.areaTotal ?? null,
      quartos:    item.quartos,
      suites:     item.suites ?? 0,
      banheiros:  item.banheiros,
      vagas:      item.vagas ?? 0,
      endereco:   item.endereco,
      bairro:     item.bairro,
      cidade:     item.cidade,
      estado:     item.estado.toUpperCase(),
      cep:        item.cep,
      latitude:   item.latitude,
      longitude:  item.longitude,
      fotos:      item.fotos,
      videoUrl:   item.videoUrl ?? null,
      destaque:   item.destaque ?? false,
      novidade:   item.novidade ?? false,
      iptuAnual:  item.iptuAnual ?? null,
      condominio: item.condominio ?? null,
      amenidades: item.amenidades ?? [],
    }

    const existing = await prisma.imovel.findUnique({ where: { slug } })
    if (existing) {
      await prisma.imovel.update({ where: { slug }, data })
      updated++
    } else {
      await prisma.imovel.create({ data })
      created++
    }
  }

  return { created, updated, total: items.length }
}

async function seedSettings() {
  await prisma.siteSettings.upsert({
    where:  { id: 'default' },
    create: {
      id: 'default',
      storeName: 'Marquesa',
      storeTagline: 'Imobiliária boutique',
      sinalDefaultPercent: Number(process.env.SINAL_DEFAULT_PERCENT ?? 5),
      reservaDuracaoDias:  Number(process.env.RESERVA_DURACAO_DIAS ?? 10),
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? '+5511900000000',
      email:          process.env.CONTACT_EMAIL ?? 'contato@marquesa.dev',
    },
    update: {},  // não sobrescreve edições do painel
  })
}

async function main() {
  console.log('========================================')
  console.log(' Marquesa — seed inicial')
  console.log('========================================')

  await seedSettings()
  console.log('[seed] settings ok')

  const users = await seedUsers()
  console.log('[seed] users ok')

  const imoveis = await seedImoveis()
  console.log(`[seed] imóveis: ${imoveis.created} criados, ${imoveis.updated} atualizados (total ${imoveis.total})`)

  console.log('')
  console.log('========================================')
  console.log(' CREDENCIAIS')
  console.log('========================================')
  console.log(` ADMIN     ${users.admin.email}`)
  console.log(` Senha     ${users.admin.password}`)
  console.log('')
  console.log(` CLIENTE   ${users.cliente.email}`)
  console.log(` Senha     ${users.cliente.password}`)
  console.log('========================================')
  if (users.admin.gerada || users.cliente.gerada) {
    console.log(' >> Senhas geradas randomicamente — guarda agora.')
    console.log(' >> Pra reusar entre re-seeds, define SEED_ADMIN_PASSWORD/SEED_CLIENTE_PASSWORD no .env')
  }
  console.log('')
}

main()
  .catch(e => {
    console.error('[seed] falhou:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
