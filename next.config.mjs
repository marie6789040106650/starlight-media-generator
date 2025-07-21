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
  // 生产环境优化配置
  experimental: {
    // 减少构建缓存大小
    webpackBuildWorker: false,
  },
  // 将大型库设置为服务端外部包
  serverExternalPackages: ['docx', 'jspdf', 'file-saver'],
  // 恢复路径别名配置和分包优化
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/components': path.resolve(__dirname, 'components'),
      '@/lib': path.resolve(__dirname, 'lib'),
      '@/hooks': path.resolve(__dirname, 'hooks'),
      '@/app': path.resolve(__dirname, 'app'),
    }
    
    // 客户端构建优化：分包和外部依赖
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 20000000, // 强制分包，避免单文件超 25MiB
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 15000000, // 15MB 限制
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            maxSize: 10000000, // 10MB 限制
          },
        },
      };
      
      // 将大型库设置为外部依赖，不打包到客户端
      config.externals = {
        ...config.externals,
        'docx': 'docx',
        'jspdf': 'jspdf',
        'file-saver': 'file-saver',
      };
    }
    
    // 生产环境禁用缓存以避免文件过大
    if (!dev) {
      config.cache = false
    }
    
    return config
  },
}

export default nextConfig