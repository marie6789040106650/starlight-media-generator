/**
 * LLM 相关工具函数
 */

import { getModelById, selectOptimalModel } from '@/lib/models'
import type { UnifiedChatOptions } from './unifiedChat'

/**
 * 根据内容长度智能选择模型
 */
export function selectModelByContentLength(contentLength: number): string {
  if (contentLength > 50000) {
    // 超长内容，使用长上下文模型
    return selectOptimalModel('long_context').id
  } else if (contentLength > 10000) {
    // 长内容生成
    return selectOptimalModel('long_generation').id
  } else {
    // 普通内容，使用快速模型
    return selectOptimalModel('fast').id
  }
}

/**
 * 根据任务类型推荐模型
 */
export function recommendModelForTask(taskDescription: string): string {
  const lowerDesc = taskDescription.toLowerCase()
  
  if (lowerDesc.includes('图片') || lowerDesc.includes('图像') || lowerDesc.includes('视觉')) {
    return selectOptimalModel('multimodal').id
  } else if (lowerDesc.includes('长文') || lowerDesc.includes('详细') || lowerDesc.includes('完整')) {
    return selectOptimalModel('long_generation').id
  } else if (lowerDesc.includes('快速') || lowerDesc.includes('简单') || lowerDesc.includes('概要')) {
    return selectOptimalModel('fast').id
  } else if (lowerDesc.includes('分析') || lowerDesc.includes('深入') || lowerDesc.includes('复杂')) {
    return selectOptimalModel('long_context').id
  } else if (lowerDesc.includes('实验') || lowerDesc.includes('测试') || lowerDesc.includes('尝试')) {
    return selectOptimalModel('experimental').id
  } else if (lowerDesc.includes('预算') || lowerDesc.includes('便宜') || lowerDesc.includes('免费')) {
    return selectOptimalModel('budget').id
  } else {
    return selectOptimalModel('default').id
  }
}

/**
 * 估算请求成本
 */
export function estimateRequestCost(modelId: string, inputLength: number, expectedOutputLength: number): number {
  const model = getModelById(modelId)
  if (!model?.pricing) return 0
  
  // 粗略估算 token 数量 (1 token ≈ 4 字符)
  const inputTokens = Math.ceil(inputLength / 4)
  const outputTokens = Math.ceil(expectedOutputLength / 4)
  
  return (inputTokens / 1000) * model.pricing.input + (outputTokens / 1000) * model.pricing.output
}

/**
 * 格式化消息为统一格式
 */
export function formatMessages(messages: Array<{ role: string; content: string }>): UnifiedChatOptions['messages'] {
  return messages.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content
  }))
}

/**
 * 创建系统提示词
 */
export function createSystemPrompt(role: string, context?: string): string {
  let prompt = `你是一名${role}。`
  
  if (context) {
    prompt += `\n\n背景信息：${context}`
  }
  
  prompt += '\n\n请根据用户的问题提供专业、准确、有用的回答。'
  
  return prompt
}

/**
 * 分割长文本为多个消息
 */
export function splitLongContent(content: string, maxLength: number = 4000): string[] {
  if (content.length <= maxLength) {
    return [content]
  }
  
  const chunks: string[] = []
  let currentChunk = ''
  const sentences = content.split(/[。！？.!?]\s*/)
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        // 单个句子太长，强制分割
        chunks.push(sentence.substring(0, maxLength))
        currentChunk = sentence.substring(maxLength)
      }
    } else {
      currentChunk += sentence + '。'
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

/**
 * 重试机制包装器
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误')
      
      if (i === maxRetries) {
        throw lastError
      }
      
      // 指数退避延迟
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}

/**
 * 并发限制器
 */
export class ConcurrencyLimiter {
  private running = 0
  private queue: Array<() => void> = []
  
  constructor(private limit: number) {}
  
  async run<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        this.running++
        try {
          const result = await fn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          if (this.queue.length > 0) {
            const next = this.queue.shift()!
            next()
          }
        }
      }
      
      if (this.running < this.limit) {
        execute()
      } else {
        this.queue.push(execute)
      }
    })
  }
}

/**
 * 流式响应处理器
 */
export class StreamProcessor {
  private buffer = ''
  private onChunk?: (chunk: string) => void
  private onComplete?: (fullContent: string) => void
  private fullContent = ''
  
  constructor(options: {
    onChunk?: (chunk: string) => void
    onComplete?: (fullContent: string) => void
  }) {
    this.onChunk = options.onChunk
    this.onComplete = options.onComplete
  }
  
  processChunk(chunk: string) {
    this.fullContent += chunk
    this.onChunk?.(chunk)
  }
  
  complete() {
    this.onComplete?.(this.fullContent)
  }
  
  getFullContent(): string {
    return this.fullContent
  }
}