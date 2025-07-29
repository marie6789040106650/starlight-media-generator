# API密钥配置指南

## 🔑 获取API密钥

### SiliconFlow API密钥（必需）
1. 访问 [SiliconFlow控制台](https://cloud.siliconflow.cn)
2. 注册/登录账户
3. 在控制台中创建API密钥
4. 复制生成的密钥

### 其他API密钥（可选）
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Google Gemini**: https://makersuite.google.com/app/apikey

## 🛠️ 本地开发配置

1. 复制 `.env.example` 为 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```

2. 编辑 `.env.local` 文件，替换占位符为真实密钥：
   ```env
   SILICONFLOW_API_KEY=sk-your-actual-siliconflow-key
   OPENAI_API_KEY=sk-your-actual-openai-key
   # ... 其他密钥
   ```

## 🚀 生产环境配置

### Vercel部署
在Vercel项目设置中添加环境变量：
1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：
   - `SILICONFLOW_API_KEY` = 你的SiliconFlow密钥
   - `NODE_ENV` = `production`

### 其他平台
根据部署平台的文档配置相应的环境变量。

## ⚠️ 安全注意事项

1. **永远不要**将API密钥硬编码在代码中
2. **永远不要**将 `.env.local` 文件提交到Git
3. 定期轮换API密钥
4. 监控API密钥使用情况
5. 为不同环境使用不同的密钥

## 🔍 验证配置

运行以下命令验证配置：
```bash
pnpm run dev
```

如果看到"API密钥未配置"错误，请检查环境变量设置。