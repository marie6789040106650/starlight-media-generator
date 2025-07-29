/**
 * 统一聊天 API 路由 - 使用新的统一 SDK
 * 这是一个示例，展示如何使用统一的多模型调用接口
 */

import { NextRequest } from 'next/server'
import { unifiedChat, smartChat, unifiedChatStream } from '@/lib/llm'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9)
  const startTime = Date.now()

  try {
    console.log(`[${new Date().toISOString()}] [${requestId}] 收到统一聊天请求`)

    const {
      model,
      messages,
      stream = false,
      taskType,
      temperature,
      maxTokens,
      topP
    } = await request.json()

    console.log(`[${new Date().toISOString()}] [${requestId}] 请求参数:`, {
      model,
      taskType,
      messagesCount: messages?.length,
      stream,
      clientIP: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    })

    // 参数验证
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: '消息列表不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 如果指定了 taskType 但没有指定 model，使用智能选择
    if (taskType && !model) {
      console.log(`[${new Date().toISOString()}] [${requestId}] 使用智能模型选择: ${taskType}`)

      if (stream) {
        // 流式响应
        const streamResponse = await unifiedChatStream({
          taskType,
          messages,
          stream: true,
          temperature,
          maxTokens,
          topP,
          onData: (chunk) => {
            console.log(`[${new Date().toISOString()}] [${requestId}] 流式数据块:`, chunk.substring(0, 50))
          },
          onError: (error) => {
            console.error(`[${new Date().toISOString()}] [${requestId}] 流式错误:`, error.message)
          }
        })

        return new Response(streamResponse, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          }
        })
      } else {
        // 非流式响应
        const response = await smartChat({
          taskType,
          messages,
          temperature,
          maxTokens,
          topP
        })

        const duration = Date.now() - startTime
        console.log(`[${new Date().toISOString()}] [${requestId}] 智能聊天完成`, {
          duration: `${duration}ms`,
          model: response.model,
          provider: response.provider,
          contentLength: response.content.length
        })

        return new Response(
          JSON.stringify({
            ...response,
            requestId,
            duration
          }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // 使用指定模型
    if (!model) {
      return new Response(
        JSON.stringify({ error: '必须指定 model 或 taskType' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[${new Date().toISOString()}] [${requestId}] 使用指定模型: ${model}`)

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder()
      let fullContent = ''

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            await unifiedChat({
              model,
              messages,
              stream: true,
              temperature,
              maxTokens,
              topP,
              onData: (chunk) => {
                fullContent += chunk
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
              },
              onComplete: (content) => {
                const duration = Date.now() - startTime
                console.log(`[${new Date().toISOString()}] [${requestId}] 流式响应完成`, {
                  duration: `${duration}ms`,
                  contentLength: content.length
                })
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                controller.close()
              },
              onError: (error) => {
                console.error(`[${new Date().toISOString()}] [${requestId}] 流式错误:`, error.message)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
                controller.close()
              }
            })
          } catch (error) {
            console.error(`[${new Date().toISOString()}] [${requestId}] 流式处理异常:`, error)
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
      const response = await unifiedChat({
        model,
        messages,
        temperature,
        maxTokens,
        topP
      })

      const duration = Date.now() - startTime
      console.log(`[${new Date().toISOString()}] [${requestId}] 统一聊天完成`, {
        duration: `${duration}ms`,
        model: response.model,
        provider: response.provider,
        contentLength: response.content.length
      })

      return new Response(
        JSON.stringify({
          ...response,
          requestId,
          duration
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${new Date().toISOString()}] [${requestId}] 统一聊天错误:`, {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
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