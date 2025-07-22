# 统一多模型 LLM SDK 使用指南

## 🎯 概述

这个统一 SDK 让你可以用一套代码调用多个 AI 模型提供商，包括：
- ✅ **SiliconFlow** (硅基流动) - 已接入
- ✅ **Google Gemini** - 已接入  
- ✅ **OpenAI** - 已接入
- 🔜 **Claude** - 预留接口

## 🚀 快速开始

### 1. 基础用法

```typescript
import { unifiedChat } from '@/lib/llm'

// 指定具体模型
const response = await unifiedChat({
  model: "gemini-1.5-flash",  // 或 "deepseek-ai/DeepSeek-V3", "gpt-4" 等
  messages: [
    { role: "user", content: "你好，请介绍一下你自己" }
  ]
})

console.log(response.content)  // AI 回复内容
console.log(response.model)    // 使用的模型名称
console.log(response.provider) // 提供商 (google/siliconflow/openai)
```

### 2. 智能模型选择 (推荐)

```typescript
import { smartChat } from '@/lib/llm'

// 根据任务类型自动选择最优模型
const response = await smartChat({
  taskType: "long_generation",  // 长内容生成
  messages: [
    { role: "user", content: "请写一篇详细的技术文档" }
  ]
})
```

### 3. 流式响应

```typescript
await unifiedChat({
  model: "deepseek-ai/DeepSeek-V3",
  messages: [{ role: "user", content: "请讲一个故事" }],
  stream: true,
  onData: (chunk) => {
    process.stdout.write(chunk)  // 实时输出
  },
  onComplete: (fullContent) => {
    console.log('\n完成！总长度:', fullContent.length)
  },
  onError: (error) => {
    console.error('错误:', error.message)
  }
})
```

## 📋 任务类型说明

| 任务类型 | 说明 | 推荐模型 | 适用场景 |
|---------|------|----------|----------|
| `fast` | 快速响应 | Gemini Flash | 简单问答、快速总结 |
| `long_generation` | 长内容生成 | Gemini 2.0 (免费) | 文章写作、详细方案 |
| `long_context` | 长上下文 | Gemini Pro | 文档分析、多轮对话 |
| `multimodal` | 多模态 | Gemini Pro | 图像理解、视觉问答 |
| `budget` | 预算优先 | Gemini 2.0 (免费) | 成本敏感场景 |
| `experimental` | 实验性 | Gemini 2.0 | 测试新功能 |
| `default` | 默认 | DeepSeek-V3 | 通用场景 |

## 🔧 高级用法

### 批量处理

```typescript
import { unifiedChatBatch } from '@/lib/llm'

const requests = [
  { model: "gemini-1.5-flash", messages: [{ role: "user", content: "什么是AI？" }] },
  { model: "deepseek-ai/DeepSeek-V3", messages: [{ role: "user", content: "什么是ML？" }] }
]

const responses = await unifiedChatBatch(requests)
responses.forEach(response => console.log(response.content))
```

### 多轮对话

```typescript
const messages = [
  { role: "system", content: "你是一个编程助手" },
  { role: "user", content: "如何学习 TypeScript？" }
]

// 第一轮
const response1 = await unifiedChat({ model: "gemini-1.5-pro", messages })
messages.push({ role: "assistant", content: response1.content })

// 第二轮
messages.push({ role: "user", content: "能推荐一些项目吗？" })
const response2 = await unifiedChat({ model: "gemini-1.5-pro", messages })
```

### 成本估算

```typescript
import { estimateRequestCost } from '@/lib/llm/utils'

const cost = estimateRequestCost(
  "gemini-1.5-flash", 
  1000,  // 输入长度
  2000   // 预期输出长度
)
console.log(`预估成本: $${cost.toFixed(4)}`)
```

## 🎛️ 配置管理

### 环境变量配置

```bash
# .env.local
SILICONFLOW_API_KEY=your_siliconflow_key
GOOGLE_API_KEY=your_google_key
OPENAI_API_KEY=your_openai_key
```

### 自定义配置

```typescript
import { globalLLMConfig } from '@/lib/llm/config'

// 更新配置
globalLLMConfig.updateConfig({
  costControl: {
    maxCostPerRequest: 0.5,  // 单次请求最大成本
    dailyBudget: 10.0        // 每日预算
  },
  retry: {
    maxAttempts: 5           // 最大重试次数
  }
})
```

## 🔄 在 API 路由中使用

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { smartChat } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const { messages, taskType = 'default' } = await request.json()
  
  try {
    const response = await smartChat({
      taskType,
      messages,
      stream: true,
      onData: (chunk) => {
        // 处理流式数据
      }
    })
    
    return new Response(JSON.stringify(response))
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500 }
    )
  }
}
```

## 💡 最佳实践

### 1. 模型选择策略

```typescript
// ✅ 推荐：使用智能选择
await smartChat({ taskType: 'long_generation', messages })

// ❌ 不推荐：硬编码模型
await unifiedChat({ model: 'specific-model', messages })
```

### 2. 错误处理

```typescript
try {
  const response = await unifiedChat({ model, messages })
  return response
} catch (error) {
  // 降级到默认模型
  console.log('降级到智能选择...')
  return await smartChat({ taskType: 'default', messages })
}
```

### 3. 流式响应优化

```typescript
let buffer = ''
await unifiedChat({
  model,
  messages,
  stream: true,
  onData: (chunk) => {
    buffer += chunk
    // 按句子输出，提升用户体验
    if (chunk.includes('。') || chunk.includes('！') || chunk.includes('？')) {
      flushToUI(buffer)
      buffer = ''
    }
  }
})
```

## 🚨 注意事项

1. **API 密钥安全**: 确保 API 密钥只在服务端使用
2. **成本控制**: 设置合理的预算限制
3. **错误处理**: 始终包含降级策略
4. **流式响应**: 注意处理网络中断
5. **模型限制**: 了解各模型的上下文窗口限制

## 📊 模型对比

| 模型 | 提供商 | 成本 | 速度 | 质量 | 上下文 | 推荐场景 |
|------|--------|------|------|------|--------|----------|
| Gemini 2.0 Flash | Google | 免费 | 快 | 高 | 100万 | 长内容生成 |
| Gemini 1.5 Flash | Google | 低 | 快 | 高 | 100万 | 快速响应 |
| Gemini 1.5 Pro | Google | 中 | 中 | 很高 | 200万 | 复杂任务 |
| DeepSeek-V3 | SiliconFlow | 低 | 快 | 高 | 6.4万 | 通用场景 |
| GPT-4 | OpenAI | 高 | 慢 | 很高 | 8千 | 高质量要求 |

## 🔗 相关文件

- `lib/llm/unifiedChat.ts` - 核心统一接口
- `lib/llm/providers/` - 各提供商实现
- `lib/llm/config.ts` - 配置管理
- `lib/llm/utils.ts` - 工具函数
- `lib/llm/examples.ts` - 使用示例
- `tests/unified-llm.test.ts` - 测试用例

## 🎉 总结

这个统一 SDK 的核心优势：

1. **一套代码，多个模型** - 无需为每个提供商写不同的代码
2. **智能选择** - 根据任务类型自动选择最优模型
3. **成本优化** - 优先使用免费/便宜的模型
4. **容错机制** - 自动降级和重试
5. **流式支持** - 统一的流式响应处理
6. **类型安全** - 完整的 TypeScript 支持

现在你可以专注于业务逻辑，而不用担心底层的模型调用细节！