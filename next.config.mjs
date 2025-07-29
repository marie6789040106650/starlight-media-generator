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
  // 将大型库设置为服务端外部包（Next.js 15+ 语法）
  serverExternalPackages: ['docx', 'jspdf', 'file-saver', 'html2canvas'],
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
      // 更激进的分包策略
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 15000000, // 降低到 15MB 限制
        cacheGroups: {
          // 将大型库单独分包
          docx: {
            test: /[\\/]node_modules[\\/]docx[\\/]/,
            name: 'docx',
            chunks: 'async', // 只在异步加载时分包
            priority: 30,
          },
          jspdf: {
            test: /[\\/]node_modules[\\/]jspdf[\\/]/,
            name: 'jspdf',
            chunks: 'async', // 只在异步加载时分包
            priority: 30,
          },
          fileSaver: {
            test: /[\\/]node_modules[\\/]file-saver[\\/]/,
            name: 'file-saver',
            chunks: 'async', // 只在异步加载时分包
            priority: 30,
          },
          html2canvas: {
            test: /[\\/]node_modules[\\/]html2canvas[\\/]/,
            name: 'html2canvas',
            chunks: 'async', // 只在异步加载时分包
            priority: 30,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 10000000, // 10MB 限制
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            maxSize: 8000000, // 8MB 限制
            priority: 5,
          },
        },
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