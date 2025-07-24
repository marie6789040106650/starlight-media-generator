# 🚀 Vercel 部署完整指南

## 📋 当前状态
✅ **项目已准备就绪！** 所有敏感信息已清理，配置已优化。

## 🔑 需要准备的 API 密钥

### 必需密钥
- **SiliconFlow API Key**: 从 [https://cloud.siliconflow.cn](https://cloud.siliconflow.cn) 获取
  - 用于 AI 内容生成（核心功能）
  - 格式：`sk-xxxxxxxxxx`

### 可选密钥（可以稍后添加）
- **OpenAI API Key**: 从 [https://platform.openai.com](https://platform.openai.com) 获取
- **Anthropic API Key**: 从 [https://console.anthropic.com](https://console.anthropic.com) 获取  
- **Google API Key**: 从 [https://console.cloud.google.com](https://console.cloud.google.com) 获取

## 📤 第一步：推送到 GitHub

```bash
# 推送到 GitHub（已经提交完成）
git push origin main
```

## 🌐 第二步：在 Vercel 中部署

### 1. 导入项目
1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 从 GitHub 导入你的仓库
4. 选择 "starlight-media-generator" 项目

### 2. 配置构建设置
Vercel 会自动检测到这是一个 Next.js 项目，默认设置应该是：
- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 3. 配置环境变量
在部署前，点击 "Environment Variables" 添加：

#### 生产环境变量
```
SILICONFLOW_API_KEY = 你的SiliconFlow密钥
NODE_ENV = production
```

#### 可选变量（如果有的话）
```
OPENAI_API_KEY = 你的OpenAI密钥
ANTHROPIC_API_KEY = 你的Anthropic密钥
GOOGLE_API_KEY = 你的Google密钥
```

### 4. 部署
点击 "Deploy" 开始部署！

## 🔍 第三步：验证部署

### 部署成功后检查：
1. **主页访问**: 确认网站可以正常打开
2. **AI 功能**: 测试关键词生成和内容生成
3. **导出功能**: 测试 Word 和 PDF 导出
4. **API 健康检查**: 访问 `/api/health/storage`

### 常见问题排查：
- **500 错误**: 检查环境变量是否正确设置
- **API 调用失败**: 确认 API 密钥有效且有足够配额
- **PDF 功能异常**: 这是正常的，Vercel 不支持 LibreOffice

## 📊 功能支持情况

### ✅ 完全支持的功能
- AI 内容生成（关键词、方案、横幅）
- Word 文档导出
- 流式聊天
- 数据统计和分析
- 所有前端功能

### ⚠️ 部分支持的功能
- **PDF 导出**: 在 Vercel 上不可用，会自动降级到 Word 导出
- **LibreOffice 相关功能**: 需要本地环境或 Docker

### 🔧 性能优化
- 代码分割已配置
- 大型依赖已外部化
- 缓存策略已优化
- 构建大小已控制

## 🎯 部署后的下一步

### 1. 域名配置（可选）
- 在 Vercel 项目设置中添加自定义域名
- 配置 DNS 记录

### 2. 监控设置
- 查看 Vercel Analytics
- 设置错误监控
- 配置性能监控

### 3. 功能扩展
- 添加更多 AI 服务提供商
- 集成数据库（如 Vercel KV）
- 添加用户认证

## 🆘 故障排除

### 构建失败
```bash
# 本地测试构建
pnpm build

# 检查类型错误
pnpm run type-check
```

### 运行时错误
1. 检查 Vercel 函数日志
2. 确认环境变量设置
3. 查看浏览器控制台

### API 调用问题
1. 验证 API 密钥格式
2. 检查 API 配额和限制
3. 测试网络连接

## 📞 支持资源

- **项目文档**: 查看 `docs/` 目录
- **API 文档**: 查看各 API 路由的注释
- **健康检查**: `/api/health/storage`
- **配置验证**: 使用项目内置的验证脚本

---

🎉 **恭喜！你的项目现在已经准备好部署到 Vercel 了！**

记住：部署后第一次访问可能需要几秒钟的冷启动时间，这是正常的。