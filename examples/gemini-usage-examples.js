// Gemini API 使用示例

import { selectOptimalModel, getAvailableModels, FALLBACK_MODELS } from '@/lib/models'

// 1. 智能模型选择示例
console.log('=== 智能模型选择示例 ===')

// 快速响应场景 (推荐: Gemini Flash)
const fastModel = selectOptimalModel('fast')
console.log('快速响应模型:', fastModel.name, '- 价格:', fastModel.pricing?.input, '/1K tokens')

// 长文档处理 (推荐: Gemini Pro)
const longContextModel = selectOptimalModel('long_context')
console.log('长上下文模型:', longContextModel.name, '- 上下文:', longContextModel.contextWindow, 'tokens')

// 预算优先 (推荐: Gemini 2.0 免费版)
const budgetModel = selectOptimalModel('budget')
console.log('预算模型:', budgetModel.name, '- 价格:', budgetModel.pricing?.input || '免费')

// 2. 具体API调用示例
console.log('\n=== API调用示例 ===')

// 使用Gemini Flash进行快速对话
const quickChatExample = {
  model: 'gemini-1.5-flash',
  messages: [
    { role: 'user', content: '请帮我生成5个餐饮店的关键词' }
  ],
  temperature: 0.7,
  max_tokens: 1000
}

// 使用Gemini Pro进行长文档分析
const longDocExample = {
  model: 'gemini-1.5-pro',
  messages: [
    { role: 'user', content: '请分析这份长达10000字的商业计划书...' }
  ],
  temperature: 0.3,
  max_tokens: 4000
}

// 使用免费的Gemini 2.0进行实验
const experimentalExample = {
  model: 'gemini-2.0-flash-exp',
  messages: [
    { role: 'user', content: '测试最新的AI能力' }
  ],
  temperature: 0.8,
  max_tokens: 2000
}

// 3. 成本对比示例
console.log('\n=== 成本对比 ===')

const costComparison = [
  { name: 'Gemini 2.0 Flash (实验版)', cost: 0, note: '完全免费' },
  { name: 'Gemini 1.5 Flash', cost: 0.075, note: '最便宜的付费版' },
  { name: 'DeepSeek-V3', cost: 0.14, note: 'SiliconFlow主力' },
  { name: 'Gemini 1.5 Pro', cost: 1.25, note: '多模态+长上下文' },
  { name: 'GPT-3.5 Turbo', cost: 1.5, note: '需要OpenAI密钥' },
  { name: 'GPT-4', cost: 30, note: '最贵但效果最好' }
]

costComparison.forEach(model => {
  console.log(`${model.name}: ¥${model.cost}/1K tokens - ${model.note}`)
})

// 4. 实际项目中的使用建议
console.log('\n=== 项目使用建议 ===')

const projectUsage = {
  // 模块1: 关键词生成 - 使用DeepSeek-V3 (中文优化好)
  module1: {
    model: 'deepseek-ai/DeepSeek-V3',
    reason: '中文优化好，成本低，推理能力强'
  },
  
  // 模块2: 方案生成 - 使用Gemini Flash (流式响应快)
  module2: {
    model: 'gemini-1.5-flash',
    reason: '流式响应快，成本低，质量好'
  },
  
  // 长文档处理 - 使用Gemini Pro (超长上下文)
  longDoc: {
    model: 'gemini-1.5-pro',
    reason: '200万tokens上下文，文档分析能力强'
  },
  
  // 实验功能 - 使用Gemini 2.0 (免费)
  experimental: {
    model: 'gemini-2.0-flash-exp',
    reason: '免费使用，测试最新功能'
  }
}

Object.entries(projectUsage).forEach(([scenario, config]) => {
  console.log(`${scenario}: ${config.model} - ${config.reason}`)
})

// 5. 错误处理和降级策略
console.log('\n=== 降级策略 ===')

function getModelWithFallback(preferredModel, taskType) {
  const availableModels = getAvailableModels()
  
  // 检查首选模型是否可用
  const preferred = availableModels.find(m => m.id === preferredModel)
  if (preferred) {
    return preferred
  }
  
  // 使用智能选择作为降级
  return selectOptimalModel(taskType)
}

// 示例：优先使用GPT-4，不可用时自动降级
const modelWithFallback = getModelWithFallback('gpt-4', 'default')
console.log('降级后的模型:', modelWithFallback.name)

// 6. 监控和统计
console.log('\n=== 可用模型统计 ===')

const availableModels = getAvailableModels()
console.log('当前可用模型数量:', availableModels.length)

const byProvider = availableModels.reduce((acc, model) => {
  acc[model.provider] = (acc[model.provider] || 0) + 1
  return acc
}, {})

console.log('按提供商分布:', byProvider)

export {
  quickChatExample,
  longDocExample,
  experimentalExample,
  costComparison,
  projectUsage,
  getModelWithFallback
}