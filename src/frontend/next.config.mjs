/** @type {import('next').NextConfig} */
const nextConfig = {
  // Em dev, hot reload via volume mount precisa de polling em alguns hosts
  // (Windows + Docker). Desligue se rodar nativo.
  webpack: (config, { dev }) => {
    if (dev && process.env.WEBPACK_POLLING === 'true') {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 }
    }
    return config
  },

  // Imagens externas que liberamos (placeholders e CDN futura)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // App roda dentro do container, mas Next chama API server-side via container interno
  // (INTERNAL_API_URL). No browser, vai pro Nginx via NEXT_PUBLIC_API_URL.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999',
    NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE: process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Olá! Vi a Miami Store no Insta e quero tirar uma dúvida.',
  },

  // Headers de segurança aplicados em todas as rotas.
  // CSP permite 'unsafe-inline' (Next hidration) e 'unsafe-eval' em dev (HMR).
  async headers() {
    const isDev = process.env.NODE_ENV !== 'production'
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'"
    const csp = [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.trycloudflare.com https://*.up.railway.app https://*.vercel.app https://api.mercadopago.com",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
