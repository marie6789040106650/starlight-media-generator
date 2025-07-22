# 🚀 统一多模型 LLM SDK - 快速开始

## ✅ 部署检查清单

### 1. 环境配置
```bash
# .env.local 文件配置
SILICONFLOW_API_KEY=your_siliconflow_key    # 必需
GOOGLE_API_KEY=your_google_key              # 推荐
OPENAI_API_KEY=your_openai_key              # 可选
```

### 2. 文件检查
确保以下文件存在：
- [x] `lib/llm/index.ts` - 统一导出
- [x] `lib/llm/unifiedChat.ts` - 核心调度器
- [x] `lib/llm/providers/gemini.ts` - Gemini 支持
- [x] `lib/llm/providers/openai.ts` - OpenAI 支持
- [x] `lib/llm/providers/siliconFlow.ts` - SiliconFlow 支持
- [x] `lib/llm/config.ts` - 配置管理
- [x] `lib/llm/utils.ts` - 工具函数

### 3. 快速测试
```bash
# 运行测试脚本
node test-llm-sdk.js

# 或运行单项测试
node test-llm-sdk.js basic
node test-llm-sdk.js smart
```

## 🎯 立即使用

### 方式1: 智能选择 (推荐)
```typescript
import { smartChat } from '@/lib/llm'

// 长内容生成 - 自动选择 Gemini 2.0 (免费)
const response = await smartChat({
  taskType: 'long_generation',
  messages: [
    { role: 'user', content: '请写一份详细的项目方案' }
  ]
})

console.log(response.content)
```

### 方式2: 指定模型
```typescript
import { unifiedChat } from '@/lib/llm'

// 使用具体模型
const response = await unifiedChat({
  model: 'gemini-1.5-flash',
  messages: [
    { role: 'user', content: '你好，请介绍一下你自己' }
  ]
})
```

### 方式3: 流式响应
```typescript
await unifiedChat({
  model: 'deepseek-ai/DeepSeek-V3',
  messages: [{ role: 'user', content: '讲个故事' }],
  stream: true,
  onData: (chunk) => {
    process.stdout.write(chunk) // 实时输出
  },
  onComplete: (content) => {
    console.log('\n完成！')
  }
})
```

## 🔄 升级现有 API

### 升级前 (复杂)
```typescript
// 需要手动处理不同提供商
if (provider === 'google') {
  // Google 特定逻辑
} else if (provider === 'siliconflow') {
  // SiliconFlow 特定逻辑
}
```

### 升级后 (简单)
```typescript
import { smartChat } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const { messages, taskType = 'default' } = await request.json()
  
  const response = await smartChat({
    taskType,
    messages,
    stream: true,
    onData: (chunk) => {
      // 处理流式数据
    }
  })
  
  return new Response(JSON.stringify(response))
}
```

## 💡 最佳实践

### 1. 任务类型选择
```typescript
// ✅ 推荐：根据场景选择
const taskTypes = {
  '快速问答': 'fast',
  '长文章写作': 'long_generation', 
  '文档分析': 'long_context',
  '图像理解': 'multimodal',
  '预算有限': 'budget',
  '测试功能': 'experimental'
}

await smartChat({ taskType: taskTypes['长文章写作'], messages })
```

### 2. 错误处理
```typescript
try {
  return await unifiedChat({ model: 'specific-model', messages })
} catch (error) {
  // 降级到智能选择
  console.log('降级到智能选择...')
  return await smartChat({ taskType: 'default', messages })
}
```

### 3. 成本控制
```typescript
import { estimateRequestCost } from '@/lib/llm/utils'

// 估算成本
const cost = estimateRequestCost('gemini-1.5-flash', 1000, 2000)
if (cost > 0.1) {
  // 使用更便宜的模型
  return await smartChat({ taskType: 'budget', messages })
}
```

## 🎛️ 推荐模型配置

### 日常使用
```typescript
const dailyConfig = {
  快速问答: 'gemini-1.5-flash',      // 快速 + 便宜
  长内容生成: 'gemini-2.0-flash-exp', // 免费 + 长输出
  文档分析: 'gemini-1.5-pro',        // 长上下文
  代码生成: 'deepseek-ai/DeepSeek-V3' // 代码能力强
}
```

### 成本优化
```typescript
const budgetConfig = {
  首选: 'gemini-2.0-flash-exp',  // 完全免费
  备选: 'gemini-1.5-flash',      // 最便宜
  最后: 'deepseek-ai/DeepSeek-V3' // 性价比高
}
```

## 🔧 故障排除

### 问题1: API 密钥错误
```bash
# 检查环境变量
echo $SILICONFLOW_API_KEY
echo $GOOGLE_API_KEY

# 重新加载环境变量
source .env.local
```

### 问题2: 模型不支持
```typescript
// 检查可用模型
import { getAvailableModels } from '@/lib/models'
console.log(getAvailableModels())

// 使用智能选择作为备选
await smartChat({ taskType: 'default', messages })
```

### 问题3: 网络超时
```typescript
// 增加超时时间
import { globalLLMConfig } from '@/lib/llm/config'

globalLLMConfig.updateConfig({
  timeout: {
    default: 60000  // 60秒
  }
})
```

## 📊 性能监控

### 基础监控
```typescript
const startTime = Date.now()
const response = await smartChat({ taskType, messages })
const duration = Date.now() - startTime

console.log(`请求耗时: ${duration}ms`)
console.log(`使用模型: ${response.model}`)
console.log(`内容长度: ${response.content.length}`)
```

### 成本追踪
```typescript
import { estimateRequestCost } from '@/lib/llm/utils'

let dailyCost = 0
const cost = estimateRequestCost(modelId, inputLength, outputLength)
dailyCost += cost

console.log(`本次成本: $${cost.toFixed(4)}`)
console.log(`今日总成本: $${dailyCost.toFixed(4)}`)
```

## 🎉 完成！

现在你已经拥有了一个完整的统一多模型调用系统：

1. ✅ **一套代码** - 调用所有模型
2. ✅ **智能选择** - 自动选择最优模型  
3. ✅ **成本优化** - 优先使用免费/便宜模型
4. ✅ **错误处理** - 自动降级和重试
5. ✅ **流式支持** - 统一的流式响应
6. ✅ **类型安全** - 完整的 TypeScript 支持

### 下一步
- 在你的业务代码中使用 `smartChat()` 
- 根据实际使用情况调整模型偏好
- 监控成本和性能表现
- 根据需要扩展更多模型支持

🚀 开始享受统一多模型调用的便利吧！