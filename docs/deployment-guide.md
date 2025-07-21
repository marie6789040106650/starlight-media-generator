# 部署指南

## 📋 概述
本文档详细记录了项目在各个平台的部署配置、参数要求和常见问题解决方案。

## 🚀 支持的部署平台

### 1. 腾讯云 EdgeOne
**推荐用于**: 中国大陆用户，CDN加速需求

#### 基本要求
- **文件大小限制**: 25MiB（单文件）
- **Node.js版本**: >= 18.0.0
- **构建工具**: 支持 npm/yarn/pnpm

#### 必需配置
```javascript
// next.config.mjs
const nextConfig = {
  serverExternalPackages: ['docx', 'jspdf', 'file-saver'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 20000000, // 20MB限制
      };
    }
    return config;
  },
}
```

#### 环境变量
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.edgeone.app
API_TIMEOUT=30000
MAX_FILE_SIZE=10485760
```

#### 部署命令
```bash
# 构建前清理
pnpm run cleanup

# 构建项目
pnpm build

# 验证构建产物大小
ls -lh .next/static/chunks/
```

### 2. Vercel
**推荐用于**: 国际用户，快速部署

#### 基本要求
- **函数超时**: 10s (Hobby) / 60s (Pro)
- **内存限制**: 1GB (Hobby) / 3GB (Pro)
- **构建时间**: 45分钟限制

#### 配置文件 (vercel.json)
```json
{
  "functions": {
    "app/api/generate-word/route.ts": {
      "maxDuration": 30
    },
    "app/api/generate-pdf/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 环境变量
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
VERCEL_URL=auto-generated
```

### 3. Netlify
**推荐用于**: 静态站点，简单部署

#### 基本要求
- **函数超时**: 10s (Free) / 26s (Pro)
- **构建时间**: 15分钟 (Free) / 60分钟 (Pro)

#### 配置文件 (netlify.toml)
```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--prefix=/dev/null"

[[functions]]
  path = "app/api/*"
  node_bundler = "esbuild"
```

## 🔧 通用部署配置

### 环境变量清单
```bash
# 必需变量
NODE_ENV=production                    # 生产环境标识
NEXT_PUBLIC_APP_URL=https://domain.com # 应用访问地址

# API配置
API_TIMEOUT=30000                      # API超时时间(ms)
MAX_FILE_SIZE=10485760                 # 最大文件大小(10MB)

# 功能开关
ENABLE_EXPORT=true                     # 启用导出功能
ENABLE_ANALYTICS=false                 # 启用分析功能

# 日志配置
LOG_LEVEL=info                         # 日志级别
DEBUG_MODE=false                       # 调试模式
```

### 构建脚本
```json
{
  "scripts": {
    "build:clean": "rm -rf .next && pnpm run cleanup",
    "build:prod": "pnpm run build:clean && pnpm build",
    "deploy:check": "pnpm run build:prod && node scripts/check-build-size.js"
  }
}
```

### 依赖检查脚本
```javascript
// scripts/check-build-size.js
const fs = require('fs');
const path = require('path');

function checkBuildSize() {
  const chunksDir = path.join('.next', 'static', 'chunks');
  if (!fs.existsSync(chunksDir)) {
    console.error('❌ 构建目录不存在');
    process.exit(1);
  }

  const files = fs.readdirSync(chunksDir);
  const maxSize = 25 * 1024 * 1024; // 25MB
  
  for (const file of files) {
    const filePath = path.join(chunksDir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size > maxSize) {
      console.error(`❌ 文件过大: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
      process.exit(1);
    }
  }
  
  console.log('✅ 所有文件大小检查通过');
}

checkBuildSize();
```

## 🚨 常见问题及解决方案

### 1. 构建文件过大
**问题**: `Files size limit exceeded. The maximum size for a single file is 25MiB`

**解决方案**:
```bash
# 1. 检查配置
grep -r "serverExternalPackages" next.config.mjs

# 2. 重新构建
rm -rf .next && pnpm build

# 3. 检查文件大小
ls -lh .next/static/chunks/ | grep -E '[0-9]+M'
```

### 2. API 超时
**问题**: 文档生成API响应超时

**解决方案**:
```javascript
// 增加超时配置
export const maxDuration = 30; // 30秒

// 优化处理逻辑
const controller = new AbortController();
setTimeout(() => controller.abort(), 25000);
```

### 3. 内存不足
**问题**: 构建或运行时内存溢出

**解决方案**:
```bash
# 增加Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# 或在package.json中配置
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

### 4. 依赖包冲突
**问题**: 某些包在服务端和客户端冲突

**解决方案**:
```javascript
// next.config.mjs
const nextConfig = {
  serverExternalPackages: [
    'docx', 'jspdf', 'file-saver',  // 文档处理
    'puppeteer', 'playwright',      // 浏览器自动化
    'sharp', 'canvas',              // 图像处理
    'sqlite3', 'mysql2',            // 数据库
  ],
}
```

## 📊 部署性能监控

### 构建时间监控
```bash
# 记录构建时间
time pnpm build

# 分析构建产物
npx @next/bundle-analyzer
```

### 运行时监控
```javascript
// 添加性能监控
export function reportWebVitals(metric) {
  console.log(metric);
  // 发送到分析服务
}
```

## ✅ 部署检查清单

### 部署前检查
- [ ] 运行 `pnpm run cleanup` 清理测试文件
- [ ] 运行 `pnpm build` 验证构建成功
- [ ] 检查 `.next/static/chunks/` 文件大小 < 25MB
- [ ] 验证环境变量配置完整
- [ ] 测试本地 `pnpm start` 正常启动
- [ ] 检查 API 路由 `/api/generate-word` 和 `/api/generate-pdf` 正常

### 部署后验证
- [ ] 访问主页面正常加载
- [ ] 测试表单提交功能
- [ ] 验证导出Word功能
- [ ] 验证导出PDF功能
- [ ] 检查控制台无错误
- [ ] 验证响应时间 < 5秒

### 性能验证
```bash
# 页面加载速度
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com"

# API响应时间
curl -X POST "https://your-domain.com/api/generate-word" \
  -H "Content-Type: application/json" \
  -d '{"content":"test","storeName":"test"}' \
  -w "Time: %{time_total}s\n"
```

## 📚 相关文档
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Webpack 配置指南](docs/NEXTJS_CONFIG_UPDATE.md)
- [开发规则文档](docs/development-rules.md)
- [项目维护指南](docs/project-maintenance.md)

## 🔄 更新记录
- **2025-01-20**: 初始版本，基于EdgeOne部署经验
- **适用版本**: v1.0.62+
- **维护者**: 开发团队