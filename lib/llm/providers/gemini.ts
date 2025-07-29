/**
 * Google Gemini 提供商封装
 */

import type { AIModel } from '@/lib/models'
import type { UnifiedChatResponse, UnifiedChatOptions } from '../unifiedChat'

interface GeminiChatOptions extends UnifiedChatOptions {
  modelConfig: AIModel
  apiKey: string
}

/**
 * Google Gemini 聊天接口
 */
export async function chatGemini(options: GeminiChatOptions): Promise<UnifiedChatResponse> {
  const { modelConfig, apiKey, messages, stream, temperature, maxTokens, topP, onData } = options

  // 转换消息格式为 Gemini 格式
  // Gemini 不支持 system role，需要特殊处理
  const systemMessages = messages.filter(msg => msg.role === 'system')
  const nonSystemMessages = messages.filter(msg => msg.role !== 'system')

  // 将 system 消息合并到第一个 user 消息中
  const geminiMessages = nonSystemMessages.map((msg, index) => {
    let content = msg.content

    // 如果是第一个 user 消息，且有 system 消息，则合并
    if (index === 0 && msg.role === 'user' && systemMessages.length > 0) {
      const systemContent = systemMessages.map(s => s.content).join('\n')
      content = `${systemContent}\n\n${msg.content}`
    }

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: content }]
    }
  })

  // 构建请求体
  const requestBody = {
    contents: geminiMessages,
    generationConfig: {
      temperature: temperature ?? modelConfig.temperature,
      maxOutputTokens: maxTokens ?? modelConfig.maxTokens,
      topP: topP ?? modelConfig.topP,
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-goog-api-key': apiKey
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
      throw new Error(`Gemini API 错误: ${response.status} ${response.statusText} - ${errorText}`)
    }

    if (stream && onData) {
      // 流式处理 (Gemini 目前不支持真正的流式，这里模拟)
      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      // 模拟流式输出
      const chunks = content.split(' ')
      let currentContent = ''

      for (const chunk of chunks) {
        currentContent += chunk + ' '
        onData(chunk + ' ')
        // 添加小延迟模拟流式效果
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      return {
        content: content,
        model: modelConfig.name,
        provider: 'google',
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      }
    } else {
      // 非流式处理
      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

      return {
        content,
        model: modelConfig.name,
        provider: 'google',
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      }
    }
  } catch (error) {
    throw new Error(`Gemini 调用失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * Gemini 流式聊天接口 (真正的流式，当 Gemini 支持时)
 */
export async function chatGeminiStream(options: GeminiChatOptions): Promise<ReadableStream> {
  // 目前 Gemini 不支持真正的流式，返回模拟的流
  return new ReadableStream({
    async start(controller) {
      try {
        const response = await chatGemini(options)
        const chunks = response.content.split(' ')

        for (const chunk of chunks) {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk + ' ' })}\n\n`))
          await new Promise(resolve => setTimeout(resolve, 50))
        }

        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
}