/**
 * Seed inicial da Miami Store.
 *
 * Cria:
 *   - 1 ADMIN (credenciais via env SEED_ADMIN_*)
 *   - 5 marcas (Lacoste, Nike, Adidas, Tommy, Polo Ralph Lauren)
 *   - 9 categorias
 *   - 6 produtos de exemplo (todos Lacoste, baseados no Instagram real)
 *   - 2 cupons (PIXFIRST 5% off, FRETE10 frete grátis)
 *
 * Idempotente: rodar várias vezes não duplica (usa upsert por slug/email).
 *
 * Como rodar (dentro do container):
 *   docker exec -it miami-backend npm run prisma:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedAdmin() {
  const email    = process.env.SEED_ADMIN_EMAIL    ?? 'admin@miami.store'
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'miami2026'
  const name     = process.env.SEED_ADMIN_NAME     ?? 'Admin Miami Store'

  const passwordHash = await bcrypt.hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: 'ADMIN' },
    update: { name, role: 'ADMIN' },
  })

  console.log(`✔ Admin: ${admin.email} (id=${admin.id})`)
  console.log(`  Senha: ${password}  ⚠️ TROQUE em produção`)
  return admin
}

async function seedBrands() {
  const data = [
    { slug: 'lacoste',  name: 'Lacoste',                sortOrder: 1 },
    { slug: 'nike',     name: 'Nike',                   sortOrder: 2 },
    { slug: 'adidas',   name: 'Adidas',                 sortOrder: 3 },
    { slug: 'tommy',    name: 'Tommy Hilfiger',         sortOrder: 4 },
    { slug: 'polo-rl',  name: 'Polo Ralph Lauren',      sortOrder: 5 },
  ]
  const brands = await Promise.all(
    data.map(b => prisma.brand.upsert({
      where:  { slug: b.slug },
      create: b,
      update: { name: b.name, sortOrder: b.sortOrder, isActive: true },
    })),
  )
  console.log(`✔ Marcas: ${brands.length}`)
  return Object.fromEntries(brands.map(b => [b.slug, b]))
}

async function seedCategories() {
  const data = [
    { slug: 'polos',           name: 'Polos',                 sortOrder: 1 },
    { slug: 'camisetas',       name: 'Camisetas',             sortOrder: 2 },
    { slug: 'tenis',           name: 'Tênis',                 sortOrder: 3 },
    { slug: 'bones',           name: 'Bonés',                 sortOrder: 4 },
    { slug: 'conjuntos',       name: 'Conjuntos Esportivos',  sortOrder: 5 },
    { slug: 'bermudas',        name: 'Bermudas / Shorts',     sortOrder: 6 },
    { slug: 'jaquetas',        name: 'Jaquetas / Moletons',   sortOrder: 7 },
    { slug: 'calcas',          name: 'Calças',                sortOrder: 8 },
    { slug: 'acessorios',      name: 'Acessórios',            sortOrder: 9 },
  ]
  const cats = await Promise.all(
    data.map(c => prisma.category.upsert({
      where:  { slug: c.slug },
      create: c,
      update: { name: c.name, sortOrder: c.sortOrder, isActive: true },
    })),
  )
  console.log(`✔ Categorias: ${cats.length}`)
  return Object.fromEntries(cats.map(c => [c.slug, c]))
}

type Brand    = { id: string }
type Category = { id: string }

async function seedProducts(brands: Record<string, Brand>, categories: Record<string, Category>) {
  // Lacoste como carro-chefe (é o que aparece no Instagram da Miami Store).
  // Imagens são fotos reais do Instagram, copiadas pra src/frontend/public/products/.
  const products = [
    {
      slug: 'polo-lacoste-vermelha',
      name: 'Polo Lacoste Vermelha',
      description: 'Polo Lacoste original. Vermelho fechado, gola canelada, jacaré bordado. Vem com etiqueta e caixa. Veste no corpo, não fica frouxa nem apertada. Boa pra uma rolê de fim de tarde, churrasco, treino, o que rolar.',
      basePrice: 249.90,
      comparePrice: 349.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.polos!.id,
      isFeatured: true,
      measureTable: { tipo: 'polo', P: { peito: 50, comprimento: 70 }, M: { peito: 53, comprimento: 72 }, G: { peito: 56, comprimento: 74 }, GG: { peito: 59, comprimento: 76 } },
      variations: [
        { sku: 'LCS-POL-VER-P', size: 'P',  color: 'Vermelho', colorHex: '#D32F2F', stock: 5 },
        { sku: 'LCS-POL-VER-M', size: 'M',  color: 'Vermelho', colorHex: '#D32F2F', stock: 12 },
        { sku: 'LCS-POL-VER-G', size: 'G',  color: 'Vermelho', colorHex: '#D32F2F', stock: 8 },
        { sku: 'LCS-POL-VER-GG',size: 'GG', color: 'Vermelho', colorHex: '#D32F2F', stock: 3 },
      ],
      images: [
        { url: '/products/polo-lacoste-vermelha-1.jpg', alt: 'Polo Lacoste Vermelha em detalhe', isPrimary: true,  sortOrder: 0 },
        { url: '/products/polo-lacoste-vermelha-2.jpg', alt: 'Polo Lacoste Vermelha estampa CROCODILE', isPrimary: false, sortOrder: 1 },
        { url: '/products/polo-lacoste-vermelha-3.jpg', alt: 'Polo Lacoste Vermelha vista posterior', isPrimary: false, sortOrder: 2 },
      ],
    },
    {
      slug: 'tenis-lacoste-marinho-branco',
      name: 'Tênis Lacoste Marinho com Branco',
      description: 'Tênis Lacoste em couro, cabedal marinho, solado branco. Vem na caixa verde da marca. Combina com jeans, jogger, bermuda. Conforto pro dia inteiro.',
      basePrice: 449.90,
      comparePrice: 599.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.tenis!.id,
      isFeatured: true,
      measureTable: { tipo: 'calcado', '38': { equiv_eur: 38 }, '39': { equiv_eur: 39 }, '40': { equiv_eur: 40 }, '41': { equiv_eur: 41 }, '42': { equiv_eur: 42 }, '43': { equiv_eur: 43 } },
      variations: [
        { sku: 'LCS-TEN-MAR-39', size: '39', color: 'Marinho', colorHex: '#0D2C54', stock: 4 },
        { sku: 'LCS-TEN-MAR-40', size: '40', color: 'Marinho', colorHex: '#0D2C54', stock: 6 },
        { sku: 'LCS-TEN-MAR-41', size: '41', color: 'Marinho', colorHex: '#0D2C54', stock: 7 },
        { sku: 'LCS-TEN-MAR-42', size: '42', color: 'Marinho', colorHex: '#0D2C54', stock: 5 },
        { sku: 'LCS-TEN-MAR-43', size: '43', color: 'Marinho', colorHex: '#0D2C54', stock: 2 },
      ],
      images: [
        { url: '/products/tenis-lacoste-marinho-branco-1.jpg', alt: 'Tênis Lacoste Marinho/Branco com caixa Lacoste', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'tenis-lacoste-preto-vermelho',
      name: 'Tênis Lacoste Preto com Vermelho',
      description: 'Tênis Lacoste preto, palmilha vermelha, "LACOSTE" estampado no calcanhar. Vem na caixa verde original. Discreto na cor, marcante no detalhe.',
      basePrice: 449.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.tenis!.id,
      isFeatured: false,
      measureTable: { tipo: 'calcado' },
      variations: [
        { sku: 'LCS-TEN-PTO-39', size: '39', color: 'Preto', colorHex: '#0A0A0A', stock: 3 },
        { sku: 'LCS-TEN-PTO-40', size: '40', color: 'Preto', colorHex: '#0A0A0A', stock: 5 },
        { sku: 'LCS-TEN-PTO-41', size: '41', color: 'Preto', colorHex: '#0A0A0A', stock: 6 },
        { sku: 'LCS-TEN-PTO-42', size: '42', color: 'Preto', colorHex: '#0A0A0A', stock: 4 },
      ],
      images: [
        { url: '/products/tenis-lacoste-preto-vermelho-1.jpg', alt: 'Tênis Lacoste Preto com Vermelho na caixa Lacoste', isPrimary: true,  sortOrder: 0 },
        { url: '/products/tenis-lacoste-preto-vermelho-2.jpg', alt: 'Tênis Lacoste Preto detalhe lateral',                isPrimary: false, sortOrder: 1 },
        { url: '/products/tenis-lacoste-preto-vermelho-3.jpg', alt: 'Tênis Lacoste Preto vista superior',                 isPrimary: false, sortOrder: 2 },
      ],
    },
    {
      slug: 'bone-lacoste-classico',
      name: 'Boné Lacoste Clássico',
      description: 'Boné Lacoste dad hat. Tecido encorpado, jacaré bordado, fivela ajustável (cabe em qualquer cabeça). Cores que tão saindo: verde, vermelho, marinho, branco e preto. Vem com etiqueta de original.',
      basePrice: 159.90,
      comparePrice: 199.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.bones!.id,
      isFeatured: true,
      measureTable: { tipo: 'bone', unico: 'Ajustável (54-60cm)' },
      variations: [
        { sku: 'LCS-BON-VRD', size: 'Único', color: 'Verde',   colorHex: '#1B5E20', stock: 10 },
        { sku: 'LCS-BON-VER', size: 'Único', color: 'Vermelho',colorHex: '#D32F2F', stock: 8 },
        { sku: 'LCS-BON-MAR', size: 'Único', color: 'Marinho', colorHex: '#0D2C54', stock: 12 },
        { sku: 'LCS-BON-BCO', size: 'Único', color: 'Branco',  colorHex: '#FFFFFF', stock: 6 },
        { sku: 'LCS-BON-PTO', size: 'Único', color: 'Preto',   colorHex: '#0A0A0A', stock: 9 },
      ],
      images: [
        { url: '/products/bone-lacoste-classico-1.jpg', alt: 'Bonés Lacoste em várias cores', isPrimary: true, sortOrder: 0 },
        { url: '/products/bone-lacoste-classico-2.jpg', alt: 'Boné Lacoste vista lateral',     isPrimary: false, sortOrder: 1 },
      ],
    },
    {
      slug: 'conjunto-lacoste-tactel-marinho',
      name: 'Conjunto Lacoste Tactel',
      description: 'Conjunto Lacoste em tactel. Jaqueta com zíper e detalhe LACOSTE no peito, calça com elástico no pé. Combinação azul claro com marinho que aparece em todo lugar agora. Cabe na pegada esportiva e no rolê também.',
      basePrice: 549.90,
      comparePrice: 699.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.conjuntos!.id,
      isFeatured: true,
      measureTable: { tipo: 'conjunto', P: { peito: 50, cintura: 75 }, M: { peito: 53, cintura: 79 }, G: { peito: 56, cintura: 83 }, GG: { peito: 59, cintura: 87 } },
      variations: [
        { sku: 'LCS-CNJ-MAR-P',  size: 'P',  color: 'Marinho', colorHex: '#0D2C54', stock: 3 },
        { sku: 'LCS-CNJ-MAR-M',  size: 'M',  color: 'Marinho', colorHex: '#0D2C54', stock: 5 },
        { sku: 'LCS-CNJ-MAR-G',  size: 'G',  color: 'Marinho', colorHex: '#0D2C54', stock: 4 },
        { sku: 'LCS-CNJ-MAR-GG', size: 'GG', color: 'Marinho', colorHex: '#0D2C54', stock: 2 },
      ],
      images: [
        { url: '/products/conjunto-lacoste-tactel-marinho-1.jpg', alt: 'Conjunto Lacoste Tactel jaqueta azul claro com calça marinho', isPrimary: true,  sortOrder: 0 },
        { url: '/products/conjunto-lacoste-tactel-marinho-2.jpg', alt: 'Conjunto Lacoste Tactel detalhe da jaqueta',                    isPrimary: false, sortOrder: 1 },
        { url: '/products/conjunto-lacoste-tactel-marinho-3.jpg', alt: 'Conjunto Lacoste Tactel composição completa',                   isPrimary: false, sortOrder: 2 },
        { url: '/products/conjunto-lacoste-tactel-marinho-4.jpg', alt: 'Conjunto Lacoste Tactel vista alternativa',                     isPrimary: false, sortOrder: 3 },
      ],
    },
    {
      slug: 'camiseta-lacoste-jacare-grande-preta',
      name: 'Camiseta Lacoste Jacaré Estampado',
      description: 'Camiseta preta com jacaré grande estampado em verde no peito. Tecido pesado, gola reforçada. Marca a presença sem precisar abrir a boca.',
      basePrice: 189.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.camisetas!.id,
      isFeatured: false,
      measureTable: { tipo: 'camiseta', P: { peito: 50 }, M: { peito: 53 }, G: { peito: 56 }, GG: { peito: 59 } },
      variations: [
        { sku: 'LCS-CAM-PTO-P',  size: 'P',  color: 'Preto', colorHex: '#0A0A0A', stock: 6 },
        { sku: 'LCS-CAM-PTO-M',  size: 'M',  color: 'Preto', colorHex: '#0A0A0A', stock: 9 },
        { sku: 'LCS-CAM-PTO-G',  size: 'G',  color: 'Preto', colorHex: '#0A0A0A', stock: 7 },
        { sku: 'LCS-CAM-PTO-GG', size: 'GG', color: 'Preto', colorHex: '#0A0A0A', stock: 0 },  // sem estoque pra testar
      ],
      images: [
        { url: '/products/camiseta-lacoste-jacare-grande-preta-1.jpg', alt: 'Camiseta Lacoste preta com jacaré grande estampado', isPrimary: true, sortOrder: 0 },
      ],
    },
    {
      slug: 'polo-lacoste-branca-sport',
      name: 'Polo Lacoste Sport Branca',
      description: 'Polo Lacoste linha Sport branca com detalhe marinho na manga e amarelo neon nos punhos. Tecido leve, seca rápido. Boa pra calor, ginástica ou só pra ficar fresco no dia a dia.',
      basePrice: 269.90,
      comparePrice: 379.90,
      brandId: brands.lacoste!.id,
      categoryId: categories.polos!.id,
      isFeatured: true,
      measureTable: { tipo: 'polo', P: { peito: 50, comprimento: 70 }, M: { peito: 53, comprimento: 72 }, G: { peito: 56, comprimento: 74 }, GG: { peito: 59, comprimento: 76 } },
      variations: [
        { sku: 'LCS-POL-BCO-P', size: 'P',  color: 'Branco', colorHex: '#FFFFFF', stock: 4 },
        { sku: 'LCS-POL-BCO-M', size: 'M',  color: 'Branco', colorHex: '#FFFFFF', stock: 7 },
        { sku: 'LCS-POL-BCO-G', size: 'G',  color: 'Branco', colorHex: '#FFFFFF', stock: 5 },
        { sku: 'LCS-POL-BCO-GG',size: 'GG', color: 'Branco', colorHex: '#FFFFFF', stock: 2 },
      ],
      images: [
        { url: '/products/polo-lacoste-branca-1.jpg', alt: 'Polo Lacoste Sport Branca', isPrimary: true,  sortOrder: 0 },
        { url: '/products/polo-lacoste-branca-2.jpg', alt: 'Polo Lacoste Sport detalhe', isPrimary: false, sortOrder: 1 },
      ],
    },
  ] as const

  for (const p of products) {
    // 1. Upsert do produto base
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        comparePrice: p.comparePrice,
        isFeatured: p.isFeatured,
        isActive: true,
      },
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        basePrice: p.basePrice,
        comparePrice: p.comparePrice,
        brandId: p.brandId,
        categoryId: p.categoryId,
        isFeatured: p.isFeatured,
        isActive: true,
        measureTable: p.measureTable,
        variations: { create: p.variations.map(v => ({ ...v })) },
      },
    })

    // 2. Re-sincroniza imagens sempre (apaga e recria — assim atualizar URLs no seed reflete no banco)
    await prisma.productImage.deleteMany({ where: { productId: created.id } })
    await prisma.productImage.createMany({
      data: p.images.map(i => ({ ...i, productId: created.id })),
    })

    console.log(`  ✔ Produto: ${created.name} (${p.images.length} imagens)`)
  }
  console.log(`✔ Produtos: ${products.length}`)
}

async function seedCoupons() {
  const coupons = [
    {
      code: 'PIXFIRST',
      type: 'PERCENT' as const,
      value: 5,
      minOrderValue: null,
      maxUses: null,
      perUserLimit: 1,
    },
    {
      code: 'FRETE10',
      type: 'FREE_SHIPPING' as const,
      value: null,
      minOrderValue: 200,
      maxUses: 200,
      perUserLimit: 1,
    },
  ]
  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      create: c,
      update: { ...c, isActive: true },
    })
  }
  console.log(`✔ Cupons: ${coupons.length}`)
}

async function main() {
  console.log('🌱 Seeding Miami Store...\n')
  const admin      = await seedAdmin()
  const brands     = await seedBrands()
  const categories = await seedCategories()
  await seedProducts(brands, categories)
  await seedCoupons()
  console.log('\n🎉 Seed concluído.')
  console.log(`\nLogin do admin:`)
  console.log(`  email: ${admin.email}`)
  console.log(`  senha: ${process.env.SEED_ADMIN_PASSWORD ?? 'miami2026'}`)
}

main()
  .catch(e => {
    console.error('❌ Seed falhou:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
