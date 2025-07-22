/**
 * 统一多模型调用 SDK
 * 支持 Google Gemini、OpenAI、SiliconFlow、Claude 等多个提供商
 */

import { getModelById, getApiKey } from '@/lib/models'
import { chatGemini } from './providers/gemini'
import { chatOpenAI } from './providers/openai'
import { chatSiliconFlow } from './providers/siliconFlow'
import { globalLLMConfig } from './config'
import { withRetry, ConcurrencyLimiter } from './utils'

export interface UnifiedChatOptions {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  stream?: boolean
  temperature?: number
  maxTokens?: number
  topP?: number
  onData?: (chunk: string) => void
  onError?: (error: Error) => void
  onComplete?: (fullContent: string) => void
}

export interface UnifiedChatResponse {
  content: string
  model: string
  provider: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

/**
 * 统一聊天接口 - 核心入口函数
 */
export async function unifiedChat(options: UnifiedChatOptions): Promise<UnifiedChatResponse> {
  const { model: modelId, messages, stream = false, onData, onError, onComplete } = options

  // 获取模型配置
  const modelConfig = getModelById(modelId)
  if (!modelConfig) {
    const error = new Error(`不支持的模型: ${modelId}`)
    onError?.(error)
    throw error
  }

  // 检查API密钥
  const apiKey = getApiKey(modelConfig.provider)
  if (!apiKey) {
    const error = new Error(`${modelConfig.provider} API密钥未配置`)
    onError?.(error)
    throw error
  }

  // 合并配置参数
  const finalOptions = {
    ...options,
    temperature: options.temperature ?? modelConfig.temperature,
    maxTokens: options.maxTokens ?? modelConfig.maxTokens,
    topP: options.topP ?? modelConfig.topP,
  }

  try {
    // 根据提供商路由到对应的处理函数
    let response: UnifiedChatResponse

    switch (modelConfig.provider) {
      case 'google':
        response = await chatGemini({
          modelConfig,
          apiKey,
          ...finalOptions
        })
        break

      case 'openai':
        response = await chatOpenAI({
          modelConfig,
          apiKey,
          ...finalOptions
        })
        break

      case 'siliconflow':
        response = await chatSiliconFlow({
          modelConfig,
          apiKey,
          ...finalOptions
        })
        break

      default:
        const error = new Error(`不支持的提供商: ${modelConfig.provider}`)
        onError?.(error)
        throw error
    }

    // 调用完成回调
    onComplete?.(response.content)
    return response

  } catch (error) {
    const err = error instanceof Error ? error : new Error('未知错误')
    onError?.(err)
    throw err
  }
}

/**
 * 流式聊天接口
 */
export async function unifiedChatStream(options: UnifiedChatOptions): Promise<ReadableStream> {
  return new Promise((resolve, reject) => {
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await unifiedChat({
            ...options,
            stream: true,
            onData: (chunk) => {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              options.onData?.(chunk)
            },
            onComplete: (fullContent) => {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
              controller.close()
              options.onComplete?.(fullContent)
            },
            onError: (error) => {
              controller.error(error)
              options.onError?.(error)
            }
          })
        } catch (error) {
          controller.error(error)
          reject(error)
        }
      }
    })
    resolve(stream)
  })
}

/**
 * 批量聊天接口 - 支持多个请求并发处理
 */
export async function unifiedChatBatch(requests: UnifiedChatOptions[]): Promise<UnifiedChatResponse[]> {
  const promises = requests.map(request => unifiedChat(request))
  return Promise.all(promises)
}

/**
 * 智能模型选择 - 根据任务类型自动选择最优模型
 */
export async function smartChat(options: Omit<UnifiedChatOptions, 'model'> & {
  taskType?: 'fast' | 'long_context' | 'multimodal' | 'budget' | 'experimental' | 'long_generation' | 'default'
}): Promise<UnifiedChatResponse> {
  const { taskType = 'default', ...restOptions } = options
  
  // 动态导入以避免循环依赖
  const { selectOptimalModel } = await import('@/lib/models')
  const optimalModel = selectOptimalModel(taskType)
  
  return unifiedChat({
    ...restOptions,
    model: optimalModel.id
  })
}