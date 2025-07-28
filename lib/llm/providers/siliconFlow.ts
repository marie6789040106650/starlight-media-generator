/**
 * SiliconFlow 提供商封装 (OpenAI 兼容接口)
 */

import type { AIModel } from '@/lib/models'
import type { UnifiedChatResponse, UnifiedChatOptions } from '../unifiedChat'

interface SiliconFlowChatOptions extends UnifiedChatOptions {
  modelConfig: AIModel
  apiKey: string
}

/**
 * SiliconFlow 聊天接口 (使用 OpenAI 兼容格式)
 */
export async function chatSiliconFlow(options: SiliconFlowChatOptions): Promise<UnifiedChatResponse> {
  const { modelConfig, apiKey, messages, stream, temperature, maxTokens, topP, onData } = options

  // 构建请求体 (OpenAI 兼容格式)
  const requestBody = {
    model: modelConfig.id,
    messages: messages,
    max_tokens: maxTokens ?? modelConfig.maxTokens,
    temperature: temperature ?? modelConfig.temperature,
    top_p: topP ?? modelConfig.topP,
    stream: stream || false
  }

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }

  try {
    // 发送请求
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // 检查是否是余额不足或模型不可用错误
      if (response.status === 403 && errorText.includes('paid balance')) {
        throw new Error(`模型 ${modelConfig.name} 需要付费余额，请使用其他免费模型`)
      }
      
      if (response.status === 400 && errorText.includes('max_tokens')) {
        throw new Error(`模型 ${modelConfig.name} 的max_tokens参数超出限制，请减少输出长度`)
      }
      
      throw new Error(`SiliconFlow API 错误: ${response.status} ${response.statusText} - ${errorText}`)
    }

    if (stream && onData) {
      // 流式处理
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim()
            
            if (dataStr === '[DONE]') {
              break
            }

            if (dataStr) {
              try {
                const data = JSON.parse(dataStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  fullContent += content
                  onData(content)
                }
              } catch (parseError) {
                // 忽略解析错误
              }
            }
          }
        }
      }

      return {
        content: fullContent,
        model: modelConfig.name,
        provider: 'siliconflow'
      }
    } else {
      // 非流式处理
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      return {
        content,
        model: modelConfig.name,
        provider: 'siliconflow',
        usage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      }
    }
  } catch (error) {
    throw new Error(`SiliconFlow 调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * SiliconFlow 流式聊天接口
 */
export async function chatSiliconFlowStream(options: SiliconFlowChatOptions): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      try {
        await chatSiliconFlow({
          ...options,
          stream: true,
          onData: (chunk) => {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
        })
        
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}