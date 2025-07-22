/**
 * Claude (Anthropic) 提供商封装
 * 为未来扩展预留
 */

import type { AIModel } from '@/lib/models'
import type { UnifiedChatResponse, UnifiedChatOptions } from '../unifiedChat'

interface ClaudeChatOptions extends UnifiedChatOptions {
  modelConfig: AIModel
  apiKey: string
}

/**
 * Claude 聊天接口 (预留接口)
 */
export async function chatClaude(options: ClaudeChatOptions): Promise<UnifiedChatResponse> {
  const { modelConfig, apiKey, messages, stream, temperature, maxTokens, topP, onData } = options

  // 转换消息格式为 Claude 格式
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const userMessages = messages.filter(m => m.role !== 'system')

  // 构建请求体 (Claude 格式)
  const requestBody = {
    model: modelConfig.id,
    max_tokens: maxTokens ?? modelConfig.maxTokens,
    temperature: temperature ?? modelConfig.temperature,
    top_p: topP ?? modelConfig.topP,
    system: systemMessage,
    messages: userMessages,
    stream: stream || false
  }

  const headers = {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01'
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
      throw new Error(`Claude API 错误: ${response.status} ${response.statusText} - ${errorText}`)
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
                const content = data.delta?.text
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
        provider: 'anthropic'
      }
    } else {
      // 非流式处理
      const data = await response.json()
      const content = data.content?.[0]?.text || ''

      return {
        content,
        model: modelConfig.name,
        provider: 'anthropic',
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      }
    }
  } catch (error) {
    throw new Error(`Claude 调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * Claude 流式聊天接口
 */
export async function chatClaudeStream(options: ClaudeChatOptions): Promise<ReadableStream> {
  return new ReadableStream({
    async start(controller) {
      try {
        await chatClaude({
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