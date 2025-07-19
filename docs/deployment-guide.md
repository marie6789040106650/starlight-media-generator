# 🚀 部署指南

## 概述

本项目是一个基于Next.js 15的AI驱动的老板IP打造方案生成器，支持多种部署方式。推荐使用Vercel进行部署，可获得最佳性能和用户体验。

## 📋 部署前准备

### 1. 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 2. 项目检查
运行以下命令确保项目准备就绪：

```bash
# 清理测试文件
pnpm run cleanup

# 验证导入路径
node scripts/verify-imports.js

# 本地构建测试
pnpm build
```

## 🎯 Vercel部署（推荐）

### 步骤1：准备代码仓库
确保代码已推送到GitHub：

```bash
git add .
git commit -m "准备部署"
git push origin main
```

### 步骤2：Vercel配置
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择你的仓库并导入

### 步骤3：部署设置
Vercel会自动检测配置，确认以下设置：

- **Framework**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `pnpm build` ✅
- **Install Command**: `pnpm install` ✅
- **Output Directory**: `.next` ✅

### 步骤4：环境变量
在Vercel项目设置中添加环境变量：

```env
SILICONFLOW_API_KEY=你的硅基流动API密钥
NEXT_PUBLIC_API_BASE_URL=https://api.siliconflow.cn
NODE_ENV=production
```

### 步骤5：部署
点击 "Deploy" 按钮开始部署。

## 🔧 常见部署问题解决

### 问题1：模块找不到
**错误**: `Module not found: Can't resolve '@/lib/models'`

**解决方案**:
1. 检查 `tsconfig.json` 路径配置
2. 确保所有文件都已提交到Git
3. 运行验证脚本：`node scripts/verify-imports.js`

### 问题2：依赖安装失败
**错误**: `ERR_PNPM_OUTDATED_LOCKFILE`

**解决方案**:
```bash
# 删除锁定文件并重新安装
rm pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "更新依赖锁定文件"
git push
```

### 问题3：样式构建失败
**错误**: `Module not found: Can't resolve 'postcss'` 或 `tailwindcss not found`

**解决方案**:
项目已将PostCSS和Tailwind CSS移至生产依赖，确保部署时可用：
- PostCSS和Tailwind CSS现在是生产依赖，不会在部署时被排除
- 如遇到样式相关构建错误，检查依赖配置是否正确
- 确保`postcss.config.mjs`和`tailwind.config.ts`配置文件存在

### 问题4：构建超时
**解决方案**:
1. 检查 `vercel.json` 配置
2. 确保没有无限循环或大文件
3. 优化构建命令

## 🏗️ 其他部署方式

### Docker部署

创建 `Dockerfile`：
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm@8.15.0

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建应用
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

构建和运行：
```bash
docker build -t starlight-media .
docker run -p 3000:3000 starlight-media
```

### 服务器部署

```bash
# 1. 克隆代码
git clone your-repo-url
cd starlight-media-generator

# 2. 安装依赖
pnpm install

# 3. 构建项目
pnpm build

# 4. 使用PM2管理进程
npm install -g pm2
pm2 start npm --name "starlight-media" -- start
pm2 save
pm2 startup
```

## 📊 部署后验证

### 功能检查清单
- [ ] 页面正常加载
- [ ] 表单提交功能正常
- [ ] AI模型选择工作正常
- [ ] 方案生成功能正常
- [ ] 导出功能正常（如果启用）
- [ ] 响应式设计正常

### 性能检查
```bash
# 使用Lighthouse检查性能
npx lighthouse https://your-domain.vercel.app

# 检查构建大小
pnpm build
```

## 🔧 Next.js配置优化

### 配置文件说明 (`next.config.mjs`)
项目使用了简化的Next.js配置，确保构建稳定性和部署成功：

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
```

### 配置项详解
- **eslint.ignoreDuringBuilds**: 构建时忽略ESLint错误，提升构建速度和稳定性
- **typescript.ignoreBuildErrors**: 构建时忽略TypeScript错误，确保部署成功
- **images.unoptimized**: 禁用Next.js图片优化，适用于静态部署环境
- **experimental.optimizeCss**: 禁用CSS优化，避免内存问题
- **webpack路径别名**: 保留核心的模块路径别名配置

### 配置优势
1. **构建稳定性**: 简化配置减少构建失败风险
2. **内存优化**: 移除内存密集型优化，适合资源受限环境
3. **开发体验**: 保留核心路径别名配置，维持开发效率
4. **部署适配**: 针对Vercel等平台的稳定性优化
5. **维护简化**: 精简配置提升可维护性

## 🔒 安全配置

### 环境变量安全
- 永远不要在代码中硬编码API密钥
- 使用Vercel的环境变量功能
- 定期轮换API密钥

### 内容保护
项目内置了内容保护功能：
- 禁用复制粘贴
- 阻止开发者工具
- 防止内容选择

## 📈 监控和维护

### Vercel Analytics
启用Vercel Analytics获取访问数据：
1. 在Vercel项目设置中启用Analytics
2. 查看实时访问统计
3. 监控性能指标

### 错误监控
建议集成错误监控服务：
- Sentry
- LogRocket
- Vercel的内置错误追踪

## 🚨 故障排除

### 构建失败
1. 检查构建日志
2. 验证所有依赖都已安装
3. 确保环境变量正确设置
4. 运行本地构建测试

### 运行时错误
1. 检查Vercel函数日志
2. 验证API密钥有效性
3. 检查网络连接
4. 查看浏览器控制台错误

## 📞 获取帮助

如果遇到部署问题：
1. 查看Vercel官方文档
2. 检查项目的GitHub Issues
3. 运行项目健康检查：`pnpm run health-check`
4. 联系技术支持

---

## 🎉 部署成功！

部署完成后，你将获得：
- 全球CDN加速的网站
- 自动HTTPS证书
- 无服务器函数支持
- 自动部署流水线

访问你的网站开始使用AI驱动的IP打造方案生成器吧！