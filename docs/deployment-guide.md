# 🚀 部署指南

本文档提供了Starlight Media Generator项目的完整部署指南，包括本地部署、生产环境部署和云平台部署。

## 📋 部署前准备

### 环境要求
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐使用 pnpm@8.15.0)
- **操作系统**: macOS, Linux, Windows

### 必需的API密钥
```env
# 硅基流动 API 配置
SILICONFLOW_API_KEY=your_api_key_here
```

## 🏠 本地部署

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd starlight-media-generator
```

### 2. 安装依赖
```bash
# 使用pnpm（推荐）
pnpm install

# 或使用npm
npm install
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.local.example .env.local

# 编辑环境变量
nano .env.local
```

### 4. 验证配置
```bash
# 验证AI模型可用性
node scripts/verify-models.js

# 运行健康检查
pnpm run health-check

# 测试核心功能
node scripts/test-core-functionality.js
```

### 5. 启动开发服务器
```bash
# 智能启动（推荐）
pnpm run smart-dev

# 或标准启动
pnpm dev
```

访问 http://localhost:3000

## 🏭 生产环境部署

### 1. 构建项目
```bash
# 构建生产版本（自动清理测试文件）
pnpm build

# 验证构建结果
ls -la .next/
```

### 2. 启动生产服务器
```bash
# 启动生产服务器
pnpm start

# 或使用PM2管理进程
pm2 start npm --name "starlight-media" -- start
```

### 3. 生产环境优化
```bash
# 设置生产环境变量
export NODE_ENV=production

# 优化内存使用
export NODE_OPTIONS="--max-old-space-size=2048"
```

## ☁️ Vercel部署

项目已配置Vercel部署支持，包含完整的`vercel.json`配置。

### 1. Vercel配置
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev", 
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 2. 部署步骤
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

### 3. 环境变量配置
在Vercel Dashboard中配置：
- `SILICONFLOW_API_KEY`: 硅基流动API密钥
- `NODE_ENV`: production

### 4. 域名配置
- 在Vercel Dashboard中配置自定义域名
- 确保DNS记录正确指向Vercel

## 🐳 Docker部署

### 1. 构建Docker镜像
```bash
# 构建应用镜像
docker build -t starlight-media-generator .

# 构建PDF服务镜像
docker build -f docker/Dockerfile.pdf-service -t starlight-pdf-service .
```

### 2. 使用Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 3. PDF服务部署
```bash
# 启动PDF服务
pnpm run pdf:docker

# 测试PDF服务
pnpm run pdf:test

# 停止PDF服务
pnpm run pdf:docker-stop
```

## 🔧 部署配置

### Next.js配置 (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 构建配置优化
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 静态资源优化
  images: {
    unoptimized: true,
  },
  
  // 确保路径解析正确
  experimental: {
    esmExternals: true,
  },
  
  // API路由配置
  async rewrites() {
    return []
  },
}

export default nextConfig
```

### 安全配置
项目已包含基础安全头配置：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 📊 性能监控

### 1. 应用监控
```bash
# 性能测试
node scripts/performance-test.js

# PDF性能测试
pnpm run pdf:test-performance

# 缓存测试
pnpm run pdf:test-cache
```

### 2. 日志监控
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 3. 健康检查
```bash
# 定期健康检查
pnpm run health-check

# 核心功能测试
node scripts/test-core-functionality.js
```

## 🚨 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清理缓存
rm -rf .next node_modules
pnpm install
pnpm build
```

#### 2. API调用失败
```bash
# 验证API密钥
node scripts/verify-models.js

# 检查网络连接
curl -I https://api.siliconflow.cn/v1/models
```

#### 3. PDF生成失败
```bash
# 安装LibreOffice
pnpm run pdf:install

# 测试PDF服务
pnpm run pdf:test
```

#### 4. 内存不足
```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
```

### 日志分析
```bash
# 查看详细错误信息
NODE_ENV=development pnpm dev

# 启用调试模式
DEBUG=* pnpm dev
```

## 🔄 更新部署

### 1. 代码更新
```bash
# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install

# 重新构建
pnpm build
```

### 2. 零停机更新
```bash
# 使用PM2进行零停机更新
pm2 reload starlight-media

# 或使用Docker滚动更新
docker-compose up -d --no-deps app
```

### 3. 回滚策略
```bash
# Git回滚
git revert <commit-hash>
pnpm build
pm2 restart starlight-media

# Docker回滚
docker tag starlight-media-generator:backup starlight-media-generator:latest
docker-compose up -d
```

## 📋 部署检查清单

### 部署前检查
- [ ] 环境变量配置完成
- [ ] API密钥有效性验证
- [ ] 依赖安装完成
- [ ] 构建成功
- [ ] 测试通过

### 部署后检查
- [ ] 应用正常启动
- [ ] API接口响应正常
- [ ] PDF生成功能正常
- [ ] 静态资源加载正常
- [ ] 错误日志无异常

### 定期维护
- [ ] 定期更新依赖
- [ ] 监控API使用量
- [ ] 清理临时文件
- [ ] 备份重要数据
- [ ] 性能监控检查

## 📞 技术支持

如遇到部署问题：
1. 查看本文档的故障排除部分
2. 运行相关测试脚本诊断问题
3. 查看应用日志获取详细错误信息
4. 提交Issue并附上详细的错误信息和环境配置

---

**注意**: 部署前请确保已阅读并理解项目的[开发规则](development-rules.md)和[维护指南](project-maintenance.md)。