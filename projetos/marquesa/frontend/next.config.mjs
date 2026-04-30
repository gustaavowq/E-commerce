/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

// CSP — restritivo, mas Next precisa de unsafe-inline (estilos) e unsafe-eval (em dev HMR)
const cspDirectives = [
  "default-src 'self'",
  isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net"
    : "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://maps.gstatic.com https://*.googleapis.com https://*.ggpht.com https://www.facebook.com https://*.facebook.com",
  "connect-src 'self' http://localhost:8211 https://marquesa.gustavo.agenciaever.cloud https://api-marquesa.gustavo.agenciaever.cloud https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.facebook.com https://connect.facebook.net",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const nextConfig = {
  // Output standalone (Docker prod)
  output: 'standalone',

  // Imagens externas liberadas
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },

  // Vars expostas ao client (NEXT_PUBLIC_*) com fallbacks de dev
  // NOTE: NEXT_PUBLIC_API_URL pode ser string vazia ('') — browser usa caminho relativo
  // e o rewrite() abaixo proxa pro backend interno. Isso elimina cross-origin em
  // ambiente tunnel/cloudflare onde back e front estão em hosts diferentes.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511900000000',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    NEXT_PUBLIC_GA4_ID: process.env.NEXT_PUBLIC_GA4_ID || '',
    NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },

  // Proxy interno: browser pede /api/*, Next reescreve pro backend.
  // Cookies httpOnly persistem porque tudo é same-origin do ponto de vista do browser.
  async rewrites() {
    const target = process.env.INTERNAL_API_URL || 'http://localhost:8211'
    return [
      { source: '/api/:path*', destination: `${target}/api/:path*` },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: cspDirectives },
        ],
      },
    ]
  },
}

export default nextConfig
