import { ImageResponse } from 'next/og'
import { getProduct } from '@/services/products'

// OG image dinâmica por produto. Next.js 14 gera SVG via @vercel/og.
// Aparece quando alguém compartilha o link do produto no WhatsApp/Insta/etc.
export const runtime = 'nodejs'
export const alt  = 'Miami Store'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: { slug: string } }) {
  let product
  try {
    product = await getProduct(params.slug)
  } catch {
    return new ImageResponse(<MiamiBrand title="Miami Store" subtitle="Original com preço que cabe" />, size)
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1B5E20 100%)',
          padding: 60, color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: '#1B5E20', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900,
          }}>M</div>
          <span style={{ fontSize: 22, letterSpacing: 4, fontWeight: 700 }}>MIAMI STORE</span>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#C5E000', textTransform: 'uppercase' }}>
            {product.brand.name}
          </span>
          <span style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, marginTop: 12 }}>
            {product.name}
          </span>
          <span style={{ fontSize: 56, fontWeight: 800, color: '#66BB6A', marginTop: 24 }}>
            R$ {product.basePrice.toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>
    ),
    size,
  )
}

function MiamiBrand({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1B5E20 100%)',
      padding: 80, color: 'white', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 80, fontWeight: 900 }}>{title}</span>
      <span style={{ fontSize: 32, color: '#C5E000', marginTop: 16 }}>{subtitle}</span>
    </div>
  )
}
