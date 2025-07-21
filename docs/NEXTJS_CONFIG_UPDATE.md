# Next.js 配置更新说明

## 概述
本文档记录了为解决 EdgeOne 部署时构建文件过大问题而进行的 Next.js 配置优化。

## 问题背景
在腾讯云 EdgeOne 部署时遇到错误：
```
Error: Files size limit exceeded. The maximum size for a single file is 25MiB. 
./cache/webpack/client-production/0.pack (60MiB)
```

**根本原因**：一些重型库（如 docx、jsPDF、file-saver）被错误地打包到了前端，导致单个文件太大。

## 解决方案

### 1. Webpack 分包和外部依赖配置
修改 `next.config.mjs`，添加完整的优化配置：

```javascript
const nextConfig = {
  // ... 其他配置
  experimental: {
    webpackBuildWorker: false,
  },
  // 将大型库设置为服务端外部包
  serverExternalPackages: ['docx', 'jspdf', 'file-saver'],
  
  webpack: (config, { dev, isServer }) => {
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
    
    return config;
  },
}
```

### 2. 客户端代码重构
将客户端组件中对大型库的直接使用改为 API 调用：

**修改前**（客户端直接使用）：
```javascript
import { WordGenerator } from "@/lib/export/word-generator"
import { PDFGenerator } from "@/lib/export/pdf-generator"

// 直接在客户端使用大型库
const wordGenerator = new WordGenerator()
await wordGenerator.generateWordDocument(options)
```

**修改后**（通过 API 调用）：
```javascript
// 通过API调用生成Word文档
const response = await fetch('/api/generate-word', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(options),
})
```

### 3. 清理构建缓存
```bash
rm -rf .next .cache
pnpm build
```

## 实施结果

### 构建成功
```
Route (app)                             Size     First Load JS
┌ ○ /                                   13.2 kB         265 kB
├ ○ /_not-found                         194 B           231 kB
├ ƒ /api/generate-pdf                   128 B           252 kB
├ ƒ /api/generate-word                  128 B           252 kB
└ chunks/vendors-04507876d0c63222.js    229 kB
```

### 关键改进
- ✅ 主页面大小：13.2 kB（之前可能超过 25MB）
- ✅ Vendor 包大小：229 kB（控制在合理范围）
- ✅ 大型库限制在服务端使用
- ✅ 符合 EdgeOne 25MiB 限制

## 技术要点

### 分包策略
- `maxSize: 20MB` - 强制分包，避免单文件超限
- `vendor` 包限制 15MB
- `common` 包限制 10MB

### 外部依赖处理
- `serverExternalPackages` - 服务端外部包配置
- `config.externals` - 客户端外部依赖配置
- 确保大型库只在 API 路由中使用

### 架构优化
- 客户端：轻量级，只处理 UI 交互
- 服务端：处理文档生成等重型操作
- API 路由：作为客户端和大型库之间的桥梁

## 验证清单
- [x] 构建成功，无错误
- [x] 单个文件大小 < 25MB
- [x] 客户端不直接导入大型库
- [ ] API 路由正常工作
- [ ] 导出功能正常

## 部署注意事项
1. 确保服务端环境安装了必要的依赖
2. API 路由需要足够的内存和超时时间
3. 大型库的服务端使用需要适当的错误处理

## 后续优化建议
1. 监控构建文件大小变化
2. 定期检查依赖包大小
3. 考虑使用 CDN 加载某些库
4. 实施代码分割的最佳实践