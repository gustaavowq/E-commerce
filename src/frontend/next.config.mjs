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
}

export default nextConfig
