/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 确保路径解析正确
  experimental: {
    esmExternals: true,
  },
  // 如果需要自定义服务器配置，可以在这里添加
  async rewrites() {
    return []
  },
}

export default nextConfig
