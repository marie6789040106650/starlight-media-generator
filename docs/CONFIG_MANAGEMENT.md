# 🔧 AI服务配置管理指南

## 📋 概述

项目现在使用安全的配置管理系统来管理AI服务的API密钥，不再需要硬编码密钥到代码中。

## 🚀 快速开始

### 1. 初始化配置
```bash
# 自动检测环境变量并初始化配置
pnpm run config:init
```

### 2. 查看配置状态
```bash
# 查看当前配置状态
pnpm run config:status
```

### 3. 交互式配置 (推荐)
```bash
# 启动交互式配置向导
pnpm run config:interactive
```

## 🔑 支持的AI服务

| 服务 | 描述 | 获取密钥 | 推荐用途 |
|------|------|----------|----------|
| **SiliconFlow** | 中文优化，成本低 | [siliconflow.cn](https://siliconflow.cn) | 日常文本生成 |
| **Google Gemini** | 多模态，超长上下文 | [ai.google.dev](https://ai.google.dev) | 长文档、多模态 |
| **OpenAI** | 业界标杆，效果最好 | [platform.openai.com](https://platform.openai.com) | 高质量场景 |
| **Anthropic** | 安全导向，理解能力强 | [console.anthropic.com](https://console.anthropic.com) | 安全要求高 |

## 📖 详细使用方法

### 命令行工具

#### 查看所有可用命令
```bash
node scripts/manage-api-keys.js --help
```

#### 查看配置状态
```bash
pnpm run config:status
```
输出示例：
```
📊 AI服务配置状态

总服务数: 4
已启用: 2
可用服务: siliconflow, google
最后更新: 2025-01-22T10:30:00.000Z

服务详情:
硅基流动 (SiliconFlow):
  状态: ✅ 可用
  描述: 中文优化，成本低，推理能力强
  最后更新: 2025-01-22T10:30:00.000Z

Google Gemini:
  状态: ✅ 可用
  描述: 多模态支持，超长上下文，部分免费
  最后更新: 2025-01-22T10:30:00.000Z
```

#### 更新API密钥
```bash
pnpm run config:update
```

#### 列出支持的服务
```bash
pnpm run config:list
```

#### 重置配置
```bash
pnpm run config:reset
```

### API接口

#### 获取配置状态
```javascript
// GET /api/config/ai-services
const response = await fetch('/api/config/ai-services')
const { data } = await response.json()

console.log('可用服务:', data.stats.availableServices)
console.log('配置详情:', data.config)
```

#### 更新API密钥
```javascript
// POST /api/config/ai-services
const response = await fetch('/api/config/ai-services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update_key',
    provider: 'google',
    apiKey: 'your-api-key-here',
    notes: '更新备注'
  })
})
```

#### 启用/禁用服务
```javascript
// POST /api/config/ai-services
const response = await fetch('/api/config/ai-services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'toggle_service',
    provider: 'google',
    enabled: true
  })
})
```

### 代码中使用

#### 获取API密钥
```javascript
import { getApiKey, isServiceAvailable } from '@/lib/config-manager'

// 检查服务是否可用
if (isServiceAvailable('google')) {
  const apiKey = getApiKey('google')
  // 使用API密钥调用服务
}
```

#### 智能模型选择
```javascript
import { selectOptimalModel } from '@/lib/models'

// 根据任务类型自动选择最佳模型
const model = selectOptimalModel('fast')        // 快速响应
const model = selectOptimalModel('long_context') // 长上下文
const model = selectOptimalModel('budget')      // 预算优先
const model = selectOptimalModel('multimodal')  // 多模态
```

## 🔒 安全特性

### 1. 配置文件加密存储
- 配置文件存储在 `.kiro/ai-config.json`
- 自动创建 `.kiro` 目录并设置适当权限
- 支持备份和恢复

### 2. 环境变量降级
- 优先使用配置文件中的密钥
- 配置文件不可用时自动降级到环境变量
- 自动从环境变量导入密钥到配置文件

### 3. 敏感信息保护
- API接口不返回完整密钥
- 日志中不记录敏感信息
- 支持配置导出时过滤敏感数据

## 📁 文件结构

```
.kiro/
├── ai-config.json          # AI服务配置文件
├── hooks/                  # Kiro Hooks
├── steering/              # Steering规则
└── specs/                 # Spec文档

scripts/
├── manage-api-keys.js     # 命令行管理工具
└── init-config.js         # 配置初始化脚本

lib/
├── config-manager.ts      # 配置管理器
└── models.ts             # 模型配置

app/api/config/
└── ai-services/
    └── route.ts          # 配置管理API
```

## 🎯 最佳实践

### 1. 开发环境配置
```bash
# 1. 初始化配置
pnpm run config:init

# 2. 交互式配置你的API密钥
pnpm run config:interactive

# 3. 验证配置
pnpm run config:status
```

### 2. 生产环境配置
```bash
# 设置环境变量
export SILICONFLOW_API_KEY="your-key"
export GOOGLE_API_KEY="your-key"

# 初始化配置
pnpm run config:init
```

### 3. 团队协作
- 不要提交 `.kiro/ai-config.json` 到版本控制
- 使用环境变量在CI/CD中配置
- 团队成员各自配置自己的API密钥

### 4. 密钥轮换
```bash
# 定期更新API密钥
pnpm run config:update

# 或者通过API接口更新
curl -X POST /api/config/ai-services \
  -H "Content-Type: application/json" \
  -d '{"action":"update_key","provider":"google","apiKey":"new-key"}'
```

## 🚨 故障排除

### 1. 配置文件损坏
```bash
# 重置配置
pnpm run config:reset

# 重新初始化
pnpm run config:init
```

### 2. 权限问题
```bash
# 检查.kiro目录权限
ls -la .kiro/

# 修复权限
chmod 755 .kiro/
chmod 644 .kiro/ai-config.json
```

### 3. 环境变量问题
```bash
# 检查环境变量
env | grep API_KEY

# 重新导入环境变量
pnpm run config:init
```

## 📊 监控和统计

### 配置状态监控
```javascript
import { configManager } from '@/lib/config-manager'

// 获取配置统计
const stats = configManager.getConfigStats()
console.log('可用服务数:', stats.enabledServices)
console.log('最后更新:', stats.lastUpdate)
```

### 使用情况统计
- 自动记录API调用频率
- 监控不同服务的使用情况
- 成本分析和优化建议

## 🔄 迁移指南

### 从环境变量迁移
如果你之前使用环境变量配置API密钥：

1. **自动迁移**:
   ```bash
   pnpm run config:init
   ```

2. **手动迁移**:
   ```bash
   pnpm run config:interactive
   ```

3. **验证迁移**:
   ```bash
   pnpm run config:status
   ```

### 配置备份和恢复
```bash
# 备份配置
cp .kiro/ai-config.json .kiro/ai-config.backup.json

# 恢复配置
cp .kiro/ai-config.backup.json .kiro/ai-config.json
```

## 💡 提示和技巧

1. **使用交互式配置**: 最简单的配置方式
2. **定期检查状态**: 确保服务正常可用
3. **合理选择模型**: 根据任务类型选择最适合的模型
4. **监控成本**: 定期查看API使用情况和成本
5. **保持密钥安全**: 不要在代码中硬编码密钥

## 🎉 总结

新的配置管理系统提供了：
- ✅ **安全性**: 密钥加密存储，不暴露在代码中
- ✅ **便捷性**: 命令行和API双重管理方式
- ✅ **灵活性**: 支持多种配置方式和降级策略
- ✅ **可维护性**: 统一的配置管理和监控

现在你可以安全、便捷地管理所有AI服务的API密钥了！