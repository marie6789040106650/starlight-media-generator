# 环境配置指南

## 📋 环境要求

### Node.js 版本要求

项目要求 Node.js 版本 >= 18.0.0，推荐使用 LTS 版本。

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 为什么需要 Node.js 18+？

- **ES 模块支持**: 完整支持 ES 模块和动态导入
- **性能优化**: 更好的 V8 引擎性能和内存管理
- **API 兼容性**: 支持最新的 Node.js API 和特性
- **Next.js 15**: Next.js 15 要求 Node.js 18.17 或更高版本

#### 安装 Node.js

1. **官方下载**: 访问 [nodejs.org](https://nodejs.org/) 下载 LTS 版本
2. **版本管理器**: 使用 nvm 或 fnm 管理多个 Node.js 版本

```bash
# 使用 nvm 安装 Node.js 18
nvm install 18
nvm use 18

# 验证版本
node --version  # 应该显示 v18.x.x 或更高
```

### pnpm 包管理器要求

项目使用 pnpm 作为首选包管理器，要求版本 >= 8.0.0。

```json
{
  "engines": {
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

#### 为什么选择 pnpm？

- **磁盘效率**: 通过硬链接共享依赖，节省磁盘空间
- **安装速度**: 比 npm 和 yarn 更快的安装速度
- **严格性**: 更严格的依赖管理，避免幽灵依赖
- **Monorepo 支持**: 优秀的 monorepo 工作空间支持

#### 安装 pnpm

```bash
# 使用 npm 全局安装 pnpm
npm install -g pnpm@8.15.0

# 或使用 corepack (Node.js 16.10+)
corepack enable
corepack prepare pnpm@8.15.0 --activate

# 验证版本
pnpm --version  # 应该显示 8.15.0
```

## 🚀 项目设置

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd your-project
```

### 2. 安装依赖

```bash
# 推荐使用 pnpm
pnpm install

# 如果必须使用 npm
npm install
```

### 3. 环境变量配置

创建 `.env.local` 文件：

```env
# 硅基流动 API 配置
SILICONFLOW_API_KEY=your_api_key_here
```

### 4. 验证安装

```bash
# 验证模型可用性
node scripts/verify-models.js

# 启动开发服务器
pnpm dev
```

## 🔧 开发工具配置

### VS Code 推荐扩展

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### TypeScript 配置

项目使用严格的 TypeScript 配置：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

## 🐛 常见问题

### Node.js 版本过低

**错误**: `error: This version of Node.js is not supported`

**解决**: 升级 Node.js 到 18.0.0 或更高版本

```bash
# 检查当前版本
node --version

# 升级 Node.js
nvm install 18
nvm use 18
```

### pnpm 命令不存在

**错误**: `pnpm: command not found`

**解决**: 安装 pnpm

```bash
npm install -g pnpm@8.15.0
```

### 依赖安装失败

**错误**: 依赖安装过程中出现错误

**解决**: 清理缓存并重新安装

```bash
# 清理 pnpm 缓存
pnpm store prune

# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### 端口占用

**错误**: `Port 3000 is already in use`

**解决**: 使用其他端口或停止占用进程

```bash
# 使用其他端口
pnpm dev --port 3001

# 或停止占用进程
lsof -ti:3000 | xargs kill -9
```

## 📊 性能优化

### pnpm 配置优化

在项目根目录创建 `.npmrc` 文件：

```ini
# 使用更快的网络请求
network-concurrency=16
child-concurrency=4

# 启用严格的 peer 依赖检查
strict-peer-dependencies=true

# 使用国内镜像（可选）
registry=https://registry.npmmirror.com/
```

### 开发环境优化

```bash
# 启用 pnpm 的实验性功能
pnpm config set enable-pre-post-scripts true

# 设置更大的内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
```

## 🔒 安全注意事项

### 环境变量安全

- 永远不要将 `.env.local` 文件提交到版本控制
- 使用强密码和安全的 API 密钥
- 定期轮换 API 密钥

### 依赖安全

```bash
# 检查依赖漏洞
pnpm audit

# 自动修复漏洞
pnpm audit --fix
```

## 📚 相关文档

- [Node.js 官方文档](https://nodejs.org/docs/)
- [pnpm 官方文档](https://pnpm.io/)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [项目开发者指南](./developer-guide.md)
- [测试工具指南](./testing-guide.md)
- [Word导出实现指南](../WORD_EXPORT_IMPLEMENTATION.md)