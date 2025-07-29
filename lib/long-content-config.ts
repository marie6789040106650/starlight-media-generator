// 长内容生成专用配置

import { AIModel, selectOptimalModel, getApiKey } from './models'

export interface LongContentConfig {
  model: AIModel
  maxTokens: number
  temperature: number
  topP: number
  streamChunkSize: number
  timeoutMs: number
}

/**
 * 获取长内容生成的最佳配置
 */
export function getLongContentConfig(): LongContentConfig {
  const model = selectOptimalModel('long_generation')
  
  // 根据不同模型优化参数
  let config: LongContentConfig = {
    model,
    maxTokens: 8000,
    temperature: 0.7,
    topP: 0.9,
    streamChunkSize: 1024,
    timeoutMs: 60000
  }
  
  // 针对不同模型的优化配置
  switch (model.provider) {
    case 'google':
      // Gemini系列 - 最适合长内容生成
      if (model.id.includes('gemini-1.5-pro')) {
        config.maxTokens = 16000 // Gemini Pro支持更长输出
        config.temperature = 0.7
        config.topP = 0.9
        config.timeoutMs = 90000 // 更长超时时间
      } else if (model.id.includes('gemini-2.0-flash-exp')) {
        config.maxTokens = 12000 // Gemini 2.0支持长内容，且免费!
        config.temperature = 0.7
        config.topP = 0.9
        config.timeoutMs = 75000
      } else if (model.id.includes('gemini-1.5-flash')) {
        config.maxTokens = 8000
        config.temperature = 0.8
        config.topP = 0.9
        config.timeoutMs = 60000
      }
      break
      
    case 'siliconflow':
      // SiliconFlow系列
      if (model.id.includes('Kimi')) {
        config.maxTokens = 12000 // Kimi支持较长输出
        config.temperature = 0.6
        config.topP = 0.9
        config.timeoutMs = 75000
      } else if (model.id.includes('DeepSeek')) {
        config.maxTokens = 8000
        config.temperature = 0.7
        config.topP = 0.9
        config.timeoutMs = 60000
      }
      break
      
    case 'openai':
      // OpenAI系列
      config.maxTokens = 4000 // GPT限制较小
      config.temperature = 0.7
      config.topP = 0.9
      config.timeoutMs = 60000
      break
      
    default:
      // 默认配置
      break
  }
  
  return config
}

/**
 * 验证长内容生成能力
 */
export function validateLongContentCapability(): {
  isSupported: boolean
  recommendedModel: string
  maxOutputTokens: number
  estimatedCost: number
} {
  const config = getLongContentConfig()
  const model = config.model
  
  // 计算预估成本 (基于8000 tokens输出)
  const estimatedCost = model.pricing ? 
    (1000 / 1000) * model.pricing.input + (8000 / 1000) * model.pricing.output : 0
  
  return {
    isSupported: config.maxTokens >= 6000, // 至少支持6K tokens输出
    recommendedModel: model.name,
    maxOutputTokens: config.maxTokens,
    estimatedCost: Math.round(estimatedCost * 100) / 100 // 保留2位小数
  }
}

/**
 * 获取长内容生成的提示词优化建议
 */
export function getPromptOptimizationTips(): string[] {
  const config = getLongContentConfig()
  const model = config.model
  
  const tips: string[] = [
    '使用结构化的提示词，明确输出格式要求',
    '分段描述需求，避免单一长段落',
    '使用JSON格式约束输出结构'
  ]
  
  // 根据模型特点添加特定建议
  switch (model.provider) {
    case 'google':
      tips.push('Gemini对中英文混合内容处理良好，可以使用中英文混合提示')
      tips.push('利用Gemini的多模态能力，可以结合图片描述')
      break
      
    case 'siliconflow':
      if (model.id.includes('DeepSeek')) {
        tips.push('DeepSeek对中文理解优秀，建议使用中文提示词')
        tips.push('可以要求模型进行逐步推理，提高输出质量')
      }
      if (model.id.includes('Kimi')) {
        tips.push('Kimi支持超长上下文，可以提供更多背景信息')
      }
      break
  }
  
  return tips
}

/**
 * 长内容生成监控指标
 */
export interface LongContentMetrics {
  totalRequests: number
  successfulRequests: number
  averageOutputLength: number
  averageResponseTime: number
  totalCost: number
  modelUsageStats: Record<string, number>
}

let metrics: LongContentMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  averageOutputLength: 0,
  averageResponseTime: 0,
  totalCost: 0,
  modelUsageStats: {}
}

/**
 * 记录长内容生成指标
 */
export function recordLongContentMetrics(
  modelId: string,
  outputLength: number,
  responseTime: number,
  cost: number,
  success: boolean
): void {
  metrics.totalRequests++
  
  if (success) {
    metrics.successfulRequests++
    
    // 更新平均输出长度
    const totalLength = metrics.averageOutputLength * (metrics.successfulRequests - 1) + outputLength
    metrics.averageOutputLength = Math.round(totalLength / metrics.successfulRequests)
    
    // 更新平均响应时间
    const totalTime = metrics.averageResponseTime * (metrics.successfulRequests - 1) + responseTime
    metrics.averageResponseTime = Math.round(totalTime / metrics.successfulRequests)
    
    // 更新总成本
    metrics.totalCost += cost
  }
  
  // 更新模型使用统计
  metrics.modelUsageStats[modelId] = (metrics.modelUsageStats[modelId] || 0) + 1
}

/**
 * 获取长内容生成统计
 */
export function getLongContentMetrics(): LongContentMetrics {
  return { ...metrics }
}

/**
 * 重置统计数据
 */
export function resetLongContentMetrics(): void {
  metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    averageOutputLength: 0,
    averageResponseTime: 0,
    totalCost: 0,
    modelUsageStats: {}
  }
}