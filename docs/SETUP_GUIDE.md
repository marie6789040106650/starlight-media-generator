# 🚀 项目设置指南

## 快速开始

### 1. 一键设置 (推荐)
```bash
# 运行快速设置脚本
pnpm run setup:quick
```

### 2. 手动设置

#### 安装依赖
```bash
pnpm install
```

#### 配置AI服务
```bash
# 交互式配置 (推荐新手)
pnpm run config:interactive

# 或者查看配置状态
pnpm run config:status
```

#### 启动开发服务器
```bash
pnpm run dev
```

## 🔑 API密钥配置

### 支持的AI服务

| 服务 | 状态 | 获取密钥 | 推荐用途 |
|------|------|----------|----------|
| **SiliconFlow** ✅ | 有密钥 | [siliconflow.cn](https://siliconflow.cn) | 主力服务，中文优化 |
| **Google Gemini** ✅ | 有密钥 | [ai.google.dev](https://ai.google.dev) | 多模态，长上下文 |
| **OpenAI** ❌ | 需要密钥 | [platform.openai.com](https://platform.openai.com) | 高质量场景 |
| **Anthropic** ❌ | 需要密钥 | [console.anthropic.com](https://console.anthropic.com) | 安全要求高 |

### 配置方式

#### 方式1: 交互式配置 (推荐)
```bash
pnpm run config:interactive
```

#### 方式2: 命令行配置
```bash
# 更新特定服务
pnpm run config:update

# 查看配置状态
pnpm run config:status
```

#### 方式3: 环境变量 (CI/CD)
```bash
export SILICONFLOW_API_KEY="your-key"
export GOOGLE_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# 初始化配置
pnpm run config:init
```

## 🎯 使用建议

### 当前最佳配置 (基于可用密钥)

#### 日常使用
- **文本生成**: SiliconFlow DeepSeek-V3 (中文优化，成本低)
- **快速响应**: Google Gemini Flash (最便宜，¥0.075/1K tokens)
- **长文档**: Google Gemini Pro (200万tokens上下文)
- **实验功能**: Google Gemini 2.0 (完全免费!)

#### 成本对比
```
🆓 Gemini 2.0 Flash (实验版) - 免费
💰 Gemini 1.5 Flash - ¥0.075/1K tokens
💰 DeepSeek-V3 - ¥0.14/1K tokens  
💰 Gemini 1.5 Pro - ¥1.25/1K tokens
💸 GPT-3.5 Turbo - ¥1.5/1K tokens (需要密钥)
💸 GPT-4 - ¥30/1K tokens (需要密钥)
```

## 📖 详细文档

- [配置管理详细指南](./CONFIG_MANAGEMENT.md)
- [AI模型使用策略](./AI_MODEL_STRATEGY.md)
- [API完整分析](./API_ANALYSIS.md)

## 🔧 常用命令

### 开发相关
```bash
pnpm run dev              # 启动开发服务器
pnpm run build            # 构建项目
pnpm run test             # 运行测试
```

### 配置管理
```bash
pnpm run config:status    # 查看配置状态
pnpm run config:update    # 更新API密钥
pnpm run config:list      # 列出支持的服务
pnpm run config:reset     # 重置配置
```

### PDF功能
```bash
pnpm run pdf:test         # 测试PDF转换
pnpm run pdf:install      # 安装LibreOffice
```

## 🚨 故障排除

### 1. API密钥问题
```bash
# 检查配置状态
pnpm run config:status

# 重新配置
pnpm run config:interactive
```

### 2. 依赖问题
```bash
# 清理并重新安装
rm -rf node_modules
pnpm install
```

### 3. 开发服务器问题
```bash
# 重启开发服务器
pnpm run dev:restart
```

## 🎉 完成设置后

1. ✅ 访问 http://localhost:3000 查看应用
2. ✅ 测试AI功能是否正常工作
3. ✅ 查看 `docs/` 目录了解更多功能

## 💡 提示

- 使用 `pnpm run config:interactive` 是最简单的配置方式
- 定期运行 `pnpm run config:status` 检查服务状态
- 查看 `docs/CONFIG_MANAGEMENT.md` 了解高级配置选项