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
  // 开发服务器配置
  devIndicators: {
    buildActivity: true,
  },
  // 如果需要自定义服务器配置，可以在这里添加
  async rewrites() {
    return []
  },
}

export default nextConfig
