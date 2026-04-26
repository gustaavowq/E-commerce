/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'http',  hostname: 'backend' },
      { protocol: 'http',  hostname: 'nginx' },
    ],
  },
}

export default nextConfig
