/** @type {import('next').NextConfig} */
const nextConfig = {
  // Для статического экспорта (раскомментируйте если нужен только статик)
  // output: 'export',
  // trailingSlash: true,
  // images: { unoptimized: true },
  
  // Server Actions теперь включены по умолчанию в Next.js 14
  // experimental: {
  //   serverActions: true,
  // },
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/event-types',
        permanent: false,
      },
    ];
  },
  
  // Переменные окружения
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || 'default-value',
  },
  
  // Оптимизация для Cloudflare
  compress: true,
  poweredByHeader: false,
  
  // Webpack конфигурация для Cloudflare совместимости
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig 