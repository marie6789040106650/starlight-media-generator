# 🌍 环境变量配置完整指南

## 📋 环境变量文件说明

### 本地开发环境
```
.env.local          ← 你的真实密钥填在这里 (被 .gitignore 忽略)
.env.example        ← 模板文件，上传到 GitHub
```

### 生产环境 (Vercel)
```
Vercel 控制台       ← 生产环境密钥配置在这里
Environment Variables 设置
```

## 🔄 工作流程

### 1. 本地开发配置
```bash
# 1. 编辑 .env.local 文件
SILICONFLOW_API_KEY=sk-your-real-key-here
OPENAI_API_KEY=sk-your-real-key-here

# 2. 重启开发服务器
pnpm dev
```

### 2. 生产部署配置
```bash
# 在 Vercel 控制台添加环境变量：
# vercel.com → 项目 → Settings → Environment Variables

SILICONFLOW_API_KEY = "你的生产环境密钥"
NODE_ENV = "production"
```

## 🛡️ 安全机制

### Git 忽略规则
```gitignore
# .gitignore 文件中
.env*                # 忽略所有 .env 开头的文件
```

### 文件用途对比
| 文件 | 用途 | 是否上传 GitHub | 是否包含真实密钥 |
|------|------|----------------|------------------|
| `.env.local` | 本地开发 | ❌ 不上传 | ✅ 包含真实密钥 |
| `.env.example` | 模板参考 | ✅ 上传 | ❌ 只有占位符 |
| Vercel 环境变量 | 生产部署 | ❌ 不在 Git 中 | ✅ 包含真实密钥 |

## 🚀 部署流程

### Vercel 部署时发生什么：
1. **代码拉取**: Vercel 从 GitHub 拉取代码
2. **环境变量注入**: Vercel 将控制台配置的环境变量注入到构建环境
3. **构建**: 使用注入的环境变量构建应用
4. **部署**: 部署到生产环境

### 关键点：
- ✅ `.env.local` 不会影响 Vercel 部署
- ✅ Vercel 有自己独立的环境变量系统
- ✅ 本地和生产环境完全隔离

## 🔧 配置步骤

### 本地开发
```bash
# 1. 填写 .env.local
vim .env.local

# 2. 重启服务
pnpm dev
```

### Vercel 部署
```bash
# 1. 在 Vercel 控制台配置环境变量
# 2. 重新部署（自动触发）
```

## 🆘 常见问题

### Q: .env.local 被忽略会影响部署吗？
**A**: 不会！Vercel 使用自己的环境变量系统，与 Git 仓库中的文件无关。

### Q: 如何确保本地和生产环境同步？
**A**: 手动在两个地方配置相同的密钥值。

### Q: 可以使用不同的密钥吗？
**A**: 可以！建议生产环境使用独立的密钥以提高安全性。

## 💡 最佳实践

1. **本地开发**: 使用 `.env.local` 配置密钥
2. **生产部署**: 在 Vercel 控制台配置密钥
3. **安全性**: 定期轮换 API 密钥
4. **备份**: 将密钥安全地保存在密码管理器中