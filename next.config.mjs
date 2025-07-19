import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
  // 简化构建配置，避免内存问题
  experimental: {
    optimizeCss: false,
  },
  // Webpack配置
  webpack: (config) => {
    // 路径别名
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/app': path.resolve(__dirname, 'app'),
    }
    
    return config
  },
}

export default nextConfig