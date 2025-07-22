/**
 * 生成方案 API v2 - 使用统一多模型 SDK
 * 大幅简化代码，自动处理多提供商兼容性
 */

import { NextRequest } from 'next/server'
import { unifiedChat, smartChat } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到生成方案请求 v2`)
    
    const { 
      prompt, 
      formData, 
      modelId, 
      stream: requestedStream = true,
      taskType = 'long_generation' // 默认使用长内容生成优化
    } = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      promptLength: prompt?.length,
      modelId,
      taskType,
      stream: requestedStream,
      storeInfo: formData?.storeName
    })

    // 构建消息
    const messages = [
      {
        role: 'system' as const,
        content: '你是一名资深抖音IP打造专家，擅长为商家制定专业的老板IP打造方案。'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ]

    // 流式响应处理
    if (requestedStream) {
      const encoder = new TextEncoder()
      let fullContent = ''

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            // 使用统一SDK - 智能选择或指定模型
            const chatFunction = modelId ? unifiedChat : smartChat
            const options = modelId 
              ? { model: modelId, messages, stream: true }
              : { taskType, messages, stream: true }

            await chatFunction({
              ...options,
              onData: (chunk: string) => {
                fullContent += chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              },
              onComplete: (content: string) => {
                const duration = Date.now() - startTime
                console.log(`[${new Date().toISOString()}] [${requestId}] 生成完成`, {
                  duration: `${duration}ms`,
                  contentLength: content.length
                })
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              },
              onError: (error: Error) => {
                console.error(`[${new Date().toISOString()}] [${requestId}] 生成错误:`, error.message)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
                controller.close()
              }
            })
          } catch (error) {
            console.error(`[${new Date().toISOString()}] [${requestId}] 处理异常:`, error)
            controller.error(error)
          }
        }
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
        }
      })
    } else {
      // 非流式响应
      const chatFunction = modelId ? unifiedChat : smartChat
      const options = modelId 
        ? { model: modelId, messages }
        : { taskType, messages }

      const response = await chatFunction(options)

      const duration = Date.now() - startTime
      console.log(`[${new Date().toISOString()}] [${requestId}] 生成完成`, {
        duration: `${duration}ms`,
        model: response.model,
        provider: response.provider,
        contentLength: response.content.length
      })

      return new Response(
        JSON.stringify({
          content: response.content,
          model: response.model,
          provider: response.provider,
          modelId: response.model,
          requestId,
          duration
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 生成方案错误:`, {
      error: error instanceof Error ? error.message : '未知错误',
      duration: `${duration}ms`
    })

    return new Response(
      JSON.stringify({
        error: '服务器内部错误',
        details: error instanceof Error ? error.message : '未知错误',
        requestId
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}