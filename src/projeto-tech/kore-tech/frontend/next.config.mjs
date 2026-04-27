/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Hot reload em ambientes Docker (ver Miami)
  webpack: (config, { dev }) => {
    if (dev && process.env.WEBPACK_POLLING === 'true') {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300 }
    }
    return config
  },

  images: {
    // Cloudinary + placeholders. Sem placehold.co (substituido por fallback inline).
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
    NEXT_PUBLIC_DASHBOARD_URL:
      process.env.NEXT_PUBLIC_DASHBOARD_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://kore-tech-painel.vercel.app' : 'http://localhost:3002'),
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999',
    NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE:
      process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE || 'Quero tirar uma duvida sobre um build.',
  },

  // Headers de seguranca aplicados em todas as rotas.
  // Lembrar: connect-src DEVE listar todos os hosts da API. Ver memoria/30-LICOES/05-csp-connect-src.md
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
      // ATENCAO: se trocar host da API, atualizar aqui (regra cross-projeto).
      "connect-src 'self' http://localhost:4001 http://localhost:3002 https://*.up.railway.app https://*.vercel.app https://*.cloudinary.com https://api.mercadopago.com https://viacep.com.br",
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
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
